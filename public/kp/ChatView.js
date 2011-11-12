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
	widgetsInTemplate: true,
	constructor: function(options) {
		this.inherited(arguments);
		this.socket = options.socket;
		this.title = options.viewId;
		this.viewId = options.viewId;
	},
	postCreate: function() {
		var widget = this,
			socket;

		this.inherited(arguments);
		socket = this.socket;

		socket.emit("joinRoom", this.viewId);
		socket.emit("userList");

		socket.on("joinSuccess", function (userList) {
			widget.joinSuccess(userList);
		});

		socket.on("userJoin", function (userName) {
			widget.addUser(userName);
		});

		socket.on("userLeave", function (userName) {
			widget.incomingChat(userName + " has left.");
			widget.removeUser(userName);
		});

		socket.on("chat", function (data) {
			widget.incomingChat(data);
		});

	},
	joinSuccess: function (users) {
		users.forEach(function (userName) {
			this.addUser(userName, true);
		}, this);
	},
	addUser: function (userName, init) {
		var chatUsers = this.chatUsers,
			userNode = dojo.create("li", { id: userName, class: "user", innerHTML: userName });

		dojo.connect(userNode, "onclick", this.selectUser);
		chatUsers[userName] = userNode;
		chatUsers.set('content', chatUsers.content + userNode);
		//chatUsers.content = chatUsers.content + userNode;
		var foo = chatUsers.get('content');
		debugger;
		//this.content = this.content + userNode;
		//dojo.place(userNode, this.chatUsers, "last");

		if (!init) {
			this.incomingChat(userName + " has connected.");
		}
	},
	removeUser: function (userName) {
		// the event attached to each user needs to be remvoed
		dojo.destroy(this.chatUsers[userName]);
		delete this.chatUsers[userName];
	},
	selectUser: function (e) {
		dojo.query("li", this.chatUsers).removeClass("selectedUser");
		dojo.addClass(e.target, "selectedUser");
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
	}
});

