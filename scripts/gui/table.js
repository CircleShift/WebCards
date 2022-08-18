'use strict';

const TABLE_RPC = ["newDeck", "newCard", "deleteDeck", "deleteCard", "moveCard", "swapCard"]

// Table represents and manages the actual game.  It accepts inputs from the server and tries to query the server when the player makes a move.
class Table{
	constructor(e, drag, socket) {
		this.root = e;
		this.drag = drag;
		this.drag.transform = this.getTransform.bind(this);

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
		if(state == "close" || state == "closed") {
			this.root.setAttribute("state", "closed");
			setTimeout(this.root.setAttribute.bind(this.root), 50, "state", "open");
		}
	}

	// Make the table element not visible
	closeTable ()
	{
		let state = this.root.getAttribute("state")
		if((state != "close" && state != "closed") && state != "") {
			this.root.setAttribute("state", "");
			setTimeout(this.root.setAttribute.bind(this.root), 50, "state", "close");
		}
	}

	toggleTable ()
	{
		let state = this.root.getAttribute("state")
		if(state == "close" || state == "closed")
			this.openTable();
		else if (state == "open")
			this.closeTable()
	}

	// Handle a game closing (expectedly or unexpectedly)
	handleClose ()
	{
		this.reset();
	}

	// Should reset all internal objects and delete all dangling decks and cards.
	reset ()
	{
		for (let e of this.root.children) {
			if(e.tagName !== "DRAG") {
				e.remove();
			}
		}
		
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
		let d = new Deck(data.id, data.options);
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
		let c = new Card(data.id, data.deck, data.data);
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
			delete this.cards[this.decks[id].cards[i].id];
			this.decks[id].removeCard(i);
		}
		delete this.deck[id];
	}

	// Delete a card
	// {id any} id of card to delete
	deleteCard(id)
	{
		let c = this.cards[id];
		this.decks[c.deck].removeCardByID(id)
		c.e.remove();
		delete this.cards[id];
	}

	// Move a card from one deck to another
	// {data object} data from the server
	// {data.card any} ID of the card to move
	// {data.deck any} ID of the deck to move the card to
	// {data.index number} card index in the new deck
	moveCard(data)
	{
		let c = this.cards[data.card];
		this.decks[c.deck].removeCardByID(data.card);
		this.decks[data.deck].addCardAt(c, data.index);
		c.resetPos();
		c.e.className = "";
	}

	// Swap card data with new data
	// {data object} data from the server
	// {data.card any} ID of the card to swap
	// {data.id any} New ID for the card
	// {data.data object} visualization data
	swapCard(data)
	{
		// Can't swap a card into a an id of a pre-existing card.
		if (this.cards[data.id] != null) {
			return false;
		}
		this.cards[data.id] = this.cards[data.card];
		delete this.cards[data.card];
		this.cards[data.id].generateElements(data.data);
	}


	/*    Internal functions    */

	// Check if a position is within a deck
	checkDeck(x, y)
	{
		for(let d of Object.keys(this.decks))
		{
			if(this.decks[d].isInside(x, y))
				return d;
		}
		return null;
	}

	// Function to query the server about a player's move
	checkMove(cardID, deckID, index = -1)
	{
		this.socket.send("move", {card: cardID, deck: deckID, index: index});
	}

	getTransform(x, y)
	{
		let rot = 0, scale = 0, dtot = 0;

		for(let d in this.decks ) {
			let r = parseFloat(this.decks[d].e.style.getPropertyValue("--rot"));
			let s = parseFloat(this.decks[d].e.style.getPropertyValue("--scale"));

			//
			//TODO: Some code to properly weight the importance of scale and rotation
			// Hopefully this can be done in one pass
			let f = 1/this.decks[d].dist(x, y);
			let tot = dtot + f;
			rot = rot*(dtot/tot) + r*(f/tot);
			scale = scale*(dtot/tot) + s*(f/tot);
			dtot += tot;
		}

		return [rot, scale];
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

		let c = event.drag[0];
		let d = this.checkDeck(event.x, event.y);

		if(c.e.card !== null)
		{
			let id = c.e.card.id;
			if(d !== null && !this.decks[d].hasCard(id))
				this.checkMove(id, d);
			else {
				c.ep.appendChild(c.e)
				c.e.card.resetPos();
			}
		}
	}
}
