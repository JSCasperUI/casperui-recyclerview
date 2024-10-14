import {Observable} from "@casperui/recyclerview/widget/Observable";
import {AdapterDataObserver} from "@casperui/recyclerview/widget/AdapterDataObserver";


export class AdapterDataObservable extends Observable<AdapterDataObserver> {
    constructor() {
        super();
    }

    hasObservers():boolean {
        return this.mObservers.length > 0;
    }

    notifyChanged() {
        for (let i = 0; i < this.mObservers.length; i++) {
            this.mObservers[i].onChanged();
        }
    }

    notifyItemRangeChanged( positionStart:number,itemCount:number) {
        for (let i = 0; i < this.mObservers.length; i++) {
            this.mObservers[i].onItemRangeChanged(positionStart, itemCount);
        }
    }


    notifyItemRangeInserted( positionStart:number,  itemCount:number) {
        for (let i = 0; i < this.mObservers.length; i++) {
            this.mObservers[i].onItemRangeInserted(positionStart, itemCount);
        }
    }

    notifyItemRangeRemoved( positionStart:number,  itemCount:number) {
        for (let i = 0; i < this.mObservers.length; i++) {
            this.mObservers[i].onItemRangeRemoved(positionStart, itemCount);
        }
    }

    notifyItemMoved( fromPosition:number, toPosition:number) {
        for (let i = 0; i < this.mObservers.length; i++) {
            this.mObservers[i].onItemRangeMoved(fromPosition, toPosition, 1);
        }
    }
}