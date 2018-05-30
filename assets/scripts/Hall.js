var gt = require('MessageInit');
cc.Class({
    extends: cc.Component,

    properties: {
        lblName: cc.Label,
        lblID: cc.Label,
        joinGameWin: cc.Node,
        createRoomWin: cc.Node,
        settingsWin: cc.Node,
        headNode: cc.Node,
        btnJoinGame: cc.Node,
        btnReturnGame: cc.Node,
        eventMap: null,
    },

    initNetHandlers: function () {
        var self = this;
    },

    onShare: function () {

    },

    onLoad: function () {
      
        //cc.vv.utils.screenAdapter();

        this.initLabels();
        
        this.initHead();

        if (cc.vv.gameMgr.oldRoomId == null) {
            this.btnJoinGame.active = true;
            this.btnReturnGame.active = false;
        }
        else {
            this.btnJoinGame.active = false;
            this.btnReturnGame.active = true;
        }

        //cc.vv.utils.addClickEvent(this.sprHeadImg.node,this.node,"Hall","onBtnClicked");

        //this.addComponent("UserInfoShow");

        this.initButtonHandler("Canvas/btn_shezhi");

        cc.vv.audioMgr.playBGM("bgMain.mp3");

        cc.vv.utils.addEscEvent(this.node);

        this.eventMap = {};
        this.registerHallListeners();

        cc.loader.loadResDir("room", cc.loader.onProgress, function (err, assets) {
            console.warn('房间加载完成...');
        });
        cc.loader.loadResDir("join", cc.loader.onProgress, function (err, assets) {
            console.warn('加入房间加载完成...');
        });
    },

    registerHallListeners: function () {
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

        //gt.GC_CREATE_ROOM			= 61013 onRcvCreateRoom
        registerMsgListener(gt.GC_CREATE_ROOM, cc.vv.roomMgr.onRcvCreateRoom);

        //gt.GC_JOIN_ROOM				= 61015  onRcvJoinRoom
        registerMsgListener(gt.GC_JOIN_ROOM, cc.vv.roomMgr.onRcvJoinRoom);


        //gt.GC_ENTER_ROOM			= 61022 onRcvEnterRoom
        registerMsgListener(gt.GC_ENTER_ROOM, cc.vv.roomMgr.onRcvEnterRoom);

        //gt.GC_ADD_PLAYER			= 61023  onRcvAddPlayer
        //加入房间时,也会在大厅场景收到消息.
        registerMsgListener(gt.GC_ADD_PLAYER, cc.vv.roomMgr.onRcvAddPlayer);
    },


    initButtonHandler: function (btnPath) {
        var btn = cc.find(btnPath);
        cc.vv.utils.addClickEvent(btn, this.node, "Hall", "onBtnClicked");
    },

    initLabels: function () {
        this.lblName.string = cc.vv.userMgr.kNike;
        this.lblID.string = "ID:" + cc.vv.userMgr.kId;
    },

    initHead: function () {
        console.warn('初始化头像...');
        if (!cc.vv.userMgr.sprHead) {
            console.warn('头像还没加载完成...');
        }
    
        this.headNode.getComponent(cc.Sprite).spriteFrame = cc.vv.userMgr.sprHead;
    },

    onBtnClicked: function (event) {
        if (event.target.name == "btn_shezhi") {
            this.settingsWin.active = true;
        }
    },

    onJoinGameClicked: function () {
        this.joinGameWin.active = true;
    },

    onReturnGameClicked: function () {
        cc.vv.alert.show('提示', '房间已创建,即将返回', () => {
            cc.director.loadScene('mjgame')
        }, true);
    },

    onCreateRoomClicked: function () {
        //测试小游戏音效代码
        if (!cc.vv.gameMgr.oldRoomId) {
            this.createRoomWin.active = true;
        } else {
            cc.vv.alert.show('提示', '房间已创建,即将返回', () => {
                cc.director.loadScene('mjgame')
            }, true);
        }
    },

    onDestroy: function () {
        console.warn('销毁: [Hall.js]--> onDestroy()...');

    },

    lateUpdate: function () {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            var context = cc.sys.__audioSupport.context; //小游戏平台中,context为null
            if (context.state === 'suspended') {
                context.resume();
            }
        }
    }
});
