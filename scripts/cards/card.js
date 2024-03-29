'use strict';

// Possible positions of content in a card
const CardPos = ["top", "topl", "topr", "mid", "midt", "midb", "bot", "botl", "botr", "all"];

// Card class represents one card.
// Every card should have a deck.
// Use deck.appendCard, deck.prependCard, or deck.addCardAt to make a card visible
class Card {
	constructor (id, deck, data)
	{
		this.e = document.createElement("card");
		this.generateElements(data);
		this.e.style.setProperty("--left", "0px");
		this.e.style.setProperty("--top", "0px");
		this.e.card = this;

		this.getData = () => {
			return data;
		};

		this.id = id;
		this.deck = deck;
	}

	// Generate a card with basic text only
	static generateBasicCard (data, el)
	{
		let t = document.createElement("carea");
		t.className = "mid";
		t.innerText = data;
		el.appendChild(t);
	}

	// Generate a card with a simple error message.
	static generateErrorCard (el)
	{
		Card.generateBasicCard("Card Error: data", el);
	}

	// Generate an area of a card
	static generateCArea (data, carea, assetURL)
	{
		// Create and set area
		let area = document.createElement("carea");
		area.className = carea;

		// Create inner area text and images
		for (let i in data)
		{
			if (i == "style")
			{
				for (j in data.style) 
					area.style.setProperty(j, data[i].style[j]);
			}
			
			if (data[i].type == "text")
			{
				let e = document.createElement("ctext");

				e.innerText = data[i].text;

				for (let j in data[i].style)
					e.style.setProperty(j, data[i].style[j]);

				area.appendChild(e);

			}
			else if (data[i].type == "image")
			{
				let e = document.createElement("cimage");

				e.style.backgroundImage = "url(\"" + assetURL + data[i].image + "\")";
				
				for (let j in data[i].style)
					e.style.setProperty(j, data[i].style[j]);

				area.appendChild(e);
			}
		}

		return area;
	}

	// Generate a card with rich visuals
	static generateObjectCard (data, el)
	{
		// Generate card areas.
		if (typeof data.style == "object") {
			for (let i in data.style) {
				el.style.setProperty(i, data.style[i]);
			}
		}

		if(data.assetURL == null) {
			data.assetURL = "./";
		}

		for (let i of CardPos)
		{
			if (typeof data[i] == "object")
				el.appendChild(this.generateCArea(data[i], i, data.assetURL));
		}
	}

	generateElements (data)
	{
		while(this.e.firstElementChild != null)
			this.e.firstElementChild.remove();

		switch (typeof data)
		{
			case "object":
				Card.generateObjectCard(data, this.e);
				break;
			case "string":
				Card.generateBasicCard(data, this.e);
				break;
			default:
				Card.generateErrorCard(this.e);
		}
	}

	setPos (p)
	{
		this.e.style.setProperty("--cpos", p);
	}

	resetPos()
	{
		this.e.style.setProperty("--left", "0px");
		this.e.style.setProperty("--top", "0px");
		this.e.style.setProperty("--irot", "0");
		this.e.style.setProperty("--iscale", "1");
	}

	resetPosInstant()
	{
		this.e.className = "instant";
		this.e.style.setProperty("--left", "0px");
		this.e.style.setProperty("--top", "0px");
		this.e.className = "";
	}
}
