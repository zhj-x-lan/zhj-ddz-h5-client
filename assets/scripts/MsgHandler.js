function Queue(size) {
    var queue = [];

    this.push = function (data) {
        if (data == null) {
            return false;
        }
        if (size != null && !isNaN(size)) {
            if (queue.length == size) {
                this.pop();
            }
        }
        queue.unshift(data);
        return true;
    };

    this.pop = function () {
        return queue.pop();
    };

    this.size = function () {
        return queue.length;
    };

    this.content = function () {
        return queue;
    }

    //根据order排序消息,并返回一个新的queue
    this.sort = function (key) {
        queue.sort(function (a, b) {
            return a[key] - b[key];
        });
        return queue;
    }
}
cc.Class({
    extends: cc.Component,

    statics: {
        queue: null,
    },

    onLoad: function () {
        console.log('【1*---==================加载【MsgHandler.js】');
    },

    init: function () {
        this.queue = new Queue();
    },

    recv: function (data) {
        if (cc.vv.maps.msgMaps[data.kMId]) {
          /*   var sceneName = cc.director.getScene().name;
            var tagName = cc.vv.maps.msgMaps[data.kMId].tag; */
            cc.vv.maps.msgMaps[data.kMId].handler(data);
            //cc.vv.dispatcher.fire(cc.vv.maps.msgMaps[data.kMId].evnet, data);
            /* console.log('scene: ' + sceneName + ' <====> tag: ' + tagName);
            var msgId = data.kMId;
            if (this.comparePriority(sceneName, tagName) >= 0) { //直接处理
                 cc.vv.maps.msgMaps[data.kMId].handler(data);
             } else {
                 var msg = {};
                 msg[msgId] = data;
                 msg['event'] = cc.vv.maps.msgMaps[msgId].event;
                 //this.queue.push(msg);
                 //this.queue.sort('order');
                 console.log(this.queue.content());
             } */

            /* var msg = {};
            msg[msgId] = data;
            msg['event'] = cc.vv.maps.msgMaps[msgId].event;
            this.queue.push(msg);
            this.queue.sort('order');
            console.log('接收消息后，排序的队列内容为:###################');
            console.log(this.queue.content()); */

        } else {
            console.log('暂未注册的消息号: ' + data.kMId);
            console.log(data);
        }
    },

    send: function (event, data) {
        var msgId = this.eventMaps[event];
        if (cc.vv.maps.msgMaps[msgId]) {
            cc.vv.maps.msgMaps[msgId].handler(data);
        }
    },

    comparePriority: function (sceneName, tagName) {
        var map = {
            'loading': 1,
            'login': 2,
            'hall': 3,
            'mjgame': 4
        };
        return map[sceneName] - map[tagName];
    },

    handleDelayMsg: function (queue, sceneName) {
        for (let msg of queue) {
            console.log(msg);

        }
    }

});
