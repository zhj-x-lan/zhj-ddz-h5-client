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

        renShu3: cc.Toggle,
        renShu2: cc.Toggle,

        pay1: cc.Toggle,
        pay2: cc.Toggle,
        pay3: cc.Toggle,

        //倍数
        times1: cc.Toggle,
        times10: cc.Toggle,
        times20: cc.Toggle,
        times50: cc.Toggle,
        //进入条件，最低分数
        scoreNode: cc.Node,
        score1: cc.Toggle,
        score2: cc.Toggle,
        score3: cc.Toggle,

        guan: {
            default: null,
            type: cc.Toggle
        },
        buGuan: {
            default: null,
            type: cc.Toggle
        },
        hearts3: {
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
        GameData.setGameType(gameDefine.GameType.Game_Poker_paodekuai);

        var createData = {
            gameType: gameDefine.GameType.Game_Poker_paodekuai, //ddz游戏类型
            roomType: 0,
            passFlag: GameDataPDK.createRoomOpts.playType,
            roundMax: GameDataPDK.createRoomOpts.roundMax,
            roundRule: GameDataPDK.createRoomOpts.roundMax,
            joinermax: GameDataPDK.createRoomOpts.joinermax,
            roundType: 1,
            clubId: 0,
            costType: GameDataPDK.createRoomOpts.costType,
            score: GameDataPDK.createRoomOpts.score,
            times: GameDataPDK.createRoomOpts.times,
            zhuangType: GameDataPDK.createRoomOpts.zhuangType,
            currencyType: null,
            settleType: null
        };

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_Poker_paodekuai == undefined){
            return createData;
        }
        createData.currencyType = modeTypeData.Game_Poker_paodekuai.CurrencyType;
        createData.settleType = modeTypeData.Game_Poker_paodekuai.SettleType;

        return createData;
    },

    selectSpendData: function (evt) {
        this.showSpendUI();
    },

    showSpendUI: function () {
        cc.log("..mode..pdk");
        var str1 = "",str2 = "";

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_Poker_paodekuai == undefined){
            return;
        }
        var serverConfig = configMgr.getServerConfig();
        if(serverConfig == undefined){
            return;
        }
        this.modeType = modeTypeData.Game_Poker_paodekuai.CurrencyType;
        switch (this.modeType){
            case gameDefine.currencyType.Currency_Card:{
                str1 = "房卡";
                this.spendData = serverConfig.roomCard[gameDefine.GameType.Game_Poker_paodekuai];
            }break;
            case gameDefine.currencyType.Currency_Coin:{
                str1 = "金币";
                this.spendData = serverConfig.roomCoin[gameDefine.GameType.Game_Poker_paodekuai];
            }break;
        }
        if (!this.spendData) {
            cc.log('..spendData is undefined');
            return;
        }
        for(var key = 0;key < Object.keys(this.spendData).length;key++){
            var final = 0;
            if(this.modeType == gameDefine.currencyType.Currency_Card){
                var cost;
                if(key === 0) {
                    cost = this.spendData[10].cost;
                } else if (key === 1) {
                    cost = this.spendData[20].cost;
                } else if (key === 2) {
                    cost = this.spendData[30].cost;
                }
                //当前选择的是几人房
                var number = 3;
                final = cost[number].final;

                //如果选择的是AA付
                if(this.pay2.isChecked){
                    //根据产品需求，AA显示和其他付费显示一样，所以把计算AA注释
                    //final = Math.ceil(final / number);
                    //str2 = "/人";
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

    selectRoomType: function (evt, data) {},
    saveRuleFromUI: function () {

        if (this.round6.isChecked) {
            GameDataPDK.createRoomOpts.roundMax = 10;
        } else if (this.round10.isChecked) {
            GameDataPDK.createRoomOpts.roundMax = 20;
        } else if (this.round20.isChecked) {
            GameDataPDK.createRoomOpts.roundMax = 30;
        }

        if (this.renShu3.isChecked) {
            GameDataPDK.createRoomOpts.joinermax = 3;
        } else if (this.renShu2.isChecked) {
            GameDataPDK.createRoomOpts.joinermax = 2;
        }

        if (this.pay1.isChecked) {
            GameDataPDK.createRoomOpts.costType = 1;
        } else if (this.pay2.isChecked) {
            GameDataPDK.createRoomOpts.costType = 2;
        } else if (this.pay3.isChecked) {
            GameDataPDK.createRoomOpts.costType = 3;
        }
        if (this.guan.isChecked) {
            GameDataPDK.createRoomOpts.playType = 1;
        } else if (this.buGuan.isChecked) {
            GameDataPDK.createRoomOpts.playType = 2;
        }

        if (this.hearts3.isChecked) {
            GameDataPDK.createRoomOpts.zhuangType = true;
        } else {
            GameDataPDK.createRoomOpts.zhuangType = false;
        }

        GameDataPDK.saveCreateRoomOpts();
    },
    selectRoundRuleClick: function(evt,data){

        var type = data;
        if(type == undefined){
            return;
        }
        switch (type){
            case 10:{
                this.round6.isChecked = true;
                this.round10.isChecked = false;
                this.round20.isChecked = false;
            }break;
            case 20:{
                this.round10.isChecked = true;
                this.round6.isChecked = false;
                this.round20.isChecked = false;
            }break;
            case 30:{
                this.round20.isChecked = true;
                this.round6.isChecked = false;
                this.round10.isChecked = false;
            }break;
        }
        if (this.round6.isChecked) {
            GameDataPDK.createRoomOpts.roundMax = 10;
        } else if (this.round10.isChecked) {
            GameDataPDK.createRoomOpts.roundMax = 20;
        } else if (this.round20.isChecked) {
            GameDataPDK.createRoomOpts.roundMax = 30;
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
        if (this.times1.isChecked) GameDataPDK.createRoomOpts.times = 1;
        else if (this.times10.isChecked) GameDataPDK.createRoomOpts.times = 10;
        else if (this.times20.isChecked) GameDataPDK.createRoomOpts.times = 20;
        else if (this.times50.isChecked) GameDataPDK.createRoomOpts.times = 50;

        this.refreshTimesScore();
    },
    refreshUI: function () {
        this.round6.isChecked = GameDataPDK.createRoomOpts.roundMax == 10 ? true : false;
        this.round10.isChecked = GameDataPDK.createRoomOpts.roundMax == 20 ? true : false;
        this.round20.isChecked = GameDataPDK.createRoomOpts.roundMax == 30 ? true : false;
        this.renShu3.isChecked = GameDataPDK.createRoomOpts.joinermax == 3 ? true : false;
        this.renShu2.isChecked = GameDataPDK.createRoomOpts.joinermax == 2 ? true : false;
        this.pay1.isChecked = GameDataPDK.createRoomOpts.costType == 1 ? true : false;
        this.pay2.isChecked = GameDataPDK.createRoomOpts.costType == 2 ? true : false;
        this.pay3.isChecked = GameDataPDK.createRoomOpts.costType == 3 ? true : false;
        this.guan.isChecked = GameDataPDK.createRoomOpts.playType == 1 ? true : false;
        this.buGuan.isChecked = GameDataPDK.createRoomOpts.playType == 2 ? true : false;
        this.hearts3.isChecked = GameDataPDK.createRoomOpts.zhuangType == true ? true : false;
        this.showSpendUI();

        if (this.renShu2.isChecked == true)
        {
            this.hearts3.isChecked = false;
            this.hearts3.node.active = false;
        }

        //初始化分数限制
        this.score1.isChecked = true;
        this.score2.isChecked = false;
        this.score3.isChecked = false;
        this.refreshTimesScore();
    },
    refreshTimesScore: function(){
        if (this.modeType == gameDefine.currencyType.Currency_Card
            || this.spendData == undefined
            || this.spendData.length <= 0)
        {
            this.scoreNode.active = false;
            return;
        }
        this.scoreNode.active = true;

        var index = 0;
        switch (GameDataPDK.createRoomOpts.roundMax){
            case 10:{
                index = 0;
            }break;
            case 20:{
                index = 1;
            }break;
            case 30:{
                index = 2;
            }break;
        }

        var scoreArray = this.spendData[index].enter;

        var times1Label = cc.find('label',this.score1.node);
        var times2Label = cc.find('label',this.score2.node);
        var times5Label = cc.find('label',this.score3.node);

        if(GameDataPDK.createRoomOpts.times == undefined){
            GameDataPDK.createRoomOpts.times = 1;
        }

        times1Label.getComponent(cc.Label).string = '≥'+GameDataPDK.createRoomOpts.times*parseInt(scoreArray[0]);
        times2Label.getComponent(cc.Label).string = '≥'+GameDataPDK.createRoomOpts.times*parseInt(scoreArray[1]);
        times5Label.getComponent(cc.Label).string = '≥'+GameDataPDK.createRoomOpts.times*parseInt(scoreArray[2]);

        if(this.score1.isChecked){
            GameDataPDK.createRoomOpts.score = GameDataPDK.createRoomOpts.times*parseInt(scoreArray[0]);
        }else if (this.score2.isChecked){
            GameDataPDK.createRoomOpts.score = GameDataPDK.createRoomOpts.times*parseInt(scoreArray[1]);
        }else if (this.score3.isChecked){
            GameDataPDK.createRoomOpts.score = GameDataPDK.createRoomOpts.times*parseInt(scoreArray[2]);
        }
    },
    onRenShu2Clicked: function() {
        this.hearts3.isChecked = false;
        var checkmark = cc.find('checkmark', this.hearts3.node);
        checkmark.active = false;
        this.hearts3.interactable = false;
        this.hearts3.node.active = false;
    },
    onRenShu3Clicked: function() {
        // this.hearts3.isChecked = true;
        // var checkmark = cc.find('checkmark', this.hearts3.node);
        // checkmark.active = true;
        this.hearts3.interactable = true;
        this.hearts3.node.active = true;
    }
});