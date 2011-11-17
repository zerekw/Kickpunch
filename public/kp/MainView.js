dojo.provide("kp.MainView");

dojo.require("dojo.NodeList-fx");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Contained");

dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");

dojo.require("kp.ChatView");

dojo.declare("kp.MainView", [dijit._Widget, dijit._Templated, dijit._Contained], {
	templateString: dojo.cache("kp.MainView", "templates/MainView.html"),
	baseClass: "MainView",
	widgetsInTemplate: true,
	constructor: function() {
		this.inherited(arguments);
		this.socket = io.connect("http://localhost/");
	},
	postCreate: function() {
		var widget = this,
			socket;

		this.inherited(arguments);
		socket = this.socket;

		this.connect(this.submitLoginButton, "onClick", this.submitLogin);
		this.connect(this.joinNewChat, "onClick", this.showJoinChatDialog);
		this.connect(this.submitJoinChat, "onClick", this.joinChat);

		socket.on("loginSuccess", function (userName) {
			widget.loginSuccess(userName);
		});

		socket.on("error", function (type, msg) {
			widget.displayError(type, msg);
		});

		socket.on("loadView", function () {
			widget.loadView(arguments);
		});

		dojo.addOnWindowUnload(this.destroy);
	},
	startup: function () {
		this.inherited(arguments);
		this.showLogin();
	},
	destroy: function () {
		// disconnect the node client if the widget is destroyed
		this.socket.emit('disconnect');
		this.inherited(arguments);
	},
	displayError: function (type, msg) {
		this[type + "Error"].innerHTML = msg;
	},
	submitLogin: function () {
		this.socket.emit("login", this.userName.value);
	},
	// on error this is still happening
	loginSuccess: function (userName) {
		this.loadView("chat", "Main Chat");
		this.loginError.innerHTML = "";
		this.userNameTitle.innerHTML = userName;
		this.hideLogin();
	},
	showLogin: function () {
		this.loginDialog.show();
	},
	hideLogin: function () {
		this.loginDialog.hide();
	},

	showJoinChatDialog: function () {
		this.joinChatDialog.show();
	},
	hideJoinChatDialog: function () {
		this.joinChatDialog.hide();
	},
	joinChat: function () {
		var nspChat = this.joinChatId;
		this.loadView('chat', nspChat.attr("value"));
		nspChat.attr("value", "");
		nspChat.attr("displayValue", "");
		this.hideJoinChatDialog();
	},
	loadView: function (type, nsp) {
		var newView;
		switch(type) {
			case "chat":
				newView = new kp.ChatView({socket: this.socket, nsp: nsp});
				break;
		}
		this.userViews.addChild(newView);
	},
});
