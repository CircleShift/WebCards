// Client acts as the message hub for the whole game.
// WebSocket messages come into Client and Client redirects them to the lobby or table based on the state of the game.
// Client also performs the handshake for first starting the connection and messages everyone if the connection errors or closes.
function Client(serveraddr, game) {
    this.state = "handshake";
    
    this.soc = new SockWorker(serveraddr, "1", this.cb.bind(this));

    this.lob = new Lobby(document.getElementsByClassName("lobby")[0], this.soc);
    this.tab = new Table(document.getElementsByClassName("table")[0], this.soc);

    this.game = game;
}

Client.prototype = {
    init: function() {
        this.soc.init();
    },

    // Entry point for a message.
    // If it's a close message, the
    cb: function(m) {
        console.log(m);

        if(m.type == "error" || m.type == "closed") {
            var t = m.type;
            t = t[0].toUpperCase() + t.slice(1)
            this.lob.setState(t, "#D00", this.soc.server);
            this.tab.handleClose();
            return;
        }

        switch(this.state) {
            case "handshake":
                this.handshake(m);
                break;
            case "lobby":
                this.lobby(m);
                break;
            case "game":
                break;
        }
    },

    handshake: function(m) {
        switch (m.type) {
            case "verr":
                this.soc.close();
                alert(`Error connecting to server: version of client (${this.version}) not accepted.`);
                console.error("Error connecting to server: version of client (${this.version}) not accepted.");
                console.error(m.data);
                return;
            case "lobby":
                this.state = "lobby";
                this.soc.send("ready", "");
                return;
        }
    },

    lobby: function (m) {
        switch (m.type) {
            case "plist":
                this.lob.packList(m.data);
                break;
            case "glist":
                this.lob.gameList(m.data, this.game);
                this.game = null;
                break;
            case "players":
                this.lob.players(m.data);
                break;
            case "gdel":
                this.lob.removeGame(m.data);
                break;
            case "gadd":
                this.lob.addGame(m.data);
                break;
            case "pdel":
                this.lob.removePlayer(m.data);
                break;
            case "padd":
                this.lob.addPlayer(m.data);
                break;
            case "pmove":
                this.lob.movePlayer(m.data);
                break;
        }
    },

    game: function (m) {
        switch (m.type) {
            
        }
    },

    // Reset the lobby and table, then attempt to reopen the connection to the server.
    reset: function() {
        this.state = "handshake";

        this.lob.reset();
        this.tab.reset();

        this.soc.init();
    }
};
