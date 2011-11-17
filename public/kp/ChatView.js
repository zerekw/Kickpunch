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
		//this.socket = io.connect("http://localhost/chat");
		this.title = options.nsp;
		this.nsp = options.nsp;
	},
	postCreate: function() {
		var widget = this,
			socket;

		this.inherited(arguments);
		socket = this.socket;

		socket.emit("joinRoom", this.nsp);

		socket.on("joinSuccess", function (userList) {
			widget.joinSuccess(userList);
		});

		socket.on("userJoin", function (data) {
			widget.addUser(data);
		});

		socket.on("userDisconnect", function (data) {
			widget.userDisconnect(data);
		});

		socket.on("userLeave", function (data) {
			widget.removeUser(data);
		});

		socket.on("chat", function (data) {
			widget.incomingChat(data);
		});

		this.connect(this.chatSubmit, "onClick", this.submitChat);
		this.connect(this.dmSubmit, "onClick", this.submitDM);

	},
	confirmNsp: function (nsp) {
		return nsp === this.nsp || nsp === 'all';
	},
	joinSuccess: function (users) {
		this.chatUsers.innerHTML = "";
		users.forEach(function (userName) {
			this.addUser({nsp: this.nsp, userName: userName, init: true});
		}, this);
	},
	addUser: function (data) {
		var chatUsers = this.chatUsers,
			userName = data.userName,
			userNode = dojo.create("li", { id: userName, class: "user", innerHTML: userName });

		if (!this.confirmNsp(data.nsp)) { return; }

		dojo.connect(userNode, "onclick", this.selectUser);
		chatUsers[userName] = userNode;
		dojo.place(userNode, this.chatUsers, "last");

		if (!data.init) {
			this.incomingChat({nsp: data.nsp, msg: userName + " has connected."});
		}
	},
	removeUser: function (data) {
		var userName = data.userName;

		if (!this.confirmNsp(data.nsp)) { return; }

		this.incomingChat(userName + " has left.");
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
			this.socket.emit("chatMsg", this.nsp, msg);
		}
	},
	incomingChat: function (data) {
		if (!this.confirmNsp(data.nsp)) { return; }

		if (!data.msgType) {
			data.msgType = "chatGeneral";
		}
		dojo.create("li", { innerHTML: data.msg, class: data.msgType }, this.chatLog, "first");
	},
	// collect selected users and send direct message
	submitDM: function () {
		var widget = this,
			msg = this.getChatInput();
		dojo.query(".selectedUser", this.domNode).forEach(function (user) {
			var userId = dojo.attr(user, "id");
			widget.socket.emit("directMsg", this.nsp, userId, msg);
		});
	},
	getChatInput: function () {
		var msg = this.chatInput.attr("value");
		//this.chatInput.value = "";
		this.chatInput.attr("value", "");
		return msg;
	}
});

