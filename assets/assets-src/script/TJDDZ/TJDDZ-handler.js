var TJDDZHandler = (function () {
  var _instance = null;

  function constructor() {
    return {
      quitRoom: function (roomid) {
        RoomHandler.quitRoom(roomid);
      },
      deleteRoom: function (roomid, action) {
        RoomHandler.deleteRoom(roomid, action);
      },
      requestReady: function (callback) {
        GameNet.getInstance().request("room.roomHandler.ready", {}, function (rtn) {});
      },
      requestSelectScore: function (num, callback) {
        var self = this;
        GameNet.getInstance().request("room.pokerTJDdzHandler.jiaofen", {
          num: num
        }, function (rtn) {
          callback(rtn);
        });
      },
      requestTiChuai: function (num, callback) {
        var self = this;
        GameNet.getInstance().request("room.pokerTJDdzHandler.tichuai", {
          num: num
        }, function (rtn) {
          callback(rtn);
        });
      },
      requestOnPassCard: function (callback) {
        var self = this;
        GameNet.getInstance().request("room.pokerTJDdzHandler.pass", {}, function (rtn) {
          callback(rtn);
        });
      },
      requestOnHintCard: function (callback) {
        var self = this;
        GameNet.getInstance().request("room.pokerTJDdzHandler.hint", {}, function (rtn) {
          var errorCode = require('errorCode');
          if (rtn.result == errorCode.NotHavePokerDis) {
            createMoveMessage('没有大过上家的牌');
            return;
          }
          callback(rtn);
        });
      },
      requestOnDisCard: function (cards, callback) {
        var self = this;
        GameNet.getInstance().request("room.pokerTJDdzHandler.discard", {
          cards: cards
        }, function (rtn) {
          var errorCode = require('errorCode');
          if (rtn.result == errorCode.NotPokerDis) {
            createMoveMessage('大不过上家的牌');
          }
          else if (rtn.result == errorCode.HandPatternsError) {
            createMoveMessage('出牌牌形错误');
          }
          callback(rtn);
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