var RoomHandler = require('roomHandler');
var gameDefine = require('gameDefine');
var configMgr = require('configMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        //对局人数
        playerNum2: {
            default: null,
            type: cc.Toggle,          
        },
        playerNum3: {
            default: null,
            type: cc.Toggle,
        },
        playerNum4: {
            default: null,
            type: cc.Toggle,
        },
        playerNum5: {
            default: null,
            type: cc.Toggle,
        },

        //扣房卡
        owner: {
            default: null,
            type: cc.Toggle,
        },
        AA: {
            default: null,
            type: cc.Toggle,
        },

        //出牌时间
        seconds30: {
            default: null,
            type: cc.Toggle,
        },
        minute1: {
            default: null,
            type: cc.Toggle,
        },
        minute5: {
            default: null,
            type: cc.Toggle,
        },
        unlimited: {             
            default: null,             
            type: cc.Toggle,
        },

        //局数
        round15: {             
            default: null,             
            type: cc.Toggle,
        },
        round30: {             
            default: null,             
            type: cc.Toggle,         
        },
        round45: {             
            default: null,             
            type: cc.Toggle,         
        },
        round60: {             
            default: null,             
            type: cc.Toggle,         
        },
        round75: {             
            default: null,             
            type: cc.Toggle,         
        }
    },

    onLoad: function () {
        this.refreshUi();
    },

    createRoom: function() {
        GameData.setGameType(gameDefine.GameType.Game_Poker_13shui);
        this.saveRuleFromUi();

        var createData = {
            gameType: GameType.Game_Poker_13shui,
            costType:  GameData13.createRoomOpts.payType,
            joinermax: GameData13.createRoomOpts.joinermax,
            limitTime: GameData13.createRoomOpts.limiteTime,
            roundmax:  GameData13.createRoomOpts.roundmax,
            roundRule: 1,
            roomType: 0,
            clubId: 0,
            currencyType: null,
            settleType: null
        };
        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_Poker_13shui == undefined){
            return createData;
        }
        createData.currencyType = modeTypeData.Game_Poker_13shui.CurrencyType;
        createData.settleType = modeTypeData.Game_Poker_13shui.SettleType;

        return createData;
    },

    saveRuleFromUi: function() {
        
        if (this.round15.isChecked) {GameData13.createRoomOpts.roundmax = 15;}
        else if (this.round30.isChecked) {GameData13.createRoomOpts.roundmax = 30;}
        else if (this.round45.isChecked) {GameData13.createRoomOpts.roundmax = 45;}
        else if (this.round60.isChecked) {GameData13.createRoomOpts.roundmax = 60;} 
        else if (this.round75.isChecked) {GameData13.createRoomOpts.roundmax = 75;}
        else {GameData13.createRoomOpts.roundmax = 15}
        if (this.playerNum2.isChecked) {GameData13.createRoomOpts.joinermax = 2;}
        else if (this.playerNum3.isChecked) {GameData13.createRoomOpts.joinermax = 3;}
        else if (this.playerNum4.isChecked) {GameData13.createRoomOpts.joinermax = 4;}
        else if (this.playerNum5.isChecked) {GameData13.createRoomOpts.joinermax = 5;}
        else {GameData13.createRoomOpts.joinermax = 2;}

        if (this.seconds30.isChecked) {GameData13.createRoomOpts.limiteTime = 30;}
        else if (this.minute1.isChecked) {GameData13.createRoomOpts.limiteTime = 60;}
        else if (this.minute5.isChecked) {GameData13.createRoomOpts.limiteTime = 300;}
        else if (this.unlimited.isChecked) {GameData13.createRoomOpts.limiteTime = 0;}
        else {GameData13.createRoomOpts.limiteTime = 30;}

        if(this.owner.isChecked){GameData13.createRoomOpts.payType = 1}
        else if(this.AA.isChecked){GameData13.createRoomOpts.payType = 2}
        else{GameData13.createRoomOpts.payType = 1}

        GameData13.saveCreateRoomOpts();
    },

    refreshUi: function() {
        this.round15.isChecked = GameData13.createRoomOpts.roundmax == 15? true : false;
        this.round30.isChecked = GameData13.createRoomOpts.roundmax == 30? true : false;
        this.round45.isChecked = GameData13.createRoomOpts.roundmax == 45? true : false;
        this.round60.isChecked = GameData13.createRoomOpts.roundmax == 60? true : false;
        this.round75.isChecked = GameData13.createRoomOpts.roundmax == 75? true : false;

        this.playerNum2.isChecked = GameData13.createRoomOpts.joinermax == 2? true : false;
        this.playerNum3.isChecked = GameData13.createRoomOpts.joinermax == 3? true : false;
        this.playerNum4.isChecked = GameData13.createRoomOpts.joinermax == 4? true : false;
        this.playerNum5.isChecked = GameData13.createRoomOpts.joinermax == 5? true : false;

        this.seconds30.isChecked = GameData13.createRoomOpts.limiteTime == 30? true : false;
        this.minute1.isChecked = GameData13.createRoomOpts.limiteTime == 60? true : false;
        this.minute5.isChecked = GameData13.createRoomOpts.limiteTime == 300? true : false;
        this.unlimited.isChecked = GameData13.createRoomOpts.limiteTime == 0? true : false;
    }
});
