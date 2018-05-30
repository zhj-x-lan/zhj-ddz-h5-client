var GameData13 = GameData13 || {};

GameData13.init = function() {
  GameData13.initRoomData();
  GameData13.initCreateRoomOpts();

	poker13RegistMsg();

  
  GameData13.isPlayVioce = true;  //yv语音动画常量
  GameData13.handSize = 13;       //手牌长度
},

GameData13.initRoomData = function() {
  GameData13.rtn = {};
  GameData13.owner = 0;
  GameData13.createtime = 0;
  GameData13.room = {};
  GameData13.scores = {};
  GameData13.player = {};
  GameData13.readyInfo = {};
  GameData13.roomResult = {};
  GameData13.disCardReady = {};
  GameData13.disCardPlayer = [];
  GameData13.joiners = new Array();
  GameData13.roundResult = new Array();
  GameData13.playerAllScore = {};
  GameData13.gemaEndResult = {};
  GameData13.playerConnect = {};
  GameData13.game = {
    reday : false,
    start: false,
    roundNum: 0,
    time: 0,
  };
}

GameData13.initCreateRoomOpts = function() {
  var data = cc.sys.localStorage.getItem('createRoomOpts-13shui');
  if (data!=null) {
    GameData13.createRoomOpts = JSON.parse(data);
    return;
  }
  GameData13.createRoomOpts = {
    costType: 0,
    payType: 1,
    joinermax: 0,
    limiteTime: 0,
    roundmax: 15,
    roundRule: 1
  };
}

GameData13.getCardHand = function(uid) {
  if (uid == GameData13.player.uid) {
    return GameData13.player.cards;
  }
  return 0;
}

GameData13.getPosition = function(uid) {
  var joinermax = GameData13.room.joinermax;

  var index = 0, seat;

  if (uid == GameData.player.uid) {
    return (index + 1);
  }

  for (var i = 0; i < GameData13.joiners.length; i++)
  {
    if (GameData13.joiners[i].uid == GameData.player.uid)
    {
      seat = GameData13.joiners[i].seat;
    }
  }

  for (var i = 0; i < GameData13.joiners.length; i++)
  {
    if (GameData13.joiners[i].uid == uid) {
      index = GameData13.joiners[i].seat - seat;
    }
    if (index < 0) {
      index = joinermax + index;
      break;
    }
  }
  return (index + 1);
}

GameData13.getDisCardRow = function(row) {
  if (row == 'up') return 1;
  else if (row == 'mid') return 2;
  else if (row == 'down') return 3;
  return 0;
}

GameData13.saveCreateRoomOpts = function() {
  if (GameData13.createRoomOpts == null || GameData13.createRoomOpts == undefined) return;
  cc.log("saveCreateRoomOpts="+JSON.stringify(GameData13.createRoomOpts));
  cc.sys.localStorage.setItem('createRoomOpts-13shui', JSON.stringify(GameData13.createRoomOpts));
}

GameData13.getPlayerSexByUid = function(uid) {
  for (var i=0; i<GameData.joiners.length; ++i) {
    if (GameData.joiners[i] && GameData.joiners[i].uid == uid) {
      return GameData.joiners[i].sex;
    }
  }
  return 1;
}

GameData13.getJoinerByUid = function(uid) {
  for (var i = 0; i < GameData13.joiners.length; i++) {
    if (uid == GameData13.joiners[i].uid) {
      return GameData13.joiners[i];
    }else {
      continue;
    }
  }
  return null;
}

GameData13.isEmptyObject = function(object) {
  for (var key in object) {
    return false;
  }
  return true;
}

GameData13.clearObject = function(object) {
  for (var key in object) {
    delete object[key];
  }
  if (GameData13.isEmptyObject(object)) return true;
  return false;
}

GameData13.clearAllGameData = function() {
  GameData13.game.start = false;
  GameData13.game.reday = false;
  GameData13.game.roundNum = 0;
  GameData13.game.time = 0;
  GameData13.joiners.splice(0, GameData13.joiners.length);
  GameData13.disCardPlayer.splice(0, GameData13.disCardPlayer.length);
  GameData13.clearObject(GameData13.room);
  GameData13.clearObject(GameData13.player);
  GameData13.clearObject(GameData13.readyInfo);
  GameData13.clearObject(GameData13.roomResult);
  GameData13.clearObject(GameData13.disCardReady);
  GameData13.clearObject(GameData13.gemaEndResult);
  GameData13.clearObject(GameData13.playerConnect);
  GameData13.clearObject(GameData13.playerAllScore);
  GameData13.clearObject(GameData13.allScores);
}

function poker13RegistMsg() {
  GameNet.getInstance().setCallBack('13-ShowReadyUI', function(data) {  
    WriteLog("13-ShowReadyUI:" + JSON.stringify(data));
    GameData13.readyInfo = data.readyInfo;
    sendEvent('13-ShowReadyUI', data);
  });
  GameNet.getInstance().setCallBack('13-GameStart', function(data) {  
    WriteLog("13-GameStart:" + JSON.stringify(data));
    GameData13.game.reday = true;
    GameData13.game.start = true;
    GameData13.game.roundNum = data.roundNum;
    GameData13.game.time = data.time;
    sendEvent('13-GameStart');

  });
  GameNet.getInstance().setCallBack('13-RoomBaseInfo', function(data) {  
    WriteLog("13-RoomBaseInfo:" + JSON.stringify(data));
    GameData13.room = data.room;
    GameData13.owner = data.owner;
    GameData13.createtime = data.createtime;
    GameData13.game.roundNum = data.roundNum;
    GameData13.joiners.splice(0, GameData13.joiners.length);

    for (var uid in data.players) {
      var player = data.players[uid];
      GameData13.joiners.push(player);
    }
    GameData13.allScores = data.scores;
    sendEvent('13-RoomBaseInfo');

  });
  GameNet.getInstance().setCallBack('13-PlayerCards', function(data) {  
    WriteLog("13-PlayerCards:" + JSON.stringify(data));
    GameData13.player = data;
    sendEvent('13-PlayerCards');
  });
  GameNet.getInstance().setCallBack('13-RoomResult', function(data) {  
    WriteLog("13-RoomResult:" + JSON.stringify(data));
    GameData13.game.start = true; //用于断线重连
    GameData13.roomResult = data;
    GameData13.playerAllScore = data.score;
    sendEvent('13-RoomResult');
  });
  GameNet.getInstance().setCallBack('13-GameEnd', function(data) {  
    WriteLog("13-GameEnd:" + JSON.stringify(data));
    GameData13.gemaEndResult = data;
    sendEvent('13-GameEnd', data);
  });
  GameNet.getInstance().setCallBack('13-Discard', function(data) {  
    WriteLog("13-Discard:" + JSON.stringify(data));
    GameData13.disCardReady = data;
    GameData13.disCardPlayer.push(data.uid); //用於斷線重連
    sendEvent('13-Discard');
  });
  GameNet.getInstance().setCallBack('13-SelfDiscard', function(data) {
    WriteLog('13-SelfDiscard: '+JSON.stringify(data));
    GameData13.playerConnect.disCard = data;
    sendEvent('13-SelfDiscard');
  });
  GameNet.getInstance().setCallBack('13-DiscardInfo', function(data) {
    WriteLog('13-DiscardInfo: '+JSON.stringify(data));
    GameData13.playerConnect.disCardInfo = data.info;
    sendEvent('13-DiscardInfo');
  });
}
