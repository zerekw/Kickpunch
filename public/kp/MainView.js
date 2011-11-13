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
	postCreate: function() {
		var widget = this,
			socket;

		this.inherited(arguments);
		this.socket = io.connect("http://localhost/mainView", {"force new connection": true});
		socket = this.socket;

		this.connect(this.submitLoginButton, "onClick", this.submitLogin);

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
		/*
		socket.emit("userList");

		socket.on("userConnect", function (userName) {
			widget.addUser(userName);
		});

		socket.on("userDisconnect", function (userName) {
			widget.incomingChat(userName + " has disconnected.");
			widget.removeUser(userName);
		});

		socket.on("chat", function (data) {
			widget.incomingChat(data);
		});

		socket.on("message", function (data) {
console.log(data);
		});

		socket.on("action", function (data) {
console.log(data);
		});

		socket.on("userList", function (users) {
			widget.buildUserList(users);
		});
		*/

	},
	startup: function () {
		this.inherited(arguments);
		this.showLogin();
	},
	// disconnect the node client if the widget is destroyed
	destroy: function () {
		this.socket.emit('disconnect');
		this.inherited(arguments);
	},
	displayError: function (type, msg) {
		this[type + "Error"].innerHTML = msg;
	},
	submitLogin: function () {
		this.socket.emit("login", this.userName.value);
	},
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

	loadChat: function (chatId) {
		this.getView(chatId);
	},
	getView: function (id) {
		this.socket.emit("getView", id);
	},
	loadView: function (type, viewId) {
		var newView;
		switch(type) {
			case "chat":
				newView = new kp.ChatView({socket: this.socket, viewId: viewId});
				break;
		}
		this.userViews.addChild(newView);
	},


	showControls: function () {
		dojo.query(".controls", this.domNode).fadeIn().play();
	},
	submitChat: function () {
		var msg = this.getChatInput();
		if (msg != "") {
			this.socket.emit("chatMsg", msg);
		}
	},
	incomingChat: function (msg, type) {
		dojo.create("li", { innerHTML: msg }, this.chatLog, "first");
	},
	// collect selected users and send direct message
	submitDM: function () {
		var widget = this,
			msg = this.getChatInput();
		dojo.query(".selectedUser", this.domNode).forEach(function (user) {
			var userId = dojo.attr(user, "id");
			widget.socket.emit("directMsg", userId, msg);
		});
	},
	getChatInput: function () {
		var msg = this.chatInput.value;
		this.chatInput.value = "";
		return msg;
	},
	buildUserList: function (users) {
		users.forEach(function (userName) {
			this.addUser(userName, true);
		}, this);
	},
	addUser: function (userName, init) {
		var userNode = dojo.create("li", { id: userName, class: "user", innerHTML: userName });

		dojo.connect(userNode, "onclick", this.selectUser);
		this.userList[userName] = userNode;
		dojo.place(userNode, this.userList, "last");

		if (!init) {
			this.incomingChat(userName + " has connected.");
		}
	},
	removeUser: function (userName) {
		// the event attached to each user needs to be remvoed
		dojo.destroy(this.userList[userName]);
		delete this.userList[userName];
	},
	selectUser: function (e) {
		dojo.query("li", this.userList).removeClass("selectedUser");
		dojo.addClass(e.target, "selectedUser");
	},
	startFight: function () {
console.log("startFight");
	},
	sendKick: function() {
		socket.emit("action", { action:"kick" });
	},
	sendPunch: function(e) {
		sendAction("punch");
	},
	sendAction: function(action) {
console.log(action);
		// send websocket thing here
	}
});
