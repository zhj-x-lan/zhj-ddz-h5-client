var GameDataTJDDZ = GameDataTJDDZ || {};
GameDataTJDDZ.init = function () {
    GameDataTJDDZ.initCreateRoomOpts();
    GameDataTJDDZ.initRoomData();
    pokerTJDDZRegistMsg();

    // console.log('init GameData, name:' + name + ' uid:' + uid);
  },
  GameDataTJDDZ.initRoomData = function () {
    GameDataTJDDZ.log = '';
    GameDataTJDDZ.room = {};
    GameDataTJDDZ.allScores = {};
    GameDataTJDDZ.roomsummaryData = {};
    GameDataTJDDZ.openScore = 0;
    GameDataTJDDZ.recordInfo = [];
    GameDataTJDDZ.currJiaofenPlayerData = {};
    GameDataTJDDZ.gameStartData = {};
    GameDataTJDDZ.currObtainPlayerData = {};
    GameDataTJDDZ.lastDisPokerUid = 0;
    GameDataTJDDZ.hideDisCard = {};
    GameDataTJDDZ.deal = false;
    GameDataTJDDZ.tiFlag = false;
    GameDataTJDDZ.chuaiFlag = false;
    GameDataTJDDZ.kicking = {},
    GameDataTJDDZ.currtiChuaiPlayerData = [];
    GameDataTJDDZ.connectDisCard = {};
    GameDataTJDDZ.initGameData();
    console.log('call initRoomData');
  }
GameDataTJDDZ.initGameData = function () {
  GameDataTJDDZ.handCardSize = 17;
  GameDataTJDDZ.handCardSizeMax = 20;
  GameDataTJDDZ.game = {
    roundType: 0,
    roundNum: 0,
    roundmax: 0,
    turn: 0,
    lastdisUid: 0,
    lastdisCard: 0,
    winnerUid: 0,
    dizhuUid: 0,
    gangOver: 0,
    gameStart: false,
    gameStartDizhu: false,
    initcards: false,
    onRoomDissolve: {},
    onRoomDissolveResult: {},
    onRoomDisbandTimer: {},
    onRoomReadyInfo: {},
    isJiaofenAgain: false,
  };
  GameDataTJDDZ.cards = {};
  GameDataTJDDZ.resultData = {};
  console.log('call initGameData');
}

GameDataTJDDZ.initCreateRoomOpts = function () {
  var data = cc.sys.localStorage.getItem('DDZcreateRoomOpts');
  if (data != null) {
    GameDataTJDDZ.createRoomOpts = JSON.parse(data);
    return;
  }
  GameDataTJDDZ.createRoomOpts = {};

  GameDataTJDDZ.createRoomOpts.playType = 0; //玩法类型
  GameDataTJDDZ.createRoomOpts.roundType = 1; //对局类型
  GameDataTJDDZ.createRoomOpts.roundMax = 6; //最大局数
  GameDataTJDDZ.createRoomOpts.fanshu = 2; //最大番数
  GameDataTJDDZ.createRoomOpts.costType = 1; //付費類型
  GameDataTJDDZ.createRoomOpts.jiaofenType = 1;
  GameDataTJDDZ.createRoomOpts.mud = false; //踢踹
  GameDataTJDDZ.createRoomOpts.kicking = false; //带泥儿
  GameDataTJDDZ.createRoomOpts.times = 1;     //倍数
  GameDataTJDDZ.createRoomOpts.score = 1;     //进入条件

}
GameDataTJDDZ.saveCreateRoomOpts = function () {
  if (GameDataTJDDZ.createRoomOpts == null || GameDataTJDDZ.createRoomOpts == undefined) return;
  cc.sys.localStorage.setItem('DDZcreateRoomOpts', JSON.stringify(GameDataTJDDZ.createRoomOpts));
}
// GameDataTJDDZ.getCardHand = function(uid) {
//   if (uid == GameData.player.uid) {
//     return GameData.player.cards;
//   }
//   return 0;
// }
GameDataTJDDZ.getJiaofenNum = function (uid) {
  return GameDataTJDDZ.cards[uid]['jiaofenNum'];
}

GameDataTJDDZ.getDisPoker = function (uid) {
  return GameDataTJDDZ.cards[uid]['discards'];
}

GameDataTJDDZ.getHandCards = function (uid) {
  return GameDataTJDDZ.cards[uid]['hand'];
}

