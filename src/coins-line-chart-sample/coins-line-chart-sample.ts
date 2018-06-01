import "../assets/coins.csv";
import * as d3 from "d3";
import {CoinRow, CsvService} from "../service/csv-service";

export interface CoinsLineChartSampleSubscriber {
    onMouseOverDot(data: CoinRow, x: number, y: number);
    onMouseOutDot(data: CoinRow, x: number, y: number);
}

export class CoinsLineChartSample {

    private static FILE = "coins.csv";
    private static MARGIN = 20;
    private static WIDTH = 800;
    private static HEIGHT = 200;
    private static DOT_WIDTH = 32;

    private subscribers: CoinsLineChartSampleSubscriber[] = [];

    public registerSubscriber(subscriber: CoinsLineChartSampleSubscriber) {
        this.subscribers.push(subscriber);
    }

    public async render(selector: string) {
        const transformed = await CsvService.parse(CoinsLineChartSample.FILE);
        const svg = this.buildSvgContainerInSelector(selector);
        this.addAxis(svg, transformed);
        this.addDots(svg, selector, transformed);
    }

    private addAxis(svg, csvData) {

        const timeAxisFn = this.buildTimeAxisFn(csvData);
        const euroAxisFn = this.buildEuroAxisFn(csvData);

        svg.append("g")
            .attr("transform", "translate(0," + CoinsLineChartSample.HEIGHT + ")")
            .call(d3.axisBottom(timeAxisFn));

        svg.append("g")
            .call(d3.axisLeft(euroAxisFn));

    }

    private addDots(svg, selector, csvData) {

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
            .on("mouseover", (d) => {
                this.subscribers.forEach(s => s.onMouseOverDot(d, d3.event.pageX, d3.event.pageY));
            })
            .on("mouseout", (d) => {
                this.subscribers.forEach(s => s.onMouseOutDot(d, d3.event.pageX, d3.event.pageY));
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




