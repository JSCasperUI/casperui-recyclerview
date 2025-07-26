import {Adapter} from "@casperui/recyclerview/widget/Adapter";
import {LayoutManager} from "@casperui/recyclerview/widget/LayoutManager";
import {VerticalLayoutManager} from "@casperui/recyclerview/widget/VerticalLayoutManager";
import {View} from "@casperui/core/view/View";

import {AdapterDataObserver} from "@casperui/recyclerview/widget/AdapterDataObserver";
import {RRecyclerView} from "@casperui/recyclerview/widget/R";
import {Context} from "@casperui/core/content/Context";


export class RecyclerView extends View implements AdapterDataObserver {

	mAdapter: Adapter<any> | null = null
	mLayoutManager: LayoutManager | null = null

	constructor(context: Context, tag?: any, attributes?: any) {
		super(context, "WTAG");

		let inflater = context.getInflater()

		inflater.inflate(RRecyclerView.layout.base, false, this, true)

		this.appendAttributes(attributes);

		(this.mNode as HTMLElement).style.overflowY = "auto";
		(this.mNode as HTMLElement).style.display = "block";


		this.setLayoutManager(new VerticalLayoutManager(context))
	}


	setAdapter(adapter: Adapter<any>) {
		if (this.mAdapter != null) {
			this.mAdapter.unregisterAdapterDataObserver(this)
			this.mAdapter = null
		}
		if (adapter == null) return
		this.mAdapter = adapter
		this.mAdapter.registerAdapterDataObserver(this)

		if (this.mLayoutManager) {
			this.mLayoutManager.attachAdapter(this.mAdapter)
		}

	}


	setLayoutManager(manager: LayoutManager) {
		this.mLayoutManager = manager
		this.mLayoutManager.attachAdapter(this.mAdapter)
		this.mLayoutManager.attachView(this)
	}

	onChanged(): void {
		// this.setScrollY(0)
		this.mLayoutManager?.setOnChanged()
	}

	onItemRangeChanged(positionStart: number, itemCount: number): void {
		// this.setScrollY(0)
		this.mLayoutManager?.onItemRangeChanged(positionStart, itemCount)
	}

	onItemRangeInserted(positionStart: number, itemCount: number): void {
	}

	onItemRangeMoved(fromPosition: number, toPosition: number, itemCount: number): void {
	}

	onItemRangeRemoved(positionStart: number, itemCount: number): void {
	}


}