var GameData = GameData || {};

GameData.init = function () {
    var uid = 0;
    var name = '';
    var log = '';
    var sex = 1;

    if (cc.sys.isNative) {
      uid = cc.sys.localStorage.getItem("uid") || uid;
      name = cc.sys.localStorage.getItem("name") || name;
    } else {
      name = 'guest' + new Date().getTime();
    }
    //sex = cc.sys.localStorage.getItem("loginData").sex || 'boy';
    GameData.client = {
      guest: name,
      uid: uid,
      sex: sex,
      gameType: 1,
      handsize: 13,
    };
    GameData.player = {};
    var configMgr = require('configMgr');
    GameData.configData = configMgr.getServerConfig();
    GameData.isRoomRunlampt = false;
    GameData.isRoomRunlampt1 = false;
    GameData.serverNoticeData = null;
    GameData.player.club = {};

    GameData.initRoomData();
    GameData.initCreateRoomOpts();
    GameData.initSetLayerData();
    GameData.initPlayerCurrClubData();
    GameData.initCommonCreateRoomRule();

    //设置音效相关常量
    GameData.soundVolume = 1;
    GameData.musicVolume = 1;
    GameData.soundOpen = true;
    GameData.musicOpen = true;
    GameData.language_putong = 2;   //普通话
    GameData.language_tianjin = 1;  //方言

    //设置海报相关常量
    GameData._posterIsShow = true;

    //yv语音动画常量
    GameData.isPlayVioce = true;
    GameData.agentFlag = true;

    registAllMessage();
    //ddz初始化
    GameDataDDZ.init();
    //石狮初始化
    GameDataShiShi.init();
    //桦甸初始化
    profileHuaDian.init();
    //红中麻将初始化
    GameDataHZ.init();
    //哈尔滨麻将初始化
    profileHeb.init();
    //长春麻将初始化
    profileChangChun.init();

    console.log('init GameData, name:' + name + ' uid:' + uid);
  },

  GameData.setGameType = function (type) {
    var gameDefine = require('gameDefine');
    GameData.client.gameType = type;
    GameData.gameType = type;
    switch (type) {
      case gameDefine.GameType.Game_Mj_Tianjin:
      case gameDefine.GameType.Game_MJ_HuaDian:
      case gameDefine.GameType.Game_Mj_HZ:
      case gameDefine.GameType.Game_Mj_CC:
      case gameDefine.GameType.Game_Mj_AS:
      case gameDefine.GameType.Game_Mj_Heb:
        GameData.client.handsize = 13;
        break;
      case gameDefine.GameType.Game_Mj_Shishi:
        GameData.client.handsize = 16;
        break;
      default:
        break;
    }
  }

GameData.initRoomData = function () {
  GameData.room = {
    opts:{}
  };
  GameData.joiners = new Array();
  GameData.JushuScore = new Array();
  GameData.tablePos = {};
  GameData.allScores = {};
  GameData.recordInfo = [];
  GameData.openScore = 0;
  GameData.contact = false;
  GameData.danger = false;
  GameData.joinContact = {};
  GameData.allYouJinInfo = [];
  GameData.showResult = false;
  GameData.initGameData();
  console.log('call initRoomData');
}

GameData.initGameData = function () {
  GameData.game = {
    roundType: 0,
    roundNum: 0,
    roundmax: 0,
    roundCount: 0,
    turn: 0,
    obtain: 0,
    lastdisUid: 0,
    lastdisCard: 0,
    cardleft: 0,
    cardHuier1: 0,
    cardHuier2: 0,
    winnerUid: 0,
    winnerType: [],
    zhuangUid: 0,
    zhuangNum: {},
    discard: 0,
    gangOver: 0,
    gameStart: false,
    initcards: false,
    noActions: true,
    onSelectZhuang: {},
    onSelectLazhuang: {},
    onSelectZhuangAgain: {},
    onSelectLazhuangAgain: {},
    onSelectZhuangInfo: {},
    onZhuangInfo: {},
    onRoomReadyInfo: {},
    checkPass: {},
    onRoomDissolve: {},
    obtainHua: [],
    dataInfo:{}//东北通用
  };
  GameData.cards = {};
  GameData.scores = {};
  GameData.youJinDeck = [];
  GameData.allCardsChi = {};
  //樺甸
  GameData.ResultData = {};
  GameData.ResultScoreInfo = {};
  GameData.SummaryData = {};
  GameData.operations = {}; //玩家操作按钮

  console.log('call initGameData');
}

