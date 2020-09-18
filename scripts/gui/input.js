'use strict';

//This whole clusterfuq of functions needs fixing.
class MakeInput {
    static createInput(type = "text", id)
    {
        var el = document.createElement("input");
        el.setAttribute("type", type);
        
        if(typeof id == "string")
            el.setAttribute("id", id);

        el.getValue = function () {
            return this.value;
        }

        return el;
    }

    static inputLabel(text, id)
    {
        var el = document.createElement("label");
        el.innerText = text;
        if(typeof id == "string")
            el.setAttribute("for", id);
        return el;
    }

    static colorInput (value, id) {
        var el = MakeInput.createInput("color", id);
        el.value = value;
        return el;
    }

    static textInput (value, placeholder, id)
    {
        var el = MakeInput.createInput("text", id);
        el.setAttribute("placeholder", placeholder);
        el.value = value;
        return el;
    }

    static numberInput (value, id)
    {
        var el = MakeInput.createInput("number", id);
        el.value = value;
        return el;
    }

    //To fix
    static fileInput (value, id) {
        var el = MakeInput.createInput("file", id);
        
        el.value = value;
        
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

    static checkboxInput (checked = false, id) {
        var el = MakeInput.createInput("checkbox", false, id);
        if(checked)
            el.setAttribute("checked");
        return el;
    }

    static radioInput (group, value, checked = false, id) {
        var el = MakeInput.createInput("radio", false, id);
        el.setAttribute("name", group);
        el.setAttribute("value", value);
        if(checked)
            el.checked = true;
        return el;
    }

    static radioInputs (group, names, values, checked = 0, id) {

        let toWrap = [];

        for(let i = 0; i < values.length; i++) {
            toWrap.push(MakeInput.inputLabel(names[i], group+"-"+i));
            if(i == checked)
                toWrap.push(MakeInput.radioInput(group, values[i], true, group+"-"+i));
            else
                toWrap.push(MakeInput.radioInput(group, values[i], false, group+"-"+i));
            toWrap.push(document.createElement("br"));
        }

        var wrapper = MakeInput.wrapInputs("radio", ...toWrap);

        wrapper.getValue = function() {
            for(let i = 0; i < this.children.length; i++){
                if(this.children[i].checked)
                    return this.children[i].value;
            }
        };

        if(typeof id == "string")
            wrapper.setAttribute("id", id);

        return wrapper;
    }

    static selectOption (text, value, selected) {
        var so = document.createElement("div");
        so.innerText = text;
        so.setAttribute("value", value);
        so.addEventListener("mousedown", customSelectOption.bind(null, so));

        if(selected === true)
            so.setAttribute("selected", true);

        return so
    }

    static selectInput (names, values, id, select = 0) {
        var se = document.createElement("div");
        se.className = "input-select";
        se.setAttribute("tabindex", 0);
        se.setAttribute("selected", select);

        for(let i in names)
        {
            se.appendChild(MakeInput.selectOption(names[i], values[i], i == select));
        }

        if(typeof id == "string")
            se.setAttribute("id", id);
        
        var wrapper = MakeInput.wrapInputs("select", se);
        wrapper.getValue = MakeInput.selValue.bind(null, se);
        wrapper.setAttribute("tabindex", 0);

        return wrapper;
    }

    static wrapInputs (type, ...el) {

        var wrapper = document.createElement("div");
        wrapper.className = "input-container";
        wrapper.setAttribute("type", type);

        for(let i = 0; i < el.length; i++)
        {
            wrapper.appendChild(el[i]);
        }

        return wrapper;
    }

    static selValue (el) {
        let sel = parseInt(el.getAttribute("selected"));
            
        if(typeof sel != "undefined") {
            return el.children[sel].getAttribute("value");
        }
    
        return "";
    }
    
    static selOption (el) {
        let sn = Array.prototype.indexOf.call(el.parentElement.children, el);
        let psn = parseInt(el.parentElement.getAttribute("selected"));
    
        if(Number.isInteger(psn))
            el.parentElement.children[psn].setAttribute("selected", false);
    
        el.parentElement.setAttribute("selected", sn);
        el.setAttribute("selected", true);
    }
}

class Settings {
    constructor (template = {})
    {
        this.settings = Settings.genSettings(template);
    }

    static genSettings (template)
    {
        var out = {};

        for(let key in template)
        {
            switch(template[key].type)
            {
                case "radio":
                    out[key] = MakeInput.radioInputs(...template[key].args);
                    break;
                default:
                    if(typeof MakeInput[template[key].type+"Input"] != null)
                    out[key] = MakeInput[template[key].type+"Input"](...template[key].args);
            }
        }
        
        return out;
    }

    getSettings ()
    {
        var out = {};

        for(let key in this.settings)
            out[key] = this.settings[key].getValue();
        
        return out;
    }

    putSettings (el)
    {
        for(let key in this.settings)
            el.appendChild(this.settings[key]);
    }
}
