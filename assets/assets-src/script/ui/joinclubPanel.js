cc.Class({
	extends: cc.Component,

	properties: {
		joinClubEditBox: cc.EditBox,
	},
	onLoad: function () {},
	onDestroy: function () {},
	joinClubClick: function () {
		var clubID = this.joinClubEditBox.getComponent(cc.EditBox).string;
		ClubHandler.getInstance().reqJoinClub(clubID);
	},
	close: function () {
		closeView("joinclubIDPanel");
	},

})