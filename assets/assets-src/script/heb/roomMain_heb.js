var soundMngr = require('SoundMngr');
var RuleHandler = require('ruleHandler');
var gameDefine = require('gameDefine');
cc.Class({
    extends: cc.Component,

    properties: {
        uiWaitLayer: cc.Node,
        //uiTableLayer: cc.Node,
        tableUI:
            {
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
        cc.log('onEnter 哈尔滨 table');
        registEvent('onGameStart', this, this.showTableLayer);
        registEvent('onGameReady', this, this.showTableLayer);
        //小结算
        registEvent('onMahjongRunEnd', this, this.showResultLayer);
        registEvent('onHuaDianMahjongReconnecet', this, this.showTableLayer);
        registEvent('onJoinerLost', this, this.showJoinerLost);
        registEvent('shortRecord', this, this.YVShortRecordCallback);
        registEvent('onStarPiao', this, this.openUIPiao);
        registEvent('initCards', this, this.closeUIPiao);

        RuleHandler.instance.setGameType(GameData.client.gameType);

        if (GameData.game.gameStart) {
            this.showTableLayer();
        } else {
            this.showWaitLayer();
        }
        this.lostMessage = false;

        if (GameData.openScore == 1) {
            this.showResultDirectly();
        }

        //显示飘选项
        //if (Object.keys(profileHuaDian.PiaoInfo).length>0) {
        //    this.openUIPiao();
        //}

        var self = this;
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            console.log('TOUCH_START');
            WriteLog('TOUCH_START : ');
            //增加连点CD；
            if (inCD(2000)) { return; }
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
            var talkBtnWorldPos = this.convertToWorldSpace(this.getPosition());
            var RelativeCoordinatePos = {};
            RelativeCoordinatePos.x = talkBtnWorldPos.x - this.getPosition().x + 170;
            RelativeCoordinatePos.y = talkBtnWorldPos.y - this.getPosition().y + 50;
            var distance = cc.pDistance(movePos, RelativeCoordinatePos);
            if (distance > this.width * 2) {
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
        //利用 庄 来判断是否已开局
        if (GameData.game.zhuangUid > 0) {
            this.showTableUI(true);
        }
        else {
            this.showTableUI(false);
        }

        //初始化牌局规则Label
        var playStr = "";
        if (GameData.room.opts) {
            playStr = getRuleStrCC(GameData.room.opts);
        }
        var rule_label = cc.find('layer_table/term', this.node);
        if (rule_label) {
            rule_label.getComponent('cc.Label').string = playStr;
        }
    },

    onDestroy: function () {
        unregistEvent('onGameStart', this, this.showTableLayer);
        unregistEvent('onMahjongRunEnd', this, this.showResultLayer);
        unregistEvent('onHuaDianMahjongReconnecet', this, this.showTableLayer);
        unregistEvent('onJoinerLost', this, this.showJoinerLost);
        unregistEvent('shortRecord', this, this.YVShortRecordCallback);
        unregistEvent('onStarPiao', this, this.openUIPiao);
        unregistEvent('initCards', this, this.closeUIPiao);
        cc.log('roomMain-destroy');
        GameData.initRoomData();
        profileHuaDian.initRoomData();
    },

    openUIPiao: function () {
        var flag = true;
        this.uiWaitLayer.active = !flag;
        this.resultLayer.active = !flag;
        this.showTableUI(false);
    },
    closeUIPiao: function () {
        this.showTableUI(true);
    },

    showWaitLayer: function () {
        var flag = true;
        this.uiWaitLayer.active = flag;
        this.showTableUI(!flag);
        this.resultLayer.active = !flag;
        soundMngr.instance.playMusic('sound/beijyingyue');
    },

    showTableLayer: function () {
        cc.log("~~~~~~~~~~~~~~show table layer and hide wait layer~~~~~~~~~~~~~~~~~")
        var flag = true;
        this.showTableUI(flag);
        this.uiWaitLayer.active = !flag;
        this.resultLayer.active = !flag;
        soundMngr.instance.playMusic('sound/beijyingyue');
        if (GameData.room.status == gameDefine.RoomState.READY) {
            this.showTableUI(!flag);
            MjHandler.getInstance().requestReady(function (res) {});
        }
    },

    showResultLayer: function () {
        var self = this;
        this.scheduleOnce(function () {
            self.showResultDirectly();
        }, 2);

    },

    showTableUI: function (show) {
        for (var i = 0; i < this.tableUI.length; i++) {
            var node = this.tableUI[i];
            node.active = show;
        }
    },

    showResultDirectly: function () {
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
        }
        this.node.getComponent('roomResult_heb').onShow();
    },

    showSettingLayer: function (evt, data) {
        if (data == 1) {
            //this.settingLayer.active = true;
            //this.settingLayer.on(cc.Node.EventType.TOUCH_START, function(evt) {evt.stopPropagation();});
            openView('SettingsPanel_CC',gameDefine.GameType.Game_Mj_CC);
        } else {
            this.settingLayer.active = false;
        }
    },

    showdissolveLayer: function (evt, data) {
        if (data == 1) {
            this.dissolveLayer.active = true;
            this.dissolveLayer.on(cc.Node.EventType.TOUCH_START, function (evt) { evt.stopPropagation(); });
        } else {
            this.dissolveLayer.active = false;
        }
    },

    showSummaryLayer: function () {
        this.summaryLayer.active = true;
        this.dissolveLayer.active = false;
        this.summaryLayer.on(cc.Node.EventType.TOUCH_START, function (evt) { evt.stopPropagation(); });

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
        if (inCD(2000)) return;
        openView('ChatPanel');
    },
    YVShortRecordCallback: function () {
        WriteLog('YVShortRecordCallback : ');
        this.yuyinShortNode.getComponent(cc.Animation).play("ShortRecoed");
        this.yuyinShortNode.getComponent('HideComponent').show(1);
    }
});
