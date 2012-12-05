/**
 * Created with JetBrains WebStorm.
 * User: tafeng.dxx
 * Date: 12-11-24
 * Time: 下午3:45
 */

//导入模块
var EventEmiter = require('events').EventEmitter;
var http = require('http');
var qs = require('querystring');

//扩展http接口
http.post = function (url, data, fn) {
    data = data || {};
    var content = qs.stringify(data);
    var parse_u = require('url').parse(url, true);
    var options = {
        host:parse_u.hostname,
        port:parse_u.port,
        path:parse_u.path,
        method:'POST',
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Content-Length':content.length
        }
    };
    return this.request(options, fn);
};


/*数据接口*/
var API = {
        fetch:"http://localhost/test.json",
        report:"http://localhost/test.json"
    },
//数据获取周期
    INTERVAL = 5000,
//缓冲大小
    BUFFER_SIZE = 50;


/*用例队列*/
var taskCache = {
        tasks:null,
        total:0
    },
/*报告缓冲区*/
    reportBuffer = [];


exports.TaskManager = {
    init:function () {
        this._bindEvents();
        this.fetchTask();
    },
    /*用例结束，插入数据库结果
    * 每满50个才进行一次性的插入，防止频繁的操作数据库
    */
    report:function (task, info) {
        reportBuffer.push({task:task, info:info});
        //缓冲区未满，且任务队列未空
        if (reportBuffer.length < BUFFER_SIZE && taskCache.total) {
            return;
        }

        http.post(API['report'], reportBuffer,function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
        }).on('error', function (e) {
                console.log('problem with report: ' + e.message);
        });

        //清除报告缓冲区
        reportBuffer = [];
        //任务队列空，则取数据
        !taskCache.total && this.fetchTask();
    },
    fetchTask:function () {
        http.get(API['fetch'],function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));

            var data = '';

            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                data = JSON.parse(data);
                if (!data.length) {
                    console.log('no data');
                    return setTimeout(this.fetchTask, INTERVAL);
                }
                taskCache.tasks = data;
                taskCache.total = data.length;
                this.browserCache = {};
                exports.TaskManager.emit('dataUpdated', data);
            });
        }).on('error', function (e) {
                console.log("Got error: " + e);
            });
    },
    browserCache:null,
    _eventsMap:{
        /*更新浏览器用例队列*/
        'browserTypes':function (types) {
            var i, len = types.length, tasks = taskCache.tasks;
            //对每种浏览器复制一份用例引用
            for (i = len - 1; i > -1; --i) {
                this.browserCache[types[i]] = taskCache.tasks.slice(0);
            }
            //对每个用例，将计数器至为浏览器类型数量
            for (i = taskCache.length - 1; i > -1; --i) {
                tasks[i].browserCount = tasks[i].total_specs = len;
            }
        },

        /*浏览器空闲事件，触发task事件，同时丢入一个task*/
        'browserFree':function (type) {
            var tasks = this.browserCache[type];
            if (tasks && tasks.length) {
                this.emit('task', tasks.pop());
            }
        },

        /*用例测完*/
        'taskFinish':function (task, info) {
            //用例测完，减少计数器
            if (--task.browserCount == 0) {
                //计数器为0，减少用例池的总数，同时报告该用例结果
                --taskCache.total;
                this.report(task, info);
            }
        }
    },
    //事件绑定
    _bindEvents:function () {
        var evts = this._eventsMap;
        for (var k in evts) {
            this.on(k, evts[k]);
        }
    }
};

//继承
exports.TaskManager.__proto__ = EventEmiter.prototype;
exports.BrowserManage__proto__ = EventEmiter.prototype;


exports.BrowserManager = {
    getTypes:function () {
        return ['ie', 'ff', 'chrome', 'opera'];
    },
    browserFreePool:{
          ie:[],
          ff:[],
          chrome:[]

    },
    browserBusyPool: {
        ie:[],
        ff:[],
        chrome:[]
    },
    _eventsMap:{
        'dataUpdated':function () {
            //fires 'browserTypes' event
        },
        'task': function (task) {

        }
    },
    _socketEventsMap:{
        'connect':function (socket) {
            //fires 'browserFree'  event
        },
        'disconnect':function (socket) {
            //if socket is running task, fires 'taskFinish'
        },
        'message':function (socket, task, info) {
            //fires 'taskFinish' event
        }
    }
};