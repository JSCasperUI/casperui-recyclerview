import {View} from "@casperui/core/view/View";

export class ViewHolder {
    mHolder:View;
    lastIndex = -1;
    cellIndex = -1;
    constructor(holder:View){
        this.mHolder = holder;
    }
}