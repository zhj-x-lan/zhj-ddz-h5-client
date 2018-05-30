var TDKHandler = (function() {
  var _instance = null;

  function constructor() {
    return {
      requestReady: function(callback) {
        GameNet.getInstance().request("room.pokerDdzHandler.ready", {}, function(rtn) {});
      },
      requestOnPassCard: function(callback) {
        var self = this;
        GameNet.getInstance().request("room.pokerDdzHandler.pass", {}, function(rtn) {
          callback(rtn);
        });
      },
      requestStartGame: function(callback) {
        GameNet.getInstance().request("room.pokerTdkHandler.startGame", {}, function(rtn) {
          var errorCode = require('errorCode');
          if(rtn.result == errorCode.Fail){
             createMoveMessage('抱歉,人数不满不能开始游戏!');
          }
        });
      },


      /*
      **牌局中指令
      */
      requestFollowBet: function(){
        GameNet.getInstance().request("room.pokerTdkHandler.flow", {}, function(rtn) {
        });
      },

      requestIncBet: function(score){
        var data = {score: score};
        GameNet.getInstance().request("room.pokerTdkHandler.inc", data, function(rtn) {
        });
      },

      requestPass: function(){
        GameNet.getInstance().request("room.pokerTdkHandler.pass", {}, function(rtn) {
        });
      },

      requestAllInc: function(){
        GameNet.getInstance().request("room.pokerTdkHandler.allin", {}, function(rtn) {
        });
      },

      requestDrop: function(){
        GameNet.getInstance().request("room.pokerTdkHandler.drop", {}, function(rtn) {
        });
      },
    };
  }
  return {
    getInstance: function() {
      if(_instance == null) {
        _instance = constructor();
      }
      return _instance;
    }
  }
})();
