import {CoinsLineChartSample} from "./coins-line-chart-sample/coins-line-chart-sample";
import {CoinsLineChartSampleDetails} from "./coins-line-chart-sample/coins-line-chart-sample-details";
import {CoinsLineChartSampleList} from "./coins-line-chart-sample/coins-line-chart-sample-list";
import {CoinsLineChartSampleTimeFilter} from "./coins-line-chart-sample/coins-line-chart-sample-time-filter";

import "./layout.scss";
import "./colors.scss";

const chart = new CoinsLineChartSample();
const details = new CoinsLineChartSampleDetails();
const list = new CoinsLineChartSampleList();
const epoches = new CoinsLineChartSampleTimeFilter();

epoches.onFilterChange$.subscribe((epoche)=>{
    chart.filter("#chart", epoche.from, epoche.to);
    list.filter("#list", epoche.from, epoche.to);
});

chart.onMouseOverDot$.subscribe(details.setDetails);
chart.onMouseOverDot$.subscribe(list.highlight);
chart.onMouseOverDot$.subscribe((coin)=>{ epoches.highlight(coin.von.getFullYear(), coin.bis.getFullYear())});

chart.onMouseOutDot$.subscribe(details.clearDetails);
chart.onMouseOutDot$.subscribe(list.clearHighlight);
chart.onMouseOutDot$.subscribe(epoches.clearHighlight);

list.onMouseOverListElement$.subscribe(details.setDetails);
list.onMouseOverListElement$.subscribe(chart.highlightDot);
list.onMouseOverListElement$.subscribe((coin)=>{ epoches.highlight(coin.von.getFullYear(), coin.bis.getFullYear())});

list.onMouseOutListElement$.subscribe(chart.unhighlightDot);
list.onMouseOutListElement$.subscribe(details.clearDetails);
list.onMouseOutListElement$.subscribe(epoches.clearHighlight);

chart.render("#chart");
details.render("#details");
list.render("#list");
epoches.render("#epoches");