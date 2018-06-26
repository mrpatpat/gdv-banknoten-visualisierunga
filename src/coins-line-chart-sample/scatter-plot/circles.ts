import {CoinScatter, DataContainer} from "./coin-scatter";
export class Circles {

    constructor(private container) {

    }

    public onUpdate(dataContainers: DataContainer[], xScale, yScale) {
        let dots = this.container.selectAll("circle").data(dataContainers);

        dots
            .enter()
            .append('circle')
            .attr("class", "circle")
            .attr("r", CoinScatter.DOT_RADIUS)
            .transition()
            .duration(1000)
            .attr("cx", (d: DataContainer) => {
                return xScale(d.x);
            })
            .attr("cy", (d: DataContainer) => {
                return yScale(d.y);
            });

        dots
            .transition()
            .duration(1000)
            .attr("cx", (d: DataContainer) => {
                return xScale(d.x);
            })
            .attr("cy", (d: DataContainer) => {
                return yScale(d.y);
            });

        dots
            .exit()
            .transition()
            .duration(1000)
            .attr("r", 0)
            .remove();
    }

    public onZoom(zoomEvent, new_xScale, new_yScale) {
        this.container.selectAll("circle")
            .attr("cy", function (d) {
                return new_yScale(d.y);
            })
            .attr("cx", function (d) {
                return new_xScale(d.x);
            })
            .attr("r", CoinScatter.DOT_RADIUS * zoomEvent.transform.k);
    }

}