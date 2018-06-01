import {CoinsLineChartSample} from "./coins-line-chart-sample/coins-line-chart-sample";
import {CoinsLineChartSampleDetails} from "./coins-line-chart-sample/coins-line-chart-sample-details";
import {CoinsLineChartSampleList} from "./coins-line-chart-sample/coins-line-chart-sample-list";

import "./layout.scss";
import "./colors.scss";

const chart = new CoinsLineChartSample();
const details = new CoinsLineChartSampleDetails();
const list = new CoinsLineChartSampleList();

chart.registerSubscriber(details);
chart.registerSubscriber(list);

list.registerSubscriber(details);

chart.render("#chart");
details.render("#details");
list.render("#list");