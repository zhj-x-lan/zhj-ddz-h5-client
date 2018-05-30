var gameDefine = require('gameDefine');
var matchHandler = require('matchHandler');
var configMgr = require('configMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        timeLabel: cc.Label
    },

    onLoad: function () {
        this.limit_time = 0;
        this.initUITime();
    },
    initUITime: function(){
        var time = ++matchHandler.matchTime;

        var hour = parseInt(time/3600);
        var minute = parseInt((time%3600)/60);
        var second = (time%3600)%60;

        hour < 10 ? hour = "0"+hour : null;
        minute < 10 ? minute = "0"+minute : null;
        second < 10 ? second = "0"+second : null;

        var timeStr = hour+": "+minute+": "+second;

        this.timeLabel.string = timeStr;
    },
    update: function (dt) {

        this.limit_time += dt;
        if (this.limit_time >= 1) {
            this.limit_time = 0;

            this.initUITime();
        }
    },
    onCancelClick: function(){
        if (inCD(1000)) {
            return;
        }
        matchHandler.cancel();
        matchHandler.matchTime = -1;
        this.initUITime();
        closeView(this.node.name);
    }
});