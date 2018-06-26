import * as d3 from "d3";
import {CoinRow} from "../../service/csv-service";
import {DataService} from "../../service/data-service";
import {EuroReferenceLine} from "./euro-reference-line";
import {Axis} from "./axis";
import {ValueGraph} from "./value-graph";
import {Circles} from "./circles";
import {Coins} from "./coins";
import {CoinBoxes} from "./coin-boxes";
import {CoinGroupTooltip} from "./coin-group-tooltip";

export interface DataContainer {
    x: Date,
    y: number,
    coinrows: CoinRow[]
}

export class CoinScatter {

    public static MARGIN = 60;
    public static WIDTH = 1370 - 2 * CoinScatter.MARGIN;
    public static HEIGHT = 800 - 2 * CoinScatter.MARGIN;
    public static DOT_RADIUS = 2;
    public static COIN_WIDTH = 8;
    public static COIN_OFFSET = 1;

    private container;
    private xScale;
    private yScale;
    private zoom;

    private euroReferenceLine: EuroReferenceLine;
    private axis: Axis;
    private valueGraph: ValueGraph;
    private circles: Circles;
    private coins: Coins;
    private coinBoxes: CoinBoxes;

    constructor(private selector: string, private data: CoinRow[] = []) {

        this.update = this.update.bind(this);
        this.updateDomains = this.updateDomains.bind(this);
        this.onZoom = this.onZoom.bind(this);
        this.highlight = this.highlight.bind(this);

        DataService.data$.subscribe(data => this.update(data));
        DataService.hovered$.subscribe(data => this.highlight(data));

        this.container = this.initContainer(selector);
        this.xScale = this.initScaleX();
        this.yScale = this.initScaleY();

        this.axis = new Axis(this.container, this.xScale, this.yScale);
        this.euroReferenceLine = new EuroReferenceLine(this.container, this.yScale);
        this.valueGraph = new ValueGraph(this.container);
        this.circles = new Circles(this.container);
        this.coins = new Coins(this.container);
        this.coinBoxes = new CoinBoxes(this.container);

        this.coins.hover$.subscribe((d)=>{
            DataService.hover(d);
        });

        this.updateDomains([]);
        this.update([]);

    }

    public onZoom() {
        let new_yScale = d3.event.transform.rescaleY(this.yScale);
        let new_xScale = d3.event.transform.rescaleX(this.xScale);
        this.axis.onZoom(this.xScale, this.yScale, new_xScale, new_yScale);
        this.euroReferenceLine.onZoom(new_yScale);
        this.circles.onZoom(d3.event, new_xScale, new_yScale);
        this.coins.onZoom(d3.event, new_xScale, new_yScale);
        this.coinBoxes.onZoom(d3.event, new_xScale, new_yScale);
        this.valueGraph.onZoom(d3.event);
    }

    public async update(data: CoinRow[]) {
        this.resetZoom();
        this.updateDomains(data);
        this.axis.onUpdate(this.xScale, this.yScale);
        this.euroReferenceLine.onUpdate(this.yScale);
        let dataContainers = this.buildCombinedDataContainers(data);
        this.coinBoxes.onUpdate(dataContainers, this.xScale, this.yScale);
        this.circles.onUpdate(dataContainers, this.xScale, this.yScale);
        this.valueGraph.onUpdate(dataContainers, this.xScale, this.yScale);
        this.coins.onUpdate(dataContainers, data, this.xScale, this.yScale);
    }

    private initScaleY() {
        return d3.scaleLog().base(10).range([CoinScatter.HEIGHT, 0]);
    }

    private initScaleX() {
        return d3.scaleTime().range([0, CoinScatter.WIDTH]);
    }

    private initContainer(selector: string) {

        this.zoom = d3.zoom().on("zoom", this.onZoom);

        return d3
            .select(selector)
            .append("svg")
            .attr("width", CoinScatter.WIDTH + CoinScatter.MARGIN + CoinScatter.MARGIN)
            .attr("height", CoinScatter.HEIGHT + CoinScatter.MARGIN + CoinScatter.MARGIN)
            .call(this.zoom)
            .append("g")
            .attr("transform", "translate(" + CoinScatter.MARGIN + "," + CoinScatter.MARGIN + ")");

    }

    private resetZoom() {
        d3.select("svg")
            .transition()
            .duration(1000)
            .call(this.zoom.translateTo, CoinScatter.WIDTH / 2 + CoinScatter.MARGIN, CoinScatter.HEIGHT / 2 + CoinScatter.MARGIN)
            .call(this.zoom.scaleTo, 1)
            .on("end", () => {
                this.zoom.transform(d3.select("svg"), d3.zoomIdentity.scale(1));
            });
    }

    private buildCombinedDataContainers(data: CoinRow[]) {
        let dataContainers: DataContainer[] = [];

        // build all combinations by euro/year
        data.forEach((d) => {
            let year = d.von;
            let euro = d.euro;
            let currDc = {
                x: year,
                y: euro,
                coinrows: []
            };
            dataContainers.push(currDc);
        });

        // remove duplicates
        dataContainers = dataContainers.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj["x"].getFullYear() + mapObj["y"]).indexOf(obj["x"].getFullYear() + obj["y"]) === pos;
        });

        // add into its container
        data.forEach((d) => {
            let year = d.von;
            let euro = d.euro;
            dataContainers.forEach((dc) => {
                if (year.getFullYear() === dc.x.getFullYear() && euro === dc.y) {
                    d.dc = dc;
                    dc.coinrows.push(d);
                }
            });
        });
        return dataContainers;
    }

    private highlight(data: CoinRow) {
        this.coins.onHighlight(data);
    }

    private updateDomains(data: CoinRow[]) {
        this.xScale.domain(d3.extent(data, (d: CoinRow) => {
            return d.von
        }));
        this.yScale.domain(d3.extent(data, (d: CoinRow) => {
            return d.euro
        }));
    }

}




