cc.Class({
	extends: cc.Component,
	properties: {
		EditBox: cc.EditBox,
	},

	onLoad: function () {},
	sendClick: function () {
		//var agentID = this.EditBox.getComponent(cc.EditBox).string;
		createMessageBox("功能暂未开放！", function () {});
		//ClubHandler.getInstance().reqBindAgent(GameData.player.uid,agentID);
	}
})