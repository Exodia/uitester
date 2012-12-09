 /**
 * UITester Server Module
 * @author: LongGang <tblonggang@gmail.com>
 * require:
 *      1. underscore (npm install unerscore)
 *      2. socket.IO (npm install socket.io)
 */
var io = require('socket.io').listen(8080, {'log level': 0});
    userAgent = require('user-agent');

var ClientManager = require('client-mgr'),
    TaskManager = require('task-mgr').TaskManager,
    EventManager = require('event-mgr').EventManager;

ClientManager.init();
TaskManager.init();

 var guid = -1;

 function Client(socket) {
     this.socket = socket;
     this.id = ++guid;
     this.task = this.clientType = this.reportData = this.userAgent = null;
 }

 Client.prototype.runTask = function(task) {
     this.socket.emit('console:task', task);
     this.task = task;
     console.info('run task', task.id);
     EventManager.emit('console:busy', this);
 };


io.sockets.on('connection', function (socket) {
    // wrapper object
    var clientObject = new Client(socket);

    socket.on('disconnect', function (){
        EventManager.emit('console:disconnect', clientObject);
    });

    // Register client after Socket.IO connected
    socket.on('console:register', function (data){
        //1、设置浏览器类型
        clientObject.userAgent = userAgent.parse(data.userAgent);
        //2、触发注册事件
        EventManager.emit('console:register', clientObject);
    });

    // Client task finished, report send back
    socket.on('console:task_finish', function (data){
        //1、置入报告数据
        clientObject.task.reportData = data.reportData;
        //2、触发任务结束事件
        EventManager.emit('console:task_finish', clientObject);

    });
});
