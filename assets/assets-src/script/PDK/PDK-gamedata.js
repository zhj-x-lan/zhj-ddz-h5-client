var GameDataPDK = GameDataPDK || {};
GameDataPDK.init = function () {
    GameDataPDK.initCreateRoomOpts();
    GameDataPDK.initRoomData();
    pokerPDKRegistMsg();
  },
  GameDataPDK.initRoomData = function () {
    GameDataPDK.log = '';
    GameDataPDK.room = {};
    GameDataPDK.allScores = {};
    GameDataPDK.roomsummaryData = {};
    GameDataPDK.openScore = 0;
    GameDataPDK.recordInfo = [];
    GameDataPDK.currJiaofenPlayerData = {};
    GameDataPDK.gameStartData = {};
    GameDataPDK.currObtainPlayerData = {};
    GameDataPDK.lastDisPokerUid = 0;
    GameDataPDK.hideDisCard = {};
    GameDataPDK.deal = false;
    GameDataPDK.tiFlag = false;
    GameDataPDK.chuaiFlag = false;
    GameDataPDK.kicking = {},
    GameDataPDK.currtiChuaiPlayerData = [];
    GameDataPDK.connectDisCard = {};
    GameDataPDK.boomNum = 0;
    GameDataPDK.initGameData();
  }
GameDataPDK.initGameData = function () {
  GameDataPDK.handCardSize = 16;
  GameDataPDK.handCardSizeMax = 16;
  GameDataPDK.game = {
    roundType: 0,
    roundNum: 0,
    roundmax: 0,
    turn: 0,
    lastdisUid: 0,
    lastdisCard: 0,
    winnerUid: 0,
    zhuangUid: 0,
    gangOver: 0,
    gameStart: false,
    gameStartZhuang: false,
    initcards: false,
    onRoomDissolve: {},
    onRoomDissolveResult: {},
    onRoomDisbandTimer: {},
    onRoomReadyInfo: {},
    isJiaofenAgain: false,
  };
  GameDataPDK.cards = {};
  GameDataPDK.resultData = {};
  console.log('call initGameData');
}

GameDataPDK.initCreateRoomOpts = function () {
  var data = cc.sys.localStorage.getItem('DDZcreateRoomOpts');
  if (data != null) {
    GameDataPDK.createRoomOpts = JSON.parse(data);
    return;
  }
  GameDataPDK.createRoomOpts = {};

  GameDataPDK.createRoomOpts.playType = 0; //玩法类型
  GameDataPDK.createRoomOpts.roundMax = 10; //最大局数
  GameDataPDK.createRoomOpts.fanshu = 2; //最大番数
  GameDataPDK.createRoomOpts.costType = 1; //付費類型
  GameDataPDK.createRoomOpts.joinermax = 3;
  GameDataPDK.createRoomOpts.times = 1;     //倍数
  GameDataPDK.createRoomOpts.score = 1;     //进入条件
  GameDataPDK.createRoomOpts.zhuangType = true; //红桃三先出
}
GameDataPDK.saveCreateRoomOpts = function () {
  if (GameDataPDK.createRoomOpts == null || GameDataPDK.createRoomOpts == undefined) return;
  cc.sys.localStorage.setItem('DDZcreateRoomOpts', JSON.stringify(GameDataPDK.createRoomOpts));
}
// GameDataPDK.getCardHand = function(uid) {
//   if (uid == GameData.player.uid) {
//     return GameData.player.cards;
//   }
//   return 0;
// }
GameDataPDK.getHandCardSize = function() {
  if (GameData.room.opts.joinermax == 3)
  {
    GameDataPDK.handCardSize = 16;
    GameDataPDK.handCardSizeMax = 16;
  }
  else if (GameData.room.opts.joinermax == 2)
  {
    GameDataPDK.handCardSize = 17;
    GameDataPDK.handCardSizeMax = 17;
  }
}
GameDataPDK.getJiaofenNum = function (uid) {
  return GameDataPDK.cards[uid]['jiaofenNum'];
}

