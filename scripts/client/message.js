function Message(type, data){
    this.t = type;
    this.d = data;
}

Message.prototype = {
    stringify: function(){
        var dat = this.d
        if(typeof dat !== "string"){
            dat = JSON.stringify(dat);
        }
        return JSON.stringify({type: this.t, data: dat});
    }
};
