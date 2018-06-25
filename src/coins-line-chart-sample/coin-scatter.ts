import * as d3 from "d3";
import {CoinRow} from "../service/csv-service";
import {DataService} from "../service/data-service";

export interface CoinRowContainer {
    x: Date,
    y: number,
    xJitter: number,
    yJitter: number,
    coinrow: CoinRow
}

export class CoinScatter {

    private static MARGIN = 60;
    private static WIDTH = 1370 - 2 * CoinScatter.MARGIN;
    private static HEIGHT = 800 - 2 * CoinScatter.MARGIN;
    public static DOT_WIDTH = 5;

    private container;
    private xScale;
    private yScale;
    private xAxis;
    private yAxis;
    private zoom;

    private lastZoomK = 1;

    constructor(private selector: string, private data: CoinRow[] = []) {

        this.update = this.update.bind(this);
        this.updateDomains = this.updateDomains.bind(this);
        this.onZoom = this.onZoom.bind(this);
        this.highlight = this.highlight.bind(this);

        DataService.data$.subscribe(data => this.update(data));
        DataService.hovered$.subscribe(data => this.highlight(data));

        this.container = this.initContainer(selector);
        this.xScale = this.initScaleX();
        this.yScale = this.initScaleY();
        this.xAxis = this.initAxisX();
        this.yAxis = this.initAxisY();

        this.initAxisLabels();
        this.initReferenceLine();

        this.updateDomains([]);
        this.update([]);

    }

    private initReferenceLine() {
        this.container.append('line')
            .style('stroke', '#900')
            .style('stroke-width', '1px')
            .attr("class", "ref-line")
            .attr('x1', 0)
            .attr('y1', this.yScale(1))
            .attr('x2', CoinScatter.WIDTH)
            .attr('y2', this.yScale(1));

    }

    private initAxisLabels() {
        this.container.append("text")
            .attr("x", CoinScatter.WIDTH / 2)
            .attr("y", CoinScatter.HEIGHT + 20)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Jahr");

        this.container.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - CoinScatter.MARGIN)
            .attr("x", 0 - (CoinScatter.HEIGHT / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Kaufkraft in Euro pro Mark");
    }

    private initAxisY() {
        return this.container.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(this.yScale));
    }

