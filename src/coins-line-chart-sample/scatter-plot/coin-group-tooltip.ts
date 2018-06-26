import {CoinScatter, DataContainer} from "./coin-scatter";
import * as d3 from "d3";

export class CoinGroupTooltip {

    private tooltipContainer;
    private k = 1;

    constructor() {
        this.tooltipContainer = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }

    public show(dataContainer: DataContainer) {

        this.tooltipContainer
            .transition()
            .duration(200)
            .style("opacity", .9);

        this.tooltipContainer
            .html("Jahr: " + dataContainer.x.getFullYear() + "<br/> Wert:" + dataContainer.y + "€")
            .style("left", d3.event.pageX + CoinScatter.COIN_WIDTH * this.k + "px")
            .style("top", d3.event.pageY + "px");

    }

    public hide() {

        this.tooltipContainer
            .transition()
            .duration(500)
            .style("opacity", 0);

    }

    public onZoom() {
        this.k = d3.event.transform.x;
    }

}