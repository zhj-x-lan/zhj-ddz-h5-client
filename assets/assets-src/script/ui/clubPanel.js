cc.Class({
	extends: cc.Component,

	properties: {
		selectCloseBtn: cc.Button,
		joinCloseBtn: cc.Button,
	},
	onLoad: function () {
		this.registerListener();
		this.initUI();
	},
	onEnter: function () {

	},
	registerListener: function () {

	},
	initUI: function () {

	},
	onDestroy: function () {

	},

	joinClubClick: function () {
		openView("joinclubPanel");
	},
	close: function (eve, data) {
		//data 1 关闭选择俱乐部界面  other 关闭加入俱乐部界面
		if (data == 1) {
			closeView("selectclubPanel");
		} else {
			closeView("joinclubPanel");
		}

	},

})