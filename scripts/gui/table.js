// Table represents and manages the actual game.  It accepts inputs from the server and tries to query the server when the player makes a move.
class Table{
    constructor(e, drag, socket) {
        this.root = e;
        this.drag = drag;

        drag.addEventListener("dragstart", (e) => {console.log(e)});
        drag.addEventListener("dragstop", (e) => {console.log(e)});

        this.socket = socket;

        this.decks = [];
    }

    openTable ()
    {
        let state = this.root.getAttribute("state")
        if((state == "close" || state == "closed") && state != "") {
            this.root.setAttribute("state", "closed");
            setTimeout(this.root.setAttribute.bind(this.root), 50, "state", "open");
        }
    }

    closeTable ()
    {
        let state = this.root.getAttribute("state")
        if(state != "close" && state != "closed") {
            this.root.setAttribute("state", "");
            setTimeout(this.root.setAttribute.bind(this.root), 50, "state", "close");
        }
    }

    handleClose ()
    {
        this.reset();
    }

    reset ()
    {
        while(this.root.firstElementChild != null)
            this.root.firstElementChild.remove();
        
        this.decks = [];

        this.closeTable();
        this.drag.stopDraggingAll();
    }

    /*   Deck and card functions   */
    newDeck(options)
    {
        var d = new Deck(options);
        this.decks.push(d);
        this.root.appendChild(d.e);
    }

    newCard(data, deck = 0)
    {
        var c = new Card(data);
        this.decks[deck].appendCard(c);
        this.drag.addTarget(c.e);
    }

    checkDeck(x, y)
    {
        for(let d of this.decks)
        {
            if(d.isInside(x, y))
                return true;
        }
        return false;
    }

    dragCheck(cap)
    {
        console.log(cap);
    }
}
