cc.Class({
    extends: cc.Component,

    properties: {
        lblRoomNo: {
            default: null,
            type: cc.Label
        },
        _seats: [],
        _seats2: [],
        _lastPlayingSeat: null,
        _playingSeat: null,
        _lastPlayTime: null,
        _seatSelection: null,
        _enters: [],
        _prepareHeads: [], //游戏开始前头像节点
        _gameHeads: [],    //游戏开始时头像节点
    },

    onLoad: function () {
        
        this.initView();
       
        this.initSeats();
        this.initEventHandlers();
      

        cc.loader.loadResDir("game", cc.loader.onProgress, function (err, assets) {
            
        });


    },

    initView: function () {
        var prepare = this.node.getChildByName("prepare");
        var game = this.node.getChildByName('game');

        var seats = prepare.getChildByName("seats");
        var gameSeats = prepare.getChildByName("seats");

        this._seatSelection = prepare.getChildByName('seatSelection');
        var countDown = this._seatSelection.getChildByName('countDown');
        var enters = this._seatSelection.getChildByName('enters');

        for (let i = 0; i < enters.children.length; i++) {
            var enter = enters.children[i];
            this._enters.push(enter);
            cc.vv.utils.addClickEvent(enters.children[i], this.node, 'MJRoom', 'onBtnEnter');
        }

        for (var i = 0; i < seats.children.length; ++i) {
            this._seats.push(seats.children[i].getComponent("Seat"));
            this._prepareHeads.push(seats.children[i]);
        }

        this.refreshBtns();
        this.refreshEnters();

        this.lblRoomNo = cc.find("Canvas/infobar/Z_room_txt/New Label").getComponent(cc.Label);
        this.lblRoomNo.string = cc.vv.gameMgr.kDeskId;
        var gameChild = this.node.getChildByName("game");
        var sides = ["myself", "right", "up", "left"];
        for (var i = 0; i < sides.length; ++i) {
            var sideNode = gameChild.getChildByName(sides[i]);
            var seat = sideNode.getChildByName("seat");
            this._gameHeads.push(seat);
            this._seats2.push(seat.getComponent("Seat"));
        }     
    },

    refreshEnters: function () {
        if (!cc.vv.gameMgr.seatSelects) {
            cc.vv.gameMgr.initSeatSelects();
        }
        var seatSelects = cc.vv.gameMgr.seatSelects;
        for (let i = 0; i < this._enters.length; i++) {
            var enter = this._enters[i];
            if (seatSelects.length > 0) {
                if (seatSelects.indexOf(i) > -1) {
                    enter.active = true;
                } else {
                    enter.active = false;
                }
            } else if (seatSelects.length == 0) {
                
                enter.active = false;
            }
        }
    },
    refreshBtns: function () {
        var prepare = this.node.getChildByName("prepare");
        var btnBack = prepare.getChildByName('btnBack');
        var btnDispress = prepare.getChildByName("btnDissolve");
        
        var isIdle = cc.vv.gameMgr.numOfGames == 0;

        var owner = false;

        var kId = cc.vv.gameMgr.kCreateUserId;
        if (cc.vv.userMgr.kId == kId || !kId) { //追加 用户加载游戏一次,创建再解散再创建的情况下 kId为空
            owner = true;
        }
        btnDispress.active = owner && isIdle;
        btnBack.active = isIdle;
    },

    initEventHandlers: function () {
       
        var self = this;

        this.node.on('user_ready', function (data) {
            console.log('event info: ==> user_ready');
            console.log(data.detail);
            var index = data.detail.kPos;
            self._seats[index].setReady(true);
            self._seats2[index].setReady(true);
            self.initSingleSeat(data.detail);
        });

        this.node.on('user_state_changed', function (data) {
            console.warn('【MJRoom.js】--> user_state_changed()...');
            self.initSingleSeat(data.detail);
        });

        //玩家自己进入桌子
        //into_desk: 
        this.node.on('into_desk', function (data) {
            console.log('玩家自己进入桌子..., 发送选座信息..., kPos: ');
            /* var data = {
                'kMId': 61025,  //选座消息
                'kPos': 1
            };
            cc.vv.gameMgr.selectSeat(data); */
            if (data.detail.selected) {
                //已选座过
                self.initSingleSeat(data.detail);
            }
        });

        //桌子添加玩家.add_user
        this.node.on('add_user', function (data) {
            if (data.detail.selected) {
                self.initSingleSeat(data.detail);
            }
        });



        //61031: kFlag: 0:掉线 1:上线 {kMId: , kUserid: , kPos: , kFlag}
        this.node.on('user_online_info', function (data) {
            console.log('收到服务器广播的用户在线信息: --> ');
            var seatData = cc.vv.gameMgr.userMap[data.detail.kUserid];
            console.log(seatData);
            var flag = false;
            if (data.detail.kFlag == 0) {
                flag = true;
            }
            seatData['isOffline'] = flag;
            self.initSingleSeat(seatData);
        });

        this.node.on('select_seat_finish', function (data) {
            console.warn('接收到的userData: ===>');
            console.warn(data.detail);
            self.initSingleSeat(data.detail);
            self.refreshEnters();
        });

        this.node.on('game_begin', function (data) {
            self.refreshBtns();
            self.initSeats();
        });

        this.node.on('game_num', function (data) {
            self.refreshBtns();
        });

    
        this.node.on('chat_push', function (data) {
            var data = data.detail;
            var idx = cc.vv.gameMgr.getSeatIndexByID(data.sender);
            var localIdx = cc.vv.gameMgr.getLocalIndex(idx);
            self._seats[localIdx].chat(data.content);
            self._seats2[localIdx].chat(data.content);
        });

        this.node.on('quick_chat_push', function (data) {
            var data = data.detail;
            var idx = cc.vv.gameMgr.getSeatIndexByID(data.sender);
            var localIdx = cc.vv.gameMgr.getLocalIndex(idx);

            var index = data.content;
            var info = cc.vv.chat.getQuickChatInfo(index);
            self._seats[localIdx].chat(info.content);
            self._seats2[localIdx].chat(info.content);

            //cc.vv.audioMgr.playSFX(info.sound);
        });

        this.node.on('emoji_push', function (data) {
            var data = data.detail;
            var idx = cc.vv.gameMgr.getSeatIndexByID(data.sender);
            var localIdx = cc.vv.gameMgr.getLocalIndex(idx);
            console.log(data);
            self._seats[localIdx].emoji(data.content);
            self._seats2[localIdx].emoji(data.content);
        });
    },

    initSeats: function () {
        console.warn('[MJRoom.js]--> initSeats()...');
        var seats = [];
        var userMap = cc.vv.gameMgr.userMap;
 
        console.warn(cc.vv.gameMgr.userMap);
        for (let key in userMap) {
            if (key < 4) {
                seats.push(userMap[key]);
                this.initSingleSeat(userMap[key]);
            }
        }
        cc.vv.gameMgr.seats = seats;
    },

    initSingleSeat: function (seat) {
        console.warn('初始化单个位置: ......................');
        console.warn(seat);
        console.error();

        if (JSON.stringify(seat) == '{}') {
            return;
        }
        if (seat.kPos > 3) {
            return; //4为没选座,不需要初始化位置信息.
        }

        var index = null;
        if (cc.vv.gameMgr.gameState == 'started') {  
            console.warn('游戏已开局,需要转换位置...');
            index = cc.vv.gameMgr.getLocalIndex(seat.kPos);
        } else {
            console.warn('游戏未开始,不用转换位置...');
            index = seat.kPos;
        }
        
        var isOffline = false;
        var isZhuang = seat.kPos == cc.vv.gameMgr.zhuang;

        var kNike = seat.kNike;
        if (!kNike) {
            seat.kNike = kNike = cc.vv.userMgr.kId;
        }

        var score = null; 
        if (seat.kScore) {
            score = seat.kScore;
        } else if (seat.score) {
            score = seat.score; //结算时,只有score字段.
        } else {
            score = 0;
        }
    
        this._seats[index].setInfo(kNike, score);
       
        this._seats[index].setReady(seat.kReady == 1 ? true : false);
        this._seats[index].setOffline(seat.isOffline);
        //this._seats[index].setZhuang(isZhuang == 0 ? true : false);
        //this._seats[index].setHead();

        this._seats2[index].setInfo(kNike, score);
        //this._seats2[index].setReady(seat.kReady == 0 ? true : false);
        this._seats2[index].setOffline(seat.isOffline);
        //this._seats2[index].setHead(seat.sprHead);
        //this._seats2[index].setZhuang(isZhuang == 0 ? true : false);

        //设置头像 index
        this.setHead(index, seat.imageUrl, seat.kId);
        //_gameHeads: [], 
    },

    setHead: function (index, url, id) {
        if (url == '') {
            console.warn('用户头像地址为空...');
            return;
        }
        
        var sprPrepareHead = this._prepareHeads[index].getChildByName('icon').getComponent(cc.Sprite);
        var sprGameHead = this._gameHeads[index].getChildByName('icon').getComponent(cc.Sprite);
      
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            cc.loader.load({ url: url, type: 'png' }, function (err, texture) {
                if (err) {
                    console.warn('请求头像资源失败...');
                    //self.scheduleOnce(loadImage, 3);
                } else {
                    
                    var spriteFrame = new cc.SpriteFrame(texture);
                    sprPrepareHead.spriteFrame = spriteFrame;
                    sprGameHead.spriteFrame = spriteFrame;
                    /** 将当前玩家的头像spriteFrame保存下来 */
                    cc.vv.gameMgr.userMap[id].photo = spriteFrame;
                }
            });
        }
    },

    setReady: function (si) {
        
        var index = cc.vv.gameMgr.getLocalIndex(si);
        this._seats[index].setReady(true);
        this._seats2[index].setReady(true);
    },
    
    resetReady: function (si) {
        var index = cc.vv.gameMgr.getLocalIndex(si);
        this._seats[index].setReady(false);
        this._seats2[index].setReady(false);
    },

    resetAllReady: function () {
        for (let i = 0; i < 4; i++) {
            this.resetReady(i);
        }
    },

    setTing: function (si) {
        var index = cc.vv.gameMgr.getLocalIndex(si);
        
        console.warn(this._seats2[index]);
        this._seats2[index].setTing(true);
    },

    resetTing: function (si) {
        var index = cc.vv.gameMgr.getLocalIndex(si);
        this._seats2[index].setTing(false);
    },

    resetAllTing: function () {
        for (let i = 0; i < 4; i++) {
            this.resetTing(i);
        }
    },

    onBtnSettingsClicked: function () {
        cc.vv.popupMgr.showSettings();
    },

    onBtnChatClicked: function () {

    },

    onBtnBackClicked: function () {
        cc.vv.alert.show('返回大厅', '返回大厅房间仍会保留', function () {
            console.log('kDeskId: ' + cc.vv.gameMgr.kDeskId);
            console.log('roomId: ' + cc.vv.gameMgr.roomId);
            console.log('oldRoomId: ' + cc.vv.gameMgr.oldRoomId);
            cc.vv.gameMgr.oldRoomId = cc.vv.gameMgr.kDeskId;
            cc.director.loadScene('hall');
        }, true);
    },

    onBtnDissolveClicked: function () {
        cc.vv.alert.show('提示', '确认解散房间吗?', () => {
            cc.vv.gameMgr.dispress_push();
            setTimeout(() => {
                cc.director.loadScene('hall');
            }, 1500);
        }, true);
    },

    onBtnEnter: function (event) {
        var data = {
            'kMId': 61025,
            'kPos': Number(event.target.name)
        };
        console.warn('点击选座时候的位置信息: ===> ');
        console.warn(data);

        cc.vv.gameMgr.selectSeat(data);
        //cc.vv.gameMgr.seatSelects = [];
        //this._seatSelection.active = false;
    },

    onPlayerOver: function () {
        cc.vv.audioMgr.resumeAll();
        console.log("onPlayCallback:" + this._playingSeat);
        var localIndex = this._playingSeat;
        this._playingSeat = null;
    },

    onDestroy: function () {
        console.warn('[MJRoom.js]--> onDestroy()...');
    },

    //希望在所有组件的 update 都执行完之后才进行其它操作，那就需要用到 lateUpdate 回调
    lateUpdate: function () {
        var context = cc.sys.__audioSupport.context;
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            if (context.state === 'suspended') {
                context.resume();
            }
        }
    }
});
