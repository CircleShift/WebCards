'use strict';

class MultiDrag extends EventTarget {
	del = false;
	drag = [];
	mouse = [null, null];

	constructor(root, ret = false) {
		super();

		window.addEventListener("mousemove", this.update.bind(this));
		window.addEventListener("mouseup", this.stopDraggingAll.bind(this));
		document.body.addEventListener("mouseleave", this.stopDraggingAll.bind(this));

		//window.addEventListener("touchend", this.stopDraggingAll.bind(this));
		//window.addEventListener("touchcancel", this.stopDraggingAll.bind(this));

		this.root = root;
		this.ret = ret;
		this.transform = ()=>{return [0.0, 1.0];};
	}

	addDragEl(el, px, py) {
		if(this.del)
			return;

		el.className = "instant";
		
		let push = {
			e: el,
			ep: el.parentElement,
			ex: el.getBoundingClientRect().left,
			ey: el.getBoundingClientRect().top,
			px: px,
			py: py
		};

		let t = this.transform(px, py);
		this.root.appendChild(el);
		el.style.setProperty("--left", push.ex + "px");
		el.style.setProperty("--top", push.ey + "px");
		el.style.setProperty("--irot", t[0]);
		el.style.setProperty("--iscale", t[1]);

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

		let cap = new Event("dragstart");
		
		cap.drag = this.addDragEl(e.target, e.pageX, e.pageY);

		this.dispatchEvent(cap);
	}

	stopDragging(i) {
		if(this.del)
			return;
		
		this.del = true;

		if (i < 0 || i >= this.drag.length)
			return;
		
		let cap = new Event("dragstop");
		cap.x = this.mouse[0];
		cap.y = this.mouse[1];
		
		this.drag[i].e.className = "";

		if(this.ret) {
			this.drag[i].e.style.setProperty("--left", "0px");
			this.drag[i].e.style.setProperty("--top", "0px");
			this.drag[i].ep.appendChild(this.drag[i].e);
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
		
		let cap = new Event("dragstop");

		cap.x = this.mouse[0];
		cap.y = this.mouse[1];

		cap.drag = [];
		
		while (this.drag.length > 0) {
			this.drag[0].e.style.transitionDuration = this.drag[0].ptd;

			if(this.ret) {
				this.drag[0].e.style.setProperty("--left", "0px");
				this.drag[0].e.style.setProperty("--top", "0px");
				this.drag[0].ep.appendChild(this.drag[0].e);
			}

			cap.drag.push(this.drag.shift());
		}

		this.del = false;

		this.dispatchEvent(cap);
	}

	update(e) {
		if(this.drag.length == 0)
			return;

		this.mouse[0] = e.pageX;
		this.mouse[1] = e.pageY;
		let t = this.transform(this.mouse[0], this.mouse[1]);

		for (let i = 0; i < this.drag.length && !this.del; i++) {
			let d = this.drag[i];
			d.e.style.setProperty("--left", (e.pageX - d.px) + d.ex + "px");
			d.e.style.setProperty("--top", (e.pageY - d.py) + d.ey + "px");
			d.e.style.setProperty("--irot", t[0]);
			d.e.style.setProperty("--iscale", t[1]);
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