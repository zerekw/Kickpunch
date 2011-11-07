dojo.provide("widget.FightWidget");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("widget.FightWidget", [dijit._Widget, dijit._Templated], {
	templateString :
		dojo.cache("widget.FightWidget", "templates/FightWidget.html"),
	baseClass : "fightWidget",
	postCreate : function() {
console.log("FightWidget postCreate");
	}
});

/*
games = {};
game = {
	id : 0000,
	player1 : 0000,
	player2 : 0000,
	spectator1 : 0000,
	actions : {
		{
			user: 0000,
			action: 'punch',
			order: 0
		},
		{
			user: 0000,
			action: 'punch',
			order: 0
		}
	}
};
 */
