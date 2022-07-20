'use strict';

class Chat {
	constructor(e, soc)
	{
		this.chats = [];
		this.active = null;
		this.root = e;
		this.socket = soc;
		e.getElementsByClassName("toggle-chat")[0].onclick = this.toggle.bind(this);
		let cin = e.getElementsByClassName("chat-input")[0];
		this.chatInput = cin.children[0];

		cin.getElementsByTagName("input")[0].addEventListener("keydown", this.checkEnter.bind(this));
		cin.getElementsByTagName("button")[0].addEventListener("click", this.sendMessage.bind(this));
	}

	getChannel (name)
	{
		for(let i in this.chats)
		{
			if (this.chats[i].name == name)
			{
				return this.chats[i];
			}
		}

		return null;
	}

	isActive (name)
	{
		if(this.active !== null)
			return this.active.name === name;

		return false;
	}

	addChannel (name, follow = true)
	{
		if(this.getChannel(name) != null)
			return;

		let d = document.createElement("div");
		let b = document.createElement("button");

		this.root.getElementsByClassName("chat-select")[0].appendChild(b);

		b.setAttribute("active", false);

		b.onclick = this.switchChannel.bind(this, name);

		b.innerText = name;

		d.className = "chat-text";

		this.chats.push({name: name, e: d, btn: b});

		if(follow)
			this.switchChannel(name)
	}

	getActiveChannel ()
	{
		return this.active;
	}

	switchChannel (name)
	{
		let c = this.getChannel(name);
		this.active = c;
		
		if(c == null)
			return;

		if(this.getActiveChannel() != null)
			this.getActiveChannel().btn.setAttribute("active", false);

		c.btn.setAttribute("active", true);
		let ct = this.root.getElementsByClassName("chat-text")[0];
		ct.replaceWith(c.e);

		c.e.scroll({
			top: c.e.scrollTopMax
		});
	}

	checkEnter(e)
	{
		if(e.key === "Enter") {
			this.sendMessage();
		}
	}

	sendMessage ()
	{
		let str = this.chatInput.value;
		if(str == "")
			return;
		this.chatInput.value = "";
		this.socket.send("chat", {str});
	}

	recieveMessage (channel, msg)
	{
		let c = this.getChannel(channel);
		
		if(c == null)
			return;
		
		let autoscroll = c.e.scrollTop == c.e.scrollTopMax;

		let csp = document.createElement("span");
		let tsp = document.createElement("span");

		if(msg.server === true){
			csp.style.color = "white";
			csp.style.backgroundColor = "black";
			csp.innerText = "[SERVER]";
			tsp.innerText = " " + msg.text;
		} else {
			csp.style.color = msg.color;
			csp.innerText = msg.user + ": ";
			tsp.innerText = msg.text;
		}
		
		let d = document.createElement("div");
		d.appendChild(csp);
		d.appendChild(tsp);

		c.e.appendChild(d);

		if(autoscroll)
			c.e.scroll({top: c.e.scrollTopMax});
	}

	clearChannel (name)
	{
		let c = this.getChannel(name);
		if(c == null)
			return;
		
		while(c.e.firstElementChild != null)
			c.e.firstElementChild.remove();
	}

	deleteChannel (name)
	{
		let c = this.getChannel(name);
		if(c == null)
			return;
		
		let id = this.chats.indexOf(c);
		if(this.isActive(name)) {
			if(id == 0 && this.chats.length > 1)
				this.switchChannel(this.chats[1].name);
			else
				this.switchChannel(this.chats[id - 1].name);
		}
			
		
		while(c.e.firstElementChild != null)
			c.e.firstElementChild.remove();
		
		c.btn.remove();

		this.chats.splice(this.chats.indexOf(c), 1);
	}

	toggle () {
		if(this.root.getAttribute("show") != "true")
			this.root.setAttribute("show", "true");
		else
			this.root.setAttribute("show", "false");
	}
}
