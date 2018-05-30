var gt = require('MessageInit');
cc.Class({
    extends: cc.Component,

    properties: {
        dataEventHandler: null,
        roomId: null,
        kDeskId: null,
        maxNumOfGames: 0,
        numOfGames: 0,
        numOfMJ: 0,
        seatIndex: -1,
        seats: [],
        userMap: null, //{userId --> UserData快速索引}
        turn: -1,
        button: -1,
        chupai: -1,
        hupai: -1,
        gameState: "",
        isOver: false,
        dissoveData: null,
        chupaiMode: 1,  //默认单击出牌
        //游戏场景需要控制的事件列表.
        mopaiOpt: 0,
        gameOverData: null,
        gameEndData: null,
        reconned: null,         //标记
        //haoziLists: [],    //耗子牌列表
        mapPaiInfo: null,  //单局牌统计信息
        //turnHaozis:      //正常开局和断连单局耗子
        handled: false, //选项处理标记.
        playerNum: 2,   //新增: 游戏开局人数: 2人或者动态开局有影响.
    },

    reset: function () {
        this.turn = -1;
        this.chupai = -1,
            this.hupai = -1,
            this.button = -1;   //庄家
        this.gameState = "";
        this.curaction = null;
        this.mopaiOpt = 0;
        for (let i = 0; i < this.playerNum; i++) {
            this.userMap[i].holds = [];
            this.userMap[i].folds = [];
            this.userMap[i].pengs = [];
            this.userMap[i].angangs = [];
            this.userMap[i].diangangs = [];
            this.userMap[i].wangangs = [];
            this.userMap[i].hued = false;
        }
    },

    onLoad: function () {
        
    },

    init: function () {
        this.conf = {};
        this.userMap = {};
    },

    clear: function () {
        this.dataEventHandler = null;
        if (this.isOver == null) {
            this.seats = null;
            this.roomId = null;
            this.maxNumOfGames = 0;
            this.numOfGames = 0;
        }
    },

    initSeatSelects: function () {
        this.seatSelects = [];
        for (let i = 0; i < this.playerNum; i++) {
            this.seatSelects.push(i);
        }
    },

    clearData: function () {
        this.dataEventHandler = null;
        this.seats = null;
        this.userMap = {};
        this.roomId = null;
        this.maxNumOfGames = 0;
        this.numOfGames = 0;
    },

    clearRoomData: function () {
        console.warn('清理: clearRoomData()...');
        this.roomId = null;
        this.maxNumOfGames = 0;
        this.numOfGames = 0;
        this.kCreateUserId = null;
    },

    clearGameData: function () {
        console.warn('清理: clearGameData()...');
        this.clearRoomData();
        this.turn = -1;
        this.chupai = -1,
        this.hupai = -1,
        this.button = -1;   //庄家
        this.gameState = "";
        this.seats = [];
        this.userMap = {};

        this.gameOverData = null;
        this.gameEndData = null;

        //追加: 清空玩法信息
        this.wanfa = '';

        this.clearTempData();

    },

    removeGameListeners: function () {
        var removeMsgListener = (msgId) => {
            cc.vv.dispatcher.un(msgId.toString());
        };

        //gt.GC_DISMISS_ROOM			= 61019
        removeMsgListener(gt.GC_DISMISS_ROOM);
        //------------------------------------------------------------------------
        //gt.GC_ENTER_ROOM			= 61022 onRcvEnterRoom
        removeMsgListener(gt.GC_ENTER_ROOM);
        //gt.GC_ADD_PLAYER			= 61023  onRcvAddPlayer
        removeMsgListener(gt.GC_ADD_PLAYER);
        //gt.GC_SELECT_SEAT			= 61026 onRcvSelectSeat
        removeMsgListener(gt.GC_SELECT_SEAT);

        //追加:取消准备监听
        //gt.GC_READY				= 61029 onRcvReady
        removeMsgListener(gt.GC_READY);

        //-------------------------------------------------------------------------
        //gt.GC_ROUND_STATE			= 61032  onRcvRoundState
        removeMsgListener(gt.GC_ROUND_STATE);
        //gt.GC_START_GAME			= 61033  onRcvStartGame
        removeMsgListener(gt.GC_START_GAME);
        //gt.GC_TURN_SHOW_MJTILE		= 61034 
        removeMsgListener(gt.GC_TURN_SHOW_MJTILE);
        //gt.GC_SYNC_SHOW_MJTILE		= 61036 
        removeMsgListener(gt.GC_SYNC_SHOW_MJTILE);
        //gt.GC_MAKE_DECISION			= 61037 
        removeMsgListener(gt.GC_MAKE_DECISION);
        //-------------------------------------------------------------------------
        //GC_SYNC_MAKE_DECISION         = 61039
        removeMsgListener(gt.GC_SYNC_MAKE_DECISION);
        //gt.GC_START_DECISION         = 61043      onRcvStartDecision
        removeMsgListener(gt.GC_START_DECISION);
        //gt.GC_ROUND_REPORT         = 61042      onRcvRoundReport
        removeMsgListener(gt.GC_ROUND_REPORT);
        //gt.GC_FINAL_REPORT         = 61050      onRcvFinalReport
        removeMsgListener(gt.GC_FINAL_REPORT);
        //gt.GC_SYNC_ROOM_STATE		= 61027
        removeMsgListener(gt.GC_SYNC_ROOM_STATE);
    },

    clearTempData: function () {
        cc.vv.gameMgr.mapPaiInfo = null;
        cc.vv.gameMgr.kTinged = false;
        cc.vv.gameMgr.arrCanHus = null;
        //重置玩家思考选项操作过
        cc.vv.gameMgr.handled = false;
    },

    dispatchEvent(event, data) {
        if (this.dataEventHandler) {
            this.dataEventHandler.emit(event, data);
        }
    },

    enterRoom: function (data) {
        /*  console.log('[GameMgr.js]--> enterRoom()...');
         console.log('kId:' + cc.vv.userMgr.kId);
 
         if (cc.vv.userMgr.kId == data.kCreateUserId) {
             setTimeout(() => {
                 cc.director.loadScene('mjgame');
             }, 3000);
         }*/
    },

    getSeatIndexByID: function (userId) {
        for (var i = 0; i < this.seats.length; ++i) {
            var s = this.seats[i];
            if (s.userId == userId) {
                return i;
            }
        }
        return -1;
    },

    isOwner: function () {
        return cc.vv.userMgr.kId == this.kCreateUserId;
    },

    getSeatByID: function (userId) {
        var seatIndex = this.getSeatIndexByID(userId);
        var seat = this.seats[seatIndex];
        return seat;
    },

    getSeats: function () {
        return this.seats;
    },

    getSelfData: function () {
        return this.seats[this.seatIndex];
    },

    getLocalIndex: function (index) {
        var ret = (index - this.seatIndex + 4) % 4;
        return ret;
    },

    createUserData: function (data) {
        var userData = {
            //kId, kDestId, kPos, kReady, kScore 
        };
        if (!data.kUserId) {    //61022
            userData['kId'] = cc.vv.userMgr.kId;
            userData['kNike'] = cc.vv.userMgr.kNike;
        } else {
            userData['kId'] = data.kUserId;
            userData['kNike'] = data.kNike;
        }
        userData['kPos'] = 4;   //初始化为4
        //初始化位置分数头像
        userData['kReady'] = 0;
        userData['kScore'] = 0;
        userData['imageUrl'] = '';

        userData['kDeskId'] = data.kDeskId;
        userData['holds'] = [];
        userData['folds'] = [];
        userData['pengs'] = [];
        userData['angangs'] = [];
        userData['diangangs'] = [];
        userData['wangangs'] = [];

        return userData;
    },

    initEventHandlers: function () {
        
        var self = this;
       
    
        //61031
        cc.vv.dispatcher.on('user_online_info_result', function (data) {
            console.log('user_online_info_result -----------------');
            self.dispatchEvent('user_online_info', data);
        });

        cc.vv.dispatcher.on('game_guo_result', function (data) {
            console.log('过牌信息...');
            console.log(data);
            self.doGuo(data.si, data.pai);
        });

        cc.vv.dispatcher.on('game_ting_result', function (data) {
            self.dispatchEvent('game_ting', data);
        });

        cc.vv.dispatcher.on('game_hu_result', function (data) {
            self.doHu(data);
        });

        //game_reset_result
        cc.vv.dispatcher.on('game_reset_result', function (data) {
           
            self.reset();
            console.log(self.userMap);
            self.dispatchEvent('game_reset');
        });

        cc.vv.dispatcher.on('game_reconn_result', function (data) {
            self.dispatchEvent('game_reconn', data);
        });

    },

    sendHeart: function () {
        var data = {
            'kMId': 61008,
        };
        cc.vv.socketMgr.send(data);
    },

    /** 用于登陆loginServer */
    testLogin: function () {
        console.log('[GameMgr.js]--> testLogin()...');
        var uuid = cc.vv.gameMgr.uid;
        var data = {
            'kImageUrl': '',
            'kMId': 61001,
            'kNike': cc.vv.gameMgr.nk,
            'kNikename': cc.vv.gameMgr.nk,
            //'kOpenId': 'ray',
            'kOpenId': uuid,
            //'kPlate': 'wxh5',
            'kPlate': 'local',
            'kSeverID': 16210,
            'kSex': 1,
            'kSign': '123987',
            //'kUuid': 'ray'
            'kUuid': uuid
        };
        console.log('send msg: -->' + 61001);
        cc.vv.socketMgr.loginSend(data);
    },

    //小游戏wx登陆
    wxLogin: function (cached) { 
        var data = {
            'kMId': 61001,
            'kPlate': '',
            'kImageUrl': '',
            'kNike': '',
            'kNikename': '',
            'kOpenId': '',
            'kSeverID': 16210,
            'kSex': 0,
            
            'kPlate': 'wechath5',
            'kWechatCode': cc.vv.userMgr.code,
            'kWechatSignature': cc.vv.userMgr.signature,
            'kWechatData': cc.vv.userMgr.encryptedData,
            'kWechatIv': cc.vv.userMgr.iv,
            'kWechatRawData': cc.vv.userMgr.rawData,
        };

        if (cached) {
            console.warn('# aaa uuid登陆...');
            //存在uuid,
            data.kPlate = 'wechat';
            data.kWechatCode = '';

            data.kUuid = cc.vv.userMgr.kUUID;
        } else {
            console.warn('#bbb code登陆...');
            data.kPlate = 'wechath5';
            data.kWechatCode = cc.vv.userMgr.code;
            data.kUuid = '';
        }

        console.warn('小游戏登陆 ......................... wxLogin()...');
        console.warn(data);
        console.log('send msg: -->' + 61001);
        cc.vv.socketMgr.loginSend(data);
    },

    gateLoginByWx: function () {
        console.warn('[GameMgr.js]--> gateLoginByWx()...');
        
        if (!cc.vv.userMgr.kUUID) {
            //uuid登陆时,userMgr中没kUUID信息,需要从本地取得
            cc.vv.userMgr.kUUID = cc.sys.localStorage.getItem('uuid');
        }
        console.warn('gateLoginByWx ******************* send msg: -->' + 61114);
        var data = {
            'kMId': 61114,
            'kStrUserUUID': cc.vv.userMgr.kUUID
        };
        console.warn(data);
        cc.vv.socketMgr.send(data);
    },

    gateLoginByGuest: function () {
        console.warn('[GameMgr.js]--> gateLoginByGuest()...');
        var uuid = cc.vv.gameMgr.uid;
        var data = {
            'kMId': 61114,
            'kStrUserUUID': uuid
        };
        console.warn('gateLoginByGuest send msg: -->' + 61114);
        cc.vv.socketMgr.send(data);
    },

    gameLogin: function () {
        console.warn('[GameMgr.js]--> gameLogin()...');
        var data = {
            'kMId': 61004,
            'kId': cc.vv.userMgr.kId,
            'kSeed': cc.vv.userMgr.kSeed,
            'kMd5': ''
        };
        console.log('gameLogin data: ');
        console.log(data);
        console.warn('send msg: -->' + 61004);
        cc.vv.socketMgr.send(data);
    },

    createRoom: function (data) {
        console.log('[GameMgr.js]--> createRoom()...');
        console.log('send msg: -->' + 61012);
        cc.vv.socketMgr.send(data);
    },

    joinRoom: function (data) {
        console.log('[GameMgr.js]--> joinRoom()...');
        console.log('send msg: -->' + 61014);
        cc.vv.socketMgr.send(data);
    },

    //玩家选择座位信息:
    selectSeat: function (data) {
        console.log('[GameMgr.js]--> selectSeat()...');
        console.log('send msg: --> ' + 61025);
        cc.vv.socketMgr.send(data);
    },

    //61035: 用户出牌
    chupai_push: function (data) {
        console.log('[GameMgr.js]--> chupai()...');
        console.log('send msg: --> ' + 61035);
        cc.vv.socketMgr.send(data);
    },

    ting_push: function (data) {
        console.log('请求听牌...');
        cc.vv.socketMgr.send(data);
    },

    //61038: 用户思考后的决策动作
    think_push: function (data) {
        console.log('发送======决策动作');
        cc.vv.socketMgr.send(data);
    },

    //61028: 发送准备信息:
    ready_push: function (data) {
        console.log('ready_push 发送准备请求...');
        cc.vv.socketMgr.send(data);
    },

    getWanfa: function () {
        /* var conf = this.conf;
        if (conf && conf.maxGames != null && conf.maxFan != null) {
            var strArr = [];
            strArr.push(conf.maxGames + "局");
            strArr.push(conf.maxFan + "番封顶");
            if (conf.zimo == 1) {
                strArr.push("自摸加番");
            }
            else {
                strArr.push("自摸加底");
            }
            if (conf.jiangdui) {
                strArr.push("将对");
            }
            if (conf.dianganghua == 1) {
                strArr.push("点杠花(自摸)");
            }
            else {
                strArr.push("点杠花(放炮)");
            }
            if (conf.tiandihu) {
                strArr.push("天地胡");
            }
            return strArr.join(" ");
        }
        return ""; */
    },

    exit_result: function (retdata) {
        self.roomId = null;
        self.turn = -1;
        self.seats = null;
    },
    exit_notify_push: function (retdata) {
        var userId = data;
        var s = self.getSeatByID(userId);
        if (s != null) {
            s.userid = 0;
            s.name = "";
            self.dispatchEvent("user_state_changed", s);
        }
    },
    //房主申请解散房间:
    dispress_push: function () {
        var data = {
            'kMId': 61018,
            'kUserId': cc.vv.userMgr.kId,
            'kDeskId': this.kDeskId,
            'kStrUserUUID': cc.vv.userMgr.uId + '',
        };
        cc.vv.socketMgr.send(data);
    },

    //同意、决绝解散房间: 1-同意，2-拒绝
    dispress_device_push: function (flag) {
        //消息号 位置 同意、拒绝    
        var data = {
            'kMId': 61020,
            'kPos': cc.vv.gameMgr.seatIndex,
        };
        data['kFlag'] = flag;
        cc.vv.gameMgr.deviced = true;
        cc.vv.socketMgr.send(data);
    },

    dissolve_notice_push: function (data) {
        console.log('dispress result');
    },

    disconnect: function (retdata) {
        if (self.roomId == null) {
            //cc.vv.wc.show('正在返回游戏大厅');
            console.log('[gameMgr.js]--> disconnect()...');
            console.log('断开连接...');
            //cc.director.loadScene("hall");
        }
        else {
            if (self.isOver == false) {
                cc.vv.userMgr.oldRoomId = self.roomId;
                self.dispatchEvent("disconnect");
            }
            else {
                self.roomId = null;
            }
        }
    },

    doGuo: function (seatIndex, pai) {
        console.log('[GameMgr.js]--> doGuo()...');
        console.log('seatIndex, pai:' + seatIndex + ', ' + pai);
        if (seatIndex == -1) {
            seatIndex = cc.vv.gameMgr.seatIndex;
        }
        var seatData = this.userMap[seatIndex];
        var folds = seatData.folds;
        folds.push(pai);
        this.dispatchEvent('game_guo', seatData);
    },

    doMopai: function (seatIndex, pai) {
        //var seatData = this.seats[seatIndex];
        console.log('[GameMgr.js]-->: ********* doMopai  *********** ');
        console.log('seatIndex: ' + seatIndex);
        console.log('pai: ' + pai);
        var seatData = this.userMap[seatIndex];
        //if (seatData.holds) {
        if (seatData.holds.length > 0) {
            //if (pai != -1) {
            seatData.holds.push(pai);
            //}
            this.dispatchEvent('game_mopai', { seatIndex: seatIndex, pai: pai });
        }
    },

    doChupai: function (seatIndex, pai) {
        console.log('[GameMgr.js]-->: ********* doChupai  *********** ');
        this.chupai = pai;
        var seatData = this.userMap[seatIndex];
        
        if (JSON.stringify(seatData) == '{}') {
            consol.log('seatData is {}');
        }

        if (seatData.holds.length > 0) {
            //断线重连且当前用户出牌被其他思考玩家操作阻断
            /* if (cc.vv.gameMgr.recFlag) {
                seatData.holds.push(pai);
                cc.vv.gameMgr.recFlag = null;
            } */
            var idx = seatData.holds.indexOf(pai);
            if (idx >= 0) {
                seatData.holds.splice(idx, 1);
            } else {
                console.warn('出的牌: ' + pai + '索引idx: 为' + idx);
            }
            console.error('当前出牌玩家数据...=====================');
            console.log(seatData);
        }
        cc.vv.gameMgr.recFlag = null;

        if (!seatData.folds) {
            console.warn('seatData中folds不存在...');
            seatData.folds = [];
        }
        var data = {
            seatData: seatData,
            pai: pai
        };
        this.dispatchEvent('game_chupai_notify', data);
    },

    doPeng: function (seatIndex, pai) {
        console.log('[GameMgr.js]--> doPeng()...');
        console.log('seatIndex: ' + seatIndex + ', pai: ' + pai);

        var seatData = this.userMap[seatIndex];
        //移除手牌
        if (seatData.holds) {
            for (var i = 0; i < 2; ++i) {
                var idx = seatData.holds.indexOf(pai);
                seatData.holds.splice(idx, 1);
            }
        }
        seatData.pengs.push(pai);

        console.log('执行碰的玩家数据为: ====>');
        console.log(seatData);
        this.dispatchEvent('game_peng', seatData);
    },

    getGangType: function (seatData, pai) {
        if (seatData.pengs.indexOf(pai) != -1) {
            return "wangang";
        }
        else {
            var cnt = 0;
            for (var i = 0; i < seatData.holds.length; ++i) {
                if (seatData.holds[i] == pai) {
                    cnt++;
                }
            }
            if (cnt == 3) {
                return "diangang";
            }
            else {
                return "angang";
            }
        }
    },

    doGang: function (si, pai, gangtype, respId) {
        console.log('分析doGang操作=====================================');
        var seatData = this.userMap[si];
        console.log('A:------检测this.userMap: ========>>>>>');
        console.log(this.userMap);
        console.log('B:------检测杠牌玩家seatData: ========>>>>>');
        console.log(seatData);

        console.log('C:------杠牌类型gangtype:--------------' + gangtype);
        if (!gangtype) {
            gangtype = this.getGangType(seatData, pai);
        }
        //if (gangtype == "wangang") {
        if (gangtype == 4 && respId == 61036) {  //弯杠即补杠,type=4. 碰牌后再摸到碰的牌，再杠它.
            console.log('3:------补杠(type = 4)-----------------------------------');
            if (seatData.pengs.indexOf(pai) != -1) {
                var idx = seatData.pengs.indexOf(pai);
                if (idx != -1) {
                    seatData.pengs.splice(idx, 1);
                }
            }
            seatData.wangangs.push(pai);
        }
        if (seatData.holds) {   //默认
            for (var i = 0; i <= 4; ++i) {
                var idx = seatData.holds.indexOf(pai);
                if (idx == -1) {
                    //如果没有找到，表示移完了，直接跳出循环
                    break;
                }
                seatData.holds.splice(idx, 1);
            }
        }
        //if (gangtype == "angang") {
        if (gangtype == 3) {    //自己没碰过,摸到杠牌再杠
            console.log('3:------暗杠(type = 3)-----------------------------------');
            seatData.angangs.push(pai);
        }
        //else if (gangtype == "diangang") {
        else if (gangtype == 4 && respId == 61039) {  //点杠即明杠,type=4.其他玩家打了一张你有点的三张一样的牌.
            console.log('3:------明杠(type = 4)-----------------------------------');
            seatData.diangangs.push(pai);
        }
        this.dispatchEvent('game_gang', { seatData: seatData, gangtype: gangtype });
    },

    doHu: function (data) {
        this.dispatchEvent('game_hupai', data);
    },

    doTurnChange: function (si) {
        console.log('[GameMgr.js]--> doTurnChange()...');
        var data = {
            last: this.turn,
            turn: si,
        }
        console.log(data);
        this.last = data.last;
        this.turn = si;
        this.dispatchEvent('game_chupai', data);
    },
});
