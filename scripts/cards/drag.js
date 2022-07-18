'use strict';

class MultiDrag extends EventTarget {
	del = false;
	drag = [];
	mouse = [null, null];

	constructor(ret = false) {
		super();

		window.addEventListener("mousemove", this.update.bind(this));
		window.addEventListener("mouseup", this.stopDraggingAll.bind(this));
		document.body.addEventListener("mouseleave", this.stopDraggingAll.bind(this));

		//window.addEventListener("touchend", this.stopDraggingAll.bind(this));
		//window.addEventListener("touchcancel", this.stopDraggingAll.bind(this));

		this.ret = ret;
	}

	addDragEl(el, ox, oy, px, py, pt) {
		if(this.del)
			return;

		el.style.transitionDuration = "0s";
		
		let push = {
			e: el,
			osx: ox,
			osy: oy,
			ptd: pt
		};

		if(this.ret) {
			push.prx = px;
			push.pry = py;
		}

		this.drag.push(push);

		return push;
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

		var cap = new Event("dragstart");
		
		cap.drag = this.addDragEl(
			e.target,
			e.pageX - parseInt(e.target.style.left),
			e.pageY - parseInt(e.target.style.top),
			e.target.style.left,
			e.target.style.top,
			e.target.style.transitionDuration
		);

		this.dispatchEvent(cap);
	}

	stopDragging(i) {
		if(this.del)
			return;
		
		this.del = true;

		if (i < 0 || i >= this.drag.length)
			return;
		
		var cap = new Event("dragstop");
		cap.x = this.mouse[0];
		cap.y = this.mouse[1];
		
		this.drag[i].e.style.transitionDuration = this.drag[i].ptd;

		if(this.ret) {
			this.drag[i].e.style.left = this.drag[i].prx;
			this.drag[i].e.style.top = this.drag[i].pry;
		}

		cap.drag = this.drag.splice(i, 1);

		this.del = false;

		this.dispatchEvent(cap);
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
		
		var cap = new Event("dragstop");

		cap.x = this.mouse[0];
		cap.y = this.mouse[1];

		cap.drag = [];
		
		while (this.drag.length > 0) {
			this.drag[0].e.style.transitionDuration = this.drag[0].ptd;

			if(this.ret) {
				this.drag[0].e.style.left = this.drag[0].prx;
				this.drag[0].e.style.top = this.drag[0].pry;
			}

			cap.drag.push(this.drag.shift());
		}

		this.del = false;

		this.dispatchEvent(cap);
	}

	update(e) {
		this.mouse[0] = e.pageX;
		this.mouse[1] = e.pageY;

		for (let i = 0; i < this.drag.length && !this.del; i++) {
			this.drag[i].e.style.left = e.pageX - this.drag[i].osx + "px";
			this.drag[i].e.style.top = e.pageY - this.drag[i].osy + "px";
		}
	}

	addTarget(e) {
		e.d1 = this.startDragging.bind(this);
		//e.d2 = this.startTouchDrag.bind(this);
		e.addEventListener("mousedown", e.d1);
		//e.addEventListener("touchstart", e.d2);
	}

	removeTarget (e) {
		e.removeEventListener("mousedown", e.d1);
		e.removeEventListener("touchstart", e.d2);
	}
}