GameData.restart = function () {
  GameData.init();
  cc.director.loadScene('login');
}

GameData.getOtherHuier = function (huier) {
  if (huier == 9) return 1;
  if (huier == 19) return 11;
  if (huier == 29) return 21;
  if (huier == 31) return 41;
  if (huier == 41) return 51;
  if (huier == 51) return 61;
  if (huier == 61) return 31;
  if (huier == 71) return 81;
  if (huier == 81) return 91;
  if (huier == 91) return 71;
  return (huier + 1);
}

GameData.isPrevPlayer = function (uid) {
  for (var i = 0; i < GameData.joiners.length; i++) {
    if (GameData.joiners[i] && GameData.joiners[i].uid == uid) {
      if (i < GameData.joiners.length - 1) {
        return GameData.joiners[i + 1].uid == GameData.player.uid;
      } else {
        return GameData.joiners[0].uid == GameData.player.uid;
      }
    }
  }
  return false;
}

GameData.getPlayerByUid = function (uid) {
  for (var i = 0; i < GameData.joiners.length; ++i) {
    if (GameData.joiners[i] && GameData.joiners[i].uid == uid) {
      return GameData.joiners[i];
    }
  }
  return null;
}
GameData.getPlayerSexByUid = function (uid) {
  for (var i = 0; i < GameData.joiners.length; ++i) {
    if (GameData.joiners[i] && GameData.joiners[i].uid == uid) {
      return GameData.joiners[i].sex;
    }
  }
  return null;
}
GameData.getPlayerIndex = function (uid) {
  for (var i = 0; i < GameData.joiners.length; ++i) {
    var player = GameData.joiners[i];
    if (player && player.uid == uid) {
      return i;
    }
  }
  return -1;
}

GameData.getPlayerPosByUid = function (uid) {
  for (var key in GameData.tablePos) {
    if (uid == key) {
      return GameData.tablePos[key];
    }
  }
  return null;
}

GameData.getPlayerByPos = function (pos) {
  for (var uid in GameData.tablePos) {
    if (pos == GameData.tablePos[uid]) {
      return GameData.getPlayerByUid(uid);
    }
  }
  return null;
}

