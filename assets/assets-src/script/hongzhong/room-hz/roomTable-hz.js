var soundMngr = require('SoundMngr');
var gameDefine = require('gameDefine');
var RuleHandler = require('ruleHandler');
var RoomHandler = require('roomHandler');
var hongzhongData = require('hongzhongData');

var roomTable = cc.Class({
    extends: cc.Component,

    properties: {

        uiDirection: cc.Node,
        directionNode: cc.Prefab,

        uiCardNode: cc.Node,
        cardNode: cc.Prefab
    },

    onLoad: function () {
        registEvent('onRoomInfo', this, this.RoomInfoHandler);
        registEvent('onGameInfo', this, this.GameInfoHandler);

        registEvent('onGamePass', this, this.GamePassHandler);
        registEvent('onGameAction', this, this.GameActionHandler);

        registEvent('initCardHand', this, this.initCardHandHandler);
        registEvent('initCardHandNum', this, this.initCardHandNumHandler);
        registEvent('initCardChi', this, this.initCardChiHandler);
        registEvent('initCardPeng', this, this.initCardPengHandler);
        registEvent('initCardGang', this, this.initCardGangHandler);
        registEvent('initCardDis', this, this.initCardDisHandler);

        registEvent('onCardDis', this, this.onCardDisHandler);
        registEvent('onCardChi', this, this.onCardChiHandler);
        registEvent('onCardPeng', this, this.onCardPengHandler);
        registEvent('onCardGangAn', this, this.onCardGangAnHandler);
        registEvent('onCardGangMing', this, this.onCardGangMingHandler);
        registEvent('onCardGangBu', this, this.onCardGangBuHandler);
        registEvent('onCardHu', this, this.onCardHuHandler);

        registEvent('onGameStart', this, this.onGameStartHandler);
        registEvent('onGameScore', this, this.onGameScoreHandler);

        registEvent('onGameTurn', this, this.GameTurnHandler);
        registEvent('updateCards', this, this.updateCardsHandler);

        this.tingTip = this.node.getComponent('TingTip-hz');
        this.tingTip.hide();

        this.playerSex = 1;
        this._curGameData = undefined;
        //设置当前游戏数据管理
        this.setCurGameData();

        //添加方向节点
        this.updateUIDirection();
        //添加牌节点
        this.updateUICardNode();

        this.updateUICardNodeOnCards();
        this.updateUICardWithGame();
        this.GameTurnStart();
        this.updateGamePassAction();
    },
    onDestroy: function () {
        unregistEvent('onRoomInfo', this, this.RoomInfoHandler);
        unregistEvent('onGameInfo', this, this.GameInfoHandler);
        unregistEvent('onGamePass', this, this.GamePassHandler);
        unregistEvent('onGameAction', this, this.GameActionHandler);
        unregistEvent('initCardHand', this, this.initCardHandHandler);
        unregistEvent('initCardHandNum', this, this.initCardHandNumHandler);
        unregistEvent('initCardChi', this, this.initCardChiHandler);
        unregistEvent('initCardPeng', this, this.initCardPengHandler);
        unregistEvent('initCardGang', this, this.initCardGangHandler);
        unregistEvent('initCardDis', this, this.initCardDisHandler);
        unregistEvent('onCardDis', this, this.onCardDisHandler);
        unregistEvent('onCardChi', this, this.onCardChiHandler);
        unregistEvent('onCardPeng', this, this.onCardPengHandler);
        unregistEvent('onCardGangAn', this, this.onCardGangAnHandler);
        unregistEvent('onCardGangMing', this, this.onCardGangMingHandler);
        unregistEvent('onCardGangBu', this, this.onCardGangBuHandler);
        unregistEvent('onCardHu', this, this.onCardHuHandler);
        unregistEvent('onGameStart', this, this.onGameStartHandler);
        unregistEvent('onGameScore', this, this.onGameScoreHandler);
        unregistEvent('onGameTurn', this, this.GameTurnHandler);
        unregistEvent('updateCards', this, this.updateCardsHandler);
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

    RoomInfoHandler: function(data){
        if(data == undefined){
            return;
        }
        RoomHandler.onRoomInfoSetData(data.detail);

        this.setCurGameData();
        this.updateUIDirection();
        this.updateUICardNode();
    },
    GameInfoHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.onGameInfoSetData(data.detail);
        this.updateUIDirection();
        this.updateUICardWithGame();
    },
    onGameStartHandler: function (data) {
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.onGameStartSetData(data.detail);
        this.tingTip.hide();
    },
    GamePassHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.onGamePassSetData(data.detail);
        this.updateGamePassAction();
    },
    GameActionHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.onGameActionSetData(data.detail);
        this.updateGamePassAction();
    },
    onGameScoreHandler: function (data) {
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.onGameScoreSetData(data.detail);
        this.tingTip.hide();
    },
    onCardDisHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.onCardDisSetData(data.detail);
        this.ShowCardAction();
    },
    onCardChiHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.onCardChiSetData(data.detail);
        this.ShowCardAction();
    },
    onCardPengHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.onCardPengSetData(data.detail);
        this.ShowCardAction();
    },
    onCardGangMingHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.onCardGangMingSetData(data.detail);
        this.ShowCardAction();
    },
    onCardGangAnHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.onCardGangAnSetData(data.detail);
        this.ShowCardAction();
    },
    onCardGangBuHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.onCardGangBuSetData(data.detail);
        this.ShowCardAction();
    },
    onCardHuHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.onCardHuSetData(data.detail);
        this.ShowCardAction();
    },
    initCardHandHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }

        this._curGameData.initCardHandSetData(data.detail);
        this.updateUICardNodeOnCards();
    },
    initCardHandNumHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.initCardHandNumSetData(data.detail);
        this.updateUICardNodeOnCards();
    },
    initCardChiHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.initCardChiSetData(data.detail);
        this.updateUICardNodeOnCards();
    },
    initCardPengHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.initCardPengSetData(data.detail);
        this.updateUICardNodeOnCards();
    },
    initCardGangHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.initCardGangSetData(data.detail);
        this.updateUICardNodeOnCards();
    },
    initCardDisHandler: function(data){
        if(data == undefined || this._curGameData == undefined){
            return;
        }
        this._curGameData.initCardDisSetData(data.detail);
        this.updateUICardNodeOnCards();
    },
    updateCardsHandler: function(){
        this.updateUICardNodeOnCards();
    },
    GameTurnHandler: function () {
        this.GameTurnStart();
    },

    updateUIDirection: function(){
        var node = this.uiDirection.getChildByName('uiDirection');
        if(node == undefined){
            node = cc.instantiate(this.directionNode);
            node.parent = this.uiDirection;
            node.name = 'uiDirection';
        }
        var template = node.getComponent('tableDirectionControl');
        var gameInfoData = this._curGameData.getGameInfoData();
        if(gameInfoData){
            template.setTurnUid(gameInfoData.turn);
            template.setRoomRoundCur(gameInfoData.roundNum,gameInfoData.roundmax);
            template.setLeftCardNumber(gameInfoData.cardleft);
        }
        var roomData = RoomHandler.getRoomData();
        if(roomData){
            template.setRoundRule(roomData.opts.roundRule);
            template.setRoomRuleString(getRuleStrHongZhong(roomData.opts));
            template.setRoomState(roomData.status);
        }
    },
    updateUICardNode: function(){
        var node = this.uiCardNode.getChildByName('uiCardNode');
        if(node == undefined){
            node = cc.instantiate(this.cardNode);
            node.parent = this.uiCardNode;
            node.name = 'uiCardNode';
        }
        var template = node.getComponent('tableCardControl');
        template.setDisCardMax();
        template._curGameData = this._curGameData;

        var roomData = RoomHandler.getRoomData();
        if(roomData){
            var upUid = 0,
                downUid = 0,
                rightUid = 0,
                leftUid = 0;

            var player = GameData.getPlayerByPos('up');
            if(player){
                upUid = player.uid;
            }
            player = GameData.getPlayerByPos('down');
            if(player){
                downUid = player.uid;
            }
            player = GameData.getPlayerByPos('right');
            if(player){
                rightUid = player.uid;
            }
            player = GameData.getPlayerByPos('left');
            if(player){
                leftUid = player.uid;
            }
            template.setPlayersUid(upUid,downUid,rightUid,leftUid);
        }
    },
    updateUICardWithGame: function(){
        var gameInfoData = this._curGameData.getGameInfoData();
        if(gameInfoData == undefined){
            return;
        }
        var turnUid = gameInfoData.turn;
        var wildcard = gameInfoData.wildcard;
        var lastdisUid = gameInfoData.lastdisUid;
        var lastdisCard = gameInfoData.lastdisCard;

        var node = this.uiCardNode.getChildByName('uiCardNode');
        if(node){
            var template = node.getComponent('tableCardControl');
            template.setTurnUid(turnUid);
            template.setWildCards(wildcard);
            template.setLastDisObject(lastdisUid,lastdisCard);
        }
    },
    updateUICardNodeOnCards: function(){
        var gameInfoData = this._curGameData.getGameInfoData();
        if(gameInfoData == undefined){
            return;
        }
        var upPlayer = GameData.getPlayerByPos('up');
        var downPlayer = GameData.getPlayerByPos('down');
        var rightPlayer = GameData.getPlayerByPos('right');
        var leftPlayer = GameData.getPlayerByPos('left');

        var myHandCards = this._curGameData.getHandCards(GameData.player.uid);
        var obtain = gameInfoData.obtain;

        var upHandNumber = 0,
            rightHandNumber = 0,
            leftHandNumber = 0;
        var upDisCards = [],
            downDisCards = [],
            rightDisCards = [],
            leftDisCards = [];
        var upUsedCards = {chi: [], peng: [], gang: []},
            downUsedCards = {chi: [], peng: [], gang: []},
            rightUsedCards = {chi: [], peng: [], gang: []},
            leftUsedCards = {chi: [], peng: [], gang: []};

        if(upPlayer) {
            upHandNumber = this._curGameData.getHandCardNum(upPlayer.uid);
            upDisCards = this._curGameData.getDisCards(upPlayer.uid);
            upUsedCards.chi = this._curGameData.getChiCards(upPlayer.uid);
            upUsedCards.peng = this._curGameData.getPengCards(upPlayer.uid);
            upUsedCards.gang = this._curGameData.getGangCards(upPlayer.uid);
        }
        if(downPlayer){
            downDisCards = this._curGameData.getDisCards(downPlayer.uid);
            downUsedCards.chi = this._curGameData.getChiCards(downPlayer.uid);
            downUsedCards.peng = this._curGameData.getPengCards(downPlayer.uid);
            downUsedCards.gang = this._curGameData.getGangCards(downPlayer.uid);
        }
        if(rightPlayer) {
            rightHandNumber = this._curGameData.getHandCardNum(rightPlayer.uid);
            rightDisCards = this._curGameData.getDisCards(rightPlayer.uid);
            rightUsedCards.chi = this._curGameData.getChiCards(rightPlayer.uid);
            rightUsedCards.peng = this._curGameData.getPengCards(rightPlayer.uid);
            rightUsedCards.gang = this._curGameData.getGangCards(rightPlayer.uid);
        }
        if(leftPlayer) {
            leftHandNumber = this._curGameData.getHandCardNum(leftPlayer.uid);
            leftDisCards = this._curGameData.getDisCards(leftPlayer.uid);
            leftUsedCards.chi = this._curGameData.getChiCards(leftPlayer.uid);
            leftUsedCards.peng = this._curGameData.getPengCards(leftPlayer.uid);
            leftUsedCards.gang = this._curGameData.getGangCards(leftPlayer.uid);
        }

        var node = this.uiCardNode.getChildByName('uiCardNode');
        if(node){
            var template = node.getComponent('tableCardControl');
            template.setMyHandObject(myHandCards,obtain);
            template.setHandCardsObject(upHandNumber,rightHandNumber,leftHandNumber);
            template.setDisCardsObject(upDisCards,downDisCards,rightDisCards,leftDisCards);
            template.setUsedCardsObject(upUsedCards,downUsedCards,rightUsedCards,leftUsedCards);
        }
    },
    updateGamePassAction: function(){
        if(this._curGameData == undefined){
            return;
        }
        var passData = this._curGameData.getPassActionsData();
        var passType = this._curGameData.getActionsType();
        if(passData == undefined || passType == undefined){
            return;
        }
        var node = this.uiCardNode.getChildByName('uiCardNode');
        if(node){
            var template = node.getComponent('tableCardControl');
            template.setActionsObject(passData,passType);
        }
    },

    GameTurnStart: function(){
        //开始计时器时间调度
        var node = this.uiDirection.getChildByName('uiDirection');
        if(node){
            var template = node.getComponent('tableDirectionControl');
            template.startCoundDown();
        }
    },
    ShowCardAction: function(){
        var actionEffectData = this._curGameData.getActionEffectData();
        if(actionEffectData == undefined){
            return;
        }
        var node = this.uiCardNode.getChildByName('uiCardNode');
        if(node){
            var template = node.getComponent('tableCardControl');
            var sex = GameData.getPlayerSexByUid(actionEffectData.uid);
            var pos = GameData.getPlayerPosByUid(actionEffectData.uid);

            switch (actionEffectData.action){
                case 'dis':{
                    template.showDisAudioEffect(actionEffectData.action,actionEffectData.card,sex);
                }break;
                case 'chi':
                case 'peng':
                case 'gang':
                case 'hu':{
                    cc.log("...sex:"+sex);
                    cc.log("...pos:"+pos);
                    cc.log("...action:"+actionEffectData.action);
                    template.showActionEffect(sex,pos,actionEffectData.action);
                }break;
            }
        }
    }
});
module.exports = roomTable;