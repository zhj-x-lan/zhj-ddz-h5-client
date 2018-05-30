var RoomHandler = require('roomHandler');
var configMgr = require('configMgr');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {

        //石狮麻将
    	round4: cc.Toggle,
        round8: cc.Toggle,
        round16: cc.Toggle,
        turn1: cc.Toggle,
        mingyou: cc.Toggle,
        anyou: cc.Toggle,

        player2: cc.Toggle,
        player3: cc.Toggle,
        player4: cc.Toggle,

        danpei: cc.Toggle,
        tongpei: cc.Toggle,
        fengtou : cc.Toggle,
        shuangjin : cc.Toggle,
        chashui : cc.Toggle,
        qg_zimo : cc.Toggle,
        qg_pinghu : cc.Toggle,

        //付费类型 1房主付费 2 AA付费 3 赢家付
        pay1_ord: cc.Toggle,
        pay2_ord: cc.Toggle,
        pay3_ord: cc.Toggle,

        payOrdNode :cc.Node,

        //分数组件
        socre1Btn: cc.Toggle,
        socre2Btn: cc.Toggle,
        scoreGrop :cc.Node,

        //游金组件
        you1Btn :cc.Toggle,
        you2Btn :cc.Toggle,
        you3Btn :cc.Toggle,
        anyouGroup :cc.Node,

        scollView :cc.ScrollView,

        spendUI:{
            default:[],
            type:[cc.Label]
        },
        drowArray:{
            default:[],
            type:[cc.Node]
        }
    },

    onLoad: function () {

        this.ToggleObjArry = {};
        this.modeType = 1;  //模式类型
        this.spendData = undefined;

        this.player2.isChecked = false;
        this.player3.isChecked = false;
        this.player4.isChecked = true;

        this.refreshUI();
        this.pushBtnsToArry();
    },
    getModeType: function(){
        return this.modeType;
    },
    pushBtnsToArry : function(){
        this.ToggleObjArry['round4'] = this.round4;
        this.ToggleObjArry['round8'] = this.round8;
        this.ToggleObjArry['round16'] = this.round16;
        this.ToggleObjArry['turn1'] = this.turn1;
        this.ToggleObjArry['mingyou'] = this.mingyou;
        this.ToggleObjArry['anyou'] = this.anyou;
        this.ToggleObjArry['player2'] = this.player2;
        this.ToggleObjArry['player3'] = this.player3;
        this.ToggleObjArry['player4'] = this.player4;
        this.ToggleObjArry['danpei'] = this.danpei;
        this.ToggleObjArry['tongpei'] = this.tongpei;
        this.ToggleObjArry['fengtou'] = this.fengtou;
        this.ToggleObjArry['shuangjin'] = this.shuangjin;
        this.ToggleObjArry['chashui'] = this.chashui;
        this.ToggleObjArry['pay1_ord'] = this.pay1_ord;
        this.ToggleObjArry['pay2_ord'] = this.pay2_ord;
        this.ToggleObjArry['pay3_ord'] = this.pay3_ord;
        this.ToggleObjArry['socre1Btn'] = this.socre1Btn;
        this.ToggleObjArry['socre2Btn'] = this.socre2Btn;
        this.ToggleObjArry['you1Btn'] = this.you1Btn;
        this.ToggleObjArry['you2Btn'] = this.you2Btn;
        this.ToggleObjArry['you3Btn'] = this.you3Btn;
        this.ToggleObjArry['qg_zimo'] = this.qg_zimo;
        this.ToggleObjArry['qg_pinghu'] = this.qg_pinghu;

        //this.openScrollViewChildListenr();
    },
    createRoom: function() {
        this.saveRuleFromUI();
        GameData.setGameType(gameDefine.GameType.Game_Mj_Shishi);

        //设置抢杠自摸和抢杠平胡
        var qg_zimoAttrib = false;
        var qg_pinghuAttrib = false;
        if(GameDataShiShi.createRoomOpts.youJin == YoujinType.Ming){
            qg_zimoAttrib = GameDataShiShi.createRoomOpts.qg_zimo;
            qg_pinghuAttrib = GameDataShiShi.createRoomOpts.qg_pinghu;
        }

        var createData = {
            gameType: GameData.client.gameType,
            roundRule: GameDataShiShi.createRoomOpts.roundRule,
            roomType: 0,
            costType: GameDataShiShi.createRoomOpts.payType,
            joinermax: GameDataShiShi.createRoomOpts.joinermax,
            clubId: 0,
            dianpao: GameDataShiShi.createRoomOpts.dianpao,
            fengtou: GameDataShiShi.createRoomOpts.fengtou,
            scoreBase: GameDataShiShi.createRoomOpts.scoreBase,
            youJin: GameDataShiShi.createRoomOpts.youJin,
            playeruid: GameData.player.uid,
            shuangjin: GameDataShiShi.createRoomOpts.shuangjin,
            water: GameDataShiShi.createRoomOpts.chashui,
            qg_zimo: qg_zimoAttrib,
            qg_pinghu: qg_pinghuAttrib,
            currencyType: null,
            settleType: null
        };

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_Mj_Shishi == undefined){
            return createData;
        }
        createData.currencyType = modeTypeData.Game_Mj_Shishi.CurrencyType;
        createData.settleType = modeTypeData.Game_Mj_Shishi.SettleType;

        return createData;
    },

    showSpendUI : function(){
        cc.log("..mode..shishiMJ");
        var str1 = "",str2 = "";

        var modeTypeData = configMgr.getModeType();
        if(modeTypeData == undefined || modeTypeData.Game_Mj_Shishi == undefined){
            return;
        }
        var serverConfig = configMgr.getServerConfig();
        if(serverConfig == undefined){
            return;
        }
        this.modeType = modeTypeData.Game_Mj_Shishi.CurrencyType;
        switch (this.modeType){
            case gameDefine.currencyType.Currency_Card:{
                str1 = "房卡";
                this.spendData = serverConfig.roomCard[gameDefine.GameType.Game_Mj_Shishi];
            }break;
            case gameDefine.currencyType.Currency_Coin:{
                str1 = "金币";
                this.spendData = serverConfig.roomCoin[gameDefine.GameType.Game_Mj_Shishi];
            }break;
        }
        if (!this.spendData) {
            cc.log('..spendData is undefined');
            return;
        }
        for (var key = 0;key < Object.keys(this.spendData).length;key++)
        {
            var final = 0;
            if(this.modeType == gameDefine.currencyType.Currency_Card){
                var cost = this.spendData[key +1].cost;
                //当前选择的是几人房
                var number = 2;
                if (this.player2.isChecked) {
                    number = 2;
                } else if (this.player3.isChecked) {
                    number = 3;
                } else if (this.player4.isChecked) {
                    number = 4;
                }
                final = cost[number].final;

                //如果选择的是AA付
                if(this.pay2_ord.isChecked){
                    final = Math.ceil(final / number);
                    str2 = "/人";
                }
            } else {
                final = this.spendData[key].cost;
            }
            cc.log("..final:"+final);
            cc.log("..key:"+key);
            //如果费用为零，显示红线
            if (final <= 0) {
                this.drowArray[key].active = true;
            } else {
                this.drowArray[key].active = false;
            }
            this.spendUI[key].string = '（'+str1+'*' + final + str2+'）';

            ///////////////////////一课隐藏
            if(key >= 3){
                var show = true;
                if(key == 3){
                    show = this.socre1Btn.isChecked ? true : false;
                } else if (key == 4){
                    show = this.socre2Btn.isChecked ? true : false;
                } else {
                    continue;
                }
                //如果不是一课，隐藏
                if(this.scoreGrop.active == false){
                    show = false;
                }
                this.spendUI[key].node.active = show;

                //如果字体显示了，红线就先跟着显示
                this.drowArray[key].active = show;

                //最终判断费用，设置红线的显隐
                if (final > 0) {
                    this.drowArray[key].active = false;
                }
            }
            ///////////////////////一课隐藏
        }
    },

    saveRuleFromUI: function(){

        if (this.round4.isChecked) {
            GameDataShiShi.createRoomOpts.roundRule = 1;
        }
        else if (this.round8.isChecked) {
            GameDataShiShi.createRoomOpts.roundRule = 2;
        }
        else if (this.round16.isChecked){
            GameDataShiShi.createRoomOpts.roundRule = 3;
        }
        if(this.turn1.isChecked){
            if(this.socre1Btn.isChecked){
                GameDataShiShi.createRoomOpts.scoreBase = 50;
                GameDataShiShi.createRoomOpts.roundRule = 4;
            } else {
                GameDataShiShi.createRoomOpts.scoreBase = 100;
                GameDataShiShi.createRoomOpts.roundRule = 5;
            }
        }else{
            GameDataShiShi.createRoomOpts.scoreBase = 0;
        }
        
        if (this.player2.isChecked) {
            GameDataShiShi.createRoomOpts.joinermax=2;
        }
        else if (this.player3.isChecked) {
            GameDataShiShi.createRoomOpts.joinermax=3;
        }
        else if (this.player4.isChecked) {
            GameDataShiShi.createRoomOpts.joinermax=4;
        }
        else {
            GameDataShiShi.createRoomOpts.joinermax=4;
        }

        if (this.mingyou.isChecked) {
            GameDataShiShi.createRoomOpts.youJin = YoujinType.Ming;
        }
        else if(this.anyou.isChecked) {
            if(this.you1Btn.isChecked) {
                GameDataShiShi.createRoomOpts.youJin = YoujinType.An1;
            } else if(this.you2Btn.isChecked) {
                GameDataShiShi.createRoomOpts.youJin = YoujinType.An2;
            } else if(this.you3Btn.isChecked) {
                GameDataShiShi.createRoomOpts.youJin = YoujinType.An3;
            }
        }
        GameDataShiShi.createRoomOpts.qg_zimo = this.qg_zimo.isChecked;
        GameDataShiShi.createRoomOpts.qg_pinghu = this.qg_pinghu.isChecked;

        if (this.danpei.isChecked) {
            GameDataShiShi.createRoomOpts.dianpao = 1;
        }
        else if(this.tongpei.isChecked) {
            GameDataShiShi.createRoomOpts.dianpao = 2;
        }
        else {
            GameDataShiShi.createRoomOpts.dianpao = 2;
        }

        GameDataShiShi.createRoomOpts.payType = 1;

        if(this.payOrdNode.active){
          if (this.pay1_ord.isChecked) {
              GameDataShiShi.createRoomOpts.payType = 1;
          }
          else if (this.pay2_ord.isChecked) {
              GameDataShiShi.createRoomOpts.payType = 2;
          }
          else if (this.pay3_ord.isChecked) {
              GameDataShiShi.createRoomOpts.payType = 3;
          }
        }

        if(this.fengtou.isChecked){
            GameDataShiShi.createRoomOpts.fengtou = true;
        } else {
            GameDataShiShi.createRoomOpts.fengtou = false;
        }

        if(this.shuangjin.isChecked){
            GameDataShiShi.createRoomOpts.shuangjin = true;
        } else {
            GameDataShiShi.createRoomOpts.shuangjin = false;
        }

        if(this.chashui.isChecked){
            GameDataShiShi.createRoomOpts.chashui = true;
        } else {
            GameDataShiShi.createRoomOpts.chashui = false;
        }

        GameDataShiShi.saveCreateRoomOpts();
    },
    refreshUI : function(){

        this.round4.isChecked = GameDataShiShi.createRoomOpts.roundRule==1?true:false;
        this.round8.isChecked = GameDataShiShi.createRoomOpts.roundRule==2?true:false;
        this.round16.isChecked = GameDataShiShi.createRoomOpts.roundRule==3?true:false;
        this.turn1.isChecked = GameDataShiShi.createRoomOpts.roundRule==4 || GameDataShiShi.createRoomOpts.roundRule==5?true:false;

        if(this.turn1.isChecked){
            this.socre1Btn.isChecked = GameDataShiShi.createRoomOpts.scoreBase==50?true:false;
            this.socre2Btn.isChecked=  GameDataShiShi.createRoomOpts.scoreBase==100?true:false;
        }else{
            this.socre1Btn.isChecked = true;
            this.socre2Btn.isChecked = false;
        }

        this.pay1_ord.isChecked = GameDataShiShi.createRoomOpts.payType==1?true:false;
        this.pay2_ord.isChecked = GameDataShiShi.createRoomOpts.payType==2?true:false;
        this.pay3_ord.isChecked = GameDataShiShi.createRoomOpts.payType==3?true:false;

        this.player2.isChecked = GameDataShiShi.createRoomOpts.joinermax ==2?true:false;
        this.player3.isChecked = GameDataShiShi.createRoomOpts.joinermax ==3?true:false;
        this.player4.isChecked = GameDataShiShi.createRoomOpts.joinermax ==4?true:false;

        this.danpei.isChecked = GameDataShiShi.createRoomOpts.dianpao ==1?true:false;
        this.tongpei.isChecked = GameDataShiShi.createRoomOpts.dianpao ==1?false:true;

        this.mingyou.isChecked = GameDataShiShi.createRoomOpts.youJin ==YoujinType.Ming?true:false;
        this.anyou.isChecked = GameDataShiShi.createRoomOpts.youJin ==YoujinType.Ming?false:true;
        
        if(this.anyou.isChecked){
            this.you1Btn.isChecked = GameDataShiShi.createRoomOpts.youJin ==YoujinType.An1?true:false;
            this.you2Btn.isChecked = GameDataShiShi.createRoomOpts.youJin ==YoujinType.An2?true:false;
            this.you3Btn.isChecked = GameDataShiShi.createRoomOpts.youJin ==YoujinType.An3?true:false;
        }

        var show = false;
        if(this.mingyou.isChecked){
            show = true;
        }
        this.qg_zimo.node.active = show;
        this.qg_pinghu.node.active = show;

        this.fengtou.isChecked = GameDataShiShi.createRoomOpts.fengtou;
        this.shuangjin.isChecked = GameDataShiShi.createRoomOpts.shuangjin;
        this.chashui.isChecked = GameDataShiShi.createRoomOpts.chashui;
        this.qg_zimo.isChecked = GameDataShiShi.createRoomOpts.qg_zimo;
        this.qg_pinghu.isChecked = GameDataShiShi.createRoomOpts.qg_pinghu;

        //一课相关控件显隐
        this.scoreGrop.active = this.turn1.isChecked;
        this.spendUI[3].node.active = this.turn1.isChecked;
        this.spendUI[4].node.active = this.turn1.isChecked;
        //this.drowArray[3].active = this.turn1.isChecked;
        //this.drowArray[4].active = this.turn1.isChecked;

        //暗游相关控件显隐
        this.anyouGroup.active = this.anyou.isChecked;

        this.showSpendUI();
    },
    youjinActive : function(){
        this.anyouGroup.active = this.anyou.isChecked;

        //控制抢杠自摸和抢杠平胡显隐
        var show = false;
        if(this.mingyou.isChecked){
            show = true;
        }
        this.qg_zimo.node.active = show;
        this.qg_pinghu.node.active = show;
    },
    yikeActive : function(){
        cc.log("..yi..ke");
        this.scoreGrop.active = this.turn1.isChecked;
        this.showSpendUI();
    },
    openScrollViewChildListenr : function(){
     for(var key in this.ToggleObjArry){
          this.ToggleObjArry[key].node.on(cc.Node.EventType.TOUCH_START,this.closeScrollView,this);
          this.ToggleObjArry[key].node.on(cc.Node.EventType.TOUCH_MOVE,this.closeScrollView,this);
          this.ToggleObjArry[key].node.on(cc.Node.EventType.TOUCH_END,this.openScrollView,this);
          this.ToggleObjArry[key].node.on(cc.Node.EventType.TOUCH_CANCEL,this.openScrollView,this);
      }
    },
    offScrollViewChildListenr : function(){
        for(var key in this.ToggleObjArry){
            this.ToggleObjArry[key].node.off(cc.Node.EventType.TOUCH_START,this.closeScrollView,this);
            this.ToggleObjArry[key].node.off(cc.Node.EventType.TOUCH_MOVE,this.closeScrollView,this);
            this.ToggleObjArry[key].node.off(cc.Node.EventType.TOUCH_END,this.openScrollView,this);
            this.ToggleObjArry[key].node.off(cc.Node.EventType.TOUCH_CANCEL,this.openScrollView,this);
        }
    },
    closeScrollView: function(){
      this.scollView.node.off(cc.Node.EventType.TOUCH_MOVE, this.scollView._onTouchMoved, this.scollView, true);
    },
    openScrollView: function(){
      this.scollView.node.on(cc.Node.EventType.TOUCH_MOVE, this.scollView._onTouchMoved, this.scollView, true);
    }
});