GameData.setPosition = function () {
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
    if (index == 0) order = ['down', 'up', 'left'];
    else if (index == 1) order = ['left', 'down', 'up'];
    else if (index == 2) order = ['up', 'left', 'down'];
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

GameData.getHandCards = function (uid) {
  return GameData.cards[uid]['hand'];
}

GameData.getMyHandCards = function () {
  return GameData.cards[GameData.player.uid]['hand'];
}

GameData.getHandCardNum = function (uid) {
  return GameData.cards[uid]['handnum'];
}

GameData.getHuaCard = function (uid) {
  return GameData.cards[uid]['hua'];
}

GameData.haveHuaCard = function (uid, card) {
  var hua = this.getHuaCard(uid);
  var len = hua.length;
  for (var i = 0; i < len; i++) {
    if (card == hua[i]) {
      return true;
    }
  }
  return false;
}

GameData.getDisCards = function (uid) {
  return GameData.cards[uid]['dis'];
}

GameData.getChiCards = function (uid) {
  return GameData.cards[uid]['chi'];
}

GameData.getPengCards = function (uid) {
  return GameData.cards[uid]['peng'];
}

GameData.getGangCards = function (uid) {
  return GameData.cards[uid]['gang'];
}

GameData.removeDisCard = function (uid) {
  GameData.cards[uid]['dis'].pop();
}

GameData.getTingData = function (uid) {
  return GameData.cards[uid]['tingData'];
}

GameData.getSelfChiCards = function(uid)
{
    return GameData.allCardsChi[uid];
}

GameData.removePengCard = function (uid, card) {
  var arrCards = GameData.cards[uid]['peng'];
  for (var i = 0; i < arrCards.length; i++) {
    if (arrCards[i][0] == card) {
      arrCards.splice(i, 1);
      break;
    }
  }
}

//所有人的杠数
GameData.getAllGangNumber = function()
{
    var number = 0
    for (var key in GameData.joiners)
    {
        var uid = GameData.joiners[key].uid;

        var gangData = this.getGangCards(uid);
        if( gangData == undefined ) {
            continue;
        }
        number += Object.keys( gangData ).length;
    }
    return number;
}

GameData.getClubDataByClubId = function (club_id) {
  for (var key in GameData.player.club) {
    if (GameData.player.club[key].club_id == club_id) {
      return GameData.player.club[key];
    }
  }
  return null;
}
GameData.getClubDataByIndex = function (index) {
  console.log('GameData.player.club ' + JSON.stringify(GameData.player.club));
  for (var key in GameData.player.club) {
    if (key == index) {
      return GameData.player.club[key];
    }
  }
}
GameData.getAgentRoomDataByRoomid = function (roomid) {
  for (var key in GameData.AgentRoomsData) {
    if (GameData.AgentRoomsData[key].roomid == roomid)
      return GameData.AgentRoomsData[key];
  }
  return null;
}
GameData.initCommonCreateRoomRule = function(){
    var data = cc.sys.localStorage.getItem('CommonCreateRoomRule');
    if (data != null) {
        GameData.createRoom = JSON.parse(data);
        return;
    }
    //创建房间界面偏好
    GameData.createRoom = {
        gameType: 0,       //创建房间上面大类型
        leftGameType: [],  //创建房间左面游戏类型
        roomType: 1        //房间类型 1普通 2俱乐部 3积分
    };
};
GameData.saveCommonCreateRoomRule = function(){
    if (GameData.createRoom == undefined
    || Object.keys(GameData.createRoom).length <= 0) {
      return;
    }
    cc.sys.localStorage.setItem('CommonCreateRoomRule', JSON.stringify(GameData.createRoom));
};
GameData.initCreateRoomOpts = function () {
  var data = cc.sys.localStorage.getItem('createRoomOpts');
  if (data != null) {
    GameData.createRoomOpts = JSON.parse(data);
    return;
  }
  GameData.createRoomOpts = {};
  GameData.createRoomOpts.joinermax = 4;      //最大人数

  //普通房
  GameData.createRoomOpts.roundRule = 2;      //局/圈/Num
  GameData.createRoomOpts.roundMax = 4;       //最大局数
  GameData.createRoomOpts.roundType = 1;      //局/圈类型
  GameData.createRoomOpts.huierDiao = true;   //带混掉
  GameData.createRoomOpts.daZi = false;       //逢字必打
  GameData.createRoomOpts.daiFeng = true;     //带风牌
  GameData.createRoomOpts.daiChan = true;     //带铲牌
  GameData.createRoomOpts.longwufan = true;   //龙五翻
  GameData.createRoomOpts.doubleGang = false; //杠翻番
  GameData.createRoomOpts.jGangScore = 8;     //金杠分数
  GameData.createRoomOpts.laType = 1;         //坐二拉一:1/连庄拉庄:2
  GameData.createRoomOpts.score = 1;          //进入条件分数
  GameData.createRoomOpts.times = 0;          //底分倍数:1.2.5
  GameData.createRoomOpts.payType = 1;        //房主付费1/AA付费2/赢家付费3
}

GameData.saveCreateRoomOpts = function () {
  if (GameData.createRoomOpts == null || GameData.createRoomOpts == undefined) return;
  cc.log("saveCreateRoomOpts=" + JSON.stringify(GameData.createRoomOpts));
  cc.sys.localStorage.setItem('createRoomOpts', JSON.stringify(GameData.createRoomOpts));
}
GameData.initSetLayerData = function () {
  //console.log("GameData.player.uid",GameData.player.uid);
  var data = cc.sys.localStorage.getItem('SetLayerData');
  //console.log("'SetLayerData'+GameData.player.uid" , data);
  if (data != null) {
    GameData.SetLayerData = JSON.parse(data);
    return;
  }
  //console.log("GameData.SetLayerData=" + GameData.SetLayerData);
  GameData.SetLayerData = {};
  GameData.SetLayerData.soundVolume = 1;
  GameData.SetLayerData.musicVolume = 1;
  GameData.SetLayerData.soundOpen = true;
  GameData.SetLayerData.musicOpen = true;
}

GameData.saveSetLayerData = function () {
  //console.log("'SetLayerData'+GameData.player.uid",GameData.player.uid);
  if (GameData.SetLayerData == null || GameData.SetLayerData == undefined) return;
  cc.sys.localStorage.setItem('SetLayerData', JSON.stringify(GameData.SetLayerData));
  //console.log("save SetLayerData",GameData.SetLayerData);
}
GameData.initPlayerCurrClubData = function () {
  var data = cc.sys.localStorage.getItem("PlayerCurrClubData");
  if (data) {
    GameData.playerCurrClubId = JSON.parse(data);
    console.log('GameData.playerCurrClubId ' + GameData.playerCurrClubId);
    return;
  }
  //俱乐部相关常量
  GameData.playerCurrClubId = null;
}

GameData.savePlayerCurrClubData = function () {
  if (GameData.playerCurrClubId == null || GameData.playerCurrClubId == undefined) return;
  cc.sys.localStorage.setItem('PlayerCurrClubData', JSON.stringify(GameData.playerCurrClubId));
}

function registAllMessage() {
  GameNet.getInstance().setCallBack('onServerNotice', function (data) {
    WriteLog("onServerNotice:" + JSON.stringify(data));
    GameData.serverNoticeData = data.notice;
    sendEvent('onServerNotice', data.notice);
  });
  /*GameNet.getInstance().setCallBack('onRoomMsg', function (data) {
    WriteLog("onRoomMsg:" + JSON.stringify(data));
    GameData.room = data.room;
    GameData.players = data.players;
    GameData.setGameType(data.room.opts.gameType);
    GameData.player.roomid = data.room.id;
    GameData.joiners.splice(0, GameData.joiners.length);
    for (var uid in data.players) {
      var player = data.players[uid];
      GameData.joiners[player.seat] = player;
    }
    GameData.setPosition();
    GameData.allScores = data.scores;
    GameData.showResult = true;
    sendEvent('onRoomMsg', data);
  });*/
  GameNet.getInstance().setCallBack('openScore', function (data) {
    WriteLog("do event openScore  " + JSON.stringify(data));
    GameData.openScore = data.open;
    sendEvent('openScore', data);
  });
  GameNet.getInstance().setCallBack('onSelectZhuang', function (data) {
    WriteLog("do event onSelectZhuang  " + JSON.stringify(data));
    GameData.game.onSelectZhuang.data = data;
    sendEvent('onSelectZhuang', data);
  });
  GameNet.getInstance().setCallBack('onSelectLazhuang', function (data) {
    WriteLog("do event onSelectLazhuang  " + JSON.stringify(data));
    GameData.game.onSelectLazhuang.data = data;
    sendEvent('onSelectLazhuang', data);
  });
  GameNet.getInstance().setCallBack('onSelectZhuangAgain', function (data) {
    WriteLog("do event onSelectZhuangAgain  " + JSON.stringify(data));
    GameData.game.onSelectZhuangAgain.data = data;
    sendEvent('onSelectZhuangAgain', data);
  });
  GameNet.getInstance().setCallBack('onSelectLazhuangAgain', function (data) {
    WriteLog("do event onSelectLazhuangAgain  " + JSON.stringify(data));
    GameData.game.onSelectLazhuangAgain.data = data;
    sendEvent('onSelectLazhuangAgain', data);
  });
  GameNet.getInstance().setCallBack('onGameStart', function (data) {
    WriteLog("do event onGameStart  " + JSON.stringify(data));
    GameData.initGameData();
    //初始化桦甸房间数据
    profileHuaDian.initRoomData();
    GameData.game.gameStart = true;
    sendEvent('onGameStart');
  });
  GameNet.getInstance().setCallBack('onGamePass', function (data) {
    WriteLog("do event onGamePass  " + JSON.stringify(data));
    GameData.game.lastdisUid = data.uid;
    GameData.game.lastdisCard = data.card;
    GameData.game.checkPass = data;
    sendEvent('onGamePass', data);
  });
  GameNet.getInstance().setCallBack('onGameScore', function (data) {
    WriteLog("do event onGameScore  " + JSON.stringify(data));
    GameData.scores = data;
    GameData.game.gameStart = false;
    GameData.player.isXiangGong = false;
    var temp = data;
    temp.zhuangUid = GameData.game.zhuangUid;
    GameData.JushuScore.push(temp);
    GameDataShiShi.initGameData();
    sendEvent('onGameScore', data);
  });
  GameNet.getInstance().setCallBack('onGameAllScore', function (data) {
    WriteLog("do event onGameAllScore  " + JSON.stringify(data));
    GameData.allScores = data;
    //GameData.game.gameStart = false;
    GameDataShiShi.initGameData();
    sendEvent('onGameAllScore', data);
  });

  GameNet.getInstance().setCallBack('recordInfo', function (data) {
    WriteLog("do event recordInfo  " + JSON.stringify(data));
    GameData.recordInfo = data;
    sendEvent('recordInfo', data);
  });

  GameNet.getInstance().setCallBack('whoseTurn', function (data) {
    WriteLog("do event whoseTurn  " + JSON.stringify(data));
    GameData.game.turn = data.player;
    sendEvent('onGameTurn', data.player);
  });

  GameNet.getInstance().setCallBack('onCardObtain', function (data) {
    WriteLog("do event onCardObtain  " + JSON.stringify(data));
    if (data.player == GameData.player.uid) {
      if (GameData.cards[data.player]['hand'][data.obtain] > 0) GameData.cards[data.player]['hand'][data.obtain]++;
      else GameData.cards[data.player]['hand'][data.obtain] = 1;
      GameData.game.obtain = data.obtain;
    } else {
      //GameData.game.obtain = 0;
    }
    GameData.cards[data.player]['handnum']++;
    GameData.game.turn = data.player;
    GameData.game.cardleft--;
    if (data.hua instanceof Array && data.hua.length > 0) {
      GameData.game.cardleft -= data.hua.length;
      var hua = GameData.cards[data.player]['hua'];
      hua.push.apply(hua, data.hua);
    }
    sendEvent('onCardObtain', data);
    sendEvent('onGameTurn', data.player);
  });
  GameNet.getInstance().setCallBack('onCardObtainLast', function (data) {
    WriteLog("do event onCardObtainLast  " + JSON.stringify(data));
    GameData.game.turn = data.player;
    GameData.game.obtain = data.obtain;
    GameData.game.lastdisUid = data.displayer;
    GameData.game.lastdisCard = data.discard;
    GameData.game.obtainHua = data.hua;

    sendEvent('onCardObtain', data);
    sendEvent('onGameTurn', data.player);
  });
  GameNet.getInstance().setCallBack('onCardDis', function (data) {
    WriteLog("do event onCardDis  " + JSON.stringify(data));
    if (data.player == GameData.player.uid) {
      GameData.cards[data.player]['hand'][data.card]--;
      GameData.game.obtain = 0;
        GameData.game.discard++;
      GameData.game.gangOver = 0;
    }
    GameData.cards[data.player]['handnum'] -= 1;
    GameData.cards[data.player]['dis'].push(data.card);

    GameData.game.lastdisUid = data.player;
    GameData.game.lastdisCard = data.card;
    GameData.game.noActions = false;
    GameData.game.turn = 0;

    sendEvent('onCardDis', data);
  });

  GameNet.getInstance().setCallBack('onCardChi', function(data) {
      WriteLog("do event onCardChi  " + JSON.stringify(data));
      if (data.player == GameData.player.uid) {
          GameData.cards[data.player]['hand'][data.myCards[0]]--;
          GameData.cards[data.player]['hand'][data.myCards[1]]--;
      }
      GameData.cards[data.player]['handnum']-=2;
      var chiData = [data.card,data.myCards[0],data.myCards[1]];
      var cards = chiData.sort(function(a, b) {return a>b;});
      GameData.cards[data.player]['chi'].push(cards);

      if( GameData.allCardsChi[data.player] == undefined ) {
          GameData.allCardsChi[data.player] = [];
      }
      GameData.allCardsChi[data.player].push([cards,data.card]);

      GameData.removeDisCard(GameData.game.lastdisUid);
      GameData.game.turn = data.player;
      GameData.game.lastdisUid = 0;
      GameData.game.lastdisCard = 0;
      GameData.game.noActions = false;
      sendEvent('onCardChi', data);
      sendEvent('onGameTurn', data.player);
  });

  GameNet.getInstance().setCallBack('onCardPeng', function (data) {
    WriteLog("do event onCardPeng  " + JSON.stringify(data));
    if (data.player == GameData.player.uid) {
      GameData.cards[data.player]['hand'][data.card] -= 2;
    }
    GameData.cards[data.player]['handnum'] -= 2;
    GameData.cards[data.player]['peng'].push([data.card, data.card, data.card]);
    GameData.removeDisCard(GameData.game.lastdisUid);
    GameData.game.turn = data.player;
    GameData.game.lastdisUid = 0;
    GameData.game.lastdisCard = 0;
    GameData.game.noActions = false;
    sendEvent('onCardPeng', data);
    sendEvent('onGameTurn', data.player);
  });
  GameNet.getInstance().setCallBack('onCardGangAn', function (data) {
    WriteLog("do event onCardGangAn  " + JSON.stringify(data));
    if (data.player == GameData.player.uid) {
      GameData.cards[data.player]['hand'][data.card] -= 4;
      GameData.game.gangOver = 1;
    }
    GameData.cards[data.player]['handnum'] -= 4;
    GameData.cards[data.player]['gang'].push([data.card, data.card, data.card, data.card, data.card]);
    GameData.game.turn = data.player;
    if (data.player != GameData.player.uid) {
      GameData.game.noActions = false;
    }
    sendEvent('onCardGang', data);
    sendEvent('onGameTurn', data.player);
  });
  GameNet.getInstance().setCallBack('onCardGangMing', function (data) {
    WriteLog("do event onCardGangMing  " + JSON.stringify(data));
    if (data.player == GameData.player.uid) {
      GameData.cards[data.player]['hand'][data.card] -= 3;
      GameData.game.gangOver = 1;
    }
    GameData.cards[data.player]['handnum'] -= 3;
    GameData.cards[data.player]['gang'].push([data.card, data.card, data.card, data.card]);
    GameData.removeDisCard(GameData.game.lastdisUid);
    GameData.game.turn = data.player;
    GameData.game.lastdisUid = 0;
    GameData.game.lastdisCard = 0;
    GameData.game.noActions = false;
    sendEvent('onCardGang', data);
    sendEvent('onGameTurn', data.player);
  });
  GameNet.getInstance().setCallBack('onCardGangMingSelf', function (data) {
    WriteLog("do event onCardGangMingSelf  " + JSON.stringify(data));
    if (data.player == GameData.player.uid) {
      GameData.cards[data.player]['hand'][data.card] -= 1;
      GameData.game.gangOver = 1;
    }
    GameData.cards[data.player]['handnum'] -= 1;
    GameData.cards[data.player]['gang'].push([data.card, data.card, data.card, data.card]);
    GameData.game.turn = data.player;
    GameData.game.noActions = false;
    GameData.removePengCard(data.player, data.card);
    sendEvent('onCardGang', data);
    sendEvent('onGameTurn', data.player);
  });
  GameNet.getInstance().setCallBack('onCardHu', function (data) {
    WriteLog("do event onCardHu  " + JSON.stringify(data));
    GameData.game.winnerUid = data.player;
    GameData.game.winnerType = data.type;
    GameData.game.winnerObtain = data.obtain;
    sendEvent('onCardHu', data);
  });
  GameNet.getInstance().setCallBack('initCardDis', function (data) {
    WriteLog("do event initCardDis  " + JSON.stringify(data));
    GameData.cards[data.uid] = (GameData.cards[data.uid] === undefined) ? {} : GameData.cards[data.uid];
    GameData.cards[data.uid]['dis'] = data.dis;
    GameData.game.discard += data.dis.length;
    if (data.dis.length > 0) {
      GameData.game.noActions = false;
    }
  });
  GameNet.getInstance().setCallBack('initCardChi', function (data) {
    WriteLog("do event initCardChi  " + JSON.stringify(data));
    GameData.cards[data.uid] = (GameData.cards[data.uid] === undefined) ? {} : GameData.cards[data.uid];
    GameData.cards[data.uid]['chi'] = data.chi;
    if (data.chi.length > 0) {
      GameData.game.noActions = false;
    }
  });
  GameNet.getInstance().setCallBack('initCardPeng', function (data) {
    WriteLog("do event initCardPeng  " + JSON.stringify(data));
    GameData.cards[data.uid] = (GameData.cards[data.uid] === undefined) ? {} : GameData.cards[data.uid];
    GameData.cards[data.uid]['peng'] = data.peng;
    if (data.peng.length > 0) {
      GameData.game.noActions = false;
    }
  });
  GameNet.getInstance().setCallBack('initCardGang', function (data) {
    WriteLog("do event initCardGang  " + JSON.stringify(data));
    GameData.cards[data.uid] = (GameData.cards[data.uid] === undefined) ? {} : GameData.cards[data.uid];
    GameData.cards[data.uid]['gang'] = data.gang;
    if (data.gang.length > 0 && data.uid != GameData.player.uid) {
      GameData.game.noActions = false;
    }
  });
  GameNet.getInstance().setCallBack('initCardHandNum', function (data) {
    WriteLog("do event initCardHandNum  " + JSON.stringify(data));
    GameData.cards[data.uid] = (GameData.cards[data.uid] === undefined) ? {} : GameData.cards[data.uid];
    GameData.cards[data.uid]['handnum'] = data.num;
    if (data.num % 3 == 2) {
      GameData.game.turn = data.uid;
    }
  });
  GameNet.getInstance().setCallBack('initCardHand', function (data) {
    WriteLog("do event initCardHand  " + JSON.stringify(data));
    GameData.cards[data.uid] = (GameData.cards[data.uid] === undefined) ? {} : GameData.cards[data.uid];
    GameData.cards[data.uid]['hand'] = data.hand;
  });
  GameNet.getInstance().setCallBack('initCardHua', function (data) {
    WriteLog("do event initCardHua  " + JSON.stringify(data));
    GameData.cards[data.uid] = (GameData.cards[data.uid] === undefined) ? {} : GameData.cards[data.uid];
    GameData.cards[data.uid]['hua'] = data.hua;
    GameData.cards[data.uid]['youNum'] = 0;
    sendEvent('initCardHua', data);
  });
  GameNet.getInstance().setCallBack('initCards', function (data) {
    WriteLog("do event initCards  " + JSON.stringify(data));
    GameData.game.initcards = true;
    GameData.game.roundType = data.roundType;
    GameData.game.roundNum = data.roundNum;
    GameData.game.roundCount = data.roundCount;
    GameData.game.roundmax = data.roundmax;
    GameData.game.zhuangUid = data.zhuang;
    GameData.game.cardHuier1 = data.huier;
    GameData.game.cardHuier2 = GameData.getOtherHuier(data.huier);
    GameData.game.cardleft = data.cardleft;
    GameData.game.winnerUid = 0;
    GameData.game.winnerType = [];
    GameData.game.discard = 0;
    GameData.game.gangOver = 0;
    sendEvent('initCards', data);
  });
  GameNet.getInstance().setCallBack('initZhuangInfo', function (data) {
    WriteLog("do event initZhuangInfo  " + JSON.stringify(data));
    GameData.game.zhuangNum = data;
    sendEvent('initZhuangInfo', data);
  });

  GameNet.getInstance().setCallBack('onZhuang', function (data) {
    WriteLog("do event onZhuang  " + JSON.stringify(data));
    GameData.game.onZhuangInfo.data = data;
    sendEvent('onZhuang', data);
  });

  GameNet.getInstance().setCallBack('onSelectZhuangInfo', function (data) {
    WriteLog("do event onSelectZhuangInfo  " + JSON.stringify(data));
    GameData.game.onSelectZhuangInfo.data = data;
    GameData.game.zhuangUid = data.zhuangUid;
    sendEvent('onSelectZhuangInfo', data);
  });

  GameNet.getInstance().setCallBack('OnXiangGong', function (data) {
    WriteLog("do event OnXiangGong  " + JSON.stringify(data));
    GameData.player.isXiangGong = (data.uid == GameData.player.uid) ? true : false;
  });

  //chat
  GameNet.getInstance().setCallBack('onRoomChat', function (data) {
    WriteLog("do event onRoomChat " + JSON.stringify(data));
    sendEvent('onRoomChat', data);
  });
  GameNet.getInstance().setCallBack('onNotDiscard', function (data) {
    WriteLog("do event onNotDiscard " + JSON.stringify(data));
    sendEvent('onNotDiscard', data);
  });
  GameNet.getInstance().setCallBack('OnZhuangUid', function (data) {
    WriteLog("do event OnZhuangUid " + JSON.stringify(data));
    GameData.game.zhuangUid = data.zhuanguid;
  });
  GameNet.getInstance().setCallBack('onPlayerCard', function (data) {
    WriteLog("do event onPlayerCard " + JSON.stringify(data));
    GameData.player.card = data.card;
  });
  GameNet.getInstance().setCallBack('onCardChange', function (data) {
    WriteLog("do event onCardChange " + JSON.stringify(data));
    GameData.player.card += data.num;
    sendEvent('onCardChange');
  });
  GameNet.getInstance().setCallBack('onClubMoneyChange', function (data) {
    WriteLog("do event onClubMoneyChange " + JSON.stringify(data));
    GameData.getClubDataByClubId(data.club_id).diamond += data.num;
    console.log('onClubMoneyChange' + JSON.stringify(data));
    // GameData.player.club = data.club;
    sendEvent('refreshUIClubData');
  });
  GameNet.getInstance().setCallBack('onScoreHistory', function (data) {
    WriteLog("do event onScoreHistory " + JSON.stringify(data));
    GameData.contact = true;
    GameData.JushuScore = null;
    GameData.JushuScore = data;
  });
  GameNet.getInstance().setCallBack('onClubInvite', function (data) {
    WriteLog("do event onClubInvite " + JSON.stringify(data));
  });
  //俱乐部数据全刷
  GameNet.getInstance().setCallBack('onClubData', function (data) {
    WriteLog("do event onClubData " + JSON.stringify(data));
    // console.log('onClubData' +JSON.stringify(data));
    // GameData.player.club = data.club;
    // //GameData.player.clubName = data.clubName;
    // //console.log('GameData.playerCurrClubId' +GameData.playerCurrClubId);
    // for(var key in GameData.player.club){
    //   if(GameData.playerCurrClubId != key){
    //    GameData.playerCurrClubId = key;
    //   }
    // }
    // GameData.savePlayerCurrClubData();
    // sendEvent('refreshUIClubData');
  });
  GameNet.getInstance().setCallBack('onClubVip', function (data) {
    WriteLog("do event onClubVip " + JSON.stringify(data));
    console.log("do event onClubVip " + JSON.stringify(data));
    GameData.getClubDataByClubId(data.club_id).level = data.level;
    sendEvent('refreshUIClubData');
  });
  GameNet.getInstance().setCallBack('GameConfig', function (data) {
    WriteLog("serverMsg GameConfig " + JSON.stringify(data));
    GameData.configData.paomadeng = data.paomadeng;
    GameData.configData.agentWechat = data.agentWechat;
  });
  GameNet.getInstance().setCallBack('playerClub', function (data) {
    WriteLog("serverMsg playerClub " + JSON.stringify(data));
    if(Object.keys(data.data).length <= 0){
        return;
    }
    if(data.data.clubAdmin <= 0){
        GameData.player.club = {};
    }else{
        GameData.player.club = data.data;
    }
    sendEvent('refreshUIClubData');
  });
  GameNet.getInstance().setCallBack('playerClubInvite', function (data) {
    WriteLog("serverMsg playerClubInvite " + JSON.stringify(data));
    GameData.player.clubInvite = data.data;
    sendEvent('refreshUIClubInvite');
  });
  GameNet.getInstance().setCallBack('playerClubApply', function (data) {
    WriteLog("serverMsg  playerClubApply :" + JSON.stringify(data));
    GameData.player.clubApply = data.data;
    sendEvent('refreshUIClubApply');
  })
  GameNet.getInstance().setCallBack('playerAttr', function(data){
    WriteLog("serverMsg  playerAttr :" + JSON.stringify(data));
    var fields = data.fields;
    for (var i = 0; i < fields.length; i++) {
      switch(fields[i]){
        case 'card':
          GameData.player.card = data.player.card;
        break;

        case 'coin':
          GameData.player.coin = data.player.coin;
        break;

        case 'point':
          GameData.player.point = data.player.point;
        break;
      }
    }
    sendEvent('onCardChange');
  });

}