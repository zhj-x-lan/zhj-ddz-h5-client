function checkMjMgr() {
    if (!cc.vv.mahjongmgr) {
        var MjMgr = require('MahjongMgr');
        cc.vv.mahjongmgr = new MjMgr();
        cc.vv.mahjongmgr.init();
    }
}

function chooseRoute() {
    var sceneName = cc.director.getScene().name;
    if (sceneName == 'login') { //断线重连 (刷新重进)
        
        return false;
    } else if (sceneName == 'mjgame') { //正常开局或者游戏中断线重连
        
        return true;
    }
}

var Maps = cc.Class({
    extends: cc.Component,
    statics: {

        msgMaps: {
            //61008: 发送心跳包(s)
            61009: {    //收到心跳包(r)
                handler: function (data) {
                    cc.vv.socketMgr.rec_heartbeat(Date.now());
                }
            },

            /**61002->61115->61005 */
            //61001: LoginServer登录
            61002: {    //登录服返回数据(r)
                handler: function (data) {
                    cc.vv.dispatcher.fire('61002', data);
                }
            },
            //61114: GateServer登录
            61115: {    //Gate服返回数据后,直接登录game_server
                handler: function (data) {
                    cc.vv.dispatcher.fire('61115', data);
                }
            },
            //61004: GameServer登录
            61005: {    //服务器返回大厅登录结果(r)
                handler: function (data) {
                    cc.vv.dispatcher.fire('61005', data);
                }
            },


            61006: {    //返回用户物品信息
                handler: function (data) {
                    cc.vv.dispatcher.fire('61006', data);
                }
            },

            //61012: 请求创建房间(s)
            61013: {    //创建房间结果(r)
                handler: function (data) {
                    cc.vv.dispatcher.fire('61013', data);
                }
            },

            //61014: 请求加入房间(s)
            61015: {  //加入房间结果(r)
                handler: function (data) {
                    cc.vv.dispatcher.fire('61015', data);
                }
            },
            61022: { // 服务器通知玩家【自己】进入桌子,into_desk_result.
                handler: function (data) {
                    cc.vv.dispatcher.fire('61022', data);
                }
            },

            61023: {    //服务器返回 桌子添加一个玩家
                handler: function (data) {
                    cc.vv.dispatcher.fire('61023', data);
                }
            },
            //61025: 发送选座消息
            61026: {
                handler: function (data) {
                    cc.vv.dispatcher.fire('61026', data);
                }
            },
            //61016 玩家自己发送退出桌子消息
            61017: {
                handler: function (data) {
                    cc.vv.dispatcher.fire('exit_result', data);
                }
            },
            //收到玩家状态信息
            61031: {
                handler: function (data) {
                    cc.vv.dispatcher.fire('user_online_info_result', data);
                }
            },
            61029: {
                handler: function (data) {
                    
                    cc.vv.dispatcher.fire('61029', data);
                }
            },
            61024: {    //通知玩家退出桌子
                handler: function (data) {
                    cc.vv.dispatcher.fire('user_exit_result', data);
                }
            },
            61027: {
                handler: function (data) {
                    console.log(cc.vv.gameMgr.seatIndex + ': 自己位置');
                    console.log(data.kTingState);

                    cc.vv.gameMgr.kTinged = data.kTingState[cc.vv.gameMgr.seatIndex];
                    console.warn('kTinged: ' + cc.vv.gameMgr.kTinged);

                    checkMjMgr();

                    var arrHunTemp = data.kHunCard;
                    var arrCanHuns = [];
                    for (let i = 0; i < arrHunTemp.length; i++) {
                        var htemp = arrHunTemp[i];
                        var hpai = cc.vv.mahjongmgr.converDesc2Id(htemp[0], htemp[1]);
                        arrCanHuns.push(hpai);
                    }
                    cc.vv.gameMgr.haoziCards = arrCanHuns;
                    

                    //新增: 标记当前游戏状态为started:
                    cc.vv.gameMgr.gameState = 'started';

                    if (!chooseRoute()) {
                        /** 保存游戏恢复数据 */
                        cc.vv.gameMgr.gameRecData = data;
                    } else {
                        cc.vv.dispatcher.fire('61027', data);
                    }
                    console.warn(data);
                }
            },

            //61032: 同步桌子信息,log中会收到2次.
            61032: {
                handler: function (data) {
                    checkMjMgr();
                    if (!chooseRoute()) {    //
                        cc.vv.gameMgr.dataInfo32 = data;
                    } else {
                        cc.vv.dispatcher.fire('61032', data);
                    }
                }
            },

            //游戏开始,显示牌面信息.
            61033: {
                handler: function (data) {
                    checkMjMgr();
                    if (!chooseRoute()) {    //
                        cc.vv.gameMgr.dataInfo33 = data;
                    } else {
                        cc.vv.dispatcher.fire('61033', data);
                    }
                }
            },

            //玩家需要摸牌、出牌消息
            61034: {
                handler: function (data) {
                    checkMjMgr();
                    if (!chooseRoute()) {    //
                        cc.vv.gameMgr.dataInfo34 = data;
                    } else {
                        cc.vv.dispatcher.fire('61034', data);
                    }
                }
            },

            //61035//玩家请求出牌消息
            //收到玩家出牌消息
            61036: {
                event: 'game_chupai_result',
                handler: function (data) {
                    checkMjMgr();
                    if (!chooseRoute()) {    //
    
                        cc.vv.gameMgr.dataInfo36 = data;
                        console.warn('dataInfo36: ==> ');
                        console.warn(cc.vv.gameMgr.dataInfo36);
                    } else {
                        cc.vv.dispatcher.fire('61036', data);
                    }
                }
            },

            //61037 需要玩家决策的消息
            61037: {
                handler: function (data) {
                    checkMjMgr();
                    if (!chooseRoute()) {
                        cc.vv.gameMgr.dataInfo37 = data;
                    } else {
                        cc.vv.dispatcher.fire('61037', data);
                    }
                }
            },

            //61038 玩家发送决策消息
            61039: {
                handler: function (data) {
                    checkMjMgr();
                    cc.vv.dispatcher.fire('61039', data);
                }
            },

            //61043 (包含耗子牌信息?)
            61043: {
                event: 'game_option_result',
                handler: function (data) {
                    checkMjMgr();
                    console.log('耗子牌相关信息打印 ----------------------------- ');
                    console.log(data);
                    var arrTemp = data.kHaoZiCards;
                    var haoziCards = [];
                    for (let i = 0; i < arrTemp.length; i++) {
                        var item = arrTemp[i];
                        var pai = cc.vv.mahjongmgr.converDesc2Id(item[0], item[1]);
                        haoziCards.push(pai);
                    }
                    cc.vv.gameMgr.haoziCards = haoziCards;
                    cc.vv.dispatcher.fire('61043', data);
                }
            },

            /**
             * 61042:本局游戏结束:
             */
            61042: {
                handler: function (data) {
                    checkMjMgr();
                    cc.vv.dispatcher.fire('61042', data);
                }
            },

            //61050
            61050: {
                handler: function (data) {
                    checkMjMgr();
                    cc.vv.dispatcher.fire('61050', data);
                }
            },

            //61018: 申请解散房间.
            // 服务端返回解散房间通知:
            61019: {
                handler: function (data) {
                    checkMjMgr();
                    if (!chooseRoute()) {    //
                       
                        cc.vv.gameMgr.dataInfo19 = data;
                    } else {
                       
                        cc.vv.dispatcher.fire('61019', data);
                    }
                }
            },
        },
    },
});
