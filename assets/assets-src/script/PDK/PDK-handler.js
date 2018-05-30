// var PDKHandler = (function () {
//   var _instance = null;

//   function constructor() {
//     return {
//       quitRoom: function (roomid) {
//         RoomHandler.quitRoom(roomid);
//       },
//       deleteRoom: function (roomid, action) {
//         RoomHandler.deleteRoom(roomid, action);
//       },
//       requestReady: function (callback) {
//         GameNet.getInstance().request("room.roomHandler.ready", {}, function (rtn) {});
//       },
//       requestSelectScore: function (num, callback) {
//         var self = this;
//         GameNet.getInstance().request("room.pokerPdkHandler.jiaofen", {
//           num: num
//         }, function (rtn) {
//           callback(rtn);
//         });
//       },
//       requestTiChuai: function (num, callback) {
//         var self = this;
//         GameNet.getInstance().request("room.pokerPdkHandler.tichuai", {
//           num: num
//         }, function (rtn) {
//           callback(rtn);
//         });
//       },
//       requestOnPassCard: function (callback) {
//         var self = this;
//         GameNet.getInstance().request("room.pokerPdkHandler.pass", {}, function (rtn) {
//           callback(rtn);
//         });
//       },
//       requestOnHintCard: function (callback) {
//         var self = this;
//         GameNet.getInstance().request("room.pokerPdkHandler.hint", {}, function (rtn) {
//           if (rtn.result == errorCode.NotHavePokerDis) 
//           {
//             createMoveMessage('没有大过上家的牌');
//             return;
//           }
//           callback(rtn);
//         });
//       },
//       requestOnDisCard: function (cards, callback) {
//         var self = this;
//         GameNet.getInstance().request("room.pokerPdkHandler.discard", {
//           cards: cards
//         }, function (rtn) {
//           if (rtn.result == errorCode.NotPokerDis) 
//           {
//             createMoveMessage('大不过上家的牌');
//           }
//           else if (rtn.result == errorCode.HandPatternsError) 
//           {
//             createMoveMessage('出牌牌形错误');
//           }
//           callback(rtn);
//         });
//       }
//     };
//   }

//   return {
//     getInstance: function () {
//       if (_instance == null) {
//         _instance = constructor();
//       }
//       return _instance;
//     }
//   }
// })();
var errorCode = require('errorCode');
var PDKHandler = {

};

module.exports = PDKHandler;

PDKHandler.quitRoom = function (roomid) {
        RoomHandler.quitRoom(roomid);
};

PDKHandler.quitRoom = function (roomid) {
  RoomHandler.quitRoom(roomid);
};
PDKHandler.deleteRoom = function (roomid, action) {
  RoomHandler.deleteRoom(roomid, action);
};
PDKHandler.requestReady = function (callback) {
  GameNet.getInstance().request("room.roomHandler.ready", {}, function (rtn) {});
};
PDKHandler.requestSelectScore = function (num, callback) {
  var self = this;
  GameNet.getInstance().request("room.pokerPdkHandler.jiaofen", {
    num: num
  }, function (rtn) {
    callback(rtn);
  });
};
PDKHandler.requestTiChuai = function (num, callback) {
  var self = this;
  GameNet.getInstance().request("room.pokerPdkHandler.tichuai", {
    num: num
  }, function (rtn) {
    callback(rtn);
  });
};
PDKHandler.requestOnPassCard = function (callback) {
  var self = this;
  GameNet.getInstance().request("room.pokerPdkHandler.pass", {}, function (rtn) {
    callback(rtn);
  });
},
PDKHandler.requestOnHintCard = function (callback) {
  var self = this;
  GameNet.getInstance().request("room.pokerPdkHandler.hint", {}, function (rtn) {
    if (rtn.result == errorCode.NotHavePokerDis) 
    {
      createMoveMessage('没有大过上家的牌');
      return;
    }
    callback(rtn);
  });
};
PDKHandler.requestOnDisCard = function (cards, callback) {
  var self = this;
  GameNet.getInstance().request("room.pokerPdkHandler.discard", {
    cards: cards
  }, function (rtn) {
    if (rtn.result == errorCode.NotPokerDis) 
    {
      createMoveMessage('大不过上家的牌');
    }
    else if (rtn.result == errorCode.HandPatternsError) 
    {
      createMoveMessage('出牌牌形错误');
    }
    else if (rtn.result == errorCode.MaxCardPut)
    {
      createMoveMessage('下家报单，必须出最大的单牌');
    }
    else if (rtn.result == errorCode.NotHaveThreePoker)
    {
      createMoveMessage('出牌组合不含有红桃三');
    }
    callback(rtn);
  });
}