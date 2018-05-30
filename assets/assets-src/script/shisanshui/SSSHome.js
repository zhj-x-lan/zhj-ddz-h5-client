var soundMngr = require('SoundMngr');
cc.Class({
    extends: cc.Component,

    properties: {
        homeNode: {
            default: null,
            type: cc.Node,
        },
        createRoomNode: {
            default: null,
            type: cc.Node,
        },
        joinRoomNode: {
            default: null,
            type: cc.Node,
        },

        // homeNode
        headNode: {
            default: null,
            type: cc.Node,
        },
        playerId: {
            default: null,
            type: cc.Label,
        },
        playerName: {
            default: null,
            type: cc.Label,
        },
        roomCardNum: {
            default: null,
            type: cc.Label,
        },
        createBtn: {
            default: null,
            type: cc.Button,
        },
        joinBtn: {
            default: null,
            type: cc.Button,
        },
        roomCardAddBtn: {
            default: null,
            type: cc.Button,
        },
        paoMaDengContent: {
            default: null,
            type: cc.Node,
        },
        paoMaDengStr: {
            default: null,
            type: cc.Node,
        },

        room_number: cc.String,
        room_number_bg: {
            default: null,
            type: cc.Sprite,
        },
    },

    // use this for initialization
    onLoad: function () {
        this.showPlayer();
        this.runPaoMaDeng();
    },

    showPlayer: function() {
        this.playerId.string = 'ID:'+GameData.player.uid;
        for (var i = 0; i < GameData13.joiners.length; i++) {
            if (GameData.player.uid == GameData13.joiners[i].uid) {
                if (isChinese(GameData13.joiners[i].name)) {
                    this.playerName.string = getShortStr(GameData13.joiners[i].name, 5);
                }else if (!isChinese(GameData13.joiners[i].name)) {
                    this.playerName.string = getShortStr(GameData13.joiners[i].name, 10);
                }
                break;
            }
        }
    },

    onCreateRoomClicked: function(evt) {
        this.createRoomNode.active = true;
    },

    onJoinRoomClicked: function(evt) {
        // if (GameData.player.roomid == undefined || GameData.player.roomid <= 0)
        // {
        //     this.showNumber();
        //     this.joinRoom.active = true;
        // }else {
        //     createMessageBox('您已在房间中,不能加入别的房间,是否返回房间?',
        //                     function() {
        //                         RoomHandler.enterPokerRoom(GameData.player.roomid);
        //                     },
        //                     function(){}
        //     );
        // }
        // this.joinRoomNode.on(cc.Node.EventType.TOUCH_START, function(evt){evt.stopPropagation()});

        cc.director.loadScene('home');
    },

    // enterNumber: function(evt, data) {
    //     if (this.room_number.length < 6) {
    //         this.room_number += data;
    //         this.showNumber();
    //         if(this.room_number.length >= 6)
    //         {
    //             RoomHandler.enterRoom(this.room_number);
    //         }
    //     }
    // },

    // devareNumber: function(evt) {
    //     this.room_number = this.room_number.substring(0, this.room_number.length - 1);
    //     this.showNumber();
    // },

    // resetNumber: function(evt) {
    //     this.room_number = '';
    //     this.showNumber();
    // },

    // showNumber: function() {
    //     for (var i=1; i<=this.room_number.length; i++) {
    //         var number = this.room_number.substr(i-1, 1);
    //         var Label = cc.find('panel/enterNode/roomLabel_'+i, this.joinRoomNode).getComponent("cc.Label");
    //         Label.string = number;
    //         Label.node.active = true;
    //     }
    //     for (var i=6; i>this.room_number.length; i--) {
    //         var Label = cc.find('panel/enterNode/roomLabel_'+i, this.joinRoomNode);
    //         Label.active = false;
    //     }
    // },

    // enterRoom: function(evt) {
    //     if (this.room_number !== '') {
    //         RoomHandler.enterRoom(this.room_number);
    //     }
    // },

    // onRoomCardAddClicked: function(evt){
    //     // openView('kefuweixin');
    // },

    // onShareBtnCliked: function(evt) {

    // },

    // showNumber: function() {
    // },

    onBackToHome: function(evt) {
        this.createRoomNode.active = false;
    },

    runPaoMaDeng: function() {
        var time = 5;
        var self = this;
        var timeCallback = function(dt) {
            self.paoMaDengAction(time);
        }
        this.paoMaDengAction(time);
        this.schedule(timeCallback, time + 2);
    },

    paoMaDengAction: function(time) {
        this.paoMaDengStr.x = this.paoMaDengContent.getContentSize().width / 2 + 10;
        var str = "来一发吗？满足你。。。";
        this.paoMaDengStr.getComponent(cc.Label).string = GameData.configData.content;

        var right = this.paoMaDengContent.getContentSize().width / 2 + 10;
        var left = 0 - (right + this.paoMaDengStr.getContentSize().width);
        var actionTo = cc.moveTo(time, cc.p(left, this.paoMaDengStr.getPositionY()));
        this.paoMaDengStr.runAction(actionTo);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
