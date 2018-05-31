import "../assets/coins.csv";
import * as d3 from "d3";
import {DSVParsedArray, DSVRowString} from "d3-dsv";

interface CoinRow {
    id: string,
    name: string,
    nominal: string,
    pfennig: number,
    hoehe: number,
    breite: number,
    thumb: string,
    image: string,
    euro: number,
    von: Date,
    bis: Date
}

export class CoinsLineChartSample {

    private margin;
    private width;
    private height;

    constructor(width: number, height: number, margin: number) {
        this.margin = margin;
        this.width = width;
        this.height = height;
    }

    public async render(selector: string) {
        const transformed = await this.transformCsv("coins.csv");
        await this.renderFrom(transformed, selector);
    }

    private parseTime(time: string): Date {
        return d3.isoParse(time);
    }

    private async transformCsv(fileName: string) : Promise<DSVParsedArray<CoinRow>> {
        return await d3.csv<CoinRow>(fileName, (rawRow: DSVRowString) => {
            return {
                id: rawRow["id"],
                name: rawRow["name"],
                nominal: rawRow["nominal"],
                pfennig: parseInt(rawRow["pfennig"]),
                hoehe: parseFloat(rawRow["hoehe"].replace(',', '.')),
                breite: parseFloat(rawRow["breite"].replace(',', '.')),
                thumb: rawRow["thumb"],
                image: rawRow["image"],
                euro: parseFloat(rawRow["euro"].replace(',', '.')),
                von: this.parseTime(rawRow["von"]),
                bis: this.parseTime(rawRow["bis"])
            }
        })
    }

    private async renderFrom(csvData: DSVParsedArray<CoinRow>, selector: string) {

        const svg = d3.select(selector).append("svg")
            .attr("width", this.width + this.margin + this.margin)
            .attr("height", this.height + this.margin + this.margin)
            .append("g")
            .attr("transform",
                "translate(" + this.margin + "," + this.margin + ")");

        let rangeX = d3.scaleTime().range([0, this.width]);
        let rangeY = d3.scaleLog().base(10).range([this.height, 0]);

        rangeX.domain(d3.extent(csvData, function (d) {
            return d.von;
        }));

        rangeY.domain([Math.exp(0), Math.exp(2)]);

        svg.selectAll("dot")
            .data(csvData)
            .enter().append("circle")
            .attr("r", 4)
            .attr("cx", function (d) {
                return rangeX(d.von);
            })
            .attr("cy", function (d) {
                return rangeY(d.euro);
            });

        svg.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(rangeX));

        svg.append("g")
            .call(d3.axisLeft(rangeY));

    }

}




