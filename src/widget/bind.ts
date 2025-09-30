import {View} from "@casperui/core/view/View";
export interface IBase {
	mid: View
}

export function bind_base(v: View): IBase {
	return {
		mid: v,
	};
}
export function bind_base_i(x:IBase,v: View):void {
	x.mid = v
}