GameDataPDK.getDisPoker = function (uid) {
  return GameDataPDK.cards[uid]['discards'];
}

GameDataPDK.getHandCards = function (uid) {
  if (GameDataPDK.cards[uid] == undefined)
  {
    return null;
  }
  if (GameDataPDK.cards[uid]['hand'] != undefined)
  {
    return GameDataPDK.cards[uid]['hand'];
  }
  return null;
}

GameDataPDK.getMyHandCards = function () {
  if (GameDataPDK.cards[GameData.player.uid] != undefined)
  {
    return GameDataPDK.cards[GameData.player.uid]['hand'];
  }
  return null;
}

GameDataPDK.getHandCardNum = function (uid) {
  if (GameDataPDK.cards[uid] == undefined)
  {
    return null;
  }
  if (GameDataPDK.cards[uid]['handnum'] != undefined)
  {
    return GameDataPDK.cards[uid]['handnum'];
  }
  return null;
}

GameDataPDK.setPosition = function () {
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
    if (index == 0) order = ['down', 'right'];
    else if (index == 1) order = ['right', 'down'];
    for (var i = 0; i < GameData.joiners.length; i++) {
      if (GameData.joiners[i]) {
        GameData.tablePos[GameData.joiners[i].uid] = order[i];
      }
    }
  }
  cc.log('table pos:' + JSON.stringify(GameData.tablePos));
}

GameDataPDK.getPosByUid = function(uid) {
  return GameData.tablePos[uid];
}

GameDataPDK.isEmptyObject = function(object) {
  for (var key in object) {
    return false;
  }
  return true;
}

GameDataPDK.objectLen = function(object) {
  var len = 0;
  for (var key in object) {
    len++;
  }
  return len;
}

GameDataPDK.clearObject = function(object) {
  for (var key in object) {
    delete object[key];
  }
  if (GameDataPDK.isEmptyObject(object)) return true;
  return false;
}

