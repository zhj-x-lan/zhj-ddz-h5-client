var RoomHandler = require('roomHandler');
var configMgr = require('configMgr');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        round4: cc.Toggle,
        round8: cc.Toggle,
        round16: cc.Toggle,
        turn1: cc.Toggle,
        turn2: cc.Toggle,
        turn4: cc.Toggle,
        //付费标准
        spendUI: {
            default: [],
            type: [cc.Label]
        },
        drowArray: {
            default: [],
            type: [cc.Node]
        },

        scoreNode: cc.Node,
        score1: cc.Toggle,
        score2: cc.Toggle,
        score5: cc.Toggle,

        timesNode: cc.Node,
        times1: cc.Toggle,
        times2: cc.Toggle,
        times5: cc.Toggle,

        //进入条件
        limitLabel: cc.Label,

        hun: cc.Toggle,
        zi: cc.Toggle,
        feng: cc.Toggle,
        chan: cc.Toggle,
        longwufan: cc.Toggle,
        doubleGang: cc.Toggle,

        jingang4: cc.Toggle,
        jingang8: cc.Toggle,

        zuo2: cc.Toggle,
        lianzhuang: cc.Toggle,
        buzuobula: cc.Toggle,
        //付费方式 1房主付，2AA制，3赢家付
        payNode: cc.Node,
        pay1: cc.Toggle,
        pay2: cc.Toggle,
        pay3: cc.Toggle,

        player2: cc.Toggle,
        player3: cc.Toggle,
        player4: cc.Toggle,

        PlayInfo: cc.Prefab
    },

    onLoad: function () {
        this.ToggleObjArry = {};
        this.modeType = 1;  //模式类型
        this.spendData = undefined;

        this.refreshRuleUI();
    },
    getModeType: function(){
        return this.modeType;
    },
    refreshRuleUI: function () {
        this.round4.isChecked = GameData.createRoomOpts.roundRule == 1 ? true : false;
        this.round8.isChecked = GameData.createRoomOpts.roundRule == 2 ? true : false;
        this.round16.isChecked = GameData.createRoomOpts.roundRule == 3 ? true : false;
        this.turn1.isChecked = GameData.createRoomOpts.roundRule == 4 ? true : false;
        this.turn2.isChecked = GameData.createRoomOpts.roundRule == 5 ? true : false;
        this.turn4.isChecked = GameData.createRoomOpts.roundRule == 6 ? true : false;

        this.hun.isChecked = GameData.createRoomOpts.huierDiao == true ? true : false;
        this.zi.isChecked = GameData.createRoomOpts.daZi == true ? true : false;
        this.feng.isChecked = GameData.createRoomOpts.daiFeng == true ? true : false;
        this.chan.isChecked = GameData.createRoomOpts.daiChan == true ? true : false;
        this.longwufan.isChecked = GameData.createRoomOpts.longwufan == true ? true : false;
        this.doubleGang.isChecked = GameData.createRoomOpts.doubleGang == true ? true : false;

        this.jingang4.isChecked = GameData.createRoomOpts.jGangScore == 8 ? true : false;
        this.jingang8.isChecked = GameData.createRoomOpts.jGangScore == 8 ? true : false;

        this.zuo2.isChecked = GameData.createRoomOpts.laType == 1 ? true : false;
        this.lianzhuang.isChecked = GameData.createRoomOpts.laType == 2 ? true : false;
        this.buzuobula.isChecked = GameData.createRoomOpts.laType == 3 ? true : false;

        this.score1.isChecked = GameData.createRoomOpts.times == 1 ? true : false;
        this.score2.isChecked = GameData.createRoomOpts.times == 2 ? true : false;
        this.score5.isChecked = GameData.createRoomOpts.times == 5 ? true : false;

        this.player2.isChecked = GameData.createRoomOpts.joinermax == 2 ? true : false;
        this.player3.isChecked = GameData.createRoomOpts.joinermax == 3 ? true : false;
        this.player4.isChecked = GameData.createRoomOpts.joinermax == 4 ? true : false;

        this.pay1.isChecked = GameData.createRoomOpts.payType == 1 ? true : false;
        this.pay2.isChecked = GameData.createRoomOpts.payType == 2 ? true : false;
        this.pay3.isChecked = GameData.createRoomOpts.payType == 3 ? true : false;

        this.times1.isChecked = GameData.createRoomOpts.score == 0 ? true : false;
        this.times2.isChecked = GameData.createRoomOpts.score == 1 ? true : false;
        this.times5.isChecked = GameData.createRoomOpts.score == 2 ? true : false;

        this.showDoubleGang();
        this.showSpendUI();
        this.refreshTimesScore();
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
                this.turn1.isChecked = false;
                this.turn2.isChecked = false;
                this.turn4.isChecked = false;
            }break;
            case 8:{
                this.round8.isChecked = true;
                this.round4.isChecked = false;
                this.round16.isChecked = false;
                this.turn1.isChecked = false;
                this.turn2.isChecked = false;
                this.turn4.isChecked = false;
            }break;
            case 16:{
                this.round16.isChecked = true;
                this.round4.isChecked = false;
                this.round8.isChecked = false;
                this.turn1.isChecked = false;
                this.turn2.isChecked = false;
                this.turn4.isChecked = false;
            }break;
            case 21:{
                this.turn1.isChecked = true;
                this.round4.isChecked = false;
                this.round8.isChecked = false;
                this.round16.isChecked = false;
                this.turn2.isChecked = false;
                this.turn4.isChecked = false;
            }break;
            case 22:{
                this.turn2.isChecked = true;
                this.round4.isChecked = false;
                this.round8.isChecked = false;
                this.round16.isChecked = false;
                this.turn1.isChecked = false;
                this.turn4.isChecked = false;
            }break;
            case 24:{
                this.turn4.isChecked = true;
                this.round4.isChecked = false;
                this.round8.isChecked = false;
                this.round16.isChecked = false;
                this.turn1.isChecked = false;
                this.turn2.isChecked = false;
            }break;
        }
        if (this.round4.isChecked) GameData.createRoomOpts.roundRule = 1;
        else if (this.round8.isChecked) GameData.createRoomOpts.roundRule = 2;
        else if (this.round16.isChecked) GameData.createRoomOpts.roundRule = 3;
        else if (this.turn1.isChecked) GameData.createRoomOpts.roundRule = 4;
        else if (this.turn2.isChecked) GameData.createRoomOpts.roundRule = 5;
        else if (this.turn4.isChecked) GameData.createRoomOpts.roundRule = 6;
        else GameData.createRoomOpts.roundRule = 2;

        this.refreshTimesScore();
    },
    selectScroeClick: function(evt,data){

        var type = data;
        if(type == undefined){
            return;
        }
        switch (type){
            case 1:{
                this.score1.isChecked = true;
                this.score2.isChecked = false;
                this.score5.isChecked = false;
            }break;
            case 2:{
                this.score2.isChecked = true;
                this.score1.isChecked = false;
                this.score5.isChecked = false;
            }break;
            case 5:{
                this.score5.isChecked = true;
                this.score1.isChecked = false;
                this.score2.isChecked = false;
            }break;
        }
        if (this.score1.isChecked) GameData.createRoomOpts.times = 1;
        else if (this.score2.isChecked) GameData.createRoomOpts.times = 2;
        else if (this.score5.isChecked) GameData.createRoomOpts.times = 5;
        else GameData.createRoomOpts.times = 1;

        this.refreshTimesScore();
    },
    saveRuleFromUI: function () {
        //普通房间
        if (this.round4.isChecked) {
            GameData.createRoomOpts.roundRule = 1;
            GameData.createRoomOpts.roundType = gameDefine.roundType.round;
            GameData.createRoomOpts.roundMax = 4;
        } else if (this.round8.isChecked) {
            GameData.createRoomOpts.roundRule = 2;
            GameData.createRoomOpts.roundType = gameDefine.roundType.round;
            GameData.createRoomOpts.roundMax = 8;
        } else if (this.round16.isChecked) {
            GameData.createRoomOpts.roundRule = 3;
            GameData.createRoomOpts.roundType = gameDefine.roundType.round;
            GameData.createRoomOpts.roundMax = 16;
        } else if (this.turn1.isChecked) {
            GameData.createRoomOpts.roundRule = 4;
            GameData.createRoomOpts.roundType = gameDefine.roundType.quan;
            GameData.createRoomOpts.roundMax = 1;
        } else if (this.turn2.isChecked) {
            GameData.createRoomOpts.roundRule = 5;
            GameData.createRoomOpts.roundType = gameDefine.roundType.quan;
            GameData.createRoomOpts.roundMax = 2;
        } else if (this.turn4.isChecked) {
            GameData.createRoomOpts.roundRule = 6;
            GameData.createRoomOpts.roundType = gameDefine.roundType.quan;
            GameData.createRoomOpts.roundMax = 4;
        } else {
            GameData.createRoomOpts.roundRule = 2;
            GameData.createRoomOpts.roundType = gameDefine.roundType.round;
            GameData.createRoomOpts.roundMax = 8;
        }
        GameData.createRoomOpts.huierDiao = this.hun.isChecked ? true : false;
        GameData.createRoomOpts.daZi = this.zi.isChecked ? true : false;
        GameData.createRoomOpts.daiFeng = this.feng.isChecked ? true : false;
        GameData.createRoomOpts.daiChan = this.chan.isChecked ? true : false;
        GameData.createRoomOpts.longwufan = this.longwufan.isChecked ? true : false;

        if (this.jingang4.isChecked) GameData.createRoomOpts.jGangScore = 8;
        else if (this.jingang8.isChecked) GameData.createRoomOpts.jGangScore = 8;
        else GameData.createRoomOpts.jGangScore = 8;

        if (this.zuo2.isChecked) {
            GameData.createRoomOpts.laType = 1;
            GameData.createRoomOpts.doubleGang = this.doubleGang.isChecked ? true : false;
            this.doubleGang.node.active = true;
        } else if (this.lianzhuang.isChecked) {
            GameData.createRoomOpts.laType = 2;
            GameData.createRoomOpts.doubleGang = this.doubleGang.isChecked ? true : false;
            this.doubleGang.node.active = true;
        } else if (this.buzuobula.isChecked) {
            GameData.createRoomOpts.laType = 3;
            GameData.createRoomOpts.doubleGang = false;
            this.doubleGang.node.active = false;
        } else {
            GameData.createRoomOpts.laType = 1;
            GameData.createRoomOpts.doubleGang = false;
            this.doubleGang.node.active = true;
        }

        if (this.score1.isChecked) GameData.createRoomOpts.times = 1;
        else if (this.score2.isChecked) GameData.createRoomOpts.times = 2;
        else if (this.score5.isChecked) GameData.createRoomOpts.times = 5;
        else GameData.createRoomOpts.times = 1;

        if (this.player2.isChecked) GameData.createRoomOpts.joinermax = 2;
        else if (this.player3.isChecked) GameData.createRoomOpts.joinermax = 3;
        else if (this.player4.isChecked) GameData.createRoomOpts.joinermax = 4;
        else GameData.createRoomOpts.joinermax = 4;

        if (this.pay1.isChecked) GameData.createRoomOpts.payType = 1;
        else if (this.pay2.isChecked) GameData.createRoomOpts.payType = 2;
        else if (this.pay3.isChecked) GameData.createRoomOpts.payType = 3;
        else GameData.createRoomOpts.payType = 1;

        if(this.times1.isChecked){GameData.createRoomOpts.score = 0;
        }else if (this.times2.isChecked){GameData.createRoomOpts.score = 1;
        }else if (this.times5.isChecked){GameData.createRoomOpts.score= 2;}

        GameData.saveCreateRoomOpts();
    },

    createRoom: function () {
        this.saveRuleFromUI();
        GameData.setGameType(gameDefine.GameType.Game_Mj_Tianjin);

        var createData = {
            gameType: GameData.client.gameType,
            roundRule: GameData.createRoomOpts.roundRule,
            roundType: GameData.createRoomOpts.roundType,
            roundMax: GameData.createRoomOpts.roundMax,
            roomType: 0,
            costType: GameData.createRoomOpts.payType,
            joinermax: GameData.createRoomOpts.joinermax,
            clubId: 0,
            playeruid: GameData.player.uid,
            feng: GameData.createRoomOpts.daiFeng,
            chan: GameData.createRoomOpts.daiChan,
            doubleGang: GameData.createRoomOpts.doubleGang,
            hd: GameData.createRoomOpts.huierDiao,
            longwufan: GameData.createRoomOpts.longwufan,
            score: GameData.createRoomOpts.score,
            times: GameData.createRoomOpts.times,
            jingang: GameData.createRoomOpts.jGangScore,
            lazhuang: GameData.createRoomOpts.laType,
            scorelv: GameData.createRoomOpts.score,
            currencyType: null,
            settleType: null
        };
        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_Mj_Tianjin == undefined){
            return createData;
        }
        createData.currencyType = modeTypeData.Game_Mj_Tianjin.CurrencyType;
        createData.settleType = modeTypeData.Game_Mj_Tianjin.SettleType;

        return createData;
    },
    selectSpendData: function (evt) {
        this.showSpendUI();
        this.refreshTimesScore();
    },
    refreshTimesScore: function(){
        if (this.modeType == gameDefine.currencyType.Currency_Card
            || this.spendData == undefined
            || this.spendData.length <= 0)
        {
            //this.scoreNode.active = false;
            this.timesNode.active = false;
            this.payNode.active = true;
            return;
        }
        //this.scoreNode.active = true;
        this.timesNode.active = true;
        //金币场，将付费选择隐藏
        this.payNode.active = false;

        //当前选择的是几人房
        var number = 2;
        if (this.player2.isChecked) {
            number = 2;
        } else if (this.player3.isChecked) {
            number = 3;
        } else if (this.player4.isChecked) {
            number = 4;
        }

        var cost = this.spendData[GameData.createRoomOpts.roundRule -1].cost;
        var costFinal = cost[number];

        var enter = this.spendData[GameData.createRoomOpts.roundRule -1].enter;
        var enterFinal = enter[number];

        if(GameData.createRoomOpts.times == undefined){
            GameData.createRoomOpts.times = 1;
        }

        //this.limitLabel.string = '≥'+ GameData.createRoomOpts.times*parseInt(enterFinal);

        if(this.times1.isChecked){
            GameData.createRoomOpts.score = 0;
        }else if (this.times2.isChecked){
            GameData.createRoomOpts.score = 1;
        }else if (this.times5.isChecked){
            GameData.createRoomOpts.score= 2;
        }

        var times1Label = cc.find('label',this.times1.node);
        var times2Label = cc.find('label',this.times2.node);
        var times5Label = cc.find('label',this.times5.node);

        times1Label.getComponent(cc.Label).string = '初级场：台费'+ costFinal[0] +' 进入条件≥'+ enterFinal[0] +' 倍数 100';
        times2Label.getComponent(cc.Label).string = '中级场：台费'+ costFinal[1] +' 进入条件≥'+ enterFinal[1] +' 倍数 200';
        times5Label.getComponent(cc.Label).string = '高级场：台费'+ costFinal[2] +' 进入条件≥'+ enterFinal[2] +' 倍数 500';
    },
    showSpendUI: function () {
        cc.log("..mode..tianjing..MJ");
        var str1 = "",str2 = "";

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_Mj_Tianjin == undefined){
            return;
        }
        var serverConfig = configMgr.getServerConfig();
        if(serverConfig == undefined){
            return;
        }
        this.modeType = modeTypeData.Game_Mj_Tianjin.CurrencyType;
        switch (this.modeType){
            case gameDefine.currencyType.Currency_Card:{
                str1 = "房卡";
                this.spendData = serverConfig.roomCard[gameDefine.GameType.Game_Mj_Tianjin];
            }break;
            case gameDefine.currencyType.Currency_Coin:{
                str1 = "金";
                this.spendData = serverConfig.roomCoin[gameDefine.GameType.Game_Mj_Tianjin];
            }break;
        }
        if (this.spendData == undefined) {
            cc.log('..spendData is undefined');
            return;
        }

        //当前选择的是几人房
        var number = 2;
        if (this.player2.isChecked) {
            number = 2;
        } else if (this.player3.isChecked) {
            number = 3;
        } else if (this.player4.isChecked) {
            number = 4;
        }
        var cost;
        for(var key = 0;key < Object.keys(this.spendData).length;key++){
            var final = 0;
            if(this.modeType == gameDefine.currencyType.Currency_Card){
                cost = this.spendData[key +1].cost;

                final = cost[number].final;

                //如果选择的是AA付
                //根据产品需求，界面显示一直是AA制付款，所以把判断注释
                //if(this.pay2.isChecked){
                    final = Math.ceil(final / number);
                    str2 = "/人";
                //}
                this.spendUI[key].string = '（'+str1+'*' + final + str2+'）';
            } else if(this.modeType == gameDefine.currencyType.Currency_Coin) {
                cost = this.spendData[key].cost;

                final = cost[number].final;

                str2 = "/局";
                if(key >= 3){
                    str2 = "/圈";
                }
                this.spendUI[key].string = '';//'（'+ final +str1 + str2+'）';
            }
            //如果费用为零，显示红线
            if(final <= 0) {
                this.drowArray[key].active = true;
            } else {
                this.drowArray[key].active = false;
            }
        }
    },
    selectLaZhuang: function (evt) {
        this.showDoubleGang();
    },
    showDoubleGang: function () {
        if (this.buzuobula.isChecked) {
            this.doubleGang.isChecked = false;
            this.doubleGang.node.active = false;
        } else {
            this.doubleGang.node.active = true;
        }
    },

    skipToPlayInfo: function(eve, data){
        gameDefine.ruleType.isRuleType = true;
        gameDefine.ruleType.type = 3;
        if (data == 1) {
            gameDefine.ruleType.py = 1000;
        }else if (data == 2) {
            gameDefine.ruleType.py = 883;
        }
        openView('PlayIntroPanel');
    },
});