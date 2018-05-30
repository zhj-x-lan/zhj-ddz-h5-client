/**
 * Created by user on 2017/10/24.
 */
cc.Class({
    extends: cc.Component,

    properties: {

        layer_up: cc.Node,
        layer_down: cc.Node,
        layer_left: cc.Node,
        layer_right: cc.Node,

        ok_btn: cc.Button,
        no_btn: cc.Button,
        all_btn: cc.Button,

        headNodes: {
            default: [],
            type: cc.Node
        },

        //是否做过飘动作，false：没做；true：已做
        action_up: false,
        action_down: false,
        action_left: false,
        action_right: false
    },

    // use this for initialization
    onLoad: function () {

        registEvent('onStarPiao',this,this.UIControl);
        registEvent('onMahjongRunEnd',this,this.ShowUI);

        if (Object.keys(profileHuaDian.PiaoInfo).length>0 && profileHuaDian.PiaoInfo.runState == HuaDian.RunStateEmnum.PIAO) {
            this.showPiaoState();
        }

        var self = this;
        this.ok_btn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            console.log('TOUCH_END');
            self.sendPiaoMes(1);
            self.ok_btn.node.active = false;
            self.no_btn.node.active = false;
            self.all_btn.node.active = false;
        });
        this.no_btn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            console.log('TOUCH_END');
            self.sendPiaoMes(0);
            self.ok_btn.node.active = false;
            self.no_btn.node.active = false;
            self.all_btn.node.active = false;
        });
        this.all_btn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            console.log('TOUCH_END');
            self.sendPiaoMes(2);
            self.ok_btn.node.active = false;
            self.no_btn.node.active = false;
            self.all_btn.node.active = false;
        });
    },

    onDestroy: function () {
        unregistEvent('onStarPiao', this, this.UIControl);
    },

    sendPiaoMes: function (waterNum) {
        MjHandler.getInstance().requestPiao(waterNum, function (res) { });
    },

    ShowUI: function () {
        this.setUI(true);

        this.action_up = false;
        this.action_down = false;
        this.action_left = false;
        this.action_right = false;

        //初始化玩家头像上的飘标志
        this.setPiaoFlag(this.headNodes[0], "down");
        this.setPiaoFlag(this.headNodes[1], "right");
        this.setPiaoFlag(this.headNodes[2], "up");
        this.setPiaoFlag(this.headNodes[3], "left");
    },

    CloseUI: function () {
        //如果已经全部选择，关闭界面
        if (this.action_up == true
            && this.action_down == true
            && this.action_left == true
            && this.action_right == true) {
            this.setUI(false);
        }
    },

    setUI: function (show) {
        this.node.active = show;
    },

    UIControl: function () {
        //if( this.node.active == false ) {
        //    this.ShowUI();
        //}
        this.showPiaoState();
    },

    showPiaoState: function () {
        cc.log("...data...:" + JSON.stringify(profileHuaDian.PiaoInfo));

        var data = profileHuaDian.PiaoInfo;

        this.ok_btn.node.active = false;
        this.no_btn.node.active = false;
        this.all_btn.node.active = false;
        if (profileHuaDian.PiaoInfo == undefined) {
            return;
        }

        var player = GameData.getPlayerByPos('down');
        var piaoState = profileHuaDian.getPiaoStateByUid(player.uid);
        if (player && piaoState == -1) {
            this.ok_btn.node.active = true;
            this.no_btn.node.active = true;
            this.all_btn.node.active = true;
        }

        if (player) {
            this.layer_down.active = true;
            cc.find("down/choice", this.node).active = false;
            cc.find("down/no", this.node).active = false;
            cc.find("down/yes", this.node).active = false;

            if (piaoState >= 0) {
                if (this.action_down == false) {
                    this.runMoveActionFlag('down', piaoState);
                }
                else {
                    this.layer_down.active = false;
                }
            }
        }
        else {
            this.layer_down.active = false;
            this.action_down = true;
        }

        player = GameData.getPlayerByPos('right');
        if (player) {
            piaoState = profileHuaDian.getPiaoStateByUid(player.uid);
            this.layer_right.active = true;
            cc.find("right/choice", this.node).active = true;
            cc.find("right/no", this.node).active = false;
            cc.find("right/yes", this.node).active = false;

            if (piaoState >= 0) {
                if (this.action_right == false) {
                    this.runMoveActionFlag('right', piaoState);
                }
                else {
                    this.layer_right.active = false;
                }
            }
        }
        else {
            this.layer_right.active = false;
            this.action_right = true;
        }

        player = GameData.getPlayerByPos('up');
        if (player) {
            piaoState = profileHuaDian.getPiaoStateByUid(player.uid);
            this.layer_up.active = true;
            cc.find("up/choice", this.node).active = true;
            cc.find("up/no", this.node).active = false;
            cc.find("up/yes", this.node).active = false;

            if (piaoState >= 0) {
                if (this.action_up == false) {
                    this.runMoveActionFlag('up', piaoState);
                }
                else {
                    this.layer_up.active = false;
                }
            }
        }
        else {
            this.layer_up.active = false;
            this.action_up = true;
        }

        player = GameData.getPlayerByPos('left');
        if (player) {
            piaoState = profileHuaDian.getPiaoStateByUid(player.uid);
            this.layer_left.active = true;
            cc.find("left/choice", this.node).active = true;
            cc.find("left/no", this.node).active = false;
            cc.find("left/yes", this.node).active = false;

            if (piaoState >= 0) {
                if (this.action_left == false) {
                    this.runMoveActionFlag('left', piaoState);
                }
                else {
                    this.layer_left.active = false;
                }
            }
        }
        else {
            this.layer_left.active = false;
            this.action_left = true;
        }
    },

    runMoveActionFlag: function (direction, piaoNum) {
        if (piaoNum == undefined) {
            return;
        }

        var flag, parent;
        switch (direction) {
            case 'down': {

                cc.find(direction + "/choice", this.node).active = false;
                cc.find(direction + "/no", this.node).active = false;
                cc.find(direction + "/yes", this.node).active = false;

                if (piaoNum > 0) {
                    flag = cc.find(direction + "/yes", this.node);
                } else {
                    flag = cc.find(direction + "/no", this.node);
                }
                flag.active = true;
                flag.scale = 1;
                flag.opacity = 255;

                parent = this.headNodes[0];

                this.action_down = true;
            } break;
            case 'right': {
                cc.find(direction + "/choice", this.node).active = false;
                cc.find(direction + "/no", this.node).active = false;
                cc.find(direction + "/yes", this.node).active = false;

                if (piaoNum > 0) {
                    flag = cc.find(direction + "/yes", this.node);
                } else {
                    flag = cc.find(direction + "/no", this.node);
                }
                flag.active = true;
                flag.scale = 1;
                flag.opacity = 255;

                parent = this.headNodes[1];

                this.action_right = true;
            } break;
            case 'up': {
                cc.find(direction + "/choice", this.node).active = false;
                cc.find(direction + "/no", this.node).active = false;
                cc.find(direction + "/yes", this.node).active = false;

                if (piaoNum > 0) {
                    flag = cc.find(direction + "/yes", this.node);
                } else {
                    flag = cc.find(direction + "/no", this.node);
                }
                flag.active = true;
                flag.scale = 1;
                flag.opacity = 255;

                parent = this.headNodes[2];

                this.action_up = true;
            } break;
            case 'left': {
                cc.find(direction + "/choice", this.node).active = false;
                cc.find(direction + "/no", this.node).active = false;
                cc.find(direction + "/yes", this.node).active = false;

                if (piaoNum > 0) {
                    flag = cc.find(direction + "/yes", this.node);
                } else {
                    flag = cc.find(direction + "/no", this.node);
                }
                flag.active = true;
                flag.scale = 1;
                flag.opacity = 255;

                parent = this.headNodes[3];

                this.action_left = true;
            } break;
        }

        //玩家头像上显示飘标志
        this.setPiaoFlag(parent, direction);

        //飘动作
        var time = 1;
        var scaleBig = cc.scaleTo(time / 4, 1.4);
        var delay = cc.delayTime(time / 2);
        var scaleSmall = cc.scaleTo(time, 0.6);
        var fadeout = cc.fadeOut(time);

        var self = this;
        flag.stopAllActions();
        flag.runAction(cc.sequence(scaleBig, delay, cc.spawn(scaleSmall, fadeout), cc.callFunc(function () {
            //将节点属性复原
            flag.active = false;
            flag.scale = 1;
            flag.opacity = 255;

            //判断是否关闭界面
            self.CloseUI();
        }, this)));
    },

    setPiaoFlag: function (parent, direction) {
        var player = GameData.getPlayerByPos(direction);
        if (player) {
            var headNode = parent.getChildByTag(player.uid);
            if (headNode) {
                headNode.getComponent('playerTemplate').setPiaoIconShow(direction);
            }
        }
    }

});