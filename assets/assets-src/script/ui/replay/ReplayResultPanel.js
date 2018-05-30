cc.Class({
    extends: cc.Component,

    properties: {
        cardTemplate: cc.Prefab,
        cardHuier: cc.Prefab,
        cardHuImage: cc.Prefab,

        winNode: cc.Node,
        lostNode: cc.Node,
        pingNode: cc.Node,

        roomID: cc.Label,
        createtime: cc.Label,
        roundData: cc.Label,

        isMark: 0,
        font: {
            default: [],
            type: [cc.Font]
        },
    },

    // use this for initialization
    onLoad: function () {
        this.pengCard = {};
        this.gangCard = {};
        this.onShow();
    },

    onClose: function (evt) {
        ReplayDataCenter.openReplayPanel = true;
        cc.director.getScheduler().setTimeScale(1);
        cc.director.loadScene('home');
    },

    onShow: function () {
        for (var i = 0; i < Object.keys(ReplayData.players).length; i++) {
            this.showCards(i);
            this.showPlayer(i);
            this.showScore(i);
            this.showDetail(i);
            if (ReplayData.zimo) {
                this.showWinIcon(i);
            }
        }
        for (var i = Object.keys(ReplayData.players).length; i < 4; i++) {
            var playerNode = cc.find('player' + (i + 1), this.node);
            playerNode.active = false;
        }
        this.showRoundInfo();
        this.showResultIcon();
    },

    showWinIcon: function (index) {
        var uid = ReplayData.players[index].uid;
        var parent = cc.find('player' + (index + 1), this.node);
        var node = cc.find('huIcon', parent);
        node.active = (uid == ReplayData.zimo.winner);
    },

    showResultIcon: function () {
        var Uid;
        if (otherReplay[0] == true) {
            for (var key in ReplayRoomData.players) {
                if (key) {
                    Uid = ReplayRoomData.players[key].uid;
                    break;
                }
            }
        }else{
            Uid = GameData.player.uid;
        }
        var myScore = ReplayData.scores[Uid];
        if (myScore > 0) {
            this.winNode.active = true;
            this.lostNode.active = false;
            this.pingNode.active = false;
        } else if (myScore < 0) {
            this.winNode.active = false;
            this.lostNode.active = true;
            this.pingNode.active = false;
        } else {
            this.winNode.active = false;
            this.lostNode.active = false;
            this.pingNode.active = true;
        }
    },

    showRoundInfo: function () {
        this.roomID.string = "房号：" + ReplayData.room;

        var time = getTimeStr(ReplayRoomData.createtime);
        this.createtime.string = time[0] + '/' + time[1] + '/' + time[2] + '  ' + time[3] + ':' + time[4] + ':' + time[5];

        var showRoundNum = 0;
        for (var i = 0; i < ReplayRoomData.games.length; i++) {
            if (ReplayData.id == ReplayRoomData.games[i].id) {
                showRoundNum = i + 1;
            }
        }
        this.roundData.string = "第" + showRoundNum + "局";
    },

    showDetail: function (index) {
        var player = ReplayData.players[index];
        var termNode = cc.find('player' + (index + 1) + '/term', this.node);
        var label = termNode.getComponent('cc.Label');
        var huTypeStr = [];
        if (ReplayData.zimo && ReplayData.zimo.winner == player.uid) {
            var huType = ReplayData.zimo.type;
            huTypeStr = ReplayDataCenter.replayResultDetail(huType);
            label.string = huTypeStr[0];
        } else {
            label.string = '';
        }
        console.log('huTypeStr = ' + JSON.stringify(huTypeStr));
        if (ReplayData.opts.zhuang == player.uid) {
            if (huTypeStr[1] == true) {
                label.string += '铲牌 -2   ';
            }
        } else {
            label.string += '';
        }
        if (ReplayRoomData.opts.times) {
            if (ReplayRoomData.opts.times == 1) label.string += '底分 *1   ';
            else if (ReplayRoomData.opts.times == 2) label.string += '底分 *2   ';
            else if (ReplayRoomData.opts.times == 5) label.string += '底分 *5   ';
        }

        var index1 = 0,
            index2 = 0;
        for (var i = 0; i < this.gangCard.length; i++) {
            if (ReplayDataCenter.isHuier(this.gangCard[i][0])) {
                label.string += '金杠 ' + '+' + ReplayRoomData.opts.jingang + '   ';
            } else if (this.gangCard[i].length == 4) index1++;
            else if (this.gangCard[i].length == 5) index2++;
        }
        if (index1 == 0) {} else {
            label.string += '明杠 +1*' + index1 + '  ';
        };
        if (index2 == 0) {} else {
            label.string += '暗杠 +2*' + index2 + '  ';
        };
        if ((index1 > 0 || index2 > 0) && ReplayRoomData.opts.doubleGang == true && ReplayData.opts.zhuangnum[ReplayData.opts.zhuang] > 0) {
            label.string += '杠翻番  ';
        }

        if (ReplayData.opts.zhuang == player.uid && ReplayData.opts.zhuangnum[player.uid] > 0) {
            var zhuangNum = ReplayData.opts.zhuangnum[player.uid];
            var score = zhuangNum * 2;
            label.string += '坐' + zhuangNum + '庄 *' + score;
        } else if (ReplayData.opts.zhuang != player.uid && ReplayData.opts.zhuangnum[player.uid] > 0) {
            var zhuangNum = ReplayData.opts.zhuangnum[player.uid];
            var score = zhuangNum * 2;
            label.string += '拉' + zhuangNum + '庄 *' + score;
        }
    },

    showPlayer: function (index) {
        var player = ReplayData.players[index];
        var idNode = cc.find('player' + (index + 1) + '/head/id', this.node);
        var nameNode = cc.find('player' + (index + 1) + '/head/name', this.node);
        var headpicNode = cc.find('player' + (index + 1) + '/head/headpic', this.node);
        var zhuangNode = cc.find('player' + (index + 1) + '/head/zhuang', this.node);
        var creator = cc.find('player' + (index + 1) + '/head/creator', this.node);
        var player_name = player.name.substring(0, 4) + '...'

        nameNode.getComponent(cc.Label).string = player_name;
        idNode.getComponent(cc.Label).string = player.uid;

        zhuangNode.active = player.uid == ReplayData.opts.zhuang;

        creator.active = player.uid == ReplayRoomData.creator;

        if (player.headimgurl == undefined || player.headimgurl == '' || player.headimgurl.length <= 0) {
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

    showCards: function (index) {
        var player = ReplayData.players[index];
        var playerNode = cc.find('player' + (index + 1), this.node);
        var parent = cc.find('cards', playerNode);
        var uid = player.uid;
        var hu = false;
        if (ReplayData.zimo) {
            hu = (uid == ReplayData.zimo.winner);
        }
        if (hu) this.isMark = 0;
        var playCard;
        for (var i = 0; i < ReplayDataCenter.resultCard.length; i++) {
            var cards = ReplayDataCenter.resultCard[i];
            if (cards.uid == uid) {
                playCard = cards;
                break;
            }
        }
        //碰杠
        this.pengCard = playCard.peng;
        this.gangCard = playCard.gang;
        this.showPengCards(player, parent, 'mj_face_xia_chu', 'down');
        //手牌
        var cardHand = playCard.hand;
        var handNode = cc.find('cardHand', parent);
        for (var i = 0; i < cardHand.length; i++) {
            var card = cardHand[i];
            var cardNode = cc.instantiate(this.cardTemplate);
            cardNode.getComponent('cardTemplate').setId(card);
            cardNode.getComponent('cardTemplate').enableButton(false);
            var icon = 'mj_face_xia_shou_' + card + '.png';
            cardNode.getComponent('cardTemplate').setIcon('resources/mjcard2d/' + icon);
            cardNode.x = i * 85;
            this.setMyHuierVisible(cardNode, card);
            if (ReplayData.zimo) {
                this.setMyHuImageVisible(cardNode, card, hu);
            }
            handNode.addChild(cardNode);
        }
        var childNum = 0;
        var pengNode = cc.find('cardPeng', parent);
        var child = pengNode.children;
        for (var i = 0; i < child.length; i++) {
            if (child[i].active) {
                childNum++;
            }
        }
        handNode.x = -532 + childNum * 230;
        playerNode.active = true;
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
    },

    setMyHuierVisible: function (cardNode, cardId) {
        var show = false;
        if (ReplayDataCenter.isHuier(cardId)) {
            show = true;
        }

        var huierNode = cardNode.getChildByName(cardNode.name + '_huier');
        if (huierNode == null) {
            if (show == true) {
                huierNode = cc.instantiate(this.cardHuier);
                huierNode.y = huierNode.y - 18;
                cc.find('up', huierNode).active = false;
                cc.find('down', huierNode).active = false;
                cc.find('right', huierNode).active = false;
                cc.find('left', huierNode).active = false;

                cc.find('down', huierNode).active = true;
                cardNode.addChild(huierNode);
                huierNode.name = cardNode.name + '_huier';
            }
        } else {
            huierNode.active = show;
        }
    },
    setMyHuImageVisible: function (cardNode, cardId, isHu) {
        var orCard = ReplayData.zimo.obtain;

        var show = false;
        if (isHu == false) {
            show = false;
        } else {
            if (orCard == cardId && this.isMark == 0) {
                show = true;
            }
        }


        var huImageNode = cardNode.getChildByName(cardNode.name + '_hu');
        if (huImageNode == null) {
            if (show == true) {
                huImageNode = cc.instantiate(this.cardHuImage);
                huImageNode.y = huImageNode.y - 20;
                cardNode.addChild(huImageNode);
                huImageNode.name = cardNode.name + '_hu';
            }
        } else {
            huImageNode.active = show;
        }

        if (show == true) {
            this.isMark = 1;
        }
    },

    showPengCards: function (player, parent, cardHeader, direction) {
        if (player) {
            var cards = this.gangCard.concat(this.pengCard);
            var size = parseInt(13 / 3);

            for (var i = 0; i < size; i++) {
                var node = cc.find('cardPeng/cardPeng' + (i + 1), parent);
                if (i < cards.length) {
                    for (var n = 0; n < 4; n++) {
                        var face = node.getChildByName('card_face' + (n + 1)).getComponent("cc.Sprite");
                        if (n < cards[i].length) {
                            face.node.active = true;
                            var cardId = cards[i][n];
                            this.showCardContent(face.node, cardHeader, cardId);
                            // if(n == 3 && ReplayDataCenter.isHuier(cardId) == true)
                            // {
                            //     this.addHuierIcon(face.node,direction);
                            // }
                        } else {
                            face.node.active = false;
                        }
                    }
                    if (cards[i].length == 5) { //暗杠
                        var face = node.getChildByName('card_face4').getComponent("cc.Sprite");
                        var back = node.getChildByName('card_back4').getComponent("cc.Sprite");
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

    showScore: function (index) {
        var uid = ReplayData.players[index].uid;
        var scoreNode = cc.find('player' + (index + 1) + '/score', this.node);
        if (ReplayData.scores[uid] > 0) {
            scoreNode.getComponent('cc.Label').font = this.font[0];
            scoreNode.getComponent('cc.Label').string = '+' + ReplayData.scores[uid];
            // scoreNode.color = new cc.Color(255, 255, 0);
        } else if (ReplayData.scores[uid] < 0) {
            scoreNode.getComponent('cc.Label').font = this.font[1];
            scoreNode.getComponent('cc.Label').string = ReplayData.scores[uid];
            // scoreNode.color = new cc.Color(255, 46, 53);
        } else {
            scoreNode.getComponent('cc.Label').font = this.font[2];
            scoreNode.getComponent('cc.Label').string = ReplayData.scores[uid];
        }
    },
    shareRet: function () {
        if (inCD(3000) == false) {
            screenShoot(wxShareTexture);
        }
    }
});