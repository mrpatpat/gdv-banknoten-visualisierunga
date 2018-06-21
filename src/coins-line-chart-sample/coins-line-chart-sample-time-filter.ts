import * as d3 from "d3";
import "../assets/coins.csv";

import {CoinRow, CsvService} from "../service/csv-service";
import {DSVParsedArray} from "d3-dsv";
import {Subject} from "rxjs/internal/Subject";

export interface Epoche {
    name: string;
    from: number;
    to: number;
}

export class CoinsLineChartSampleTimeFilter {

    private container;

    private static EPOCHES: Epoche[] = [
        { name: "Alle", from: 0, to: 9999 },
        { name: "Reichsmark", from: 1924, to: 1948 },
        { name: "Rentenmark", from: 1923, to: 1924 },
        { name: "Mark", from: 1871, to: 1923 }
    ];

    public onMouseOverListElement$ = new Subject<Epoche>();
    public onMouseOutListElement$ = new Subject<Epoche>();
    public onFilterChange$ = new Subject<Epoche>();

    constructor() {
        this.clearHighlight = this.clearHighlight.bind(this);
        this.highlight = this.highlight.bind(this);
    }

    highlight(from: number, to: number) {
        CoinsLineChartSampleTimeFilter.EPOCHES.forEach((epoche) => {
            if(from >= epoche.from && to <= epoche.to) {

                d3.select("#epoche-element-" + epoche.name).classed("highlighted", true);
            }
        });
    }

    clearHighlight() {
        d3.select(".epoche-element.highlighted").classed("highlighted", false);
    }

    public async render(selector: string) {
        this.container = this.buildContainer(selector);
    }

    private buildContainer(selector: string) {

        let builder = d3
            .select(selector)
            .append("ul");

        builder = d3.select(selector + " ul");

        CoinsLineChartSampleTimeFilter.EPOCHES.forEach((epoche) => {
            builder
                .append("li")
                .attr("class", "epoche-element")
                .attr("id", "epoche-element-" + epoche.name)
                .on("mouseover", () => this.onMouseOverListElement$.next(epoche))
                .on("mouseout", () => this.onMouseOutListElement$.next(epoche))
                .on("click", () => this.onFilterChange$.next(epoche))
                .html(epoche.name);
        });

        return builder.attr("id", "coins-line-chart-sample-tiume-filter");
    }

}