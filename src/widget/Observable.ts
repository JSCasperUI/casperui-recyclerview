
export class Observable<T> {
    mObservers:Array<T> = []
    constructor() {
        this.mObservers = []
    }

    registerObserver(observer:T) {
        if (this.mObservers.indexOf(observer)>=0) {
            return;
        }
        this.mObservers.push(observer)
    }

    unregisterObserver(observer:T) {
        let index = this.mObservers.indexOf(observer)
        if (index>=0){
            this.mObservers.splice(index,1)
        }
    }

    unregisterAll() {
        this.mObservers = []
    }
}