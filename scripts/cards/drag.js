'use strict';

class MultiDrag extends EventTarget {
    del = false;
    drag = [];
    cbs = [];

    constructor() {
        super();

        window.addEventListener("mousemove", this.update.bind(this));
        document.body.addEventListener("mouseleave", this.stopDraggingAll.bind(this));
    }

    addDragEl(el, ox, oy, px, py, pt) {
        if(this.del)
            return;
    
        el.style.transitionDuration = "0.04s";
    
        this.drag.push({
            e: el,
            osx: ox,
            osy: oy,
            prx: px,
            pry: py,
            ptd: pt
        });
    
        return this.drag.length - 1;
    }

    dragging(e) {
        for(let i in this.drag) {
            if(this.drag[i].e == e)
                return true;
        }
        return false;
    }

    startDragging(e) {
        if(this.del)
            return;
    
        console.log(e);
    
        if(e.button != 0)
            return;
        
        this.dispatchEvent(new Event("dragstart", {target: e.target}));

        return this.addDragEl(
            e.target,
            e.pageX - parseInt(e.target.style.left),
            e.pageY - parseInt(e.target.style.top),
            e.target.style.left,
            e.target.style.top,
            e.target.style.transitionDuration
        );
    }
    
    stopDragging(i) {
        if(this.del)
            return;
        
        this.del = true;
    
        if (i < 0 || i >= this.drag.length)
            return;
        
        var cap = {target: null, x: 0, y: 0};
        
        this.drag[i].e.style.transitionDuration = this.drag[i].ptd;
        
        cap.x = parseInt(this.drag[i].e.style.left);
        this.drag[i].e.style.left = this.drag[i].prx;

        cap.y = parseInt(this.drag[i].e.style.top);
        this.drag[i].e.style.top = this.drag[i].pry;
    
        cap.target = this.drag.splice(i, 1).e;
    
        this.del = false;

        this.dispatchEvent(new Event("dragstop", cap));
    }

    stopDraggingEl(el) {
        for(let d of this.drag) {
            if(d.e === el)
                this.stopDragging(this.drag.indexOf(d));
        }
    }

    stopDraggingAll() {
        if(this.del)
            return;
        
        this.del = true;
    
        while (this.drag.length > 0) {
            this.drag[0].e.style.transitionDuration = this.drag[0].ptd;
            this.drag[0].e.style.left = this.drag[0].prx;
            this.drag[0].e.style.top = this.drag[0].pry;
    
            this.drag.shift();
        }
    
        this.del = false;

        this.dispatchEvent(new Event("dragstopall"));
    }

    update(e) {
        for (let i = 0; i < this.drag.length && !this.del; i++) {
            this.drag[i].e.style.left = e.pageX - this.drag[i].osx + "px";
            this.drag[i].e.style.top = e.pageY - this.drag[i].osy + "px";
        }
    }

    addTarget(e) {
        e.addEventListener("mousedown", this.startDragging.bind(this));
        e.addEventListener("mouseup", this.stopDraggingEl.apply(this, [e]))
    }

    removeTarget (e) {
    }
}