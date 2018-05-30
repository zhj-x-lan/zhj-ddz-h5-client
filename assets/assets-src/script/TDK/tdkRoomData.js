var room_tdk = {
    roundNum: 0,
    roundmax: 0,
    addpokersRight: false,

    //创建房间
    createRoomOpts: {},
    //开局信息
    pokers: {},
    roomInfo: {},
    initScore: [],
    //轮流比牌过程
    turn: 0,
    score: [],
    maxScore: 0,
    allInscore: 0,
    actionBtn: {},
    turnerAction: {},
    //结果
    close: 0,
    gameResult: {},
    resultData: {},
    connectWin: 0,
    //其他
    presentScore: {},
    incPokerData: {},
    DropPlayerInfo: {},
    onRoomReadyInfo: {},
};

module.exports = room_tdk;

room_tdk.initCreateRoomOpts = function () {
  var data = cc.sys.localStorage.getItem('createRoomOpts_tdk');
  if (data != null) {
    room_tdk.createRoomOpts = JSON.parse(data);
    return;
  }
  room_tdk.createRoomOpts = {};
  room_tdk.createRoomOpts.playType = 2; //玩法类型(9起 10起)     默认10起  9 1  10 2 全坑 3
  room_tdk.createRoomOpts.king = false; //带王                  默认不带王
  room_tdk.createRoomOpts.nextDouble = false; //烂锅翻倍
  room_tdk.createRoomOpts.roundMax = 15; //最大局数 15 30
  room_tdk.createRoomOpts.roundRule = 71; // 与局数对应 71 72
  room_tdk.createRoomOpts.quanya = 0; //全压       0   30  60
  room_tdk.createRoomOpts.costType = 1; //付費類型               默认房主付费
  room_tdk.createRoomOpts.player = 4; //人数                     默认4人
}

room_tdk.saveCreateRoomOpts = function () {
  if (room_tdk.createRoomOpts == null || room_tdk.createRoomOpts == undefined) return;
  cc.sys.localStorage.setItem('createRoomOpts_tdk', JSON.stringify(room_tdk.createRoomOpts));
}

room_tdk.getHandPokerByUid = function (uid) {
    for (var key in room_tdk.pokers) {
        if (key == uid) {
            return room_tdk.pokers[key];
        }
    }
    return null;
}

room_tdk.getPlayerSexByUid = function (uid) {
    for (var i = 0; i < GameData.joiners.length; ++i) {
        if (GameData.joiners[i] && GameData.joiners[i].uid == uid) {
            return GameData.joiners[i].sex;
        }
    }
    return null;
}

room_tdk.getPlayerInfoByUid = function (uid) {
    for (var i = 0; i < GameData.joiners.length; i++) {
        if (GameData.joiners[i].uid == uid) {
            return GameData.joiners[i];
        }
    }
    return null;
}

room_tdk.getPlayerPosByUid = function (uid) {
    for (var i = 0; i < GameData.joiners.length; i++) {
        if (GameData.joiners[i].uid == uid) {
            return i;
        }
    }
    return null;
}

room_tdk.getLocalPosition = function (index) {
    var selfIndex = 0;
    var temp = [];
    for (var i = 0; i < GameData.joiners.length; i++) {
        temp.push(i);
    }
    var selfIndx = room_tdk.getPlayerPosByUid(GameData.player.uid);
    var prev = temp.slice(temp.indexOf(selfIndx));
    prev = prev.concat(temp.slice(0, temp.indexOf(selfIndx)));
    return prev.indexOf(index);
}

