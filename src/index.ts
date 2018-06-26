import {CoinScatter} from "./coins-line-chart-sample/scatter-plot/coin-scatter";
import "./layout.scss";
import {CsvService} from "./service/csv-service";
import {DataService} from "./service/data-service";
import {EpocheFilter} from "./coins-line-chart-sample/epoche-filter";
import {CoinsList} from "./coins-line-chart-sample/coins-list";
import {CoinDetails} from "./coins-line-chart-sample/coin-details";

new CoinScatter("#chart");
new EpocheFilter("#epoche-filter-container");
new CoinsList("#coins-list-container");
new CoinDetails("#coin-details-container");

// Initial call
CsvService.getCoins().then((data)=>{
    DataService.update(data);
});
