import {CoinScatter} from "./coin-scatter";

export class EuroReferenceLine {

    private refLineContainer;

    constructor(private container, yScale) {
        this.refLineContainer = this.container.append("g").attr("id", "ref-line-container");

        this.refLineContainer.append('line')
            .attr("class", "ref-line")
            .attr('x1', 0)
            .attr('y1', yScale(1))
            .attr('x2', CoinScatter.WIDTH)
            .attr('y2', yScale(1));
    }

    public onZoom(yScale) {
        this.refLineContainer.select('.ref-line')
            .attr('y1', yScale(1))
            .attr('y2', yScale(1));
    }

    public onUpdate(yScale) {
        this.refLineContainer.select('.ref-line')
            .transition()
            .duration(1000)
            .attr('y1', yScale(1))
            .attr('y2', yScale(1));
    }

}