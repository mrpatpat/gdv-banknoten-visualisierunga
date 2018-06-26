import {DSVParsedArray, DSVRowString} from "d3-dsv";
import * as d3 from "d3";
import {CoinScatter, DataContainer} from "../coins-line-chart-sample/scatter-plot/coin-scatter";

export interface CoinRow {
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
    bis: Date,
    dc?: DataContainer
}

export class CsvService {

    private static parseTime(time: string): Date {
        return d3.isoParse(time);
    }

    public static async getCoins(): Promise<CoinRow[]> {
        let parsed = await d3.csvParse<any>(require("../assets/coins.csv"), (rawRow: DSVRowString) => {
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
                von: CsvService.parseTime(rawRow["von"]),
                bis: CsvService.parseTime(rawRow["bis"])
            }
        });

        return parsed;
    }

}