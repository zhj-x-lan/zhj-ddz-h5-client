var TianjinMj = require('mahjong_tianjin');
var ShishiMj = require('mahjong_shishi');
var HuadianMj = require('mahjong_huadian');
var ChangChunMj = require('mahjong_changchun');
var HongZhongMj = require('mahjong_hz');
var gameDefine = require('gameDefine');

var RuleHandler = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null
    },

    properties: {
        rule: null
    },

    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
        RuleHandler.instance = this;
    },

    setGameType: function (type) {
        switch (type){
            case gameDefine.GameType.Game_Mj_Tianjin:{
                this.rule = new TianjinMj();
            }break;
            case gameDefine.GameType.Game_Mj_Shishi:{
                this.rule = new ShishiMj();
            }break;
            case gameDefine.GameType.Game_MJ_HuaDian:{
                this.rule = new HuadianMj();
            }break;
            case gameDefine.GameType.Game_Mj_HZ:{
                this.rule = new HongZhongMj();
            }break;
            case gameDefine.GameType.Game_Mj_CC:{
                this.rule = new ChangChunMj();
            }break;
            case gameDefine.GameType.Game_Mj_Heb:{
                this.rule = new ChangChunMj();
            }break;
        }
    },

    isHuier: function (card) {
        return this.rule.isHuier(card);
    },

    canChi: function (uid, card) {
        return this.rule.canChi(uid, card);
    },

    canPeng: function (uid, card) {
        return this.rule.canPeng(uid, card);
    },

    canAnGang: function (uid) {
        return this.rule.canAnGang(uid);
    },

    canBuGang: function (uid) {
        return this.rule.canBuGang(uid);
    },

    canMingGang: function (uid, card) {
        return this.rule.canMingGang(uid, card);
    },

    canMingGangSelf: function () {
        return this.rule.canMingGangSelf();
    },

    canDianPao: function (uid, card) {
        return this.rule.canDianPao(uid, card);
    },

    canZimo: function (handcards, obCard, checkFlag) {
        return this.rule.canZimo(handcards, obCard, checkFlag);
    },

    canTing: function (handcards) {
        return this.rule.canTing(handcards);
    },

    discardTip: function (handcards) {
        return this.rule.discardTip(handcards);
    },

    getHuType: function (huCards, handcards, obCard, checkFlag) {
        return this.rule.getHuType(huCards, handcards, obCard, checkFlag);
    },

    calcHuScore: function (type) {
        return this.rule.calcHuScore(type);
    },

    getHuTypeString: function () {
        return this.rule.getHuTypeString();
    },
    isJinGang: function (handcards, deck) {
        return this.rule.isJinGang(handcards, deck);
    },
    getHuTypeArry: function (huType) {
        return this.rule.getHuTypeArry(huType);
    },
    checkYoujin: function(discard) {
        return this.rule.checkYoujin(discard);
    },
    calcHuaScore: function (uid) {
        return this.rule.calcHuaScore(uid);
    }
});