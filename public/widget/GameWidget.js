dojo.provide("widget.GameWidget");

dojo.require('dojo.NodeList-fx');
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("widget.GameWidget", [dijit._Widget, dijit._Templated], {
	templateString :
		dojo.cache("widget.GameWidget", "templates/GameWidget.html"),
	baseClass : "gameWidget",
	socket : io.connect('http://localhost'),
	userList : {},
	postCreate : function() {
		var widget = this;

		this.socket.emit('userList');

		this.socket.on('userConnect', function (userName) {
			widget.addUser(userName);
		});

		this.socket.on('userDisconnect', function (userName) {
			widget.incomingChat(userName + ' has disconnected.');
			widget.removeUser(userName);
		});

		this.socket.on('connectSuccess', function (userName) {
			widget.connectSuccess(userName);
		});

		this.socket.on('error', function (type, msg) {
			widget.displayError(type, msg);
		});

		this.socket.on('chat', function (data) {
			widget.incomingChat(data);
		});

		this.socket.on('message', function (data) {
console.log(data);
		});

		this.socket.on('action', function (data) {
console.log(data);
		});

		this.socket.on('userList', function (users) {
			widget.buildUserList(users);
		});

	},
	userLogin : function () {
		this.socket.emit('login', this.userName.value);
	},
	connectSuccess : function (userName) {
		dojox.html.set(this.loginError, '');
		this.incomingChat('You have connected as ' + userName);
		this.hideLogin();
		this.showControls();
	},
	hideLogin : function () {
		dojo.fadeOut({node : this.loginContainer}).play();
	},
	showControls: function () {
		dojo.query('.controls', this.domNode).fadeIn().play();
	},
	submitChat: function () {
		var msg = this.getChatInput();
		if (msg != '') {
			this.socket.emit('chatMsg', msg);
		}
	},
	incomingChat : function (msg, type) {
		dojo.create('li', { innerHTML: msg }, this.chatLog, 'first');
	},
	// collect selected users and send direct message
	submitDM : function () {
		var widget = this,
			msg = this.getChatInput();
		dojo.query('.selectedUser', this.domNode).forEach(function (user) {
			var userId = dojo.attr(user, 'id');
			widget.socket.emit('directMsg', userId, msg);
		});
	},
	getChatInput : function () {
		var msg = this.chatInput.value;
		this.chatInput.value = '';
		return msg;
	},
	displayError : function (type, msg) {
		var domNode = dojo.query('.' + type + 'Error', this.domNode)[0];
		dojox.html.set(domNode, msg);
	},
	buildUserList: function (users) {
		users.forEach(function (userName) {
			this.addUser(userName, true);
		}, this);
	},
	addUser: function (userName, init) {
		var userNode = dojo.create('li', { id: userName, class: 'user', innerHTML: userName });

		dojo.connect(userNode, 'onclick', this.selectUser);
		this.userList[userName] = userNode;
		dojo.place(userNode, this.userList, 'last');

		if (!init) {
			this.incomingChat(userName + ' has connected.');
		}
	},
	removeUser : function (userName) {
		dojo.destroy(this.userList[userName]);
		delete this.userList[userName];
	},
	selectUser: function (e) {
		dojo.removeClass('.userList li', 'selectedUser');
		dojo.addClass(e.target, 'selectedUser');
	},
	startFight: function () {
console.log('startFight');
	},
	sendKick: function() {
		socket.emit('action', { action:'kick' });
	},
	sendPunch: function(e) {
		sendAction('punch');
	},
	sendAction: function(action) {
console.log(action);
		// send websocket thing here
	}
});
