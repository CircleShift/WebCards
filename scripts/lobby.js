// Lobby manages the players and games provided by the server and allows users to join or create their own games.
function Lobby(el){
    this.root = el;

    this.elements = {
        status: this.root.getElementsByClassName("status")[0],
        addr:   this.root.getElementsByClassName("addr")[0],
        games:  this.root.getElementsByClassName("games")[0],

        stats:  {
            game:       document.getElementById("game"),
            packs:      document.getElementById("packs"),
            online:     document.getElementById("online"),
            ingame:     document.getElementById("ingame"),
            pubgame:    document.getElementById("pubgame")
        },

        settings: {
            name:   document.getElementById("name"),
            color:  document.getElementById("usercolor")
        }
    };

    this.top = new TopBar(document.getElementsByClassName("topbar")[0]);
    
    this.init = false;
    this.online = [];
    this.games = [];
    this.packs = [];
    this.players = [];
}

Lobby.prototype = {
    // Set initial pack list
    // {data array} array of strings representing pack names
    packList: function(data) {
        this.packs = data;
        this.top.setPacks(this.packs)
        this.elements.stats.packs.innerText = this.packs.length();
    },

    // Set initial game list.
    // { data object } object containing {games} and {name}
    // { data.name string } name of the game the server runs
    // { data.games array } array of public games the server is running
    // { data.games[n].name } room name
    // { data.games[n].packs } list of the pack names used by this game
    // { data.games[n].id } room identifier (uuid)
    gameList: function(data) {
        while (this.elements.games.firstChild != null) {
            this.elements.games.remove(this.elements.games.firstChild)
        }

        for (let i in data.games) {
            let gel = new GameEl(i.name, i.packs, i.id);
            this.games.push(gel);
            this.elements.games.appendChild(gel.getElement());
        }

        this.elements.stats.game.innerText = data.name;
        this.elements.stats.pubgame.innerText = this.games.length();
    },

    // Set the initial player list.
    // { data array } represents a list of player objects from the server
    // { data[n].name string } name of the player
    // { data[n].game string } id of the game room (empty if not in game).
    // { data[n].color string } css color chosen by player.
    // { data[n].uuid string } uuid of the player
    players: function(data) {

        this.elements.stats.online.innerText = this.players.length();
        this.init = true;
    },

    // Called when a new public game is created on the server
    // { data object } the game object
    // { data.name } room name
    // { data.packs } list of the pack names used by this game
    // { data.id } room identifier (uuid)
    addGame: function(data) {

    },

    // Called when a new public game is removed on the server
    // { data string } the uuid of the game to delete
    removeGame: function(data) {

    },

    // Called when a new player enters the lobby.
    // { data object } an object representing the player
    // { data.name string } name of the player
    // { data.game string } id of the game room (empty if not in game).
    // { data.color string } css color chosen by player.
    // { data.uuid string } uuid of the player
    addPlayer: function(data) {

    },

    // Called when a player modifies their settings in the lobby.
    // { data object } new player settings
    // { data.name string } non null if the player has changed their name
    // { data.color string } non null if the player has changed their color
    // { data.uuid string } uuid of player changing their settings
    modPlayer: function(data) {

    },

    // Called when a player moves between the lobby and a game, or between two games
    // { data object } new location
    // { data.player } uuid of player changing location
    // { data.loc } uuid of room player is moving to (empty if moving to lobby)
    movePlayer: function(data) {

    },

    // Called when a player exits the game (from lobby or game)
    // {data string } uuid of player
    removePlayer: function(data) {

    },

    // Called when the client wants to toggle the new game screen
    newGame: function() {
        //if(this.init) return;
        this.top.toggleNewGame();
    },

    // Called when the client wants to toggle the mobile settings screen
    mobileSettings: function() {
        //if(this.init) return;
        this.top.toggleMobileSettings();
    },

    // Called when the WebSocket state has changed.
    setState: function(text, color, server) {
        this.elements.status.style.backgroundColor = color;
        this.elements.status.innerText = text;
        this.elements.addr.innerText = server;
        this.top.setColor(color);
    },

    // Called when we are resetting the game.
    reset: function() {
        while (this.elements.games.firstChild != null) {
            this.elements.games.remove(this.elements.games.firstChild)
        }

        this.setState("Connecting", "#DA0", this.elements.addr.innerText);
        this.init = false;
    }
};

// ###############
// # TopBar Code #
// ###############

// TopBar represents the bar at the top of the screen when client is in the lobby.

function TopBar(el) {
    this.root = el;

    this.newGame = el.getElementsByClassName("new-game")[0];
    this.mobileSettings = el.getElementsByClassName("mobile-settings")[0];
    this.status = el.getElementsByClassName("status")[0];
}

TopBar.prototype = {
    // Set color of status bar
    setColor: function(color) {
        this.status.style.backgroundColor = color;
    },

    // Toggle showing the new game screen
    toggleNewGame: function() {
        if (this.newGame.style.display !== "none")
            this.newGame.style.display = "none";
        else
            this.newGame.style.display = "block";
    },

    // Toggle showing the mobile settings
    toggleMobileSettings: function() {
        if (this.mobileSettings.style.display !== "none")
            this.mobileSettings.style.display = "none";
        else
            this.mobileSettings.style.display = "block";
    }
};

// #############
// # Game code #
// #############

// GameEl represents a single game in the lobby view.  It has methods for setting up the elements and such.

function GameEl(name, packs, id) {

}