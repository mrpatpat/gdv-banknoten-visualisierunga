import {DSVParsedArray, DSVRowString} from "d3-dsv";
import * as d3 from "d3";

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
    bis: Date
}

export class CsvService {

    private static parseTime(time: string): Date {
        return d3.isoParse(time);
    }

    public static async parse(fileName: string): Promise<DSVParsedArray<CoinRow>> {
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
                von: CsvService.parseTime(rawRow["von"]),
                bis: CsvService.parseTime(rawRow["bis"])
            }
        })
    }

}