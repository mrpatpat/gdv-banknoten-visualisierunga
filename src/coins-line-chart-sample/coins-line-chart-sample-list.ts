import * as d3 from "d3";
import "../assets/coins.csv";

import {CoinRow, CsvService} from "../service/csv-service";
import {DSVParsedArray} from "d3-dsv";
import {Subject} from "rxjs/internal/Subject";

export class CoinsLineChartSampleList {

    private container;

    public onMouseOverListElement$ = new Subject<CoinRow>();
    public onMouseOutListElement$ = new Subject<CoinRow>();

    constructor() {
        this.clearHighlight = this.clearHighlight.bind(this);
        this.highlight = this.highlight.bind(this);
    }

    public async render(selector: string) {
        const data = await CsvService.getCoins();
        this.container = this.buildContainer(selector, data);
    }

    public async filter(selector: string, start: number = 0, end: number = 9999) {
        const transformed = await CsvService.getCoins();
        const filtered: CoinRow[] = transformed.filter(coin => coin.von.getFullYear() >= start && coin.bis.getFullYear() <= end);
        d3.select(selector + ">ul").remove();
        this.container = this.buildContainer(selector, filtered);
    }

    highlight(data: CoinRow) {
        d3.select("#list-element-" + data.id).classed("highlighted", true);
    }

    clearHighlight(data: CoinRow) {
        d3.select(".list-element.highlighted").classed("highlighted", false);
    }

    private buildContainer(selector: string, data) {

        let builder = d3
            .select(selector)
            .append("ul");

        builder = d3.select(selector + " ul");

        data.forEach((row) => {
            builder
                .append("li")
                .attr("class", "list-element")
                .attr("id", "list-element-" + row.id)
                .on("mouseover", () => this.onMouseOverListElement$.next(row))
                .on("mouseout", () => this.onMouseOutListElement$.next(row))
                .html(row.nominal + " (" + row.von.getFullYear() + ")");
        });

        return builder.attr("id", "coins-line-chart-sample-list");
    }

}