dojo.provide("widget.GameWidget");

dojo.require('dojo.NodeList-fx');
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("widget.GameWidget", [dijit._Widget, dijit._Templated], {
	opponent : {
		name	: "Opponent",
		action	: "punch",
		icon	: dojo.moduleUrl("widget.GameWidget", "img/sadface.jpg"),
	},
	player : {
		name	: "You",
		action	: "punch",
		icon	: dojo.moduleUrl("widget.GameWidget", "img/happyface.jpg"),
	},
	templateString :
		dojo.cache("widget.GameWidget", "templates/GameWidget.html"),
	baseClass : "gameWidget",
	socket : io.connect('http://localhost'),
	postCreate : function() {
		var widget = this,
			domNode = this.domNode;

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
		var loginNode = dojo.query('.loginContainer', this.domNode);
		console.log(loginNode);
		loginNode.fadeOut().play();
		/*dojo.fadeOut({ node: loginNode, onEnd: function () {

				dojo.empty(loginNode);
			}
		}).play();
		*/
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
		//var toUser = dojo.byId('directMessageTo').value,
		//	msg = dojo.byId('directMessageText').value;
		//socket.emit('directMessage', toUser, msg);
		//console.log(toUser + ': ' + msg);
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
			dojo.place(userNode, this.userList, 'last');

		if (!init) {
			this.incomingChat(userName + ' has connected.');
		}
	},
	removeUser : function (userName) {
		dojo.destroy(dojo.query('#' + userName, this.domNode)[0]);
	},
	selectUser: function (e) {
		var targetId = dojo.attr(e.target, 'id');
		dojo.query('.userList li').forEach(function (li) {
			if (dojo.attr(li, 'id') === targetId) {
				dojo.addClass(li, 'selectedUser');
			}
			else {
				dojo.removeClass(li, 'selectedUser');
			}
		});
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
