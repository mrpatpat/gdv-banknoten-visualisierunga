import * as d3 from "d3";
import "../assets/coins.csv";

import {DataService} from "../service/data-service";

export interface Epoche {
    name: string;
    from: number;
    to: number;
}

export class EpocheFilter {

    private static EPOCHES: Epoche[] = [
        { name: "Alle", from: 0, to: 9999 },
        { name: "Reichsmark", from: 1924, to: 1948 },
        { name: "Rentenmark", from: 1923, to: 1924 },
        { name: "Mark", from: 1871, to: 1923 }
    ];

    onEpocheChange() {
        let epocheName = d3.select('#epoche-filter').property('value');
        EpocheFilter.EPOCHES.forEach((e)=>{
            if(e.name === epocheName){
                DataService.filterByTime(e.from, e.to);
            }
        });
    }

    constructor(private selector: string) {

        let builder = d3
            .select(selector)
            .append("select")
            .attr("id", "epoche-filter")
            .attr("class", "form-control")
            .on('change', this.onEpocheChange);

        EpocheFilter.EPOCHES.forEach((epoche) => {
            builder
                .insert("option")
                .attr("value", epoche.name)
                .html(epoche.name);
        });

    }

}