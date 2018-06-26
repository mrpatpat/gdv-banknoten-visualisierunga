import * as d3 from "d3";
import {CoinScatter} from "./coin-scatter";

export class Axis {

    private xAxis;
    private yAxis;

    private axisContainer;

    constructor(private container, xScale, yScale) {

        this.axisContainer = this.container.append("g").attr("id", "axis-container");

        this.axisContainer.append("text")
            .attr("class", "axis-label")
            .attr("x", CoinScatter.WIDTH / 2)
            .attr("y", CoinScatter.HEIGHT + 20)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Jahr");

        this.axisContainer.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - CoinScatter.MARGIN)
            .attr("x", 0 - (CoinScatter.HEIGHT / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Kaufkraft in Euro pro Mark");


        this.yAxis = this.axisContainer.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale));


        this.xAxis = this.axisContainer.append("g")
            .attr("transform", "translate(0," + CoinScatter.HEIGHT + ")")
            .attr("class", "x-axis")
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%y")));

    }

    public onZoom(xScale, yScale, new_xScale, new_yScale) {
        this.xAxis.call(d3.axisBottom(xScale).scale(new_xScale));
        this.yAxis.call(d3.axisLeft(yScale).scale(new_yScale));
    }

    public onUpdate(xScale, yScale) {
        this.axisContainer.select(".x-axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%y")));

        this.axisContainer.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(yScale));
    }

}