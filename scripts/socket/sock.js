'use strict';

const VALID_EVENTS = ["error", "closed", "handshake", "menu", "game", "chat", "ping"];

// A wrapper around the wrapper 
class SockWorker extends EventTarget{

	constructor (serveraddr, version)
	{
		super();

		this.server = serveraddr;
		this.version = version;
		this.handshake = false;
	}

	// Initialize the connection.
	init () {
		this.handshake = false;
		if(this.server == "" || this.server == null) {
			return;
		}
		try {
			this.socket = new WebSocket(this.server);

			this.socket.addEventListener("open", this.o.bind(this));
			this.socket.addEventListener("message", this.msg.bind(this));

			this.socket.addEventListener("closed", this.c.bind(this));
			this.socket.addEventListener("error", this.err.bind(this));
		} catch (e) {
			this.err();
		}
	}

	// Called when the connection connects to the server
	o () {
		this.send("version", this.version);
	}

	// Called when the connection gets a message from the server
	// Attempts to turn the message into a usable object and pass it to the callback
	msg (e) {
		if(typeof e.data == "string") {
			let dat = JSON.parse(e.data);

			if (!this.handshake) {
				if (dat.type == "ready")
					this.handshake = true;
				this.dispatchEvent(new CustomEvent("handshake", {detail: dat.type}));
				return;
			}
			
			if (VALID_EVENTS.includes(dat.type))
				this.dispatchEvent(new CustomEvent(dat.type, {detail: dat.data}));
		}
	}

	// Called when the connection closes.
	// Passes a close object to the callback.
	c () {
		this.dispatchEvent(new Event("closed"));
	}

	// Called when the connection encounters an error.
	// Passes an error to the callback
	err () {
		this.dispatchEvent(new Event("error"));
	}

	// Call to close the connection to the server
	close () {
		this.socket.close();
	}

	// Send a message to the server
	send (type, data) {
		let m = new Message(type, data);
		this.socket.send(m.stringify())
	}

	// Raw message the server
	sendRaw (s) {
		this.socket.send(s)
	}
}
