dojo.provide("kp.ChatView");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");

dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");

dojo.declare("kp.ChatView", [dijit._Widget, dijit._Templated, dijit._Contained], {
	templateString: dojo.cache("kp.ChatView", "templates/ChatView.html"),
	baseClass: "ChatView",
	postCreate: function() {
		console.log("ChatView postCreate");
	},
	submitChat: function() {
	},
	submitDM: function() {
	},
	startFight: function() {
	}
});

