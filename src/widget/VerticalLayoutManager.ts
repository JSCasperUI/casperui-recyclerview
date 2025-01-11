import {LayoutManager} from "@casperui/recyclerview/widget/LayoutManager";
import {Context} from "@casperui/core/content/Context";

export class VerticalLayoutManager extends LayoutManager {
    scrollOffsetY = 0
    constructor(context:Context) {
        super(context);

    }

    scrollToBottom() {
        let itemsCount = this.mAdapter.getItemCount()
        if (this.getChildCount() === 0 || this.getMeasuredHeight() === 0 || itemsCount < this.viewsPoolSize) {
            return;
        }


        let mWindowHeight = this.getMeasuredHeight()
        let distance = this.mHolderSize;
        let lastView = this.getLastVisibleHolder();


        let nextIndex = this.getLastVisibleHolder().mLastIndex + 1
        if (nextIndex >= itemsCount) {
            return;
        }
        if (lastView.mHolder.getTop() === 0.0) { //&& lastView.holder->mBottom == 0){
            return;
        }
        while (true) {
            nextIndex = this.getLastVisibleHolder().mLastIndex + 1
            let currentIndex = Math.floor(this.getScrollY() / this.mHolderSize)
            let compute = (currentIndex * this.mHolderSize)

            if (this.getScrollY() + mWindowHeight >= lastView.mHolder.getTop()) {
                let countFill = Math.floor(((this.getScrollY() + mWindowHeight) - lastView.mHolder.getTop() + distance) / this.mHolderSize)
                if (countFill > this.viewsPoolSize) {
                    let offsetHolder = 0;
                    for (let i = currentIndex; i < this.viewsPoolSize + currentIndex; i++) {

                        if (i >= itemsCount) {
                            this.scrollOffsetY = compute
                            for (let x = i - currentIndex; x < this.poolViews.length; x++) {
                                this.poolViews[x].mHolder.setVisibility(false)
                                this.poolViews[x].mLastIndex = -1
                            }
                            return;
                        }
                        this.poolViews[i - currentIndex].mHolder.setVisibility(true);
                        this.mAdapter.onBindViewHolder(this.poolViews[i - currentIndex], i);
                        this.poolViews[i - currentIndex].mLastIndex = i
                        let hView = this.poolViews[i - currentIndex].mHolder
                        hView.setTop(compute + offsetHolder)
                        offsetHolder += this.mHolderSize;
                    }
                    this.scrollOffsetY = compute;
                    return;

                }


                if (nextIndex + 1 > itemsCount) {
                    return;
                }
                if (this.getLastVisibleHolder().mLastIndex === nextIndex) {
                    break;
                }
                lastView = this.getLastVisibleHolder();

                let newLastView = this.getFirstVisibleHolder();
                this.rotateRight();
                this.mAdapter.onBindViewHolder(newLastView, nextIndex);
                newLastView.mLastIndex = nextIndex


                newLastView.mHolder.setTop(lastView.mHolder.getTop() + this.mHolderSize)


                this.scrollOffsetY = this.getFirstVisibleHolder().mHolder.getTop()
            } else {
                break;
            }
        }
    }

    scrollToTop() {
        let itemsCount = this.mAdapter.getItemCount()
        if (this.getChildCount() === 0 || this.getMeasuredHeight() === 0 || itemsCount < this.viewsPoolSize || this.getScrollY() < 0) {
            return
        }
        let mWindowHeight = this.getMeasuredHeight();
        let distance = this.mHolderSize * 2;

        let currentIndex = Math.floor(this.getScrollY() / this.mHolderSize)
        let compute = ((currentIndex * this.mHolderSize) )

        while (true) {
            let lastView = this.getFirstVisibleHolder()
            let localIndex = lastView.mLastIndex - 1
            if (this.getScrollY() <= lastView.mHolder.getTop() && localIndex >= 0) {
                let countFill = Math.abs(Math.floor(((this.getScrollY() + mWindowHeight) - lastView.mHolder.getTop() + distance) / this.mHolderSize));
                if (countFill > this.viewsPoolSize) {
                    let offsetY = compute
                    for (let i = currentIndex; i < this.viewsPoolSize + currentIndex; i++) {

                        const holder = this.poolViews[i - currentIndex]
                        holder.mHolder.setVisibility(true)
                        this.mAdapter.onBindViewHolder(holder, i)
                        holder.mLastIndex = i

                        holder.mHolder.setTop(offsetY)
                        offsetY += this.mHolderSize
                    }
                    this.scrollOffsetY = compute;
                    return;

                }
                lastView = this.getFirstVisibleHolder();
                if (lastView.mLastIndex === localIndex) {
                    break;
                }
                let newLastView = this.getLastVisibleHolder();
                this.rotateLeft()
                newLastView.mHolder.setTop(lastView.mHolder.getTop() - this.mHolderSize)
                this.mAdapter.onBindViewHolder(newLastView, localIndex);
                newLastView.mLastIndex = localIndex;
                this.scrollOffsetY = this.getFirstVisibleHolder().mHolder.getTop()

            } else {
                break;
            }
        }
    }


