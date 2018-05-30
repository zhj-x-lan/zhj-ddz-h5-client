var ChatHandler = (function () {
  var _instance = null;

  function constructor() {
    return {

      requestChat: function (type, data, callback) {
        var self = this;
        GameNet.getInstance().request("room.chatHandler.chatInRoom", {
          type: type,
          data: data
        }, function (rtn) {
          cc.log('room.chatHandler.chatInRoom response:%d', rtn.result);
          callback(rtn);
        });
      },


      sendRecord: function (url) {
        WriteLog('ChatHandler --> sendRecord, url : ' + url);
        GameNet.getInstance().request("room.chatHandler.chatInRoom", {
          type: 'yuyin',
          data: url
        }, function (rtn) {
          WriteLog('room.chatHandler.chatInRoom response:%d', rtn.result);
        });
      },



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