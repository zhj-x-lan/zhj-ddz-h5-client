var soundMngr = require('SoundMngr');
var RoomHandler = require('roomHandler');
var matchHandler = require('matchHandler');
var gameDefine = require('gameDefine');
var configMgr = require('configMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        layer_create: cc.Node,
        layer_join: cc.Node,

        // home layer
        head_node: cc.Node,
        head_name: cc.Label,
        head_identify_num: cc.Label,
        head_money_num: cc.Label,
        head_gold_num: cc.Label,
        head_friend_num: cc.Label,
        roomcard_num: cc.Label,
        create_btn: cc.Button,
        join_btn: cc.Button,
        back_btn: cc.Button,
        fangkaAdd: cc.Button,

        //代理房间Btn
        agentBtn: cc.Node,

        // join layer
        room_number: cc.String,
        room_number_bg: cc.Sprite,

        playerTemplate: cc.Prefab,
        paoMadengLabel: cc.Label,
        _paoMadengX: 0,

        //主界面底部相关按钮控件
        activeBtnNode: cc.Node,
        activeRedPoint: cc.Node,

        //匹配、比赛按钮
        matchBtnNode: cc.Node,
        fightBtnNode: cc.Node
    },

    onLoad: function () {
        //注册监听
        registEvent('onGameStart', this, this.showTableLayer);
        registEvent('ddz-onGameStart', this, this.showDDZTableLayer);
        registEvent('tjddz-onGameStart', this, this.showTJDDZTableLayer);
        registEvent('pdk-onGameStart', this, this.showPDKTableLayer);
        registEvent('openScore', this, this.showTableLayer);
        registEvent('onCardChange', this, this.roomcardRefresh);
        registEvent('refreshCreateOrBackBtn', this, this.refreshCreateOrBackBtn);
        registEvent('refreshActivityRedPoint', this, this.refreshActivityRedPoint);
        registEvent('onServerNotice', this, handlerServerNotice);
        registEvent('onMatchData', this, this.onMatchHandler);

        cc.game.addPersistRootNode(cc.find('lampNode'));
        
        this.runPaoMadeng();

        //玩家基本信息相关
        this.refreshPlayerInfo();
        //公告
        this.refreshNoticeShow();
        //创建和进入按钮控制
        this.refreshCreateOrBackBtn();
        //海报
        this.openPosterView();
        //匹配
        this.onMatchHandler();
        //匹配、比赛按钮控制
        this.refreshMatchOrFightBtn();

        if (ReplayDataCenter.openRoundPanel) {
            openView('RecordPanel');
        }
        if (ReplayDataCenter.openReplayPanel) {
            openView('RoundPanel');
        }
    },

    onEnable: function () {
        soundMngr.instance.playMusic('sound/wait');

        this.refreshAgentRoomBtn();
        //检测活动更新红点 临时添加 后期需要服务器添加活动相关字段
        if (!GameData.player.agentFlag) {
            sendEvent('refreshActivityRedPoint');
        }
    },
    onDestroy: function () {
        unregistEvent('onGameStart', this, this.showTableLayer);
        unregistEvent('ddz-onGameStart', this, this.showDDZTableLayer);
        unregistEvent('tjddz-onGameStart', this, this.showTJDDZTableLayer);
        unregistEvent('pdk-onGameStart', this, this.showPDKTableLayer);
        unregistEvent('openScore', this, this.showTableLayer);
        unregistEvent('onCardChange', this, this.roomcardRefresh);
        unregistEvent('refreshCreateOrBackBtn', this, this.refreshCreateOrBackBtn);
        unregistEvent('refreshActivityRedPoint', this, this.refreshActivityRedPoint);
        unregistEvent('onServerNotice', this, handlerServerNotice);
        unregistEvent('onMatchData', this, this.onMatchHandler);
    },

    showTableLayer: function () {
        cc.director.loadScene('table');
    },
    showDDZTableLayer: function () {
        cc.director.loadScene('table-DDZ');
    },
    showTJDDZTableLayer: function () {
        cc.director.loadScene('table-TJDDZ');
    },
    showPDKTableLayer: function () {
        cc.director.loadScene('table-PDK');
    },
    refreshPlayerInfo: function(){
        if (isChinese(GameData.player.name)) {
            this.head_name.string = getShortStr(GameData.player.name, 5);
        } else {
            this.head_name.string = getShortStr(GameData.player.name, 10);
        }
        var headNode = cc.instantiate(this.playerTemplate);
        headNode.getComponent('playerTemplate').setPlayer(GameData.player);
        headNode.getComponent('playerTemplate').setName('');
        headNode.getComponent('playerTemplate').showZhuang(false);
        headNode.getComponent('playerTemplate').setHeadIcon(GameData.player.headimgurl);
        this.head_node.addChild(headNode);

        //UI数据
        this.room_number = '';
        this.head_identify_num.string = GameData.player.uid;
        this.roomcardRefresh();
    },
    refreshNoticeShow: function(){
        if (GameData.serverNoticeData && GameData.serverNoticeData.length > 0) {

            var nowTime = new Date().valueOf();
            var lastTime = GameData.serverNoticeData[0].lastTime;

            if(false == ComparingDate(nowTime, lastTime)){
                if (!GameData.isRoomRunlampt) {
                    openView("RunlampPanel");
                }
                this.schedule(lampHandler, 1);
                GameData.isRoomRunlampt = true;
            }
        }
        if (GameData.serverNoticeData) {
            if (GameData.serverNoticeData.length > 1) {

                var nowTime = new Date().valueOf();
                var lastTime = GameData.serverNoticeData[0].lastTime;

                if(false == ComparingDate(nowTime, lastTime)){
                    if (!GameData.isRoomRunlampt) {
                        var seq = cc.sequence(cc.delayTime(15), cc.callFunc(function () {
                            openView("RunlampPanel1");
                        }));
                        this.node.runAction(seq);
                    }
                    this.schedule(lampHandler1, 1);
                    GameData.isRoomRunlampt1 = true;
                }
            }
        }
    },
    refreshCreateOrBackBtn: function () {

        if (GameData.player.roomid == undefined || GameData.player.roomid == 0) {
            this.create_btn.node.active = true;
            this.back_btn.node.active = false;
            //this.join_btn.interactable = true;
        } else {
            this.create_btn.node.active = false;
            this.back_btn.node.active = true;
            //this.join_btn.interactable = false;
        }
    },
    fangkaAddCBack: function (evt) {
        openView('kefuweixin');
    },
    roomcardRefresh: function () {
        //房卡
        this.roomcard_num.string = GameData.player.card;
        this.head_money_num.string = GameData.player.money;
        if (GameData.player.coin) {
            this.head_gold_num.string = GameData.player.coin;
        }
    },
    refreshMatchOrFightBtn: function(){
        //刷新按钮图片（开启和未开启两种）
        var matchUrl = 'resources/home/replace/jifenpipei01.png',
            fightUrl = 'resources/home/replace/bisaichang01.png';
        var matchList = configMgr.getMatchGameType();
        if(matchList && matchList.length > 0){
            matchUrl = 'resources/home/replace/jifenpipeikq01.png';
        }
        var fightList = configMgr.getFightGameType();
        if(fightList && fightList.length > 0){
            fightUrl = 'resources/home/replace/bisaichangkq01.png';
        }
        var matchSprite = this.matchBtnNode.getComponent(cc.Sprite);
        var fightSprite = this.fightBtnNode.getComponent(cc.Sprite);

        this.loadSpriteImg(matchSprite, matchUrl);
        this.loadSpriteImg(fightSprite, fightUrl);
    },
    loadSpriteImg: function(sprite, imgUrl){
        if (sprite == undefined || imgUrl == undefined || imgUrl.length <= 0) {
            return;
        }
        var texture = cc.textureCache.addImage(cc.url.raw(imgUrl));
        if(texture){
            sprite.spriteFrame = new cc.SpriteFrame(texture);
        }
    },
    createBtnClicked: function (evt) {
        this.layer_create.active = true;
        this.layer_create.on(cc.Node.EventType.TOUCH_START, function (evt) {
            evt.stopPropagation();
        });
        GameData.setGameType(gameDefine.GameType.Game_Mj_Tianjin);
    },

    refreshActivityRedPoint: function () {
        this.activeRedPoint.active = true;
    },

    backBtnClicked: function (evt) {
        RoomHandler.enterRoom(GameData.player.roomid);
    },

    joinBtnClicked: function (evt) {
        if (GameData.player.roomid == undefined || GameData.player.roomid <= 0) {
            this.showNumber();
            this.layer_join.active = true;
        } else {
            createMessageBox('您已在房间中,不能加入别的房间,是否返回房间?',
                function () {
                    RoomHandler.enterRoom(GameData.player.roomid);
                },
                function () {}
            );
        }
        this.layer_join.on(cc.Node.EventType.TOUCH_START, function (evt) {
            evt.stopPropagation();
        });
    },

    matchBtnClicked: function(evt) {

        var gameList = configMgr.getMatchGameType();
        if(gameList == undefined || gameList.length <= 0){
            createMessageBox('暂未开启。', function () {});
            return;
        }
        openView('SelectGamePanel');
    },
    fightBtnClicked: function(evt) {

        var gameList = configMgr.getFightGameType();
        if(gameList == undefined || gameList.length <= 0){
            createMessageBox('暂未开启。', function () {});
            return;
        }
        openView('SelectGamePanel');
    },

    backToHome: function (evt) {
        this.layer_create.active = false;
        this.layer_join.active = false;
    },

    enterNumber: function (evt, data) {
        if (this.room_number.length < 6) {
            this.room_number += data;
            this.showNumber();
            if (this.room_number.length >= 6) {
                RoomHandler.enterRoom(this.room_number);
            }
        }
    },

    deleteNumber: function (evt) {
        this.room_number = this.room_number.substring(0, this.room_number.length - 1);
        this.showNumber();
    },

    resetNumber: function (evt) {
        this.room_number = '';
        this.showNumber();
    },

    showNumber: function () {
        for (var i = 1; i <= this.room_number.length; i++) {
            var number = this.room_number.substr(i - 1, 1);
            var sprite = cc.find('panel/enter_number/room_number/number' + i, this.layer_join);
            sprite.getComponent("cc.Label").string = number;
            sprite.active = true;
        }
        for (var i = 6; i > this.room_number.length; i--) {
            var node = cc.find('panel/enter_number/room_number/number' + i, this.layer_join);
            node.active = false;
        }
    },

    enterRoom: function (evt) {
        if (this.room_number !== '') {
            RoomHandler.enterRoom(this.room_number);
        }
    },
    runPaoMadeng: function () {
        this._paoMadengX = this.paoMadengLabel.node.x;
        GameData.configData.paomadengIndex = 0;
        this.gotoPaoMadeng();
        this.schedule(this.gotoPaoMadeng, 10);
    },

    gotoPaoMadeng: function () {
        if (!GameData.configData.paomadeng) return;
        var paoMaStr = GameData.configData.paomadeng[GameData.configData.paomadengIndex].content;
        paoMaStr = paoMaStr.replace(/[\n]/ig, '');
        this.paoMadengLabel.string = paoMaStr;
        this.paoMadengLabel.node.x = this._paoMadengX;
        var moveToAction = cc.moveTo(10, cc.p(this._paoMadengX - 570 - this.paoMadengLabel.node.width, this.paoMadengLabel.node.y));
        this.paoMadengLabel.node.runAction(moveToAction);
        GameData.configData.paomadengIndex++;
        if (GameData.configData.paomadengIndex == GameData.configData.paomadeng.length) {
            GameData.configData.paomadengIndex = 0;
        }
    },

    refreshAgentRoomBtn : function(){

        //代开房按钮显示
        if(GameData.player.club == undefined
            || Object.keys(GameData.player.club).length <= 0
            || GameData.player.club.clubAdmin != 2){
            this.agentBtn.active = false;

            this.activeBtnNode.x = -445;
        }else{
            this.agentBtn.active = true;

            this.activeBtnNode.x = -562;
        }
    },

    showUIClub: function () {

        if (GameData.player.club && Object.keys(GameData.player.club).length > 0) {
            openView("PanelClub");
        } else {
            createMessageBox('您还没有俱乐部，请联系您的代理或推广员', function () {});
        }
    },

    openRecordPanel: function (evt) {
        openView('RecordPanel');
    },

    openSettingsPanel: function (evt) {
        openView('SettingsPanel');
    },

    shareBtnClick: function () {
        openView('SharePanel');
    },

    selectClubClick: function () {
        openView("selectclubPanel");
    },

    openShoppingPanel: function () {
        openView("shoppingPanel");
    },
    
    agentRoomClick: function () {

        RoomHandler.reqAgentRoom();
        RoomHandler.reqAgentResultRoom();

        openView("agentPanel");
    },

    showNotice: function () {
        this.activeRedPoint.active = false;
        openView("NoticePanel");
    },

    showCreateRoomDDZ: function () {
        openView('DDZ-CreateHome');
    },
    openPosterView: function () {

        if(false == GameData._posterIsShow
            || configMgr.getPoster() == undefined
            || configMgr.getPoster().length <= 0)
        {
            return;
        }
        GameData._posterIsShow = false;
        openView('PosterPanel');
    },

    onMatchHandler: function(){
        var IsMach = matchHandler.onMatch;
        if(IsMach){
            //无法设置界面显示层级，所以先打开选择界面
            openView('SelectGamePanel');
            openView('UIMatch');
        }
    }
});