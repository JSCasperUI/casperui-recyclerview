import {View} from "@casperui/core/view/View";
import {Context} from "@casperui/core/content/Context";
import {ViewHolder} from "@casperui/recyclerview/widget/ViewHolder";
import {Adapter} from "@casperui/recyclerview/widget/Adapter";

export abstract class LayoutManager {
    POOL_OFFSET_SIZE = 4
    context:Context
    mAdapter:Adapter<any>|null = null
    mView:View|null = null
    content:View|null = null


    oldScrollX = 0.0
    oldScrollY = 0.0
    oldWidth = 0.0
    oldHeight = 0.0
    poolViews:Array<ViewHolder> = []


    mHolderSize = 0
    viewsPoolSize = 0
    itemsCount = 0
    isInited = false
    constructor(context:Context) {
        this.context = context;


        // this.onScrollFn = this.onScroll.bind(this);
    }
    // onScroll(){
    //     console.log("scroll",this.getScrollY())
    //     let y = this.mView.getScrollY()
    //     let x = this.mView.getScrollX()
    //     if (y>this.oldScrollY){
    //         this.scrollToBottom()
    //     }else{
    //         this.scrollToTop()
    //     }
    //     this.oldScrollX = x
    //     this.oldScrollY = y
    // }

    init(){
        if (this.isInited) console.log("DOUBLE INIT")

        this.isInited = true
        // this.mView.node.onscroll = this.onScrollFn
        const weakThis = new WeakRef(this);

        // Устанавливаем обработчик события onscroll
        this.mView.getElement().onscroll = () => {
            // Получаем сильную ссылку на объект через WeakRef
            const strongThis = weakThis.deref();

            // Если объект существует, выполняем действия
            if (strongThis) {
                let y = strongThis.mView.getScrollY();
                let x = strongThis.mView.getScrollX();
                if (y > strongThis.oldScrollY) {
                    strongThis.scrollToBottom();
                } else {
                    strongThis.scrollToTop();
                }
                strongThis.oldScrollX = x;
                strongThis.oldScrollY = y;
            }
        };
        // this.mView.node.addEventListener("scroll", this.onScrollFn);

    }
    getScrollY(){
        return Math.round(this.mView.getScrollY())
    }
    getScrollX(){
        // @ts-ignore
        return this.mView.getScrollX()
    }


    /**
     * @param {Adapter} adapter
     */
    attachAdapter(adapter:Adapter<any>) {
        this.mAdapter = adapter;
    }


    attachView(view:View) {
        this.mView = view
        this.content = new View(view.context,"div",{class:"scroll_body"})
        view.addView(this.content)
        this.init()
    }


    setOnChanged(){}
    abstract onItemRangeChanged(positionStart:number, itemCount:number)

    abstract scrollToBottom()

    abstract scrollToTop()

    setupScroll(height){
        this.content.setHeight(height)
    }


    rotateLeft() {
        const tmp = this.poolViews[this.poolViews.length - 1];
        this.poolViews.pop();
        this.poolViews.unshift(tmp);
    }

    rotateRight() {
        const tmp = this.poolViews[0];
        this.poolViews.shift();
        this.poolViews.push(tmp);
    }

    clearHolders(){
        this.content.removeAllViews()
        this.poolViews = []
    }


    /**
     * @param {ViewHolder} holder
     */
    addHolder(holder){
        holder.mHolder.setOpacity(0)
        this.poolViews.push(holder)
        this.content.addView(holder.mHolder)
    }

    /**
     * @return {View}
     */
    getParent() {
        return this.content
    }
    getMeasuredHeight() {
        return this.mView.getHeight()

    }
    getChildCount() {
        return this.content.getChildren().length
    }

    getLastVisibleHolder() {

        for (let i = this.poolViews.length - 1; i >= 0; i--) {
            if (this.poolViews[i].mHolder.getVisibility()) {
                return this.poolViews[i]
            }
        }

        return this.poolViews[this.poolViews.length - 1];
    }

    getFirstVisibleHolder() {

        for (let i = 0; i < this.poolViews.length; i++) {
            if (this.poolViews[i].mHolder.getVisibility()) {
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

    /**
     * @return {ViewHolder}
     */
    getFirstHolder() {
        return this.poolViews[0]
    }
    /**
     * @return {ViewHolder}
     */
    getLastHolder() {
        return this.poolViews[this.poolViews.length - 1]
    }
}