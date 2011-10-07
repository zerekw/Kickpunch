var socket = io.connect('http://localhost');

socket.on('userConnect', function (userName) {
	addPlayer(userName);
});

socket.on('userDisconnect', function (userName) {
	submitChat(userName + ' has disconnected.');
	removePlayer(userName);
});

socket.on('connectSuccess', function (userName) {
	var loginNode = dojo.byId('userLogin');
	createGameView();
	dojox.html.set('loginError', '');
	submitChat('You have connected as ' + userName);
	dojo.fadeOut({ node: loginNode, onEnd: function () { dojo.empty(loginNode); } }).play();
});

socket.on('error', function (type, msg) {
	displayError(type, msg);
});

socket.on('chat', function (data) {
	submitChat(data);
});

socket.on('message', function (data) {
	console.log(data);
});

socket.on('action', function (data) {
	console.log(data);
});

function displayError(type, msg) {
	var domNode = dojo.byId(type + 'Error');
	dojox.html.set(domNode, msg);
}

function createGameView() {
	var gameView = new widget.GameWidget().placeAt(dojo.byId('gameView'));
}

function userLogin() {
	var userName = dojo.byId('userName').value;
	socket.emit('login', userName);
}

function addPlayer(userName) {
	var playerList = dojo.byId('playerList');
	dojo.create('li', { id: userName, innerHTML: userName }, playerList, 'first');
	submitChat(userName + ' has connected.');
}

function removePlayer(userName) {
	var playerListItem = dojo.byId(userName);
	dojo.destroy(playerListItem);
}

function getUserName() {
	socket.emit('get user name', function (userName) { console.log(userName); });
}

function directMessage() {
	var toUser = dojo.byId('directMessageTo').value,
		msg = dojo.byId('directMessageText').value;
	console.log(toUser);
	socket.emit('directMessage', toUser, msg);
}

function submitChat(msg) {
	var chatList = dojo.byId('chatContainer');
	dojo.create('li', { innerHTML: msg }, chatList, 'first');
}
