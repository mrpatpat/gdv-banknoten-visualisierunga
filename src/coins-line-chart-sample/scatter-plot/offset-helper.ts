/**
 * Created by Adrian on 26.06.2018.
 */

export class OffsetHelper {

    private offsets = {};

    constructor(private dataContainers) {
        this.offsets = this.initOffsets(dataContainers);
    }

    public getOffset(dataContainer) {
        return this.offsets[dataContainer.x.getFullYear()+""][dataContainer.y+""]++;
    }

    public initOffsets(dataContainers) {
        let fn =  (dc) => {
            if (!this.offsets[dc.x.getFullYear() + ""]) {
                this.offsets[dc.x.getFullYear() + ""] = {};
            }
            this.offsets[dc.x.getFullYear() + ""][dc.y + ""] = 0;
        };
        if(dataContainers.select){
            dataContainers.select(fn);
        } else {
            dataContainers.forEach(fn);
        }
        return this.offsets;
    }

}