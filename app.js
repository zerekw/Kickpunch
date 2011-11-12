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

views.mainView = io.of('/mainView').on('connection', function (socket) {

	socket.on('login', userLogin);
	socket.on('disconnect', userDisconnect);
	socket.on('getView', returnView);
	socket.on('joinRoom', joinRoom);

	function userLogin(userName) {
		if (userName !== '' && clients[userName] === undefined) {
			socket.set('userName', userName, function() {
				clients[userName] = socket;

				//socket.broadcast.emit('userConnect', userName);
				socket.emit('loginSuccess', userName);
			});
		}
		else {
			socket.emit('error', 'login', 'User name is taken.');
		}
	}

	function userDisconnect(userName) {
		socket.broadcast.emit('userDisconnect', userName);
	}

	function joinRoom(roomId) {
		socket.join(roomId);
		socket.get('userName', function(err, userName) {
			socket.broadcast.to(roomId).emit('userConnect', userName);
			socket.emit('joinSuccess', usersInRoom(roomId));
			//socket.emit('joinSuccess', Object.keys(clients));
		});
	}

	function usersInRoom(roomId) {
		var namespace = '/mainView/' + roomId,
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

	function returnView(viewId) {
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
