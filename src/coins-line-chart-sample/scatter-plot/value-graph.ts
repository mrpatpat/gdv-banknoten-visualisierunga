import {DataContainer} from "./coin-scatter";
import * as d3 from "d3";

export class ValueGraph {

    private graphContainer;

    constructor(private container) {
        this.graphContainer = this.container.append("g").attr("id", "graph-container");

        this.graphContainer.append("path")
            .attr("class", "graph");
    }

    public onUpdate(dataContainers: DataContainer[], xScale, yScale) {

        let valueline = d3.line<DataContainer>()
            .x((d) => { return xScale(d.x); })
            .y((d) => { return yScale(d.y); })
            .curve(d3.curveMonotoneX);

        this.graphContainer.selectAll(".graph")
            .data([dataContainers.sort((a,b)=>{
                if(a.x.getFullYear()-b.x.getFullYear() === 0) {
                    return b.y-a.y
                }
                return a.x.getFullYear()-b.x.getFullYear()
            })])
            .attr("d", valueline);

    }

    public onZoom(zoomEvent) {
        this.graphContainer.selectAll(".graph").attr('transform', 'translate(' + zoomEvent.transform.x +','+ zoomEvent.transform.y + ') scale(' +zoomEvent.transform.k + ')');
    }
}