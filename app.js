/**
 * Module dependencies.
 */
var util = require('util'),
	express = require('express'),
	io = require('socket.io'),
	views = {};

var clients = {};

var app = module.exports = express.createServer();


// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.use(express.bodyDecoder());
    app.use(express.methodOverride());
    //app.use(express.compiler({ src: __dirname + '/public', enable: ['css'] }));
    app.use(app.router);
    app.use(express.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
   app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
    res.render('index.jade', {
        locals: {
            title: 'KickPunch'
        }
    });
});

io = io.listen(app);

app.listen(3000);

io.sockets.on('connection', function (socket) {

	socket.on('login', userLogin);
	socket.on('disconnect', clientDisconnect);
	socket.on('joinRoom', joinRoom);
	socket.on('leaveRoom', leaveRoom);
	socket.on('chatMsg', emitChatMsg);
	socket.on('directMsg', emitDirectMsg);

	function userLogin(userName) {
		if (userName !== '' && clients[userName] === undefined) {
			socket.set('userName', userName, function() {
				clients[userName] = socket;
				socket.emit('loginSuccess', userName);
			});
		}
		else {
			socket.emit('error', 'login', 'User name is taken.');
		}
	}

	function emitToRoom(roomId, action, data) {
		data['nsp'] = roomId;
		socket.broadcast.to(roomId).emit(action, data);
		socket.emit(action, data);
	}
	
	function clientDisconnect(roomId) {
		socket.get('userName', function (err, userName) {
			if (userName) {
				delete clients[userName];
				leaveRoom('all');
			}
		});
	}

	function joinRoom(roomId) {
		socket.join(roomId);
		socket.get('userName', function(err, userName) {
			var data = {userName: userName};
			emitToRoom(roomId, 'userJoin', data);
			socket.emit('joinSuccess', usersInRoom(roomId));
		});
	}

	function leaveRoom(roomId) {
		socket.leave(roomId);
		socket.get('userName', function(err, userName) {
			var data = {userName: userName};
			emitToRoom(roomId, 'userJoin', data);
		});
	}

	function usersInRoom(roomId) {
		var namespace = '/' + roomId,
			roomClients = io.roomClients,
			clientIds = Object.keys(io.roomClients),
			clientsInRoom = [];
		clientIds.forEach(function (el) {
			if (roomClients[el][namespace]) {
				clientsInRoom.push(getSocketsUserName(el));
			}
		});
		return clientsInRoom;
	}

	function getSocketsUserName(socketId) {
		return io.sockets.sockets[socketId].store.data.userName;
	}

	function emitChatMsg(roomId, msg) {
		socket.get('userName', function (err, userName) {
			var data;

			msg = userName + ": " + msg,
			data = {msg: msg, msgType: 'chatGeneral'};
			socket.emit('chat', data);
			emitToRoom(roomId, 'chat', data);
			//socket.broadcast.emit('chat', msg, 'chatGeneral');
		});
	}

	function emitDirectMsg(roomId, userName, msg) {
		var socketUser = clients[userName],
			data;
		msg = "(DM) " + userName + ": " + msg;
		data = {msg: msg, msgType: 'chatDirect'};
		socketUser.emit('chat', data);
	}
});

/*
io.sockets.on('connection', function (socket) {

	socket.on('disconnect', function () {
		socket.get('userName', function (err, userName) {
			if (userName) {
				delete clients[userName];
				userDisconnect(userName);
			}
		});
	});

	socket.on('userList', function () {
		socket.emit('userList', Object.keys(clients));
	});

	socket.on('get user name', sendUserName);

	socket.on('action', function (data) {
	  socket.emit('action', data);
	});

	socket.on('chatMsg', function (msg) {
		sendChatMsg(msg);
	});

	socket.on('directMsg', function (toUser, msg) {
		sendDirectMsg(toUser, msg);
	});

	function sendUserName() {
		socket.get('userName', function (err, name) {
			socket.emit('chat', 'User name is ' + name);
		});
	}

	function userConnect(userName) {
		socket.set('userName', userName, function() {
			clients[userName] = socket;
			socket.broadcast.emit('userConnect', userName);
			socket.emit('connectSuccess', userName);
		});
	}

	function userDisconnect(userName) {
		socket.broadcast.emit('userDisconnect', userName);
	}

	function sendChatMsg(msg) {
		socket.get('userName', function (err, userName) {
			msg = userName + ": " + msg;
			socket.emit('chat', msg, 'chatGeneral');
			socket.broadcast.emit('chat', msg, 'chatGeneral');
		});
	}

	function sendDirectMsg(userName, msg) {
		var socketUser = clients[userName];
		msg = "(DM) " + userName + ": " + msg;
		socketUser.emit('chat', msg, 'chatDirect');
	}

});
*/
