'use strict';

class Cookies {
	static getCookie(name){
		let cookies = document.cookie.split(";");
		for(let i in cookies) {
			let cname = cookies[i].trim().split("=")[0];
			if(cname == name){
				return cookies[i].trim().slice(name.length + 1);
			}
		}
		return "";
	}

	static setCookie(name, value, data = {SameSite: "Strict"}) {
		let extra = "";

		for(let key in data)
		{
			extra += "; " + key + "=" + data[key];
		}

		document.cookie = name + "=" + value + extra;
	}

	static setYearCookie(name, value) {
		let date = new Date(Date.now());
		date.setFullYear(date.getFullYear() + 1);
		Cookies.setCookie(name, value, {SameSite: "Strict", expires: date.toUTCString()});
	}

	static removeCookie(name) {
		let date = new Date(0);
		Cookies.setCookie(name, "", {SameSite: "Strict", expires: date.toUTCString()});
	}
}
