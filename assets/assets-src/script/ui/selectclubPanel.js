cc.Class({
	extends: cc.Component,

	properties: {
		selectCloseBtn: cc.Button,
		joinCloseBtn: cc.Button,
		clubScorllItem: cc.Node,
	},
	onLoad: function () {
		this.registerListener();
		this.initUI();
	},
	onEnable: function () {
		//var ClubData = {club:GameData.player.club,clubName:GameData.player.clubName};
		//if (ClubData) this.refreshUI();
	},
	registerListener: function () {
		registEvent('onClubData', this, this.refreshUI);
	},
	initUI: function () {
		// var clubData = {
		// 	'1':{name:123},'2' :{name : 123},'3':{name :1325}
		// }
		//console.log("GameData.player.club  ",GameData.player.club);
		var i = 1;
		this.clubScorllItem.getParent().height = Object.keys(GameData.player.club).length * this.clubScorllItem.height;
		for (var key in GameData.player.club) {
			//console.log("key  ",key);
			//console.log("i  ",i);
			var clubItem = cc.instantiate(this.clubScorllItem);
			clubItem.parent = this.clubScorllItem.parent;
			clubItem.name = 'clubItem_' + (i + 1);
			clubItem.setTag(i);
			clubItem.y = this.clubScorllItem.y - this.clubScorllItem.height * (i);

			var clubItemName = cc.find('clubItem_' + i + '/clubName', this.clubScorllItem.parent);
			var clubItmeBtn = cc.find('clubItem_' + i + '/selectClubBtn', this.clubScorllItem.parent);
			var clubid = GameData.player.club[key].club_id;
			clubItmeBtn.setTag(clubid);
			// console.log("clubItmeBtn  ",clubItmeBtn.getTag());
			clubItmeBtn.on(cc.Node.EventType.TOUCH_END, this.selectClubClick, this);
			clubItemName.getComponent('cc.Label').string = GameData.player.club[key].clubName;
			i++;
		}
		this.clubScorllItem.parent.removeChildByTag(i - 1, true);
	},
	refreshUI: function () {
		//刷新clubItme数据
		var i = 1;
		for (var key in GameData.player.club) {
			var clubItem = cc.find('clubItem_' + (i + 1), this.clubScorllItem.parent);
			if (!clubItem) {
				clubItem = cc.instantiate(this.clubScorllItem);
				clubItem.parent = this.clubScorllItem.parent;
				clubItem.name = 'clubItem_' + (i + 1);
				clubItem.setTag(i);
				clubItem.y = this.clubScorllItem.y - this.clubScorllItem.height * (i);
			}
			var clubItemName = cc.find('clubItem_' + i + '/clubName', this.clubScorllItem.parent);
			var clubItmeBtn = cc.find('clubItem_' + i + '/selectClubBtn', this.clubScorllItem.parent);
			var clubid = GameData.player.club[key].club_id;
			clubItmeBtn.setTag(clubid);
			// console.log("clubItmeBtn  ",clubItmeBtn.getTag());
			clubItmeBtn.on(cc.Node.EventType.TOUCH_END, this.selectClubClick, this);
			clubItemName.getComponent('cc.Label').string = GameData.player.club[key].clubName;
			i++;
		}
		this.clubScorllItem.parent.removeChildByTag(i - 1, true);
	},
	onDestroy: function () {
		unregistEvent('onClubData', this, this.refreshUI);
	},
	selectClubClick: function (event) {
		var clubid = event.target.tag;
		console.log("clubid  " + clubid);
		GameData.playerCurrClubId = clubid;
		GameData.savePlayerCurrClubData();

		//ClubHandler.getInstance().setClubCurrId(clubid);
		sendEvent('refreshUIClubData');
		this.close();
	},
	close: function () {
		closeView("selectclubPanel");
	},

})