var MjHandler_Heb = (function () {
    var _instance = null;

    function constructor() {
        return {
            requestReady: function (callback) {
                GameNet.getInstance().request("room.roomHandler.ready", {}, function (rtn) {});
            },
            //长春
            requestOperation_CC: function (operation,cards,isZiMoHuOnly,callback) {
                var self = this;
                GameNet.getInstance().request("room.harbinMahjongHandler.operationReq", {operation:operation,cards:cards,isZiMoHuOnly:isZiMoHuOnly}, function (rtn) {
                    //if (rtn.code == ZJHCode.Fail) createMoveMessage('请等待其他玩家操作');
                    callback(rtn);
                });
            },

            requestDisCard_CC: function (card, callback) {
                var self = this;
                GameNet.getInstance().request("room.harbinMahjongHandler.playCardsReq", {cards:card }, function (rtn) {
                    cc.log('room.huaDianMahjongHandle.playCardsReq response:%d', rtn.result);
                    //if(rtn.result == ZJHCode.Fail)createMoveMessage('请等待其他玩家操作');
                    callback(rtn);
                });
            },

            requestPass_CC: function (operation,cards,mcallback) {
                var self = this;
                GameNet.getInstance().request("room.harbinMahjongHandler.operationReq", {operation:operation,cards:cards}, function (rtn) {
                    //cc.log('room.mjHandler.pass response:%d', rtn.result);
                    //if (rtn.result == ZJHCode.Fail) createMoveMessage('��ȴ��������ѡ��');
                    //callback(rtn);
                });
            },

            requestPiao: function (piao,mcallback) {
                var self = this;
                GameNet.getInstance().request("room.harbinMahjongHandler.playerPiaoReq", {piao :piao}, function (rtn) {
                    //if (rtn.result == ZJHCode.Fail) createMoveMessage('��ȴ��������ѡ��');
                });
            }

        };
    }

    return {
        getInstance: function () {
            if (_instance == null) {
                _instance = constructor();
            }
            return _instance;
        }
    }
})();