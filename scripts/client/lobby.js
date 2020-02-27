// Lobby manages the players and games provided by the server and allows users to join or create their own games.
function Lobby(el){
    this.root = el;

    this.elements = {
        status: this.root.getElementsByClassName("status")[0],
        addr:   this.root.getElementsByClassName("addr")[0],

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
    packList: function(data){

        this.elements.stats.packs.innerText = this.packs.length();
    },

    gameList: function(data, game){

        this.elements.stats.pubgame.innerText = this.games.length();
    },

    players: function(data) {

        this.elements.stats.online.innerText = this.players.length();
        this.init = true;
    },

    addGame: function(data){

    },

    removeGame: function(data){

    },

    addPlayer: function(data){

    },

    movePlayer: function(data){

    },

    removePlayer: function(data){

    },

    newGameScreen: function(){
        if(this.init) return;
    },

    setState: function(text, color, server){
        this.elements.status.style.backgroundColor = color;
        this.elements.status.innerText = text;
        this.elements.addr.innerText = server;
        this.top.setColor(color);
    },

    reset: function(){
        this.setState("Connecting", "#DA0", this.elements.addr.innerText);
        this.init = false;
    }
};

// ###############
// # TopBar Code #
// ###############

function TopBar(el) {
    this.root = el;

    this.newGame = el.getElementsByClassName("new-game")[0];
    this.mobileSettings = el.getElementsByClassName("mobile-settings")[0];
    this.status = el.getElementsByClassName("status")[0];
}

TopBar.prototype = {
    setColor: function(color) {
        this.status.style.backgroundColor = color;
    }
};
