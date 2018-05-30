var tdk_roomData = require('tdkRoomData');
var hongzhongData = require('hongzhongData');
var gameDefine = require('gameDefine');
var errorCode = require('errorCode');
var niuNiuHandler = require('niuNiuHandler');
var roomHandler = {

	//当前类型游戏的数据管理
	CurGameData: undefined,

	room: {},				//房间数据
	coinData: {},			//金币场结算数据
	scores: {},				//总分数
	players: [],			//玩家数据
	onlines: [],			//玩家在线数据
    readyData: {},			//准备数据
    dissolveData: {}		//房间解散数据
};

module.exports = roomHandler;

//创建房间
roomHandler.createRoom = function(createData) {
	var self = this;
	openView('Loading');

	GameNet.getInstance().request("room.roomHandler.createRoom", createData, function(ret) {
		if (!ret || ret.result == undefined) {
			messageBoxWithoutCB('_createRoomCallBack error');
			return;
		}

		//房间创建失败
		if (ret.result != errorCode.Success) {
			var errorChar = '';
			switch(ret.result){
				case errorCode.LessCard: errorChar = '房卡不足.'; break;
				case errorCode.NoJoinThisClub: errorChar = '抱歉!您不在该俱乐部.'; break;
				case errorCode.AgentMoneyNotEnough: errorChar = '代理钻石不足,请通知代理及时充值.'; break;
				case errorCode.AgentRoomMax: errorChar = '同时只能代开20个房间.'; break;
				case errorCode.LessPoint: errorChar = '积分不足.'; break;
                case errorCode.LessCoin: errorChar = '金币不足.'; break;
				default: errorChar = '创建房间失败 ' + ret.result; break;
			}
			messageBoxWithoutCB(errorChar);
			closeView('Loading');
			return;
		}

		// 代理开房
		if (ret.isAgentRoom) {
			createMoveMessage('代开房间成功.');
			openView("agentPanel");
			closeView('Loading');
			self.reqAgentRoom();
			self.reqAgentResultRoom();
			return;
		}

		if (!ret.roomid) {
			messageBoxWithoutCB('createRoom cb error roomid');
			return;
		}

		//玩家开房
		GameData.saveCreateRoomOpts();
		self.enterRoom(ret.roomid);
		// closeView('Loading');
	});
};

//进入房间
roomHandler.enterRoom = function(roomid) {
	var num = Number(roomid);
	//检查房间号
	if (num < 100000 || num > 999999) {
		messageBoxWithoutCB('房间号无效');
		closeView('Loading');
		return;
	}
	//赋值地里位置信息
	var enterData = {roomid:num, posInfo:getPosInfo()};
	openView('Loading');
	//发送请求
	GameNet.getInstance().request("room.roomHandler.enterRoom", enterData, function(ret) {
		if (!ret || ret.result == undefined) {
			closeView('Loading');
			messageBoxWithoutCB('enterRoom without ret');
			return;
		}
		if (ret.result != errorCode.Success) {
			var errorChar = '';
			switch(ret.result){
				case errorCode.roomNotFound: errorChar = '房间不存在.'; break;
				case errorCode.roomFull: errorChar = '房间已满.'; break;
				case errorCode.LessCard: errorChar = '房卡不足.'; break;
				case errorCode.LessPoint: errorChar = '积分不足.'; break;
				case errorCode.NoJoinThisClub: errorChar = '抱歉!您不在该俱乐部.'; break;
                case errorCode.LessCoin: errorChar = '金币不足.'; break;
				default: errorChar = '进入房间失败'; break;
			}
			closeView('Loading');
			messageBoxWithoutCB(errorChar);
		}
	});
};

//退出房间
roomHandler.quitRoom = function(roomid) {
	GameNet.getInstance().request("room.roomHandler.quitRoom", {roomid: roomid}, function (rtn) {
		if (rtn.result == errorCode.Success) {
			GameData.player.roomid = undefined;
			cc.director.loadScene('home');
		}
	});
};

//解散房间
roomHandler.deleteRoom = function(roomid, action) {
	GameNet.getInstance().request("room.roomHandler.disbandRoom", {roomid:roomid, action:action}, function (rtn) {});
};

//设置准备
roomHandler.setReady = function() {
	GameNet.getInstance().request("room.roomHandler.ready", {}, function (rtn) {});
}

//请求代理房间信息
roomHandler.reqAgentRoom = function () {
	GameNet.getInstance().request("game.playerHandler.reqAgentRoom", {}, function (rtn) {
		GameData.AgentRoomsData = rtn;
		sendEvent('refreshAgentRoomUINew');
	});
};

