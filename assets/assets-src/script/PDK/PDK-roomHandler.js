var room_pdk = {
    allScores: {},
    roomsummaryData: {},
    openScore: 0,
    recordInfo: [],
    currJiaofenPlayerData: {},
    gameStartData: {},
    currObtainPlayerData: {},
    lastDisPokerUid: 0,
    hideDisCard: {},
    deal: false,
    tiFlag: false,
    chuaiFlag: false,
    kicking: {},
    currtiChuaiPlayerData: [],

    handCardSize: 17,
    handCardSizeMax: 20,
    game: {
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
    },
    cards: {},
    resultData: {},
    createRoomOpts: {},
};

module.exports = room_pdk;

room_pdk.initCreateRoomOpts = function () {
  var data = cc.sys.localStorage.getItem('DDZcreateRoomOpts');
  if (data != null) {
    room_pdk.createRoomOpts = JSON.parse(data);
    return;
  }
  room_pdk.createRoomOpts = {};
  room_pdk.createRoomOpts.roomTypes = 1;//房间类型 1普通 2俱乐部
  room_pdk.createRoomOpts.playType = 0; //玩法类型
  room_pdk.createRoomOpts.roundMax = 6; //最大局数
  room_pdk.createRoomOpts.fanshu = 2; //最大番数
  room_pdk.createRoomOpts.costType = 1; //付費類型
  room_pdk.createRoomOpts.jiaofenType = 1;
  room_pdk.createRoomOpts.mud = false; //踢踹
  room_pdk.createRoomOpts.kicking = false; //带泥儿
  room_pdk.createRoomOpts.times = 1;     //倍数
  room_pdk.createRoomOpts.score = 1;     //进入条件
}

room_pdk.saveCreateRoomOpts = function () {
  if (room_pdk.createRoomOpts == null || room_pdk.createRoomOpts == undefined) return;
  cc.sys.localStorage.setItem('DDZcreateRoomOpts', JSON.stringify(room_pdk.createRoomOpts));
}
// room_pdk.getCardHand = function(uid) {
//   if (uid == GameData.player.uid) {
//     return GameData.player.cards;
//   }
//   return 0;
// }
room_pdk.getJiaofenNum = function (uid) {
  return room_pdk.cards[uid]['jiaofenNum'];
}

room_pdk.getDisPoker = function (uid) {
  return room_pdk.cards[uid]['discards'];
}

room_pdk.getHandCards = function (uid) {
  return room_pdk.cards[uid]['hand'];
}

room_pdk.getMyHandCards = function () {
  if (room_pdk.cards[GameData.player.uid] != undefined)
  {
    return room_pdk.cards[GameData.player.uid]['hand'];
  }
}

room_pdk.getHandCardNum = function (uid) {
  return room_pdk.cards[uid]['handnum'];
}

