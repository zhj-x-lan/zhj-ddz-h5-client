var gt = require('MessageInit');
cc.Class({
    extends: cc.Component,

    properties: {
        dataEventHandler: null,  //游戏场景节点的引用,用于向场景中主动发送事件.
        eventMap: null,
    },

    init: function () {
        var self = this;
        self.eventMap = {};
        var registerMsgListener = function (msgId, msgHandler) {
            let eventName = msgId.toString();
            if (!self.eventMap[eventName]) {
                cc.vv.dispatcher.on(eventName, msgHandler);
                self.eventMap[eventName] = true;
            } else {
                console.error('事件' + msgId + '已经注册, 不能重复注册...');
            }
        };

        //gt.GC_ENTER_ROOM			= 61022 onRcvEnterRoom
        registerMsgListener(gt.GC_ENTER_ROOM, this.onRcvEnterRoom);
         //gt.GC_ADD_PLAYER			= 61023  onRcvAddPlayer
         registerMsgListener(gt.GC_ADD_PLAYER, this.onRcvAddPlayer);
    },

    dispatchEvent(event, data) {
        if (this.dataEventHandler) {
            this.dataEventHandler.emit(event, data);
        }
    },

    //创建房间结果 61013
    onRcvCreateRoom: function (msgTbl) {
        console.warn('【Hall.js】--> #61013 onRcvCreateRoom()... 创建房间结果');
        console.warn(msgTbl);
        cc.vv.gameMgr.kDeskId = msgTbl.kDeskId;

        switch (msgTbl.kErrorCode) {
            case 0:
                console.warn('创建房间成功...');
                //最好还是在61022数据处理后再进入
                cc.director.loadScene('mjgame');
                break;
            case 1:
                console.warn('房卡不足, 请在商城购买...');
                break;
            case 8:
                console.warn('房主建房数量超限，解散后重试');
                break;
            case 9:
                console.warn('获取GPS信息失败！');
                break;
        }

    },

    //加入房间结果 61015
    onRcvJoinRoom: function (msgTbl) {
        console.warn('【RoomMgr.js】--> #61015 onRcvJoinRoom()... 加入房间结果');
        console.warn(msgTbl);
        switch (msgTbl.kErrorCode) {
            case 0:
                console.warn('加入房间成功...');
                cc.director.loadScene('mjgame');
                break;
            case 1:
                console.warn('房间人数已满');
                break;
            case 2:
                console.warn('游戏已经开始！');
                break;
            case 3:
                console.warn('房卡不足，请在商城购买！');
                break;
            case 4:
                console.warn('获取GPS信息失败！');
                break;

        }
    },

    //进入房间结果 61022 id->userData
    onRcvEnterRoom: function (msgTbl) {
        console.warn('【RoomMgr.js】--> #61022 onRcvEnterRoom()... 进入房间结果');
        console.warn(msgTbl);
        cc.vv.gameMgr.kCreateUserId = msgTbl.kCreateUserId;

        var userData = cc.vv.gameMgr.createUserData(msgTbl);   //kPos默认为4 

        //自己进入房间直接取
        userData.imageUrl = cc.vv.userMgr.kFace;

        cc.vv.gameMgr.userMap[userData['kId']] = userData;

        cc.vv.gameMgr.kDeskId = msgTbl.kDeskId;

        if (msgTbl.kPos < 4) {    //断线重连
            userData.kPos = msgTbl.kPos;
            userData.kReady = msgTbl.kReady;
            userData.kScore = msgTbl.kScore;

            cc.vv.gameMgr.userMap[msgTbl.kPos] = userData;
            cc.vv.gameMgr.seatIndex = msgTbl.kPos;
            cc.vv.gameMgr.seatSelects = [];
        } else { //首次登陆
            cc.vv.gameMgr.initSeatSelects();
        }

        //底分:
        var df = msgTbl.kCellscore;
        var wanfa = '底分: ' + df + ' 玩法: ';
        if (msgTbl.kState == 100002) {
            wanfa += '扣点点 ';
        }

        for (let val of msgTbl.kPlaytype) {
            if (gt.playType[val]) {
                wanfa += gt.playType[val] + ' '
            }
        }

        cc.vv.gameMgr.wanfa = wanfa;
        cc.vv.roomMgr.dispatchEvent('game_wanfa', wanfa);
        cc.game.emit('game_wanfa2', wanfa);
        //消息处理后进入桌子
        //cc.director.loadScene('mjgame');
    },

    //其他已经玩家 hall接收 61023 
    onRcvAddPlayer: function (msgTbl) {
        console.warn('【RoomMgr.js】--> #61023 onRcvAddPlayer()... 桌子添加玩家');
        console.warn(msgTbl);

        var userData = cc.vv.gameMgr.createUserData(msgTbl);
        
        userData.imageUrl = msgTbl.kFace;

        cc.vv.gameMgr.userMap[userData['kId']] = userData;
        
        
        if (msgTbl.kPos < 4) {
            
            userData.kPos = msgTbl.kPos;
            userData.kReady = msgTbl.kReady;
            
            userData.kScore = msgTbl.kScore;

            //虽然能直接取，但是最好还是在选座完成中保存
            //userData.imageUrl = msgTbl.kFace; //bao

            cc.vv.gameMgr.userMap[userData['kPos']] = userData;
            
            if (cc.vv.gameMgr.seatSelects.length > 0) {
                var si = cc.vv.gameMgr.seatSelects.indexOf(msgTbl.kPos);
                if (si > -1) {
                    cc.vv.gameMgr.seatSelects.splice(si, 1);
                }
            }
            /** 必须手动通知更新UI */
           
            //this.node.getComponent('MJRoom').initSingleSeat(userData);
        }
    },

    //#61026 选座完成
    onRcvSelectSeat: function (msgTbl) {
        console.warn('【RoomMgr.js】--> #61026 onRcvSelectSeat()... 玩家选座完成');
        console.warn(msgTbl);
        var userData = cc.vv.gameMgr.userMap[msgTbl.kId];
        if (cc.vv.userMgr.kId == msgTbl.kId) {
            cc.vv.gameMgr.seatIndex = msgTbl.kPos;
            cc.vv.gameMgr.seatSelects = [];
            //userData.imageUrl = cc.vv.userMgr.kFace;        通过id保存的userData已经有imageUrl.
        } else {
            if (cc.vv.gameMgr.seatSelects.length > 0) {
                var si = cc.vv.gameMgr.seatSelects.indexOf(msgTbl.kPos);
                if (si > -1) {
                    cc.vv.gameMgr.seatSelects.splice(si, 1);
                }
            }
            //此处无kFace所以其他玩家头像信息显示异常
            //userData.imageUrl = msgTbl.kFace;
        }
        userData.kPos = msgTbl.kPos;
        //新增：
        userData.kReady = 1;

        cc.vv.gameMgr.userMap[userData.kPos] = userData;
        /** 将玩家数据保存在seats */
        cc.vv.gameMgr.seats[msgTbl.kPos] = userData;
     
        console.error('显示玩家座位信息前,检测 userMap 数据==');
        console.error(cc.vv.gameMgr.userMap);

        cc.vv.roomMgr.dispatchEvent('select_seat_finish', userData);
    }
});
