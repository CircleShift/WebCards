'use strict';

// Deck class represents multiple cards.
// Can be arranged in multiple ways.
// Decks work as FIFO
class Deck {

	cards = [];
	inf = false;
	smode = "";
	sct = 0;
	x = 0;
	y = 0;
	e = null;

	constructor(id, options = {mode: "stack", smode: "one", sct: 0, pos: [0, 0, 0, 1]})
	{
		// View mode
		//  infdraw - infinite draw. always appears as if there are multiple cards
		//  stack - stack mode
		//  strip
		//      horizontal
		//          left (strip-hl)
		//          right (strip-hr)
		//      vertical
		//          up (strip-vu)
		//          down (strip-vd)
		this.inf = options.mode == "infdraw";

		// Select mode - controls what other cards are selected when one card is selected
		//  above - selectes cards above the selected one
		//  below - selects cards below the selected one
		//  around - selects cards above and below
		//  one - selects only card chosen
		//  all - selects all cards when card selected
		this.smode = options.smode;
		
		// Select count (negative defaults to 0)
		//  above - controls number of cards above clicked are selected
		//  below - controls number of cards below clicked are selected
		//  around
		//      number - number above and below selected
		//      array - [first number: number above selected] [second number: number below selected]
		//  one - no effect
		//  all - no effect
		this.sct = options.sct > 0 ? options.sct : 0;
		
		this.e = document.createElement("deck");

		// x and y values are on a scale from 0 to 1, 0 being top left, 1 being bottom right.
		this.e.style.setProperty("--x", options.pos[0]);
		this.e.style.setProperty("--y", options.pos[1]);
		this.e.style.setProperty("--rot", options.pos[2] + "deg");
		this.e.style.setProperty("--scale", options.pos[3]);
		
		this.e.setAttribute("mode", options.mode);

		this.e.deck = this;

		this.getID = function() {
			return id;
		}
	}

	updatePos()
	{
		let len = this.cards.length - 1;
		for(let i in this.cards)
			this.cards[i].setPos(len-i);
		this.updateCount();
	}

	appendCard(card)
	{
		if(this.inf) {
			return false;
		}
		this.cards.push(card);
		this.e.appendChild(card.e);
		this.updatePos();
		return true;
	}

	prependCard(card)
	{
		if(this.inf) {
			return false;
		}
		this.cards.unshift(card);
		this.e.prepend(card.e);
		card.setPos(this.cards.length - 1);
		this.updateCount();
		return true;
	}

	addCardAt(card, index)
	{
		if(index < 0 || index > this.cards.length)
			return
		
		if(index == 0) {
			this.prependCard(card);
		} else if (index == this.cards.length) {
			this.appendCard(card);
		} else {
			let temp = this.cards.slice(0, index);
			temp[temp.length - 1].e.after(card.e);
			this.cards.unshift(card);
			
			for(let i = temp.length - 1; i >= 0; i--)
				this.cards.unshift(temp[i]);
			
			this.updatePos();
		}
	}

	swapCards(index1, index2)
	{
		if(index1 < 0 || index1 >= this.cards.length || index2 < 0 || index2 >= this.cards.length)
			return
		
		let temp = this.cards[index1]
		this.cards[index1] = this.cards[index2];
		this.cards[index2] = temp;

		this.cards[index1 - 1].e.after(this.cards[index1]);
		this.cards[index2 - 1].e.after(this.cards[index2]);

		this.cards[index1].setPos(index1);
		this.cards[index2].setPos(index2);
	}

	removeCard(index)
	{
		if(index < 0 || index >= this.cards.length)
			return

		this.e.removeChild(this.cards[index].e);
		let c = this.cards.splice(index, 1)[0];

		this.updatePos();
		return c;
	}

	removeCardByID(id)
	{
		for(let i in this.cards)
		{
			if(this.cards[i].id === id)
				return this.removeCard(i);
		}

		return null;
	}

	removeFront()
	{
		return this.removeCard(this.cards.length - 1);
	}

	removeBack()
	{
		return this.removeCard(0);
	}

	updateCount ()
	{
		this.e.style.setProperty("--ccount", this.cards.length - 1);
	}

	isInside(x, y)
	{
		let rect = this.e.getBoundingClientRect();
		return (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom)
	}

	checkCard (el)
	{
		for(let c of this.cards)
		{
			if(c.e === el)
				return c;
		}
		return null;
	}

	hasCard(id)
	{
		for(let c of this.cards)
		{
			if(c.id === id)
				return c;
		}
		return null;
	}
}
