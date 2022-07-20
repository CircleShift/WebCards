'use strict';
// ###############
// # TopBar Code #
// ###############

// TopBar represents the bar at the top of the screen when client is in the lobby.

class TopBar{
	constructor (el, desktopSettings)
	{
		this.root = el;
		this.desktopSettings = desktopSettings;

		this.newGame = el.getElementsByClassName("new-game")[0];
		this.mobileSettings = el.getElementsByClassName("mobile-settings")[0];
		this.status = el.getElementsByClassName("status")[0];
	}

	// Set color of status bar
	setStatus (s) {
		this.status.setAttribute("s", s);
	}

	// Toggle showing the new game screen
	toggleNewGame () {
		if (this.newGame.style.display !== "none")
			this.newGame.style.display = "none";
		else
			this.newGame.style.display = "block";
	}

	// Toggle showing the mobile settings
	toggleMobileSettings (settings) {
		if (this.mobileSettings.style.display !== "none"){
			this.mobileSettings.style.display = "none";
			settings.putSettings(this.desktopSettings);
		} else {
			this.mobileSettings.style.display = "block";
			settings.putSettings(this.mobileSettings);
		}
	}

	mobileSettingsOpen() {
		return this.mobileSettings.style.display !== "none"
	}
}

// #############
// # Game code #
// #############

// Game represents a single game in the lobby view.  It has methods for setting up the elements and such.
class Game {
	constructor(options = {id: 0, name: "", password: false}, el)
	{
		this.getName = function () {
			return options.name;
		}

		let e = document.createElement("div");
		e.className = "game";

		let title = document.createElement("h2");
		title.textContent = options.name;
		e.appendChild(title);

		let join = document.createElement("button");
		join.className = "join";
		join.textContent = "Join";
		join.addEventListener("click", game.joinGame.bind(game, options.id));
		e.appendChild(join);

		if(usePass) {
			let pass = MakeInput.textInput("", "Game password");
			pass.classList.add("pass");
			e.appendChild(pass);

			this.getUserPass = function () {
				return pass.value;
			}
		}

		el.appendChild(e);

		this.remove = function () {
			e.remove();
		}
	}
}

// ##############
// # Lobby Code #
// ##############

// Lobby manages the players and games provided by the server and allows users to join or create their own games.
class Lobby {
	constructor (el)
	{
		this.root = el;

		this.e = {
			status: el.getElementsByClassName("status")[0],
			addr:   el.getElementsByClassName("addr")[0],
			games:  el.getElementsByClassName("games")[0],
			settings: el.getElementsByClassName("settings")[0],

			stats:  {
				game:       document.getElementById("game"),
				packs:      document.getElementById("packs"),
				online:     document.getElementById("online"),
				ingame:     document.getElementById("ingame"),
				pubgame:    document.getElementById("pubgame")
			}
		};

		this.top = new TopBar(
			document.getElementsByClassName("topbar")[0],
			this.e.settings
		);
		
		this.init = false;
		this.online = [];
		this.games = {};
		this.packs = [];
	}

	// Set initial pack list
	// {data array} array of strings representing pack names
	packList (data) {
		this.packs = data;
		this.top.setPacks(this.packs)
		this.e.stats.packs.innerText = this.packs.length();
	}

	// Set initial game list.
	// { data object } object containing {games} and {name}
	// { data.name string } name of the game the server runs
	// { data.games array } array of public games the server is running
	// { data.games[n].name } room name
	// { data.games[n].packs } list of the pack names used by this game
	// { data.games[n].id } room identifier (uuid)
	// { data.games[n].max } max players in room
	gameList (data) {
		while (this.e.games.firstChild != null) {
			this.e.games.remove(this.elements.games.firstChild)
		}

		for (let i of data.games) {
			let g = new Game(i, this.e.games);
			this.games.push(g);
		}

		this.e.stats.game.innerText = data.name;
		this.e.stats.pubgame.innerText = this.games.length();
	}

	// Set the initial player list.
	// { data object } player statistics from the server
	// { data.online number } players on server
	// { data.ingame number } players on server and in game
	players (data) {
		this.e.stats.online.innerText = data.online;
		this.e.stats.ingame.innerText = data.ingame;
	}

	// Called when a new public game is created on the server
	// { data object } the game object
	// { data.name } room name
	// { data.packs } list of the pack names used by this game
	// { data.id } room identifier (uuid)
	addGame (data) {
		let g = new Game(data, this.e.games);
		this.games.push(g);
	}

	// Called when a new public game is removed on the server
	// { data string } the uuid of the game to delete
	removeGame (data) {

	}

	// Called when the client wants to toggle the new game screen
	newGame () {
		//if(this.init) return;
		this.top.toggleNewGame();
	}

	// Called when the client wants to toggle the mobile settings screen
	mobileSettings (settings) {
		//if(this.init) return;
		this.top.toggleMobileSettings(settings);
	}

	// Called when the WebSocket state has changed.
	setState (text, s, server) {
		this.e.status.setAttribute("s", s);
		if(this.e.status.innerText != "Error" || ( this.e.status.innerText == "Error" && text != "Closed"))
			this.e.status.innerText = text;
		this.e.addr.innerText = server;
		this.top.setStatus(s);
	}

	getState () {
		return this.e.status.innerText.toLowerCase();
	}

	// Called when we are resetting the game.
	reset () {
		while (this.e.games.firstElementChild != null) {
			this.e.games.removeChild(this.e.games.firstElementChild)
		}

		this.setState("Connecting", "loading", this.e.addr.innerText);
		this.init = false;
	}
}
