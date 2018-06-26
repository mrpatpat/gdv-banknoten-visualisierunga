import {CoinScatter, DataContainer} from "./coin-scatter";
export class CircleLabels {

    private static FONT_SIZE = 12;

    private circleLabelContainer;
    private k = 1;

    constructor(private container) {
        this.circleLabelContainer = this.container.append("g").attr("id", "circle-label-container");
    }

    private transformFn(d, xScale, yScale) {
        let x = xScale(d.x) + (CoinScatter.DOT_RADIUS*1.5*this.k);
        let y = yScale(d.y) + (-CoinScatter.DOT_RADIUS*1.5*this.k);
        return "translate("+ x +","+ y +") rotate(-45)";
    }

    public onUpdate(dataContainers: DataContainer[], xScale, yScale) {
        let dots = this.circleLabelContainer.selectAll("text").data(dataContainers);

        dots
            .enter()
            .append('text')
            .attr("class", "circle-label")
            .text((dc)=>dc.y + "€")
            .transition()
            .duration(CoinScatter.ANIMATION_MS)
            .attr("transform", (d) => this.transformFn(d, xScale, yScale));


        dots
            .transition()
            .duration(CoinScatter.ANIMATION_MS)
            .text((dc)=>dc.y + "€")
            .attr("transform", (d) => this.transformFn(d, xScale, yScale));



        dots
            .exit()
            .transition()
            .duration(CoinScatter.ANIMATION_MS)
            .style("opacity",0)
            .remove();
    }

    public onZoom(zoomEvent, new_xScale, new_yScale) {
        this.k = zoomEvent.transform.k;
        this.circleLabelContainer.selectAll("text")
            .attr("transform", (d) => this.transformFn(d, new_xScale, new_yScale))
            .style("font-size", CircleLabels.FONT_SIZE * this.k);

    }

}