import {View} from "@casperui/core/view/View";
import {Context} from "@casperui/core/content/Context";
import {ViewHolder} from "@casperui/recyclerview/widget/ViewHolder";
import {Adapter} from "@casperui/recyclerview/widget/Adapter";
import {JFragment} from "@casperui/core/app/JFragment";

export abstract class LayoutManager {
	POOL_OFFSET_SIZE = 5
	context: Context


	mAdapter: Adapter<ViewHolder> | null = null
	recyclerView: View | null = null
	content: View | null = null

	poolViews: Array<ViewHolder> = []


	mHolderSize = 0
	viewsPoolSize = 0
	oldScrollX = 0
	oldScrollY = 0

	scrollX = 0
	scrollY = 0
	isInited = false
	private measuredHeight: number = 0;
	private lockFragment: View = null;

	constructor(context: Context) {
		this.context = context;

	}


	init() {

		if (this.isInited) console.log("DOUBLE INIT")

		this.isInited = true
		const weakThis = new WeakRef<LayoutManager>(this);


		this.recyclerView.waitingSelf(() => {
			let jf = (this.recyclerView.getFragmentManager() as JFragment);
			jf.addAttachEventListener(() => {
				const strongThis = weakThis.deref();
				if (strongThis) {
					strongThis.recyclerView.setScrollY(strongThis.oldScrollY)
				}
			})
		})
		let scheduled = false;
		let skipFrame = 0;

		this.recyclerView.getElement().addEventListener("scroll", function () {
			const strongThis = weakThis.deref();
			if (!strongThis) return;

			if (skipFrame > 0){
				console.log("DOUBLE INITreturn")
				return;
			};
			skipFrame = 1;
			let before = strongThis.recyclerView.getScrollY();
			requestAnimationFrame(() => {
				skipFrame--
				const strongNow = weakThis.deref();
				if (!strongNow) return;


				let y = strongThis.recyclerView.getScrollY();
				let x = strongThis.recyclerView.getScrollX();
				const after = y;
				console.log("Before:", before, "After:", after, "Δ", after - before);

				strongThis.scrollX = Math.round(x)
				strongThis.scrollY = Math.round(y)
				strongThis.onScroll();
				scheduled = false;
			});



		})

		if (this.recyclerView) {
			const el = this.recyclerView.getElement();
			if (el) {
				const ro = new ResizeObserver(entries => {
					this.measuredHeight = Math.round(entries[0].contentRect.height);
				});
				ro.observe(el);
			}
		}
	}

	getScrollY() {
		return this.scrollY;
		// return this.mView.getScrollY()
	}

	getScrollX() {
		// @ts-ignore
		return this.scrollX;
	}


	attachAdapter(adapter: Adapter<any>) {
		this.poolViews = []
		this.mAdapter = adapter;
	}


	attachView(view: View) {
		this.recyclerView = view
		this.content = new View(this.context, "div", {"class": "scroll_body"})
		view.addView(this.content)
		this.init()
	}


	setOnChanged() {
	}

	abstract onItemRangeChanged(positionStart: number, itemCount: number)

	abstract onScroll()


	setupScroll(height: number) {
		this.content.setHeight(height)
	}


	clearHolders() {
		this.content.removeAllViews()
		this.poolViews = []
	}

	onBindViewHolder(holder: ViewHolder, position: number) {
		if (this.mAdapter) {
			holder.mLastIndex = position
			this.mAdapter.onBindViewHolder(holder, position)
		}
	}

	lockView(){
		this.recyclerView.removeView(this.content)
	}
	unlockView(){
		this.recyclerView.addView(this.content)
	}

	addHolder(holder: ViewHolder) {
		holder.setVisibility(false)
		this.poolViews.push(holder)
		this.content.addView(holder.mHolder)
	}

	getParent() {
		return this.content
	}

	getMeasuredHeight() {
		return this.measuredHeight

	}

	getChildCount() {
		return this.content.getChildren().length
	}

	getLastVisibleHolder() {

		for (let i = this.poolViews.length - 1; i >= 0; i--) {
			if (this.poolViews[i].getVisibility()) {
				return this.poolViews[i]
			}
		}

		return this.poolViews[this.poolViews.length - 1];
	}

	getFirstVisibleHolder(): ViewHolder {

		for (let i = 0; i < this.poolViews.length; i++) {
			if (this.poolViews[i].getVisibility()) {
				return this.poolViews[i]
			}

		}


		return this.poolViews[0];
		// for (i in 0 until poolViews.size) {
		//     if (poolViews.get(i).holder.getVisibility()) {
		//         return poolViews.get(i)
		//     }
		//
		// }
		// return poolViews.get(0);

	}


	getLastHolder() {
		return this.poolViews[this.poolViews.length - 1]
	}
}