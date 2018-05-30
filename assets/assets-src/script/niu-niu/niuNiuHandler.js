var roomHandler = require('roomHandler');
var niuNiuHandler = {
	isStartAnimationPlayed: false,
	isSelfClickAdviseBtn: false,
	status: 0,
	zhuangUid: 0,
	gameStart: false,
	playerCards: {},
	playerScore: {},
	playerChips: {},
	playerZhuang: {},
	playerSendCard: {},
	recordType: {},

	NIU_NIU: {
	    GAMESTATUS: {
	        ZHUANG: 1,  //抢庄阶段
	        CHIPS: 2,   //下注阶段
	        COMPARE: 3, //比牌阶段
	        SETTLE: 4,	//结算阶段
	    },
	    POKER_TYPE: {
	        NIU_NONE: 0,    //没牛
	        NIU_ONE: 1,     //牛一
	        NIU_Two: 2,     //牛二
	        NIU_Three: 3,   //牛三
	        NIU_Four: 4,    //牛四
	        NIU_Five: 5,    //牛五
	        NIU_Six: 6,     //牛六
	        NIU_Seven: 7,   //牛七
	        NIU_Eight: 8,   //牛八
	        NIU_Nine: 9,    //牛九
	        NIU_NIU: 10,    //牛牛
	        NIU_HuaFour: 12,//四花
	        NIU_HuaFive: 13,//五花
	        NIU_Bomb: 14,   //炸弹
	        NIU_Little: 11, //小牛牛
	    }
	}
};

module.exports = niuNiuHandler;
niuNiuHandler.initAllData = function () {
	this.isStartAnimationPlayed = false;
	this.isSelfClickAdviseBtn = false;
	this.status = 0;
	this.zhuangUid = 0;
	this.gameStart = false;
	this.playerCards = {};
	this.playerScore = {};
	this.playerChips = {};
	this.playerZhuang = {};
	this.playerSendCard = {};
	this.recordType = {};
};
niuNiuHandler.requestZhuang = function(zhuangNum) {
    var self = this;
    var data = {num: zhuangNum};
    GameNet.getInstance().request('room.niuNiuHandler.setZhuang', data, function(rtn) {});
};
niuNiuHandler.requestStart = function () {
	var self = this;
    GameNet.getInstance().request('room.niuNiuHandler.setStart', {}, function(rtn) {
    	if (rtn.result == 0) {
    		return 0;
    	}
    });
};
niuNiuHandler.requestChips = function (chipNum) {
	var self = this;
	var chips = {num: chipNum};
    GameNet.getInstance().request('room.niuNiuHandler.setChips', chips, function(rtn) {

    });
};
niuNiuHandler.requestSend = function () {
	var self = this;
    GameNet.getInstance().request('room.niuNiuHandler.setShow', {}, function(rtn) {
    	
    });
}

niuNiuHandler.registMessage = function() {
	var self = this;

	GameNet.getInstance().setCallBack('douniu-onGameStart', function (data) {
		self.gameStart = true;
		self.isStartAnimationPlayed = true;
		sendEvent('douniu-onGameStart', data);
	});

	GameNet.getInstance().setCallBack('douniu-onGameEnd', function (data) {
		self.status = 0;
		self.gameStart = false;
		sendEvent('douniu-onGameEnd', data);
	});

	GameNet.getInstance().setCallBack('douniu-onGameInfo', function (data) {
		self.status = data.status;
		self.zhuangUid = data.zhuangUid;
		self.playerZhuang = data.zhuangs;
		self.playerChips = data.chips;
		self.playerScore = data.score;
		self.playerSendCard = data.show;
		self.recordType = data.record;
		sendEvent('douniu-onGameInfo', data);
	});

	GameNet.getInstance().setCallBack('douniu-onGameCards', function (data) {
		self.playerCards[data.uid] = data.cards;
		cc.log('self.playerCards = '+JSON.stringify(self.playerCards));
		sendEvent('douniu-onGameCards', data);
	});

	GameNet.getInstance().setCallBack('douniu-onShowCards', function (data) {
		cc.log('douniu-onShowCards = '+JSON.stringify(data));
		sendEvent('douniu-onShowCards', data);
	});
};