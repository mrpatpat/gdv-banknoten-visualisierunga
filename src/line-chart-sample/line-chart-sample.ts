import "./data.csv";
import * as d3 from "d3";
import {DSVParsedArray, DSVRowString} from "d3-dsv";

interface Row {
    date: Date,
    close: number
}

export class LineChartSample {

    private margin;
    private width;
    private height;
    private rangeX;
    private rangeY;

    constructor(width: number, height: number, margin: number) {
        this.margin = margin;
        this.width = width;
        this.height = height;
        this.rangeX = d3.scaleTime().range([0, width]);
        this.rangeY = d3.scaleLinear().range([height, 0]);

    }

    public async render(selector: string) {
        const transformed = await this.transformCsv("data.csv");
        console.log(transformed);
        await this.renderFrom(transformed, selector);
    }

    private parseTime(time: string): Date {
        return d3.timeParse("%d-%b-%y")(time);
    }

    private async transformCsv(fileName: string) : Promise<DSVParsedArray<Row>> {
        return await d3.csv<Row>(fileName, (rawRow: DSVRowString) => {
            return {
                date: this.parseTime(rawRow["date"]),
                close: +rawRow["close"]
            }
        })
    }

    private async renderFrom(csvData: DSVParsedArray<Row>, selector: string) {

        const _this = this;

        const svg = d3.select(selector).append("svg")
            .attr("width", this.width + this.margin + this.margin)
            .attr("height", this.height + this.margin + this.margin)
            .append("g")
            .attr("transform",
                "translate(" + this.margin + "," + this.margin + ")");

        this.rangeX.domain(d3.extent(csvData, function (d) {
            return d.date;
        }));

        this.rangeY.domain([0, d3.max(csvData, function (d) {
            return d.close;
        })]);

        svg.selectAll("dot")
            .data(csvData)
            .enter().append("circle")
            .attr("r", 4)
            .attr("cx", function (d) {
                return _this.rangeX(d.date);
            })
            .attr("cy", function (d) {
                return _this.rangeY(d.close);
            });

        svg.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.rangeX));

        svg.append("g")
            .call(d3.axisLeft(this.rangeY));

    }

}




