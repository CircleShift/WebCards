'use strict';
// Table represents and manages the actual game.  It accepts inputs from the server and tries to query the server when the player makes a move.
class Table{
	constructor(e, drag, socket) {
		this.root = e;
		this.drag = drag;

		drag.addEventListener("dragstart", (e) => {console.log(e)});
		drag.addEventListener("dragstop", this.dragMsg.bind(this));

		this.socket = socket;

		this.decks = {};
		this.cards = {};
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
		
		this.decks = {};

		this.closeTable();
		this.drag.stopDraggingAll();
	}

	/*   Deck and card functions   */
	
	// {data object} contains deck id and options
	// {data.id any} identifier for deck.  Probably int or string.
	// {data.options object} Options as found in Deck constructor
	newDeck(data)
	{
		var d = new Deck(data.id, data.options);
		this.decks[data.id] = d;
		this.root.appendChild(d.e);
	}

	// {data object} contains data from server
	// {data.id} card id
	// {data.data} card data for visualization on the table
	// {data.deck} the id of the deck to add the card to
	newCard(data)
	{
		var c = new Card(data.id, data.data);
		this.cards[data.id] = c;
		this.decks[data.deck].appendCard(c);
		this.drag.addTarget(c.e);
	}

	// {data object} data from the server
	// {data.id any} card id to delete
	deleteCard(data)
	{
		//this.cards[data.id].getDeck().removeCardByID
		this.cards[data.id].e.remove();
		delete this.cards[data.id];
	}

	// {data object} data from the server
	// {data.id any} deck id to delete
	deleteDeck(data)
	{
		//for(let i of this.deck[data.id].cards)
		//this.deck[]
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

	// {data object} data from the server
	moveCard(card, newDeck, index = -1)
	{
		for(let d of this.decks)
		{
			if (d.removeCardByID(card.getID()) !== null)
				break;
		}
		card.resetPos();

		if(index < 0)
			newDeck.appendCard(card);
		else
			newDeck.addCardAt(card, index);
	}

	// {data object} data from the server
	// {data.cardID any} ID of the card to move
	// {data.deckID any} ID of the deck to move the card to
	// {data.index number} card index in the new deck
	moveByID(data)
	{
		let card, deck;
		for(let d of this.decks)
		{
			if (d.removeCardByID(cardID) !== null)
				break;
			let c = d.hasCard(cardID)
			if(c !== null)
				card = c;
			
			if(d.getID() == deckID)
				deck = d;
		}
	}

	checkMove(cardID, deckID, index = -1)
	{
		this.socket.send("game", {type: "move", card: cardID, deck: deckID, pos: index});
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
				this.checkMove(c.getID(), d.getID());
			else
				c.resetPos();
		}
	}
}
