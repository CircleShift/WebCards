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

    static setCookie(name, value, data = {}) {
        let extra = "";

        for(let key in data)
        {
            extra += "; " + key + "=" + data[key];
        }

        document.cookie = name + "=" + value + extra;
    }

    static setYearCookie(name, value) {
        var date = new Date(Date.now());
        date.setFullYear(date.getFullYear() + 1);
        Cookies.setCookie(name, value, {expires: date.toUTCString()});
    }

    static removeCookie(name) {
        var date = new Date(0);
        Cookies.setCookie(name, "", {expires: date.toUTCString()});
    }
}
