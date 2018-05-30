var RoomHandler = require('roomHandler');
var gameDefine = require('gameDefine');
var configMgr = require('configMgr');
cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {
        this.refreshNiuNiuUI();
    },
    createRoom: function () {
        this.saveNiuNiuRule();
        profileNiuNiu.saveCreateRoomOpts();
        GameData.setGameType(gameDefine.GameType.Game_niu_niu);

        var createData = profileNiuNiu.createRoomOpts;

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_niu_niu == undefined){
            return createData;
        }
        createData.currencyType = modeTypeData.Game_niu_niu.CurrencyType;
        createData.settleType = modeTypeData.Game_niu_niu.SettleType;

        return createData;
    },
    saveNiuNiuRule : function () {
        var panel = this.node;
        // 回合数
        var roundToggleArry = [
            cc.find("/round/ToggleGroup/round10",panel).getComponent(cc.Toggle),
            cc.find("/round/ToggleGroup/round20",panel).getComponent(cc.Toggle),
            cc.find("/round/ToggleGroup/round30",panel).getComponent(cc.Toggle),
        ]
        var selectedRooundType = 10;
        for (var i = 0; i < roundToggleArry.length; i++) {
            if (roundToggleArry[i].isChecked) {
                selectedRooundType = (i + 1)*10;
            }
        }
        profileNiuNiu.createRoomOpts.roundMax = selectedRooundType;
        profileNiuNiu.createRoomOpts.roundRule = selectedRooundType/10;

        // 坐庄方式
        var bossType = 0;
        var bossTypes = [
            cc.find("/bossType/ToggleGroup/boss1",panel).getComponent(cc.Toggle),
            cc.find("/bossType/ToggleGroup/boss2",panel).getComponent(cc.Toggle),
            cc.find("/bossType/ToggleGroup/boss3",panel).getComponent(cc.Toggle),
        ]

        for (var i = 0; i < bossTypes.length; i++) {
            if (bossTypes[i].isChecked) {
                bossType = i + 1;
            }
        }
        profileNiuNiu.createRoomOpts.bossType = bossType;

        //下注的方式
        var multipleType = 0;
        var multipleTypes = [
            cc.find("/multipleType/ToggleGroup/multiple1",panel).getComponent(cc.Toggle),
            cc.find("/multipleType/ToggleGroup/multiple2",panel).getComponent(cc.Toggle),
        ]

        for (var i = 0; i < multipleTypes.length; i++) {
            if (multipleTypes[i].isChecked) {
                multipleType = i;
            }
        }
        profileNiuNiu.createRoomOpts.multipleType = multipleType;

        // 支付方式
        var cost_type = 0;
        var cost_types = [
            cc.find("/rule_roomPay/toggleGroup/roomOwner",panel).getComponent(cc.Toggle),
            cc.find("/rule_roomPay/toggleGroup/AA",panel).getComponent(cc.Toggle),
            cc.find("/rule_roomPay/toggleGroup/winPlayer",panel).getComponent(cc.Toggle),
        ]
        for (var i = 0; i < cost_types.length; i++) {
            if (cost_types[i].isChecked) {
                cost_type = i + 1;
            }
        }
        profileNiuNiu.createRoomOpts.costType = cost_type;
    },

    refreshNiuNiuUI: function () {

        var panel = this.node;
        // 回合数
        var roundToggleArry = [
            cc.find("/round/ToggleGroup/round10",panel).getComponent(cc.Toggle),
            cc.find("/round/ToggleGroup/round20",panel).getComponent(cc.Toggle),
            cc.find("/round/ToggleGroup/round30",panel).getComponent(cc.Toggle),
        ]

        for (var i = 0; i < roundToggleArry.length; i++) {
            roundToggleArry[i].isChecked = ((i + 1) ==  profileNiuNiu.createRoomOpts.roundMax/10);
        }

        // 坐庄方式
        var bossType = 0;
        var bossTypes = [
            cc.find("/bossType/ToggleGroup/boss1",panel).getComponent(cc.Toggle),
            cc.find("/bossType/ToggleGroup/boss2",panel).getComponent(cc.Toggle),
            cc.find("/bossType/ToggleGroup/boss3",panel).getComponent(cc.Toggle),
        ]

        for (var i = 0; i < bossTypes.length; i++) {
            bossTypes[i].isChecked = ((i + 1) == profileNiuNiu.createRoomOpts.bossType);

        }

        //下注的方式

        var multipleTypes = [
            cc.find("/multipleType/ToggleGroup/multiple1",panel).getComponent(cc.Toggle),
            cc.find("/multipleType/ToggleGroup/multiple2",panel).getComponent(cc.Toggle),
        ]

        for (var i = 0; i < multipleTypes.length; i++) {

            multipleTypes[i].isChecked = ((i ) == profileNiuNiu.createRoomOpts.multipleType);
        }

        // 支付方式
        profileNiuNiu.createRoomOpts.costType > 3 ? profileNiuNiu.createRoomOpts.costType = 1 : null;
        var cost_types = [
            cc.find("/rule_roomPay/toggleGroup/roomOwner",panel).getComponent(cc.Toggle),
            cc.find("/rule_roomPay/toggleGroup/AA",panel).getComponent(cc.Toggle),
            cc.find("/rule_roomPay/toggleGroup/winPlayer",panel).getComponent(cc.Toggle),
        ]
        for (var i = 0; i < cost_types.length; i++) {

            cost_types[i].isChecked = ((i + 1) == profileNiuNiu.createRoomOpts.costType);
        }
    }
});
