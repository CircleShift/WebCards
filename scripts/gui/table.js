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

	//  GUI related functions

	// Make the table element visible
	openTable ()
	{
		let state = this.root.getAttribute("state")
		if((state == "close" || state == "closed") && state != "") {
			this.root.setAttribute("state", "closed");
			setTimeout(this.root.setAttribute.bind(this.root), 50, "state", "open");
		}
	}

	// Make the table element not visible
	closeTable ()
	{
		let state = this.root.getAttribute("state")
		if(state != "close" && state != "closed") {
			this.root.setAttribute("state", "");
			setTimeout(this.root.setAttribute.bind(this.root), 50, "state", "close");
		}
	}

	// Handle a game closing (expectedly or unexpectedly)
	handleClose ()
	{
		this.reset();
	}

	// Should reset all internal objects and delete all dangling decks and cards.
	reset ()
	{
		while(this.root.firstElementChild != null)
			this.root.firstElementChild.remove();
		
		this.decks = {};
		this.cards = {};

		this.closeTable();
		this.drag.stopDraggingAll();
	}

	/*   Main API for server RPC   */
	
	// Create a new deck
	// {data object} data from the server
	// {data.id any} identifier for deck.  Probably int or string.
	// {data.options object} options as found in Deck constructor
	newDeck(data)
	{
		var d = new Deck(data.id, data.options);
		this.decks[data.id] = d;
		this.root.appendChild(d.e);
	}

	// Create a new card
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

	// Delete a deck
	// {id any} id of deck to delete
	deleteDeck(id)
	{
		this.decks[id].e.remove();
		for(let i in this.decks[id].cards)
		{
			delete this.cards[this.decks[id].cards[i].getID()];
			this.decks[id].removeCard(i);
		}
		delete this.deck[id];
	}

	// Delete a card
	// {id any} id of card to delete
	deleteCard(id)
	{
		this.cards[id].getDeck().removeCardByID(id)
		this.cards[id].e.remove();
		delete this.cards[id];
	}

	// Move a card from one deck to another
	// {data object} data from the server
	// {data.cardID any} ID of the card to move
	// {data.deckID any} ID of the deck to move the card to
	// {data.index number} card index in the new deck
	moveByID(data)
	{
		this.cards[data.cardID].getDeck().removeCardByID(data.cardID);
		this.decks[data.deckID].addCardAt(this.cards[data.cardID], data.index);
	}


	/*    Internal functions    */

	// Check if a position is within a deck
	checkDeck(x, y)
	{
		for(let d of this.decks)
		{
			if(d.isInside(x, y))
				return d;
		}
		return null;
	}

	// Function to query the server about a player's move
	checkMove(cardID, deckID, index = -1)
	{
		this.socket.send("game", {type: "move", card: cardID, deck: deckID, pos: index});
	}


	// DRAG DEBUGGING

	// Generic check function for drag debugging
	dragCheck(cap)
	{
		console.log(cap);
	}

	// More debugging for the drag class
	dragMsg (event)
	{
		if(event.drag.length < 1)
			return;

		var c = event.drag[0].e.card;
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
