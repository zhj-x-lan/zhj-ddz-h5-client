var roomHandler = require('roomHandler');
var errorCode = require('errorCode');

var matchHandler = {
	matchTime: 0,
	onMatch: false
};

module.exports = matchHandler;

matchHandler.signup = function(gameType) {
	var self = this;
	GameNet.getInstance().request("game.matchHandler.signup", {gameType: gameType}, function (rtn) {
		if (rtn.ret == errorCode.Success) {
			self.matchTime = 0;
			openView('UIMatch');
		} else {
			var errorChar = '';
			console.log('match ret:'+rtn.ret);
			switch(rtn.ret) {
				case errorCode.lessCoin: errorChar = '金币不足.'; break;
				default: errorChar = '匹配失败'; break;
			}
			messageBoxWithoutCB(errorChar);
		}
	});
};

matchHandler.cancel = function() {
	GameNet.getInstance().request("game.matchHandler.cancel", {}, function (rtn) {});
	this.matchTime = 0;
	this.onMatch = false;
};

matchHandler.registMessage = function() {

	var self = this;
	GameNet.getInstance().setCallBack('createMatchRoom', function (ret) {
        self.onMatch = false;
        self.matchTime = 0;
		roomHandler.enterRoom(ret.roomid);
	});
    GameNet.getInstance().setCallBack('onMatchData', function (ret) {
        self.onMatch = true;
        self.matchTime = Math.abs(parseInt((new Date().getTime() - ret.time)/1000));

        sendEvent('onMatchData');
    });
};