room_tdk.registMessage = function() {
    room_tdk.initCreateRoomOpts();
    //当前玩家分数
    GameNet.getInstance().setCallBack('onPlayerIncScore', function (data) {
        WriteLog("do event onPlayerIncScore  " + JSON.stringify(data));
        var turnerscore = data;
        for (var i = 0; i < turnerscore.length; i++) {
            var userid = turnerscore[i].uid;
            var preScore = turnerscore[i].score;
            if (!room_tdk.presentScore[userid]) {
                room_tdk.presentScore[userid] = {};
            }
            room_tdk.presentScore[userid] = preScore;
        }
        sendEvent('onPlayerIncScore', data);
    });

    //开局底分
    GameNet.getInstance().setCallBack('onPlayerInitScore', function (data) {
        WriteLog("do event onPlayerInitScore  " + JSON.stringify(data));
        room_tdk.initScore = data;
        for (var i = 0; i < room_tdk.initScore.length; i++) {
            var userid = room_tdk.initScore[i].uid;
            var preScore = room_tdk.initScore[i].score;
            if (!room_tdk.presentScore[userid]) {
                room_tdk.presentScore[userid] = {};
            }
            room_tdk.presentScore[userid] = preScore;
        }
        sendEvent('onPlayerInitScore', data);
    });

    //当前谁叫牌
    GameNet.getInstance().setCallBack('onTurner', function (data) {
        WriteLog("onTurner:" + JSON.stringify(data));
        room_tdk.turn = data.uid;
        sendEvent('onTurner', data);
    });
    //刷新按钮显示
    GameNet.getInstance().setCallBack('onActionBtn', function (data) {
        WriteLog("onActionBtn:" + JSON.stringify(data));
        room_tdk.actionBtn = data;
        if (data.allinScore){
            room_tdk.allInscore = data.allinScore;
        }
        room_tdk.maxScore = data.score;
        sendEvent('onActionBtn',data);
    });
    GameNet.getInstance().setCallBack('onPlayerCards', function (data) {
        WriteLog("onPlayerCards:" + JSON.stringify(data));
        for (var key in data) {
            room_tdk.pokers[key] = data[key];
        }
        for (var key in room_tdk.pokers) {
            if (!data[key]) {
                delete room_tdk.pokers[key];
            }
        }
        room_tdk.addpokersRight = true;
        sendEvent('onPlayerCards', data);
    });
    //叫牌者动作
    GameNet.getInstance().setCallBack('onTurnerAction', function (data) {
        WriteLog("onTurnerAction:" + JSON.stringify(data));
        room_tdk.turnerAction = data;
        sendEvent('onTurnerAction',data);
    });
    //结算消息
    GameNet.getInstance().setCallBack('onGameResult', function (data) {
        WriteLog("onGameResult:" + JSON.stringify(data));
        room_tdk.gameResult = data;
        sendEvent('onGameResult',data);
    });
    //总结算
    GameNet.getInstance().setCallBack('onGameAllResult', function (data) {
        WriteLog("onGameAllResult:" + JSON.stringify(data));
        room_tdk.close = true;
        room_tdk.resultData = data;
        sendEvent('onGameAllResult',data);
    });
    GameNet.getInstance().setCallBack('onIncScore', function (data) {
        WriteLog("onIncScore:" + JSON.stringify(data));
        room_tdk.incPokerData = data;
        sendEvent('onIncScore',data);
    });
    GameNet.getInstance().setCallBack('onDropPlayerInfo', function (data) {
        WriteLog("onDropPlayerInfo:" + JSON.stringify(data));
        room_tdk.DropPlayerInfo = data;
        sendEvent('onDropPlayerInfo',data);
    });
    GameNet.getInstance().setCallBack('onRotInfo', function (data) {
        WriteLog("onRotInfo:" + JSON.stringify(data));
        room_tdk.connectWin = data.winner;
        sendEvent('onRotInfo',data);
    });
};
room_tdk.unregistAllMessage = function () {
    GameNet.getInstance().removeAllListeners('onPlayerIncScore');
    GameNet.getInstance().removeAllListeners('onPlayerInitScore');
    GameNet.getInstance().removeAllListeners('onTurner');
    GameNet.getInstance().removeAllListeners('onActionBtn');
    GameNet.getInstance().removeAllListeners('onPlayerCards');
    GameNet.getInstance().removeAllListeners('onTurnerAction');
    GameNet.getInstance().removeAllListeners('onGameResult');
    GameNet.getInstance().removeAllListeners('onGameAllResult');
    GameNet.getInstance().removeAllListeners('onIncScore');
    GameNet.getInstance().removeAllListeners('onDropPlayerInfo');
};