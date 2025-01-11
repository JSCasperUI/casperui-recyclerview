import {View} from "@casperui/core/view/View";

export class ViewHolder {
    mHolder:View;
    mLastIndex = -1;
    mCellIndex = -1;
    constructor(holder:View){
        this.mHolder = holder;
    }
}