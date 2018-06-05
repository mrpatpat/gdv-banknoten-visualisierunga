import "../assets/coins.csv";
import * as d3 from "d3";
import {CoinRow, CsvService} from "../service/csv-service";
import {Subject} from "rxjs/internal/Subject";

export class CoinsLineChartSample {

    private static FILE = "https://spreadsheets.google.com/tq?key=1f8iOIEZi9_fXgrGK0xxnVmmaX0ZG_28lP67M0Dyr5OU&tqx=out:csv";
    private static MARGIN = 20;
    private static WIDTH = 800;
    private static HEIGHT = 200;
    private static DOT_WIDTH = 32;

    public onMouseOverDot$ = new Subject<CoinRow>();
    public onMouseOutDot$ = new Subject<CoinRow>();

    public async render(selector: string) {
        const transformed = await CsvService.parse(CoinsLineChartSample.FILE);
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

        svg.append("g")
            .call(d3.axisLeft(euroAxisFn));

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
                this.onMouseOverDot$.next(d);
            })
            .on("mouseout", (d) => {
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




