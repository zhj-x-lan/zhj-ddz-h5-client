var RuleHandler = require('ruleHandler');
var gameDefine = require('gameDefine');
var RoomHandler = require('roomHandler');

cc.Class({
    extends: cc.Component,

    properties: {
        resultLayer: cc.Node,

        winSprite: cc.Sprite,
        loseSprite: cc.Sprite,
        pingSprite: cc.Sprite,
        resultTitle: cc.Node,
        createtime: cc.Label,
        roomID: cc.Label,
        roundData: cc.Label,

        cardTemplate: cc.Prefab,
        cardHuier: cc.Prefab,
        playerTemplate: cc.Prefab,
        cardHuimage: cc.Prefab,
        isMark: 0,
        maskbg: cc.Node,
        shareBtn: cc.Button,
        readyBtn: cc.Button,
        font: {
            default: [],
            type: [cc.Font]
        }
    },

    onLoad: function () {
        //registEvent('onShowResult', this, this.onShow);
        //this.RuleHandler = new RuleHandler();
    },
    initResultData: function () {
        cc.log('initResultData');
        //新功能分享界面截图相关数据
        this.isHuType = false;
        //控件移动到指定的位置
        this.moveToPosY = -190;
        //恢复相关控件位置
        var player1 = cc.find("player1", this.resultLayer);
        var player2 = cc.find("player2", this.resultLayer);
        var player3 = cc.find("player3", this.resultLayer);
        var player4 = cc.find("player4", this.resultLayer);
        player1.y = 215;
        player2.y = 80;
        player3.y = -55;
        player4.y = -190;
        player1.setScale(1);
        player2.setScale(1);
        player3.setScale(1);
        player4.setScale(1);
        this.shareBtn.node.x = -213;
        this.shareBtn.node.y = -310;
        this.readyBtn.node.x = 227;
        this.readyBtn.node.y = -310;
        this.maskbg.active = false;
        this.resultTitle.active = true;

        this.juShuStr = cc.find("roomInfo/roundNum", this.resultLayer);
        this.resultTime = cc.find("roomInfo/resultTime", this.resultLayer);
        this.roomIdStr = cc.find("roomInfo/roomID", this.resultLayer);


        this.juShuStr.color = new cc.Color(0, 0, 0);
        this.resultTime.color = new cc.Color(0, 0, 0);
        this.roomIdStr.color = new cc.Color(0, 0, 0);
    },
    onDestroy: function () {
        //delete this.RuleHandler;
        //unregistEvent('onShowResult', this, this.onShow);
    },
    onShow: function () {
        this.initResultData();
        if (GameData.room.joinermax) {
            this.showResultIcon();
            for (var i = 0; i < GameData.room.joinermax; i++) {
                this.showCards(i);
                this.showPlayer(i);
                this.showScore(i);
                this.showDetail(i);
                this.showWinIcon(i);
            }
            for (var j = 0; j < GameData.room.joinermax; j++) {
                //this.showShare(j);
            }
            for (var k = GameData.room.joinermax; k < 4; k++) {
                var playerNode = cc.find('player' + (k + 1), this.resultLayer);
                playerNode.active = false;
            }
            this.showRoundInfo();
        }
    },
    showPlayer: function (index) {
        var player = GameData.joiners[index];
        var idNode = cc.find('player' + (index + 1) + '/head/id', this.resultLayer);
        var nameNode = cc.find('player' + (index + 1) + '/head/name', this.resultLayer);
        var headpicNode = cc.find('player' + (index + 1) + '/head/headpic', this.resultLayer);
        var zhuangNode = cc.find('player' + (index + 1) + '/head/zhuang', this.resultLayer);
        var creator = cc.find('player' + (index + 1) + '/head/creator', this.resultLayer)
        var player_name = player.name.substring(0, 4) + '...'

        nameNode.getComponent(cc.Label).string = player_name;
        idNode.getComponent(cc.Label).string = player.uid;

        zhuangNode.active = player.uid == GameData.game.zhuangUid;

        creator.active = player.uid == GameData.room.creator;
        if (player.headimgurl == undefined || player.headimgurl == '') {
            return;
        }

        cc.loader.load({
            url: player.headimgurl,
            type: 'png'
        }, function (error, texture) {
            if (!error && texture) {
                headpicNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },
    setMyHuierVisible: function (cardNode, cardId, direction) {
        var show = false;
        if (RuleHandler.instance.isHuier(cardId)) {
            show = true;
        }

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
                // if(GameData.client.gameType == GameType.Game_Mj_Tianjin){
                //     var texture = cc.textureCache.addImage(cc.url.raw("resources/table/huier_icon.png"));
                //     var headerNodeIcon = cc.find('huier_icon',huierNode)
                //     headerNodeIcon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                // }          
            }
        } else {
            huierNode.active = show;
        }
    },
    setMyHuimageVisible: function (cardNode, cardId, isHu) {
        var orCard = GameData.game.winnerObtain;

        var show = false;
        if (isHu == false) {
            show = false;
        } else {
            if (orCard == cardId && this.isMark == 0) {
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
    showDetail: function (index) {
        var player = GameData.joiners[index];
        var termNode = cc.find('player' + (index + 1) + '/term', this.resultLayer);
        var label = termNode.getComponent('cc.Label');

        var myScore = GameData.scores[GameData.player.uid];
        var handcard = GameData.getHandCards(player.uid);
        termNode.parent.active = true;

        var resultItems = RuleHandler.instance.getHuTypeString();
        console.log('resultItems = ' + JSON.stringify(resultItems));
        if (GameData.game.winnerUid == player.uid) {
            label.string = resultItems[0];
        } else {
            label.string = '';
        }

        if (GameData.game.zhuangUid == player.uid) {
            if (resultItems[1] == true) {
                label.string += '铲牌 -2  ';
            }
        } else {
            label.string += '';
        }

        if (GameData.room.opts.times) {
            if (GameData.room.opts.times == 1) label.string += '底分 *1  ';
            else if (GameData.room.opts.times == 2) label.string += '底分 *2  ';
            else if (GameData.room.opts.times == 5) label.string += '底分 *5  ';
        }

        var gangs = GameData.getGangCards(player.uid);
        var index1 = 0,
            index2 = 0;
        for (var i = 0; i < gangs.length; i++) {
            if (RuleHandler.instance.isHuier(gangs[i][0])) {
                label.string += '金杠 ' + '+' + GameData.room.opts.jingang + '  ';
                // if(player.uid == GameData.player.uid){
                //    this.isHuType = true; 
                // }

            } else if (gangs[i].length == 4) index1++;
            else if (gangs[i].length == 5) index2++;
        }
        if (index1 == 0) {} else {
            label.string += '明杠 +1*' + index1 + '  ';
        };
        if (index2 == 0) {} else {
            label.string += '暗杠 +2*' + index2 + '  ';
        };
        if ((index1 > 0 || index2 > 0) && GameData.room.opts.doubleGang == true && GameData.game.zhuangNum[GameData.game.zhuangUid] > 0) {
            label.string += '杠翻番  ';
        }

        if (GameData.game.zhuangUid == player.uid && GameData.game.zhuangNum[player.uid] > 0) {
            var zhuangNum = GameData.game.zhuangNum[player.uid];
            var score = zhuangNum * 2;
            label.string += '坐' + zhuangNum + '庄 *' + score;
        } else if (GameData.game.zhuangUid != player.uid && GameData.game.zhuangNum[player.uid] > 0) {
            var zhuangNum = GameData.game.zhuangNum[player.uid];
            var score = zhuangNum * 2;
            label.string += '拉' + zhuangNum + '庄 *' + score;
        }
        if (GameData.game.winnerUid == GameData.player.uid) {
            if ((RuleHandler.instance.getHuTypeArry(5) && RuleHandler.instance.getHuTypeArry(7)) ||
                (RuleHandler.instance.getHuTypeArry(5) && RuleHandler.instance.getHuTypeArry(6) && RuleHandler.instance.getHuTypeArry(10)) ||
                RuleHandler.instance.getHuTypeArry(5) && RuleHandler.instance.getHuTypeArry(10)) {
                this.isHuType = true;
            }
        }

    },
    showShare: function (index) {
        if (this.isHuType && GameData.room.opts.joinermax == 4) {
            // cc.log('this.isHuType '+this.isHuType);
            // cc.log(GameData.room.joinermax);
            this.maskbg.active = true;
            for (var i = 0; i < GameData.room.joinermax; i++) {
                var player = GameData.joiners[i];
                var termNode = cc.find('player' + (i + 1) + '/term', this.resultLayer);
                // cc.log('maskbg ');
                // this.maskbg.active = (index == i);
                if (GameData.player.uid == player.uid) {
                    // cc.log('maskbg11 ');
                    termNode.parent.active = true;
                } else {
                    termNode.parent.active = false;
                }
                termNode.parent.y = -215;
                termNode.parent.x = 41;
                termNode.parent.setScale(0.80);
            }
            cc.log('winSpritebg ');
            this.shareBtn.node.x = -408;
            this.shareBtn.node.y = -324;
            this.readyBtn.node.x = 425;
            this.readyBtn.node.y = -324;
            this.winSprite.node.active = false;
            this.loseSprite.node.active = false;
            this.pingSprite.node.active = false;
            this.resultTitle.active = false;
            this.isHuType = false;

            this.juShuStr.color = new cc.Color(125, 133, 133);
            this.resultTime.color = new cc.Color(125, 133, 133);
            this.roomIdStr.color = new cc.Color(125, 133, 133);
        }
    },
    showCardContent: function (cardNode, cardHeader, cardId) {
        var card = cardNode.getComponent('Card');
        if (card != null) {
            card.id = cardId;
        }
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/mjcard2d/' + cardHeader + '_' + cardId + '.png';
        // cc.log('load Card URL :' + iconUrl)
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        this.setMaskVisible(cardNode, false);
    },

    showRoundInfo: function () {
        this.roomID.string = "房号：" + GameData.room.id;

        var time = getTimeStr(GameData.room.createtime);

        this.createtime.string = time[0] + '/' + time[1] + '/' + time[2] + '  ' + time[3] + ':' + time[4] + ':' + time[5];
        var showRoundNum = GameData.game.roundCount;
        this.roundData.string = "第" + showRoundNum + "局";
    },

    setMaskVisible: function (cardNode, show) {
        //cc.log('showMaskVisible - > show ' + show);
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

    showPengCards: function (player, parent, cardHeader, direction) {
        if (player) {

            var gang = GameData.getGangCards(player.uid);
            var peng = GameData.getPengCards(player.uid);
            var cards = gang.concat(peng);
            //var cards = gang.concat(peng, chi);
            var size = parseInt(GameData.client.handsize / 3);

            for (var i = 0; i < size; i++) {
                var node = cc.find('cardPeng/cardPeng' + (i + 1), parent);
                if (i < cards.length) { //console.log('i < cards.length'+i,cards.length);
                    for (var n = 0; n < 4; n++) {
                        var face = node.getChildByName('card_face' + (n + 1)).getComponent("cc.Sprite");
                        //var word = node.getChildByName('card_word'+(n+1)).getComponent("cc.Sprite");
                        if (n < cards[i].length) {
                            face.node.active = true;
                            var cardId = cards[i][n];
                            this.showCardContent(face.node, cardHeader, cardId);
                            if (n == 3 && RuleHandler.instance.isHuier(cardId) == true) {
                                this.addHuierIcon(face.node, direction);
                            }
                        } else {
                            face.node.active = false;
                        }
                    }
                    if (cards[i].length == 5) { //暗杠
                        var face = node.getChildByName('card_face4').getComponent("cc.Sprite");
                        //var word = node.getChildByName('card_word4').getComponent("cc.Sprite");
                        var back = node.getChildByName('card_back4').getComponent("cc.Sprite");
                        //word.node.active = false;
                        face.node.active = false;
                        back.node.active = true;
                    } else {
                        var back = node.getChildByName('card_back4').getComponent("cc.Sprite");
                        back.node.active = false;
                    }
                    node.active = true;
                } else {
                    node.active = false;
                }
            }
        }
    },

    addHuierIcon: function (parent, direction) {
        if (parent.childrenCount <= 0) {
            var huierIconNode = new cc.Node();
            parent.addChild(huierIconNode);
            var textureUrl = '';
            if (GameData.client.gameType == gameDefine.GameType.Game_Mj_Tianjin) {
                textureUrl = cc.url.raw('resources/table/huier_icon.png');
            }
            var huierIconTx = cc.textureCache.addImage(textureUrl);
            var huierIconSprite = huierIconNode.addComponent(cc.Sprite);
            huierIconSprite.spriteFrame = new cc.SpriteFrame(huierIconTx);

            if (direction == 'right') {
                huierIconNode.x = -32.6;
                huierIconNode.y = 7.1;
                huierIconNode.rotation = -101.2;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.4;
                huierIconNode.skewX = 11;
            } else if (direction == 'down') {
                huierIconNode.x = 0;
                huierIconNode.y = 60;
                huierIconNode.skewX = 10;
            } else if (direction == 'left') {
                huierIconNode.x = 31;
                huierIconNode.y = 8.6;
                huierIconNode.rotation = 101.2;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.4;
                huierIconNode.skewX = -11;
            } else if (direction == 'up') {
                huierIconNode.x = 3;
                huierIconNode.y = -6.8;
                huierIconNode.rotation = 180;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.3;
            }
        }
    },

    showCards: function (index) {
        var player = GameData.joiners[index];
        var playerNode = cc.find('player' + (index + 1), this.resultLayer);
        var parent = cc.find('cards', playerNode);

        var hu = (player.uid == GameData.game.winnerUid);
        var totalSize = GameData.client.handsize + 1;
        var cardHand = GameData.getHandCards(player.uid);
        var nodeIdx = GameData.getHandCardNum(player.uid);
        nodeIdx = (nodeIdx % 3 == 1) ? nodeIdx + 1 : nodeIdx;
        var nodeIdx2 = nodeIdx;

        if (hu) this.isMark = 0;
        for (var card in cardHand) {
            for (var i = 0; i < cardHand[card]; i++) {
                var node = cc.find('cardHand/cardHand' + nodeIdx, parent);
                cc.log('result showCards:' + nodeIdx + ' ' + card);
                this.showCardContent(node, 'mj_face_xia_shou', card);
                this.setMyHuierVisible(node, card, 'down');
                this.setMyHuimageVisible(node, card, hu);
                node.active = true;
                nodeIdx--;
            }
        }
        for (var i = nodeIdx; i >= 1; i--) {
            var node = cc.find('cardHand/cardHand' + i, parent);
            node.active = false;
        }
        for (var i = nodeIdx2 + 1; i <= totalSize; i++) {
            var node = cc.find('cardHand/cardHand' + i, parent);
            node.active = false;
        }

        this.showPengCards(player, parent, 'mj_face_xia_chu', 'down');
        playerNode.active = true;
    },

    showScore: function (index) {
        var uid = GameData.joiners[index].uid;
        var scoreNode = cc.find('player' + (index + 1) + '/score', this.resultLayer);

        var score = 0;
        //判断是金币场
        if(gameDefine.currencyType.Currency_Coin == GameData.room.opts.currencyType){
            var coinData = RoomHandler.getCoinData();
            if(coinData && coinData.coin && coinData.coin[uid]){
                score = coinData.coin[uid];
            }
        } else {
            score = GameData.scores[uid];
        }
        score == undefined ? score = 0 : null;
        if (score > 0) {
            scoreNode.getComponent('cc.Label').font = this.font[0];
            scoreNode.getComponent('cc.Label').string = '+' + score;
        } else if (score < 0) {
            scoreNode.getComponent('cc.Label').font = this.font[1];
            scoreNode.getComponent('cc.Label').string = score;
        } else if (score == 0) {
            scoreNode.getComponent('cc.Label').font = this.font[2];
            scoreNode.getComponent('cc.Label').string = score;
        }
    },

    showWinIcon: function (index, parent) {
        var uid = GameData.joiners[index].uid;
        var parent = cc.find('player' + (index + 1), this.resultLayer);
        var node = cc.find('huIcon', parent);
        node.active = (uid == GameData.game.winnerUid);
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
            myScore = GameData.scores[GameData.player.uid];
        }
        myScore == undefined ? myScore = 0 : null;
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

    setReady: function () {
        //cc.log("GameData.game.roundNum:"+GameData.game.roundNum+"  "+"GameData.game.roundmax:"+GameData.game.roundmax);
        if (!GameData.room.close) {
            MjHandler.getInstance().requestReady(function (res) {});
            //this.resultLayer.active = false;
            sendEvent('onGameStart');
        } else {
            this.resultLayer.active = false;
            this.node.getComponent('roomMain').showSummaryLayer();
        }
    },

    shareRet: function () {
        if (inCD(3000) == false) {
            // if(this.maskNode.active){
            //     this.shareBtn.node.active = false;
            //     this.readyBtn.node.active = false; 
            //     //延迟截图
            //     this.scheduleOnce(function(){  
            //      screenShoot(wxShareTexture);  
            //      },0.2);
            // }else{
            //     screenShoot(wxShareTexture);
            // }  
            screenShoot(wxShareTexture);
        }
    }
});