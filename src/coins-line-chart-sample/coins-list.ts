import * as d3 from "d3";
import "../assets/coins.csv";
import {CoinRow} from "../service/csv-service";
import {DataService} from "../service/data-service";

export class CoinsList {

    constructor(selector: string) {

        d3
            .select(selector)
            .append("select")
            .attr("id", "coins-list")
            .attr("multiple", true)
            .attr("class", "form-control");

        this.update = this.update.bind(this);
        DataService.data$.subscribe(this.update);

    }

    update(data: CoinRow[]) {
        let builder = d3.select("#coins-list").html("");
        data.forEach((n) => {
            builder
                .insert("option")
                .attr("value", n.id)
                .html(n.name);
        });
    }

}