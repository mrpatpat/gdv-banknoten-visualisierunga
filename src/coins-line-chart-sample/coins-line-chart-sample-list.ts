import * as d3 from "d3";
import "../assets/coins.csv";

import {CoinRow, CsvService} from "../service/csv-service";
import {CoinsLineChartSampleSubscriber} from "./coins-line-chart-sample";
import {DSVParsedArray} from "d3-dsv";

export interface CoinsLineChartSampleListSubscriber {
    onMouseOverListElement(data: CoinRow);
    onMouseOutListElement(data: CoinRow);
}

export class CoinsLineChartSampleList implements CoinsLineChartSampleSubscriber{

    private static FILE = "coins.csv";

    private container;

    private subscribers: CoinsLineChartSampleListSubscriber[] = [];

    public registerSubscriber(subscriber: CoinsLineChartSampleListSubscriber) {
        this.subscribers.push(subscriber);
    }

    public async render(selector: string) {
        const data = await CsvService.parse(CoinsLineChartSampleList.FILE);
        this.container = this.buildContainer(selector, data);
    }

    onMouseOverDot(data: CoinRow, x: number, y: number) {
        d3.select("#list-element-"+data.id).classed("highlighted", true);
    }

    onMouseOutDot(data: CoinRow, x: number, y: number) {
        d3.select("li.highlighted").classed("highlighted", false);
    }

    private buildContainer(selector: string, data: DSVParsedArray<CoinRow>) {

        let builder = d3
            .select(selector)
            .append("ul");

        builder = d3.select(selector+" ul");

        data.forEach((row)=>{
           builder
               .append("li")
               .attr("class", "list-element")
               .attr("id", "list-element-"+row.id)
               .on("mouseover",  ()=>this.subscribers.forEach(s => s.onMouseOverListElement(row)))
               .on("mouseout",  ()=>this.subscribers.forEach(s => s.onMouseOutListElement(row)))
               .html(row.nominal);
        });

        return builder.attr("id", "coins-line-chart-sample-list");
    }

}