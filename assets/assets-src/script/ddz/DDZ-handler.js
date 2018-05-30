var DDZHandler = (function () {
  var _instance = null;

  function constructor() {
    return {
      requestReady: function (callback) {
        GameNet.getInstance().request("room.roomHandler.ready", {}, function (rtn) {});
      },
      requestSelectScore: function (num, callback) {
        var self = this;
        GameNet.getInstance().request("room.pokerDdzHandler.jiaofen", {
          num: num
        }, function (rtn) {
          callback(rtn);
        });
      },
      requestTiChuai: function (num, callback) {
        var self = this;
        GameNet.getInstance().request("room.pokerDdzHandler.tichuai", {
          num: num
        }, function (rtn) {
          callback(rtn);
        });
      },
      requestOnPassCard: function (callback) {
        var self = this;
        GameNet.getInstance().request("room.pokerDdzHandler.pass", {}, function (rtn) {
          callback(rtn)
        });
      },
      requestOnHintCard: function (uid, callback) {
        var self = this;
        GameNet.getInstance().request("room.pokerDdzHandler.hint", {}, function (rtn) {
          var errorCode = require('errorCode');
          if (rtn.result == errorCode.NotHavePokerDis) {
            createMoveMessage('没有大过上家的牌');
            return
          }
          callback(rtn);
        });
      },
      requestOnDisCard: function (cards, callback) {
        var self = this;
        GameNet.getInstance().request("room.pokerDdzHandler.discard", {
          cards: cards
        }, function (rtn) {
          var errorCode = require('errorCode');
          if (rtn.result == errorCode.NotPokerDis) createMoveMessage('大不过上家的牌');
          else if (rtn.result == errorCode.HandPatternsError) createMoveMessage('出牌牌形错误');
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