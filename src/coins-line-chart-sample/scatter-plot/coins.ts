import {CoinScatter, DataContainer} from "./coin-scatter";
import {OffsetHelper} from "./offset-helper";
import {CoinRow} from "../../service/csv-service";
import * as d3 from "d3";
import {Subject} from "rxjs/index";

export class Coins {

    private lastZoomK;

    public hover$ = new Subject<CoinRow>();

    private coinContainer;
    private lastDataContainers: DataContainer[];

    constructor(private container) {
        this.coinContainer = this.container.append("g").attr("id", "coins-container");
    }

    public onHighlight(data: CoinRow) {
        if (data) {
            d3.select("#image-" + data.id).attr("width", CoinScatter.COIN_WIDTH * this.lastZoomK * 1.2);
        } else {
            d3.selectAll("image").attr("width", CoinScatter.COIN_WIDTH * this.lastZoomK);
        }
    }

    public onUpdate(dataContainers: DataContainer[], data: CoinRow[], xScale, yScale) {
        this.lastDataContainers = dataContainers;
        let offsetHelper = new OffsetHelper(dataContainers);

        let coins = this.coinContainer.selectAll("image").data(data);

        let coinsYFn = (d) => {
            return yScale(d.dc.y) + 5*CoinScatter.COIN_OFFSET + offsetHelper.getOffset(d.dc) * (CoinScatter.COIN_WIDTH);
        };

        let coinsXFn = (d) => {
            return xScale(d.dc.x) - CoinScatter.COIN_WIDTH/2;
        };

        coins
            .enter()
            .append('image')
            .attr("xlink:href", d => d.thumb)
            .attr("id", d => "image-" + d.id)
            .attr("width", CoinScatter.COIN_WIDTH)
            .on("mouseover", (d) => {
                this.hover$.next(d);
            })
            .on("mouseout", () => {
                this.hover$.next(null);
            })
            .transition()
            .duration(CoinScatter.ANIMATION_MS)
            .attr("x", coinsXFn)
            .attr("y", coinsYFn);


        coins
            .attr("xlink:href", d => d.thumb)
            .attr("id", d => "image-" + d.id)
            .attr("width", CoinScatter.COIN_WIDTH)
            .on("mouseover", (d) => {
                this.hover$.next(d);
            })
            .on("mouseout", () => {
                this.hover$.next(null);
            })
            .transition()
            .duration(CoinScatter.ANIMATION_MS)
            .attr("x", coinsXFn)
            .attr("y", coinsYFn);

        coins
            .exit()
            .transition()
            .duration(CoinScatter.ANIMATION_MS)
            .attr("width", 0)
            .remove();
    }

    public onZoom(zoomEvent, new_xScale, new_yScale) {

        this.lastZoomK = zoomEvent.transform.k;

        let offsetHelper = new OffsetHelper(this.lastDataContainers);

        this.coinContainer.selectAll("image")
            .filter(function (d) { return offsetHelper.has(d.dc); })
            .attr("width", CoinScatter.COIN_WIDTH * zoomEvent.transform.k)
            .attr("x", (d) => {
                return new_xScale(d.dc.x) - CoinScatter.COIN_WIDTH/2* zoomEvent.transform.k;
            })
            .attr("y", (d) => {
                return new_yScale(d.dc.y) + 5*CoinScatter.COIN_OFFSET * zoomEvent.transform.k + offsetHelper.getOffset(d.dc) * zoomEvent.transform.k *(CoinScatter.COIN_WIDTH);
            });

    }

}