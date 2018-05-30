var soundMngr = require('SoundMngr');
var gameDefine = require('gameDefine');
var configMgr = require('configMgr');
var RuleHandler = require('ruleHandler');
var RoomHandler = require('roomHandler');
var hongzhongData = require('hongzhongData');

cc.Class({
    extends: cc.Component,

    properties: {
        uiWaitLayer: cc.Node,
        resultLayer: cc.Node,
        dissolveLayer: cc.Node,
        summaryLayer: cc.Node,
        scoreLayer: cc.Node,
        debugLayer: cc.Node,
        mapLayer: cc.Node,

        debugBtn: cc.Node,
        mapBtnNode: cc.Node,
        talkBtn: cc.Button,
        yuyinNode: cc.Node,
        yuyinShortNode: cc.Node,

        uiResult: cc.Prefab,
        uiSummary: cc.Prefab,
        uiDissolve: cc.Prefab,
        uiScore: cc.Prefab,
        uiMap: cc.Prefab,
        uiDebug: cc.Prefab,

        tableUI: {
            default: [],
            type: cc.Node
        }
    },

    onLoad: function () {

        registEvent('onRoomInfo', this, this.RoomInfoHandler);
        registEvent('onGameStart', this, this.GameStartHandler);
        registEvent('onGameScore', this, this.GameScoreHandler);
        registEvent('onJoinerLost', this, this.showJoinerLost);
        registEvent('onJoinerConnect', this, this.showJoinerConnect);
        registEvent('shortRecord', this, this.YVShortRecordCallback);
        registEvent('showSummary', this, this.showSummaryLayer);

        scheduleLamp(this);

        //初始化数据
        this.initUIData();
        //初始化界面显示
        this.initUIShow();
        //添加小结算
        this.addUIResult();
        //添加总结算
        this.addUISummary();
        //添加分数
        this.addUIScore();
        //添加解散
        this.addUIDissolve();
        //添加地图节点
        this.addUIMap();
        //添加调牌
        this.addUIDebug();
    },
    onDestroy: function () {
        unregistEvent('onRoomInfo', this, this.RoomInfoHandler);
        unregistEvent('onGameStart', this, this.GameStartHandler);
        unregistEvent('onGameScore', this, this.GameScoreHandler);
        unregistEvent('onJoinerLost', this, this.showJoinerLost);
        unregistEvent('onJoinerConnect', this, this.showJoinerConnect);
        unregistEvent('shortRecord', this, this.YVShortRecordCallback);
        unregistEvent('showSummary', this, this.showSummaryLayer);
    },

    initUIData: function() {
        cc.log("...room main init data.");

        RuleHandler.instance.setGameType(GameData.client.gameType);

        this._curGameData = undefined;
        //设置当前游戏数据管理
        this.setCurGameData();
    },
    initUIShow: function(){

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
            var talkBtnWorldPos = this.convertToWorldSpace(this.getPosition());
            var RelativeCoordinatePos = {};
            RelativeCoordinatePos.x = talkBtnWorldPos.x - this.getPosition().x + 170;
            RelativeCoordinatePos.y = talkBtnWorldPos.y - this.getPosition().y + 50;
            var distance = cc.pDistance(movePos, RelativeCoordinatePos);
            if (distance > this.width) {
                self.yuyinNode.getComponent(cc.Animation).play("CancelSend");
                GameData.isPlayVioce = false;
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

        this.debugBtn.active = configMgr.getSetCardsOpen();//!cc.sys.isNative;

        this.resultLayer.active = false;
        this.summaryLayer.active = false;
        /*
        if(this._curGameData){
            var gameInfoData = this._curGameData.getGameInfoData();
            if(gameInfoData){
                if (gameInfoData.gameStart) {
                    this.showTableLayer();
                } else {
                    this.showWaitLayer();
                }
            }
        }
        */
        this.setLayerShow();
    },

    setCurGameData: function(){
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        switch (roomData.opts.gameType){
            case gameDefine.GameType.Game_Mj_HZ:{
                this._curGameData = hongzhongData;
            }break;
        }
    },
    setLayerShow: function(){
        var roomData = RoomHandler.getRoomData();
        if(roomData){
            if(roomData.status >= gameDefine.RoomState.GAMEING){
                this.showTableLayer();
            } else {
                this.showWaitLayer();
            }
        }
    },

    RoomInfoHandler: function(data){
        if(data == undefined){
            return;
        }
        RoomHandler.onRoomInfoSetData(data.detail);

        this.setCurGameData();
        this.setLayerShow();
        this.addUIResult();
        this.addUISummary();
        this.addUIScore();
    },
    GameStartHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.onGameStartSetData(data.detail);

        this.showTableLayer();
        this.mapCondition();
        this.setMapBtnShow();
    },
    GameScoreHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.onGameScoreSetData(data.detail);

        this.showResultLayer();
    },

    addUIResult: function(){
        var uiResultNode = this.resultLayer.getChildByName('uiResult');
        if(uiResultNode == undefined){
            uiResultNode = cc.instantiate(this.uiResult);
            uiResultNode.parent = this.resultLayer;
            uiResultNode.name = 'uiResult';
        }
        var template = uiResultNode.getComponent('roomResult-hz');
        template._curGameData = this._curGameData;
    },
    addUISummary: function(){
        var uiSummaryNode = this.summaryLayer.getChildByName('uiSummary');
        if(uiSummaryNode == undefined){
            uiSummaryNode = cc.instantiate(this.uiSummary);
            uiSummaryNode.parent = this.summaryLayer;
            uiSummaryNode.name = 'uiSummary';
        }
        var template = uiSummaryNode.getComponent('roomSummary-hz');
        template._curGameData = this._curGameData;
    },
    addUIScore: function(){
        var uiScore = this.scoreLayer.getChildByName('uiScore');
        if(uiScore == undefined){
            uiScore = cc.instantiate(this.uiScore);
            uiScore.parent = this.scoreLayer;
            uiScore.name = 'uiScore';
            uiScore.active = false;
        }
        var template = uiScore.getComponent('roomScore-hz');
        template._curGameData = this._curGameData;
    },
    addUIDissolve: function(){
        var uiDissolveNode = this.dissolveLayer.getChildByName('uiDissolve');
        if(uiDissolveNode == undefined){
            uiDissolveNode = cc.instantiate(this.uiDissolve);
            uiDissolveNode.parent = this.dissolveLayer;
            uiDissolveNode.name = 'uiDissolve';
            uiDissolveNode.active = false;
        }
    },
    addUIMap: function(){
        var uiMap = this.mapLayer.getChildByName('uiMap');
        if(uiMap == undefined){
            uiMap = cc.instantiate(this.uiMap);
            uiMap.parent = this.mapLayer;
            uiMap.name = 'uiMap';
            uiMap.active = false;
        }
    },
    addUIDebug: function(){
        var uiDebug = this.debugLayer.getChildByName('uiDebug');
        if(uiDebug == undefined){
            uiDebug = cc.instantiate(this.uiDebug);
            uiDebug.parent = this.debugLayer;
            uiDebug.name = 'uiDebug';
            uiDebug.active = false;
        }
    },

    showWaitLayer: function () {
        this.uiWaitLayer.active = true;
        this.showTableUI(false);
        this.resultLayer.active = false;
        soundMngr.instance.playMusic('sound/beijyingyue');
    },

    showTableLayer: function () {

        this.showTableUI(true);
        this.uiWaitLayer.active = false;
        this.resultLayer.active = false;
        soundMngr.instance.playMusic('sound/beijyingyue');
    },

    showTableUI: function (show) {
        cc.log("...showTableUI:"+show);
        for (var i = 0; i < this.tableUI.length; i++) {
            var node = this.tableUI[i];
            node.active = show;
        }
    },

    showResultLayer: function () {
        var self = this;
        this.scheduleOnce(function () {
            self.showResultDirectly();
        }, 2);
    },
    showResultDirectly: function () {

        this.resultLayer.active = true;
        this.uiWaitLayer.active = false;
        this.showTableUI(false);

        var uiResultNode = this.resultLayer.getChildByName('uiResult');
        if(uiResultNode){
            var template = uiResultNode.getComponent('roomResult-hz');
            template.onShow();
        }
    },

    showSettingLayer: function (evt) {
        sendEvent("runlamp");
        openView('SettingsPanel');
    },
    showSummaryLayer: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        this.summaryLayer.active = true;
        sendEvent('onShowSummary');

        if (GameData.player.uid == roomData.creator) {
            cc.sys.localStorage.setItem("creatorIsCheckIp", false);
        } else {
            cc.sys.localStorage.setItem("isCheckIp", false);
        }
    },
    showScoreLayer: function () {
        var uiScore = this.scoreLayer.getChildByName('uiScore');
        if(uiScore){
            uiScore.active = true;

            var template = uiScore.getComponent('roomScore-hz');
            template.ShowPlayerScoreItem();
        }
    },
    showDebugLayer: function () {
        var uiDebug = this.debugLayer.getChildByName('uiDebug');
        if(uiDebug){
            uiDebug.active = true;
        }
    },

    showChat: function () {
        if (inCD(3000)) return;
        openView('ChatPanel');
    },
    showJoinerLost: function (data) {
        var uid = data.detail.uid;
        var nameStr = GameData.getPlayerByUid(uid).name;
        createMoveMessage('玩家[' + nameStr + ']掉线了。');
    },
    showJoinerConnect: function (data) {
        var uid = data.detail.uid;
        var nameStr = GameData.getPlayerByUid(uid).name;
        createMoveMessage('玩家[' + nameStr + ']已上线。');
    },
    YVShortRecordCallback: function () {
        WriteLog('YVShortRecordCallback : ');
        this.yuyinShortNode.getComponent(cc.Animation).play("ShortRecoed");
        this.yuyinShortNode.getComponent('HideComponent').show(1);
    },
    mapCondition: function () {
        var uiMap = this.mapLayer.getChildByName('uiMap');
        if(uiMap){
            var template = uiMap.getComponent('AMapPanel');
            template.showPlayers();
        }

        var iconUrl;
        if (GameData.danger) {
            iconUrl = 'resources/table/map/weixian.png';
        } else {
            iconUrl = 'resources/table/map/anquan.png';
        }
        if (iconUrl != '') {
            console.log('iconUrl = ' + iconUrl);
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            this.mapBtnNode.getComponent(cc.Sprite).spriteFrame = null;
            this.mapBtnNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            this.mapBtnNode.active = true;
        }
    },
    showMap: function (eve) {
        var uiMap = this.mapLayer.getChildByName('uiMap');
        if(uiMap){
            uiMap.active = true;

            var template = uiMap.getComponent('AMapPanel');
            template.showPlayers();
        }
    },
    setMapBtnShow: function(){
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        if(roomData.opts.joinermax == 2) {
            this.mapBtnNode.active = false;
        } else {
            this.mapBtnNode.active = true;
        }
    }
});