import {CoinScatter, DataContainer} from "./coin-scatter";
export class Circles {

    private circleContainer;

    constructor(private container) {
        this.circleContainer = this.container.append("g").attr("id", "circle-container");
    }

    public onUpdate(dataContainers: DataContainer[], xScale, yScale) {
        let dots = this.circleContainer.selectAll("circle").data(dataContainers);

        dots
            .enter()
            .append('circle')
            .attr("class", "circle")
            .attr("r", CoinScatter.DOT_RADIUS)
            .transition()
            .duration(CoinScatter.ANIMATION_MS)
            .attr("cx", (d: DataContainer) => {
                return xScale(d.x);
            })
            .attr("cy", (d: DataContainer) => {
                return yScale(d.y);
            });

        dots
            .transition()
            .duration(CoinScatter.ANIMATION_MS)
            .attr("cx", (d: DataContainer) => {
                return xScale(d.x);
            })
            .attr("cy", (d: DataContainer) => {
                return yScale(d.y);
            });

        dots
            .exit()
            .transition()
            .duration(CoinScatter.ANIMATION_MS)
            .attr("r", 0)
            .remove();
    }

    public onZoom(zoomEvent, new_xScale, new_yScale) {
        this.circleContainer.selectAll("circle")
            .attr("cy", function (d) {
                return new_yScale(d.y);
            })
            .attr("cx", function (d) {
                return new_xScale(d.x);
            })
            .attr("r", CoinScatter.DOT_RADIUS * zoomEvent.transform.k);
    }

}