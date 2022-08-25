'use strict';

class MultiDrag extends EventTarget {
	drag = {
		mouse: []
	};

	constructor(root, ret = false) {
		super();

		window.addEventListener("mousemove", this.update.bind(this));
		window.addEventListener("touchmove", this.update.bind(this));

		window.addEventListener("mouseup", this.stopDragging.bind(this, "mouse"));
		document.body.addEventListener("mouseleave", this.stopDragging.bind(this, "mouse"));
		window.addEventListener("touchend", ((e) => {this.stopDragging(e.changedTouches[0].identifier)}).bind(this));
		window.addEventListener("touchcancel", ((e) => {this.stopDragging(e.changedTouches[0].identifier)}).bind(this));

		this.root = root;
		this.ret = ret;
		this.transform = ()=>{return [0.0, 1.0];};
	}

	addDragEl(el, px, py, group = "mouse") {
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

		if (typeof this.drag[group] == "undefined")
			this.drag[group] = [push];
		else
			this.drag[group].push(push);


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
		let cap = new Event("dragstart");

		if(e.type == "touchstart") {
			let ct = e.changedTouches[0];
			cap.drag = this.addDragEl(e.target, ct.pageX, ct.pageY, ct.identifier);
		} else {
			if(e.button != 0)
				return;
			cap.drag = this.addDragEl(e.target, e.pageX, e.pageY);
		}

		this.dispatchEvent(cap);
	}

	stopDragging(group) {
		if (typeof this.drag[group] == "undefined" || this.drag[group].length == 0)
			return;
		
		let cap = new Event("dragstop");
		cap.drag = this.drag[group];
		if (group != "mouse")
			delete this.drag[group];
		else
			this.drag.mouse = [];
		
		for (let i of cap.drag) {
			i.e.className = "";
			if (this.ret) {
				i.e.style.setProperty("--left", "");
				i.e.style.setProperty("--right", "");
				i.ep.appendChild(i.e);
			}
		}
		
		let rect = cap.drag[0].e.getBoundingClientRect();
		cap.x = (rect.left - cap.drag[0].ex) + cap.drag[0].px;
		cap.y = (rect.top - cap.drag[0].ey) + cap.drag[0].py;

		this.dispatchEvent(cap);
	}

	stopDraggingAll() {
		for(let i in this.drag) {
			this.stopDragging(i);
		}
	}

	update(e) {
		if(e.type == "touchmove") {
			for (let t of e.changedTouches) {

				let id = t.identifier;
				
				if (typeof this.drag[id] !== "undefined" && this.drag[id].length > 0) {
					let tr = this.transform(t.pageX, t.pageY);

					for (let i = 0; i < this.drag[id].length; i++) {
						let d = this.drag[id][i];
						d.e.style.setProperty("--left", (t.pageX - d.px) + d.ex + "px");
						d.e.style.setProperty("--top", (t.pageY - d.py) + d.ey + "px");
						d.e.style.setProperty("--irot", tr[0]);
						d.e.style.setProperty("--iscale", tr[1]);
					}
				}
			}
		} else if (this.drag.mouse.length > 0) {
			let t = this.transform(e.pageX, e.pageY);

			for (let i = 0; i < this.drag.mouse.length; i++) {
				let d = this.drag.mouse[i];
				d.e.style.setProperty("--left", (e.pageX - d.px) + d.ex + "px");
				d.e.style.setProperty("--top", (e.pageY - d.py) + d.ey + "px");
				d.e.style.setProperty("--irot", t[0]);
				d.e.style.setProperty("--iscale", t[1]);
			}
		}
	}

	addTarget(e) {
		e.d = this.startDragging.bind(this)
		e.addEventListener("mousedown", e.d);
		e.addEventListener("touchstart", e.d);
	}

	removeTarget (e) {
		e.removeEventListener("mousedown", e.d);
		e.removeEventListener("touchstart", e.d);
	}
}