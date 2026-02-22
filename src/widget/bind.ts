import {View} from "@casperui/core/view/View";
import {RRecyclerView} from "./R";
import {Context} from "@casperui/core/content/Context";
export interface IBase {
	root: View
	mid: View
}

export function bind_base(v: View): IBase {
	return {
		root: v,
		mid: v,
	};
}
export function bind_base_i(x:IBase,v: View):void {
	x.mid = v
}
export type LayoutBindMap = {[RRecyclerView.layout.base]:IBase;
};function bindById(id:number,view:View):any {
switch (id){case RRecyclerView.layout.base:return bind_base(view);
}}
        
export function inflateBind<L extends keyof LayoutBindMap>(
    ctx: Context,
    layout: L,
    cache?: boolean, root?: View | null, rootNodeReplace?: boolean
): LayoutBindMap[L] {
    let v = ctx.getInflater().inflate(layout as any, cache, root, rootNodeReplace) as any
    return bindById(layout, v) as any;
}
        