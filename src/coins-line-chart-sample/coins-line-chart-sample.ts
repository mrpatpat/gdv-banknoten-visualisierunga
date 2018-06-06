import "../assets/coins.csv";
import * as d3 from "d3";
import {CoinRow, CsvService} from "../service/csv-service";
import {Subject} from "rxjs/internal/Subject";

export class CoinsLineChartSample {

    private static MARGIN = 60;
    private static WIDTH = 800 - 2* CoinsLineChartSample.MARGIN;
    private static HEIGHT = 600 - 2* CoinsLineChartSample.MARGIN;
    private static DOT_WIDTH = 32;

    public onMouseOverDot$ = new Subject<CoinRow>();
    public onMouseOutDot$ = new Subject<CoinRow>();

    public async render(selector: string) {
        const transformed = await CsvService.getCoins();
        const svg = this.buildSvgContainerInSelector(selector);
        this.addAxis(svg, transformed);
        this.addDots(svg, transformed);
    }

    private addAxis(svg, csvData) {

        const timeAxisFn = this.buildTimeAxisFn(csvData);
        const euroAxisFn = this.buildEuroAxisFn(csvData);

        svg.append("g")
            .attr("transform", "translate(0," + CoinsLineChartSample.HEIGHT + ")")
            .call(d3.axisBottom(timeAxisFn));

        svg.append("text")
            .attr("x", CoinsLineChartSample.WIDTH / 2)
            .attr("y",CoinsLineChartSample.HEIGHT +20)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Jahr");

        svg.append("g")
            .call(d3.axisLeft(euroAxisFn));

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - CoinsLineChartSample.MARGIN)
            .attr("x",0 - (CoinsLineChartSample.HEIGHT / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Kaufkraft in Euro pro Mark");

    }

    public highlightDot(row: CoinRow) {
        d3.selectAll(".dot").classed("highlighted", false);
        d3.select("#image-" + row.id).classed("highlighted", true);
    }

    public unhighlightDot() {
        d3.selectAll(".dot").classed("highlighted", false);
    }

    private addDots(svg, csvData) {

        const timeAxisFn = this.buildTimeAxisFn(csvData);
        const euroAxisFn = this.buildEuroAxisFn(csvData);

        svg.selectAll("dot")
            .data(csvData)
            .enter()
            .append('image')
            .attr("xlink:href", d => d.thumb)
            .attr("width", CoinsLineChartSample.DOT_WIDTH)
            .attr("x", d => timeAxisFn(d.von))
            .attr("y", d => euroAxisFn(d.euro))
            .attr("id", d => "image-"+d.id)
            .attr("class", d => "dot")
            .on("mouseover", (d) => {
                this.highlightDot(d);
                this.onMouseOverDot$.next(d);
            })
            .on("mouseout", (d) => {
                this.unhighlightDot();
                this.onMouseOutDot$.next(d);
            });

    }

    private buildSvgContainerInSelector(selector: string) {

        return d3
            .select(selector)
            .append("svg")
            .attr("width", CoinsLineChartSample.WIDTH + CoinsLineChartSample.MARGIN + CoinsLineChartSample.MARGIN)
            .attr("height", CoinsLineChartSample.HEIGHT + CoinsLineChartSample.MARGIN + CoinsLineChartSample.MARGIN)
            .append("g")
            .attr("transform", "translate(" + CoinsLineChartSample.MARGIN + "," + CoinsLineChartSample.MARGIN + ")");
    }

    private buildTimeAxisFn(csvData) {
        return d3
            .scaleTime()
            .range([0, CoinsLineChartSample.WIDTH])
            .domain(d3.extent(csvData, (d: CoinRow) => {
                return +d.von
            }));
    }

    private buildEuroAxisFn(csvData) {
        return d3
            .scaleLog()
            .base(10)
            .range([CoinsLineChartSample.HEIGHT, 0])
            .domain(d3.extent(csvData, (d: CoinRow) => {
                return +d.euro
            }));
    }

}




