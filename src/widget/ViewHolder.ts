import {View} from "@casperui/core/view/View";

export class ViewHolder {
	mHolder: View;
	mLastIndex = -1;
	mCellIndex = -1;

	constructor(holder: View) {
		this.mHolder = holder;
	}

	private mIsVisible: boolean = true;


	getVisibility(): boolean {
		return this.mIsVisible;
	}

	setVisibility(value: boolean) {
		if (value == this.mIsVisible) return

		this.mIsVisible = value;


		let el = this.mHolder.getElement()
		if (value) {
			el.style.opacity = "1";
			el.style.pointerEvents = "auto";
		} else {
			el.style.opacity = "0";
			el.style.pointerEvents = "none";
		}

	}
}