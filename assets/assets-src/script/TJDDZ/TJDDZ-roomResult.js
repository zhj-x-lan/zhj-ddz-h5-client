var RoomHandler = require('roomHandler');
var configMgr = require('configMgr');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        resultLayer: cc.Node,

        resultIcon: cc.Sprite,
        isMark: 0,

        roomid: cc.Label,
        createTime: cc.Label,
        roundNum: cc.Label,

        fonts: {
            default: [],
            type: cc.Font
        }
    },

    onLoad: function () {
        // registEvent('onPrepareInfo', this, this.initResultLayer);
    },

    onDestroy: function () {
        // unregistEvent('onPrepareInfo', this, this.initResultLayer);
    },
    onShow: function () {
        if (GameData.room.opts.joinermax) {
            this.hideTiChuai();
            for (var i = 0; i < GameData.room.opts.joinermax; i++) {
                this.showPlayer(i);
                this.showScore(i);
                this.showDetail(i);
                this.showWinIcon(i);
                this.showPoker(i);
                this.showPlayerTiChuai(i);
            }
            this.showResultIcon();
            this.showRoomDetail();
        }
    },
    initResultLayer: function() {
        if (!GameDataTJDDZ.isEmptyObject(GameDataTJDDZ.game.onRoomReadyInfo))
        {
            for (var key in GameDataTJDDZ.game.onRoomReadyInfo)
            {
                if (GameDataTJDDZ.game.onRoomReadyInfo[key] == true && key == GameData.player.uid)
                {
                    this.resultLayer.active = false;
                    break;
                }
            }
        }
    },
    showName: function(label, name) {
        if (isChinese(name)) 
        {
            label.string = getShortStr(name, 4);
        }
        else if (!isChinese(name)) 
        {
            label.string = getShortStr(name, 8);
        }
    },
    showPlayer: function (index) {
        var player = GameData.joiners[index];
        var idNode = cc.find('panel/player_' + (index + 1) + '/headNode/playerID', this.resultLayer);
        var nameNode = cc.find('panel/player_' + (index + 1) + '/headNode/name', this.resultLayer);
        var headpicNode = cc.find('panel/player_' + (index + 1) + '/headNode/head', this.resultLayer);
        var identityNode = cc.find('panel/player_' + (index + 1) + '/headNode/identity_icon', this.resultLayer);

        this.showName(nameNode.getComponent(cc.Label), player.name);
        idNode.getComponent(cc.Label).string = 'ID:' + player.uid;
        //显示地主农民icon
        identityNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/ddz/UI/common/dizhu_icon' + '.png';
        //cc.log('player.uid == GameDataTJDDZ.game.dizhuUid:'+player.uid,GameDataTJDDZ.game.dizhuUid);
        if (player.uid == GameDataTJDDZ.game.dizhuUid) {
            iconUrl = 'resources/ddz/UI/common/icon/dizhu_icon' + '.png';
        } else {
            iconUrl = 'resources/ddz/UI/common/icon/nongmin_icon' + '.png';
        }
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        identityNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);

        if (player.headimgurl == undefined || player.headimgurl == '') {
            return;
        }

        cc.loader.load({
            url: player.headimgurl,
            type: 'png'
        }, function (error, texture) {
            if (!error && texture) {
                cc.log('result:' + player.headimgurl);
                headpicNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }
        });


    },
    showDetail: function (index) {
        var player = GameData.joiners[index];
        var difen = cc.find('panel/player_' + (index + 1) + '/difen/label', this.resultLayer);
        var beishu = cc.find('panel/player_' + (index + 1) + '/beishu/label', this.resultLayer);
        difen.getComponent(cc.Label).string = GameDataTJDDZ.resultData.remainFen;
        beishu.getComponent(cc.Label).string = GameDataTJDDZ.resultData.boomNum;
    },
    showScore: function (index) {
        var uid = GameData.joiners[index].uid;
        var scoreNode = cc.find('panel/player_' + (index + 1) + '/field_num1', this.resultLayer);

        var score = 0;
        //判断是金币场
        if(gameDefine.currencyType.Currency_Coin == GameData.room.opts.currencyType){
            var coinData = RoomHandler.getCoinData();
            if(coinData && coinData.coin && coinData.coin[uid]){
                score = coinData.coin[uid];
            }
        } else {
            if(GameDataTJDDZ.resultData.score){
                score = GameDataTJDDZ.resultData.score[uid];
            }
        }
        score == undefined ? score = 0 : null;
        if (score > 0) {
            scoreNode.getComponent('cc.Label').font = this.fonts[0];
            scoreNode.getComponent('cc.Label').string = '+' + score;
        } else if (score == 0) {
            scoreNode.getComponent('cc.Label').font = this.fonts[2];
            scoreNode.getComponent('cc.Label').string = '+' + score;
        } else {
            scoreNode.getComponent('cc.Label').font = this.fonts[1];
            scoreNode.getComponent('cc.Label').string = score;
        }
    },
    hideTiChuai: function() {
        for (var index = 0; index < GameData.room.opts.joinermax; index++)
        {
            var player = cc.find('panel/player_' + (index + 1), this.resultLayer);
            var tiIcon = cc.find('tiIcon', player);
            var chuaiIcon = cc.find('chuaiIcon', player);
            tiIcon.active = false;
            chuaiIcon.active = false;
        }
    },
    showPlayerTiChuai: function(index) {
        var uid = GameData.joiners[index].uid;
        if (GameDataTJDDZ.isEmptyObject(GameDataTJDDZ.kicking))
        {
            return;
        }
        for (var key in GameDataTJDDZ.kicking.kicking)
        {
            if (key == uid && uid != GameDataTJDDZ.kicking.dizhu)
            {
                if (GameDataTJDDZ.kicking.kicking[key] == 1)
                {
                   var tiIcon = cc.find('panel/player_' + (index + 1) + '/tiIcon', this.resultLayer);
                   tiIcon.active = true;     
                }
            }
            else if (key == uid && uid == GameDataTJDDZ.kicking.dizhu)
            {
                if (GameDataTJDDZ.kicking.kicking[key] == 1)
                {
                   var chuaiIcon = cc.find('panel/player_' + (index + 1) + '/chuaiIcon', this.resultLayer);
                   chuaiIcon.active = true;     
                }
            }
        }
    },

    showWinIcon: function (index) {},
    showPoker: function (index) {
        var pokerNode = cc.find('panel/player_' + (index + 1) + '/cardsNoe', this.resultLayer);
        //隐藏poker节点
        for (var key in pokerNode.children) {
            pokerNode.children[key].active = false;
        }
        var uid = GameData.joiners[index].uid;
        var cards = GameDataTJDDZ.getHandCards(uid);
        if (cards == undefined)
        {
            return;
        }
        for (var i = 0; i < cards.length; i++) {
            var node = cc.find('card_' + i, pokerNode);
            node.active = true;
            node.getComponent(cc.Sprite).spriteFrame = null;
            var iconUrl = 'resources/ddz/UI/pokers/poker_' + cards[i] + '.png';
            // cc.log('load Card URL :' + iconUrl)
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        }

    },
    showResultIcon: function () {

        var myScore = 0;
        //判断是金币场
        if(gameDefine.currencyType.Currency_Coin == GameData.room.opts.currencyType){
            var coinData = RoomHandler.getCoinData();
            if(coinData && coinData.coin && coinData.coin[GameData.player.uid]){
                myScore = coinData.coin[GameData.player.uid];
            }
        } else {
            myScore = GameDataTJDDZ.resultData.score[GameData.player.uid];
        }

        var iconUrl = '';
        myScore == undefined ? myScore = 0 : null;
        if (myScore > 0) {
            iconUrl = 'resources/ddz/UI/result/woyingle' + '.png';
        } else if (myScore < 0) {
            iconUrl = 'resources/ddz/UI/result/shibaile' + '.png';
        }
        this.resultIcon.getComponent(cc.Sprite).spriteFrame = null;
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        this.resultIcon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },
    showRoomDetail: function () {
        this.roomid.string = '房间号:' + GameData.room.id;
        this.createTime.string = getDate(GameData.room.createtime);
        //var showRoundNum = GameData.realNum;
        this.roundNum.string = '第 ' + GameData.room.roundNum + '/' + GameData.room.opts.roundMax + ' 局';
    },
    setReady: function () {
        // cc.log("GameData.game.roundNum:"+GameData.game.roundNum+"  "+"GameData.game.roundmax:"+GameData.game.roundmax);
        if (!GameData.room.close) {
            TJDDZHandler.getInstance().requestReady(function (res) {});
            this.resultLayer.active = false;
            GameDataTJDDZ.game.dizhuUid = 0;
            sendEvent('tjddz-onGameStart');
            sendEvent('initTableNode');
        } else {
            this.resultLayer.active = false;
            this.node.getComponent('TJDDZ-roomMain').showSummaryLayer();
        }
        GameDataTJDDZ.clearObject(GameDataTJDDZ.kicking);
    },

    shareRet: function () {
        if (inCD(3000) == false) {
            screenShoot(wxShareTexture);
        }
    },
});