//请求代理房间结算信息
roomHandler.reqAgentResultRoom = function () {
	GameNet.getInstance().request("game.playerHandler.AgentResultRoom", {}, function (rtn) {
		GameData.AgentResultRoom = rtn;
		sendEvent('refreshAgentRoomUIResult');
	});
};

roomHandler.getRoomData = function(){
	return this.room;
};
roomHandler.getPlayersData = function(){
	return this.players;
};
roomHandler.getPlayerByUid = function(uid){
	for (var i=0; i<this.players.length; i++) {
		var player = this.players[i];
		if (player && player.uid == uid) {
			return player;
		}
	}
	return null;
};
roomHandler.getPlayerPosByUid = function (uid) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i] && this.players[i].uid && this.players[i].uid == uid) {
            return i;
        }
    }
    return null;
}
roomHandler.getLocalPosition = function (index) {
    var selfIndex = 0;
    var temp = [];
    for (var i = 0; i < this.players.length; i++) {
        temp.push(i);
    }
    var selfIndx = this.getPlayerPosByUid(GameData.player.uid);
    var prev = temp.slice(temp.indexOf(selfIndx));
    prev = prev.concat(temp.slice(0, temp.indexOf(selfIndx)));
    return prev.indexOf(index);
}
roomHandler.getScoreData = function(){
	return this.scores;
};
roomHandler.getOnLinesData = function(){
	return this.onlines;
};
roomHandler.getRoomReadyData = function(){
	return this.readyData;
};
roomHandler.getRoomDissolveData = function(){
	return this.dissolveData;
};
roomHandler.getCoinData = function(){
	return this.coinData;
};
roomHandler.isPlayerOnline = function(uid) {
	return (this.onlines.indexOf(uid) != -1);
};

roomHandler.onRoomInfoSetData = function(data){
	if(data == undefined){
		return;
	}
    this.room = data.room;
    this.scores = data.scores;
    this.players = data.players;
    this.onlines = data.onlines;

    GameData.room = data.room;
    GameData.players = data.players;
    GameData.setGameType(data.room.opts.gameType);
    GameData.player.roomid = data.room.id;
    GameData.client.gameType = data.room.opts.gameType;
    GameData.joiners = [];

    for (var i = 0; i < data.players.length; i++) {
        var player;
        if (data.players[i] && data.players[i] != null) {
            player = data.players[i];
            GameData.joiners[i] = player;
        }
    }
    for (var i = 0; i < GameData.joiners.length; i++) {
        if(GameData.joiners[i] === null || GameData.joiners[i] === undefined){
            GameData.joiners.splice(i,1);
        }
    }
    if (GameData.room.status == gameDefine.RoomState.GAMEING && GameData.room.opts.gameType == gameDefine.GameType.Game_MJ_HuaDian) {
        GameData.game.gameStart = true;
    }
    if (data.room.opts.gameType == gameDefine.GameType.Game_Poker_TianjinDDZ)
    {
        GameDataTJDDZ.setPosition();
    }
    else if (data.room.opts.gameType == gameDefine.GameType.Game_Poker_DDZ)
    {
        GameDataDDZ.setPosition();
    }
    else if (data.room.opts.gameType == gameDefine.GameType.Game_Poker_paodekuai)
    {
        GameDataPDK.setPosition();
    }
    else
    {
        GameData.setPosition();
    }
    //初始化桦甸数据
    if (GameData.room.status <= gameDefine.RoomState.READY) {
        profileHuaDian.initGameData();
    }
};
roomHandler.onPrepareInfoSetData = function(data){
	if(data == undefined){
		return;
	}
    this.readyData = data;
};
roomHandler.onRoomDissolveSetData = function(data){
    if(data == undefined){
        return;
    }
    this.dissolveData = data;
};

