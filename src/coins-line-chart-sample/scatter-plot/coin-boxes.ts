import {CoinScatter, DataContainer} from "./coin-scatter";
import {Subject} from "rxjs/index";

export class CoinBoxes {

    public hover$ = new Subject<DataContainer>();

    private coinBoxesContainer;

    constructor(private container) {
        this.coinBoxesContainer = this.container.append("g").attr("id", "coin-boxes-container");

    }

    public onUpdate(dataContainers: DataContainer[], xScale, yScale) {
        let rects = this.coinBoxesContainer.selectAll("rect").data(dataContainers);

        let rectXFn = (d: DataContainer) => {
            return xScale(d.x) - CoinScatter.COIN_OFFSET/2 - CoinScatter.COIN_WIDTH/2;
        };

        let rectYFn = (d: DataContainer) => {
            return yScale(d.y) + CoinScatter.DOT_RADIUS + CoinScatter.COIN_OFFSET*1.5;
        };

        let rectHeightFn = (dc)=>{
            let rows = dc.coinrows.length;
            return rows * (CoinScatter.COIN_WIDTH ) + CoinScatter.COIN_OFFSET;
        };

        rects
            .enter()
            .append('rect')
            .attr("width", CoinScatter.COIN_OFFSET + CoinScatter.COIN_WIDTH)
            .attr("height", rectHeightFn)
            .attr("class", "coin-box")
            .on("mouseover", (d) => {
                this.hover$.next(d);
            })
            .on("mouseout", () => {
                this.hover$.next(null);
            })
            .transition()
            .duration(1000)
            .attr("x", rectXFn)
            .attr("y", rectYFn);
        rects
            .transition()
            .duration(1000)
            .attr("x", rectXFn)
            .attr("y", rectYFn)
            .attr("width", CoinScatter.COIN_OFFSET + CoinScatter.COIN_WIDTH)
            .attr("height", rectHeightFn);
        rects
            .exit()
            .transition()
            .duration(1000)
            .attr("width", 0)
            .attr("height", 0)
            .remove();
    }

    public onZoom(zoomEvent, new_xScale, new_yScale) {

        this.coinBoxesContainer.selectAll("rect")
            .attr("width", CoinScatter.COIN_OFFSET * zoomEvent.transform.k + CoinScatter.COIN_WIDTH* zoomEvent.transform.k )
            .attr("height", (dc)=>{
                let rows = dc.coinrows.length;
                return rows * (CoinScatter.COIN_WIDTH)* zoomEvent.transform.k  + CoinScatter.COIN_OFFSET* zoomEvent.transform.k ;
            })
            .attr("x", (d: DataContainer) => {
                return new_xScale(d.x) - CoinScatter.COIN_OFFSET/2* zoomEvent.transform.k  - CoinScatter.COIN_WIDTH/2* zoomEvent.transform.k ;
            })
            .attr("y", (d: DataContainer) => {
                return new_yScale(d.y) + CoinScatter.DOT_RADIUS* zoomEvent.transform.k  + CoinScatter.COIN_OFFSET*1.5* zoomEvent.transform.k ;
            });

    }

}