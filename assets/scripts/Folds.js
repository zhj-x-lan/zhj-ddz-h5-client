var Folds = cc.Class({
    extends: cc.Component,

    properties: {
        _folds: null,
    },

    onLoad: function () {
        if (cc.vv == null) {
            return;
        }
        this.initView();
        this.initAllFolds();
        this.initEventHandler();
    },

    initView: function () {
        this._folds = {};
        var game = this.node.getChildByName("game");
        var sides = ["myself", "right", "up", "left"];
        for (var i = 0; i < sides.length; ++i) {
            var sideName = sides[i];
            var sideRoot = game.getChildByName(sideName);
            var folds = [];
            var foldRoot = sideRoot.getChildByName("folds");
            for (var j = 0; j < foldRoot.children.length; ++j) {
                var n = foldRoot.children[j];
                n.active = false;
                var sprite = n.getComponent(cc.Sprite);
                sprite.spriteFrame = null;
                folds.push(sprite);
            }
            this._folds[sideName] = folds;
        }
        this.hideAllFolds();
    },

    hideAllFolds: function () {
        for (var k in this._folds) {
            var f = this._folds[i];
            for (var i in f) {
                f[i].node.active = false;
            }
        }
    },

    initEventHandler: function () {
        var self = this;
        this.node.on('game_start', function (data) {
            self.initAllFolds();
        });

        this.node.on('folds_sync', function (data) {
            self.initAllFolds();
        });

        this.node.on('game_chupai_notify', function (data) {
           
            self.initFolds(data.detail);
        });

        this.node.on('guo_notify', function (data) {
            self.initFolds(data.detail);
        });

        this.node.on('game_reset', function () {
            var userMap = cc.vv.gameMgr.userMap;
            var len = cc.vv.gameMgr.playerNum;
            for (let i = 0; i < len; i++) {
                var seatData = userMap[i];
                seatData.folds = [];
                var data = {
                    seatData: seatData
                };
                self.initFolds(data);
            }
        });

        this.node.on('game_folds_rec', function (data) {
            self.initFolds(data.detail);
        });
    },

    initAllFolds: function () {
        var userMap = cc.vv.gameMgr.userMap;
        for (var index in userMap) {
            if (index < 4) {
                var data = {
                    seatData: userMap[index]
                };
                this.initFolds(data);
            }
        }
    },

    initFolds: function (data) {
        var seatData = data.seatData;
        var folds = seatData.folds;
        if (folds == null) {
            return;
        }
        var localIndex = cc.vv.gameMgr.getLocalIndex(seatData.kPos);
        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var foldsSprites = this._folds[side];

        for (var i = 0; i < foldsSprites.length; ++i) {
            var index = i;
            if (side == "right" || side == "up") {
                index = foldsSprites.length - i - 1;
            }
            var sprite = foldsSprites[index];
            sprite.node.active = true;

            this.setSpriteFrameByMJID(pre, sprite, folds[i]);
        }
        for (var i = folds.length; i < foldsSprites.length; ++i) {
            var index = i;
            if (side == "right" || side == "up") {
                index = foldsSprites.length - i - 1;
            }
            var sprite = foldsSprites[index];

            sprite.spriteFrame = null;
            sprite.node.active = false;
        }

    },

    setSpriteFrameByMJID: function (pre, sprite, mjid) {
        sprite.node.active = true;
        if (mjid >= 0) {
            sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjid);
        } else {
            if (cc.vv.gameMgr.gameState == 'started') {
                sprite.spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrameById(mjid);
                if (mjid == -1 || mjid == -3) {
                    sprite.node.scale = 1;
                    sprite.node.width = 55;
                    sprite.node.height = 84;
                }
            }
        }
    },

});