function pokerPDKRegistMsg() {
  GameNet.getInstance().setCallBack('pdk-hideCard', function(data) {
    WriteLog('pdk-hideCard: ', data);
    GameDataPDK.hideDisCard = data;
    sendEvent('pdk-hideCard', data);
  });
  GameNet.getInstance().setCallBack('pdk-onReady', function(data) {
    WriteLog('pdk-onReady: ', data);
    sendEvent('pdk-onReady', data);
  });
  GameNet.getInstance().setCallBack('pdk-startChuai', function (data) {
    WriteLog("do event pdk-startChuai  " + JSON.stringify(data));
    GameDataPDK.chuaiFlag = true;
    sendEvent('pdk-startChuai', data);
  });
  GameNet.getInstance().setCallBack('pdk-startTi', function (data) {
    WriteLog("do event pdk-startTi  " + JSON.stringify(data));
    GameDataPDK.tiFlag = true;
    sendEvent('pdk-startTi', data);
  });
  GameNet.getInstance().setCallBack('pdk-showKicking', function (data) {
    WriteLog("do event pdk-showKicking  " + JSON.stringify(data));
    GameDataPDK.kicking = data;
    sendEvent('pdk-showKicking', data);
  });
  GameNet.getInstance().setCallBack('pdk-onGameInfo', function (data) {
    WriteLog("do event pdk-onGameInfo  " + JSON.stringify(data));
    GameDataPDK.game.initcards = true;
    GameDataPDK.deal = false;
    // GameData.game.roundType = data.roundType;
    // GameData.game.roundNum = data.roundNum;
    // GameData.game.roundmax = data.roundmax;
    sendEvent('pdk-onGameInfo', data);
  });
  GameNet.getInstance().setCallBack('pdk-initCardHandNum', function (data) {
    WriteLog("do event pdk-initCardHandNum  " + JSON.stringify(data));
    GameDataPDK.cards[data.uid] = (GameDataPDK.cards[data.uid] === undefined) ? {} : GameDataPDK.cards[data.uid];
    GameDataPDK.cards[data.uid]['handnum'] = data.num;
    //cc.log('initCardHandNum1111111111111 '+JSON.stringify(GameDataPDK.cards[data.uid]));
    //if (data.num % 3 == 2) GameData.game.turn = data.uid;
    sendEvent('pdk-initCardHandNum');
  });

  GameNet.getInstance().setCallBack('pdk-initCardHand', function (data) {
    WriteLog("do event pdk-initCardHand  " + JSON.stringify(data));
    GameDataPDK.cards[data.uid] = (GameDataPDK.cards[data.uid] === undefined) ? {} : GameDataPDK.cards[data.uid];
    GameDataPDK.cards[data.uid]['hand'] = data.hand;
    sendEvent('pdk-initCardHand');
  });
  GameNet.getInstance().setCallBack('pdk-onGameStart', function (data) {
    WriteLog("do event pdk-onGameStart  " + JSON.stringify(data));
    GameDataPDK.initGameData();
    GameDataPDK.game.gameStart = true;
    GameDataPDK.deal = true;
    sendEvent('pdk-onGameStart');
  });
  GameNet.getInstance().setCallBack('pdk-onGameScore', function (data) {
    WriteLog("do event pdk-onGameScore  " + JSON.stringify(data));
    GameDataPDK.resultData = data;
    GameDataPDK.game.gameStart = false;
    GameDataPDK.tiFlag = false;
    GameDataPDK.chuaiFlag = false;
    sendEvent('pdk-onGameScore', data);
  });
  GameNet.getInstance().setCallBack('pdk-onGameAllScore', function (data) {
    WriteLog("do event pdk-onGameAllScore  " + JSON.stringify(data));
    GameDataPDK.allScores = data.score;
    GameDataPDK.roomsummaryData = data;
    //    GameData.game.gameStart = false;
    sendEvent('pdk-onGameAllScore', data);
  });
  GameNet.getInstance().setCallBack('pdk-onFirstJiaoFen', function (data) {
    WriteLog("sercerMsg  pdk-onFirstJiaoFen :" + JSON.stringify(data));
    GameDataPDK.game.isJiaofenAgain = data.flag;
    GameDataPDK.currJiaofenPlayerData = data;
    sendEvent('pdk-onJiaoFen', data);
  });//
  GameNet.getInstance().setCallBack('pdk-showWatch', function (data) {
    WriteLog("sercerMsg  pdk-showWatch :" + JSON.stringify(data));
    GameDataPDK.currtiChuaiPlayerData = data;
    sendEvent('pdk-showWatch', data);
  });
  GameNet.getInstance().setCallBack('pdk-nextJiaoFen', function (data) {
    WriteLog("sercerMsg  pdk-nextJiaoFen :" + JSON.stringify(data));
    for (var key in data.allJiaoFen) {
      GameDataPDK.cards[key]['jiaofenNum'] = data.allJiaoFen[key];
    }
    GameDataPDK.currJiaofenPlayerData = data;
    sendEvent('pdk-onJiaoFen', data);
  });
  //重连
  GameNet.getInstance().setCallBack('pdk-reconnectionInfo', function (data) {
    WriteLog("sercerMsg  pdk-reconnectionInfo :" + JSON.stringify(data));
    // for(var key in data.allJiaoFen){
    //     GameDataPDK.cards[key]['jiaofenNum'] = data.allJiaoFen[key];
    //   }
    if (data.type == 'jiaofen') {
      GameDataPDK.currJiaofenPlayerData = data;
      for (var key in data.allJiaoFen) {
        GameDataPDK.cards[key]['jiaofenNum'] = data.allJiaoFen[key];
      }
    }
    sendEvent('pdk-reconnectionInfo');
    // if(data.type == 'historyInfo'){
    //   GameDataPDK.historyData =data; 
    // }

    //GameDataPDK.reconnectionInfo = data;
    //sendEvent('pdk-onJiaoFen',data);
  });
  GameNet.getInstance().setCallBack('pdk-openScore', function (data) {
    WriteLog("do event pdk-openScore  " + JSON.stringify(data));
    GameDataPDK.openScore = data.open;
    sendEvent('pdk-openScore', data);
  });
  GameNet.getInstance().setCallBack('pdk-onZhuang', function (data) {
    WriteLog("sercerMsg  pdk-onZhuang  :" + JSON.stringify(data));
    GameDataPDK.game.zhuangUid = data.zhuang;
    GameDataPDK.gameStartData = data;
    GameDataPDK.game.gameStartZhuang = true;
    sendEvent('pdk-onZhuang', data);
  });
  GameNet.getInstance().setCallBack('pdk-disCardUid', function (data) {
    WriteLog("sercerMsg  pdk-disCardUid  :" + JSON.stringify(data));
    GameDataPDK.currObtainPlayerData = data;
    sendEvent('pdk-onShowObtainNode', data);
  });
  GameNet.getInstance().setCallBack('pdk-initCardHandNums', function (data) {
    WriteLog("do event pdk-initCardHandNums  " + JSON.stringify(data));
    GameDataPDK.cards[data.uid]['handnum'] = data.num;
    cc.log('initCardHandNums' + JSON.stringify(GameDataPDK.cards[data.uid]));
    // sendEvent('pdk-initCardHandNums', data);
    sendEvent('pdk-initCardHandNums');
  });
  GameNet.getInstance().setCallBack('pdk-showDisPoker', function (data) {
    WriteLog("sercerMsg  pdk-showDisPoker  :" + JSON.stringify(data));
    GameDataPDK.cards[data.uid] = (GameDataPDK.cards[data.uid] === undefined) ? {} : GameDataPDK.cards[data.uid];
    GameDataPDK.cards[data.uid]['discards'] = data.cards;
    GameDataPDK.connectDisCard[data.uid] = data.cards;
    GameDataPDK.boomNum = data.boomNum;
    sendEvent('pdk-showDisPoker', data);
  });
  GameNet.getInstance().setCallBack('pdk-initCardHands', function (data) {
    WriteLog("do event pdk-initCardHands  " + JSON.stringify(data));
    GameDataPDK.cards[data.uid] = (GameDataPDK.cards[data.uid] === undefined) ? {} : GameDataPDK.cards[data.uid];
    GameDataPDK.cards[data.uid]['hand'] = data.hand;
    sendEvent('pdk-initCardHands', data);
  });
  GameNet.getInstance().setCallBack('pdk-cardWarning', function (data) {
    WriteLog("do event pdk-cardWarning  " + JSON.stringify(data));
    sendEvent('pdk-cardWarning', data);
  });
  GameNet.getInstance().setCallBack('pdk-onDiscardType', function (data) {
    WriteLog("do event pdk-onDiscardType  " + JSON.stringify(data));
    GameDataPDK.lastDisPokerUid = data.uid;
    sendEvent('pdk-onDiscardType', data);
  });
  GameNet.getInstance().setCallBack('pdk-jiaoFencb', function (data) {
    WriteLog("do event pdk-jiaoFencb  " + JSON.stringify(data));
    sendEvent('pdk-jiaoFencb', data);
  });
  GameNet.getInstance().setCallBack('pdk-passcb', function (data) {
    WriteLog("do event pdk-passcb  " + JSON.stringify(data));
    GameDataPDK.cards[data.uid]['discards'] = data.cards;
    GameDataPDK.cards[data.nextUid]['discards'] = data.nextCards;
    sendEvent('pdk-passcb', data);
  });
  GameNet.getInstance().setCallBack('pdk-hintCard', function (data) {
    WriteLog("do event pdk-hintCard  " + JSON.stringify(data));
    sendEvent('pdk-hintCard', data);
  });
  GameNet.getInstance().setCallBack('pdk-BackTable', function (data) {
    WriteLog("do event pdk-BackTable  " + JSON.stringify(data));
    GameDataPDK.game.initcards = true;
    //sendEvent('pdk-BackTable');
  });
  //   GameNet.getInstance().setCallBack('pdk-onBoomNum', function(data) {
  //   WriteLog("do event pdk-onBoomNum  " + JSON.stringify(data));
  //   sendEvent('pdk-onBoomNum', data);
  // });
}