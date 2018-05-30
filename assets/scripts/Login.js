var gt = require('MessageInit');
cc.Class({
    extends: cc.Component,

    properties: {
        num: 0,
        clicked: false,
        editbox: {
            default: null,
            type: cc.EditBox
        },
        eventMap: null,
    },

    onLoad: function () {

        //cc.vv.utils.screenAdapter();

        /**
        * login加载时，在连接LoginServer
        */
        var SocketMgr = require('SocketMgr');
        cc.vv.socketMgr = new SocketMgr();
        cc.vv.socketMgr.init();

        this.num = cc.vv.utils.generateUUid(8, 16);
        console.log('【1*---==================加载【Login.js】');

        var btnWx = cc.find('Canvas/btnWx');

        cc.vv.utils.addClickEvent(btnWx, this.node, 'Login', 'onBtnWxClicked');

        this.eventMap = {};
        this.registerLoginListeners();

        cc.loader.loadResDir("hall", cc.loader.onProgress, function (err, assets) {
            
        });
    },

    registerLoginListeners: function () {
        var self = this;
        var registerMsgListener = function (msgId, msgHandler, target) {
            let eventName = msgId.toString();
            if (!self.eventMap[eventName]) {
                cc.vv.dispatcher.on(eventName, msgHandler.bind(target));
                self.eventMap[eventName] = true;
            } else {
                console.error('事件' + msgId + '已经注册, 不能重复注册...');
            }
        };
        //gt.GC_LOGIN					= 61002  onRcvLogin
        registerMsgListener(gt.GC_LOGIN, cc.vv.userMgr.onRcvLogin, cc.vv.userMgr);
        //gt.GC_LOGIN_GATE			= 61115 //Gate回客户端登录消息 onRcvLoginGate
        registerMsgListener(gt.GC_LOGIN_GATE, cc.vv.userMgr.onRcvLoginGate, cc.vv.userMgr);
        //gt.GC_LOGIN_SERVER			= 61005 onRcvLoginServer
        registerMsgListener(gt.GC_LOGIN_SERVER, cc.vv.userMgr.onRcvLoginServer, cc.vv.userMgr);
        //gt.GC_ROOM_CARD				= 61006 onRcvRoomCard
        registerMsgListener(gt.GC_ROOM_CARD, this.onRcvRoomCard, this);
    },

    onRcvRoomCard: function (msgTbl) {
        console.warn('【Login.js】--> #61006 onRcvRoomCard()... '); 
        console.error('房卡信息...');
        console.warn(msgTbl);
    },

    onBtnTestClicked: function (event) {
        console.warn('onBtnTestClicked =================================');
        var name = '';
        var postfix = '8';
        var clickName = event.target.name;
        console.log(clickName);
        switch (clickName) {
            case 'btnTest1': 
                name = '张_' + postfix;
                break;
            case 'btnTest2':
                name = '李_' + postfix;
                break;
            case 'btnTest3':
                name = '王_' + postfix;
                break;
            case 'btnTest4':
                name = '赵_' + postfix;
                break;
        }
        cc.vv.gameMgr.uid = name;
        cc.vv.gameMgr.nk = name;
        cc.vv.socketMgr.createLoginSocket(cc.vv.socketMgr.login_url, 0);
    },

    onBtnWxClicked: function (data) {
        if (this.clicked) {
            return;
        }
        cc.vv.userMgr.loginType = 1;
       
        cc.vv.userMgr.kUUID = cc.sys.localStorage.getItem('uuid');

        this.clicked = true;
        if (cc.vv.userMgr.kUUID) {
            console.warn('存在uuid,直接uuid登陆.');
            cc.vv.socketMgr.createLoginSocket(cc.vv.socketMgr.login_url, 1, true);
        } else {
            console.warn('不存在uuid,code登陆.');
            cc.vv.socketMgr.createLoginSocket(cc.vv.socketMgr.login_url, 1, false);
        }
    },
});
