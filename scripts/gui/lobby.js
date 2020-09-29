// ###############
// # TopBar Code #
// ###############

// TopBar represents the bar at the top of the screen when client is in the lobby.

class TopBar{
    constructor (el)
    {
        this.root = el;

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
    toggleMobileSettings () {
        if (this.mobileSettings.style.display !== "none")
            this.mobileSettings.style.display = "none";
        else
            this.mobileSettings.style.display = "block";
    }
}

// #############
// # Game code #
// #############

// Game represents a single game in the lobby view.  It has methods for setting up the elements and such.
function createGameEl (options = {id: 0, name: ""}, el)
{
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

    el.appendChild(e);
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

        this.top = new TopBar(document.getElementsByClassName("topbar")[0]);
        
        this.init = false;
        this.online = [];
        this.games = [];
        this.packs = [];
        this.players = [];
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

        for (let i in data.games) {
            let gel = new Game(i.name, i.packs, i.id);
            this.games.push(gel);
            this.e.games.appendChild(gel.getElement());
        }

        this.e.stats.game.innerText = data.name;
        this.e.stats.pubgame.innerText = this.games.length();
    }

    // Set the initial player list.
    // { data array } represents a list of player objects from the server
    // { data[n].name string } name of the player
    // { data[n].game string } id of the game room (empty if not in game).
    // { data[n].color string } css color chosen by player.
    // { data[n].uuid string } uuid of the player
    players (data) {

        this.e.stats.online.innerText = this.players.length();
        this.init = true;
    }

    // Called when a new public game is created on the server
    // { data object } the game object
    // { data.name } room name
    // { data.packs } list of the pack names used by this game
    // { data.id } room identifier (uuid)
    addGame (data) {
        createGameEl(data, this.e.games);
    }

    // Called when a new public game is removed on the server
    // { data string } the uuid of the game to delete
    removeGame (data) {

    }

    // Called when a new player enters the lobby.
    // { data object } an object representing the player
    // { data.name string } name of the player
    // { data.game string } id of the game room (empty if not in game).
    // { data.color string } css color chosen by player.
    // { data.uuid string } uuid of the player
    addPlayer (data) {

    }

    // Called when a player modifies their settings in the lobby.
    // { data object } new player settings
    // { data.name string } non null if the player has changed their name
    // { data.color string } non null if the player has changed their color
    // { data.uuid string } uuid of player changing their settings
    modPlayer (data) {

    }

    // Called when a player moves between the lobby and a game, or between two games
    // { data object } new location
    // { data.player } uuid of player changing location
    // { data.loc } uuid of room player is moving to (empty if moving to lobby)
    movePlayer (data) {

    }

    // Called when a player exits the game (from lobby or game)
    // { data string } uuid of player
    removePlayer (data) {

    }

    // Called when the client wants to toggle the new game screen
    newGame () {
        //if(this.init) return;
        this.top.toggleNewGame();
    }

    // Called when the client wants to toggle the mobile settings screen
    mobileSettings () {
        //if(this.init) return;
        this.top.toggleMobileSettings();
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
