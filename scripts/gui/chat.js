'use strict';

const CHAT_RPC = ["addChannel", "recieveMessage", "deleteChannel"]

class Chat {
	constructor(e, soc)
	{
		this.chats = {};
		this.active = null;
		this.root = e;
		this.socket = soc;
		e.getElementsByClassName("toggle-chat")[0].onclick = this.toggle.bind(this);
		let cin = e.getElementsByClassName("chat-input")[0];
		this.chatInput = cin.children[0];

		cin.getElementsByTagName("input")[0].addEventListener("keydown", this.checkEnter.bind(this));
		cin.getElementsByTagName("button")[0].addEventListener("click", this.sendMessage.bind(this));
	}

	isActive (name)
	{
		if(this.active !== null)
			return this.active.name === name;

		return false;
	}

	addChannel (dat)
	{
		if(typeof dat.id !== "string")
			return;
		
		if(this.chats[dat.id] != null)
			return;

		let d = document.createElement("div");
		let b = document.createElement("button");

		this.root.getElementsByClassName("chat-select")[0].appendChild(b);

		b.setAttribute("active", false);

		b.onclick = this.switchChannel.bind(this, dat.id);

		b.innerText = dat.name;

		d.className = "chat-text";

		this.chats[dat.id] = {name: dat.name, id: dat.id, e: d, btn: b};

		if(dat.follow)
			this.switchChannel(dat.id)
	}

	getActiveChannel ()
	{
		return this.active;
	}

	switchChannel (id)
	{
		let c = this.chats[id];
		
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

		this.active = c;
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
		this.socket.send("chat", {channel: this.getActiveChannel().id, text: str});
	}

	recieveMessage (msg)
	{
		let c = this.chats[msg.channel];
		
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

	clearChannel (id)
	{
		let c = this.chats[id];
		if(c == null)
			return;
		
		while(c.e.firstElementChild != null)
			c.e.firstElementChild.remove();
	}

	deleteChannel (id)
	{
		let c = this.chats[id];
		if(c == null || id === "global")
			return;
		
		if(this.isActive(id)) {
			this.switchChannel("global");
		}
			
		
		while(c.e.firstElementChild != null)
			c.e.firstElementChild.remove();
		
		c.btn.remove();

		delete this.chats[id];
	}

	toggle () {
		if(this.root.getAttribute("show") != "true")
			this.root.setAttribute("show", "true");
		else
			this.root.setAttribute("show", "false");
	}
}
