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
        debugLayer: cc.Node,
        talkBtn: cc.Button,
        yuyinNode: cc.Node,
        yuyinShortNode: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        cc.log('22222222222');
        registEvent('onRoomInfo', this, this.showLayer);
        // registEvent('onGameAllResult', this, this.showSummaryLayer);
        // registEvent('onJoinerLost', this, this.showJoinerLost);
        // registEvent('shortRecord', this, this.YVShortRecordCallback);
        this.showLayer();
        //this.lostMessage = false;

        // if(GameDataDDZ.openScore == 1)
        // {
        //     this.showResultDirectly();
        // }
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

        // //打开界面时就隐藏，开局时才显示
        // if(GameDataDDZ.game.initcards) {
        //     this.showTableUI(true);
        // }
        // else {
        //     this.showTableUI(false);
        // }
        //cc.log('2222222222222');
        //this.showWaitLayer();
    },
    onEnable: function(){
    },
    onDestroy: function () {
        unregistEvent('onGameStart', this, this.showTableLayer);
        // unregistEvent('onGameAllResult', this, this.showSummaryLayer);
        // unregistEvent('onJoinerLost', this, this.showJoinerLost);
        // unregistEvent('shortRecord', this, this.YVShortRecordCallback);
        GameData.initRoomData();
    },
    showLayer: function () {
        cc.log('GameData.room.status = ' + GameData.room.status);
        if (GameData.room.status > TDKPokerCard.STATUS.WAITING) {
            this.showTableLayer();
        } else {
            this.showWaitLayer();
        }
    },
    showWaitLayer: function () {
        var flag = true;
        this.uiWaitLayer.active = flag;
        this.showTableUI(!flag);
        this.resultLayer.active = !flag;
        soundMngr.instance.playMusic('TDK/sound/backGround');
    },

    showTableLayer: function () {
        var flag = true;
        this.showTableUI(flag);
        this.uiWaitLayer.active = !flag;
        this.resultLayer.active = !flag;
        soundMngr.instance.playMusic('TDK/sound/backGround');
    },

    showTableUI: function (show) {
        for (var i = 0; i < this.tableUI.length; i++) {
            var node = this.tableUI[i];
            node.active = show;
        }
    },

    showSettingLayer: function (evt, data) {
        if (data == 1) {
            this.settingLayer.active = true;
            this.settingLayer.on(cc.Node.EventType.TOUCH_START, function (evt) {
                evt.stopPropagation();
            });
            //openView('DDZ-SettingsPanel',GameType.Game_Poker_DDZ);
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
        this.resultLayer.active = true;
        this.dissolveLayer.active = false;
        GameData.realNum = 0;
        this.resultLayer.on(cc.Node.EventType.TOUCH_START, function (evt) {
            evt.stopPropagation();
        });
        //sendEvent('onShowSummary');
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
        openView('TDKChatPanel', gameDefine.GameType.Game_TDK);
    },

    YVShortRecordCallback: function () {
        WriteLog('YVShortRecordCallback : ');
        this.yuyinShortNode.getComponent(cc.Animation).play("ShortRecoed");
        this.yuyinShortNode.getComponent('HideComponent').show(1);
    },
    
    AnimationDelayTime: function (data) {
        this._AnimationDelayTime = data.detail;
    },
});