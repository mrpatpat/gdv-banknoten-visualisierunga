import * as d3 from "d3";
import {CoinRow} from "../service/csv-service";
import {DataService} from "../service/data-service";

export class CoinScatter {

    private static MARGIN = 60;
    private static WIDTH = 980 - 2* CoinScatter.MARGIN;
    private static HEIGHT = 600 - 2* CoinScatter.MARGIN;
    private static DOT_WIDTH = 32;

    private svg;
    private xScale;
    private yScale;
    private xAxis;
    private yAxis;

    constructor(private selector: string, private data: CoinRow[] = []) {

        this.update = this.update.bind(this);
        this.zoom = this.zoom.bind(this);
        DataService.data$.subscribe(data => this.update(data));

        // SVG
        this.svg = d3
            .select(selector)
            .append("svg")
            .attr("width", CoinScatter.WIDTH + CoinScatter.MARGIN + CoinScatter.MARGIN)
            .attr("height", CoinScatter.HEIGHT + CoinScatter.MARGIN + CoinScatter.MARGIN)
            .call(d3.zoom().on("zoom", this.zoom))
            .append("g")
            .attr("transform", "translate(" + CoinScatter.MARGIN + "," + CoinScatter.MARGIN + ")");

        // Scale methods

        this.xScale = d3
            .scaleTime()
            .range([0, CoinScatter.WIDTH])
            .domain(d3.extent(this.data, (d: CoinRow) => {
                return +d.von
            }));

        this.yScale = d3
            .scaleLog()
            .base(10)
            .range([CoinScatter.HEIGHT, 0])
            .domain(d3.extent(this.data, (d: CoinRow) => {
                return +d.euro
            }));

        //  Axis

        this.xAxis = this.svg.append("g")
            .attr("transform", "translate(0," + CoinScatter.HEIGHT + ")")
            .attr("class", "x-axis")
            .call(d3.axisBottom(this.xScale));

        this.yAxis = this.svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(this.yScale));

        //labels
        this.svg.append("text")
            .attr("x", CoinScatter.WIDTH / 2)
            .attr("y",CoinScatter.HEIGHT +20)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Jahr");

        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - CoinScatter.MARGIN)
            .attr("x",0 - (CoinScatter.HEIGHT / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Kaufkraft in Euro pro Mark");

        //Ref Line
        this.svg.append('line')
            .style('stroke', '#900')
            .style('stroke-width', '1px')
            .attr("class", "ref-line")
            .attr('x1', 0)
            .attr('y1', this.yScale(1))
            .attr('x2', CoinScatter.WIDTH)
            .attr('y2', this.yScale(1));

        // dots
        this.svg.selectAll("circle")
            .data(data)
            .enter()
            .append('image')
            .attr("xlink:href", d => d.image)
            .attr("width", CoinScatter.DOT_WIDTH)
            .attr("x", (d: CoinRow) => {
                return this.xScale(d.von);
            })
            .attr("y", (d: CoinRow) => {
                return this.yScale(d.euro);
            })
            .on("mouseover", DataService.hover)
            .on("mouseout", ()=>DataService.hover(null));

    }

    public zoom() {
        // re-scale y axis during zoom; ref [2]
        this.xAxis.call(d3.axisBottom(this.xScale).scale(d3.event.transform.rescaleX(this.xScale)));
        this.yAxis.call(d3.axisLeft(this.yScale).scale(d3.event.transform.rescaleY(this.yScale)));

        // re-draw circles using new y-axis scale; ref [3]
        let new_yScale = d3.event.transform.rescaleY(this.yScale);
        let new_xScale = d3.event.transform.rescaleX(this.xScale);

        this.svg.select('.ref-line')
            .attr('y1',new_yScale(1))
            .attr('y2',new_yScale(1));

        this.svg.selectAll("image")
            .attr("y", function(d) { return new_yScale(+d.euro); })
            .attr("x", function(d) { return new_xScale(+d.von); })
            .attr("width", CoinScatter.DOT_WIDTH * d3.event.transform.k);
    }

    public async update(data: CoinRow[]) {

        this.data = data;

        //Update axis domains
        this.xScale.domain(d3.extent(data, (d: CoinRow) => {
            return +d.von
        })).nice();

        this.yScale.domain(d3.extent(data, (d: CoinRow) => {
            return +d.euro
        })).nice();

        //axis
        this.svg.select(".x-axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(this.xScale));

        this.svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(this.yScale));

        //Ref Line
        this.svg.select('.ref-line')
            .transition()
            .duration(1000)
            .attr('y1', this.yScale(1))
            .attr('y2', this.yScale(1));

        //dots
        let circle = this.svg.selectAll("image").data(data);

        circle
            .enter()
            .append('image')
            .attr("xlink:href", d => d.image)
            .attr("width", CoinScatter.DOT_WIDTH)
            .on("mouseover", DataService.hover)
            .on("mouseout", ()=>DataService.hover(null))
            .transition()
            .duration(1000)
            .attr("x", (d: CoinRow) => {
                return this.xScale(d.von);
            })
            .attr("y", (d: CoinRow) => {
                return this.yScale(d.euro);
            });

        circle
            .on("mouseover", DataService.hover)
            .on("mouseout", ()=>DataService.hover(null))
            .transition()
            .duration(1000)
            .attr("x", (d: CoinRow) => {
                return this.xScale(d.von);
            })
            .attr("y", (d: CoinRow) => {
                return this.yScale(d.euro);
            });

        circle
            .exit()
            .transition()
            .duration(1000)
            .attr("width", 0)
            .remove();

    }

}




