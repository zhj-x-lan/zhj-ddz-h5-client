var RoomHandler = require('roomHandler');
var configMgr = require('configMgr');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        //桦甸麻将
        /**人数为2人，4人 */
        player2_hd: cc.Toggle,
        player4_hd: cc.Toggle,
        /**当勾选2人时，为6局，12局，24局（默认24局）*/
        round_hd: cc.Node,
        spendRound_hd: cc.Node,
        round6_hd: cc.Toggle,
        round12_hd: cc.Toggle,
        round24_hd: cc.Toggle,
        /**当勾选圈数时，为1圈，2圈（默认2圈） */
        quan_hd: cc.Node,
        spendQuan_hd: cc.Node,
        quan1_hd: cc.Toggle,
        quan2_hd: cc.Toggle,
        quan4_hd: cc.Toggle,
        /**是否带漂，默认不带 */
        piao: cc.Toggle,
        //摸宝加分
        mobaojiafen: cc.Toggle,
        //搂点炮双倍
        louDianPaoDouble: cc.Toggle,
        /**大小番，默认大番 */
        dafan: cc.Toggle,
        xiaofan: cc.Toggle,
        /**分张不分张 */
        fenzhang: cc.Toggle,
        bufenzhang: cc.Toggle,
        /**金币模式等级选择 */
        baseNode: cc.Node,
        base_1: cc.Toggle,
        base_2: cc.Toggle,
        base_3: cc.Toggle,
        /**房卡钻石花费 */
        spend_hd: {
            default: [],
            type: [cc.Label]
        },
        drowArray: {
            default: [],
            type: [cc.Node]
        }
    },
    onLoad: function () {
        this.refreshHdUI();
        this.addTouchListener();
    },
    onEnter: function () {
        this.refreshHdUI();    
    },
    addTouchListener: function () {
    },
    getModeType: function(){
        return this.modeType;
    },
    refreshHdUI: function () {
        cc.log("~~~~~~~~~~~~~~~~~~~~~~~~~GameData.createRoomOpts~~~~~~~~~~~~~~~~~~~~~~~~" + JSON.stringify(profileHuaDian.createRoomOpts))
        this.round_hd.active = profileHuaDian.createRoomOpts.joinermax == 2;
        this.quan_hd.active = profileHuaDian.createRoomOpts.joinermax == 4;
        this.spendRound_hd.active = profileHuaDian.createRoomOpts.joinermax == 2;
        this.spendQuan_hd.active = profileHuaDian.createRoomOpts.joinermax == 4;

        /** 人数 */
        this.player2_hd.isChecked = profileHuaDian.createRoomOpts.joinermax == 2;
        this.player4_hd.isChecked = profileHuaDian.createRoomOpts.joinermax == 4;

        /** 圈局 */
        this.round6_hd.isChecked = profileHuaDian.createRoomOpts.roundMax == 6;
        this.round12_hd.isChecked = profileHuaDian.createRoomOpts.roundMax == 12;
        this.round24_hd.isChecked = profileHuaDian.createRoomOpts.roundMax == 24;
        this.quan1_hd.isChecked = profileHuaDian.createRoomOpts.roundMax == 1;
        this.quan2_hd.isChecked = profileHuaDian.createRoomOpts.roundMax == 2;
        this.quan4_hd.isChecked = profileHuaDian.createRoomOpts.roundMax == 4;

        /** 漂 */
        this.piao.isChecked = profileHuaDian.createRoomOpts.piao == 1;
        //摸宝加分
        this.mobaojiafen.isChecked = profileHuaDian.createRoomOpts.mobaojiafen == 1;
        //搂点炮双倍
        this.louDianPaoDouble.isChecked = profileHuaDian.createRoomOpts.isLouDianPaoDouble == 1;
        /** 番 */
        this.dafan.isChecked = profileHuaDian.createRoomOpts.isBigFan == 1;
        this.xiaofan.isChecked = profileHuaDian.createRoomOpts.isBigFan == 0;
        /** 分张 */
        this.fenzhang.isChecked = profileHuaDian.createRoomOpts.fenZhang == 1;
        this.bufenzhang.isChecked = profileHuaDian.createRoomOpts.fenZhang == 0;

        /** 金币模式等级 */
        this.base_1.isChecked = profileHuaDian.createRoomOpts.scoreLv == 0;
        this.base_2.isChecked = profileHuaDian.createRoomOpts.scoreLv == 1;
        this.base_3.isChecked = profileHuaDian.createRoomOpts.scoreLv == 2;

        /** 模式类型 */
        this.modeType = 1;
        this.spendData = undefined;

        this.showSpendUI_hd();
    },
    roundNodeActive: function (evt) {
        this.round_hd.active = this.player2_hd.isChecked;
        this.quan_hd.active = this.player4_hd.isChecked;
        this.spendRound_hd.active = this.player2_hd.isChecked;
        this.spendQuan_hd.active = this.player4_hd.isChecked;

        this.showSpendUI_hd();
    },
    createRoom: function () {
        this.saveRuleFromUI();
        GameData.setGameType(gameDefine.GameType.Game_MJ_HuaDian);

        // 桦甸   
        var createData = {
            gameType: gameDefine.GameType.Game_MJ_HuaDian,
            roundMax:profileHuaDian.createRoomOpts.roundMax,
            roundType:profileHuaDian.createRoomOpts.roundType,
            roundRule:profileHuaDian.createRoomOpts.roundRule,
            roomType: 0,
            costType: profileHuaDian.createRoomOpts.costType,
            joinermax: profileHuaDian.createRoomOpts.joinermax,
            clubId: 0,
            scoreBase: profileHuaDian.createRoomOpts.scoreBase,
            bossType: profileHuaDian.createRoomOpts.bossType,
            isBigFan: profileHuaDian.createRoomOpts.isBigFan,
            piao: profileHuaDian.createRoomOpts.piao,
            anBao: 1,
            mobaoBuf: profileHuaDian.createRoomOpts.mobaojiafen,
            fenZhang: profileHuaDian.createRoomOpts.fenZhang,
            isLouDianPaoDouble : profileHuaDian.createRoomOpts.isLouDianPaoDouble,
            scorelv: profileHuaDian.createRoomOpts.scoreLv,
            currencyType: null,
            settleType: null
        };

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_MJ_HuaDian == undefined){
            return createData;
        }
        createData.currencyType = modeTypeData.Game_MJ_HuaDian.CurrencyType;
        createData.settleType = modeTypeData.Game_MJ_HuaDian.SettleType;

        GameData.room.opts = createData;
        return createData;
    },

    saveRuleFromUI: function () {
        if (this.player2_hd.isChecked) {
            profileHuaDian.createRoomOpts.joinermax = 2;
            profileHuaDian.createRoomOpts.roundType = 1;
            if (this.round6_hd.isChecked) {
                profileHuaDian.createRoomOpts.roundMax = 6;
                profileHuaDian.createRoomOpts.roundRule = 61;
            } else if (this.round12_hd.isChecked) {
                profileHuaDian.createRoomOpts.roundMax = 12;
                profileHuaDian.createRoomOpts.roundRule = 62;
            } else if (this.round24_hd.isChecked) {
                profileHuaDian.createRoomOpts.roundRule = 63;
                profileHuaDian.createRoomOpts.roundMax = 24;
            }
        } else if (this.player4_hd.isChecked) {
            profileHuaDian.createRoomOpts.joinermax = 4;
            profileHuaDian.createRoomOpts.roundType = 2;
            if (this.quan1_hd.isChecked) {
                profileHuaDian.createRoomOpts.roundRule = 64;
                profileHuaDian.createRoomOpts.roundMax = 1;
            } else if (this.quan2_hd.isChecked) {
                profileHuaDian.createRoomOpts.roundRule = 65;
                profileHuaDian.createRoomOpts.roundMax = 2;
            }
            else if (this.quan4_hd.isChecked) {
                profileHuaDian.createRoomOpts.roundRule = 66;
                profileHuaDian.createRoomOpts.roundMax = 4;
            }
        }

        if(this.base_1.isChecked) {
            profileHuaDian.createRoomOpts.scoreLv = 0;
        } else if (this.base_2.isChecked) {
            profileHuaDian.createRoomOpts.scoreLv = 1;
        } else if (this.base_3.isChecked) {
            profileHuaDian.createRoomOpts.scoreLv = 2;
        } else {
            profileHuaDian.createRoomOpts.scoreLv = 0;
        }

        profileHuaDian.createRoomOpts.piao = this.piao.isChecked ? 1 : 0;
        profileHuaDian.createRoomOpts.mobaojiafen = this.mobaojiafen.isChecked ? 1 : 0;
        profileHuaDian.createRoomOpts.isLouDianPaoDouble = this.louDianPaoDouble.isChecked ? 1 : 0;
        profileHuaDian.createRoomOpts.isBigFan = this.dafan.isChecked ? 1 : 0;
        profileHuaDian.createRoomOpts.fenZhang = this.fenzhang.isChecked ? 1 : 0;

        profileHuaDian.saveCreateRoomOpts();
    },
    selectSpendData: function (evt) {
        this.showSpendUI_hd();
    },
    showSpendUI_hd: function () {
        cc.log("..mode..huadian..MJ");
        var str1 = "",str2 = "";

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_MJ_HuaDian == undefined) {
            return;
        }
        var serverConfig = configMgr.getServerConfig();
        if(serverConfig == undefined){
            return;
        }

        this.modeType = modeTypeData.Game_MJ_HuaDian.CurrencyType;
        switch (this.modeType){
            case gameDefine.currencyType.Currency_Card:{
                str1 = "房卡";
                this.spendData = serverConfig.roomCard[gameDefine.GameType.Game_MJ_HuaDian];
            }break;
            case gameDefine.currencyType.Currency_Coin:{
                str1 = "金币";
                this.spendData = serverConfig.roomCoin[gameDefine.GameType.Game_MJ_HuaDian];
            }break;
        }
        if (!this.spendData) {
            cc.log('..spendData is undefined');
            return;
        }

        //隐藏全部红线
        for(var ii = 0;ii < this.drowArray.length;ii++){
            var drow = this.drowArray[ii];
            if(drow){
                drow.active = false;
            }
        }

        //当前选择的是几人房
        var number = 2;
        if (this.player2_hd.isChecked) {
            number = 2;
        } else if (this.player4_hd.isChecked) {
            number = 4;
        }

        var base = 60;
        var max = 63;
        if(this.player2_hd.isChecked == true){
            base = 60;
            max = 63;
        } else if (this.player4_hd.isChecked == true) {
            base = 63;
            max = 66;
        }
        var cost;
        for(var key = base;key < max;key++){
            var final = 0;
            if(this.modeType == gameDefine.currencyType.Currency_Card){
                cost = this.spendData[key +1].cost;
                final = cost[number].final;

                this.spend_hd[key-60].string = '（'+str1+'*' + final + str2+'）';
            } else if(this.modeType == gameDefine.currencyType.Currency_Coin) {
                cost = this.spendData[key -60].cost;
                final = cost[number].final;

                this.spend_hd[key-60].string = '';
            }
            //如果费用为零，显示红线
            if(final <= 0) {
                this.drowArray[key-60].active = true;
            }
        }
        this.refreshBaseScoreLv();
    },
    refreshBaseScoreLv: function(){
        if (this.modeType == gameDefine.currencyType.Currency_Card
            || this.spendData == undefined
            || this.spendData.length <= 0)
        {
            this.baseNode.active = false;
            return;
        }
        this.baseNode.active = true;

        //当前选择的是几人房
        var number = 2,
            round = 0;
        if (this.player2_hd.isChecked) {
            number = 2;
            if (this.round6_hd.isChecked) {
                round = 0;
            } else if (this.round12_hd.isChecked) {
                round = 1;
            } else if (this.round24_hd.isChecked) {
                round = 2;
            }
        } else if (this.player4_hd.isChecked) {
            number = 4;
            if (this.quan1_hd.isChecked) {
                round = 3;
            } else if (this.quan2_hd.isChecked) {
                round = 4;
            } else if (this.quan4_hd.isChecked) {
                round = 5;
            }
        }

        var data = this.spendData[round];
        if(data == undefined){
            return;
        }

        var cost = data.cost;
        var costFinal = cost[number];

        var enter = data.enter;
        var enterFinal = enter[number];

        var times1Label = cc.find('label',this.base_1.node);
        var times2Label = cc.find('label',this.base_2.node);
        var times5Label = cc.find('label',this.base_3.node);

        times1Label.getComponent(cc.Label).string = '初级场：台费'+ costFinal[0] +' 进入条件≥'+ enterFinal[0] +' 倍数 100';
        times2Label.getComponent(cc.Label).string = '中级场：台费'+ costFinal[1] +' 进入条件≥'+ enterFinal[1] +' 倍数 200';
        times5Label.getComponent(cc.Label).string = '高级场：台费'+ costFinal[2] +' 进入条件≥'+ enterFinal[2] +' 倍数 500';
    }
});