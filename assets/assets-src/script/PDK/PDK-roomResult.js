var PDKHandler = require('PDK-handler');
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

    // use this for initialization
    onLoad: function () {
        // registEvent('onPrepareInfo', this, this.initResultLayer);
    },

    onDestroy: function () {
        // unregistEvent('onPrepareInfo', this, this.initResultLayer);
    },
    onShow: function () {
        if (GameData.room.opts.joinermax) {
            for (var i = 0; i < GameData.room.opts.joinermax; i++) {
                this.showPlayer(i);
                this.showScore(i);
                this.showDetail(i);
                this.showWinIcon(i);
                this.showPoker(i);
            }
            this.showResultIcon();
            this.showRoomDetail();
        }
    },
    initResultLayer: function() {
        if (!GameDataPDK.isEmptyObject(GameDataPDK.game.onRoomReadyInfo))
        {
            for (var key in GameDataPDK.game.onRoomReadyInfo)
            {
                if (GameDataPDK.game.onRoomReadyInfo[key] == true && key == GameData.player.uid)
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
        var playerNode = cc.find('panel/player_' + (index + 1), this.resultLayer);
        playerNode.active = true;
        var idNode = cc.find('panel/player_' + (index + 1) + '/headNode/playerID', this.resultLayer);
        var nameNode = cc.find('panel/player_' + (index + 1) + '/headNode/name', this.resultLayer);
        var headpicNode = cc.find('panel/player_' + (index + 1) + '/headNode/head', this.resultLayer);
        var identityNode = cc.find('panel/player_' + (index + 1) + '/headNode/identity_icon', this.resultLayer);

        this.showName(nameNode.getComponent(cc.Label), player.name);
        idNode.getComponent(cc.Label).string = 'ID:' + player.uid;
        if (player.uid == GameData.room.creator)
        {
            identityNode.active = true;
        }
        else
        {
            identityNode.active = false;
        }
        

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
        var residue = cc.find('panel/player_' + (index + 1) + '/residue/label', this.resultLayer);
        var boomNum = cc.find('panel/player_' + (index + 1) + '/boomNum/label', this.resultLayer);
        residue.getComponent(cc.Label).string = GameDataPDK.cards[player.uid]['handnum'] + '张';

        for (var key in GameDataPDK.resultData.boom)
        {
            if (player.uid == key)
            {
                boomNum.getComponent(cc.Label).string = GameDataPDK.resultData.boom[key];
                break;
            }
        }

    },
    showScore: function (index) {
        var uid = GameData.joiners[index].uid;
        var scoreNode = cc.find('panel/player_' + (index + 1) + '/field_num1', this.resultLayer);
        if(GameDataPDK.resultData.score){
            if (GameDataPDK.resultData.score[uid] > 0) {
                scoreNode.getComponent('cc.Label').font = this.fonts[0];
                scoreNode.getComponent('cc.Label').string = '+' + GameDataPDK.resultData.score[uid];
                //scoreNode.color = new cc.Color(255, 255, 0);
            } else if (GameDataPDK.resultData.score[uid] == 0) {
                scoreNode.getComponent('cc.Label').font = this.fonts[2];
                scoreNode.getComponent('cc.Label').string = '+' + GameDataPDK.resultData.score[uid];
            } else {
                scoreNode.getComponent('cc.Label').font = this.fonts[1];
                scoreNode.getComponent('cc.Label').string = GameDataPDK.resultData.score[uid];
            }
        }
    },
    
    showWinIcon: function (index) {
        var player = GameData.joiners[index];
        var node = cc.find('panel/player_' + (index + 1) + '/resultIcon', this.resultLayer);
        var iconUrl = '';
        if (player.uid == GameDataPDK.resultData.winner)
        {
            iconUrl = 'resources/pdk/sheng' + '.png';
        }
        else
        {
            for (var key in GameDataPDK.resultData.guanmen)
            {
                if (player.uid == key)
                {
                    iconUrl = 'resources/pdk/guanmen' + '.png';
                    break;
                }
            }
        }
        node.active = true;
        node.getComponent(cc.Sprite).spriteFrame = null;
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },
    showPoker: function (index) {
        var pokerNode = cc.find('panel/player_' + (index + 1) + '/cardsNoe', this.resultLayer);
        //隐藏poker节点
        for (var key in pokerNode.children) {
            pokerNode.children[key].active = false;
        }
        var uid = GameData.joiners[index].uid;
        var cards = GameDataPDK.getHandCards(uid);
        //cc.log('cards :'+cards);
        if (cards.length == undefined)
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
        var myScore = GameDataPDK.resultData.score[GameData.player.uid];
        var iconUrl = '';
        if (myScore > 0) {
            iconUrl = 'resources/ddz/UI/result/woyingle' + '.png';
        } else if (myScore < 0) {
            iconUrl = 'resources/ddz/UI/result/shibaile' + '.png';
        }
        else if (myScore == 0)
        {
            iconUrl = 'resources/pdk/pingjubiaoti' + '.png';
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
            PDKHandler.requestReady(function (res) {});
            this.resultLayer.active = false;
            GameDataPDK.game.zhuangUid = 0;
            sendEvent('pdk-onGameStart');
            sendEvent('initTableNode');
        } else {
            this.resultLayer.active = false;
            this.node.getComponent('PDK-roomMain').showSummaryLayer();
        }
        GameDataPDK.clearObject(GameDataPDK.kicking);
    },

    shareRet: function () {
        if (inCD(3000) == false) {
            screenShoot(wxShareTexture);
        }
    },
});