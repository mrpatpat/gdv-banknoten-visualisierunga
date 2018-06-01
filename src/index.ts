import {CoinsLineChartSample} from "./coins-line-chart-sample/coins-line-chart-sample";
import {CoinsLineChartSampleDetails} from "./coins-line-chart-sample/coins-line-chart-sample-details";
import {CoinsLineChartSampleList} from "./coins-line-chart-sample/coins-line-chart-sample-list";

import "./layout.scss";
import "./colors.scss";

const chart = new CoinsLineChartSample();
const details = new CoinsLineChartSampleDetails();
const list = new CoinsLineChartSampleList();

chart.onMouseOverDot$.subscribe(details.setDetails);
chart.onMouseOverDot$.subscribe(list.highlight);

chart.onMouseOutDot$.subscribe(details.clearDetails);
chart.onMouseOutDot$.subscribe(list.clearHighlight);

list.onMouseOverListElement$.subscribe(details.setDetails);
list.onMouseOutListElement$.subscribe(details.clearDetails);

chart.render("#chart");
details.render("#details");
list.render("#list");