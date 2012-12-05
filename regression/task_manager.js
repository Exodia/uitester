/**
 * Created with JetBrains WebStorm.
 * User: tafeng.dxx
 * Date: 12-11-24
 * Time: ����3:45
 */

//����ģ��
var EventEmiter = require('events').EventEmitter;
var http = require('http');
var qs = require('querystring');

//��չhttp�ӿ�
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


/*���ݽӿ�*/
var API = {
        fetch:"http://localhost/test.json",
        report:"http://localhost/test.json"
    },
//���ݻ�ȡ����
    INTERVAL = 5000,
//�����С
    BUFFER_SIZE = 50;


/*��������*/
var taskCache = {
        tasks:null,
        total:0
    },
/*���滺����*/
    reportBuffer = [];


exports.TaskManager = {
    init:function () {
        this._bindEvents();
        this.fetchTask();
    },
    /*�����������������ݿ���
    * ÿ��50���Ž���һ���ԵĲ��룬��ֹƵ���Ĳ������ݿ�
    */
    report:function (task, info) {
        reportBuffer.push({task:task, info:info});
        //������δ�������������δ��
        if (reportBuffer.length < BUFFER_SIZE && taskCache.total) {
            return;
        }

        http.post(API['report'], reportBuffer,function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
        }).on('error', function (e) {
                console.log('problem with report: ' + e.message);
        });

        //������滺����
        reportBuffer = [];
        //������пգ���ȡ����
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
        /*�����������������*/
        'browserTypes':function (types) {
            var i, len = types.length, tasks = taskCache.tasks;
            //��ÿ�����������һ����������
            for (i = len - 1; i > -1; --i) {
                this.browserCache[types[i]] = taskCache.tasks.slice(0);
            }
            //��ÿ������������������Ϊ�������������
            for (i = taskCache.length - 1; i > -1; --i) {
                tasks[i].browserCount = tasks[i].total_specs = len;
            }
        },

        /*����������¼�������task�¼���ͬʱ����һ��task*/
        'browserFree':function (type) {
            var tasks = this.browserCache[type];
            if (tasks && tasks.length) {
                this.emit('task', tasks.pop());
            }
        },

        /*��������*/
        'taskFinish':function (task, info) {
            //�������꣬���ټ�����
            if (--task.browserCount == 0) {
                //������Ϊ0�����������ص�������ͬʱ������������
                --taskCache.total;
                this.report(task, info);
            }
        }
    },
    //�¼���
    _bindEvents:function () {
        var evts = this._eventsMap;
        for (var k in evts) {
            this.on(k, evts[k]);
        }
    }
};

//�̳�
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