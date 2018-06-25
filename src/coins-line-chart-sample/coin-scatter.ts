import * as d3 from "d3";
import {CoinRow} from "../service/csv-service";
import {DataService} from "../service/data-service";

export interface DataContainer {
    x: Date,
    y: number,
    coinrows: CoinRow[]
}

export class CoinScatter {

    private static MARGIN = 60;
    private static WIDTH = 1370 - 2 * CoinScatter.MARGIN;
    private static HEIGHT = 800 - 2 * CoinScatter.MARGIN;
    public static DOT_RADIUS = 2;
    public static COIN_WIDTH = 8;
    public static COIN_OFFSET = 1;

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
        this.initGraph();

        this.updateDomains([]);
        this.update([]);

    }

    private initGraph() {
        this.container.append("path")
            .attr("class", "graph")
            .style("fill", "none")
            .style("stroke", "#c0b7b7a1")
            .style("stroke-width", "2px");

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

        this.container.selectAll("circle")
            .attr("cy", function (d) {
                return new_yScale(d.y);
            })
            .attr("cx", function (d) {
                return new_xScale(d.x);
            })
            .attr("r", CoinScatter.DOT_RADIUS * d3.event.transform.k);

        let offsets = {};

        this.container.selectAll("circle").select((dc)=>{
            if(!offsets[dc.x.getFullYear()+""]) {
                offsets[dc.x.getFullYear() + ""] = {};
            }
            offsets[dc.x.getFullYear()+""][dc.y+""] = 0;
        });

        this.container.selectAll("image")
            .attr("width", CoinScatter.COIN_WIDTH * d3.event.transform.k)
            .attr("x", (d) => {
                return new_xScale(d.dc.x) - CoinScatter.COIN_WIDTH/2* d3.event.transform.k;
            })
            .attr("y", (d) => {
                return new_yScale(d.dc.y) + 5*CoinScatter.COIN_OFFSET * d3.event.transform.k + offsets[d.dc.x.getFullYear()+""][d.dc.y+""]++ * d3.event.transform.k *(CoinScatter.COIN_WIDTH);
            });

        this.container.selectAll("rect")
            .attr("width", CoinScatter.COIN_OFFSET * d3.event.transform.k + CoinScatter.COIN_WIDTH* d3.event.transform.k )
            .attr("height", (dc)=>{
                let rows = dc.coinrows.length;
                return rows * (CoinScatter.COIN_WIDTH)* d3.event.transform.k  + CoinScatter.COIN_OFFSET* d3.event.transform.k ;
            })
            .attr("x", (d: DataContainer) => {
                return new_xScale(d.x) - CoinScatter.COIN_OFFSET/2* d3.event.transform.k  - CoinScatter.COIN_WIDTH/2* d3.event.transform.k ;
            })
            .attr("y", (d: DataContainer) => {
                return new_yScale(d.y) + CoinScatter.DOT_RADIUS* d3.event.transform.k  + CoinScatter.COIN_OFFSET*1.5* d3.event.transform.k ;
            });

        this.container.selectAll(".graph").attr('transform', 'translate(' + d3.event.transform.x +','+ d3.event.transform.y + ') scale(' + d3.event.transform.k + ')');

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

        let dataContainers: DataContainer[] = [];

        // build all combinations by euro/year
        data.forEach((d) => {
            let year = d.von;
            let euro = d.euro;
            let currDc = {
                x: year,
                y: euro,
                coinrows: []
            };
            dataContainers.push(currDc);
        });

        // remove duplicates
        dataContainers = dataContainers.filter((obj, pos, arr) => {
           return arr.map(mapObj => mapObj["x"].getFullYear() + mapObj["y"]).indexOf(obj["x"].getFullYear() + obj["y"]) === pos;
        });

        // add into its container
        data.forEach((d) => {
            let year = d.von;
            let euro = d.euro;
            dataContainers.forEach((dc)=>{
               if(year.getFullYear() === dc.x.getFullYear() && euro === dc.y){
                   d.dc = dc;
                   dc.coinrows.push(d);
               }
            });
        });

        let rects = this.container.selectAll("rect").data(dataContainers);

        rects
            .enter()
            .append('rect')
            .attr("width", CoinScatter.COIN_OFFSET + CoinScatter.COIN_WIDTH)
            .attr("height", (dc)=>{
                let rows = dc.coinrows.length;
                return rows * (CoinScatter.COIN_WIDTH ) + CoinScatter.COIN_OFFSET;
            })
            .transition()
            .duration(1000)
            .attr("x", (d: DataContainer) => {
                return this.xScale(d.x) - CoinScatter.COIN_OFFSET/2 - CoinScatter.COIN_WIDTH/2;
            })
            .attr("y", (d: DataContainer) => {
                return this.yScale(d.y) + CoinScatter.DOT_RADIUS + CoinScatter.COIN_OFFSET*1.5;
            })
            .style("stroke", "#000000")
            .style("fill", "#efefef");
        rects
            .transition()
            .duration(1000)
            .attr("x", (d: DataContainer) => {
                return this.xScale(d.x) - CoinScatter.COIN_OFFSET/2 - CoinScatter.COIN_WIDTH/2;
            })
            .attr("y", (d: DataContainer) => {
                return this.yScale(d.y) + CoinScatter.DOT_RADIUS + CoinScatter.COIN_OFFSET*1.5;
            })
            .attr("height", (dc)=>{
                let rows = dc.coinrows.length;
                return rows * (CoinScatter.COIN_WIDTH ) + CoinScatter.COIN_OFFSET;
            });
        rects
            .exit()
            .transition()
            .duration(1000)
            .attr("width", 0)
            .attr("height", 0)
            .remove();

        let dots = this.container.selectAll("circle").data(dataContainers);

        dots
            .enter()
            .append('circle')
            .attr("r", CoinScatter.DOT_RADIUS)
            .transition()
            .duration(1000)
            .attr("cx", (d: DataContainer) => {
                return this.xScale(d.x);
            })
            .attr("cy", (d: DataContainer) => {
                return this.yScale(d.y);
            })
            .style('stroke', '#000')
            .style('fill', '#efefef')
            .style('stroke-width', '1px');

        dots
            .transition()
            .duration(1000)
            .attr("cx", (d: DataContainer) => {
                return this.xScale(d.x);
            })
            .attr("cy", (d: DataContainer) => {
                return this.yScale(d.y);
            });

        dots
            .exit()
            .transition()
            .duration(1000)
            .attr("r", 0)
            .remove();

        let valueline = d3.line<DataContainer>()
            .x((d) => { return this.xScale(d.x); })
            .y((d) => { return this.yScale(d.y); })
            .curve(d3.curveMonotoneX);

        this.container.selectAll(".graph")
            .data([dataContainers.sort((a,b)=>{
                if(a.x.getFullYear()-b.x.getFullYear() === 0) {
                    return b.y-a.y
                }
                return a.x.getFullYear()-b.x.getFullYear()
            })])
            .attr("d", valueline);


        let offsets = {};

        dataContainers.forEach((dc)=>{
            if(!offsets[dc.x.getFullYear()+""]) {
                offsets[dc.x.getFullYear() + ""] = {};
            }
            offsets[dc.x.getFullYear()+""][dc.y+""] = 0;
        });

        let coins = this.container.selectAll("image").data(data);

        coins
            .enter()
            .append('image')
            .attr("xlink:href", d => d.thumb)
            .attr("id", d => "image-" + d.id)
            .attr("width", CoinScatter.COIN_WIDTH)
            .on("mouseover", (d) => {
                DataService.hover(d);
            })
            .on("mouseout", () => {
                DataService.hover(null);
            })
            .transition()
            .duration(1000)
            .attr("x", (d) => {
                return this.xScale(d.dc.x) - CoinScatter.COIN_WIDTH/2;
            })
            .attr("y", (d) => {
                return this.yScale(d.dc.y) + 5*CoinScatter.COIN_OFFSET + offsets[d.dc.x.getFullYear()+""][d.dc.y+""]++ * (CoinScatter.COIN_WIDTH);
            });


        coins
            .on("mouseover", (d) => {
                DataService.hover(d);
            })
            .on("mouseout", () => {
                DataService.hover(null);
            })
            .transition()
            .duration(1000)
            .attr("x", (d) => {
                return this.xScale(d.dc.x) - CoinScatter.COIN_WIDTH/2;
            })
            .attr("y", (d) => {
                return this.yScale(d.dc.y) + 5*CoinScatter.COIN_OFFSET + offsets[d.dc.x.getFullYear()+""][d.dc.y+""]++ * (CoinScatter.COIN_WIDTH);
            });

        coins
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

            d3.select("#image-" + data.id).attr("width", CoinScatter.COIN_WIDTH * this.lastZoomK * 1.2);
        } else {
            d3.selectAll("image").attr("width", CoinScatter.COIN_WIDTH * this.lastZoomK);
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




