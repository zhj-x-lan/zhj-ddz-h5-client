var RoomHandler = require('roomHandler');
var configMgr = require('configMgr');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        round4: cc.Toggle,
        round8: cc.Toggle,
        round16: cc.Toggle,

        pay1: cc.Toggle,
        pay2: cc.Toggle,
        pay3: cc.Toggle,

        mai2: cc.Toggle,
        mai4: cc.Toggle,
        mai6: cc.Toggle,

        huqidui: cc.Toggle,
        qianggang: cc.Toggle,
        diangang: cc.Toggle,

        //倍数
        timesNode: cc.Node,
        times1: cc.Toggle,
        times10: cc.Toggle,
        times20: cc.Toggle,
        times50: cc.Toggle,
        //进入条件，最低分数
        scoreNode: cc.Node,
        score1: cc.Toggle,
        score2: cc.Toggle,
        score3: cc.Toggle,

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
        this.modeType = 1;  //模式类型
        this.spendData = undefined;

        this.refreshUI();
    },
    getModeType: function(){
        return this.modeType;
    },
    refreshUI: function () {
        this.round4.isChecked = GameDataHZ.createRoomOpts.roundRule == 1 ? true : false;
        this.round8.isChecked = GameDataHZ.createRoomOpts.roundRule == 2 ? true : false;
        this.round16.isChecked = GameDataHZ.createRoomOpts.roundRule == 3 ? true : false;
        this.pay1.isChecked = GameDataHZ.createRoomOpts.payType == 1 ? true : false;
        this.pay2.isChecked = GameDataHZ.createRoomOpts.payType == 2 ? true : false;
        this.pay3.isChecked = GameDataHZ.createRoomOpts.payType == 3 ? true : false;
        this.mai2.isChecked = GameDataHZ.createRoomOpts.BuyM == 2 ? true : false;
        this.mai4.isChecked = GameDataHZ.createRoomOpts.BuyM == 4 ? true : false;
        this.mai6.isChecked = GameDataHZ.createRoomOpts.BuyM == 6 ? true : false;
        this.times1.isChecked = GameDataHZ.createRoomOpts.times == 1 ? true : false;
        this.times10.isChecked = GameDataHZ.createRoomOpts.times == 10 ? true : false;
        this.times20.isChecked = GameDataHZ.createRoomOpts.times == 20 ? true : false;
        this.times50.isChecked = GameDataHZ.createRoomOpts.times == 50 ? true : false;
        this.huqidui.isChecked = GameDataHZ.createRoomOpts.huqidui == true ? true : false;
        this.qianggang.isChecked = GameDataHZ.createRoomOpts.qianggang == true ? true : false;
        this.diangang.isChecked = GameDataHZ.createRoomOpts.diangang == true ? true : false;

        this.showSpendUI();

        //初始化分数限制
        this.score1.isChecked = true;
        this.score2.isChecked = false;
        this.score3.isChecked = false;
        this.refreshTimesScore();
    },
    selectSpendData: function (evt) {
        this.showSpendUI();
    },
    showSpendUI: function () {
        cc.log("..mode..hongzhong..MJ");
        var str1 = "",str2 = "";

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_Mj_HZ == undefined){
            return;
        }
        var serverConfig = configMgr.getServerConfig();
        if(serverConfig == undefined){
            return;
        }
        this.modeType = modeTypeData.Game_Mj_HZ.CurrencyType;
        switch (this.modeType){
            case gameDefine.currencyType.Currency_Card:{
                str1 = "房卡";
                this.spendData = serverConfig.roomCard[gameDefine.GameType.Game_Mj_HZ];
            }break;
            case gameDefine.currencyType.Currency_Coin:{
                str1 = "金币";
                this.spendData = serverConfig.roomCoin[gameDefine.GameType.Game_Mj_HZ];
            }break;
        }
        if (!this.spendData) {
            cc.log('..spendData is undefined');
            return;
        }
        for(var key = 0;key < Object.keys(this.spendData).length;key++){
            var final = 0;
            if(this.modeType == gameDefine.currencyType.Currency_Card){
                var cost = this.spendData[key +1].cost;
                //当前选择的是几人房
                var number = 4;
                /*if (this.player2.isChecked) {
                    number = 2;
                } else if (this.player3.isChecked) {
                    number = 3;
                } else if (this.player4.isChecked) {
                    number = 4;
                }*/
                final = cost[number].final;

                //如果选择的是AA付
                if(this.pay2.isChecked){
                    final = Math.ceil(final / number);
                    str2 = "/人";
                }
            } else {
                final = this.spendData[key].cost;
            }
            //如果费用为零，显示红线
            if (final == 0) {
                this.drowArray[key].active = true;
            } else {
                this.drowArray[key].active = false;
            }
            this.spendUI[key].string = '（'+str1+'*' + final + str2+'）';
        }
    },
    saveRuleFromUI: function () {

        if (this.round4.isChecked) {
            GameDataHZ.createRoomOpts.roundRule = 1;
        } else if (this.round8.isChecked) {
            GameDataHZ.createRoomOpts.roundRule = 2;
        } else if (this.round16.isChecked) {
            GameDataHZ.createRoomOpts.roundRule = 3;
        } else {
            GameDataHZ.createRoomOpts.roundRule = 1;
        }

        if (this.pay1.isChecked) {
            GameDataHZ.createRoomOpts.payType = 1;
        } else if (this.pay2.isChecked) {
            GameDataHZ.createRoomOpts.payType = 2;
        } else if (this.pay3.isChecked) {
            GameDataHZ.createRoomOpts.payType = 3;
        } else {
            GameDataHZ.createRoomOpts.payType = 1;
        }

        if (this.mai2.isChecked) {
            GameDataHZ.createRoomOpts.BuyM = 2;
        } else if (this.mai4.isChecked) {
            GameDataHZ.createRoomOpts.BuyM = 4;
        } else if (this.mai6.isChecked) {
            GameDataHZ.createRoomOpts.BuyM = 6;
        } else {
            GameDataHZ.createRoomOpts.BuyM = 2;
        }

        GameDataHZ.createRoomOpts.huqidui = this.huqidui.isChecked ? true : false;
        GameDataHZ.createRoomOpts.qianggang = this.qianggang.isChecked ? true : false;
        GameDataHZ.createRoomOpts.diangang = this.diangang.isChecked ? true : false;

        GameDataHZ.saveCreateRoomOpts();
    },
    selectRoundRuleClick: function(evt,data){

        var type = data;
        if(type == undefined){
            return;
        }
        switch (type){
            case 4:{
                this.round4.isChecked = true;
                this.round8.isChecked = false;
                this.round16.isChecked = false;
            }break;
            case 8:{
                this.round8.isChecked = true;
                this.round4.isChecked = false;
                this.round16.isChecked = false;
            }break;
            case 16:{
                this.round16.isChecked = true;
                this.round4.isChecked = false;
                this.round8.isChecked = false;
            }break;
        }
        if (this.round4.isChecked) {
            GameDataHZ.createRoomOpts.roundRule = 1;
        } else if (this.round8.isChecked) {
            GameDataHZ.createRoomOpts.roundRule = 2;
        } else if (this.round16.isChecked) {
            GameDataHZ.createRoomOpts.roundRule = 3;
        }
        this.refreshTimesScore();
    },
    selectTimesClick: function(evt,data){

        var type = data;
        if(type == undefined){
            return;
        }
        switch (type){
            case 1:{
                this.times1.isChecked = true;
                this.times10.isChecked = false;
                this.times20.isChecked = false;
                this.times50.isChecked = false;
            }break;
            case 10:{
                this.times10.isChecked = true;
                this.times1.isChecked = false;
                this.times20.isChecked = false;
                this.times50.isChecked = false;
            }break;
            case 20:{
                this.times20.isChecked = true;
                this.times10.isChecked = false;
                this.times1.isChecked = false;
                this.times50.isChecked = false;
            }break;
            case 50:{
                this.times50.isChecked = true;
                this.times10.isChecked = false;
                this.times20.isChecked = false;
                this.times1.isChecked = false;
            }break;
        }
        if (this.times1.isChecked) GameDataHZ.createRoomOpts.times = 1;
        else if (this.times10.isChecked) GameDataHZ.createRoomOpts.times = 10;
        else if (this.times20.isChecked) GameDataHZ.createRoomOpts.times = 20;
        else if (this.times50.isChecked) GameDataHZ.createRoomOpts.times = 50;

        this.refreshTimesScore();
    },
    refreshTimesScore: function(){
        if (this.modeType == gameDefine.currencyType.Currency_Card
            || this.spendData == undefined
            || this.spendData.length <= 0)
        {
            this.timesNode.active = false;
            this.scoreNode.active = false;
            return;
        }
        this.timesNode.active = true;
        this.scoreNode.active = true;

        var index = 0;
        switch (GameDataHZ.createRoomOpts.roundRule){
            case 4:{
                index = 0;
            }break;
            case 8:{
                index = 1;
            }break;
            case 16:{
                index = 2;
            }break;
        }

        var scoreArray = this.spendData[index].enter;

        var times1Label = cc.find('label',this.score1.node);
        var times2Label = cc.find('label',this.score2.node);
        var times5Label = cc.find('label',this.score3.node);

        if(GameDataHZ.createRoomOpts.times == undefined){
            GameDataHZ.createRoomOpts.times = 1;
        }

        times1Label.getComponent(cc.Label).string = '≥'+GameDataHZ.createRoomOpts.times*parseInt(scoreArray[0]);
        times2Label.getComponent(cc.Label).string = '≥'+GameDataHZ.createRoomOpts.times*parseInt(scoreArray[1]);
        times5Label.getComponent(cc.Label).string = '≥'+GameDataHZ.createRoomOpts.times*parseInt(scoreArray[2]);

        if(this.score1.isChecked){
            GameDataHZ.createRoomOpts.score = GameDataHZ.createRoomOpts.times*parseInt(scoreArray[0]);
        }else if (this.score2.isChecked){
            GameDataHZ.createRoomOpts.score = GameDataHZ.createRoomOpts.times*parseInt(scoreArray[1]);
        }else if (this.score3.isChecked){
            GameDataHZ.createRoomOpts.score = GameDataHZ.createRoomOpts.times*parseInt(scoreArray[2]);
        }
    },
    createRoom: function (evt) {
        this.saveRuleFromUI();
        GameData.setGameType(gameDefine.GameType.Game_Mj_HZ);

        //获取最大局数
        var roundMax = GameDataHZ.getRoundMax();

        var createData = {
            gameType: gameDefine.GameType.Game_Mj_HZ, //游戏类型
            roomType: 0,
            costType: GameDataHZ.createRoomOpts.payType,
            roundRule: GameDataHZ.createRoomOpts.roundRule,
            roundType: GameDataHZ.createRoomOpts.roundRule,
            roundMax: roundMax,
            joinermax: 2,//GameDataHZ.createRoomOpts.joinermax,
            BuyM: GameDataHZ.createRoomOpts.BuyM,
            huqidui:GameDataHZ.createRoomOpts.huqidui,
            qianggang:GameDataHZ.createRoomOpts.qianggang,
            diangang:GameDataHZ.createRoomOpts.diangang,
            clubId: 0,
            score: GameDataHZ.createRoomOpts.score,
            times: GameDataHZ.createRoomOpts.times,
            currencyType: null,
            settleType: null
        };

        /*var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_Mj_HZ == undefined){
            return createData;
        }
        createData.currencyType = modeTypeData.Game_Mj_HZ.CurrencyType;
        createData.settleType = modeTypeData.Game_Mj_HZ.SettleType;*/

        return createData;
    }
});