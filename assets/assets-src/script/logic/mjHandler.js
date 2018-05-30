var MjHandler = (function () {
  var _instance = null;

  function constructor() {
    return {
      requestReady: function (callback) {
        GameNet.getInstance().request("room.roomHandler.ready", {}, function (rtn) {});
      },

      requestZhuang: function (num, callback) {
        GameNet.getInstance().request("room.mjHandler.zhuang", {
          num: num
        }, function (rtn) {});
      },

      requestDisCard: function (card, callback) {
        var self = this;
        GameNet.getInstance().request("room.mjHandler.discard", {
          card: card
        }, function (rtn) {
          cc.log('room.mjHandler.discard response:%d', rtn.result);
          callback(rtn);
        });
      },

      requestPass: function (callback) {
        var self = this;
        GameNet.getInstance().request("room.mjHandler.pass", {}, function (rtn) {
          cc.log('room.mjHandler.pass response:%d', rtn.result);
          var errorCode = require('errorCode');
          if (rtn.result == errorCode.Fail) createMoveMessage('请等待其他玩家选择');
          callback(rtn);
        });
      },

      requestChiCard: function (card, myCards, callback) {
        var self = this;
        GameNet.getInstance().request("room.mjHandler.chi", {
          card: card,
          myCards: myCards
        }, function (rtn) {
          cc.log('room.mjHandler.chi response:%d', rtn.result);
          callback(rtn);
        });
      },

      requestPengCard: function (card, callback) {
        var self = this;
        GameNet.getInstance().request("room.mjHandler.peng", {
          card: card
        }, function (rtn) {
          cc.log('room.mjHandler.peng response:%d', rtn.result);
          callback(rtn);
        });
      },

      requestGangAnCard: function (myCard, callback) {
        var self = this;
        GameNet.getInstance().request("room.mjHandler.gangAn", {
          card: myCard
        }, function (rtn) {
          cc.log('room.mjHandler.gangAn response:%d', rtn.result);
          callback(rtn);
        });
      },

      requestGangMingCard: function (card, callback) {
        var self = this;
        GameNet.getInstance().request("room.mjHandler.gangMing", {
          card: card
        }, function (rtn) {
          cc.log('room.mjHandler.gangMing response:%d', rtn.result);
          callback(rtn);
        });
      },

      requestGangMingSelfCard: function (card, callback) {
        var self = this;
        GameNet.getInstance().request("room.mjHandler.gangMingSelf", {
          card: card
        }, function (rtn) {
          cc.log('room.mjHandler.gangMing response:%d', rtn.result);
          callback(rtn);
        });
      },

      requestHu: function (types, deck, obtain, callback) {
        var self = this;
        GameNet.getInstance().request("room.mjHandler.hu", {
          type: types,
          deck: deck,
          obtain: obtain
        }, function (rtn) {
          cc.log('room.mjHandler.hu response:%d', rtn.result);
          callback(rtn);
        });
      },

      requestDianPao: function (types, deck, obtain, callback) {
        var self = this;
        GameNet.getInstance().request("room.mjHandler.dianPao", {
          type: types,
          deck: deck,
          obtain: obtain
        }, function (rtn) {
          cc.log('room.mjHandler.dianPao response:%d', rtn.result);
          callback(rtn);
        });
      },

      requestYoujin: function(deck, zimo, callback) {
        var self = this;
        GameNet.getInstance().request("room.mjHandler.youJin", {deck: deck, zimo: zimo}, function(rtn) {
          cc.log('room.mjHandler.youJin response:%d', rtn.result);
          callback(rtn);
        });
      },

      requestCancelYoujin: function(callback) {
        var self = this;
        GameNet.getInstance().request("room.mjHandler.cancelYouJin", {}, function(rtn) {
          cc.log('room.mjHandler.cancelYouJin response:%d', rtn.result);
          callback(rtn);
        });
      },

      requestSetWater: function(num, callback) {
          var self = this;
          GameNet.getInstance().request("room.mjHandler.setWater", {waterNum: num}, function(rtn) {
              cc.log('room.mjHandler.setWater response:%d', rtn.result);
              callback(rtn);
          });
      },
      //樺甸
      requestOperation: function (operation,cards,isZiMoHuOnly,callback) {
        var self = this;
        GameNet.getInstance().request("room.huaDianMahjongHandler.operationReq", {operation:operation,cards:cards,isZiMoHuOnly:isZiMoHuOnly}, function (rtn) {
          //cc.log('room.mjHandler.pass response:%d', rtn.result);
          var errorCode = require('errorCode');
          if (rtn.result == errorCode.Fail) createMoveMessage('请等待其他玩家选择');
          callback(rtn);
        });
      },

      requestDisCard_HD: function (card, callback) {
        var self = this;
        GameNet.getInstance().request("room.huaDianMahjongHandler.playCardsReq", {cards:card }, function (rtn) {
          cc.log('room.huaDianMahjongHandle.playCardsReq response:%d', rtn.result);
          //if(rtn.result == ZJHCode.Fail)createMoveMessage('请等待其他玩家选择');
          callback(rtn);
        });
      },

      requestPass_HD: function (operation,cards,mcallback) {
        var self = this;
        GameNet.getInstance().request("room.huaDianMahjongHandler.operationReq", {operation:operation,cards:cards}, function (rtn) {
          //cc.log('room.mjHandler.pass response:%d', rtn.result);
          var errorCode = require('errorCode');
          if (rtn.result == errorCode.Fail) createMoveMessage('请等待其他玩家选择');
          //callback(rtn);
        });
      },

      requestPiao: function (piao,mcallback) {
        var self = this;
        GameNet.getInstance().request("room.huaDianMahjongHandler.playerPiaoReq", {piao :piao}, function (rtn) {
          //if (rtn.result == ZJHCode.Fail) createMoveMessage('请等待其他玩家选择');
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