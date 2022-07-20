'use strict';

//Mostly fixed now
class MakeInput {
	static createInput(type = "text", wrap = false, getset = true)
	{
		let el = document.createElement("input");
		el.setAttribute("type", type);

		if(wrap) {
			return this.wrapInputs(type, el);
		}

		if(getset) {
			el.getValue = function () {
				return this.value;
			}

			el.setValue = function(value) {
				this.value = value
			}
		}

		return el;
	}

	// Function deprecated, finding another way to do this
	static inputLabel(text, id)
	{
		let el = document.createElement("label");
		el.innerText = text;
		if(typeof id == "string")
			el.setAttribute("for", id);
		return el;
	}

	static colorInput (value) {
		let el = MakeInput.createInput("color", true);
		el.setValue(value);
		return el;
	}

	static textInput (value, placeholder)
	{
		let el = MakeInput.createInput("text");
		el.setAttribute("placeholder", placeholder);
		el.value = value;
		return el;
	}

	static numberInput (value)
	{
		let el = MakeInput.createInput("number");
		el.value = value;
		return el;
	}

	static fileInput (accepts = "", multiple = false) {
		let el = MakeInput.createInput("file", true, false);
		
		let e = el.getElement();
		e.setAttribute("accepts", accepts);
		e.multiple = multiple;
		el.getValue = function() {
			return e.files;
		}
		
		el.setAttribute("data-files", "Choose a file");

		el.firstElementChild.onchange = function () {
			let text = "";
			switch (this.files.length) {
				case 0:
					text = "Choose a file";
					break;
				case 1:
					text = "File: " + this.files[0].name;
					break;
				default:
					text = "Files: " + this.files[0].name + "...";
					break;
			}
			el.setAttribute("data-files", text);
		}

		return el;
	}

	static checkboxInput (value = false) {
		let el = MakeInput.createInput("checkbox", false, false);

		el.getValue = function() {
			return el.checked;
		}

		el.setValue = function(check) {
			el.checked = check;
		}

		el.setValue(value);
		
		return el;
	}

	static radio (value, group, checked = false) {
		let el = MakeInput.createInput("radio", false, false);
		el.setAttribute("name", group);
		el.setAttribute("value", value);
		if(checked)
			el.checked = true;
		return el;
	}

	static radioInput (values, names, group, prompt = "Select One", select = 0) {

		let toWrap = [];

		for(let i = 0; i < values.length; i++) {
			toWrap.push(MakeInput.inputLabel(names[i]));
			if(i == select)
				toWrap.push(MakeInput.radio(values[i], group, true));
			else
				toWrap.push(MakeInput.radio(values[i], group, false));
			toWrap.push(document.createElement("br"));
		}

		let wrapper = MakeInput.wrapInputs("radio", ...toWrap);

		wrapper.setAttribute("data-prompt", prompt);

		wrapper.getValue = function() {
			for(let i = 0; i < this.children.length; i++){
				if(this.children[i].checked)
					return this.children[i].value;
			}
		};

		wrapper.setValue = function(value) {
			for(let i = 0; i < this.children.length; i++){
				if(this.children[i].value == value){
					this.children[i].checked = true;
					return;
				}
			}
		};

		return wrapper;
	}

	static wrapInputs (type, ...el) {

		let wrapper = document.createElement("div");
		wrapper.className = "input-container";
		wrapper.setAttribute("type", type);

		for(let i = 0; i < el.length; i++)
		{
			wrapper.appendChild(el[i]);
		}

		if(el.length == 1)
		{
			wrapper.getValue = function () {return el[0].value;}

			wrapper.setValue = function(value) {el[0].value = value;}

			wrapper.onclick = el[0].click.bind(el[0]);

			wrapper.getElement = function(){return el[0];}
		}

		return wrapper;
	}

	static selectOption (value, text, index, selected) {
		let so = document.createElement("div");
		so.innerText = text;
		so.selectValue = value;
		so.selectIndex = index;
		so.setAttribute("tabindex", 0);
		so.addEventListener("mousedown", MakeInput.selOption.bind(null, so));

		so.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				MakeInput.selOption(so);
			}
		});

		if(selected === true)
			so.setAttribute("selected", true);

		return so
	}

	static selectInput (values, names, select = 0) {
		let se = document.createElement("div");
		se.className = "input-select";
		se.setAttribute("selected", select);

		for(let i in names)
		{
			se.appendChild(MakeInput.selectOption(values[i], names[i], i, i == select));
		}
		
		let wrapper = MakeInput.wrapInputs("select", se);
		wrapper.getValue = MakeInput.selValue.bind(null, se);
		wrapper.getIndex = MakeInput.selIndex.bind(null, se);
		wrapper.addOption = MakeInput.selAdd.bind(se);
		wrapper.removeOption = MakeInput.selRem.bind(se);
		wrapper.setIndex = MakeInput.selSet.bind(se);
		wrapper.setAttribute("tabindex", 0);

		return wrapper;
	}

	static selValue (el) {
		let sel = parseInt(el.getAttribute("selected"));
			
		if(typeof sel != "undefined") {
			return el.children[sel].selectValue;
		}

		return "";
	}

	static selIndex (el) {
		return parseInt(el.getAttribute("selected"));
	}

	static selOption (el, dispatch = true) {
		let sn = el.selectIndex;
		let psn = parseInt(el.parentElement.getAttribute("selected"));

		if(Number.isInteger(psn) && psn < el.parentElement.childElementCount)
			el.parentElement.children[psn].setAttribute("selected", false);

		el.parentElement.setAttribute("selected", sn);
		el.setAttribute("selected", true);

		if(dispatch)
			el.parentElement.parentElement.dispatchEvent(new InputEvent("change"));
	}

	static selSet (index) {
		MakeInput.selOption(this.children[index], false);
	}

	static selAdd (name, value) {
		this.appendChild(MakeInput.selectOption(value, name, this.childElementCount, false));
		return this.childElementCount - 1;
	}

	static selRem (index) {
		if(index >= this.childElementCount)
			return false;

		this.children[index].remove();

		for(let i = index; i < this.childElementCount; i++) {
			this.children[index].selectIndex = "" + i;
		}

		return true;
	}

	static titleWrap(el, title) {
		let wrapper = document.createElement("div");
		wrapper.className = "input-title-wrapper";
		wrapper.setAttribute("type", el.getAttribute("type"));
		wrapper.setAttribute("data-title", title);
		
		wrapper.appendChild(el);

		if(el.getAttribute("type") == "checkbox")
		{
			wrapper.onclick = el.click.bind(el);
		}

		return wrapper;
	}
}

// Mostly fixed now
class Settings {
	constructor (template = {})
	{
		this.settings = Settings.genSettings(template);

		this.wrappers = {};
	}

	static genSettings (template)
	{
		let out = {};

		for(let key in template)
		{
			if(typeof MakeInput[template[key].type+"Input"] != null)
				out[key] = {el: MakeInput[template[key].type+"Input"](...template[key].args), title: template[key].title};
		}
		
		return out;
	}

	getSettings ()
	{
		let out = {};

		for(let key in this.settings)
			out[key] = this.settings[key].el.getValue();
		
		return out;
	}

	putSettings (el)
	{
		this.cleanup();

		this.wrappers = {};

		for(let key in this.settings) {
			this.wrappers[key] = MakeInput.titleWrap(this.settings[key].el, this.settings[key].title)
			el.appendChild(this.wrappers[key]);
		}
			
	}

	cleanup ()
	{
		for(let key in this.wrappers)
			this.wrappers[key].remove();
	}
}
