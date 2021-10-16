'use strict';

const BASE_THEMES = [[
	"styles/themes/colors-base.css",
	"styles/themes/colors-dark.css"
],
[
	"Light",
	"Dark"
]];

class Theme{
	static theme = document.getElementById("theme");
	static UserThemes = [[],[]];

	static init()
	{
		let uth = Cookies.getCookie("userThemes").split(',');

		for (let i = 1; i < uth.length; i += 2)
		{
			this.UserThemes[0].push(uth[i - 1]);
			this.UserThemes[1].push(uth[i]);
		}

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

	static get() {
		return Cookies.getCookie("theme");
	}

	static setUserThemes() {
		let out = "";
		for (let i = 0; i < this.UserThemes[0].length; i++)
		{
			if(i !== 0)
				out = out + ",";
			
			out = out + this.UserThemes[0][i] + "," + this.UserThemes[1][i];
		}

		Cookies.setYearCookie("userThemes", out);
	}

	static removeUserTheme (index) {
		this.UserThemes[0].splice(index, 1);
		this.UserThemes[1].splice(index, 1);
		this.setUserThemes();
	}

	static addUserTheme (name, value) {
		this.UserThemes[0].push(name);
		this.UserThemes[1].push(value);
		this.setUserThemes();
	}
}

Theme.restore();