GameDataTJDDZ.getMyHandCards = function () {
  if (GameDataTJDDZ.cards[GameData.player.uid] != undefined)
  {
    return GameDataTJDDZ.cards[GameData.player.uid]['hand'];
  }
}

GameDataTJDDZ.getHandCardNum = function (uid) {
  return GameDataTJDDZ.cards[uid]['handnum'];
}

GameDataTJDDZ.setPosition = function () {
  GameData.tablePos = {};
  var order;
  var index = GameData.getPlayerIndex(GameData.player.uid);

  if (GameData.room.opts == undefined)
  {
    return;
  }

  if (GameData.room.opts.joinermax == 4) {
    if (index == 0) order = ['down', 'right', 'up', 'left'];
    else if (index == 1) order = ['left', 'down', 'right', 'up'];
    else if (index == 2) order = ['up', 'left', 'down', 'right'];
    else if (index == 3) order = ['right', 'up', 'left', 'down'];
    for (var i = 0; i < GameData.joiners.length; i++) {
      if (GameData.joiners[i]) {
        GameData.tablePos[GameData.joiners[i].uid] = order[i];
      }
    }
  } else if (GameData.room.opts.joinermax == 3) {
    if (index == 0) order = ['down', 'right', 'left'];
    else if (index == 1) order = ['left', 'down', 'right'];
    else if (index == 2) order = ['right', 'left', 'down'];
    for (var i = 0; i < GameData.joiners.length; i++) {
      if (GameData.joiners[i]) {
        GameData.tablePos[GameData.joiners[i].uid] = order[i];
      }
    }
  } else if (GameData.room.opts.joinermax == 2) {
    if (index == 0) order = ['down', 'up'];
    else if (index == 1) order = ['up', 'down'];
    for (var i = 0; i < GameData.joiners.length; i++) {
      if (GameData.joiners[i]) {
        GameData.tablePos[GameData.joiners[i].uid] = order[i];
      }
    }
  }
  cc.log('table pos:' + JSON.stringify(GameData.tablePos));
}

GameDataTJDDZ.getPosByUid = function(uid) {
  return GameData.tablePos[uid];
}

GameDataTJDDZ.isEmptyObject = function(object) {
  for (var key in object) {
    return false;
  }
  return true;
}

GameDataTJDDZ.objectLen = function(object) {
  var len = 0;
  for (var key in object) {
    len++;
  }
  return len;
}

GameDataTJDDZ.clearObject = function(object) {
  for (var key in object) {
    delete object[key];
  }
  if (GameDataTJDDZ.isEmptyObject(object)) return true;
  return false;
}