    updateViewPoolSize(isResize:boolean) {
        let isBindHolder = false
        let firstInit = false
        let windowHeight = window.screen.height;
        if (windowHeight === 0) {
            return false
        }
        this.clearHolders()
        let start = 1
        if (this.getChildCount() === 0) {
            let firstHolder = this.mAdapter?.createViewHolder(this.getParent(), 0)
            this.addHolder(firstHolder)
            this.mHolderSize = firstHolder.mHolder.getHeight()
            if (this.mHolderSize === 0) {
                return
            }

            this.setupScroll(this.mHolderSize * this.mAdapter.getItemCount())
            this.viewsPoolSize = Math.ceil(windowHeight / this.mHolderSize) + this.POOL_OFFSET_SIZE
        } else {
            this.mHolderSize = this.poolViews[0].mHolder.getHeight()
            let tmp = Math.ceil(windowHeight / this.mHolderSize) + this.POOL_OFFSET_SIZE
            if (tmp > this.viewsPoolSize) {
                start = this.viewsPoolSize;
                this.viewsPoolSize = tmp;
            } else {
                return false
            }

        }
        let nextIndex = Math.ceil((this.getScrollY() + (this.getChildCount() * this.mHolderSize) + this.mHolderSize) / this.mHolderSize) - this.POOL_OFFSET_SIZE + 1;

        if (!isResize) {
            nextIndex = start;
        } else {
            let index = this.getLastHolder().mLastIndex
            if (index > this.mAdapter.getItemCount()) {
                return false
            }
        }
        for (let i = start; i < this.viewsPoolSize; i++) {
            let holder = this.mAdapter.createViewHolder(this.getParent(), 0);
            let index = this.getLastVisibleHolder().mLastIndex + 1;
            this.addHolder(holder)
            isBindHolder = true
            if (isResize) {
                if (index + 1 > this.mAdapter.getItemCount()) {

                } else {
                    const c = this.getLastVisibleHolder().mHolder;
                    this.mAdapter.onBindViewHolder(holder, index);
                    holder.lastIndex = i
                    holder.mHolder.setTop(c.getTop() + this.mHolderSize)
                    // holder.mHolder.setParameter("localIndex", index.toString())
                }
            }

            nextIndex++
        }
        return isBindHolder;
    }


    onItemRangeChanged(start:number,count:number){
        if (count>1){
            this.setOnChanged()
            return
        }
        for (let i = 0; i < this.poolViews.length; i++) {
            if (this.poolViews[i].mLastIndex === start){
                this.mAdapter.onBindViewHolder(this.poolViews[i],start)
                break
            }

        }
    }

    setOnChanged() {
        super.setOnChanged()

        if (this.mHolderSize === 0) {
            this.updateViewPoolSize(false)
            if (this.mHolderSize === 0) {
                return ;
            }
        }
        let items = this.mAdapter.getItemCount()

        let startIndex = this.getFirstHolder().mLastIndex
        if (startIndex < 0) {
            startIndex = 0
        }
        let firstVisibleItem = this.getFirstVisibleHolder()
        let firstVisibleLastIndex = firstVisibleItem.mLastIndex
        let count = Math.min(items, this.viewsPoolSize)
        for (let i = 0; i < this.poolViews.length; i++) {
            this.poolViews[i].mHolder.setVisibility(false)
            this.poolViews[i].mLastIndex = -1
        }
        if (firstVisibleItem && firstVisibleLastIndex !== -1){
            let startIndex = firstVisibleLastIndex
            let startOffset = firstVisibleItem.mHolder.getTop()
            for (let i = startIndex; i < Math.min(count + startIndex,items); i++) {
                let idx = i - startIndex
                this.poolViews[idx].mHolder.setVisibility(true)
                this.poolViews[idx].mHolder.setOpacity(1)
                this.mAdapter.onBindViewHolder(this.poolViews[idx], i)
                this.poolViews[idx].mLastIndex = i
                this.poolViews[idx].mHolder.setTop(startOffset)
                startOffset += this.mHolderSize

            }
        }else{
            let currentIndex = Math.floor(this.getScrollY() / this.mHolderSize)
            let offset = this.getScrollY() % this.mHolderSize
            let compute = (currentIndex * this.mHolderSize)
            let offsetHolder = compute;

            for (let i = currentIndex; i < this.viewsPoolSize + currentIndex; i++) {
                if (i >= items) {
                    this.scrollOffsetY = compute
                    return;

                }
                let idx = i - currentIndex
                this.poolViews[idx].mHolder.setVisibility(true);
                this.poolViews[idx].mHolder.setOpacity(1)
                this.mAdapter.onBindViewHolder(this.poolViews[idx], i);
                this.poolViews[idx].mLastIndex = i
                this.poolViews[idx].mHolder.setTop(offsetHolder)
                offsetHolder += this.mHolderSize;
            }
            this.scrollOffsetY = compute;
        }




        // let offsetY = this.getFirstHolder().mHolder.getTop()
        // for (let i = startIndex; i < Math.min(count + startIndex,items); i++) {
        //     let idx = i - startIndex
        //     this.poolViews[idx].mHolder.setVisibility(true)
        //     this.poolViews[idx].mHolder.setOpacity(1)
        //     this.mAdapter.onBindViewHolder(this.poolViews[idx], i)
        //     this.poolViews[idx].lastIndex = i
        //     this.poolViews[idx].mHolder.setParameter("localIndex",i.toString())
        //     this.poolViews[idx].mHolder.setTop(offsetY)
        //     offsetY += this.mHolderSize
        //
        // }

        if (this.mHolderSize > 0) {
            this.setupScroll(this.mHolderSize * this.mAdapter.getItemCount())
        }

    }

}