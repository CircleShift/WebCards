'use strict';
// Table represents and manages the actual game.  It accepts inputs from the server and tries to query the server when the player makes a move.
class Table{
    constructor(e, drag, socket) {
        this.root = e;
        this.drag = drag;

        drag.addEventListener("dragstart", (e) => {console.log(e)});
        drag.addEventListener("dragstop", this.dragMsg.bind(this));

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
    newDeck(id, options)
    {
        var d = new Deck(id, options);
        this.decks.push(d);
        this.root.appendChild(d.e);
    }

    newCard(id, data, deck = 0)
    {
        var c = new Card(id, data);
        this.decks[deck].appendCard(c);
        this.drag.addTarget(c.e);
    }

    checkDeck(x, y)
    {
        for(let d of this.decks)
        {
            if(d.isInside(x, y))
                return d;
        }
        return null;
    }

    checkCard (el)
    {
        for(let d of this.decks)
        {
            let c = d.checkCard(el);
            if(c !== null)
                return c;
        }
        return null;
    }

    moveCard(card, newDeck)
    {
        for(let d of this.decks)
        {
            if (d.removeCardByID(card.getID()) !== null)
                break;
        }
        card.resetPos();
        newDeck.appendCard(card);
    }

    moveByID(cardID, deckID)
    {
        let card, deck;
        for(let d of this.decks)
        {
            let c = d.hasCard(cardID)
            if(c !== null)
                card = c;
            
            if(d.getID() == deckID)
                deck = d;
        }

        this.moveCard(card, deck);
    }

    checkMove(cardID, deckID)
    {
        this.socket.send("game", {});
    }

    dragCheck(cap)
    {
        console.log(cap);
    }

    dragMsg (event)
    {
        if(event.drag.length < 1)
            return;

        var c = this.checkCard(event.drag[0].e);
        var d = this.checkDeck(event.x, event.y);

        if(c !== null)
        {
            if(d !== null)
                this.moveCard(c, d);
            else
                c.resetPos();
        }
    }
}
