'use strict';
const VERSION = "1.0.0";

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
		this.socket.addEventListener("menu", this.menu.bind(this));
		this.socket.addEventListener("game", this.game.bind(this));
		this.socket.addEventListener("chat", this.chat.bind(this));

		this.lobby = new Lobby(document.getElementsByClassName("lobby")[0], this.socket);

		this.drag = new MultiDrag();
		
		this.table = new Table(document.getElementsByClassName("table")[0], this.drag, this.socket);

		this.chat = new Chat(document.getElementsByClassName("chat")[0], this.socket);
		this.chat.addChannel("Global");
		this.chat.switchChannel("Global");

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
		alert("Connection error");
		this.lobby.setState("Error", "closed", this.socket.server);
		this.table.handleClose();
	}

	socketClose() {
		alert("Connection closed by server");
		this.lobby.setState("Closed", "closed", this.socket.server);
		this.table.handleClose();
	}

	// Callback when negotiating with the server for the first time and we are determining versions
	handshake (e)
	{
		let m = e.detail;
		switch (m.type) {
			case "verr":
				this.socket.close();
				
				alert(`Error connecting to server: version of client (${this.version}) not accepted.`);
				
				console.error(`Error connecting to server: version of client (${this.version}) not accepted.`);
				
				console.error(m.data);
				
				return;

			case "ready":
				console.log(`Handshake with server OK.  Running client version ${this.version}`);

				this.settings.cleanup();
				this.gameOptions.cleanup();
				
				this.settings = new Settings(m.data.user);
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
	menu (e)
	{
		let m = e.detail;
		switch (m.type) {
			case "plist":
				this.lobby.packList(m.data);
				break;
			case "glist":
				this.lobby.gameList(m.data, this.game);
				this.game = null;
				break;
			case "players":
				this.lobby.players(m.data);
				break;
			case "gdel":
				this.lobby.removeGame(m.data);
				break;
			case "gadd":
				this.lobby.addGame(m.data);
				break;
			case "pdel":
				this.lobby.removePlayer(m.data);
				break;
			case "padd":
				this.lobby.addPlayer(m.data);
				break;
			case "pmove":
				this.lobby.movePlayer(m.data);
				break;
		}
	}

	// Game switch, called when in game and a message arrives from the server
	game (e)
	{
		let m = e.detail;
		switch (m.type) {
			case "move":
				this.table.moveByID(m.data.card, m.data.deck, m.data.pos);
				break;
		}
	}

	// Callback when a chat event is recieved from the server
	chat (e)
	{
		let m = e.detail;
		switch (m.type) {
			case "delchan":
				this.chat.deleteChannel(m.data);
				break;
			case "newchan":
				this.chat.addChannel(m.data);
				break;
			
			case "message":
				this.chat.recieveMessage(m.data.type, m.data.data);
		}
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
		this.table.openTable();
	}

	leaveGame()
	{
		
	}
}
