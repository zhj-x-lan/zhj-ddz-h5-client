var RoomHandler = require('roomHandler');
var configMgr = require('configMgr');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        layer_create: cc.Node,
        layer_join: cc.Node,

        OrdScrollView: cc.ScrollView,

        //规则类型预制体
        MjTianJin: cc.Prefab,
        MjShiShi: cc.Prefab,
        MjHuanDian: cc.Prefab,
        MjHongZhong: cc.Prefab,
        MjChangChun: cc.Prefab,
        MjHeb: cc.Prefab,
        DDZTianJin: cc.Prefab,
        DDZ: cc.Prefab,
        NiuNiu: cc.Prefab,
        TDK: cc.Prefab,
        ShiSanShui: cc.Prefab,
        PDK: cc.Prefab,

        //游戏类型
        gameTypes: {
            default: [],
            type: [cc.Sprite]
        },

        createBtns: cc.Node,
        helpBtns: cc.Node,
        DKFBtns: cc.Node,
        //俱乐部 、普通房
        roomTypeToggle: cc.Toggle,

        //为确保屏蔽不会出现失误，把每个游戏类型按钮都细化分离出来
        //麻将
        majiangNode: cc.Node,
        tianjinBtn: cc.Node,
        shishiBtn: cc.Node,
        huadianBtn: cc.Node,
        hongzhongBtn: cc.Node,
        changchunBtn:cc.Node,
        hebBtn:cc.Node,
        //斗地主
        ddzNode: cc.Node,
        ddzBtn: cc.Node,
        TJddzBtn: cc.Node,
        //牛牛
        niuniuNode: cc.Node,
        niuniuBtn: cc.Node,
        //填大坑
        tdkNode: cc.Node,
        tiandakengBtn: cc.Node,
        //十三水
        sssNode: cc.Node,
        shisanshuiBtn: cc.Node,
        
        pdkNode: cc.Node,
        paodekuaiBtn: cc.Node,
    },

    onLoad: function () {
        this.emageArray = [
            ["resources/home/create/majiangbiaoqian01.png", "resources/home/create/doudizhubiaoqian01.png", "resources/home/create/niuniubiaoqian01.png", 
            "resources/home/create/tiandakengbiaoqian01.png", "resources/home/create/shisanshuibiaoqian01.png", "resources/home/create/paodekuaibiaoqian01.png"],
            ["resources/home/create/majiangbiaoqian02.png", "resources/home/create/doudizhubiaoqian02.png", "resources/home/create/niuniubiaoqian02.png", 
            "resources/home/create/tiandakengbiaoqian02.png", "resources/home/create/shisanshuibiaoqian02.png", "resources/home/create/paodekuaibiaoqian02.png"]
        ];

        this.currentItem = undefined;
        this.currentGameType = -1;
        this.btnGameType = GameData.createRoom.gameType || 0;
        this.leftBtnFirstArray = GameData.createRoom.leftGameType || [];

        this.addTouchEvent();
        this.GameTypeVisible();
        this.refreshUIRule();
    },
    addTouchEvent: function () {
        for (let i = 0; i < this.gameTypes.length; i++) {
            var self = this;
            this.gameTypes[i].node.on(cc.Node.EventType.TOUCH_END, function (event) {
                self.showGameType(i);
            });
        }
    },

    //控制游戏类型选项是否开启
    GameTypeVisible: function() {
        //初始化隐藏所有游戏类型按钮
        this.tianjinBtn.active = false;     //天津麻将
        this.shishiBtn.active = false;      //石狮麻将 
        this.huadianBtn.active = false;     //桦甸麻将
        this.hongzhongBtn.active = false;   //红中麻将
        this.changchunBtn.active = false;   //长春麻将
        this.hebBtn.active = false;         //哈尔滨麻将
        this.ddzBtn.active = false;         //经典斗地主
        this.TJddzBtn.active = false;       //天津斗地主
        this.niuniuBtn.active = false;      //牛牛       
        this.tiandakengBtn.active = false;  //填大坑    
        this.shisanshuiBtn.active = false;  //十三水
        this.paodekuaiBtn.active = false;

        var gameList = configMgr.getGameVisible();
        for (var i = 0; i < gameList.length; i++) {
            switch(gameList[i]){
                case gameDefine.GameType.Game_Mj_Tianjin: this.tianjinBtn.active = true; break;
                case gameDefine.GameType.Game_Mj_Shishi: this.shishiBtn.active = true; break;
                case gameDefine.GameType.Game_Poker_13shui: this.shisanshuiBtn.active = true; break;
                case gameDefine.GameType.Game_niu_niu: this.niuniuBtn.active = true; break;
                case gameDefine.GameType.Game_MJ_HuaDian: this.huadianBtn.active = true; break;
                case gameDefine.GameType.Game_TDK: this.tiandakengBtn.active = true; break;
                case gameDefine.GameType.Game_Poker_TianjinDDZ: this.TJddzBtn.active = true; break;
                case gameDefine.GameType.Game_Mj_HZ: this.hongzhongBtn.active = true; break;
                case gameDefine.GameType.Game_Poker_DDZ: this.ddzBtn.active = true; break;
                case gameDefine.GameType.Game_Mj_CC: this.changchunBtn.active = true; break;
                case gameDefine.GameType.Game_Mj_Heb: this.hebBtn.active = true; break;
                case gameDefine.GameType.Game_Poker_paodekuai: this.paodekuaiBtn.active = true; break;
            }
        }

        var up_first = -1;
        var control;
        var b_number = 0;
        var b_distance = this.gameTypes[0].node.width;
        var b_initX = this.gameTypes[0].node.x;

        for(var ii = 0;ii < this.gameTypes.length;ii++){
            var show = false;
            switch (ii){
                case 0:{
                    control = this.majiangNode;
                }break;
                case 1:{
                    control = this.ddzNode;
                }break;
                case 2:{
                    control = this.niuniuNode;
                }break;
                case 3:{
                    control = this.tdkNode;
                }break;
                case 4:{
                    control = this.sssNode;
                }break;
                case 5:{
                    control = this.pdkNode;
                }
            }
            if(!control){
                continue;
            }

            //设置左边
            var left_first = -1;
            var s_number = 0;
            var s_distance = control.getChildren()[0].height;
            var s_initY = control.getChildren()[0].y;

            for(var jj = 0;jj < control.getChildrenCount();jj++){
                var child = control.getChildren()[jj];
                if(child){
                    if(child.active == false){
                        continue;
                    }
                    show = true;
                    //设置位置
                    child.y = s_initY - s_number*s_distance;
                    s_number++;
                    //保存左侧第一个按钮的下标

                    if(this.leftBtnFirstArray[ii] == undefined){
                        this.leftBtnFirstArray[ii] = 0;
                    }
                    if(control.getChildren()[this.leftBtnFirstArray[ii]].active == false)
                    {
                        if(left_first == -1){
                            left_first = jj;
                            this.leftBtnFirstArray[ii] = left_first;
                        }
                    }
                }
            }
            control.active = show;
            this.gameTypes[ii].node.active = show;

            //设置上边
            if(show){
                this.gameTypes[ii].node.x = b_initX + b_number*b_distance;
                b_number++;
                if(up_first == -1){
                    up_first = ii;
                }
            }
        }
        if(this.gameTypes[this.btnGameType].node.active == false){
            this.btnGameType = up_first;
        }
        this.showGameType(this.btnGameType);
    },
    showGameType: function (TabIndex) {
        this.btnGameType = TabIndex;
        var index = this.leftBtnFirstArray[TabIndex];

        //显示游戏页签类型
        for (var ii = 0;ii < this.gameTypes.length;ii++) {

            var emageIndex = 0;     //0：未选状态，1：选中状态
            if(ii == TabIndex){
                emageIndex = 1;
            }
            var textureStr = this.emageArray[emageIndex][ii];
            var textures = cc.textureCache.addImage(cc.url.raw(textureStr));
            this.gameTypes[ii].spriteFrame = null;
            this.gameTypes[ii].spriteFrame = new cc.SpriteFrame(textures);
        }

        //刷新左侧button显示
        var content = cc.find('panel/littleType/view/content', this.layer_create);
        var child = content.children;
        for (var j = 0; j < child.length; j++) {
            if (j == TabIndex) {
                child[j].active = true;
                this.selectRoomRule(index);
            } else {
                child[j].active = false;
            }
        }
    },
    roomTypeClick: function (evt, data) {
        cc.log('data = ', data);
        this.selectRoomRule(data);
    },
    //刷新左侧button Index显示
    selectRoomRule: function (index) {

        var clickData = parseInt(index);
        var TabIndex = this.btnGameType;
        cc.log("..TabIndex:"+TabIndex+"--index:"+index);

        var btnNode;
        var gameType;
        switch (TabIndex) {
            case 0: {
                btnNode = cc.find('panel/littleType/view/content/majiang', this.layer_create);
                switch (clickData){
                    case 0:{
                        gameType = gameDefine.GameType.Game_Mj_Tianjin;
                    }break;
                    case 1:{
                        gameType = gameDefine.GameType.Game_Mj_Shishi;
                    }break;
                    case 2:{
                        gameType = gameDefine.GameType.Game_MJ_HuaDian;
                    }break;
                    case 3:{
                        gameType = gameDefine.GameType.Game_Mj_HZ;
                    }break;
                    case 4:{
                        gameType = gameDefine.GameType.Game_Mj_CC;
                    }break;
                    case 5:{
                        gameType = gameDefine.GameType.Game_Mj_Heb;
                    }break;
                }
            }break;
            case 1: {
                btnNode = cc.find('panel/littleType/view/content/doudizhu', this.layer_create);
                switch (clickData) {
                    case 0: {
                        gameType = gameDefine.GameType.Game_Poker_DDZ;
                    }break;
                    case 1: {
                        gameType = gameDefine.GameType.Game_Poker_TianjinDDZ;
                    }break;
                }
            }break;
            case 2: {
                btnNode = cc.find('panel/littleType/view/content/niuniu', this.layer_create);
                switch (clickData) {
                    case 0: {
                        gameType = gameDefine.GameType.Game_niu_niu;
                    }break;
                }
            }break;
            case 3: {
                btnNode = cc.find('panel/littleType/view/content/tiandakeng', this.layer_create);
                switch (clickData) {
                    case 0: {
                        gameType = gameDefine.GameType.Game_TDK;
                    }break;
                }
            }break;
            case 4: {
                btnNode = cc.find('panel/littleType/view/content/shisanshui', this.layer_create);
                switch (clickData) {
                    case 0: {
                        gameType = gameDefine.GameType.Game_Poker_13shui;
                    }break;
                }
            }break;
            case 5: {
                btnNode = cc.find('panel/littleType/view/content/paodekuai', this.layer_create);
                switch (clickData) {
                    case 0: {
                        gameType = gameDefine.GameType.Game_Poker_paodekuai;
                    }break;
                }
            }
            default:break;
        }
        if(gameType == this.currentGameType || gameType == undefined){
            return;
        }
        this.currentGameType = gameType;   //设置当前显示的游戏类型

        var children = btnNode.children;
        for (var ii = 0;ii < children.length;ii++)
        {
            var btnShow = true;
            if (clickData == ii)
            {
                btnShow = false;
            }
            var btn = children[ii].getComponent('cc.Button');
            btn.interactable = btnShow;
        }
        this.leftBtnFirstArray[TabIndex] = clickData;   //保存偏好显示

        GameData.createRoom.gameType = TabIndex;
        GameData.createRoom.leftGameType = this.leftBtnFirstArray;

        //刷新选择规则显示
        this.updateUISelectRule();
    },
    updateUISelectRule: function(){
        cc.log("..currentGameType:"+this.currentGameType);

        switch (this.currentGameType){
            case gameDefine.GameType.Game_Mj_Tianjin:{
                this.currentItem = cc.instantiate(this.MjTianJin);
            }break;
            case gameDefine.GameType.Game_Mj_Shishi:{
                this.currentItem = cc.instantiate(this.MjShiShi);
            }break;
            case gameDefine.GameType.Game_MJ_HuaDian:{
                this.currentItem = cc.instantiate(this.MjHuanDian);
            }break;
            case gameDefine.GameType.Game_Mj_HZ:{
                this.currentItem = cc.instantiate(this.MjHongZhong);
            }break;
            case gameDefine.GameType.Game_Mj_CC:{
                this.currentItem = cc.instantiate(this.MjChangChun);
            }break;
            case gameDefine.GameType.Game_Mj_Heb:{
                this.currentItem = cc.instantiate(this.MjHeb);
            }break;
            case gameDefine.GameType.Game_Poker_TianjinDDZ:{
                this.currentItem = cc.instantiate(this.DDZTianJin);
            }break;
            case gameDefine.GameType.Game_Poker_DDZ:{
                this.currentItem = cc.instantiate(this.DDZ);
            }break;
            case gameDefine.GameType.Game_niu_niu:{
                this.currentItem = cc.instantiate(this.NiuNiu);
            }break;
            case gameDefine.GameType.Game_TDK:{
                this.currentItem = cc.instantiate(this.TDK);
            }break;
            case gameDefine.GameType.Game_Poker_13shui:{
                this.currentItem = cc.instantiate(this.ShiSanShui);
            }break;
            case gameDefine.GameType.Game_Poker_paodekuai:{
                this.currentItem = cc.instantiate(this.PDK);
            }break;
        }
        if(this.currentItem == undefined){
            cc.log("..item is undefined!");
            return;
        }
        this.OrdScrollView.scrollToTop(0.1);

        var content = this.OrdScrollView.content;
        if(content.getChildrenCount() > 0){
            content.removeAllChildren(true);
        }
        content.addChild(this.currentItem);

        //显示代开房相关控件
        this.refreshAgentRoomBtn(true);
    },
    refreshAgentRoomBtn: function (show) {

        var modeType;
        var modeTypeData = configMgr.getModeType();
        if(modeTypeData){
            switch (this.currentGameType){
                case gameDefine.GameType.Game_Mj_Tianjin:{
                    if(modeTypeData.Game_Mj_Tianjin) modeType = modeTypeData.Game_Mj_Tianjin.CurrencyType;
                }break;
                case gameDefine.GameType.Game_Mj_Shishi:{
                    if(modeTypeData.Game_Mj_Shishi) modeType = modeTypeData.Game_Mj_Shishi.CurrencyType;
                }break;
                case gameDefine.GameType.Game_MJ_HuaDian:{
                    if(modeTypeData.Game_MJ_HuaDian) modeType = modeTypeData.Game_MJ_HuaDian.CurrencyType;
                }break;
                case gameDefine.GameType.Game_Mj_HZ:{
                    if(modeTypeData.Game_Mj_HZ) modeType = modeTypeData.Game_Mj_HZ.CurrencyType;
                }break;
                case gameDefine.GameType.Game_Mj_CC:{
                    if(modeTypeData.Game_Mj_CC) modeType = modeTypeData.Game_Mj_CC.CurrencyType;
                }break;
                case gameDefine.GameType.Game_Mj_Heb:{
                    if(modeTypeData.Game_Mj_Heb) modeType = modeTypeData.Game_Mj_Heb.CurrencyType;
                }break;
                case gameDefine.GameType.Game_Poker_TianjinDDZ:{
                    if(modeTypeData.Game_Poker_TianjinDDZ) modeType = modeTypeData.Game_Poker_TianjinDDZ.CurrencyType;
                }break;
                case gameDefine.GameType.Game_Poker_DDZ:{
                    if(modeTypeData.Game_Poker_DDZ) modeType = modeTypeData.Game_Poker_DDZ.CurrencyType;
                }break;
                case gameDefine.GameType.Game_niu_niu:{
                    if(modeTypeData.Game_niu_niu) modeType = modeTypeData.Game_niu_niu.CurrencyType;
                }break;
                case gameDefine.GameType.Game_TDK:{
                    if(modeTypeData.Game_TDK) modeType = modeTypeData.Game_TDK.CurrencyType;
                }break;
                case gameDefine.GameType.Game_Poker_13shui:{
                    if(modeTypeData.Game_Poker_13shui) modeType = modeTypeData.Game_Poker_13shui.CurrencyType;
                }break;
                case gameDefine.GameType.Game_Poker_paodekuai:{
                    if(modeTypeData.Game_Poker_paodekuai) modeType = modeTypeData.Game_Poker_paodekuai.CurrencyType;
                }break;
            }
        }

        //刷新代开房按钮显示
        if (modeType != gameDefine.currencyType.Currency_Coin
            && show == true
            && GameData.player.club
            && Object.keys(GameData.player.club).length >= 0
            && GameData.player.club.clubAdmin == 2)
        {
            //代开房按钮显示
            this.DKFBtns.active = true;
            this.roomTypeToggle.node.active = true;
        } else {
            this.DKFBtns.active = false;
            this.roomTypeToggle.node.active = false;
            this.roomTypeToggle.isChecked = false;
        }
    },
    refreshUIRule: function(){
        if(GameData.createRoom.roomType == 1){
            this.roomTypeToggle.isChecked = false;
        }else if (GameData.createRoom.roomType == 2){
            this.roomTypeToggle.isChecked = true;
        }
    },
    saveUIRule: function(){
        GameData.createRoom.roomType = this.roomTypeToggle.isChecked ? 2 : 1;
        GameData.saveCommonCreateRoomRule();
    },
    //创建房间 类型：1：普通，2：代开
    selectGameOk: function (evt,data) {

        if (inCD(3000)) return;
        this.saveUIRule();

        var clubId = 0;
        if (GameData.player.club
            && Object.keys(GameData.player.club).length > 0)
        {
            clubId = GameData.player.club.clubID;
        }
        if(data == 2 && clubId <= 0){
            createMessageBox("您还没有俱乐部!不能代开房间。", function () {});
            return;
        }

        var createData = {};
        switch (this.currentGameType){
            case gameDefine.GameType.Game_Mj_Tianjin:{
                createData = this.currentItem.getComponent('createRoom').createRoom();
            }break;
            case gameDefine.GameType.Game_Mj_Shishi:{
                createData = this.currentItem.getComponent('createRoom_shishi').createRoom();
            }break;
            case gameDefine.GameType.Game_MJ_HuaDian:{
                createData = this.currentItem.getComponent('createRoom_huadian').createRoom();
            }break;
            case gameDefine.GameType.Game_Mj_HZ:{
                createData = this.currentItem.getComponent('createRoom-hz').createRoom();
            }break;
            case gameDefine.GameType.Game_Mj_CC:{
                createData = this.currentItem.getComponent('createRoom_changchun').createRoom();
            }break;
            case gameDefine.GameType.Game_Mj_Heb:{
                createData = this.currentItem.getComponent('createRoom_heb').createRoom();
            }break;
            case gameDefine.GameType.Game_Poker_TianjinDDZ:{
                createData = this.currentItem.getComponent('TJDDZ-createRoom').createRoom();
            }break;
            case gameDefine.GameType.Game_Poker_DDZ:{
                createData = this.currentItem.getComponent('DDZ-createRoom').createRoom();
            }break;
            case gameDefine.GameType.Game_niu_niu:{
                createData = this.currentItem.getComponent('NN-createRoom').createRoom();
            }break;
            case gameDefine.GameType.Game_TDK:{
                createData = this.currentItem.getComponent('TDK-createRoom').createRoom();
            }break;
            case gameDefine.GameType.Game_Poker_13shui:{
                createData = this.currentItem.getComponent('SSSCreateRoom').createRoom();
            }break;
            case gameDefine.GameType.Game_Poker_paodekuai:{
                createData = this.currentItem.getComponent('PDK-createRoom').createRoom();
            }break;
        }
        if(createData == undefined || Object.keys(createData).length <= 0){
            cc.log("..createData is undefined or null.");
            return;
        }
        createData.clubId = clubId;
        createData.roomType = GameData.createRoom.roomType;

        //如果点击是代开房，将付费类型设置为代开房付费
        if(data == 2){
            createData.costType = gameDefine.CostType.Cost_Agent;
        }
        //如果是金币场，设置付费类型为台费
        if(createData.currencyType == gameDefine.currencyType.Currency_Coin){
            createData.costType = gameDefine.CostType.Cost_Table;
        }
        console.log('..createData = ' + JSON.stringify(createData));
        RoomHandler.createRoom(createData);
    },
    openPlayIntro: function (evt) {

        switch (this.currentGameType){
            case gameDefine.GameType.Game_Mj_Tianjin:{
                openView('PlayIntroPanel');
            }break;
            case gameDefine.GameType.Game_Mj_Shishi:{
                 return;
            }break;
            case gameDefine.GameType.Game_MJ_HuaDian:{
                openView('PlayIntroPanel_HD', gameDefine.GameType.Game_MJ_HuaDian);
            }break;
            case gameDefine.GameType.Game_Mj_HZ:{
                openView('PlayIntroPanel_HZ', gameDefine.GameType.Game_Mj_HZ);
            }break;
            case gameDefine.GameType.Game_Mj_CC:{
                openView('PlayIntroPanel_CC', gameDefine.GameType.Game_Mj_CC);
            }break;
            case gameDefine.GameType.Game_Mj_Heb:{
                openView('PlayIntroPanel_Heb', gameDefine.GameType.Game_Mj_Heb);
            }break;
            case gameDefine.GameType.Game_Poker_TianjinDDZ:{

                openView('TJDDZ-PlayIntroPanel', gameDefine.GameType.Game_Poker_TianjinDDZ);
            }break;
            case gameDefine.GameType.Game_Poker_DDZ:{
                openView('DDZ-PlayIntroPanel', gameDefine.GameType.Game_Poker_DDZ);
            }break;
            case gameDefine.GameType.Game_niu_niu:{
                openView('NiuniuPlayIntroPanel', gameDefine.GameType.Game_niu_niu);
            }break;
            case gameDefine.GameType.Game_TDK:{
                openView('TDKPlayIntroPanel', gameDefine.GameType.Game_TDK);
            }break;
            case gameDefine.GameType.Game_Poker_13shui:{
                openSSSView('poker13PlayIntroPanel');
            }break;
            case gameDefine.GameType.Game_Poker_paodekuai:{
                openView('PDK-PlayIntroPanel', gameDefine.GameType.Game_Poker_paodekuai);
            }break;
        }
    },
    backToHome: function (evt) {
        for (let i = 0; i < this.gameTypes.length; i++) {
            var self = this;
            this.gameTypes[i].node.off(cc.Node.EventType.TOUCH_END, function (event) {
                self.showGameType(i);
            });
        }
        this.layer_create.active = false;
        this.layer_join.active = false;
    }
});