function pokerTJDDZRegistMsg() {
  GameNet.getInstance().setCallBack('tjddz-hideCard', function(data) {
    WriteLog('tjddz-hideCard: ', data);
    GameDataTJDDZ.hideDisCard = data;
    sendEvent('tjddz-hideCard', data);
  });
  GameNet.getInstance().setCallBack('tjddz-onReady', function(data) {
    WriteLog('tjddz-onReady: ', data);
    sendEvent('tjddz-onReady', data);
  });
  GameNet.getInstance().setCallBack('tjddz-startChuai', function (data) {
    WriteLog("do event tjddz-startChuai  " + JSON.stringify(data));
    GameDataTJDDZ.chuaiFlag = true;
    sendEvent('tjddz-startChuai', data);
  });
  GameNet.getInstance().setCallBack('tjddz-startTi', function (data) {
    WriteLog("do event tjddz-startTi  " + JSON.stringify(data));
    GameDataTJDDZ.tiFlag = true;
    sendEvent('tjddz-startTi', data);
  });
  GameNet.getInstance().setCallBack('tjddz-showKicking', function (data) {
    WriteLog("do event tjddz-showKicking  " + JSON.stringify(data));
    GameDataTJDDZ.kicking = data;
    sendEvent('tjddz-showKicking', data);
  });
  GameNet.getInstance().setCallBack('tjddz-onGameInfo', function (data) {
    WriteLog("do event tjddz-onGameInfo  " + JSON.stringify(data));
    GameDataTJDDZ.game.initcards = true;
    GameDataTJDDZ.deal = false;
    // GameData.game.roundType = data.roundType;
    // GameData.game.roundNum = data.roundNum;
    // GameData.game.roundmax = data.roundmax;
    sendEvent('tjddz-onGameInfo', data);
  });
  GameNet.getInstance().setCallBack('tjddz-initCardHandNum', function (data) {
    WriteLog("do event tjddz-initCardHandNum  " + JSON.stringify(data));
    GameDataTJDDZ.cards[data.uid] = (GameDataTJDDZ.cards[data.uid] === undefined) ? {} : GameDataTJDDZ.cards[data.uid];
    GameDataTJDDZ.cards[data.uid]['handnum'] = data.num;
    //cc.log('initCardHandNum1111111111111 '+JSON.stringify(GameDataTJDDZ.cards[data.uid]));
    //if (data.num % 3 == 2) GameData.game.turn = data.uid;
    sendEvent('tjddz-initCardHandNum');
  });

  GameNet.getInstance().setCallBack('tjddz-initCardHand', function (data) {
    WriteLog("do event tjddz-initCardHand  " + JSON.stringify(data));
    GameDataTJDDZ.cards[data.uid] = (GameDataTJDDZ.cards[data.uid] === undefined) ? {} : GameDataTJDDZ.cards[data.uid];
    GameDataTJDDZ.cards[data.uid]['hand'] = data.hand;
    sendEvent('tjddz-initCardHand');
  });
  GameNet.getInstance().setCallBack('tjddz-onGameStart', function (data) {
    WriteLog("do event tjddz-onGameStart  " + JSON.stringify(data));
    GameDataTJDDZ.initGameData();
    GameDataTJDDZ.game.gameStart = true;
    GameDataTJDDZ.deal = true;
    sendEvent('tjddz-onGameStart');
  });
  GameNet.getInstance().setCallBack('tjddz-onGameScore', function (data) {
    WriteLog("do event tjddz-onGameScore  " + JSON.stringify(data));
    GameDataTJDDZ.resultData = data;
    GameDataTJDDZ.game.gameStart = false;
    GameDataTJDDZ.tiFlag = false;
    GameDataTJDDZ.chuaiFlag = false;
    sendEvent('tjddz-onGameScore', data);
  });
  GameNet.getInstance().setCallBack('tjddz-onGameAllScore', function (data) {
    WriteLog("do event tjddz-onGameAllScore  " + JSON.stringify(data));
    GameDataTJDDZ.allScores = data.score;
    GameDataTJDDZ.roomsummaryData = data;
    //    GameData.game.gameStart = false;
    sendEvent('tjddz-onGameAllScore', data);
  });
  GameNet.getInstance().setCallBack('tjddz-onFirstJiaoFen', function (data) {
    WriteLog("sercerMsg  tjddz-onFirstJiaoFen :" + JSON.stringify(data));
    GameDataTJDDZ.game.isJiaofenAgain = data.flag;
    GameDataTJDDZ.currJiaofenPlayerData = data;
    sendEvent('tjddz-onJiaoFen', data);
  });//
  GameNet.getInstance().setCallBack('tjddz-showWatch', function (data) {
    WriteLog("sercerMsg  tjddz-showWatch :" + JSON.stringify(data));
    GameDataTJDDZ.currtiChuaiPlayerData = data;
    sendEvent('tjddz-showWatch', data);
  });
  GameNet.getInstance().setCallBack('tjddz-nextJiaoFen', function (data) {
    WriteLog("sercerMsg  tjddz-nextJiaoFen :" + JSON.stringify(data));
    for (var key in data.allJiaoFen) {
      GameDataTJDDZ.cards[key]['jiaofenNum'] = data.allJiaoFen[key];
    }
    GameDataTJDDZ.currJiaofenPlayerData = data;
    sendEvent('tjddz-onJiaoFen', data);
  });
  //重连
  GameNet.getInstance().setCallBack('tjddz-reconnectionInfo', function (data) {
    WriteLog("sercerMsg  tjddz-reconnectionInfo :" + JSON.stringify(data));
    // for(var key in data.allJiaoFen){
    //     GameDataTJDDZ.cards[key]['jiaofenNum'] = data.allJiaoFen[key];
    //   }
    if (data.type == 'jiaofen') {
      GameDataTJDDZ.currJiaofenPlayerData = data;
      for (var key in data.allJiaoFen) {
        GameDataTJDDZ.cards[key]['jiaofenNum'] = data.allJiaoFen[key];
      }
    }
    sendEvent('tjddz-reconnectionInfo');
    // if(data.type == 'historyInfo'){
    //   GameDataTJDDZ.historyData =data; 
    // }

    //GameDataTJDDZ.reconnectionInfo = data;
    //sendEvent('tjddz-onJiaoFen',data);
  });
  GameNet.getInstance().setCallBack('tjddz-openScore', function (data) {
    WriteLog("do event tjddz-openScore  " + JSON.stringify(data));
    GameDataTJDDZ.openScore = data.open;
    sendEvent('tjddz-openScore', data);
  });
  GameNet.getInstance().setCallBack('tjddz-onDiZhu', function (data) {
    WriteLog("sercerMsg  tjddz-onDiZhu  :" + JSON.stringify(data));
    GameDataTJDDZ.game.dizhuUid = data.dizhuUid;
    GameDataTJDDZ.gameStartData = data;
    GameDataTJDDZ.game.gameStartDizhu = true;
    sendEvent('tjddz-onDiZhu', data);
  });
  GameNet.getInstance().setCallBack('tjddz-disCardUid', function (data) {
    WriteLog("sercerMsg  tjddz-disCardUid  :" + JSON.stringify(data));
    GameDataTJDDZ.currObtainPlayerData = data;
    sendEvent('tjddz-onShowObtainNode', data);
  });
  GameNet.getInstance().setCallBack('tjddz-initCardHandNums', function (data) {
    WriteLog("do event tjddz-initCardHandNums  " + JSON.stringify(data));
    GameDataTJDDZ.cards[data.uid]['handnum'] = data.num;
    cc.log('initCardHandNums' + JSON.stringify(GameDataTJDDZ.cards[data.uid]));
    // sendEvent('tjddz-initCardHandNums', data);
    sendEvent('tjddz-initCardHandNums');
  });
  GameNet.getInstance().setCallBack('tjddz-showDisPoker', function (data) {
    WriteLog("sercerMsg  tjddz-showDisPoker  :" + JSON.stringify(data));
    GameDataTJDDZ.cards[data.uid] = (GameDataTJDDZ.cards[data.uid] === undefined) ? {} : GameDataTJDDZ.cards[data.uid];
    GameDataTJDDZ.cards[data.uid]['discards'] = data.cards;
    GameDataTJDDZ.connectDisCard[data.uid] = data.cards
    sendEvent('tjddz-showDisPoker', data);
  });
  GameNet.getInstance().setCallBack('tjddz-initCardHands', function (data) {
    WriteLog("do event tjddz-initCardHands  " + JSON.stringify(data));
    GameDataTJDDZ.cards[data.uid] = (GameDataTJDDZ.cards[data.uid] === undefined) ? {} : GameDataTJDDZ.cards[data.uid];
    GameDataTJDDZ.cards[data.uid]['hand'] = data.hand;
    sendEvent('tjddz-initCardHands', data);
  });
  GameNet.getInstance().setCallBack('tjddz-cardWarning', function (data) {
    WriteLog("do event tjddz-cardWarning  " + JSON.stringify(data));
    sendEvent('tjddz-cardWarning', data);
  });
  GameNet.getInstance().setCallBack('tjddz-onDiscardType', function (data) {
    WriteLog("do event tjddz-onDiscardType  " + JSON.stringify(data));
    GameDataTJDDZ.lastDisPokerUid = data.uid;
    sendEvent('tjddz-onDiscardType', data);
  });
  GameNet.getInstance().setCallBack('tjddz-jiaoFencb', function (data) {
    WriteLog("do event tjddz-jiaoFencb  " + JSON.stringify(data));
    sendEvent('tjddz-jiaoFencb', data);
  });
  GameNet.getInstance().setCallBack('tjddz-passcb', function (data) {
    WriteLog("do event tjddz-passcb  " + JSON.stringify(data));
    GameDataTJDDZ.cards[data.uid]['discards'] = data.cards;
    GameDataTJDDZ.cards[data.nextUid]['discards'] = data.nextCards;
    sendEvent('tjddz-passcb', data);
  });
  GameNet.getInstance().setCallBack('tjddz-hintCard', function (data) {
    WriteLog("do event tjddz-hintCard  " + JSON.stringify(data));
    sendEvent('tjddz-hintCard', data);
  });
  GameNet.getInstance().setCallBack('tjddz-BackTable', function (data) {
    WriteLog("do event tjddz-BackTable  " + JSON.stringify(data));
    GameDataTJDDZ.game.initcards = true;
    //sendEvent('tjddz-BackTable');
  });
  //   GameNet.getInstance().setCallBack('tjddz-onBoomNum', function(data) {
  //   WriteLog("do event tjddz-onBoomNum  " + JSON.stringify(data));
  //   sendEvent('tjddz-onBoomNum', data);
  // });
}