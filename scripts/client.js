'use strict';
const VERSION = "1";

const DefaultUserOps = {
	color: {
		type: "color",
		title: "Player Color",
		args: ["#ff0000"]
	},
	name: {
		type: "text",
		title: "Player Name",
		args: ["User " + Math.floor(Math.random() * 10000), ""]
	}
}

const DefaultGameOps = {
	name: {
		type:"text",
		title: "Room Name",
		args: ["", ""]
	},
	hidden: {
		type: "checkbox",
		title: "Unlisted",
		args: []
	},
	usePass: {
		type: "checkbox",
		title: "Use Password",
		args: []
	},
	pass: {
		type: "text",
		title: "Set Password",
		args: [Math.floor(Math.random() * 10000), ""]
	}
}

// Client acts as the message hub for the whole game.
// WebSocket messages come into Client and Client redirects them to the lobby or table based on the state of the game.
// Client also performs the handshake for first starting the connection and messages everyone if the connection errors or closes.
class Client{

	constructor (serveraddr, game)
	{
		this.socket = new SockWorker(serveraddr, VERSION);
		this.socket.addEventListener("error", this.socketError.bind(this));
		this.socket.addEventListener("closed", this.socketClose.bind(this));
		this.socket.addEventListener("handshake", this.handshake.bind(this));
		this.socket.addEventListener("menu", this.menuMsg.bind(this));
		this.socket.addEventListener("game", this.gameMsg.bind(this));
		this.socket.addEventListener("chat", this.chatMsg.bind(this));
		this.socket.addEventListener("ping", this.pingMsg.bind(this));

		this.lobby = new Lobby(document.getElementsByClassName("lobby")[0], this.socket);
		this.lobby.setState("Connecting", "loading", this.socket.server);

		this.drag = new MultiDrag();
		
		this.table = new Table(document.getElementsByClassName("table")[0], this.drag, this.socket);

		this.chat = new Chat(document.getElementsByClassName("chat")[0], this.socket);
		this.chat.addChannel({name: "Global", id: "global", follow: true});

		this.settings = new Settings(DefaultUserOps);
		this.settings.putSettings(this.lobby.e.settings);

		this.gameOptions = new Settings(DefaultGameOps);
		this.gameOptions.putSettings(this.lobby.top.newGame);

		this.game = game;
	}

	// Initialize the connection
	init ()
	{
		this.socket.init();
	}

	// Callbacks for if the socket fails or closes

	socketError() {
		this.lobby.setState("Error", "closed", this.socket.server);
		this.table.handleClose();
	}

	socketClose() {
		this.lobby.setState("Closed", "closed", this.socket.server);
		this.table.handleClose();
	}

	// Callback when negotiating with the server for the first time and we are determining versions
	handshake (e)
	{
		let m = e.detail
		switch (m.type) {
			case "verr":
				this.socket.close();
				
				alert(`Error connecting to server: version of client (${VERSION}) not accepted.`);
				
				console.error(`Error connecting to server: version of client (${VERSION}) not accepted.`);
				
				console.error(m.data);
				
				return;

			case "ready":
				console.log(`Handshake with server OK.  Running client version ${VERSION}`);

				this.lobby.setState("Connected", "ok", this.socket.server)

				this.settings.cleanup();
				this.gameOptions.cleanup();
				
				this.settings = new Settings(m.data.user);
				this.settings.addEventListener("change", (() => {this.socket.send("options", this.settings.getSettings())}).bind(this));
				
				this.gameOptions = new Settings(m.data.game);

				this.gameOptions.putSettings(this.lobby.top.newGame);
				
				if(this.lobby.top.mobileSettingsOpen())
					this.settings.putSettings(this.lobby.top.mobileSettings);
				else
					this.settings.putSettings(this.lobby.e.settings);
				
				this.socket.send("ready", "");
				
				return;
		}
	}

	// Menu switch, called when in the lobby and a message arrives from the server
	menuMsg (e)
	{
		let m = e.detail;

		if (LOBBY_RPC.includes(m.type))
			this.lobby[m.type](m.data);
	}

	// Game switch, called when in game and a message arrives from the server
	gameMsg (e)
	{
		let m = e.detail;

		if (TABLE_RPC.includes(m.type))
			this.table[m.type](m.data);
	}

	// Callback when a chat event is recieved from the server
	chatMsg (e)
	{
		let m = e.detail;

		if (CHAT_RPC.includes(m.type))
			this.chat[m.type](m.data);
	}

	pingMsg(e)
	{
		this.socket.send("pong", "");
	}

	// Reset the lobby and table, then attempt to reopen the connection to the server.
	reset ()
	{
		this.lobby.reset();
		this.table.reset();

		this.socket.init();
	}

	joinGame(id)
	{
		this.lobby.setState("Joining...", "loading", this.socket.server);
		this.socket.send("join", {id: id, pass: this.lobby.games[id].getPass()});
	}

	leaveGame()
	{
		this.socket.send("leave", "");
	}
}

// Global init of the game variable

let game;

(() => {
	let params = new URLSearchParams((new URL(window.location)).search);
	game = new Client(params.get("s"), params.get("g"));
	game.init();
})();