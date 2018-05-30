var RoomHandler = require('roomHandler');
var configMgr = require('configMgr');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        //相关 checkBox
        round6: cc.Toggle,
        round10: cc.Toggle,
        round20: cc.Toggle,

        fanshu2: cc.Toggle,
        fanshu3: cc.Toggle,
        fanshu4: cc.Toggle,
        wuxianfan: cc.Toggle,

        payNode: cc.Node,
        pay1: cc.Toggle,
        pay2: cc.Toggle,
        pay3: cc.Toggle,

        //倍数
        timesNode: cc.Node,
        times1: cc.Toggle,
        times2: cc.Toggle,
        times5: cc.Toggle,
        //进入条件，最低分数
        scoreNode: cc.Node,
        score1: cc.Toggle,
        score2: cc.Toggle,
        score3: cc.Toggle,

        //进入条件显示
        limitLabel: cc.Label,

        jiaofen: {
            default: null,
            type: cc.Toggle
        },
        roundJiaofen: {
            default: null,
            type: cc.Toggle
        },
        tiChuai: {
            default: null,
            type: cc.Toggle
        },
        daiNiEr: {
            default: null,
            type: cc.Toggle
        },
        spendUI: {
            default: [],
            type: [cc.Label]
        },
        drowArray: {
            default: [],
            type: [cc.Node]
        }
    },

    onLoad: function () {
        this.refreshUI();

        this.modeType = 1;  //模式类型
        this.spendData = undefined;
    },
    getModeType: function(){
        return this.modeType;
    },
    createRoom: function () {
        this.saveRuleFromUI();
        GameData.setGameType(gameDefine.GameType.Game_Poker_TianjinDDZ);

        var createData = {
            gameType: gameDefine.GameType.Game_Poker_TianjinDDZ, //ddz游戏类型
            roomType: 0,
            roundType: GameDataTJDDZ.createRoomOpts.roundType,
            playType: GameDataTJDDZ.createRoomOpts.playType,
            roundMax: GameDataTJDDZ.createRoomOpts.roundMax,
            roundRule: GameDataTJDDZ.createRoomOpts.roundMax,
            fanshu: GameDataTJDDZ.createRoomOpts.fanshu,
            joinermax: 3,
            clubId: 0,
            costType: GameDataTJDDZ.createRoomOpts.costType,
            jiaofenType: GameDataTJDDZ.createRoomOpts.jiaofenType,
            mud: GameDataTJDDZ.createRoomOpts.mud,
            kicking: GameDataTJDDZ.createRoomOpts.kicking,
            score: GameDataTJDDZ.createRoomOpts.score,
            times: GameDataTJDDZ.createRoomOpts.times,
            scorelv: GameDataTJDDZ.createRoomOpts.score,
            currencyType: null,
            settleType: null
        };

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_Poker_TianjinDDZ == undefined){
            return createData;
        }
        createData.currencyType = modeTypeData.Game_Poker_TianjinDDZ.CurrencyType;
        createData.settleType = modeTypeData.Game_Poker_TianjinDDZ.SettleType;

        return createData;
    },

    selectSpendData: function (evt) {
        this.showSpendUI();
    },

    showSpendUI: function () {
        cc.log("..mode..ddz..TJ");
        var str1 = "",str2 = "";

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_Poker_TianjinDDZ == undefined){
            return;
        }
        var serverConfig = configMgr.getServerConfig();
        if(serverConfig == undefined){
            return;
        }
        this.modeType = modeTypeData.Game_Poker_TianjinDDZ.CurrencyType;
        switch (this.modeType){
            case gameDefine.currencyType.Currency_Card:{
                str1 = "房卡";
                this.spendData = serverConfig.roomCard[gameDefine.GameType.Game_Poker_TianjinDDZ];
            }break;
            case gameDefine.currencyType.Currency_Coin:{
                str1 = "金";
                this.spendData = serverConfig.roomCoin[gameDefine.GameType.Game_Poker_TianjinDDZ];
            }break;
        }
        if (!this.spendData) {
            cc.log('..spendData is undefined');
            return;
        }
        var cost;
        //当前选择的是几人房
        var number = 3;
        for(var key = 0;key < Object.keys(this.spendData).length;key++){
            var final = 0;
            if(this.modeType == gameDefine.currencyType.Currency_Card){
                if(key === 0) {
                    cost = this.spendData[6].cost;
                } else if (key === 1) {
                    cost = this.spendData[10].cost;
                } else if (key === 2) {
                    cost = this.spendData[20].cost;
                }
                final = cost[number].final;

                //如果选择的是AA付
                if(this.pay2.isChecked){
                    //根据产品需求，AA显示和其他付费显示一样，所以把计算AA注释
                    //final = Math.ceil(final / number);
                    //str2 = "/人";
                }
                this.spendUI[key].string = '（'+str1+'*' + final + str2+'）';
            } else {
                cost = this.spendData[key].cost;
                final = cost[number].final;
                str2 = "/局";

                this.spendUI[key].string = '';//'（'+ final +str1 + str2+'）';
            }
            //如果费用为零，显示红线
            if (final == 0) {
                this.drowArray[key].active = true;
            } else {
                this.drowArray[key].active = false;
            }
        }
    },

    selectRoomType: function (evt, data) {},
    saveRuleFromUI: function () {

        if (this.round6.isChecked) {
            GameDataTJDDZ.createRoomOpts.roundMax = 6;
            GameDataTJDDZ.createRoomOpts.roundType = gameDefine.roundType.round;
        } else if (this.round10.isChecked) {
            GameDataTJDDZ.createRoomOpts.roundMax = 10;
            GameDataTJDDZ.createRoomOpts.roundType = gameDefine.roundType.round;
        } else if (this.round20.isChecked) {
            GameDataTJDDZ.createRoomOpts.roundMax = 20;
            GameDataTJDDZ.createRoomOpts.roundType = gameDefine.roundType.round;
        }

        if (this.fanshu2.isChecked) {
            GameDataTJDDZ.createRoomOpts.fanshu = 2;
        } else if (this.fanshu3.isChecked) {
            GameDataTJDDZ.createRoomOpts.fanshu = 3;
        } else if (this.fanshu4.isChecked) {
            GameDataTJDDZ.createRoomOpts.fanshu = 4;
        } else if (this.wuxianfan.isChecked) {
            GameDataTJDDZ.createRoomOpts.fanshu = 15;
        }

        if (this.pay1.isChecked) {
            GameDataTJDDZ.createRoomOpts.costType = 1;
        } else if (this.pay2.isChecked) {
            GameDataTJDDZ.createRoomOpts.costType = 2;
        } else if (this.pay3.isChecked) {
            GameDataTJDDZ.createRoomOpts.costType = 3;
        }
        if (this.jiaofen.isChecked) {
            GameDataTJDDZ.createRoomOpts.jiaofenType = 1;
        } else if (this.roundJiaofen.isChecked) {
            GameDataTJDDZ.createRoomOpts.jiaofenType = 2;
        }

        if (this.tiChuai.isChecked) {
            GameDataTJDDZ.createRoomOpts.kicking = true;
        } else {
            GameDataTJDDZ.createRoomOpts.kicking = false;
        }

        if (this.daiNiEr.isChecked) {
            GameDataTJDDZ.createRoomOpts.mud = true;
        } else {
            GameDataTJDDZ.createRoomOpts.mud = false;
        }
        if(this.score1.isChecked){
            GameDataTJDDZ.createRoomOpts.score = 0;
        }else if (this.score2.isChecked){
            GameDataTJDDZ.createRoomOpts.score = 1;
        }else if (this.score3.isChecked){
            GameDataTJDDZ.createRoomOpts.score = 2;
        }

        GameDataTJDDZ.saveCreateRoomOpts();
    },
    selectRoundRuleClick: function(evt,data){

        var type = data;
        if(type == undefined){
            return;
        }
        switch (type){
            case 6:{
                this.round6.isChecked = true;
                this.round10.isChecked = false;
                this.round20.isChecked = false;
            }break;
            case 10:{
                this.round10.isChecked = true;
                this.round6.isChecked = false;
                this.round20.isChecked = false;
            }break;
            case 20:{
                this.round20.isChecked = true;
                this.round6.isChecked = false;
                this.round10.isChecked = false;
            }break;
        }
        if (this.round6.isChecked) {
            GameDataTJDDZ.createRoomOpts.roundMax = 6;
        } else if (this.round10.isChecked) {
            GameDataTJDDZ.createRoomOpts.roundMax = 10;
        } else if (this.round20.isChecked) {
            GameDataTJDDZ.createRoomOpts.roundMax = 20;
        }
        this.showSpendUI();
        this.refreshTimesScore();
    },
    selectTimesClick: function(evt,data){

        /*var type = data;
        if(type == undefined){
            return;
        }
        switch (type){
            case 1:{
                this.times1.isChecked = true;
                this.times2.isChecked = false;
                this.times5.isChecked = false;
            }break;
            case 2:{
                this.times2.isChecked = true;
                this.times1.isChecked = false;
                this.times5.isChecked = false;
            }break;
            case 5:{
                this.times5.isChecked = true;
                this.times2.isChecked = false;
                this.times1.isChecked = false;
            }break;
        }
        if (this.times1.isChecked) GameDataTJDDZ.createRoomOpts.times = 1;
        else if (this.times2.isChecked) GameDataTJDDZ.createRoomOpts.times = 2;
        else if (this.times5.isChecked) GameDataTJDDZ.createRoomOpts.times = 5;
        */
        GameDataTJDDZ.createRoomOpts.times = data;

        this.showSpendUI();
        this.refreshTimesScore();
    },
    onTiChuaiChecked: function() {
        cc.log('tiChuai isChecked: ', this.tiChuai.isChecked);
    },
    onDaiNiErChecked: function() {
        cc.log('daiNiEr isChecked: ', this.daiNiEr.isChecked);
    },
    refreshUI: function () {
        this.round6.isChecked = GameDataTJDDZ.createRoomOpts.roundMax == 6 ? true : false;
        this.round10.isChecked = GameDataTJDDZ.createRoomOpts.roundMax == 10 ? true : false;
        this.round20.isChecked = GameDataTJDDZ.createRoomOpts.roundMax == 20 ? true : false;
        this.fanshu2.isChecked = GameDataTJDDZ.createRoomOpts.fanshu == 2 ? true : false;
        this.fanshu3.isChecked = GameDataTJDDZ.createRoomOpts.fanshu == 3 ? true : false;
        this.fanshu4.isChecked = GameDataTJDDZ.createRoomOpts.fanshu == 4 ? true : false;
        this.wuxianfan.isChecked = GameDataTJDDZ.createRoomOpts.fanshu == 15 ? true : false;
        this.pay1.isChecked = GameDataTJDDZ.createRoomOpts.costType == 1 ? true : false;
        this.pay2.isChecked = GameDataTJDDZ.createRoomOpts.costType == 2 ? true : false;
        this.pay3.isChecked = GameDataTJDDZ.createRoomOpts.costType == 3 ? true : false;
        this.jiaofen.isChecked = GameDataTJDDZ.createRoomOpts.jiaofenType == 1 ? true : false;
        this.roundJiaofen.isChecked = GameDataTJDDZ.createRoomOpts.jiaofenType == 2 ? true : false;
        this.tiChuai.isChecked = GameDataTJDDZ.createRoomOpts.kicking == true ? true : false;
        this.daiNiEr.isChecked = GameDataTJDDZ.createRoomOpts.mud == true ? true : false;
        this.score1.isChecked = GameDataTJDDZ.createRoomOpts.score == 0 ? true : false;
        this.score2.isChecked = GameDataTJDDZ.createRoomOpts.score == 1 ? true : false;
        this.score3.isChecked = GameDataTJDDZ.createRoomOpts.score == 2 ? true : false;

        this.showSpendUI();
        this.refreshTimesScore();
    },
    refreshTimesScore: function(){
        if (this.modeType == gameDefine.currencyType.Currency_Card
            || this.spendData == undefined
            || this.spendData.length <= 0)
        {
            this.scoreNode.active = false;
            this.timesNode.active = false;
            this.payNode.active = true;
            return;
        }
        this.scoreNode.active = true;
        //金币场，将倍数选择、房费选择隐藏
        this.timesNode.active = false;
        this.payNode.active = false;

        var index = 0;
        switch (GameDataTJDDZ.createRoomOpts.roundMax){
            case 6:{
                index = 0;
            }break;
            case 10:{
                index = 1;
            }break;
            case 20:{
                index = 2;
            }break;
        }
        if(GameDataTJDDZ.createRoomOpts.times == undefined){
            GameDataTJDDZ.createRoomOpts.times = 1;
        }

        //当前选择的是几人房
        var number = 3;

        var cost = this.spendData[index].cost;
        var costFinal = cost[number];

        var enter = this.spendData[index].enter;
        var enterFinal = enter[number];

        //this.limitLabel.string = '≥'+ GameDataTJDDZ.createRoomOpts.times*parseInt(enterFinal);

        if(this.score1.isChecked){
            GameDataTJDDZ.createRoomOpts.score = 0;
        }else if (this.score2.isChecked){
            GameDataTJDDZ.createRoomOpts.score = 1;
        }else if (this.score3.isChecked){
            GameDataTJDDZ.createRoomOpts.score = 2;
        }

        var times1Label = cc.find('label',this.score1.node);
        var times2Label = cc.find('label',this.score2.node);
        var times5Label = cc.find('label',this.score3.node);

        times1Label.getComponent(cc.Label).string = '初级场：台费'+ costFinal[0] +' 进入条件≥' + enterFinal[0] +' 倍数 100';
        times2Label.getComponent(cc.Label).string = '中级场：台费'+ costFinal[1] +' 进入条件≥' + enterFinal[1] +' 倍数 200';
        times5Label.getComponent(cc.Label).string = '高级场：台费'+ costFinal[2] +' 进入条件≥' + enterFinal[2] +' 倍数 500';
    }
});