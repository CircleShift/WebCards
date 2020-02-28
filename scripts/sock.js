function SockWorker(serveraddr, version, callback) {
    this.server = serveraddr;
    this.version = version;
    this.cb = callback;
}

SockWorker.prototype = {
    init: function() {
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
    },

    o: function() {
        this.send("version", this.version);
    },

    msg: function(e) {
        if(typeof e.data == "string") {
            var dat = JSON.parse(e.data)
            this.cb(dat);
        }
    },

    c: function() {
        this.cb({type: "close", data: ""});
    },

    err: function() {
        this.cb({type: "error", data: ""});
    },

    close: function() {
        this.socket.close();
    },

    send: function(type, data) {
        var m = new Message(type, data);
        this.socket.send(m.stringify())
    }
};