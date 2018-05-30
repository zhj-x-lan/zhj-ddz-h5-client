var soundMngr = require('SoundMngr');
var gameDefine = require('gameDefine');
var roomHandler = require('roomHandler');
var niuNiuHandler = require('niuNiuHandler');
var _getBossIntr = function (idx) {
    var strs = [
        // "房主坐庄",
        "轮流坐庄",
        // "牛牛坐庄",
        // "自由抢庄",
        "明牌抢庄"
    ]
    return strs[idx];
};

cc.Class({
    extends: cc.Component,

    properties: {
        roomId: cc.Label, // 房间编号
        bossType: cc.Label, // 庄位
        roundInfo: cc.Label, // 局数
        scoreBase: cc.Label, // 底分
        playerHeads: [cc.Node],
        readyNode: cc.Node,
        wifiNode: cc.Node,
        playerTemplate: cc.Prefab,
        btnReady: cc.Node,
        btnStart: cc.Node, //开始按钮
        unStartLayer: cc.Node,
        playintrNode: cc.Node,
        // winAnim:cc.Node, //胜利动画
        // loseAnim:cc.Node,//失败动画

        // scoreMask: cc.Node,
        // scoreNode: cc.Prefab,
        // scoreParent: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.headers = new Array();
        this.handlerMsg();
        this.initUi();
    },

    handlerMsg: function () {
        registEvent('onRoomInfo', this, this.initPlayers);
        registEvent('onPrepareInfo', this, this.initReadyInfo);
        registEvent("douniu-onGameStart", this, this.initUi);
        registEvent('douniu-onGameInfo', this, this.initPlayers);
        registEvent('onCreatorQuit', this, this.onCreatorQuit);
        registEvent('onJoinerLost', this, this.handleJoinerLost);
        registEvent('onJoinerConnect', this, this.initPlayers);
        // registEvent("onRunEnd", this, this.handleRunEnd); // onUserReconnect
        registEvent('onRoomChat', this, this.onRoomChatHandler);
        registEvent('yunwaUploaded', this, this.onYunwaUploaded);
    },

    onDestroy: function () {
        unregistEvent('onRoomInfo', this, this.initPlayers);
        unregistEvent('onPrepareInfo', this, this.initReadyInfo);
        unregistEvent("douniu-onGameStart", this, this.initUi);
        unregistEvent('douniu-onGameInfo', this, this.initPlayers);
        unregistEvent('onCreatorQuit', this, this.onCreatorQuit);
        unregistEvent('onJoinerLost', this, this.handleJoinerLost);
        unregistEvent('onJoinerConnect', this, this.initPlayers);
        // unregistEvent("onRunEnd", this, this.handleRunEnd);
        unregistEvent('onRoomChat', this, this.onRoomChatHandler);
        unregistEvent('yunwaUploaded', this, this.onYunwaUploaded);
    },

    initUi: function () {
        this.readyNode.active = false; //准备
        this.btnStart.active = false; // 开始

        var roomInfo = roomHandler.room;

        this.roomId.string = roomInfo.id;
        this.bossType.string = "庄位: " + _getBossIntr(roomInfo.opts.bossType - 1);
        this.roundInfo.string = "局数: " + roomInfo.roundNum + " / " + roomInfo.opts.roundMax;
        this.scoreBase.string = "底分: " + roomInfo.opts.scoreBase;

        this.initPlayers(); //初始化玩家的头像信息
        // this.initReadyInfo();

        //this.showPlayIntroduce();

        // 开始按钮的状态
        if (roomInfo.creator == GameData.player.uid && roomInfo.status == gameDefine.RoomState.WAIT) {
            this.btnStart.active = true;
        } else {
            this.btnStart.active = false;
        }

        this.unStartLayer.active = roomInfo.status == gameDefine.RoomState.WAIT; // 开局等待节点
        if (roomInfo.creator == GameData.player.uid) { // 如果玩家是房主的话
            cc.find("/deleteRoomBtn", this.unStartLayer).active = this.unStartLayer.active
        }else {
            cc.find("/deleteRoomBtn", this.unStartLayer).active = false;
        }
    },

    initPlayers: function () {
        this.headers = [];
        for (var i = 0; i < this.playerHeads.length; i++) {
            this.playerHeads[i].active = false;
        }

        var players = roomHandler.players;
        for (var j = 0; j < players.length; j++) {
            var player = players[j];
            if (player == null) continue;

            var localIndex = roomHandler.getLocalPosition(j);
            var headNode = this.playerHeads[localIndex].getChildByName("TableNiuNiuPlayerTemplate");
            headNode.parent.active = true;

            var playerHeadScp = headNode.getComponent("playerTemplate");
            var zhuang = (player.uid == niuNiuHandler.zhuangUid);
            cc.log('niuNiuHandler.zhuangUid = '+niuNiuHandler.zhuangUid);
            var roomScore = roomHandler.scores[player.uid];
            var isOnline = roomHandler.isPlayerOnline(player.uid);
            playerHeadScp.setPlayer(player);
            playerHeadScp.setName(player.name);
            playerHeadScp.setHeadIcon(player.headimgurl);
            playerHeadScp.showZhuang(zhuang);
            playerHeadScp.getLiuGuang(zhuang);
            playerHeadScp.setCoin(roomScore);
            playerHeadScp.setIsOnline(isOnline);
            this.headers.push(headNode);


            // 设置玩家下注的倍数
            var betNum = niuNiuHandler.playerChips[player.uid];
            cc.log('betNum = '+JSON.stringify(betNum));
            var betNode = this.playerHeads[localIndex].getChildByName("betNum");
            for (var i = 0; i < betNode.childrenCount; i++) {
                betNode.children[i].active = false;
            }
            if (betNum > 0 && betNode.getChildByName(betNum + "jiao")) {
                betNode.getChildByName(betNum + "jiao").active = true;
            }

            // 设置玩家抢庄状态
            var zhuangNum = niuNiuHandler.playerZhuang[player.uid];
            var zhuangNode = this.playerHeads[localIndex].getChildByName("numQiang");
            for (var i = 0; i < zhuangNode.childrenCount; i++) {
                zhuangNode.children[i].active = false;
            }
            cc.log('niuNiuHandler.status = '+niuNiuHandler.status+',zhuangNum = '+zhuangNum);
            if (niuNiuHandler.status >= niuNiuHandler.NIU_NIU.GAMESTATUS.ZHUANG && zhuangNum > 0 && zhuangNode.getChildByName(zhuangNum + "qiang")) {
                zhuangNode.getChildByName(zhuangNum + "qiang").active = true;
            }
            if (niuNiuHandler.status > niuNiuHandler.NIU_NIU.GAMESTATUS.ZHUANG && niuNiuHandler.zhuangUid != player.uid) {
                for (var i = 0; i < zhuangNode.childrenCount; i++) {
                    zhuangNode.children[i].active = false;
                }
            }
        }
        this.initReadyInfo();
    },
    // 玩家的准备信息 
    initReadyInfo: function () {
        if (niuNiuHandler.status >= niuNiuHandler.NIU_NIU.GAMESTATUS.COMPARE) {
            if (niuNiuHandler.status == niuNiuHandler.NIU_NIU.GAMESTATUS.SETTLE) {
                var self = this;
                this.scheduleOnce(this.showReadyBtn,5);   
            }
            return;
        } 
        if (roomHandler.room.status == gameDefine.RoomState.WAIT || roomHandler.room.status == gameDefine.RoomState.READY) {
            for (var child in this.readyNode.children) {
                this.readyNode.children[child].active = false;
            }
            var players = roomHandler.players;
            for (var j = 0; j < players.length; j++) {
                var userInfo = players[j]; // 房间内玩家的信息
                if (userInfo == null) continue;
                var localIndex = roomHandler.getLocalPosition(j);
                // 判断准备按钮是否可用
                var ready = roomHandler.readyData[userInfo.uid];
                if (localIndex == 0 && userInfo.uid == GameData.player.uid) {
                    this.btnReady.active = !ready;
                }
                this.readyNode.getChildByName("ready_hand_" + localIndex).active = ready;
                this.readyNode.getChildByName("readying_" + localIndex).active = !ready;
            }
            this.readyNode.active = true;

        } else {
            this.readyNode.active = false;
            this.btnReady.active = false;
        }
    },
    showReadyBtn: function () {
        this.btnReady.active = true;
        this.unschedule(this.showReadyBtn);
    },
    //开始按钮的回调函数
    onSartBtnClick: function () {
        var players = roomHandler.players;
        if (players.length < 2) {
            createMoveMessage("房间内至少有两名玩家");
            return;
        }
        for (var i = 0; i < players.length; i++) {
            var userInfo = players[i];
            if (!roomHandler.readyData[userInfo.uid]) {
                createMoveMessage("房间内的玩家必须都要准备");
                return;
            }
        }
        niuNiuHandler.requestStart();
    },

    //复制房间号
    onCopyRoomInfo: function () {
        var roomId = roomHandler.room.id;
        if (roomId > 0) {
            var title = "牛牛," + "房间号:" + roomId + ",";
            //var des = this.getInviteStr();
            var roomInfo = roomHandler.room.opts;
            var des = getRuleStrNiuNiu(roomInfo)+",邀请您快速进入";

            textClipboard(title + des);

            console.log("复制信息成功。  " + title + des);
            createMoveMessage("复制信息成功。");
        }
    },

    // 退出房间的按钮
    onQuitRoomBtnClick: function () {
        if (roomHandler.room.creator == GameData.player.uid) {
            cc.director.loadScene('home');
        } else {
            roomHandler.quitRoom(roomHandler.room.id);
        }
    },

    //房主才能点击的解散按钮
    onDismissRoomBtnClick: function () {
        var self = this;
        NiuNiuMessageBox('解散房间不扣房卡，是否确定解散？', function () {
            roomHandler.deleteRoom(roomHandler.room.id, 'apply');
        }, function () {});
    },
    onCreatorQuit :function()
    {
        GameData.player.roomid = undefined;
        if(roomHandler.room.creator != GameData.player.uid)
        {
            NiuNiuMessageBox('房主已经解散房间', function() {cc.director.loadScene('home');});            
        }
        else
        {
            cc.director.loadScene('home');
        }
    },
    // 玩家信息
    ruleClick : function(){
        if(this.playintrNode.active == true){
            //console.log("2222222222222222222222");
            return;
        }
        this.playintrNode.active = true;
        this.onShowPlayIntrClick();
        this.playintrNode.runAction(cc.sequence(
            cc.moveTo(0.5,cc.p(30,334)),
            //cc.callFunc(this.isRuleBtn,this),
            cc.delayTime(10),
            cc.moveTo(0.5,cc.p(30,434)),
            cc.callFunc(this.isRuleBtn,this)
        ));

    },

    isRuleBtn :function(){
        this.playintrNode.active = false;
    },

    onShowPlayIntrClick : function()
    {
        this.playIntrSize = this.playIntrSize == 'small' ? 'big' : 'small';
        this.showPlayIntroduce(this.playIntrSize);
        cc.find('openBtn',this.playintrNode).rotation = this.playIntrSize == 'small' ? 0 : 180;
    },

    showPlayIntroduce : function(size)
    {  // console.log('GameData.room.opts '+GameData.room.opts);
        if(!roomHandler.room.opts)return;
        var playStr = '';
        playStr += roomHandler.room.opts.roundMax +'局,';
        playStr +=  '2-6人,';
        if(roomHandler.room.opts.costType == 1){
            playStr +=  '房主付费,';
        }else if(roomHandler.room.opts.costType == 2){
            playStr +=  'AA,';
        }else if(roomHandler.room.opts.costType == 3){
            playStr +=  '赢家付,';
        }

        if(roomHandler.room.opts.multipeType == 0){
            playStr +=  '下注1/5/10,';
        }else if(roomHandler.room.opts.multipeType == 1){
            playStr +=  '下注1/2,';
        }
        playStr +=  '轮流坐庄';

        var contentNode = cc.find(size + '/content',this.playintrNode);
        //cc.log('size : ' + size + 'contentNode : ' + contentNode);
        var label = contentNode.getComponent(cc.Label);
        label.string = playStr;
    },

    //微信邀请按钮
    wxInviteBtnClicked: function () {
        var title = "牛牛扑克 " + "房间号:" + roomHandler.room.id;
        var des = this.getInviteStr();
        wxShareWeb(title, des);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    //-------------------------- 网络监听回调

    
    // 监听用户离开
    handleJoinerLost: function () {
        this.initPlayers();
    },

    //---------------------------------

    getInviteStr: function () {
        var str = "玩法: " + this.bossType.string + ',' + roomHandler.room.opts.roundMax+ '局,'+ this.scoreBase.string + ',2-6人,';
        if(roomHandler.room.opts.costType == 1){
            str +=  '房主付费';
        }else if(roomHandler.room.opts.costType == 2){
            str +=  'AA';
        }else if(roomHandler.room.opts.costType == 3){
            str +=  '赢家付';
        }
        str = str + ", 请您快速加入";
        cc.log('........str = '+str);
        return str;
    },
    onYunwaUploaded:function (data) {
        var soundurl = data.detail;
         WriteLog('soundurl ：'+ soundurl);
        ChatHandler.getInstance().sendRecord(soundurl);
    },

    onRoomChatHandler : function(data)
    {
        var uid = data.detail.uid;
        var type = data.detail.msg.type;
        cc.log('uid = '+uid+',type = '+type);
        var player = roomHandler.getPlayerByUid(uid);
        if (player == null) return;
        var playerSex = player.sex;
        //cc.log(' this.headers:'+ this.headers.length);
        //cc.log(' this.uid:'+ headerNode.getComponent('playerTemplate').uid,uid);
        for(var i = 0; i < this.headers.length; i++)
        {
            var headerNode = this.headers[i];
            cc.log(' this.uid:'+ headerNode.getComponent('playerTemplate').uid,uid);
            if(headerNode.getComponent('playerTemplate').uid == uid)
            { 
                var chatNode = cc.find('chat',headerNode);
                if(chatNode != null)
                {
                    var wordNode = cc.find('word',chatNode);
                    var emoNode = cc.find('emo',chatNode);
                    var yuyinNode = cc.find('yuyinNode',chatNode);
                    if(type == 'word')
                    {
                        var content = data.detail.msg.data;

                        var chatBg = cc.find('word/bg',chatNode);
                        var chatLabel = cc.find('word/Label',chatNode).getComponent(cc.Label);
                        var contentStr = content;
                        chatBg.width = 20+contentStr.length * 24;
                        wordNode.getComponent('HideComponent').show(3);
                        chatLabel.string = contentStr;
                    }
                    else if(type == 'fast')
                    {
                        var soundKey = data.detail.msg.data.sound;
                        var content = data.detail.msg.data.content;
                        var chatBg = cc.find('word/bg',chatNode);
                        var chatLabel = cc.find('word/Label',chatNode).getComponent(cc.Label);
                        var contentStr = getShortStr(content,10);
                        chatBg.width = contentStr.length * 30;
                        wordNode.getComponent('HideComponent').show(3);
                        chatLabel.string = contentStr;
                        cc.log('soundKey:'+soundKey,this.playerSex);
                        soundMngr.instance.playAudioChat(soundKey,this.playerSex);
                        
                    }
                    else if(type == 'emo')
                    {
                        var animationName = data.detail.msg.data;
                        emoNode.getComponent(cc.Animation).play(animationName);
                        emoNode.getComponent('HideComponent').show(3);
                    }
                    else if(type == 'yuyin') 
                    {   
                        if(!GameData.isPlayVioce){
                            return;
                        }
                        var soundurl = data.detail.msg.data;
                        if (cc.sys.OS_ANDROID == cc.sys.os)
                        {
                            jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "playRecord", "(Ljava/lang/String;)V",soundurl);
                        } 
                        else if(cc.sys.OS_IOS == cc.sys.os)
                        {
                            jsb.reflection.callStaticMethod("AppController", "playRecord:", String(soundurl));
                        }
                        var yuyinAnim = cc.find('yuyinAnimNode/yuyinAnim',yuyinNode);
                        yuyinAnim.getComponent(cc.Animation).play("yuyinduihua");
                        yuyinNode.getComponent('HideComponent').show(3);

                    }                 
                }           
            }
        }

    },
});