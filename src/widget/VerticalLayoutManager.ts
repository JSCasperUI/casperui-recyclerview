import {LayoutManager} from "@casperui/recyclerview/widget/LayoutManager";
import {Context} from "@casperui/core/content/Context";
import {ViewHolder} from "@casperui/recyclerview/widget/ViewHolder";

export class VerticalLayoutManager extends LayoutManager {
	scrollOffsetY = 0

	constructor(context: Context) {
		super(context);

	}

	firstHolder = {dataIndex: 0, holderIndex: 0}
	lastHolder = {dataIndex: 0, holderIndex: 0}

	updateViewPoolSize(isResize: boolean) {
		let isBindHolder = false
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
		let nextIndex = Math.ceil((this.getScrollY() + (this.getChildCount() * this.mHolderSize) + this.mHolderSize) / this.mHolderSize) - this.POOL_OFFSET_SIZE + 2;

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
					this.onBindViewHolder(holder, index);
					holder.mHolder.setTranslateY(c.getTranslateY() + this.mHolderSize)
					// holder.mHolder.setParameter("localIndex", index.toString())
				}
			}

			nextIndex++
		}
		return isBindHolder;
	}


	onItemRangeChanged(start: number, count: number) {
		let itemsCount = this.mAdapter.getItemCount()
		if (count > 1) {
			this.setOnChanged()
			return
		}
		if (start < 0 || start >= itemsCount && start< 0 ) return;

		for (let i = 0; i < this.poolViews.length; i++) {
			if (this.poolViews[i].mLastIndex === start) {
				this.onBindViewHolder(this.poolViews[i], start)
				break
			}

		}
	}

	private rebindAll(startIndex: number, itemCount: number) {
		let expectedY = startIndex * this.mHolderSize;
		this.firstHolder.dataIndex = startIndex;
		this.firstHolder.holderIndex = 0;

		for (let i = 0; i < itemCount; i++) {
			const holder = this.poolViews[i] as ViewHolder;
			this.onBindViewHolder(holder, startIndex);

			this.lastHolder.dataIndex = startIndex;
			this.lastHolder.holderIndex = i;

			holder.mHolder.setTranslateY(expectedY);
			expectedY += this.mHolderSize;
			startIndex++;
		}
	}

	onScroll() {
		const scrollY = this.getScrollY();
		if (this.getChildCount() === 0 || this.getMeasuredHeight() === 0 || scrollY < 0) {
			return
		}
		if (this.mHolderSize === 0 || this.viewsPoolSize === 0 || !this.mAdapter) return;

		// if (this.lastHolder.holderIndex == 0) {
		// 	this.lastHolder.holderIndex = this.viewsPoolSize - 1;
		// }

		let windowHeight = window.screen.height;

		const itemsCount = this.mAdapter.getItemCount();

		if (itemsCount <= this.viewsPoolSize) {
			return;
		}

		const firstIndex = Math.floor(scrollY / this.mHolderSize);
		const lastIndex = Math.floor((scrollY + windowHeight) / this.mHolderSize);


		let needIndexTop = Math.max(0, firstIndex - 2)
		let needIndexBottom = Math.min(itemsCount, lastIndex + 2)

		let minIndexPool = this.firstHolder.dataIndex;
		let maxIndexPool = this.lastHolder.dataIndex


		if (needIndexBottom > maxIndexPool && maxIndexPool!=itemsCount-1) {
			let replaceIndex = minIndexPool
			let replaceTo = maxIndexPool + 1
			let skipCount = needIndexBottom - maxIndexPool

			if (skipCount > this.viewsPoolSize - 5) {
				let endIndex = Math.min(itemsCount - needIndexTop, this.viewsPoolSize)
				//TODO check limits
				if (needIndexTop + endIndex == itemsCount) {
					needIndexTop = (needIndexTop + endIndex) - this.viewsPoolSize
					endIndex = this.viewsPoolSize
				}
				this.rebindAll(needIndexTop, endIndex)
				return;
			}

			let startIter = this.lastHolder.dataIndex
			let holderIndex = this.firstHolder.holderIndex
			let max = Math.min(startIter + skipCount, itemsCount-1 )
			for (let i = startIter; i < max; i++) {
				let index = holderIndex % (this.viewsPoolSize)
				const holder = this.poolViews[index] as ViewHolder;
				this.onBindViewHolder(holder, replaceTo);
				holder.mLastIndex = replaceTo;
				this.lastHolder.dataIndex = replaceTo;
				this.lastHolder.holderIndex = index;

				this.firstHolder.holderIndex = (this.firstHolder.holderIndex + 1) % this.viewsPoolSize;
				this.firstHolder.dataIndex++

				const expectedY = replaceTo * this.mHolderSize;
				holder.mHolder.setTranslateY(expectedY);


				replaceTo++
				replaceIndex++
				holderIndex++
			}

		} else if (minIndexPool != 0 && needIndexTop < minIndexPool) {
			let skipCount = (minIndexPool) - needIndexTop
			if (skipCount > this.viewsPoolSize - 5) {
				let endIndex = Math.min(itemsCount, this.viewsPoolSize)
				this.rebindAll(needIndexTop, endIndex)
				return;
			}

			let setTo = this.firstHolder.dataIndex - 1
			let offset = setTo * this.mHolderSize

			let holderIndex = this.lastHolder.holderIndex

			while (skipCount-- > 0) {
				const holder = this.poolViews[holderIndex] as ViewHolder;

				this.onBindViewHolder(holder, setTo);
				holder.mHolder.setTranslateY(offset);

				this.firstHolder.dataIndex = setTo;
				this.firstHolder.holderIndex = holderIndex;
				if (this.firstHolder.holderIndex < 0) {
					this.firstHolder.holderIndex = this.viewsPoolSize - 1
				}

				this.lastHolder.holderIndex = (this.lastHolder.holderIndex - 1 + this.viewsPoolSize) % this.viewsPoolSize;
				this.lastHolder.dataIndex--




				offset -= this.mHolderSize
				setTo--
				holderIndex = (holderIndex - 1 + this.viewsPoolSize) % this.viewsPoolSize;
			}

		}
	}

	private lastVisibleItems = 0;

	setOnChanged() {
		super.setOnChanged()
		if (this.mHolderSize === 0) {
			this.updateViewPoolSize(false)
			if (this.mHolderSize === 0) {
				return;
			}
		}

		let height = this.getMeasuredHeight()
		let items = this.mAdapter.getItemCount()

		for (let i = 0; i < this.poolViews.length; i++) {
			this.poolViews[i].mHolder.setTranslateY(0)
			this.poolViews[i].setVisibility(i < items)
		}
		if (items == 0) {
			this.setupScroll(0)
			return;
		}
		this.lastVisibleItems = Math.min(items, this.viewsPoolSize)

		let maxScroll = Math.max(0, this.mHolderSize * items - height);
		this.setupScroll(this.mHolderSize * items)

		let scrollY = Math.min(this.getScrollY(), maxScroll);

		const firstIndex = Math.floor(scrollY / this.mHolderSize);
		let needIndexTop = Math.max(0, firstIndex - 2)
		let endIndex = Math.min(items - needIndexTop, this.viewsPoolSize)
		if (endIndex < this.viewsPoolSize) {
			needIndexTop = Math.max(0, needIndexTop - this.viewsPoolSize - endIndex)
			endIndex = Math.min(this.viewsPoolSize, items);
		}
		this.rebindAll(needIndexTop, endIndex)

	}

}