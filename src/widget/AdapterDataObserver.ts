export interface AdapterDataObserver {
	onChanged(): void

	onItemRangeChanged(positionStart: number, itemCount: number): void

	onItemRangeInserted(positionStart: number, itemCount: number): void

	onItemRangeRemoved(positionStart: number, itemCount: number): void

	onItemRangeMoved(fromPosition: number, toPosition: number, itemCount: number): void
}