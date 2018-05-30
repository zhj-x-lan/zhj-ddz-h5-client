var RoomHandler = require('roomHandler');
var tdk_roomData = require('tdkRoomData');
var configMgr = require('configMgr');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        //相关 checkBox
        //局数
        round15_tdk: cc.Toggle,
        round30_tdk: cc.Toggle,
        //人数
        player3_tdk: cc.Toggle,
        player4_tdk: cc.Toggle,
        player5_tdk: cc.Toggle,
        player6_tdk: cc.Toggle,
        //房费
        pay1_tdk: cc.Toggle,
        pay2_tdk: cc.Toggle,
        pay3_tdk: cc.Toggle,
        //玩法
        // 起 9起 10起
        qi9_tdk: cc.Toggle,
        qi10_tdk: cc.Toggle,
        // 带王
        daiwang_tdk: cc.Toggle,
        // 烂锅翻倍
        languofanbei_tdk: cc.Toggle,
        //全压
        quanya1_tdk: cc.Toggle,
        quanya2_tdk: cc.Toggle,
        quanya3_tdk: cc.Toggle,

        spendUI_tdk: {
            default: [],
            type: [cc.Label]
        },
        drowArray_tdk: {
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
    createRoom: function () {

        GameData.setGameType(gameDefine.GameType.Game_TDK);
        this.saveRuleFromUI();

        var createData = {
            gameType: gameDefine.GameType.Game_TDK, //游戏类型
            roundType: 1,
            roundMax: tdk_roomData.createRoomOpts.roundMax,
            roundRule: tdk_roomData.createRoomOpts.roundRule,
            joinermax: tdk_roomData.createRoomOpts.player,
            roomType: 0,
            costType: tdk_roomData.createRoomOpts.costType,
            cardType: tdk_roomData.createRoomOpts.playType,
            allin: tdk_roomData.createRoomOpts.quanya,
            king: tdk_roomData.createRoomOpts.king,
            nextDouble: tdk_roomData.createRoomOpts.nextDouble,
            clubId: 0,
            currencyType: null,
            settleType: null
        };

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_TDK == undefined){
            return createData;
        }
        createData.currencyType = modeTypeData.Game_TDK.CurrencyType;
        createData.settleType = modeTypeData.Game_TDK.SettleType;

        tdk_roomData.onRoomReadyInfo = {};
        return createData;
    },

    saveRuleFromUI: function () {

        if (this.player3_tdk.isChecked) {
            tdk_roomData.createRoomOpts.player = 3;
        } else if (this.player4_tdk.isChecked) {
            tdk_roomData.createRoomOpts.player = 4;
        } else if (this.player5_tdk.isChecked) {
            tdk_roomData.createRoomOpts.player = 5;
        } else if (this.player6_tdk.isChecked) {
            tdk_roomData.createRoomOpts.player = 6;
        }

        if (this.round15_tdk.isChecked) {
            tdk_roomData.createRoomOpts.roundMax = 15;
            tdk_roomData.createRoomOpts.roundRule = 71;
        } else if (this.round30_tdk.isChecked) {
            tdk_roomData.createRoomOpts.roundMax = 30;
            tdk_roomData.createRoomOpts.roundRule = 72;
        }
        
        if (this.pay1_tdk.isChecked) {
            tdk_roomData.createRoomOpts.costType = 1;
        } else if (this.pay2_tdk.isChecked) {
            tdk_roomData.createRoomOpts.costType = 2;
        } else if (this.pay3_tdk.isChecked) {
            tdk_roomData.createRoomOpts.costType = 3;
        }

        if (this.qi9_tdk.isChecked) {
            tdk_roomData.createRoomOpts.playType = 1;
        } else if (this.qi10_tdk.isChecked) {
            tdk_roomData.createRoomOpts.playType = 2;
        }

        if (this.quanya1_tdk.isChecked) {
            tdk_roomData.createRoomOpts.quanya = 0;
        } else if (this.quanya2_tdk.isChecked) {
            tdk_roomData.createRoomOpts.quanya = 30;
        } else if (this.quanya3_tdk.isChecked) {
            tdk_roomData.createRoomOpts.quanya = 60;
        }

        tdk_roomData.createRoomOpts.king = this.daiwang_tdk.isChecked;
        tdk_roomData.createRoomOpts.nextDouble = this.languofanbei_tdk.isChecked;

        tdk_roomData.saveCreateRoomOpts();
    },

    refreshUI: function () {
        cc.log('tdk_roomData.createRoomOpts = '+JSON.stringify(tdk_roomData.createRoomOpts));
        this.round15_tdk.isChecked = tdk_roomData.createRoomOpts.roundMax == 15;
        this.round30_tdk.isChecked = tdk_roomData.createRoomOpts.roundMax == 30;

        this.player3_tdk.isChecked = tdk_roomData.createRoomOpts.player == 3;
        this.player4_tdk.isChecked = tdk_roomData.createRoomOpts.player == 4;
        this.player5_tdk.isChecked = tdk_roomData.createRoomOpts.player == 5;
        this.player6_tdk.isChecked = tdk_roomData.createRoomOpts.player == 6;

        this.qi9_tdk.isChecked = tdk_roomData.createRoomOpts.playType == 1;
        this.qi10_tdk.isChecked = tdk_roomData.createRoomOpts.playType == 2;

        //应产品需求，将AA和赢家付屏蔽
        this.pay1_tdk.isChecked = true;
        this.pay2_tdk.isChecked = false;
        this.pay3_tdk.isChecked = false;
        // this.pay1_tdk.isChecked = tdk_roomData.createRoomOpts.costType == 1;
        // this.pay2_tdk.isChecked = tdk_roomData.createRoomOpts.costType == 2;
        // this.pay3_tdk.isChecked = tdk_roomData.createRoomOpts.costType == 3;

        this.quanya1_tdk.isChecked = tdk_roomData.createRoomOpts.quanya == 0;
        this.quanya2_tdk.isChecked = tdk_roomData.createRoomOpts.quanya == 30;
        this.quanya3_tdk.isChecked = tdk_roomData.createRoomOpts.quanya == 60;
        
        this.daiwang_tdk.isChecked = tdk_roomData.createRoomOpts.king;
        this.languofanbei_tdk.isChecked = tdk_roomData.createRoomOpts.nextDouble;

        this.showSpendUI_tdk();

    },
    selectSpendData: function (evt) {
        this.showSpendUI_tdk();
    },
    showSpendUI_tdk: function () {
        cc.log("..mode..tdk");
        var str1 = "",str2 = "";

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_TDK == undefined){
            return;
        }
        var serverConfig = configMgr.getServerConfig();
        if(serverConfig == undefined){
            return;
        }
        this.modeType = modeTypeData.Game_TDK.CurrencyType;
        switch (this.modeType){
            case gameDefine.currencyType.Currency_Card:{
                str1 = "房卡";
                this.spendData = serverConfig.roomCard[gameDefine.GameType.Game_TDK];
            }break;
            case gameDefine.currencyType.Currency_Coin:{
                str1 = "金币";
                this.spendData = serverConfig.roomCoin[gameDefine.GameType.Game_TDK];
            }break;
        }
        if (!this.spendData) {
            cc.log('..spendData is undefined');
            return;
        }
        for(var key = 0;key < Object.keys(this.spendData).length;key++){
            var final = 0;
            if(this.modeType == gameDefine.currencyType.Currency_Card){
                var cost = this.spendData[key +71].cost;
                //当前选择的是几人房
                var number = 3;
                if (this.player3_tdk.isChecked) {
                    number = 3;
                } else if (this.player4_tdk.isChecked) {
                    number = 4;
                } else if (this.player5_tdk.isChecked) {
                    number = 5;
                } else if (this.player6_tdk.isChecked) {
                    number = 6;
                }
                final = cost[number].final;

                //如果选择的是AA付
                if(this.pay2_tdk.isChecked){
                    final = Math.ceil(final / number);
                    str2 = "/人";
                }
            } else {
                final = this.spendData[key].cost;
            }
            //如果费用为零，显示红线
            if (final == 0) {
                this.drowArray_tdk[key].active = true;
            } else {
                this.drowArray_tdk[key].active = false;
            }
            this.spendUI_tdk[key].string = '（'+str1+'*' + final + str2+'）';
        }
    }
});