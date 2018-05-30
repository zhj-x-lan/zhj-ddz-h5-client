var soundMngr = require('SoundMngr');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        playerCardNodes: {
            default: [],
            type: [cc.Node]
        },

        huierFace1: cc.Sprite,
        huierFace2: cc.Sprite,

        stopBtn: cc.Button,
        playBtn: cc.Button,
        exitBtn: cc.Button,
        quick_btn: cc.Button,
        overBtn: cc.Button,

        _actionIndex: -1,
        _playerCardList: [],
        _effectController: null,

        playintrNode: cc.Node,
        roomNum: cc.Label,
        runSum: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        this.playIntrSize = 'small';
        this.stopBtn.node.active = false;
        this.playBtn.node.active = true;

        registEvent('onGameStart', this, this.showTableLayer);
        registEvent('ddz-onGameStart', this, this.showTableLayer);
        registEvent('tjddz-onGameStart', this, this.showTableLayer);
        registEvent('pdk-onGameStart', this, this.showTableLayer);
        registEvent('onServerNotice', this, handlerServerNotice);

        scheduleLamp(this);
    },

    onDestroy: function () {
        unregistEvent('onGameStart', this, this.showTableLayer);
        unregistEvent('ddz-onGameStart', this, this.showTableLayer);
        unregistEvent('tjddz-onGameStart', this, this.showTableLayer);
        unregistEvent('pdk-onGameStart', this, this.showTableLayer);
        unregistEvent('onServerNotice', this, handlerServerNotice);
    },

    onEnable: function () {
        cc.director.getScheduler().setTimeScale(1)
        this._effectController = this.node.getComponent('ReplayEffectController');

        this.roomNum.getComponent(cc.Label).string = ReplayRoomData.roomid;
        this.showPlayIntroduce(this.playIntrSize);

        //this.node.getComponent("ReplayLayout").init();
        //this.initData();
        this.showUIHuier();
        this.initStopPanel();
        this.showHandCards();
        //cc.log('this.headers.length : ' + this.headers.length);
        for (var i = 0; i < this._playerCardList.length; i++) {
            var headerNode = this._playerCardList[i];
            var score = this.getScore(headerNode.uid);
            console.log('=============score = ' + score);
            headerNode.setCoin(score);
        }
        this.schedule(this.runAction, 1);
    },

    showTableLayer: function () {
        if (GameData.client.gameType == gameDefine.GameType.Game_Mj_Tianjin) {
            cc.director.loadScene('table');
        } else if (GameData.client.gameType == gameDefine.GameType.Game_Poker_DDZ) {
            cc.director.loadScene('table-DDZ');
        }else if (GameData.client.gameType == gameDefine.GameType.Game_Poker_TianjinDDZ) {
            cc.director.loadScene('table-TJDDZ');
        }else if (GameData.client.gameType == gameDefine.GameType.Game_Poker_paodekuai) {
            cc.director.loadScene('table-PDK');
        }
    },

    runAction: function () {
        //function(){this.runNextAction()}
        this.runNextAction();
    },

    initData: function () {
        ReplayData = JSON.parse(replayDataJson);
        var huier = ReplayData.opts.huier;
        var huier2 = GameData.getOtherHuier(huier);
        cc.log('huier : ' + huier + ',huier2 : ' + huier2);
        HuierList = [huier, huier2];
    },

    initStopPanel: function () {
        var self = this;
        this.stopBtn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.getScheduler().setTimeScale(1);
            self.stopBtn.node.active = false;
            self.playBtn.node.active = true;
        });
        this.playBtn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.getScheduler().setTimeScale(0);
            self.stopBtn.node.active = true;
            self.playBtn.node.active = false;
        });
        this.exitBtn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            ReplayDataCenter.openRoundPanel = true;
            cc.director.getScheduler().setTimeScale(1);
            cc.director.loadScene('home');
        });
        this.quick_btn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.getScheduler().setTimeScale(2);
            self.stopBtn.node.active = false;
            self.playBtn.node.active = true;
        });
        this.overBtn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.overBtnClick();
        });
    },
    overBtnClick: function () {
        this.unschedule(this.runAction);
        for (var i = this._actionIndex + 1; i < ReplayData.actions.length; i++) {
            var actionObject = ReplayData.actions[i];
            var uid = actionObject.uid;
            var action = actionObject.action;
            var card = actionObject.card;
            cc.log(i, uid, action, card);
            var cardController = this.getCardController(uid);
            if (action == ActionType.obtain) cardController.obtain(card);
            else if (action == ActionType.discard) cardController.discard(card);
            else if (action == ActionType.peng) cardController.peng(card);
            else if (action == ActionType.minggang) cardController.minggang(card);
            else if (action == ActionType.minggangself) cardController.minggangself(card);
            else if (action == ActionType.angang) cardController.angang(card);
            else if (action == ActionType.hu) cardController.hu(card);
        }
        ReplayDataCenter.resultCard = this.getAllCards();
        openView('ReplayResultPanel');
    },

    showUIHuier: function () {
        // var cardRef = this.node.getComponent('CardRef');
        // this.huierFace1.spriteFrame = cardRef.getSpriteFrame(HuierList[0]); 
        // this.huierFace2.spriteFrame = cardRef.getSpriteFrame(HuierList[1]);
        var cardlength = ReplayData.cards[0].cards.length;
        cc.log('showUIHuier --> ' + HuierList[0] + ',' + HuierList[1]);
        this.showCardContent(this.huierFace1.node, 'mj_face_xia_shou', HuierList[0]);
        this.showCardContent(this.huierFace2.node, 'mj_face_xia_shou', HuierList[1]);
    },

    showCardContent: function (cardNode, cardHeader, cardId) {
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/mjcard2d/' + cardHeader + '_' + cardId + '.png';
        // cc.log('load Card URL :' + iconUrl)
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },

    getScore: function (uid) {
        var index;
        for (var i = 0; i < ReplayRoomData.games.length; i++) {
            if (ReplayData.id == ReplayRoomData.games[i].id) {
                index = i;
            }
        }
        var nowScore = 0;
        if (index != 0) {
            for (var i = 0; i < index; i++) {
                nowScore += ReplayRoomData.games[i].score[uid];
            }
        }
        console.log('................nowScore =' + nowScore);
        return nowScore;
    },

    runNextAction: function () {
        // var self = this;
        this._actionIndex++;
        if (this._actionIndex < ReplayData.actions.length) {
            var actionObject = ReplayData.actions[this._actionIndex];
            var uid = actionObject.uid;
            var action = actionObject.action;
            var card = actionObject.card;
            cc.log(this._actionIndex, uid, action, card);
            this.gotoShowTurnEffect(uid);
            this.whoDoSomething(uid, action, card);
        } else if (this._actionIndex == ReplayData.actions.length) {
            cc.log('replay over');
            var actionindex = this._actionIndex - 1;
            var cardController = ReplayData.actions[actionindex];

            this.cardActionAnimation(cardController.uid, 'hu');

            for (var i = 0; i < this.playerCardNodes.length; i++) {
                var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                if (playerCards.uid == cardController.uid) {
                    if (i == 0) {
                        this._effectController.showEffect(ActionType.hu);
                    }
                }
            }
            for (var i = 0; i < this._playerCardList.length; i++) {
                var headerNode = this._playerCardList[i];
                var score = this.getScore(headerNode.uid);
                score += ReplayData.scores[headerNode.uid];
                headerNode.setCoin(score);
            }
            this.lastTime = 2;
            this.schedule(this.updateLastTime, 1);
        } else {
            this.unschedule(this.runAction);
        }
    },

    updateLastTime: function () {
        this.lastTime--;
        if (this.lastTime <= 0) {
            ReplayDataCenter.resultCard = this.getAllCards();
            openView('ReplayResultPanel');
            this.unschedule(this.updateLastTime);
        }
    },

    getAllCards: function () {
        var list = [];
        for (var i = 0; i < this.playerCardNodes.length; i++) {
            var cardNode = this.playerCardNodes[i];
            list.push(cardNode.getComponent('ReplayCardController').getList());
        }
        cc.log(JSON.stringify(list));
        return list;
    },

    showHandCards: function () {
        var creator = ReplayData.creator;
        var cards = ReplayData.cards;
        var Uid;
        if (otherReplay[0] == true) {
            for (var key in ReplayRoomData.players) {
                if (key) {
                    Uid = ReplayRoomData.players[key].uid;
                    break;
                }
            }
        }else{
            Uid = GameData.player.uid.toString();
        }
        var playerInfo = {};
        var ownerIndex = 0;
        playerInfo = ReplayRoomData.players;
        ownerIndex = playerInfo[Uid].seat;

        if (ownerIndex == null || ownerIndex == undefined) return;



        var indexList = [];

        this.playerNum = Object.keys(ReplayData.players).length;
        if (this.playerNum == 4) {
            if (ownerIndex == 0) indexList = [0, 1, 2, 3];
            if (ownerIndex == 1) indexList = [1, 2, 3, 0];
            if (ownerIndex == 2) indexList = [2, 3, 0, 1];
            if (ownerIndex == 3) indexList = [3, 0, 1, 2];
        } else if (this.playerNum == 3) {
            if (ownerIndex == 0) indexList = [0, 1, 2];
            if (ownerIndex == 1) indexList = [1, 2, 0];
            if (ownerIndex == 2) indexList = [2, 0, 1];
            this.playerCardNodes[1].removeFromParent(true);
            this.playerCardNodes.splice(1, 1);
        } else if (this.playerNum == 2) {
            if (ownerIndex == 0) indexList = [0, 1];
            if (ownerIndex == 1) indexList = [1, 0];
            this.playerCardNodes[1].removeFromParent(true);
            this.playerCardNodes[3].removeFromParent(true);
            this.playerCardNodes.splice(1, 1);
            this.playerCardNodes.splice(3, 1);
        }
        for (var i = 0; i < indexList.length; i++) {
            var needindex = indexList[i];
            var cardList = cards[needindex];
            //console.log('cardList = ' + JSON.stringify(cardList));
            if (this.playerCardNodes != null && this.playerCardNodes.length > 0 && this.playerCardNodes[i] != null) {
                var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                playerCards.showHandCard(cardList.cards);

                var uid = cards[needindex].uid;
                var name = playerInfo[uid].name;
                var headimgurl = playerInfo[uid].headimgurl;
                playerCards.uid = uid;
                playerCards.showHead(playerInfo[uid],name + "", headimgurl);

                var show = playerCards.uid == ReplayData.opts.zhuang;
                playerCards.showZhuang(show);
                var num = ReplayData.opts.zhuangnum[playerCards.uid];
                playerCards.showZhuangNum(show, num);

                this._playerCardList.push(playerCards);
            }
        }
    },

    whoDoSomething: function (uid, action, cards) {
        this.runSum.getComponent(cc.Label).string = '进度: ' + this._actionIndex + '/' + (ReplayData.actions.length - 1);
        var cardController = this.getCardController(uid);
        if (action == ActionType.obtain) {
            cardController.obtain(cards);
        } else if (action == ActionType.discard) {
            cardController.discard(cards);
            //soundMngr.instance.playAudio('dis', cards[0]);
            //soundMngr.instance.playAudio('out');
        } else if (action == ActionType.peng) {
            cardController.peng(cards);

            this.cardActionAnimation(cardController.uid, 'peng');

            for (var i = 0; i < this.playerCardNodes.length; i++) {
                var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                if (playerCards.uid == cardController.uid) {
                    if (i == 0) {
                        this._effectController.showEffect(ActionType.peng);
                    }
                }
            }
            this.removeDisFromLast(cards[0]);
            //console.log('cards = ' + cards[0]);
            //soundMngr.instance.playAudio('peng');
        } else if (action == ActionType.minggang) {
            cardController.minggang(cards);

            this.cardActionAnimation(cardController.uid, 'gang');

            for (var i = 0; i < this.playerCardNodes.length; i++) {
                var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                if (playerCards.uid == cardController.uid) {
                    if (i == 0) {
                        this._effectController.showEffect(ActionType.minggang);
                    }
                }
            }
            this.removeDisFromLast(cards[2]);
            //soundMngr.instance.playAudio('gang');
        } else if (action == ActionType.minggangself) {
            cardController.minggangself(cards);

            this.cardActionAnimation(cardController.uid, 'gang');

            for (var i = 0; i < this.playerCardNodes.length; i++) {
                var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                if (playerCards.uid == cardController.uid) {
                    if (i == 0) {
                        this._effectController.showEffect(ActionType.minggangself);
                    }
                }
            }
            //soundMngr.instance.playAudio('gang');
        } else if (action == ActionType.angang) {
            cardController.angang(cards);

            this.cardActionAnimation(cardController.uid, 'gang');

            for (var i = 0; i < this.playerCardNodes.length; i++) {
                var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                if (playerCards.uid == cardController.uid) {
                    if (i == 0) {
                        this._effectController.showEffect(ActionType.angang);
                    }
                }
            }
            // soundMngr.instance.playAudio('gang');
        } else if (action == ActionType.hu) {
            cardController.hu(cards);

            this.cardActionAnimation(cardController.uid, 'hu');

            for (var i = 0; i < this.playerCardNodes.length; i++) {
                var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                if (playerCards.uid == cardController.uid) {
                    if (i == 0) {
                        this._effectController.showEffect(ActionType.hu);
                    }
                }
            }
            //soundMngr.instance.playAudio('hu');
        } else {
            cc.log('no action logic, aciotn name is ' + action);
        }
    },

    removeDisFromLast: function (cardId) {
        var actionObject = ReplayData.actions[this._actionIndex - 1];
        var lastuid = actionObject.uid;
        var lastCardController = this.getCardController(lastuid);
        lastCardController.removeDisCard(cardId);
    },

    getAnimationIndex: function (uid) {
        var actionPos = '';
        for (var i = 0; i < this.playerCardNodes.length; i++) {
            var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
            // if (this.playerNum == 4 && this.playerCardNodes[i] != null) {
            //         playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
            // }else{
            //     if (i == 0) {
            //         playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
            //     }else{
            //         playerCards = this.playerCardNodes[i+1].getComponent('ReplayCardController');
            //     }
            // }
            if (this.playerNum == 4) {
                if (playerCards.uid == uid) {
                    if (i == 0) {
                        actionPos = 'down';
                    } else if (i == 1) {
                        actionPos = 'right';
                    } else if (i == 2) {
                        actionPos = 'up';
                    } else if (i == 3) {
                        actionPos = 'left';
                    }
                }
            } else if (this.playerNum == 3) {
                if (playerCards.uid == uid) {
                    if (i == 0) {
                        actionPos = 'down';
                    } else if (i == 1) {
                        actionPos = 'up';
                    } else if (i == 2) {
                        actionPos = 'left';
                    }
                }
            } else if (this.playerNum == 2) {
                if (playerCards.uid == uid) {
                    if (i == 0) {
                        actionPos = 'down';
                    } else if (i == 1) {
                        actionPos = 'up';
                    }
                }
            }

        }
        return actionPos;
    },

    cardActionAnimation: function (uid, action) {
        var pos = this.getAnimationIndex(uid);
        var animationNode = cc.find('layer_ui/actionAnimations/' + pos, this.node);
        if (animationNode != null) {
            animationNode.getComponent(cc.Animation).play(action);
        }
    },

    gotoShowTurnEffect: function (uid) {
        var isPlay = false;
        if (this._playerCardList == null) {
            cc.log('this._playerCardList null');
            return
        };

        //cc.log('this.headers.length : ' + this.headers.length);
        for (var i = 0; i < this._playerCardList.length; i++) {
            var headerNode = this._playerCardList[i];
            //cc.log(uid + "," + headerNode.getComponent('playerTemplate').uid);
            isPlay = headerNode.uid == uid ? true : false;
            headerNode.getLiuGuang(isPlay);
        }
    },

    getCardController: function (uid) {
        for (var i = 0; i < this._playerCardList.length; i++) {
            var cardController = this._playerCardList[i];
            if (cardController.uid == uid) {
                return cardController;
            }
        }
        return null;
    },

    ruleClick: function () {
        if (this.playintrNode.active == true) {
            return;
        }
        this.playintrNode.active = true;
        this.playintrNode.runAction(cc.sequence(
            cc.moveTo(0.5, cc.p(30, 334)),
            //cc.callFunc(this.isRuleBtn,this),
            cc.delayTime(5),
            cc.moveTo(0.5, cc.p(30, 434)),
            cc.callFunc(this.isRuleBtn, this)
        ));

    },
    isRuleBtn: function () {
        this.playintrNode.active = false;
    },
    onShowPlayIntrClick: function () {
        this.playIntrSize = this.playIntrSize == 'small' ? 'big' : 'small';
        this.showPlayIntroduce(this.playIntrSize);
        cc.find('openBtn', this.playintrNode).rotation = this.playIntrSize == 'small' ? 0 : 180;
    },
    showPlayIntroduce: function (size) {
        var roomRule = ReplayRoomData.opts;
        console.log('roomRule = ' + JSON.stringify(roomRule));
        var playStr = getRoomRuleStr(roomRule);
        // rule = getShortStr(playStr,27);
        var contentNode = cc.find(size + '/content', this.playintrNode);
        cc.log('size : ' + size + ',contentNode : ' + contentNode);
        var label = contentNode.getComponent(cc.Label);
        label.string = playStr;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});