    private initAxisX() {
        return this.container.append("g")
            .attr("transform", "translate(0," + CoinScatter.HEIGHT + ")")
            .attr("class", "x-axis")
            .call(d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%y")));
    }

    private initScaleY() {
        return d3
            .scaleLog()
            .base(10)
            .range([CoinScatter.HEIGHT, 0]);
    }

    private initScaleX() {
        return d3
            .scaleTime()
            .range([0, CoinScatter.WIDTH]);
    }

    private initContainer(selector: string) {

        this.zoom = d3.zoom().on("zoom", this.onZoom);

        return d3
            .select(selector)
            .append("svg")
            .attr("width", CoinScatter.WIDTH + CoinScatter.MARGIN + CoinScatter.MARGIN)
            .attr("height", CoinScatter.HEIGHT + CoinScatter.MARGIN + CoinScatter.MARGIN)
            .call(this.zoom)
            .append("g")
            .attr("transform", "translate(" + CoinScatter.MARGIN + "," + CoinScatter.MARGIN + ")");

    }

    public onZoom() {

        this.lastZoomK = d3.event.transform.k;

        let new_yScale = d3.event.transform.rescaleY(this.yScale);
        let new_xScale = d3.event.transform.rescaleX(this.xScale);

        this.xAxis.call(d3.axisBottom(this.xScale).scale(new_xScale));
        this.yAxis.call(d3.axisLeft(this.yScale).scale(new_yScale));

        this.container.select('.ref-line')
            .attr('y1', new_yScale(1))
            .attr('y2', new_yScale(1));

        this.container.selectAll("image")
            .attr("y", function (d) {
                return new_yScale(d.y) + d.yJitter * d3.event.transform.k;
            })
            .attr("x", function (d) {
                return new_xScale(d.x) + d.xJitter * d3.event.transform.k;
            })
            .attr("width", CoinScatter.DOT_WIDTH * d3.event.transform.k);
    }

    public async update(data: CoinRow[]) {

        this.resetZoom();
        this.updateDomains(data);
        this.updateAxis();
        this.updateReferenceLine();
        this.updateDots(data);
    }

    private resetZoom() {
        d3.select("svg")
            .transition()
            .duration(1000)
            .call(this.zoom.translateTo, CoinScatter.WIDTH / 2 + CoinScatter.MARGIN, CoinScatter.HEIGHT / 2 + CoinScatter.MARGIN)
            .call(this.zoom.scaleTo, 1)
            .on("end", () => {
                this.zoom.transform(d3.select("svg"), d3.zoomIdentity.scale(1));
            });
    }

    private updateDots(data: CoinRow[]) {

        let coinrowContainers: CoinRowContainer[] = [];

        let jitterXFactorIndex = 0;
        let jitterYFactorIndex = 0;
        let jitterXCycleIndex = 0;
        let jitterYCycleIndex = 0;
        let lastYear = 1874;
        let jitter = (year) => {
            let x = Math.sin(jitterXFactorIndex);
            let y = Math.cos(jitterYFactorIndex);
            jitterXFactorIndex += 0.4;
            jitterYFactorIndex += 0.5;
            if(year === lastYear) {
                jitterXCycleIndex = 0;
                jitterYCycleIndex = 0;
            }
            let jitterXCycle = jitterXCycleIndex++ % Math.PI;
            let jitterYCycle = jitterXCycleIndex++ % Math.PI;
            lastYear = year;
            return {
                x: (x-0.5) * CoinScatter.DOT_WIDTH * 1.4 + (x-0.5) * jitterXCycle * CoinScatter.DOT_WIDTH * 0.7,
                y: (y-0.5) * CoinScatter.DOT_WIDTH * 0.5 + (y-0.5) * jitterYCycle * CoinScatter.DOT_WIDTH * 1
            };
        };

        data.forEach((d) => {
            coinrowContainers.push({
                x: d.von,
                y: d.euro,
                xJitter: jitter(d.von.getFullYear()).x,
                yJitter: jitter(d.von.getFullYear()).y,
                coinrow: d
            })
        });

        let dots = this.container.selectAll("image").data(coinrowContainers);

        dots
            .enter()
            .append('image')
            .attr("xlink:href", d => d.coinrow.thumb)
            .attr("id", d => "image-" + d.coinrow.id)
            .attr("width", CoinScatter.DOT_WIDTH)
            .on("mouseover", (d) => {
                DataService.hover(d.coinrow);
            })
            .on("mouseout", () => {
                DataService.hover(null);
            })
            .transition()
            .duration(1000)
            .attr("x", (d: CoinRowContainer) => {
                return this.xScale(d.x) + d.xJitter;
            })
            .attr("y", (d: CoinRowContainer) => {
                return this.yScale(d.y) + d.yJitter;
            });

        dots
            .on("mouseover", (d) => {
                DataService.hover(d.coinrow);
            })
            .on("mouseout", () => {
                DataService.hover(null);
            })
            .transition()
            .duration(1000)
            .attr("x", (d: CoinRowContainer) => {
                return this.xScale(d.x) + d.xJitter;
            })
            .attr("y", (d: CoinRowContainer) => {
                return this.yScale(d.y) + d.yJitter;
            });

        dots
            .exit()
            .transition()
            .duration(1000)
            .attr("width", 0)
            .remove();

    }

    private highlight(data: CoinRow) {
        if (data) {

            //this.container.selectAll("image").sort(function (a, b) {
            //    if (a.coinrow.id != data.id) return -1;
            //    else return 1;
            //});

            d3.select("#image-" + data.id).attr("width", CoinScatter.DOT_WIDTH * this.lastZoomK * 1.2);
        } else {
            d3.selectAll("image").attr("width", CoinScatter.DOT_WIDTH * this.lastZoomK);
        }
    }

    private updateReferenceLine() {
        this.container.select('.ref-line')
            .transition()
            .duration(1000)
            .attr('y1', this.yScale(1))
            .attr('y2', this.yScale(1));
    }

    private updateAxis() {
        this.container.select(".x-axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%y")));

        this.container.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(this.yScale));
    }

    private updateDomains(data: CoinRow[]) {
        this.xScale.domain(d3.extent(data, (d: CoinRow) => {
            return d.von
        }));
        this.yScale.domain(d3.extent(data, (d: CoinRow) => {
            return d.euro
        }));
    }

}




