import {CoinScatter} from "./coin-scatter";

export class EuroReferenceLine {

    private refLineContainer;

    constructor(private container, yScale) {
        this.refLineContainer = this.container.append("g").attr("id", "ref-line-container");

        this.refLineContainer.append('line')
            .attr("class", "ref-line")
            .attr('x1', 0)
            .attr('y1', yScale(1))
            .attr('x2', CoinScatter.WIDTH + CoinScatter.MARGIN)
            .attr('y2', yScale(1));

        this.refLineContainer.append("text")
            .attr("class", "ref-line-label")
            .attr("x", 0)
            .attr("y",  yScale(1))
            .attr("dy", "1.3em")
            .attr("dx", "-3em")
            .text("1€");
    }

    public onZoom(yScale) {
        this.refLineContainer.select('.ref-line')
            .attr('y1', yScale(1))
            .attr('y2', yScale(1));

        this.refLineContainer.select(".ref-line-label")
            .attr("x", CoinScatter.MARGIN)
            .attr("y",  yScale(1));
    }

    public onUpdate(yScale) {
        this.refLineContainer.select('.ref-line')
            .transition()
            .duration(CoinScatter.ANIMATION_MS)
            .attr('y1', yScale(1))
            .attr('y2', yScale(1));

        this.refLineContainer.select(".ref-line-label")
            .transition()
            .duration(CoinScatter.ANIMATION_MS)
            .attr("y",  yScale(1));
    }

}