'use strict';

class Message{
	constructor (type, data)
	{
		this.t = type;
		this.d = data;
	}

	stringify ()
	{
		let dat = this.d
		if(typeof dat !== "string"){
			dat = JSON.stringify(dat);
		}
		return JSON.stringify({type: this.t, data: dat});
	}
}
