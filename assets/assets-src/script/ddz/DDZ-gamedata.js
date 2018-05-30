var GameDataDDZ = GameDataDDZ || {};
GameDataDDZ.init = function () {
    GameDataDDZ.initCreateRoomOpts();
    GameDataDDZ.initRoomData();
    pokerDDZRegistMsg();

    // console.log('init GameData, name:' + name + ' uid:' + uid);
  },
  GameDataDDZ.initRoomData = function () {
    GameDataDDZ.log = '';
    GameDataDDZ.room = {};
    GameDataDDZ.allScores = {};
    GameDataDDZ.roomsummaryData = {};
    GameDataDDZ.openScore = 0;
    GameDataDDZ.recordInfo = [];
    GameDataDDZ.currJiaofenPlayerData = {};
    GameDataDDZ.gameStartData = {};
    GameDataDDZ.currObtainPlayerData = {};
    GameDataDDZ.lastDisPokerUid = 0;
    GameDataDDZ.connectDisCard = {};
    GameDataDDZ.chuaiFlag = false;
    GameDataDDZ.tiFlag = false;
    GameDataDDZ.currtiChuaiPlayerData = {};
    GameDataDDZ.kicking = {};
    GameDataDDZ.initGameData();
    console.log('call initRoomData');
  }
GameDataDDZ.initGameData = function () {
  GameDataDDZ.game = {
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
  GameDataDDZ.cards = {};
  GameDataDDZ.resultData = {};
  console.log('call initGameData');
}

GameDataDDZ.initCreateRoomOpts = function () {
  var data = cc.sys.localStorage.getItem('DDZcreateRoomOpts');
  if (data != null) {
    GameDataDDZ.createRoomOpts = JSON.parse(data);
    return;
  }
  GameDataDDZ.createRoomOpts = {};

  GameDataDDZ.createRoomOpts.playType = 0;  //玩法类型
  GameDataDDZ.createRoomOpts.roundType = 1; //对局类型
  GameDataDDZ.createRoomOpts.roundMax = 6;  //最大局数
  GameDataDDZ.createRoomOpts.fanshu = 2;    //最大番数
  GameDataDDZ.createRoomOpts.costType = 1;  //付費類型
  GameDataDDZ.createRoomOpts.times = 1;     //倍数
  GameDataDDZ.createRoomOpts.score = 1;     //进入条件
  GameDataDDZ.createRoomOpts.jiaofenType = 1;
  GameDataDDZ.createRoomOpts.fullMark = true; //两个王或4个2叫满
  GameDataDDZ.createRoomOpts.suppress = true; //憋三家
  GameDataDDZ.createRoomOpts.detain = 0;
  GameDataDDZ.createRoomOpts.kicking = true; //踢踹
  GameDataDDZ.createRoomOpts.fourFlag = true; //四带2
}
GameDataDDZ.saveCreateRoomOpts = function () {
  cc.log('11111111111111111111111111');
  if (GameDataDDZ.createRoomOpts == null || GameDataDDZ.createRoomOpts == undefined) return;
  cc.sys.localStorage.setItem('DDZcreateRoomOpts', JSON.stringify(GameDataDDZ.createRoomOpts));
}
// GameDataDDZ.getCardHand = function(uid) {
//   if (uid == GameData.player.uid) {
//     return GameData.player.cards;
//   }
//   return 0;
// }
GameDataDDZ.getJiaofenNum = function (uid) {
  return GameDataDDZ.cards[uid]['jiaofenNum'];
}

GameDataDDZ.getDisPoker = function (uid) {
  return GameDataDDZ.cards[uid]['discards'];
}

GameDataDDZ.getHandCards = function (uid) {
  return GameDataDDZ.cards[uid]['hand'];
}

GameDataDDZ.getMyHandCards = function () {
  return GameDataDDZ.cards[GameData.player.uid]['hand'];
}

GameDataDDZ.getHandCardNum = function (uid) {
  return GameDataDDZ.cards[uid]['handnum'];
}

GameDataDDZ.setPosition = function () {
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

GameDataDDZ.getPosByUid = function(uid) {
  return GameData.tablePos[uid];
}

GameDataDDZ.isEmptyObject = function(object) {
  for (var key in object) {
    return false;
  }
  return true;
}

GameDataDDZ.clearObject = function(object) {
  for (var key in object) {
    delete object[key];
  }
  if (GameDataDDZ.isEmptyObject(object)) return true;
  return false;
}

GameDataDDZ.objectLen = function(object) {
  var len = 0;
  for (var key in object) {
    len++;
  }
  return len;
}

function pokerDDZRegistMsg() {
  // GameNet.getInstance().setCallBack('ddz-RoomMsg', function (data) {
  //   WriteLog("ddz-RoomMsg:" + JSON.stringify(data));
  //   GameData.room = data.room;
  //   GameData.player.roomid = data.room.id;
  //   GameData.joiners.splice(0, GameData.joiners.length);
  //   for (var uid in data.players) {
  //     var player = data.players[uid];
  //     GameData.joiners[player.seat] = player;
  //   }
  //   GameDataDDZ.setPosition();
  //   //GameDataDDZ.allScores.scores = data.scores;
  //   //cc.log('data.scores:'+JSON.stringify(data.scores));
  //   GameData.setGameType(GameType.Game_Poker_DDZ);
  //   sendEvent('ddz-RoomMsg', data);
  // });
  GameNet.getInstance().setCallBack('ddz-onGameInfo', function (data) {
    WriteLog("do event ddz-onGameInfo  " + JSON.stringify(data));
    GameDataDDZ.game.initcards = true;
    // GameData.game.roundType = data.roundType;
    // GameData.game.roundNum = data.roundNum;
    // GameData.game.roundmax = data.roundmax;
    sendEvent('ddz-onGameInfo', data);
  });
  GameNet.getInstance().setCallBack('ddz-initCardHandNum', function (data) {
    WriteLog("do event ddz-initCardHandNum  " + JSON.stringify(data));
    GameDataDDZ.cards[data.uid] = (GameDataDDZ.cards[data.uid] === undefined) ? {} : GameDataDDZ.cards[data.uid];
    GameDataDDZ.cards[data.uid]['handnum'] = data.num;
    //cc.log('initCardHandNum1111111111111 '+JSON.stringify(GameDataDDZ.cards[data.uid]));
    //if (data.num % 3 == 2) GameData.game.turn = data.uid;
    sendEvent('ddz-initCardHandNum');
  });

  GameNet.getInstance().setCallBack('ddz-initCardHand', function (data) {
    WriteLog("do event ddz-initCardHand  " + JSON.stringify(data));
    GameDataDDZ.cards[data.uid] = (GameDataDDZ.cards[data.uid] === undefined) ? {} : GameDataDDZ.cards[data.uid];
    GameDataDDZ.cards[data.uid]['hand'] = data.hand;
    sendEvent('ddz-initCardHand');
  });
  GameNet.getInstance().setCallBack('ddz-onReady', function (data) {
    WriteLog("do event ddz-onReady  " + JSON.stringify(data));
    sendEvent('ddz-onReady');
  });
  GameNet.getInstance().setCallBack('ddz-onGameStart', function (data) {
    WriteLog("do event ddz-onGameStart  " + JSON.stringify(data));
    GameDataDDZ.initGameData();
    GameDataDDZ.game.gameStart = true;
    sendEvent('ddz-onGameStart');
  });
  GameNet.getInstance().setCallBack('ddz-startChuai', function (data) {
    WriteLog("do event ddz-startChuai  " + JSON.stringify(data));
    GameDataDDZ.chuaiFlag = true;
    sendEvent('ddz-startChuai', data);
  });
  GameNet.getInstance().setCallBack('ddz-startTi', function (data) {
    WriteLog("do event ddz-startTi  " + JSON.stringify(data));
    GameDataDDZ.tiFlag = true;
    sendEvent('ddz-startTi', data);
  });
  GameNet.getInstance().setCallBack('ddz-showWatch', function (data) {
    WriteLog("sercerMsg  ddz-showWatch :" + JSON.stringify(data));
    GameDataDDZ.currtiChuaiPlayerData = data;
    sendEvent('ddz-showWatch', data);
  });
  GameNet.getInstance().setCallBack('ddz-showKicking', function (data) {
    WriteLog("do event ddz-showKicking  " + JSON.stringify(data));
    GameDataDDZ.kicking = data;
    sendEvent('ddz-showKicking', data);
  });
  GameNet.getInstance().setCallBack('ddz-onGameScore', function (data) {
    WriteLog("do event ddz-onGameScore  " + JSON.stringify(data));
    GameDataDDZ.resultData = data;
    GameDataDDZ.game.gameStart = false;
    GameDataDDZ.chuaiFlag = false;
    GameDataDDZ.tiFlag = false;
    sendEvent('ddz-onGameScore', data);
  });
  GameNet.getInstance().setCallBack('ddz-onGameAllScore', function (data) {
    WriteLog("do event ddz-onGameAllScore  " + JSON.stringify(data));
    GameDataDDZ.allScores = data.score;
    GameDataDDZ.roomsummaryData = data;
    //    GameData.game.gameStart = false;
    sendEvent('ddz-onGameAllScore', data);
  });
  GameNet.getInstance().setCallBack('ddz-onFirstJiaoFen', function (data) {
    WriteLog("sercerMsg  ddz-onFirstJiaoFen :" + JSON.stringify(data));
    GameDataDDZ.game.isJiaofenAgain = data.flag;
    GameDataDDZ.currJiaofenPlayerData = data;
    sendEvent('ddz-onJiaoFen', data);
  });
  GameNet.getInstance().setCallBack('ddz-nextJiaoFen', function (data) {
    WriteLog("sercerMsg  ddz-nextJiaoFen :" + JSON.stringify(data));
    for (var key in data.allJiaoFen) {
      GameDataDDZ.cards[key]['jiaofenNum'] = data.allJiaoFen[key];
    }
    GameDataDDZ.currJiaofenPlayerData = data;
    sendEvent('ddz-onJiaoFen', data);
  });
  //重连
  GameNet.getInstance().setCallBack('ddz-reconnectionInfo', function (data) {
    WriteLog("sercerMsg  ddz-reconnectionInfo :" + JSON.stringify(data));
    // for(var key in data.allJiaoFen){
    //     GameDataDDZ.cards[key]['jiaofenNum'] = data.allJiaoFen[key];
    //   }
    if (data.type == 'jiaofen') {
      GameDataDDZ.currJiaofenPlayerData = data;
      for (var key in data.allJiaoFen) {
        GameDataDDZ.cards[key]['jiaofenNum'] = data.allJiaoFen[key];
      }
    }
    sendEvent('ddz-reconnectionInfo');

    // if(data.type == 'historyInfo'){
    //   GameDataDDZ.historyData =data; 
    // }

    //GameDataDDZ.reconnectionInfo = data;
    //sendEvent('ddz-onJiaoFen',data);
  });
  GameNet.getInstance().setCallBack('ddz-openScore', function (data) {
    WriteLog("do event ddz-openScore  " + JSON.stringify(data));
    GameDataDDZ.openScore = data.open;
    sendEvent('ddz-openScore', data);
  });
  GameNet.getInstance().setCallBack('ddz-onDiZhu', function (data) {
    WriteLog("sercerMsg  ddz-onDiZhu  :" + JSON.stringify(data));
    GameDataDDZ.game.dizhuUid = data.dizhuUid;
    GameDataDDZ.gameStartData = data;
    GameDataDDZ.game.gameStartDizhu = true;
    sendEvent('ddz-onDiZhu', data);
  });
  GameNet.getInstance().setCallBack('ddz-disCardUid', function (data) {
    WriteLog("sercerMsg  ddz-disCardUid  :" + JSON.stringify(data));
    GameDataDDZ.currObtainPlayerData = data;
    sendEvent('ddz-onShowObtainNode', data);
  });
  GameNet.getInstance().setCallBack('ddz-initCardHandNums', function (data) {
    WriteLog("do event ddz-initCardHandNums  " + JSON.stringify(data));
    GameDataDDZ.cards[data.uid]['handnum'] = data.num;
    cc.log('initCardHandNums' + JSON.stringify(GameDataDDZ.cards[data.uid]));
    sendEvent('ddz-initCardHandNums', data);
    // sendEvent('ddz-initCardHandNum');
  });
  GameNet.getInstance().setCallBack('ddz-showDisPoker', function (data) {
    WriteLog("sercerMsg  ddz-showDisPoker  :" + JSON.stringify(data));
    GameDataDDZ.cards[data.uid] = (GameDataDDZ.cards[data.uid] === undefined) ? {} : GameDataDDZ.cards[data.uid];
    GameDataDDZ.cards[data.uid]['discards'] = data.cards;
    GameDataDDZ.connectDisCard[data.uid] = data.cards
    sendEvent('ddz-showDisPoker', data);
  });
  GameNet.getInstance().setCallBack('ddz-initCardHands', function (data) {
    WriteLog("do event ddz-initCardHands  " + JSON.stringify(data));
    GameDataDDZ.cards[data.uid] = (GameDataDDZ.cards[data.uid] === undefined) ? {} : GameDataDDZ.cards[data.uid];
    GameDataDDZ.cards[data.uid]['hand'] = data.hand;
    sendEvent('ddz-initCardHands', data);
  });
  GameNet.getInstance().setCallBack('ddz-cardWarning', function (data) {
    WriteLog("do event ddz-cardWarning  " + JSON.stringify(data));
    sendEvent('ddz-cardWarning', data);
  });
  GameNet.getInstance().setCallBack('ddz-onDiscardType', function (data) {
    WriteLog("do event ddz-onDiscardType  " + JSON.stringify(data));
    GameDataDDZ.lastDisPokerUid = data.uid;
    sendEvent('ddz-onDiscardType', data);
  });
  GameNet.getInstance().setCallBack('ddz-jiaoFencb', function (data) {
    WriteLog("do event ddz-jiaoFencb  " + JSON.stringify(data));
    sendEvent('ddz-jiaoFencb', data);
  });
  GameNet.getInstance().setCallBack('ddz-passcb', function (data) {
    WriteLog("do event ddz-passcb  " + JSON.stringify(data));
    GameDataDDZ.cards[data.uid]['discards'] = data.cards;
    GameDataDDZ.cards[data.nextUid]['discards'] = data.nextCards;
    sendEvent('ddz-passcb', data);
  });
  GameNet.getInstance().setCallBack('ddz-hintCard', function (data) {
    WriteLog("do event ddz-hintCard  " + JSON.stringify(data));
    sendEvent('ddz-hintCard', data);
  });
  GameNet.getInstance().setCallBack('ddz-BackTable', function (data) {
    WriteLog("do event ddz-BackTable  " + JSON.stringify(data));
    GameDataDDZ.game.initcards = true;
    //sendEvent('ddz-BackTable');
  });
  //   GameNet.getInstance().setCallBack('ddz-onBoomNum', function(data) {
  //   WriteLog("do event ddz-onBoomNum  " + JSON.stringify(data));
  //   sendEvent('ddz-onBoomNum', data);
  // });
}