roomHandler.registMessage = function() {
	cc.log("....roomHandler registMessage.");

	var self = this;
	GameNet.getInstance().setCallBack('onRoomMsg', function (data) {
		self.room = data.room;
		self.scores = data.scores;
		//self.players = data.players;
		//self.onlines = data.onlines;

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
	});

	GameNet.getInstance().setCallBack('onRoomInfo', function (data) {
		self.onRoomInfoSetData(data);
		sendEvent('onRoomInfo', data);
	});

	GameNet.getInstance().setCallBack('onRoomEnter', function (data) {
		var sceneName, gameType = GameData.room.opts.gameType;
		switch (gameType) {
			case gameDefine.GameType.Game_Mj_Tianjin: sceneName = 'table'; break;
			case gameDefine.GameType.Game_Mj_Shishi: sceneName = 'table-shishi'; break;
			case gameDefine.GameType.Game_MJ_HuaDian:{
				profileHuaDian.registAllMessage();
				sceneName = 'table-huadian1';
			}  break;
			case gameDefine.GameType.Game_Mj_CC:{
				profileChangChun.registAllMessage();
				sceneName = 'table-changchun';
			}  break;
			case gameDefine.GameType.Game_Mj_Heb:{
				profileHeb.registAllMessage();
				sceneName = 'table-heb';
			}  break;
			case gameDefine.GameType.Game_Mj_HZ: {
                hongzhongData.registMessage_hz();
				sceneName = 'table-hz';
            } break;
            case gameDefine.GameType.Game_niu_niu: {
            	niuNiuHandler.registMessage();
            	sceneName = 'table-niuNiu';
            } break;
			case gameDefine.GameType.Game_Poker_DDZ: sceneName = 'table-DDZ'; break;
			case gameDefine.GameType.Game_Poker_TianjinDDZ: sceneName = 'table-TJDDZ'; break;
			case gameDefine.GameType.Game_TDK: sceneName = 'table-TDK'; break;
			case gameDefine.GameType.Game_Poker_13shui: sceneName = 'teble-shisanshui'; break;
			case gameDefine.GameType.Game_Poker_paodekuai: sceneName = 'table-PDK'; break;
			default: return;
		}
		if (sceneName != cc.director.getScene().name) {
			cc.director.loadScene(sceneName);
		}
		closeView('Loading');
	});

    GameNet.getInstance().setCallBack('onRoomReadyInfo', function (data) {
        GameData.game.onRoomReadyInfo.data = data;
        self.onPrepareInfoSetData(data);

        sendEvent('onRoomReadyInfo', data);
    });

	GameNet.getInstance().setCallBack('onRoomClose', function (data) {
		GameData.room.close = true;
		sendEvent('onRoomClose', data);
	});

	GameNet.getInstance().setCallBack('onRoomDissolve', function (data) {
		self.onRoomDissolveSetData(data);
		GameData.game.onRoomDissolve = data;

		sendEvent('onRoomDissolve', data);
	});

	GameNet.getInstance().setCallBack('onCreatorQuit', function (data) {
		sendEvent('onCreatorQuit', data);
	});

	GameNet.getInstance().setCallBack('onJoinerLost', function (data) {
		sendEvent('onJoinerLost', data);
	});

	GameNet.getInstance().setCallBack('onJoinerConnect', function (data) {
		GameData.joinContact = data;
		sendEvent('onJoinerConnect', data);
	});

	GameNet.getInstance().setCallBack('onPrepareInfo', function (data) {
		self.onPrepareInfoSetData(data);

		GameDataTJDDZ.game.onRoomReadyInfo = data;
		GameDataDDZ.game.onRoomReadyInfo = data;
		//填大坑
		tdk_roomData.onRoomReadyInfo = data;
		tdk_roomData.close = false;
		sendEvent('onPrepareInfo', data);
	});

    GameNet.getInstance().setCallBack('onGameCoin', function (data) {

    	self.coinData = data;

        GameData.scores = data;
        GameData.game.gameStart = false;
        GameData.player.isXiangGong = false;
        var temp = data;
        temp.zhuangUid = GameData.game.zhuangUid;
        GameData.JushuScore.push(temp);

        switch (GameData.room.opts.gameType) {
            case gameDefine.GameType.Game_Mj_Tianjin: {
                sendEvent('onGameScore', data);
            } break;
            case gameDefine.GameType.Game_Poker_DDZ: {
				if (data.coins[GameData.player.uid]) {
					sendEvent('coinEndEvent', data);
				} else {
					sendEvent('onShowSummary');
				}
            } break;
            case gameDefine.GameType.Game_Poker_TianjinDDZ: {
				if (data.coins[GameData.player.uid]) {
					sendEvent('coinEndEvent', data);
				} else {
					sendEvent('onShowSummary');
				}
            } break;
            default: return;
        }
    });

	GameNet.getInstance().setCallBack('alertLottery', function (data) {
		if (!data) return;
	    cc.log('data = '+JSON.stringify(data.detail));
	    //转盘抽奖客户端提示
	    if (data) {
	    	openView('GetLottery');
	    }
	});

	GameNet.getInstance().setCallBack('setPlayerAttrib', function (data) {
		for (var key in data) {
			if(data[key] == undefined || data[key] == null){
				continue;
			}
            GameData.player[key] == undefined ? GameData.player[key] = 0 : null;
            var old = parseInt(GameData.player[key]);
            var cur = parseInt(data[key]);
            var differ = cur - old;

            if(key == 'point'){
                if(differ > 0){
                    createMoveMessage("积分 +"+ differ);
                } else if(differ < 0) {
                    createMoveMessage("积分 "+ differ);
                }
            }
			GameData.player[key] = cur;
		}
	});
};