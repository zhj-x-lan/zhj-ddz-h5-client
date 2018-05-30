var RoomHandler = require('roomHandler');
var configMgr = require('configMgr');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,
    properties: {
        //哈尔滨麻将
        /**人数为2人，4人 */
        player2: cc.Toggle,
        player4: cc.Toggle,

        /**当勾选2人时，为4局，8局，16局（默认6局）*/
        round: cc.Node,
        spendRound: cc.Node,
        //局数 4,8,16
        round4: cc.Toggle,
        round8: cc.Toggle,
        round16: cc.Toggle,

        /**当勾选圈数时，为1圈，2圈（默认1圈） */
        quan: cc.Node,
        spendQuan: cc.Node,
        quan1: cc.Toggle,
        quan2: cc.Toggle,
        quan4: cc.Toggle,

        //点炮包三家
        dianpao: cc.Toggle,
        //小鸡飞蛋
        //xiaojifeidan: cc.Toggle,
        //下蛋算站立
        //xiadanzhanli: cc.Toggle,
        //带缺门
        quemen: cc.Toggle,
        //对宝翻倍
        duibaofanbei: cc.Toggle,
        //明宝&暗宝 0  1
        baotype: cc.Toggle,

        /**金币模式等级选择 */
        baseNode: cc.Node,
        base_1: cc.Toggle,
        base_2: cc.Toggle,
        base_3: cc.Toggle,

        /**房卡钻石花费 */
        spend: {
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
        this.addTouchListener();
    },

    onEnter: function () {
    },
    addTouchListener: function () {
    },
    getModeType: function(){
        return this.modeType;
    },
    refreshUI: function () {
        cc.log("~~~~~~~~~~~~~~~~~~~~~~~~~GameData.createRoomOpts~~~~~~~~~~~~~~~~~~~~~~~~" + JSON.stringify(profileHeb.createRoomOpts))
        this.round.active = profileHeb.createRoomOpts.joinermax == 2;
        this.quan.active = profileHeb.createRoomOpts.joinermax == 4;
        this.spendRound.active = profileHeb.createRoomOpts.joinermax == 2;
        this.spendQuan.active = profileHeb.createRoomOpts.joinermax == 4;

        /** 人数 */
        this.player2.isChecked = profileHeb.createRoomOpts.joinermax == 2;
        this.player4.isChecked = profileHeb.createRoomOpts.joinermax == 4;

        //局数
        this.round4.isChecked = profileHeb.createRoomOpts.roundMax == 4;
        this.round8.isChecked =  profileHeb.createRoomOpts.roundMax == 8;
        this.round16.isChecked =  profileHeb.createRoomOpts.roundMax == 16;
        this.quan1.isChecked = profileHeb.createRoomOpts.roundMax == 1;
        this.quan2.isChecked = profileHeb.createRoomOpts.roundMax == 2;
        this.quan4.isChecked = profileHeb.createRoomOpts.roundMax == 4;

        /** 点炮包三家 */
        this.dianpao.isChecked = profileHeb.createRoomOpts.dianpao == 1;
        //小鸡飞蛋
        //this.xiaojifeidan.isChecked = profileHeb.createRoomOpts.xiaojifeidan == 1;
        //下蛋算站立
        //this.xiadanzhanli.isChecked = profileHeb.createRoomOpts.xiadanzhanli == 1;
        /** 带缺门 */
        this.quemen.isChecked = profileHeb.createRoomOpts.quemen == 1;
        /** 对宝翻倍 */
        this.duibaofanbei.isChecked = profileHeb.createRoomOpts.duibaofanbei == 1;
          //明宝&暗宝 0  1
        this.baotype.isChecked = profileHeb.createRoomOpts.baotype == 0;

        /** 金币模式等级 */
        this.base_1.isChecked = profileChangChun.createRoomOpts.scoreLv == 0;
        this.base_2.isChecked = profileChangChun.createRoomOpts.scoreLv == 1;
        this.base_3.isChecked = profileChangChun.createRoomOpts.scoreLv == 2;

        /** 模式类型 */
        this.modeType = 1;
        this.spendData = undefined;

        this.showSpendUI();
    },

    roundNodeActive: function (evt) {

        this.round.active = this.player2.isChecked ? true : false;
        this.quan.active = this.player4.isChecked ? true : false;

        this.spendRound.active = this.player2.isChecked ? true : false;
        this.spendQuan.active = this.player4.isChecked ? true : false;

        this.showSpendUI();
    },

    createRoom: function (evt) {
        this.saveRuleFromUI();
        GameData.setGameType(gameDefine.GameType.Game_Mj_Heb);

        // 哈尔滨麻将
        var createData = {
            gameType: gameDefine.GameType.Game_Mj_Heb,
            roundMax: profileHeb.createRoomOpts.roundMax,
            roundType:profileHeb.createRoomOpts.roundType,
            roundRule:profileHeb.createRoomOpts.roundRule,
            bossType: profileHeb.createRoomOpts.bossType,
            roomType: profileHeb.createRoomOpts.roomType,
            costType: profileHeb.createRoomOpts.costType,
            joinermax: profileHeb.createRoomOpts.joinermax,
            clubId: 0,
            anBao:profileHeb.createRoomOpts.baotype,
            dianPaoBaoFu:profileHeb.createRoomOpts.dianpao,
            //xiaoJiFeiDan:profileHeb.createRoomOpts.xiaojifeidan,
            //xiaDanZhanLi:profileHeb.createRoomOpts.xiadanzhanli,
            queMen:profileHeb.createRoomOpts.quemen,
            duiBaoDouble:profileHeb.createRoomOpts.duibaofanbei,
            scorelv: profileHeb.createRoomOpts.scoreLv,
            currencyType: null,
            settleType: null
        };

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_Mj_Heb == undefined){
            return createData;
        }
        createData.currencyType = modeTypeData.Game_Mj_Heb.CurrencyType;
        createData.settleType = modeTypeData.Game_Mj_Heb.SettleType;

        GameData.room.opts = createData;
        return createData;
    },

    saveRuleFromUI: function () {
         /** 人数 */
        if (this.player2.isChecked) {
            profileHeb.createRoomOpts.joinermax = 2;
            profileHeb.createRoomOpts.roundType = 1;
            if (this.round4.isChecked) {
                profileHeb.createRoomOpts.roundMax = 4;
                profileHeb.createRoomOpts.roundRule = 1;
            } else if (this.round8.isChecked) {
                profileHeb.createRoomOpts.roundMax = 8;
                profileHeb.createRoomOpts.roundRule = 2;
            } else if (this.round16.isChecked) {
                profileHeb.createRoomOpts.roundMax = 16;
                profileHeb.createRoomOpts.roundRule = 3;
            }
        }else if (this.player4.isChecked){
            profileHeb.createRoomOpts.joinermax = 4;
            profileHeb.createRoomOpts.roundType = 2;
            if (this.quan1.isChecked) {
                profileHeb.createRoomOpts.roundRule = 64;
                profileHeb.createRoomOpts.roundMax = 1;
            } else if (this.quan2.isChecked) {
                profileHeb.createRoomOpts.roundRule = 65;
                profileHeb.createRoomOpts.roundMax = 2;
            }
            else if (this.quan4.isChecked) {
                profileHeb.createRoomOpts.roundRule = 66;
                profileHeb.createRoomOpts.roundMax = 4;
            }
        }

        if(this.base_1.isChecked) {
            profileHeb.createRoomOpts.scoreLv = 0;
        } else if (this.base_2.isChecked) {
            profileHeb.createRoomOpts.scoreLv = 1;
        } else if (this.base_3.isChecked) {
            profileHeb.createRoomOpts.scoreLv = 2;
        } else {
            profileHeb.createRoomOpts.scoreLv = 0;
        }

        /** 点炮包三家 */
        profileHeb.createRoomOpts.dianpao = this.dianpao.isChecked ? 1:0;
        //小鸡飞蛋
        //profileHeb.createRoomOpts.xiaojifeidan = this.xiaojifeidan.isChecked ? 1:0;
        //下蛋算站立
        //profileHeb.createRoomOpts.xiadanzhanli = this.xiadanzhanli.isChecked ? 1:0;
        //** 带缺门 */
        profileHeb.createRoomOpts.quemen = this.quemen.isChecked ? 1:0;
        /** 对宝翻倍 */
        profileHeb.createRoomOpts.duibaofanbei = this.duibaofanbei.isChecked ? 1:0;
        //明宝&暗宝 0  1
        profileHeb.createRoomOpts.baotype = this.baotype.isChecked ? 0:1;

        profileHeb.saveCreateRoomOpts();
    },
    selectSpendData: function (evt) {
        this.showSpendUI();
    },
    showSpendUI: function () {
        cc.log("..mode..哈尔滨..MJ");
        var str1 = "",str2 = "";

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_Mj_Heb == undefined){
            return;
        }
        var serverConfig = configMgr.getServerConfig();
        if(serverConfig == undefined){
            return;
        }
        this.modeType = modeTypeData.Game_Mj_Heb.CurrencyType;
        switch (this.modeType){
            case gameDefine.currencyType.Currency_Card:{
                str1 = "房卡";
                this.spendData = serverConfig.roomCard[gameDefine.GameType.Game_Mj_Heb];
            }break;
            case gameDefine.currencyType.Currency_Coin:{
                str1 = "金币";
                this.spendData = serverConfig.roomCoin[gameDefine.GameType.Game_Mj_Heb];
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
        if (this.player2.isChecked) {
            number = 2;
        } else if (this.player4.isChecked) {
            number = 4;
        }

        var base = 60;
        var max = 63;
        if(this.player2.isChecked == true){
            base = 60;
            max = 63;
        } else if (this.player4.isChecked == true) {
            base = 63;
            max = 66;
        }
        var cost;
        for(var key = base;key < max;key++){
            var final = 0;
            if(this.modeType == gameDefine.currencyType.Currency_Card){
                cost = this.spendData[key +1].cost;
                final = cost[number].final;

                this.spend[key -60].string = '（'+str1+'*' + final + str2+'）';
            } else {
                cost = this.spendData[key -60].cost;
                final = this.spendData[key -60].cost;

                this.spend[key -60].string = '';
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

        if (this.player2.isChecked) {
            profileHeb.createRoomOpts.joinermax = 2;
            profileHeb.createRoomOpts.roundType = 1;
            if (this.round4.isChecked) {
                profileHeb.createRoomOpts.roundMax = 4;
                profileHeb.createRoomOpts.roundRule = 1;
            } else if (this.round8.isChecked) {
                profileHeb.createRoomOpts.roundMax = 8;
                profileHeb.createRoomOpts.roundRule = 2;
            } else if (this.round16.isChecked) {
                profileHeb.createRoomOpts.roundMax = 16;
                profileHeb.createRoomOpts.roundRule = 3;
            }
        }else if (this.player4.isChecked){
            profileHeb.createRoomOpts.joinermax = 4;
            profileHeb.createRoomOpts.roundType = 2;
            if (this.quan1.isChecked) {
                profileHeb.createRoomOpts.roundRule = 64;
                profileHeb.createRoomOpts.roundMax = 1;
            } else if (this.quan2.isChecked) {
                profileHeb.createRoomOpts.roundRule = 65;
                profileHeb.createRoomOpts.roundMax = 2;
            }
            else if (this.quan4.isChecked) {
                profileHeb.createRoomOpts.roundRule = 66;
                profileHeb.createRoomOpts.roundMax = 4;
            }
        }

        //当前选择的是几人房
        var number = 2,
            round = 0;
        if (this.player2.isChecked) {
            number = 2;
            if (this.round4.isChecked) {
                round = 0;
            } else if (this.round8.isChecked) {
                round = 1;
            } else if (this.round16.isChecked) {
                round = 2;
            }
        } else if (this.player4.isChecked) {
            number = 4;
            if (this.quan1.isChecked) {
                round = 3;
            } else if (this.quan2.isChecked) {
                round = 4;
            } else if (this.quan4.isChecked) {
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