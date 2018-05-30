var gameDefine = require('gameDefine');
var errorCode = require('errorCode');

var room_hz = {
    cards: {},
    game: {
        roundType: 0,
        roundNum: 0,
        roundmax: 0,
        zhuangUid: 0,
        cardleft: 0,
        turn: 0,
        wildcard: 0,
        lastdisUid: 0,
        lastdisCard: 0,
        winnerUid: 0,
        winnerType: 0,
        obtain: 0
    },
    passAction: {
        lastUid: 0,
        fromCard: 0,
        action: [],
        checkCards: []
    },
    actionType: false,   //是否为摸牌有操作（暗杠，补杠，自摸）
    actionEffect: {      //操作通知数据
        uid: null,
        card: null,
        action: null
    },
    scores: {}
};

module.exports = room_hz;

room_hz.requestDisCard = function (card, callback) {
    GameNet.getInstance().request("room.hzhmjHandler.discard", {card: card}, function (rtn) {
        cc.log('room.hzhmjHandler.discard:%d', rtn.result);
        callback(rtn);
    });
};
room_hz.requestPass = function (callback) {
    GameNet.getInstance().request("room.hzhmjHandler.pass", {}, function (rtn) {
        cc.log('room.hzhmjHandler.pass response:%d', rtn.result);
        if (rtn.result == errorCode.Fail) {
            createMoveMessage('请等待其他玩家选择');
        }
        callback(rtn);
    });
};
room_hz.requestChiCard = function (card, callback) {
    GameNet.getInstance().request("room.hzhmjHandler.chi", {card: card}, function (rtn) {
        cc.log('room.hzhmjHandler.chi response:%d', rtn.result);
        callback(rtn);
    });
};
room_hz.requestPengCard = function (card, callback) {
    GameNet.getInstance().request("room.hzhmjHandler.peng", {card: card}, function (rtn) {
        cc.log('room.hzhmjHandler.peng response:%d', rtn.result);
        callback(rtn);
    });
};
room_hz.requestAnGangCard = function (myCard, callback) {
    GameNet.getInstance().request("room.hzhmjHandler.gangAn", {card: myCard}, function (rtn) {
        cc.log('room.hzhmjHandler.gangAn response:%d', rtn.result);
        callback(rtn);
    });
};
room_hz.requestMingGangCard = function (myCard, callback) {
    GameNet.getInstance().request("room.hzhmjHandler.gangMing", {card: myCard}, function (rtn) {
        cc.log('room.hzhmjHandler.gangMing response:%d', rtn.result);
        callback(rtn);
    });
};
room_hz.requestBuGangCard = function (myCard, callback) {
    GameNet.getInstance().request("room.hzhmjHandler.gangBu", {card: myCard}, function (rtn) {
        cc.log('room.hzhmjHandler.gangBu response:%d', rtn.result);
        callback(rtn);
    });
};
room_hz.requestDianPao = function (myCard, callback) {
    GameNet.getInstance().request("room.hzhmjHandler.dianPao", {card: myCard}, function (rtn) {
        cc.log('room.hzhmjHandler.dianPao response:%d', rtn.result);
        callback(rtn);
    });
};
room_hz.requestHu = function (myCard, callback) {
    GameNet.getInstance().request("room.hzhmjHandler.hu", {card: myCard}, function (rtn) {
        cc.log('room.hzhmjHandler.hu response:%d', rtn.result);
        callback(rtn);
    });
};

//获取数据
room_hz.getGameInfoData = function(){
    return this.game;
};
room_hz.getPlayerCards = function (uid) {
    this.cards[uid] == undefined ? this.cards[uid] = {} : null;
    return this.cards[uid];
};
room_hz.getChiCards = function (uid) {
    this.cards[uid] == undefined ? this.cards[uid] = {} : null;
    return this.cards[uid]['chi'];
};
room_hz.getPengCards = function (uid) {
    this.cards[uid] == undefined ? this.cards[uid] = {} : null;
    return this.cards[uid]['peng'];
};
room_hz.getGangCards = function (uid) {
    this.cards[uid] == undefined ? this.cards[uid] = {} : null;
    return this.cards[uid]['gang'];
};
room_hz.getHandCards = function (uid) {
    this.cards[uid] == undefined ? this.cards[uid] = {} : null;
    return this.cards[uid]['hand'];
};
room_hz.getHandCardNum = function (uid) {
    this.cards[uid] == undefined ? this.cards[uid] = {} : null;
    return this.cards[uid]['handnum'];
};
room_hz.getDisCards = function (uid) {
    this.cards[uid] == undefined ? this.cards[uid] = {} : null;
    return this.cards[uid]['dis'];
};
room_hz.getPassActionsData = function () {
    return this.passAction;
};
room_hz.getActionsType = function () {
    return this.actionType;
};
room_hz.getActionEffectData = function(){
    return this.actionEffect;
};
room_hz.getGameScoreData = function(){
    return this.scores;
};

