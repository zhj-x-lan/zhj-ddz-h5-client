var soundMngr = require('SoundMngr');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        uiWaitLayer: cc.Node,
        //uiTableLayer: cc.Node,
        tableUI: {
            default: [],
            type: cc.Node
        },
        //tableLayer: cc.Node,
        resultLayer: cc.Node,
        settingLayer: cc.Node,
        dissolveLayer: cc.Node,
        summaryLayer: cc.Node,
        debugLayer: cc.Node,
        talkBtn: cc.Button,
        yuyinNode: cc.Node,
        yuyinShortNode: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        registEvent('tjddz-onGameStart', this, this.showTableLayer);
        //registEvent('ddz-onGameScore', this, this.showResultLayer);
        registEvent('onJoinerLost', this, this.showJoinerLost);
        registEvent('shortRecord', this, this.YVShortRecordCallback);
        registEvent('AnimationDelayTime', this, this.showResultLayer);
        registEvent('onServerNotice', this, handlerServerNotice);

        scheduleLamp(this);

        if (GameDataTJDDZ.game.gameStart) {
            //cc.log('11111111111111111111');
            this.showTableLayer();
        } else {
            this.showWaitLayer();
        }
        this.lostMessage = false;

        if (GameDataTJDDZ.openScore == 1) {
            this.showResultDirectly();
        }
        var self = this;
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            console.log('TOUCH_START');
            WriteLog('TOUCH_START : ');
            //增加连点CD；
            if (inCD(1000)) {
                return;
            }
            console.log('TOUCH_START and');
            yunwaStartTalk();
            self.yuyinNode.active = true;
            GameData.isPlayVioce = true;
            self.yuyinNode.getComponent(cc.Animation).play("yuyin");
            cc.audioEngine.pauseAll();

        });

        this.talkBtn.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            console.log('TOUCH_MOVE');
            var movePos = event.touch.getLocation();
            var talkBtnMovePos = this.convertToNodeSpace(movePos);
            var radius = {
                x: this.getContentSize().width / 2,
                y: this.getContentSize().height / 2
            };
            var distance = cc.pDistance(talkBtnMovePos, radius);
            //cc.log('distance :'+distance);
            if (distance > this.getContentSize().width) {
                self.yuyinNode.getComponent(cc.Animation).play("CancelSend");
                GameData.isPlayVioce = false;
                // console.log("distance: movePos this.width/2 "+distance,movePos,this.width/2);
            }
        });

        this.talkBtn.node.on(cc.Node.EventType.TOUCH_END, function () {
            console.log('TOUCH_END');
            WriteLog('TOUCH_END : ');
            yunwaStopTalk();
            self.yuyinNode.active = false;
            cc.audioEngine.resumeAll();
        });

        this.talkBtn.node.on(cc.Node.EventType.TOUCH_CANCEL, function () {
            console.log('TOUCH_CANCEL');
            yunwaStopTalk();
            GameData.isPlayVioce = false;
            self.yuyinNode.active = false;
            cc.audioEngine.resumeAll();
        });

        //打开界面时就隐藏，开局时才显示
        if (GameDataTJDDZ.game.initcards) {
            this.showTableUI(true);
        } else {
            this.showTableUI(false);
        }
    },

    onDestroy: function () {
        unregistEvent('tjddz-onGameStart', this, this.showTableLayer);
        //unregistEvent('ddz-onGameScore', this, this.showResultLayer);
        unregistEvent('onJoinerLost', this, this.showJoinerLost);
        unregistEvent('shortRecord', this, this.YVShortRecordCallback);
        unregistEvent('AnimationDelayTime', this, this.showResultLayer);
        unregistEvent('onServerNotice', this, handlerServerNotice);
        GameData.initGameData();
        GameDataTJDDZ.initRoomData();
    },
    showWaitLayer: function () {
        var flag = true;
        this.uiWaitLayer.active = flag;
        this.showTableUI(!flag);
        this.resultLayer.active = !flag;
        soundMngr.instance.playMusic('ddz/sound/ddz_bg');
    },

    showTableLayer: function () {
        var flag = true;
        this.showTableUI(flag);
        this.uiWaitLayer.active = !flag;
        this.resultLayer.active = !flag;
        soundMngr.instance.playMusic('ddz/sound/ddz_bg');
    },

    showResultLayer: function (data) {
        var AnimationDelayTime = data.detail;
        //cc.log('AnimationDelayTime:'+JSON.stringify(AnimationDelayTime));
        var self = this;
        this.scheduleOnce(function () {
            self.showResultDirectly();
        }, AnimationDelayTime);

    },

    showTableUI: function (show) {
        for (var i = 0; i < this.tableUI.length; i++) {
            var node = this.tableUI[i];
            node.active = show;
        }
    },

    showResultDirectly: function () {
        WriteLog('-----------------showResultDirectly------------------------');
        var flag = true;
        this.resultLayer.active = flag;
        this.uiWaitLayer.active = !flag;
        this.showTableUI(!flag);
        //table初始化的时候不敢保证这个监听和抛事件谁先执行，改为接口形式
        //sendEvent('onShowResult');
        if (GameData.contact == true && GameData.joinContact.uid == GameData.player.uid) {
            GameData.contact = false;
        } else {
            GameData.contact = false;
            GameData.realNum++;
        }
        this.node.getComponent('TJDDZ-roomResult').onShow();
    },

    showSettingLayer: function (evt, data) {
        if (data == 1) {
            //this.settingLayer.active = true;
            //this.settingLayer.on(cc.Node.EventType.TOUCH_START, function(evt) {evt.stopPropagation();});
            openView('DDZ-SettingsPanel', gameDefine.GameType.Game_Poker_TianjinDDZ);
        } else {
            this.settingLayer.active = false;
        }
    },

    showdissolveLayer: function (evt, data) {
        if (data == 1) {
            this.dissolveLayer.active = true;
            this.dissolveLayer.on(cc.Node.EventType.TOUCH_START, function (evt) {
                evt.stopPropagation();
            });
        } else {
            this.dissolveLayer.active = false;
        }
    },

    showSummaryLayer: function () {
        this.summaryLayer.active = true;
        this.dissolveLayer.active = false;
        GameData.realNum = 0;
        this.summaryLayer.on(cc.Node.EventType.TOUCH_START, function (evt) {
            evt.stopPropagation();
        });
        sendEvent('onShowSummary');
        if (GameData.player.uid == GameData.room.creator) {
            cc.sys.localStorage.setItem("creatorIsCheckIp", false);
        } else {
            cc.sys.localStorage.setItem("isCheckIp", false);
        }
    },

    showDebugLayer: function () {
        this.debugLayer.active = !this.debugLayer.active;
    },

    showJoinerLost: function (data) {
        // if (this.lostMessage) return;
        // this.lostMessage = true;
        // var player = GameData.getPlayerByUid(data.detail.uid);
        // var text = '玩家' + player.name + '离开了房间，请重新创建房间';
        // createMessageBox(text, function() {
        //     RoomHandler.quitMjRoom(GameData.room.id);
        // });

    },

    showChat: function () {
        if (inCD(3000)) return;
        openView('ChatPanel');
    },
    YVShortRecordCallback: function () {
        WriteLog('YVShortRecordCallback : ');
        this.yuyinShortNode.getComponent(cc.Animation).play("ShortRecoed");
        this.yuyinShortNode.getComponent('HideComponent').show(1);
    },
    AnimationDelayTime: function (data) {
        this._AnimationDelayTime = data.detail;
    }
});