room_pdk.setPosition = function () {
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

room_pdk.getPosByUid = function(uid) {
  return GameData.tablePos[uid];
}

room_pdk.isEmptyObject = function(object) {
  for (var key in object) {
    return false;
  }
  return true;
}

room_pdk.objectLen = function(object) {
  var len = 0;
  for (var key in object) {
    len++;
  }
  return len;
}

room_pdk.clearObject = function(object) {
  for (var key in object) {
    delete object[key];
  }
  if (room_pdk.isEmptyObject(object)) return true;
  return false;
}

room_pdk.registMessage = function() {
  GameNet.getInstance().setCallBack('tjddz-hideCard', function(data) {
    WriteLog('tjddz-hideCard: ', data);
    room_pdk.hideDisCard = data;
    sendEvent('tjddz-hideCard', data);
  });
  GameNet.getInstance().setCallBack('tjddz-startChuai', function (data) {
    WriteLog("do event tjddz-startChuai  " + JSON.stringify(data));
    room_pdk.chuaiFlag = true;
    sendEvent('tjddz-startChuai', data);
  });
  GameNet.getInstance().setCallBack('tjddz-startTi', function (data) {
    WriteLog("do event tjddz-startTi  " + JSON.stringify(data));
    room_pdk.tiFlag = true;
    sendEvent('tjddz-startTi', data);
  });
  GameNet.getInstance().setCallBack('tjddz-showKicking', function (data) {
    WriteLog("do event tjddz-showKicking  " + JSON.stringify(data));
    room_pdk.kicking = data;
    sendEvent('tjddz-showKicking', data);
  });
  GameNet.getInstance().setCallBack('tjddz-onGameInfo', function (data) {
    WriteLog("do event tjddz-onGameInfo  " + JSON.stringify(data));
    room_pdk.game.initcards = true;
    room_pdk.deal = false;
    // GameData.game.roundType = data.roundType;
    // GameData.game.roundNum = data.roundNum;
    // GameData.game.roundmax = data.roundmax;
    sendEvent('tjddz-onGameInfo', data);
  });
  GameNet.getInstance().setCallBack('tjddz-initCardHandNum', function (data) {
    WriteLog("do event tjddz-initCardHandNum  " + JSON.stringify(data));
    room_pdk.cards[data.uid] = (room_pdk.cards[data.uid] === undefined) ? {} : room_pdk.cards[data.uid];
    room_pdk.cards[data.uid]['handnum'] = data.num;
    //cc.log('initCardHandNum1111111111111 '+JSON.stringify(room_pdk.cards[data.uid]));
    //if (data.num % 3 == 2) GameData.game.turn = data.uid;
    sendEvent('tjddz-initCardHandNum');
  });

  GameNet.getInstance().setCallBack('tjddz-initCardHand', function (data) {
    WriteLog("do event tjddz-initCardHand  " + JSON.stringify(data));
    room_pdk.cards[data.uid] = (room_pdk.cards[data.uid] === undefined) ? {} : room_pdk.cards[data.uid];
    room_pdk.cards[data.uid]['hand'] = data.hand;
    sendEvent('tjddz-initCardHand');
  });
  GameNet.getInstance().setCallBack('tjddz-onGameStart', function (data) {
    WriteLog("do event tjddz-onGameStart  " + JSON.stringify(data));
    room_pdk.initGameData();
    room_pdk.game.gameStart = true;
    room_pdk.deal = true;
    sendEvent('tjddz-onGameStart');
  });
  GameNet.getInstance().setCallBack('tjddz-onGameScore', function (data) {
    WriteLog("do event tjddz-onGameScore  " + JSON.stringify(data));
    room_pdk.resultData = data;
    room_pdk.game.gameStart = false;
    room_pdk.tiFlag = false;
    room_pdk.chuaiFlag = false;
    sendEvent('tjddz-onGameScore', data);
  });
  GameNet.getInstance().setCallBack('tjddz-onGameAllScore', function (data) {
    WriteLog("do event tjddz-onGameAllScore  " + JSON.stringify(data));
    room_pdk.allScores = data.score;
    room_pdk.roomsummaryData = data;
    //    GameData.game.gameStart = false;
    sendEvent('tjddz-onGameAllScore', data);
  });
  GameNet.getInstance().setCallBack('tjddz-onFirstJiaoFen', function (data) {
    WriteLog("sercerMsg  tjddz-onFirstJiaoFen :" + JSON.stringify(data));
    room_pdk.game.isJiaofenAgain = data.flag;
    room_pdk.currJiaofenPlayerData = data;
    sendEvent('tjddz-onJiaoFen', data);
  });//
  GameNet.getInstance().setCallBack('tjddz-showWatch', function (data) {
    WriteLog("sercerMsg  tjddz-showWatch :" + JSON.stringify(data));
    room_pdk.currtiChuaiPlayerData = data;
    sendEvent('tjddz-showWatch', data);
  });
  GameNet.getInstance().setCallBack('tjddz-nextJiaoFen', function (data) {
    WriteLog("sercerMsg  tjddz-nextJiaoFen :" + JSON.stringify(data));
    for (var key in data.allJiaoFen) {
      room_pdk.cards[key]['jiaofenNum'] = data.allJiaoFen[key];
    }
    room_pdk.currJiaofenPlayerData = data;
    sendEvent('tjddz-onJiaoFen', data);
  });
  //重连
  GameNet.getInstance().setCallBack('tjddz-reconnectionInfo', function (data) {
    WriteLog("sercerMsg  tjddz-reconnectionInfo :" + JSON.stringify(data));
    // for(var key in data.allJiaoFen){
    //     room_pdk.cards[key]['jiaofenNum'] = data.allJiaoFen[key];
    //   }
    if (data.type == 'jiaofen') {
      room_pdk.currJiaofenPlayerData = data;
      for (var key in data.allJiaoFen) {
        room_pdk.cards[key]['jiaofenNum'] = data.allJiaoFen[key];
      }
    }

    // if(data.type == 'historyInfo'){
    //   room_pdk.historyData =data; 
    // }

    //room_pdk.reconnectionInfo = data;
    //sendEvent('tjddz-onJiaoFen',data);
  });
  GameNet.getInstance().setCallBack('tjddz-openScore', function (data) {
    WriteLog("do event tjddz-openScore  " + JSON.stringify(data));
    room_pdk.openScore = data.open;
    sendEvent('tjddz-openScore', data);
  });
  GameNet.getInstance().setCallBack('tjddz-onDiZhu', function (data) {
    WriteLog("sercerMsg  tjddz-onDiZhu  :" + JSON.stringify(data));
    room_pdk.game.dizhuUid = data.dizhuUid;
    room_pdk.gameStartData = data;
    room_pdk.game.gameStartDizhu = true;
    sendEvent('tjddz-onDiZhu', data);
  });
  GameNet.getInstance().setCallBack('tjddz-disCardUid', function (data) {
    WriteLog("sercerMsg  tjddz-disCardUid  :" + JSON.stringify(data));
    room_pdk.currObtainPlayerData = data;
    sendEvent('tjddz-onShowObtainNode', data);
  });
  GameNet.getInstance().setCallBack('tjddz-initCardHandNums', function (data) {
    WriteLog("do event tjddz-initCardHandNums  " + JSON.stringify(data));
    room_pdk.cards[data.uid]['handnum'] = data.num;
    cc.log('initCardHandNums' + JSON.stringify(room_pdk.cards[data.uid]));
    // sendEvent('tjddz-initCardHandNums', data);
    sendEvent('tjddz-initCardHandNums');
  });
  GameNet.getInstance().setCallBack('tjddz-showDisPoker', function (data) {
    WriteLog("sercerMsg  tjddz-showDisPoker  :" + JSON.stringify(data));
    room_pdk.cards[data.uid] = (room_pdk.cards[data.uid] === undefined) ? {} : room_pdk.cards[data.uid];
    room_pdk.cards[data.uid]['discards'] = data.cards;
    sendEvent('tjddz-showDisPoker', data);
  });
  GameNet.getInstance().setCallBack('tjddz-initCardHands', function (data) {
    WriteLog("do event tjddz-initCardHands  " + JSON.stringify(data));
    room_pdk.cards[data.uid] = (room_pdk.cards[data.uid] === undefined) ? {} : room_pdk.cards[data.uid];
    room_pdk.cards[data.uid]['hand'] = data.hand;
    sendEvent('tjddz-initCardHands', data);
  });
  GameNet.getInstance().setCallBack('tjddz-cardWarning', function (data) {
    WriteLog("do event tjddz-cardWarning  " + JSON.stringify(data));
    sendEvent('tjddz-cardWarning', data);
  });
  GameNet.getInstance().setCallBack('tjddz-onDiscardType', function (data) {
    WriteLog("do event tjddz-onDiscardType  " + JSON.stringify(data));
    room_pdk.lastDisPokerUid = data.uid;
    sendEvent('tjddz-onDiscardType', data);
  });
  GameNet.getInstance().setCallBack('tjddz-jiaoFencb', function (data) {
    WriteLog("do event tjddz-jiaoFencb  " + JSON.stringify(data));
    sendEvent('tjddz-jiaoFencb', data);
  });
  GameNet.getInstance().setCallBack('tjddz-passcb', function (data) {
    WriteLog("do event tjddz-passcb  " + JSON.stringify(data));
    room_pdk.cards[data.uid]['discards'] = data.cards;
    room_pdk.cards[data.nextUid]['discards'] = data.nextCards;
    sendEvent('tjddz-passcb', data);
  });
  GameNet.getInstance().setCallBack('tjddz-hintCard', function (data) {
    WriteLog("do event tjddz-hintCard  " + JSON.stringify(data));
    sendEvent('tjddz-hintCard', data);
  });
  GameNet.getInstance().setCallBack('tjddz-BackTable', function (data) {
    WriteLog("do event tjddz-BackTable  " + JSON.stringify(data));
    room_pdk.game.initcards = true;
    //sendEvent('tjddz-BackTable');
  });
  //   GameNet.getInstance().setCallBack('tjddz-onBoomNum', function(data) {
  //   WriteLog("do event tjddz-onBoomNum  " + JSON.stringify(data));
  //   sendEvent('tjddz-onBoomNum', data);
  // });
}