//设置数据
room_hz.onGameInfoSetData = function(data){
    if(data == undefined){
        return;
    }
    this.game.roundType = data.roundType;
    this.game.roundNum = data.roundNum;
    this.game.roundmax = data.roundmax;
    this.game.zhuangUid = data.zhuang;
    this.game.cardleft = data.cardleft;
    this.game.turn = data.turn;
    this.game.wildcard = data.wildcard;
    this.game.lastdisUid = data.disuid;
    this.game.lastdisCard = data.discard;

    GameData.game.turn = data.turn;
};
room_hz.onGameStartSetData = function(data){
    if(data == undefined){
        return;
    }
    this.game.gameStart = true;
};
room_hz.onGameScoreSetData = function(data){
    if(data == undefined){
        return;
    }
    this.scores = data;
    this.game.gameStart = false;
};
room_hz.onGamePassSetData = function(data){
    if(data == undefined){
        return;
    }
    this.passAction.lastUid = data.uid;
    this.passAction.fromCard = data.card;
    this.passAction.action = data.act;
    this.actionType = false;
};
room_hz.onGameActionSetData = function(data){
    if(data == undefined){
        return;
    }
    this.passAction.action = data.act;
    this.actionType = true;
};
room_hz.initCardHandSetData = function(data){
    if(data == undefined){
        return;
    }
    this.cards[data.uid] == undefined ? this.cards[data.uid] = {} : null;
    this.cards[data.uid]['hand'] = data.hand;
    this.game.obtain = data.obtain;
};
room_hz.initCardHandNumSetData = function(data){
    if(data == undefined){
        return;
    }
    this.cards[data.uid] == undefined ? this.cards[data.uid] = {} : null;
    this.cards[data.uid]['handnum'] = data.num;
};
room_hz.initCardChiSetData = function(data){
    if(data == undefined){
        return;
    }
    this.cards[data.uid] == undefined ? this.cards[data.uid] = {} : null;
    this.cards[data.uid]['chi'] = data.chi;
};
room_hz.initCardPengSetData = function(data){
    if(data == undefined){
        return;
    }
    this.cards[data.uid] == undefined ? this.cards[data.uid] = {} : null;
    this.cards[data.uid]['peng'] = data.peng;
};
room_hz.initCardGangSetData = function(data){
    if(data == undefined){
        return;
    }
    this.cards[data.uid] == undefined ? this.cards[data.uid] = {} : null;
    this.cards[data.uid]['gang'] = data.gang;
};
room_hz.initCardDisSetData = function(data){
    if(data == undefined){
        return;
    }
    this.cards[data.uid] == undefined ? this.cards[data.uid] = {} : null;
    this.cards[data.uid]['dis'] = data.dis;
};
room_hz.setActionEffect = function(action, data){
    if(action == undefined || data == undefined){
        return;
    }
    this.actionEffect.uid = data.player;
    this.actionEffect.card = data.card;
    this.actionEffect.action = action;
};
room_hz.onCardDisSetData = function(data){
    this.setActionEffect('dis', data);
};
room_hz.onCardChiSetData = function(data){
    this.setActionEffect('chi', data);
};
room_hz.onCardPengSetData = function(data){
    this.setActionEffect('peng', data);
};
room_hz.onCardGangMingSetData = function(data){
    this.setActionEffect('gang', data);
};
room_hz.onCardGangAnSetData = function(data){
    this.setActionEffect('gang', data);
};
room_hz.onCardGangBuSetData = function(data){
    this.setActionEffect('gang', data);
};
room_hz.onCardHuSetData = function(data){
    this.setActionEffect('hu', data);
};

room_hz.registMessage_hz = function() {
    cc.log("....hongzhong data registMessage.");

    var self = this;
    GameNet.getInstance().setCallBack('hzhmj-onGameInfo', function (data) {
        self.onGameInfoSetData(data);
        sendEvent('onGameInfo', data);
        sendEvent('onGameTurn');
        sendEvent('updateCards');
    });
    GameNet.getInstance().setCallBack('hzhmj-initCardHand', function (data) {
        self.initCardHandSetData(data);
        sendEvent('initCardHand', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-initCardHandNum', function (data) {
        self.initCardHandNumSetData(data);
        sendEvent('initCardHandNum', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-initCardChi', function (data) {
        self.initCardChiSetData(data);
        sendEvent('initCardChi', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-initCardPeng', function (data) {
        self.initCardPengSetData(data);
        sendEvent('initCardPeng', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-initCardGang', function (data) {
        self.initCardGangSetData(data);
        sendEvent('initCardGang', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-initCardDis', function (data) {
        self.initCardDisSetData(data);
        sendEvent('initCardDis', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-onGamePass', function (data) {
        self.onGamePassSetData(data);
        sendEvent('onGamePass', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-onGameAction', function (data) {
        self.onGameActionSetData(data);
        sendEvent('onGameAction', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-onCardDis', function (data) {
        self.setActionEffect('dis', data);
        sendEvent('onCardDis', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-onCardChi', function (data) {
        self.setActionEffect('chi', data);
        sendEvent('onCardChi', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-onCardPeng', function (data) {
        self.setActionEffect('peng', data);
        sendEvent('onCardPeng', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-onCardGangAn', function (data) {
        self.setActionEffect('gang', data);
        sendEvent('onCardGangAn', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-onCardGangMing', function (data) {
        self.setActionEffect('gang', data);
        sendEvent('onCardGangMing', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-onCardGangBu', function (data) {
        self.setActionEffect('gang', data);
        sendEvent('onCardGangBu', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-onCardHu', function (data) {
        self.setActionEffect('hu', data);
        sendEvent('onCardHu', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-onGameStart', function (data) {
        self.onGameStartSetData(data);
        sendEvent('onGameStart', data);
    });
    GameNet.getInstance().setCallBack('hzhmj-onGameScore', function (data) {
        self.onGameScoreSetData(data);
        sendEvent('onGameScore', data);
    });
};

room_hz.arrayChangeObject = function(data){
    var object = {};
    for(var ii = 0;ii < data.length;ii++){
        var cardId = data[ii];
        var cardNum = room_hz.getArrayElementNumber(data,cardId);
        object[cardId] = cardNum;
    }
    return object;
};
room_hz.getArrayElementNumber = function(array,element){
    var num = 0;
    if(array == undefined){
        return num;
    }
    for(var ii = 0;ii < array.length;ii++){
        if(array[ii] == element){
            num++;
        }
    }
    return num;
};