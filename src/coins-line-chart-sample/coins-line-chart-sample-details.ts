import * as d3 from "d3";
import {CoinRow} from "../service/csv-service";

export class CoinsLineChartSampleDetails {

    private static ANIMATION_LENGTH_MS = 200;

    private container;

    constructor() {
        this.setDetails = this.setDetails.bind(this);
        this.clearDetails = this.clearDetails.bind(this);
    }

    public render(selector: string) {
        this.container = this.buildContainer(selector);
    }

    public setDetails (data: CoinRow) {
        if(this.container) {
            this.container
                .html(this.buildTooltipHtml(data))
                .transition()
                .duration(CoinsLineChartSampleDetails.ANIMATION_LENGTH_MS)
                .style("opacity", 1)
        }
    }

    public clearDetails() {
        if(this.container) {
            this.container
                .transition()
                .duration(CoinsLineChartSampleDetails.ANIMATION_LENGTH_MS)
                .style("opacity", 0);
        }
    }

    private buildContainer(selector: string) {
        return d3
            .select(selector)
            .append("div")
            .attr("id", "coins-line-chart-sample-details")
            .style("opacity", 0);
    }

    private buildTooltipHtml(data: CoinRow) {
        return "<h2>" + data.nominal + " (" + data.euro +"€)" + "</h2><img src='" + data.image + "'>";
    }

}