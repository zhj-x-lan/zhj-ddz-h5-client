var RuleHandler = require('ruleHandler');
var RoomHandler = require('roomHandler');

cc.Class({
    extends: cc.Component,

    properties: {
        resultLayer: cc.Node,
        playerItem: cc.Node,

        winSprite: cc.Sprite,
        loseSprite: cc.Sprite,
        pingSprite: cc.Sprite,

        createTime: cc.Label,
        roomID: cc.Label,
        roundNumber: cc.Label,

        cardTemplate: cc.Prefab,
        cardHuier: cc.Prefab,
        playerTemplate: cc.Prefab,
        cardHuimage: cc.Prefab,

        shareBtn: cc.Button,
        readyBtn: cc.Button,

        font: {
            default: [],
            type: [cc.Font]
        },

        _curGameData: undefined
    },

    onLoad: function () {
        this.isMark = 0;
    },
    onDestroy: function () {
    },

    initResultData: function () {
        cc.log('initResultData');
        //新功能分享界面截图相关数据
        this.isHuType = false;
    },
    onShow: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        this.initResultData();

        if (roomData.opts.joinermax) {
            this.showResultIcon();

            for (var i = 0; i < roomData.opts.joinermax; i++) {
                this.showPlayer(i);
                this.showCards(i);
                this.showScore(i);
                this.showDetail(i);
                this.showWinIcon(i);
            }
            this.showRoundInfo();
        }
    },
    showPlayer: function (index) {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        var curGameData = this._curGameData;
        if(curGameData == undefined){
            return;
        }
        var gameInfoData = curGameData.getGameInfoData();
        if(gameInfoData == undefined){
            return;
        }

        var playerNode = cc.find('player'+(index +1), this.resultLayer);
        if(playerNode == undefined){
            playerNode = cc.instantiate(this.playerItem);
            playerNode.parent = this.resultLayer;
            playerNode.name = 'player'+(index +1);
            playerNode.x = this.playerItem.x;
            playerNode.y = this.playerItem.y - index*this.playerItem.height;
        }

        var idNode = cc.find('/head/id', playerNode);
        var nameNode = cc.find('/head/name', playerNode);
        var headpicNode = cc.find('/head/headpic', playerNode);
        var zhuangNode = cc.find('/head/zhuang', playerNode);
        var creator = cc.find('/head/creator', playerNode);

        var player = GameData.joiners[index];
        var name = player.name.substring(0, 6) + '...';

        nameNode.getComponent(cc.Label).string = name;
        idNode.getComponent(cc.Label).string = player.uid;

        zhuangNode.active = player.uid == gameInfoData.zhuangUid;
        creator.active = player.uid == roomData.creator;

        var iconSprite = headpicNode.getComponent(cc.Sprite);
        this.setIcon(iconSprite, player.headimgurl);
    },
    showCards: function (index) {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        var curGameData = this._curGameData;
        if(curGameData == undefined){
            return;
        }
        var gameInfoData = curGameData.getGameInfoData();
        if(gameInfoData == undefined){
            return;
        }
        var player = GameData.joiners[index];
        var hu = player.uid == gameInfoData.winnerUid ? true : false;
        if (hu) {
            this.isMark = 0;
        }
        var playerNode = cc.find('player'+ (index +1), this.resultLayer);
        if(playerNode == undefined){
            return;
        }
        var parent = cc.find('cards', playerNode);
        var handNode = cc.find('cardHand', parent);

        for(var ii = 0;ii < handNode.getChildrenCount();ii++){
            var child = handNode.getChildren()[ii];
            if(child){
                child.active = false;
            }
        }

        var cardHand = curGameData.getHandCards(player.uid);
        if(cardHand == undefined){
            return;
        }
        var handNumber = cardHand.length;
        var index1 = 1;
        var nodeIndex = 1;

        var show;
        for(var i = handNumber;i >= 0;i--){
            var cardId = cardHand[i];
            if(cardId == undefined || cardId <= 0){
                continue;
            }
            if (RuleHandler.instance.isHuier(cardId)){
                show = true;
                nodeIndex = handNumber;
                handNumber--;
            } else {
                show = false;
                nodeIndex = index1;
                index1++;
            }
            var node = cc.find('cardHand' +nodeIndex, handNode);
            if(node){
                node.active = true;

                this.showCardContent(node, 'mj_face_xia_shou', cardId);
                this.setMyHuierVisible(node, cardId, 'down', show);
                this.setMyHuimageVisible(node, cardId, hu);
            }
        }
        this.showPengCards(player, parent, 'mj_face_xia_chu');
    },
    showScore: function (index) {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        var curGameData = this._curGameData;
        if(curGameData == undefined){
            return;
        }
        var scoreData = curGameData.getGameScoreData();
        if(scoreData == undefined){
            return;
        }
        var playerNode = cc.find('player'+ (index +1), this.resultLayer);
        if(playerNode == undefined){
            return;
        }
        var uid = GameData.joiners[index].uid;
        var scoreNode = cc.find('score', playerNode);
        if (scoreData[uid] > 0) {
            scoreNode.getComponent('cc.Label').font = this.font[0];
            scoreNode.getComponent('cc.Label').string = '+' + scoreData[uid];
        } else if (scoreData[uid] < 0) {
            scoreNode.getComponent('cc.Label').font = this.font[1];
            scoreNode.getComponent('cc.Label').string = scoreData[uid];
        } else if (scoreData[uid] == 0) {
            scoreNode.getComponent('cc.Label').font = this.font[2];
            scoreNode.getComponent('cc.Label').string = scoreData[uid];
        }
    },
    showDetail: function (index) {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        var curGameData = this._curGameData;
        if(curGameData == undefined){
            return;
        }
        var gameInfoData = curGameData.getGameInfoData();
        if(gameInfoData == undefined){
            return;
        }
        var playerNode = cc.find('player'+ (index +1), this.resultLayer);
        if(playerNode == undefined){
            return;
        }

        var player = GameData.joiners[index];
        var termNode = cc.find('term', playerNode);
        var label = termNode.getComponent(cc.Label);

    },
    setIcon: function(sprite,imgurl){
        if(sprite == undefined || imgurl == undefined || imgurl.length <= 0){
            return;
        }
        cc.loader.load({url: imgurl, type: 'png'}, function (error, texture) {
            if (!error && texture) {
                sprite.spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },
    setMyHuierVisible: function (cardNode, cardId, direction, show) {
        var huierNode = cardNode.getChildByName(cardNode.name + '_huier');
        if (huierNode == null) {
            if (show == true) {
                huierNode = cc.instantiate(this.cardHuier);
                huierNode.y = huierNode.y - 18;
                cardNode.addChild(huierNode);
                huierNode.name = cardNode.name + '_huier';

                cc.find('up', huierNode).active = false;
                cc.find('down', huierNode).active = false;
                cc.find('right', huierNode).active = false;
                cc.find('left', huierNode).active = false;

                cc.find(direction, huierNode).active = true;
            }
        } else {
            huierNode.active = show;
        }
    },
    setMyHuimageVisible: function (cardNode, cardId, isHu) {
        var show = false;
        if (isHu == false) {
            show = false;
        } else {
            if (this.isMark == 0) {
                show = true;
            }
        }

        var huimageNode = cardNode.getChildByName(cardNode.name + '_hu');
        if (huimageNode == null) {
            if (show == true) {
                huimageNode = cc.instantiate(this.cardHuimage);
                huimageNode.y = huimageNode.y - 20;
                cardNode.addChild(huimageNode);
                huimageNode.name = cardNode.name + '_hu';
            }
        } else {
            huimageNode.active = show;
        }

        if (show == true) {
            this.isMark = 1;
        }
    },
    showCardContent: function (cardNode, cardHeader, cardId) {
        var card = cardNode.getComponent('Card');
        if (card != null) {
            card.id = cardId;
        }
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/mjcard2d/' + cardHeader + '_' + cardId + '.png';
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        this.setMaskVisible(cardNode, false);
    },

    setMaskVisible: function (cardNode, show) {
        var maskNode = cardNode.getChildByName(cardNode.name + '_mask');
        if (maskNode == null) {
            if (show == true) {
                maskNode = cc.instantiate(this.cardMaskPrefab);
                cardNode.addChild(maskNode);
                maskNode.name = cardNode.name + '_mask';
            }
        } else {
            maskNode.active = show;
        }

        return maskNode;
    },

    showPengCards: function (player, parent, cardHeader) {
        var roomData = RoomHandler.getRoomData();
        if (roomData == undefined){
            return;
        }
        var curGameData = this._curGameData;
        if(curGameData == undefined){
            return;
        }
        if(parent == undefined
            || player == undefined
            || Object.keys(player).length <= 0){
            return;
        }

        var pengNode = cc.find('cardPeng', parent);
        for (var ii = 0; ii < pengNode.getChildrenCount(); ii++) {
            var child = pengNode.getChildren()[ii];
            if (child) {
                child.active = false;
            }
        }

        var chi = curGameData.getChiCards(player.uid);
        var peng = curGameData.getPengCards(player.uid);
        var gang = curGameData.getGangCards(player.uid);

        if (chi == undefined || gang == undefined || peng == undefined) {
            return;
        }
        var cards = peng.concat(chi);
        var size = parseInt(GameData.client.handsize / 3);

        var index, node, n, face, back, cardsObject, cardsArray, cardId;
        //吃、碰刷新
        for (index = 0; index < cards.length; index++) {
            if (index >= size) {
                break;
            }
            node = cc.find('cardPeng'+ (index +1), pengNode);
            if (node) {
                for (n = 0; n < 4; n++) {
                    face = node.getChildByName('card_face' + (n + 1)).getComponent(cc.Sprite);
                    cardsObject = cards[index];
                    if (cardsObject == undefined) {
                        break;
                    }
                    cardsArray = cardsObject.cards;
                    if (cardsArray == undefined || cardsArray.length <= 0) {
                        break;
                    }
                    if (cardsArray.length >= 1) {
                        cardsArray.sort(function (a, b) {
                            return a - b;
                        });
                    }
                    if (n < cardsArray.length) {
                        face.node.active = true;

                        if (n == 3) {
                            back = node.getChildByName('card_back4').getComponent("cc.Sprite");
                            back.node.active = false;
                        }
                        cardId = cardsArray[n];
                        this.showCardContent(face.node, cardHeader, cardId);
                    } else {
                        face.node.active = false;
                    }
                }
                node.active = true;
            }
        }
        //杠刷新
        for (; index < gang.length; index++) {
            if (index >= size) {
                break;
            }
            node = cc.find('cardPeng' + (index + 1), pengNode);
            if (node) {
                for (n = 0; n < 4; n++) {
                    face = node.getChildByName('card_face'+ (n +1)).getComponent(cc.Sprite);
                    cardsObject = gang[index];
                    if (cardsObject == undefined) {
                        break;
                    }
                    cardsArray = cardsObject.cards;
                    if (cardsArray == undefined || cardsArray.length <= 0) {
                        break;
                    }
                    if (n < cardsArray.length) {
                        face.node.active = true;
                        if (n == 3) {
                            back = node.getChildByName('card_back4').getComponent(cc.Sprite);
                            //判断是不是暗杠
                            if (cardsObject.type == GangType.Gang_An) {
                                face.node.active = false;
                                back.node.active = true;
                            } else {
                                back.node.active = false;
                            }
                        }
                        cardId = cardsArray[n];
                        this.showCardContent(face.node, cardHeader, cardId);
                    } else {
                        face.node.active = false;
                    }
                }
                node.active = true;
            }
        }
    },
    showWinIcon: function (index) {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        var curGameData = this._curGameData;
        if(curGameData == undefined){
            return;
        }
        var gameInfoData = curGameData.getGameInfoData();
        if(gameInfoData == undefined){
            return;
        }
        var playerNode = cc.find('player'+ (index +1), this.resultLayer);
        if(playerNode == undefined){
            return;
        }
        var uid = GameData.joiners[index].uid;
        var node = cc.find('huIcon', playerNode);

        node.active = uid == gameInfoData.winnerUid ? true : false;
    },
    showResultIcon: function () {
        var curGameData = this._curGameData;
        if(curGameData == undefined){
            return;
        }
        var scoreData = curGameData.getGameScoreData();
        if(scoreData == undefined
        || Object.keys(scoreData).length <= 0)
        {
            return;
        }
        var myScore = scoreData[GameData.player.uid];
        if (myScore > 0) {
            this.winSprite.node.active = true;
            this.loseSprite.node.active = false;
            this.pingSprite.node.active = false;
        } else if (myScore < 0) {
            this.winSprite.node.active = false;
            this.loseSprite.node.active = true;
            this.pingSprite.node.active = false;
        } else {
            this.winSprite.node.active = false;
            this.loseSprite.node.active = false;
            this.pingSprite.node.active = true;
        }
    },
    showRoundInfo: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        var curGameData = this._curGameData;
        if(curGameData == undefined){
            return;
        }
        var gameInfoData = curGameData.getGameInfoData();
        if(gameInfoData == undefined){
            return;
        }
        this.roomID.string = "房号：" + roomData.id;

        var time = getTimeStr(roomData.createtime);
        this.createTime.string = time[0] + '/' + time[1] + '/' + time[2] + '  ' + time[3] + ':' + time[4] + ':' + time[5];

        var showRoundNum = gameInfoData.roundNum;
        this.roundNumber.string = "第" + showRoundNum + "局";
    },
    setReady: function () {
        if (!GameData.room.close) {
            MjHandler.getInstance().requestReady(function (res) {});
            sendEvent('onGameStart');
        } else {
            this.resultLayer.active = false;
            sendEvent('showSummary');
        }
    },
    shareRet: function () {
        if (inCD(3000)) return;
        screenShoot(wxShareTexture);
    }
});