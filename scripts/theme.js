'use strict';

class Theme{
    static theme = document.getElementById("theme");

    static init()
    {
        if(Cookies.getCookie("theme") == ""){
            Cookies.setYearCookie("theme", "styles/themes/colors-base.css");
        }
    }

    static restore()
    {
        Theme.init();
        Theme.theme.setAttribute("href", Cookies.getCookie("theme") + "?v=" + Date.now());
    }

    static set(sheet)
    {
        Cookies.setYearCookie("theme", sheet);
        Theme.theme.setAttribute("href", sheet + "?v=" + Date.now());
    }
}

Theme.restore();