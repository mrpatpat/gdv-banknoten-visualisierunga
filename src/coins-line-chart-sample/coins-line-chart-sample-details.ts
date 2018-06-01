import * as d3 from "d3";

import {CoinRow} from "../service/csv-service";
import {CoinsLineChartSampleSubscriber} from "./coins-line-chart-sample";
import {CoinsLineChartSampleListSubscriber} from "./coins-line-chart-sample-list";

export class CoinsLineChartSampleDetails implements CoinsLineChartSampleSubscriber, CoinsLineChartSampleListSubscriber{

    private static ANIMATION_LENGTH_MS = 200;

    private container;

    public render(selector: string) {
        this.container = this.buildContainer(selector);
    }


    onMouseOverListElement(data: CoinRow) {
        if(this.container) {
            this.container
                .html(this.buildTooltipHtml(data))
                .transition()
                .duration(CoinsLineChartSampleDetails.ANIMATION_LENGTH_MS)
                .style("opacity", 1)
        }
    }

    onMouseOutListElement(data: CoinRow) {
        if(this.container) {
            this.container
                .transition()
                .duration(CoinsLineChartSampleDetails.ANIMATION_LENGTH_MS)
                .style("opacity", 0);
        }
    }

    onMouseOverDot(data: CoinRow, x: number, y: number) {
        this.onMouseOverListElement(data);
    }

    onMouseOutDot(data: CoinRow, x: number, y: number) {
        this.onMouseOutListElement(data);
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