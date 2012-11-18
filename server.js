var io = require('socket.io').listen(80)
var cmd = [function(){document.body.style.background="red"}, 
	function(){document.body.style.background="green"}]
var current = 0;

io.sockets.on('connection', function (socket) {
	setInterval(function() {
		current = (current+1)%2
		 socket.broadcast.emit('cmd', cmd[current].toString());
	}, 2000);
 
});