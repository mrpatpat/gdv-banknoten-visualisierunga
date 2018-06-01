import * as d3 from "d3";
import "../assets/coins.csv";

import {CoinRow, CsvService} from "../service/csv-service";
import {DSVParsedArray} from "d3-dsv";
import {Subject} from "rxjs/internal/Subject";

export class CoinsLineChartSampleList {

    private static FILE = "coins.csv";

    private container;

    public onMouseOverListElement$ = new Subject<CoinRow>();
    public onMouseOutListElement$ = new Subject<CoinRow>();

    constructor() {
        this.clearHighlight = this.clearHighlight.bind(this);
        this.highlight = this.highlight.bind(this);
    }

    public async render(selector: string) {
        const data = await CsvService.parse(CoinsLineChartSampleList.FILE);
        this.container = this.buildContainer(selector, data);
    }

    highlight(data: CoinRow) {
        d3.select("#list-element-" + data.id).classed("highlighted", true);
    }

    clearHighlight(data: CoinRow) {
        d3.select("li.highlighted").classed("highlighted", false);
    }

    private buildContainer(selector: string, data: DSVParsedArray<CoinRow>) {

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
                .html(row.nominal);
        });

        return builder.attr("id", "coins-line-chart-sample-list");
    }

}