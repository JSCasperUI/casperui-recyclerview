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
        if (lastView.mHolder.getTranslateY() === 0.0) {
            return;
        }
        while (true) {
            nextIndex = this.getLastVisibleHolder().mLastIndex + 1
            let currentIndex = Math.floor(this.getScrollY() / this.mHolderSize)
            let compute = (currentIndex * this.mHolderSize)

            if (this.getScrollY() + mWindowHeight >= lastView.mHolder.getTranslateY()) {
                let countFill = Math.floor(((this.getScrollY() + mWindowHeight) - lastView.mHolder.getTranslateY() + distance) / this.mHolderSize)
                if (countFill > this.viewsPoolSize) {
                    let offsetHolder = 0;
                    for (let i = currentIndex; i < this.viewsPoolSize + currentIndex; i++) {

                        let index = i - currentIndex
                        if (i >= itemsCount) {
                            this.scrollOffsetY = compute
                            for (let x = index; x < this.poolViews.length; x++) {
                                this.poolViews[x].setVisibility(false)
                                this.poolViews[x].mLastIndex = -1
                            }
                            return;
                        }
                        this.poolViews[index].setVisibility(true);
                        this.mAdapter.onBindViewHolder(this.poolViews[index], i);
                        this.poolViews[index].mLastIndex = i
                        let hView = this.poolViews[index].mHolder
                        hView.setTranslateY(compute + offsetHolder)
                        offsetHolder += this.mHolderSize;
                    }
                    this.scrollOffsetY = compute;
                    return;

                }


                if (nextIndex + 1 > itemsCount) {
                    return;
                }
                lastView = this.getLastVisibleHolder();
                if (lastView.mLastIndex === nextIndex) {
                    break;
                }


                let newLastView = this.getFirstVisibleHolder();
                this.rotateRight();
                this.mAdapter.onBindViewHolder(newLastView, nextIndex);
                newLastView.mLastIndex = nextIndex
                newLastView.mHolder.setTranslateY(lastView.mHolder.getTranslateY() + this.mHolderSize)

                this.scrollOffsetY = this.getFirstVisibleHolder().mHolder.getTranslateY()
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
            if (this.getScrollY() <= lastView.mHolder.getTranslateY() && localIndex >= 0) {
                let countFill = Math.abs(Math.floor(((this.getScrollY() + mWindowHeight) - lastView.mHolder.getTranslateY() + distance) / this.mHolderSize));
                if (countFill > this.viewsPoolSize) {
                    let offsetY = compute
                    for (let i = currentIndex; i < this.viewsPoolSize + currentIndex; i++) {

                        const holder = this.poolViews[i - currentIndex]
                        holder.setVisibility(true)
                        this.mAdapter.onBindViewHolder(holder, i)
                        holder.mLastIndex = i

                        holder.mHolder.setTranslateY(offsetY)
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
                this.mAdapter.onBindViewHolder(newLastView, localIndex);
                newLastView.mHolder.setTranslateY(lastView.mHolder.getTranslateY() - this.mHolderSize)
                newLastView.mLastIndex = localIndex;
                this.scrollOffsetY = this.getFirstVisibleHolder().mHolder.getTranslateY()

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
                    holder.mHolder.setTranslateY(c.getTranslateY() + this.mHolderSize)
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
            this.poolViews[i].setVisibility(false)
            this.poolViews[i].mLastIndex = -1
        }
        if (firstVisibleItem && firstVisibleLastIndex !== -1){
            let startIndex = firstVisibleLastIndex
            let startOffset = firstVisibleItem.mHolder.getTranslateY()
            for (let i = startIndex; i < Math.min(count + startIndex,items); i++) {
                let idx = i - startIndex
                this.poolViews[idx].setVisibility(true)
                this.poolViews[idx].mHolder.setOpacity(1)
                this.mAdapter.onBindViewHolder(this.poolViews[idx], i)
                this.poolViews[idx].mLastIndex = i
                this.poolViews[idx].mHolder.setTranslateY(startOffset)
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
                this.poolViews[idx].setVisibility(true);
                this.poolViews[idx].mHolder.setOpacity(1)
                this.mAdapter.onBindViewHolder(this.poolViews[idx], i);
                this.poolViews[idx].mLastIndex = i
                this.poolViews[idx].mHolder.setTranslateY(offsetHolder)
                offsetHolder += this.mHolderSize;
            }
            this.scrollOffsetY = compute;
        }




        if (this.mHolderSize > 0) {
            this.setupScroll(this.mHolderSize * this.mAdapter.getItemCount())
        }

    }

}