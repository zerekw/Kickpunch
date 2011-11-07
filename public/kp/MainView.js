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
	postCreate: function() {
console.log("postCreate start");
		var widget = this,
			socket;

		this.socket = io.connect("http://localhost", {"force new connection": true});
		socket = this.socket;

		/*
		socket.emit("userList");

		socket.on("userConnect", function (userName) {
			widget.addUser(userName);
		});

		socket.on("userDisconnect", function (userName) {
			widget.incomingChat(userName + " has disconnected.");
			widget.removeUser(userName);
		});

		socket.on("connectSuccess", function (userName) {
			widget.connectSuccess(userName);
		});

		socket.on("error", function (type, msg) {
			widget.displayError(type, msg);
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

		this.loadChat("Main Chat");
console.log('postCreate end');
	},
	startup : function () {
		// call layout startup stuff here?
		console.log('startup');
		console.log(this.loginDialog);
		//
		//dijit.byId(this.loginDialog).show();
	},
	submitLogin : function () {
		this.socket.emit("login", this.userName.value);
	},
	connectSuccess : function (userName) {
		this.loginError.innerHTML = "";
		this.incomingChat("You have connected as " + userName);
		this.hideLogin();
		this.showControls();
	},
	hideLogin : function () {
		dojo.fadeOut({node : this.loginContainer}).play();
	},


	loadChat: function (chatTitle) {
		this.loadView("chat", chatTitle);
	},
	loadView: function (type, title) {
		var newView;
		switch(type) {
			case "chat":
				newView = new kp.ChatView();
		console.log('here');
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
	incomingChat : function (msg, type) {
		dojo.create("li", { innerHTML: msg }, this.chatLog, "first");
	},
	// collect selected users and send direct message
	submitDM : function () {
		var widget = this,
			msg = this.getChatInput();
		dojo.query(".selectedUser", this.domNode).forEach(function (user) {
			var userId = dojo.attr(user, "id");
			widget.socket.emit("directMsg", userId, msg);
		});
	},
	getChatInput : function () {
		var msg = this.chatInput.value;
		this.chatInput.value = "";
		return msg;
	},
	displayError : function (type, msg) {
		var domNode = dojo.query("." + type + "Error", this.domNode)[0];
		domNode.innerHTML = msg;
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
	removeUser : function (userName) {
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
