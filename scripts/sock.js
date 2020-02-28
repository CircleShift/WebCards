// A wrapper around the wrapper 
function SockWorker(serveraddr, version, callback) {
    this.server = serveraddr;
    this.version = version;
    this.cb = callback;
}

SockWorker.prototype = {
    // Initialize the connection.
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

    // Called when the connection connects to the server
    o: function() {
        this.send("version", this.version);
    },

    // Called when the connection gets a message from the server
    // Attempts to turn the message into a usable object and pass it to the callback
    msg: function(e) {
        if(typeof e.data == "string") {
            var dat = JSON.parse(e.data)
            this.cb(dat);
        }
    },

    // Called when the connection closes.
    // Passes a close object to the callback.
    c: function() {
        this.cb({type: "close", data: ""});
    },

    // Called when the connection encounters an error.
    // Passes an error to the callback
    err: function() {
        this.cb({type: "error", data: ""});
    },
    
    // Call to close the connection to the server
    close: function() {
        this.socket.close();
    },

    // Send a message to the server
    send: function(type, data) {
        var m = new Message(type, data);
        this.socket.send(m.stringify())
    }
};