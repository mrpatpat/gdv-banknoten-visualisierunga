import * as d3 from "d3";
import {CoinRow} from "../service/csv-service";
import {DataService} from "../service/data-service";

export class CoinDetails {

    private container;

    constructor(selector: string) {
        this.setDetails = this.setDetails.bind(this);
        this.clearDetails = this.clearDetails.bind(this);

        DataService.hovered$.subscribe((c)=>{
           if(c){
               this.setDetails(c);
           } else {
               this.clearDetails();
           }
        });

        this.container = d3
            .select(selector)
            .append("div")
            .attr("id", "coin-details")
            .style("opacity", 0);

    }

    public setDetails(data: CoinRow) {
        if (this.container) {
            this.container
                .html(this.buildTooltipHtml(data))
                .transition()
                .duration(200)
                .style("opacity", 1)
        }
    }

    public clearDetails() {
        if (this.container) {
            this.container
                .transition()
                .duration(200)
                .style("opacity", 0);
        }
    }

    private buildTooltipHtml(data: CoinRow) {
        return "<h6>" + data.nominal + "</h6>" +
            "Erscheinungsjahr: " + data.von.getFullYear() + "<br>" +
            "Heutiger Banknotenwert: " + (data.euro * data.pfennig / 100) + "€" + "<br>" +
            "1 Mark" + " =" + " "+data.euro+"€" + "<br>" +
            "Höhe:          " + data.hoehe+ "mm" + "<br>" +
            "Breite:          " + data.breite+ "mm" + "<br><br>" +
            "<img src='" + data.image + "'>";
    }

}
