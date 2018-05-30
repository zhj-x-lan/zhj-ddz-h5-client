var roundDetail = cc.Class({
    extends: cc.Component,

    properties: {
        roundDetailPanel: {
            default: null,
            type: cc.Node
        },
        roundNum: {
            default: null,
            type: cc.Label
        },
        scoreNode: {
            default: null,
            type: cc.Node
        },
        allScore: {
            default: null,
            type: cc.Node
        },

        fonts :{
            default:[],
            type:cc.Font
        },

        id: 0
    },

    onLoad: function () {
    },

    setRoundNumString : function(number){
        this.roundNum.getComponent('cc.Label').string = number;
    },

    setScoreNodeString : function(number){

        if( number > 0 ){
            this.scoreNode.getComponent('cc.Label').font = this.fonts[0];
            this.scoreNode.getComponent('cc.Label').string = "+"+number;
        } else if( number < 0 ){
            this.scoreNode.getComponent('cc.Label').font = this.fonts[1];
            this.scoreNode.getComponent('cc.Label').string = number;
        } else{
            this.scoreNode.getComponent('cc.Label').font = this.fonts[2];
            this.scoreNode.getComponent('cc.Label').string = number;
        }
    },

    setAllScoreNodeString : function(number){

        if( number > 0 ){
            this.allScore.getComponent('cc.Label').font = this.fonts[0];
            this.allScore.getComponent('cc.Label').string = "+"+number;
        } else if( number < 0 ){
            this.allScore.getComponent('cc.Label').font = this.fonts[1];
            this.allScore.getComponent('cc.Label').string = number;
        } else{
            this.allScore.getComponent('cc.Label').font = this.fonts[2];
            this.allScore.getComponent('cc.Label').string = number;
        }
    }
});
module.exports = roundDetail;
