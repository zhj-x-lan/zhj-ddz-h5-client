cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel: cc.Label,
        fonts: [cc.Font],
    },

    // use this for initialization
    onLoad: function () {

    },

    getScoreColor: function(score){
        this.scoreLabel.getComponent(cc.Label).string = score;
        if (score > 0) {
            this.scoreLabel.getComponent(cc.Label).string = '+'+score;
            this.scoreLabel.getComponent(cc.Label).font = this.fonts[0];
        }else if (score < 0) {
            this.scoreLabel.getComponent(cc.Label).string = score;
            this.scoreLabel.getComponent(cc.Label).font = this.fonts[1];
        }else if (score == 0) {
            this.scoreLabel.getComponent(cc.Label).string = score;
            this.scoreLabel.getComponent(cc.Label).font = this.fonts[2];
        }
    }
});
