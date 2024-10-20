import {ViewHolder} from "@casperui/recyclerview/widget/ViewHolder";
import {AdapterDataObservable} from "@casperui/recyclerview/widget/AdapterDataObservable";
import {View} from "@casperui/core/view/View";
import {AdapterDataObserver} from "@casperui/recyclerview/widget/AdapterDataObserver";


export abstract class Adapter<T extends ViewHolder> {
    mObservable = new AdapterDataObservable();
    constructor(config?:any) {

    }



    abstract createViewHolder(parent:View,viewType:number):T


    abstract onBindViewHolder(holder:T,position:number):void

    abstract getItemCount():number


    hasObservers():boolean {
        return this.mObservable.hasObservers()
    }


    registerAdapterDataObserver(observer:AdapterDataObserver) {
        this.mObservable.registerObserver(observer);
    }

    unregisterAdapterDataObserver(observer:AdapterDataObserver) {
        this.mObservable.unregisterObserver(observer)
    }



    notifyDataSetChanged() { this.mObservable.notifyChanged(); }


    notifyItemChanged( position:number) { this.mObservable.notifyItemRangeChanged(position, 1); }


    notifyItemRangeChanged( positionStart:number,  itemCount:number) { this.mObservable.notifyItemRangeChanged(positionStart, itemCount); }


    notifyItemInserted(position:number) {
        this.mObservable.notifyItemRangeInserted(position, 1);
    }


    notifyItemMoved( fromPosition:number,  toPosition:number) {
        this.mObservable.notifyItemMoved(fromPosition, toPosition);
    }


    notifyItemRangeInserted( positionStart:number,  itemCount:number) {
        this.mObservable.notifyItemRangeInserted(positionStart, itemCount);
    }

    notifyItemRemoved( position:number) {
        this.mObservable.notifyItemRangeRemoved(position, 1);
    }


    notifyItemRangeRemoved( positionStart:number,  itemCount:number) {
        this.mObservable.notifyItemRangeRemoved(positionStart, itemCount);
    }

}
