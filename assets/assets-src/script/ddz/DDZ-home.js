var RoomHandler = require('roomHandler');
var soundMngr = require('SoundMngr');
cc.Class({
    extends: cc.Component,

    properties: {
        layer_join: cc.Node,
        layer_ddz: cc.Node,

        // home layer
        head_node: cc.Node,
        head_name: cc.Label,
        head_identify_num: cc.Label,
        head_money_num: cc.Label,
        head_gold_num: cc.Label,
        head_friend_num: cc.Label,
        roomcard_num: cc.Label,
        create_btn: cc.Button,
        join_btn: cc.Button,
        back_btn: cc.Button,
        fangkaAdd: cc.Button,
        // create layer


        //付费方式 1房主付，2AA制，3赢家付,4代开房 俱乐部
        pay1_club: cc.Toggle,
        pay2_club: cc.Toggle,
        pay3_club: cc.Toggle,
        pay4_club: cc.Toggle,

        //付费方式 1房主付，2AA制，3赢家付 普通
        pay1: cc.Toggle,
        pay2: cc.Toggle,
        pay3: cc.Toggle,

        //-------------------------------end------------------//

        maskBtn: cc.Node,

        //俱乐部相关控件
        selectClubBtn: cc.Button,
        addBtn: cc.Button,
        clubName: cc.Label,
        diamondsNum: cc.Label,

        //代理房间Btn
        agentBtn: cc.Node,

        // join layer
        room_number: cc.String,
        room_number_bg: cc.Sprite,

        playerTemplate: cc.Prefab,
        // fangkaAddClick: cc.Prefab,
        paoMadengLabel: cc.Label,
        _paoMadengX: 0,

        hintNode: cc.Node,
        //主界面底部相关按钮控件
        activeBtnNode: cc.Node,
        activeRedPoint: cc.Node
    },

    onShiSanShui: function () {
        cc.director.loadScene('SSSHome');
    },

    // use this for initialization
    onLoad: function () {
        //UI数据
        this.room_number = '';
        //房卡
        this.roomcard_num.string = GameData.player.card;
        //俱乐部数据
        if (GameData.player.club && Object.keys(GameData.player.club).length > 0) {
            //console.log('222222222222222222222222');
            if (GameData.playerCurrClubId == undefined || GameData.playerCurrClubId == null) {
                GameData.playerCurrClubId = GameData.getClubDataByIndex(0).club_id;
            }
            if (Object.keys(GameData.player.club).length != 0) {
                //console.log("GameData.playerCurrClubId  "+GameData.playerCurrClubId);
                if (GameData.getClubDataByClubId(GameData.playerCurrClubId) == null) {
                    return;
                }
                this.clubName.string = GameData.getClubDataByClubId(GameData.playerCurrClubId).clubName;
                this.diamondsNum.string = GameData.getClubDataByClubId(GameData.playerCurrClubId).diamond;
            }
        }
        if (isChinese(GameData.player.name)) {
            this.head_name.string = getShortStr(GameData.player.name, 5);
        } else {
            this.head_name.string = getShortStr(GameData.player.name, 10);
        }
        this.head_identify_num.string = GameData.player.uid;
        this.head_money_num.string = GameData.player.money;

        var headNode = cc.instantiate(this.playerTemplate);
        headNode.getComponent('playerTemplate').setPlayer(GameData.player);
        headNode.getComponent('playerTemplate').setName('');
        headNode.getComponent('playerTemplate').setIsPlayerIcon(false);
        headNode.getComponent('playerTemplate').setHeadIcon(GameData.player.headimgurl);
        this.head_node.addChild(headNode);
        this.runPaoMadeng();

        if (GameData.player.roomid == undefined || GameData.player.roomid == 0) {
            this.create_btn.node.active = true;
            this.back_btn.node.active = false;
            //this.join_btn.interactable = true;
        } else {
            this.create_btn.node.active = false;
            this.back_btn.node.active = true;
            //this.join_btn.interactable = false;
        }

        //注册监听
        registEvent('ddz-onGameStart', this, this.showTableLayer);
        registEvent('openScore', this, this.showTableLayer);
        registEvent('cardChange', this, this.roomcardRefresh);
        //registEvent('joinClubSuc',this,this.joinClubSuc);
        registEvent('refreshUIClubData', this, this.clubDataRefresh);
        //registEvent('refreshAgentRoomBtn',this,this.refreshAgentRoomBtn);
        registEvent('refreshUIClubInvite', this, this.showHint);
        registEvent('refreshCreateOrBackBtn', this, this.refreshCreateOrBackBtn);
        registEvent('refreshActivityRedPoint', this, this.refreshActivityRedPoint);

        if (ReplayDataCenter.openRoundPanel) {
            ReplayDataCenter.openRoundPanel = false;
            openView('RecordPanel');
        }


        if (ReplayDataCenter.openReplayPanel) {
            openView('RoundPanel');
        }

        this.refreshRuleUI();

    },
    onEnable: function () {
        soundMngr.instance.playMusic('sound/wait');
        //检测活动更新红点 临时添加 后期需要服务器添加活动相关字段
        if (!GameData.player.agentFlag) {
            sendEvent('refreshActivityRedPoint');
        }

        startLocation();
        //this.refreshAgentRoomBtn();
    },
    showTableLayer: function () {
        cc.director.loadScene('table');
    },

    showHint: function () {
        if (GameData.player.clubInvite.length > 0) this.hintNode.active = true;
        else this.hintNode.active = false;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    fangkaAddCBack: function (evt) {
        openView('kefuweixin');
    },
    roomcardRefresh: function () {
        this.roomcard_num.string = GameData.player.card;
    },
    clubDataRefresh: function () {

        console.log('GameData.playerCurrClubId  ' + GameData.playerCurrClubId);
        if (GameData.player.club && Object.keys(GameData.player.club).length > 0) {
            if (GameData.playerCurrClubId == undefined || GameData.playerCurrClubId == null) {
                GameData.playerCurrClubId = GameData.getClubDataByIndex(0).club_id;
            }
            if (Object.keys(GameData.player.club).length != 0) {
                console.log("GameData.playerCurrClubId  " + GameData.playerCurrClubId);
                if (GameData.getClubDataByClubId(GameData.playerCurrClubId) == null) {
                    return;
                }
                this.clubName.string = GameData.getClubDataByClubId(GameData.playerCurrClubId).clubName;
                this.diamondsNum.string = GameData.getClubDataByClubId(GameData.playerCurrClubId).diamond;
            }
            this.refreshAgentRoomBtn();
        }

    },
    refreshCreateOrBackBtn: function () {

        if (GameData.player.roomid == undefined || GameData.player.roomid == 0) {
            this.create_btn.node.active = true;
            this.back_btn.node.active = false;
            //this.join_btn.interactable = true;
        } else {
            this.create_btn.node.active = false;
            this.back_btn.node.active = true;
            //this.join_btn.interactable = false;
        }

        //

    },
    refreshActivityRedPoint: function () {
        this.activeRedPoint.active = true;
    },
    backBtnClicked: function (evt) {
        RoomHandler.enterMjRoom(GameData.player.roomid);
    },

    joinBtnClicked: function (evt) {

        if (GameData.player.roomid == undefined || GameData.player.roomid <= 0) {
            this.showNumber();
            this.layer_join.active = true;
        } else {
            console.log("GameData.player.roomid----" + GameData.player.roomid);

            createMessageBox('您已在房间中,不能加入别的房间,是否返回房间?',
                function () {
                    RoomHandler.enterMjRoom(GameData.player.roomid);;
                },
                function () {}
            );
        }

        this.layer_join.on(cc.Node.EventType.TOUCH_START, function (evt) {
            evt.stopPropagation();
        });
    },

    backToHome: function (evt) {
        this.layer_join.active = false;
        this.layer_ddz.active = false;
    },

    createDdz: function (evt) {
        this.layer_ddz.active = true;
    },

    refreshRuleUI: function () {
        if (GameData.player.club && Object.keys(GameData.player.club).length > 0) {
            this.refreshAgentRoomBtn();
        }

    },
    enterNumber: function (evt, data) {
        if (this.room_number.length < 6) {
            this.room_number += data;
            this.showNumber();
            if (this.room_number.length >= 6) {
                RoomHandler.enterMjRoom(this.room_number);
            }
        }
    },

    deleteNumber: function (evt) {
        this.room_number = this.room_number.substring(0, this.room_number.length - 1);
        this.showNumber();
    },

    resetNumber: function (evt) {
        this.room_number = '';
        this.showNumber();
    },

    showNumber: function () {
        for (var i = 1; i <= this.room_number.length; i++) {
            var number = this.room_number.substr(i - 1, 1);
            var Label = cc.find('panel/enterNode/roomLabel_' + i, this.layer_join).getComponent("cc.Label");
            Label.string = number;
            Label.node.active = true;
        }
        for (var i = 6; i > this.room_number.length; i--) {
            var Label = cc.find('panel/enterNode/roomLabel_' + i, this.layer_join);
            Label.active = false;
        }
    },

    enterRoom: function (evt) {
        if (this.room_number !== '') {
            RoomHandler.enterMjRoom(this.room_number);
        }
    },
    runPaoMadeng: function () {
        this._paoMadengX = this.paoMadengLabel.node.x;
        GameData.configData.paomadengIndex = 0;
        this.gotoPaoMadeng();
        this.schedule(this.gotoPaoMadeng, 10);
    },

    gotoPaoMadeng: function () {
        if (GameData.configData.paomadeng) {
            this.paoMadengLabel.string = GameData.configData.paomadeng[GameData.configData.paomadengIndex].content;
            this.paoMadengLabel.node.x = this._paoMadengX;
            var moveToAction = cc.moveTo(10, cc.p(this._paoMadengX - 570 - this.paoMadengLabel.node.width, this.paoMadengLabel.node.y));
            this.paoMadengLabel.node.runAction(moveToAction);
            GameData.configData.paomadengIndex++;
            if (GameData.configData.paomadengIndex == GameData.configData.paomadeng.length) {
                GameData.configData.paomadengIndex = 0;
            }
        }
    },

    openPlayIntro: function (evt) {
        openView('PlayIntroPanel');
    },

    openRecordPanel: function (evt) {
        openView('RecordPanel');
    },

    openSettingsPanel: function (evt) {
        //openView('SettingsPanel');
        cc.director.loadScene('table');
    },
    //活动和公告界面
    openNoticePanel: function () {
        // this.activeRedPoint.active = false;
        // openView('NoticePanel');
    },
    shareBtnClick: function () {
        openView('SharePanel');
    },
    selectClubClick: function () {
        openView("selectclubPanel");
    },
    joinClubClick: function () {
        openView("joinclubIDPanel");
    },
    agentRoomClick: function () {
        // console.log('GameData.player.uid,GameData.playerCurrClubId'+GameData.player.uid,GameData.playerCurrClubId);
        // RoomHandler.reqAgentRoom(GameData.player.uid,GameData.playerCurrClubId);
        // RoomHandler.reqAgentResultRoom(GameData.player.uid,GameData.playerCurrClubId);
        // openView("agentPanel");
    },
    showUIClub: function () {
        //openView("PanelClub");
    },
    refreshAgentRoomBtn: function () {
        // //刷新club 代开房按钮visiable
        // if(GameData.playerCurrClubId == undefined ||GameData.playerCurrClubId == null){
        //     GameData.playerCurrClubId = GameData.getClubDataByIndex(0).club_id
        // }
        // console.log('GameData.playerCurrClubId '+GameData.playerCurrClubId);
        // if(Object.keys(GameData.player.club).length != 0 && GameData.playerCurrClubId){
        //     //console.log('GameData.playerCurrClubId.level '+GameData.getClubDataByClubId(GameData.playerCurrClubId).level);
        //     if(GameData.getClubDataByClubId(GameData.playerCurrClubId).level > 0){
        //          //console.log('3333333333333');
        //         this.pay4_club.node.active = true;
        //         this.pay3_club.node.x =183;
        //         //代开房按钮显示
        //         this.agentBtn.active = true;
        //         this.activeBtnNode.x = -505;
        //     }else{
        //         this.pay4_club.node.active = false;
        //         this.pay3_club.node.x =253;
        //         this.agentBtn.active = false;
        //         this.activeBtnNode.x = -406;
        //     }
        // }else{
        //      this.pay4_club.node.active = false;
        //      this.agentBtn.active = false;
        // }
    }
});