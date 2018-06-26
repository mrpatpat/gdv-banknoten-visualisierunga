import * as d3 from "d3";
import "../assets/coins.csv";

import * as noUiSlider from "nouislider";

import {DataService} from "../service/data-service";

export interface Epoche {
    name: string;
    from: number;
    to: number;
}

export class EpocheFilter {

    private static EPOCHES: Epoche[] = [
        { name: "Alle", from: 1880, to: 1960 },
        { name: "Reichsmark", from: 1924, to: 1925 },
        { name: "Rentenmark", from: 1923, to: 1924 },
        { name: "Mark", from: 1871, to: 1923 }
    ];

    private container;

    constructor(private selector: string) {

        let builder = d3
            .select(selector)
            .append("div")
            .attr("id", "epoche-filter");

        this.container = builder;

        builder
            .append("div")
            .attr("id", "time-filter");

        let slider = document.getElementById("time-filter");

        noUiSlider.create(slider, {
            start: [1880, 1960],
            connect: true,
            range: {
                'min': 1880,
                'max': 1960
            },
            step: 1,
            tooltips: true,
            behaviour: "drag",
            format: {
                to: function ( value ) {
                    return Math.trunc(value);
                },
                from: function ( value ) {
                    return Math.trunc(value);
                }
            }
        });

        (slider as any).noUiSlider.on("update", (f) => {
            DataService.filterByTime(f[0],f[1]);
            this.highlightEpoche(f[0],f[1]);
        });

        builder = builder
            .append("div")
            .attr("id", "epoche-buttons");

        EpocheFilter.EPOCHES.forEach((e)=>{
            builder
                .append("a")
                .attr("class", "epoche-link")
                .attr("id", "epoche-link-"+e.name)
                .html(e.name)
                .on("click", ()=>{
                    DataService.filterByTime(e.from, e.to);
                    (slider as any).noUiSlider.set([e.from, e.to]);
                });
        });

        this.highlightEpoche(1880,1960);

    }

    private highlightEpoche(from, to) {
        this.container.selectAll(".epoche-link").classed("highlight", false);
        EpocheFilter.EPOCHES.forEach((e)=>{
            if(e.from === from && e.to === to) {
                this.container.select("#epoche-link-"+e.name).classed("highlight", true);
            }
        });
    }

}