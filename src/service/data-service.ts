import {Subject} from "rxjs/internal/Subject";
import {CoinRow} from "./csv-service";

export class DataService {

    private static data = [];
    public static data$ = new Subject<CoinRow[]>();

    private static selected;
    public static selected$ = new Subject<CoinRow>();

    private static hovered;
    public static hovered$ = new Subject<CoinRow>();

    public static hover(data: CoinRow) {
        console.log(
            data
        );
        DataService.hovered = data;
        DataService.hovered$.next(DataService.hovered);
    }

    public static select(data: CoinRow) {
        DataService.selected = data;
        DataService.selected$.next(DataService.selected);
    }

    public static update(data: CoinRow[]) {
        DataService.data = data;
        DataService.data$.next(DataService.data);
    }

    public static filterByTime(from: number, to: number) {
        let filtered = DataService.data.filter((coin) => {return coin.von.getFullYear() >= from && coin.bis.getFullYear() <= to});
        DataService.data$.next(filtered);
    }

}