cc.Class({
    extends: cc.Component,

    properties: {
        runlampLabel: cc.Label,
        _paoMadengX: 0,
    },

    // use this for initialization
    onLoad: function () {

        this.node.zIndex = 1000;
        this.runPaoMadeng();

        var point = cc.director.getWinSize();
        // var sceneSize = cc.director.getWinSizeInPixels();
        var paoMaDeng = cc.find('paoMaDeng', this.node);
        paoMaDeng.setPosition(cc.p(point.width / 2, point.height / 1.25));
    },

    onClose: function () {
        closeView(this.node.name);
    },

    changeRunlamp: function(oriented) {
        var point = cc.director.getWinSize();
        // var sceneSize = cc.director.getWinSizeInPixels();
        var paoMaDeng = cc.find('paoMaDeng', this.node);
        if (oriented == AutoScene.SCENE_HORIZONTAL)
        {
            paoMaDeng.rotation = -90;
            paoMaDeng.setPosition(cc.p(point.height / 3.8, point.width / 3.2));
        }
        else if (oriented == AutoScene.SCENE_VERTICAL)
        {
            paoMaDeng.setPosition(cc.p(point.width / 1.8, point.height / 1.18));
        }
    },

    runPaoMadeng: function () {
        this._paoMadengX = this.runlampLabel.node.x;
        GameData.configData.paomadengIndex = 0;
        this.gotoPaoMadeng();
        this.schedule(this.gotoPaoMadeng, 10);
    },

    gotoPaoMadeng: function () {
        if (!GameData.serverNoticeData[1]) return;
        var paoMaStr = GameData.serverNoticeData[1].content;
        paoMaStr = paoMaStr.replace(/[\n]/ig, '');
        this.runlampLabel.string = paoMaStr;
        this.runlampLabel.node.x = this._paoMadengX;
        var moveToAction = cc.moveTo(10, cc.p(this._paoMadengX - 570 - this.runlampLabel.node.width, this.runlampLabel.node.y));
        var sequence = cc.sequence(moveToAction, cc.callFunc(function () {
            closeView("RunlampPanel1");
        }));
        this.runlampLabel.node.runAction(sequence);
        // GameData.configData.paomadengIndex++;
        // if (GameData.configData.paomadengIndex == GameData.configData.paomadeng.length) {
        //     GameData.configData.paomadengIndex = 0;
        // }
    },
});