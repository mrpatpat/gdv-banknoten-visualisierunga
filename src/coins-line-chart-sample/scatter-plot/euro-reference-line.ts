import {CoinScatter} from "./coin-scatter";

export class EuroReferenceLine {

    constructor(private container, yScale) {
        this.container.append('line')
            .attr("class", "ref-line")
            .attr('x1', 0)
            .attr('y1', yScale(1))
            .attr('x2', CoinScatter.WIDTH)
            .attr('y2', yScale(1));
    }

    public onZoom(yScale) {
        this.container.select('.ref-line')
            .attr('y1', yScale(1))
            .attr('y2', yScale(1));
    }

    public onUpdate(yScale) {
        this.container.select('.ref-line')
            .transition()
            .duration(1000)
            .attr('y1', yScale(1))
            .attr('y2', yScale(1));
    }

}