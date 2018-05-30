cc.Class({
    extends: cc.Component,

    properties: {
        layer_zhuang: cc.Node,
        title_zz: cc.Sprite,
        title_lz: cc.Sprite,
        button_zz: cc.Button,
        button_la: cc.Button,
        button_cancel: cc.Button,
        button_la_1: cc.Button,
        button_la_2: cc.Button,
        button_cancel_2: cc.Button,
        // zhuangTypeNode_2 :cc.Node,
        // content1: cc.Label,
        // content2: cc.Label,
        // content3: cc.Label,
        waiting_text: cc.Sprite,
        headerNode: cc.Node,
        infoLabel: cc.Label,

        //_zhuangUid : 0,
    },

    // use this for initialization
    onLoad: function () {
        registEvent('onRoomInfo', this, this.showPlayers);
        registEvent('onZhuang', this, this.onZhuangHandler);
        registEvent('onSelectZhuang', this, this.showZuoZhuang);
        registEvent('onSelectLazhuang', this, this.showLaZhuang);
        registEvent('onSelectZhuangAgain', this, this.showZhuangAgain);
        registEvent('onSelectLazhuangAgain', this, this.showLaZhuangAgain);
        registEvent('initZhuangInfo', this, this.close);
        registEvent('onSelectZhuangInfo', this, this.onSelectZhuangInfo);
        registEvent('initCards', this, this.onCloseZhuang);
        registEvent('onJoinerLost', this, this.showJoinerLost);
        registEvent('onJoinerConnect', this, this.showJoinerConnect);

        //this._zhuangUid = 0;  
        this.initHeaderUI();
    },

    onEnable: function () {
        if (GameData.joiners != null) {
            this.showPlayers();
        }
        console.log("sendEventLater");
        //cc.log("GameData.game.onSelectZhuang.data=",GameData.game.onSelectZhuang.data);
        if (GameData.game.onSelectZhuang.data) sendEvent('onSelectZhuang', GameData.game.onSelectZhuang.data);
        if (GameData.game.onSelectLazhuang.data) sendEvent('onSelectLazhuang', GameData.game.onSelectLazhuang.data);

        // if (GameData.game.onSelectLaZhuangAgain.data) sendEvent('onSelectLaZhuangAgain', GameData.game.onSelectLaZhuangAgain.data);
        if (GameData.game.onSelectZhuangInfo.data) sendEvent('onSelectZhuangInfo', GameData.game.onSelectZhuangInfo.data);
        if (GameData.game.onZhuangInfo.data) sendEvent('onZhuang', GameData.game.onZhuangInfo.data);

        if (GameData.game.onSelectZhuangAgain.data) sendEvent('onSelectZhuangAgain', GameData.game.onSelectZhuangAgain.data);

        if (GameData.game.initcards) {
            this.onCloseZhuang();
        }
    },


    onDestroy: function () {
        unregistEvent('onRoomInfo', this, this.showPlayers);
        unregistEvent('onZhuang', this, this.onZhuangHandler);
        unregistEvent('onSelectZhuang', this, this.showZuoZhuang);
        unregistEvent('onSelectLazhuang', this, this.showLaZhuang);
        unregistEvent('onSelectZhuangAgain', this, this.showZhuangAgain);
        unregistEvent('initZhuangInfo', this, this.close);

        unregistEvent('onJoinerLost', this, this.showJoinerLost);
        unregistEvent('onJoinerConnect', this, this.showJoinerConnect);
    },

    initHeaderUI: function () {
        for (var i = 0; i < GameData.room.opts.joinermax - 1; i++) {
            var index = i + 1;
            var hNode = cc.instantiate(this.headerNode);
            hNode.parent = this.headerNode.parent;
            hNode.name = 'header_' + (i + 2);
            hNode.x = this.headerNode.x + (i + 1) * 230;
            //this.showHeaderTip(index,'');
            this.showHeaderZhuang(index, false);
            this.hideHeaderButtom(index);
        };
    },

    onCloseZhuang: function () {
        this.close();
    },

    close: function () {
        this.layer_zhuang.active = false;
        this.waiting_text.node.active = false;
    },

    showPlayers: function () {
        for (var i = 0; i < GameData.joiners.length; i++) {
            var index = i + 1;
            var joiner = GameData.joiners[i];
            // cc.log("joiner.name:",joiner.name);
            if (joiner != null) {
                var uid = joiner.uid;
                var headimgurl = joiner.headimgurl;
                this.showHeaderIcon(index, headimgurl);
                this.showHeaderName(index, joiner.name);
                console.log("GameData.game.zhuangUid == joiner.uid", GameData.game.zhuangUid, joiner.uid);
                this.showHeaderZhuang(index, GameData.game.zhuangUid == joiner.uid);
            }
            //this.showHeaderTip(index,'');
            this.hideHeaderButtom(index);
        }
    },

    _show: function (zhuang) {
        cc.log("GameData.room.opts.lazhuang == ", GameData.room.opts.lazhuang);
        if (GameData.room.opts.lazhuang == 1) {
            this.button_zz.node.active = true;
            this.button_la.node.active = true;
            this.button_cancel.node.active = true;
            this.button_la_1.node.active = false;
            this.button_la_2.node.active = false;
            this.button_cancel_2.node.active = false;

            this.button_zz.node.active = zhuang;
            this.button_la.node.active = !zhuang;

        } else {
            cc.log("GameData.room.opts.lazhuang ==2 ", GameData.room.opts.lazhuang);
            this.button_zz.node.active = false;
            this.button_la.node.active = false;
            this.button_cancel.node.active = false;
            this.button_la_1.node.active = true;
            this.button_la_2.node.active = true;
            this.button_cancel_2.node.active = true;

            // this.button_zz.node.active = zhuang;
            this.button_la_1.node.active = !zhuang;
            this.button_la_2.node.active = !zhuang;
            this.button_cancel_2.node.active = !zhuang;
        }
        this.layer_zhuang.active = true;
        this.waiting_text.node.active = false;
        // this.button_zz.node.active = zhuang;
        // this.button_la.node.active = !zhuang;
    },

    onSelectZhuangInfo: function (data) {
        cc.log("data.detail==============", data.detail);
        var zhuangid = data.detail.zhuangUid;
        var selectPlayerData = data.detail.data;
        cc.log(JSON.stringify(selectPlayerData));
        // this._zhuangUid = zhuangid;
        //this._zhuangUid =  GameData.game.zhuangUid
        this.showPlayers();
        this._show(zhuangid == GameData.player.uid);
        var hasZuozhuang = false;
        var needTizhuang = true;
        for (var i = 0; i < GameData.joiners.length; i++) {
            var index = i + 1;
            var joiner = GameData.joiners[i];
            if (joiner != null) {
                var uid = joiner.uid;
                var num = 0;
                if (selectPlayerData[uid] != undefined) {
                    num = selectPlayerData[uid];
                }
                else {
                    //if (GameData.game.onSelectZhuangInfo.data) sendEvent('onSelectZhuangInfo', GameData.game.onSelectZhuangInfo.data); 
                    num = -1;
                }
                var headimgurl = joiner.headimgurl;
                this.showHeaderIcon(index, headimgurl);
                this.showHeaderName(index, joiner.name);
                this.showHeaderZhuang(index, zhuangid == joiner.uid);
                console.log("num=================", num);
                if (num > 0) {
                    if (zhuangid == uid && GameData.room.opts.lazhuang == 1) {
                        hasZuozhuang = true;
                        this.showHeaderButtom(index, 'zuo' + num);
                    }
                    else if (num == 1) {
                        this.showHeaderButtom(index, 'la');
                    }
                    else if (num == 2) {
                        this.showHeaderButtom(index, 'la2');
                    }
                }
                else if (num == 0) {
                    this.showHeaderButtom(index, 'bula');
                }
                else {
                    needTizhuang = false;
                    this.hideHeaderButtom(index);
                }
            }
            //this.showHeaderTip(index,'');
        }

        //show info begin

        if (needTizhuang == true) {
            if (GameData.player.uid == zhuangid) {
                this.enableButton(true);
                this.showInfo('您是否选择踢庄？');
            }
            else {
                this.enableButton(false);
                this.showInfo('请等待庄家踢庄...');
            }
            return;
        }

        if (hasZuozhuang == false) {
            if (GameData.room.opts.lazhuang == 1) {
                if (GameData.player.uid == zhuangid) {
                    this.enableButton(true);
                    this.showInfo('您是否选择坐庄？');
                }
                else {
                    this.enableButton(false);
                    this.showInfo('请等待庄家坐庄...');
                }
            }
            else if (GameData.room.opts.lazhuang == 2) {

                this.enableButton(true);
                this.showInfo('请等待玩家拉庄...');

            }

        }
        else {
            if (selectPlayerData[GameData.player.uid] == undefined) {
                console.log("GameData.player.uid ,,,zhuangid", GameData.player.uid, zhuangid);
                this.enableButton(true);
                if (GameData.player.uid != zhuangid) {
                    this.showInfo('您是否选择拉庄？');
                }
            }
            else {
                this.enableButton(false);
                if (GameData.player.uid == zhuangid) {
                    this.showInfo('请等待闲家拉庄...');
                }
                else {
                    if (hasZuozhuang) {
                        this.showInfo('请等待闲家拉庄...');
                    }
                    else {
                        this.showInfo('请等待庄家坐庄...');
                    }
                }
            }
        }

        if (GameData.room.opts.lazhuang == 2) {
            var hasSelect = false;
            for (var uid in selectPlayerData) {
                if (uid == GameData.player.uid) {
                    hasSelect = true;
                }
                console.log('uid  ,GameData.player.uid , hasSelect ', uid, GameData.player.uid, hasSelect);
            }

            this.enableButton(!hasSelect);
        }
    },

    onZhuangHandler: function (data) {
        var uid = data.detail.uid;
        var num = data.detail.num;
        //var zhuangid = data.detail.zhuangUid;
        console.log("=========================", data.detail);
        var index = 0;
        for (var i = 0; i < GameData.joiners.length; i++) {
            var joiner = GameData.joiners[i];
            if (joiner && joiner.uid == uid) {
                index = i + 1;
                break;
            };
        };

        if (num > 0) {
            if (GameData.game.zhuangUid == uid) {
                this.showHeaderButtom(index, 'zuo' + num);
                if (uid == GameData.player.uid) {
                    this.showInfo('请等待玩家拉庄...');
                }
            }
            else if (num == 1) {
                this.showHeaderButtom(index, 'la');
            }
            else if (num == 2) {
                this.showHeaderButtom(index, 'la2');
            }
        }
        else {
            this.showHeaderButtom(index, 'bula');
        }

    },

    showZuoZhuang: function (data) {
        // this._zhuangUid = data.detail.uid;

        // this._zhuangUid = GameData.game.zhuangUid
        this.showPlayers();
        if (GameData.room.opts.lazhuang == 1) {

            if (GameData.game.zhuangUid == GameData.player.uid) {
                this.enableButton(true);
                this._show(true);
                this.showInfo('您是否选择坐庄？');
            }
            else {
                this._show(false);
                this.enableButton(false);
                this.showInfo('请等待庄家坐庄...');
            }
        }
        else if (GameData.room.opts.lazhuang == 2) {
            if (GameData.game.zhuangUid == GameData.player.uid) {
                this.enableButton(true);
                this._show(true);
                this.showInfo('您是否选择拉庄？');
            }
            else {
                this._show(true);
                this.enableButton(false);
                this.showInfo('请等待玩家拉庄...');
            }
        }

        //else this.showWaitText(1);
    },

    showLaZhuang: function (data) {
        //cc.log("showLaZhuang   data.detail.uid:" + data.detail.uid + "  data.uid:"+ data.uid +"  zhuangUid:"+ GameData.game.zhuangUid );
        cc.log("GameData.room.opts.lazhuang--------------", GameData.room.opts.lazhuang);
        if (GameData.room.opts.lazhuang == 1) {
            if (GameData.game.zhuangUid != GameData.player.uid) {

                this.enableButton(true);
                this._show(false);
                this.showInfo('您是否选择拉庄？');
            }
            else {
                this._show(true);
                this.enableButton(false);
                this.showInfo('请等待玩家拉庄...');
            }
        }
        else if (GameData.room.opts.lazhuang == 2) {
            if (data.detail.uid == undefined) return;
            if (GameData.game.zhuangUid != GameData.player.uid) {
                this.enableButton(true);
                this._show(false);
                this.showInfo('您是否选择拉庄？');
            }
            else {
                this._show(true);
                this.enableButton(false);
                this.showInfo('请等待玩家拉庄...');
            }
        }
        this.showPlayers();
    },

    showLaZhuangAgain: function (data) {
        cc.log("showLaZhuangAgain  data.detail.uid:" + data.detail.uid + "  data.uid:" + data.uid + "  zhuangUid:" + GameData.game.zhuangUid);
        //if (GameData.room.opts.lazhuang != 2) return;
        if (data.detail.uid == undefined) return;
        if (GameData.game.zhuangUid == GameData.player.uid) return;
        this.enableButton(true);
        this._show(false);
        this.showInfo('您是否选择再次拉庄？');
    },

    showZhuangAgain: function (data) {
        if (GameData.game.zhuangUid == GameData.player.uid) {
            this.enableButton(true);
            this._show(true);
            this.showInfo('您是否选择踢庄？');
        }
        else {
            this.showInfo('请等待庄家踢庄...');
        }
        //else this.showWaitText(3);

    },

    showWaitText: function (status) {
        if (!this.layer_zhuang.active) {
            var texture = cc.textureCache.addImage(cc.url.raw('resources/table/zhuang/waitzhuang' + status + '.png'));
            this.waiting_text.spriteFrame = new cc.SpriteFrame(texture);
            this.waiting_text.node.active = true;
        }
    },

    showHeaderIcon: function (index, headimgurl) {
        if (headimgurl == undefined || headimgurl == '' || headimgurl.length <= 0) {
            return;
        }

        var self = this;
        cc.loader.load({ url: headimgurl, type: 'png' }, function (error, texture) {
            if (!error && texture) {
                var iconNode = cc.find('header_' + index + '/default_headpic', self.headerNode.parent);
                iconNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },

    showHeaderName: function (index, nameStr) {
        var nameNode = cc.find('header_' + index + '/nameLabel', this.headerNode.parent);
        cc.log("nameStr:", nameStr);
        if (!nameNode) return;
        nameNode.getComponent(cc.Label).string = getShortStr(nameStr, 4);
    },

    showHeaderZhuang: function (index, show) {
        var zhuangNode = cc.find('header_' + index + '/zhuangbiaoshi', this.headerNode.parent);
        if (!zhuangNode) return;
        zhuangNode.active = show;
    },

    hideHeaderButtom: function (index) {
        var zuoNode = cc.find('header_' + index + '/zuo1', this.headerNode.parent);
        if (!zuoNode) return;
        zuoNode.active = false;
    },

    showHeaderButtom: function (index, pngName) {
        cc.log("pngName==========", pngName);
        var zuoNode = cc.find('header_' + index + '/zuo1', this.headerNode.parent);
        if (!zuoNode) return;
        if (pngName == undefined || pngName == '' || pngName == null) {
            zuoNode.active = false;
            return;
        }
        else {
            zuoNode.active = true;
        }
        var texture = cc.textureCache.addImage(cc.url.raw('resources/table/' + pngName + '.png'));
        zuoNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);

        // var tipNode = cc.find('header_' + index + '/tipLabel' ,this.headerNode.parent);
        // tipNode.active = false;
    },

    // showHeaderTip : function(index,content)
    // {
    //    var tipNode = cc.find('header_' + index + '/tipLabel' ,this.headerNode.parent);
    //    tipNode.active = true;
    //    tipNode.getComponent(cc.Label).string = content;

    //    var zuoNode = cc.find('header_' + index + '/zuo1' ,this.headerNode.parent);
    //    zuoNode.active = false;
    // },

    showInfo: function (content) {
        this.infoLabel.string = content;
    },

    selectZ: function (eve, data) {
        cc.log("data= =====", data);
        MjHandler.getInstance().requestZhuang(data, function (res) { });
        //this.layer_zhuang.active = false;
        //if (GameData.player.uid != GameData.game.zhuangUid) this.showWaitText(2);
        this.enableButton(false);
    },

    cancel: function () {
        MjHandler.getInstance().requestZhuang(0, function (res) { });
        //this.layer_zhuang.active = false;
        this.enableButton(false);
    },

    enableButton: function (v) {
        this.button_la.interactable = v;
        this.button_zz.interactable = v;
        this.button_cancel.interactable = v;
        this.button_la_1.interactable = v;
        this.button_la_2.interactable = v;
        this.button_cancel_2.interactable = v;
    },
    showJoinerLost: function (data) {
        //var player = GameData.getPlayerByUid(data.detail.uid);
        cc.log('disconnect uid : ' + data.detail.uid);
        this.showHeaderDisconnect(data.detail.uid, true);
        //var nameStr = GameData.getPlayerByUid(data.detail.uid).name;
        //createMessageBox('玩家[' + nameStr + ']掉线了', function() {});
        //createMoveMessage('玩家[' + nameStr + ']掉线了');        
    },

    showJoinerConnect: function (data) {
        cc.log('connect uid : ' + data.detail.uid);
        this.showHeaderDisconnect(data.detail.uid, false);
    },

    showHeaderDisconnect: function (uid, show) {
        // if(this.headerNode == null)
        // {
        //     cc.log('this.headerNode null');
        //     return;
        // }

        for (var i = 0; i < GameData.joiners.length; i++) {
            var headerNode = GameData.joiners[i];
            var index = i + 1;
            //cc.log(uid + "," + headerNode.getComponent('playerTemplate').uid);
            console.log("headerNode.uid and show", headerNode.uid, show);
            if (headerNode && headerNode.uid == uid) {
                var disNode = cc.find('header_' + index + '/tipLabel', this.headerNode.parent);
                disNode.active = show;
                return;
            }
        }

    },
});
