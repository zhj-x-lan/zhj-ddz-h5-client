cc.Class({
    extends: cc.Component,

    properties: {
        mapLayer: cc.Node,

        play_up_player: cc.Node,
        play_left_player: cc.Node,
        play_right_player: cc.Node,

        up_player: cc.Node,
        left_player: cc.Node,

        distanceLine: cc.Node,
        distanceNode: cc.Node,

        distanceLine1: cc.Node,
        distanceNode1: cc.Node,

        hint: cc.Node,

        playerArray: []
    },

    onLoad: function () {
    },
    showPlayers: function () {
        this.distanceData = {};
        this.playerArray = [];
        if (GameData.joiners.length == 3) {
            this.showLayer(true);
            this.showPlayer('up', this.up_player);
            this.showPlayer('left', this.left_player);
            this.up_player.tag = 0;
            this.left_player.tag = 1;
            this.getLocation();
            this.twoCondition();
        } else if (GameData.joiners.length == 4) {
            this.showLayer(false);
            this.showPlayer('right', this.play_right_player);
            this.showPlayer('up', this.play_up_player);
            this.showPlayer('left', this.play_left_player);
            this.play_right_player.tag = 0;
            this.play_up_player.tag = 1;
            this.play_left_player.tag = 2;
            this.getLocation();
            this.threeCondition();
        }
    },
    showPlayer: function (direction, parent) {
        var player = GameData.getPlayerByPos(direction);
        if (player != null) {
            var playerName = cc.find('name', parent);
            playerName.getComponent(cc.Label).string = 'IP : ' + player.remoteAddr;
            this.setHeadIcon(player.headimgurl, parent);
            this.playerArray.push(player);
        } else {
            parent.active = false;
        }
    },
    setHeadIcon: function (headimgurl, parent) {
        if (headimgurl == undefined || headimgurl == '' || headimgurl.length <= 0) {
            return;
        }
        cc.loader.load({
            url: headimgurl,
            type: 'png'
        }, function (error, texture) {
            if (!error && texture) {
                var headNode = cc.find('headMask/head', parent);
                headNode.getComponent(cc.Sprite).spriteFrame = null;
                headNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },
    getLocation: function () {
        for (var i = 0; i < this.playerArray.length; i++) {
            var uidA = this.playerArray[i].uid;
            var pos = this.playerArray[i].posInfo;
            if (pos.latPos == 0 && pos.longPos == 0) continue;
            if (!this.distanceData[uidA]) {
                this.distanceData[uidA] = {};
                this.distanceData[uidA].playlist = {};
            }
            for (var ii = 0; ii < this.playerArray.length; ii++) {
                var uidB = this.playerArray[ii].uid;
                var posB = this.playerArray[ii].posInfo;
                if (uidB == uidA) continue;
                if (posB.latPos == 0 && posB.longPos == 0) continue;
                if (!this.distanceData[uidA].playlist[uidB]) {
                    this.distanceData[uidA].playlist[uidB] = getDistance(pos.latPos, pos.longPos, posB.latPos, posB.longPos);
                }
            }
        }
    },
    twoCondition: function () {
        WriteLog('距离列表1: this.distanceData = ' + JSON.stringify(this.distanceData));
        for (var i = 0; i < this.playerArray.length; i++) {
            var lineNode = cc.find('Line1', this.distanceLine1);
            var distance = cc.find('distance1', this.distanceNode1);
            var playerInfo = cc.find('two/playerInfo', this.mapLayer);
            var Uid = this.playerArray[i].uid;
            if (!this.distanceData[Uid]) {
                distance.getComponent(cc.Label).string = '距离未确定';
                distance.color = new cc.Color(255, 0, 0);
                lineNode.getChildByName('Line').active = false;
                lineNode.getChildByName('redLine').active = true;
                var childNode = playerInfo.getChildByTag(i);
                var misLocation = cc.find('misLocation', childNode);
                var misLabel = cc.find('misLabel', childNode);
                misLabel.active = true;
                misLocation.active = true;
                this.headImage(childNode, true);
            } else {
                for (var j = 0; j < this.playerArray.length; j++) {
                    var nextUid = this.playerArray[j].uid;
                    if (nextUid == Uid) continue;
                    var playList = this.distanceData[Uid].playlist;
                    if (Object.keys(playList).length > 0) {
                        for (var key in playList) {
                            if (key == nextUid) {
                                WriteLog('..............................typeof(playList[nextUid]) = ' + typeof (playList[nextUid]));
                                if (playList[nextUid] >= 1000) {
                                    var kilometer = playList[nextUid] / 1000;
                                    kilometer = kilometer.toFixed(2);
                                    distance.getComponent(cc.Label).string = kilometer + 'km';
                                } else if (playList[nextUid] <= 50) {
                                    distance.getComponent(cc.Label).string = playList[nextUid] + 'm';
                                    distance.color = new cc.Color(255, 0, 0);
                                    lineNode.getChildByName('Line').active = false;
                                    lineNode.getChildByName('redLine').active = true;
                                    for (var ii = 0; ii < this.playerArray.length; ii++) {
                                        var childNode = playerInfo.getChildByTag(ii);
                                        this.headImage(childNode, true);
                                    }
                                } else {
                                    distance.getComponent(cc.Label).string = playList[nextUid] + 'm';
                                }
                            }
                        }
                    }
                }
            }
        }

        var childNode1, childNode2;
        var ipStr, ipStr1;
        childNode1 = playerInfo.getChildByTag(0);
        var ip = cc.find('name', childNode1);
        ipStr = ip.getComponent('cc.Label').string;
        childNode2 = playerInfo.getChildByTag(1);
        var ip1 = cc.find('name', childNode2);
        ipStr1 = ip1.getComponent('cc.Label').string;
        if (ipStr == ipStr1) {
            for (var i = 0; i < this.playerArray.length; i++) {
                var childNode = playerInfo.getChildByTag(i);
                this.headImage(childNode, true);
                var ipNode = cc.find('name', childNode);
                ipNode.color = new cc.Color(255, 0, 0);
            }
            GameData.danger = true;
            // this.hint.active = true;
        }
    },
    threeCondition: function () {
        WriteLog('距离列表2: this.distanceData = ' + JSON.stringify(this.distanceData));
        for (var i = 0; i < this.playerArray.length; i++) {
            var lineNode = cc.find('Line' + i, this.distanceLine);
            var distance = cc.find('distance' + i, this.distanceNode);
            var playerInfo = cc.find('three/playerInfo', this.mapLayer);
            var Uid = this.playerArray[i].uid;
            if (!this.distanceData[Uid]) {
                distance.getComponent(cc.Label).string = '距离未确定';
                distance.color = new cc.Color(255, 0, 0);
                lineNode.getChildByName('Line').active = false;
                lineNode.getChildByName('redLine').active = true;
                var childNode = playerInfo.getChildByTag(i);
                var misLocation = cc.find('misLocation', childNode);
                var misLabel = cc.find('misLabel', childNode);
                misLabel.active = true;
                misLocation.active = true;
                this.headImage(childNode, true);
                if (i == 0) {
                    var lineNode2 = cc.find('Line2', this.distanceLine);
                    var distance2 = cc.find('distance2', this.distanceNode);
                    distance2.getComponent(cc.Label).string = '距离未确定';
                    distance2.color = new cc.Color(255, 0, 0);
                    lineNode2.getChildByName('Line').active = false;
                    lineNode2.getChildByName('redLine').active = true;
                    // var childNode = playerInfo.getChildByTag(2);
                    // this.headImage(childNode, true);
                    // this.hint.active = true;
                } else {
                    var lineNode2 = cc.find('Line' + (i - 1), this.distanceLine);
                    var distance2 = cc.find('distance' + (i - 1), this.distanceNode);
                    distance2.getComponent(cc.Label).string = '距离未确定';
                    distance2.color = new cc.Color(255, 0, 0);
                    lineNode2.getChildByName('Line').active = false;
                    lineNode2.getChildByName('redLine').active = true;
                    // var childNode = playerInfo.getChildByTag(i-1);
                    // this.headImage(childNode, true);
                    // this.hint.active = true;
                }
            } else {
                for (var j = 0; j < this.playerArray.length; j++) {
                    var nextUid = this.playerArray[j].uid;
                    if (nextUid == Uid) continue;
                    var playList = this.distanceData[Uid].playlist;
                    console.log('playList = ' + JSON.stringify(playList));
                    var lineNode2 = undefined;
                    var distance2 = undefined;
                    if (Object.keys(playList).length > 0) {
                        for (var key in playList) {
                            if (key == nextUid) {
                                if (i == 2) {
                                    if (j == 0) {
                                        if (playList[nextUid] >= 1000) {
                                            var kilometer = playList[nextUid] / 1000;
                                            kilometer = kilometer.toFixed(2);
                                            distance.getComponent(cc.Label).string = kilometer + 'km';
                                        } else if (playList[nextUid] <= 50) {
                                            distance.color = new cc.Color(255, 0, 0);
                                            lineNode.getChildByName('Line').active = false;
                                            lineNode.getChildByName('redLine').active = true;
                                            distance.getComponent(cc.Label).string = playList[nextUid] + 'm';
                                        } else {
                                            distance.getComponent(cc.Label).string = playList[nextUid] + 'm';
                                        }
                                    } else {
                                        lineNode2 = cc.find('Line1', this.distanceLine);
                                        distance2 = cc.find('distance1', this.distanceNode);
                                        if (playList[nextUid] >= 1000) {
                                            var kilometer = playList[nextUid] / 1000;
                                            kilometer = kilometer.toFixed(2);
                                            distance2.getComponent(cc.Label).string = kilometer + 'km';
                                        } else if (playList[nextUid] <= 50) {
                                            distance2.color = new cc.Color(255, 0, 0);
                                            lineNode2.getChildByName('Line').active = false;
                                            lineNode2.getChildByName('redLine').active = true;
                                            distance2.getComponent(cc.Label).string = playList[nextUid] + 'm';
                                        } else {
                                            distance2.getComponent(cc.Label).string = playList[nextUid] + 'm';
                                        }
                                    }
                                } else {
                                    if (j == i + 1) {
                                        if (playList[nextUid] >= 1000) {
                                            var kilometer = playList[nextUid] / 1000;
                                            kilometer = kilometer.toFixed(2);
                                            distance.getComponent(cc.Label).string = kilometer + 'km';
                                        } else if (playList[nextUid] <= 50) {
                                            distance.color = new cc.Color(255, 0, 0);
                                            lineNode.getChildByName('Line').active = false;
                                            lineNode.getChildByName('redLine').active = true;
                                            distance.getComponent(cc.Label).string = playList[nextUid] + 'm';
                                        } else {
                                            distance.getComponent(cc.Label).string = playList[nextUid] + 'm';
                                        }
                                    } else {
                                        lineNode2 = cc.find('Line' + j, this.distanceLine);
                                        distance2 = cc.find('distance' + j, this.distanceNode);
                                        if (playList[nextUid] >= 1000) {
                                            var kilometer = playList[nextUid] / 1000;
                                            kilometer = kilometer.toFixed(2);
                                            distance2.getComponent(cc.Label).string = kilometer + 'km';
                                        } else if (playList[nextUid] <= 50) {
                                            distance2.color = new cc.Color(255, 0, 0);
                                            lineNode2.getChildByName('Line').active = false;
                                            lineNode2.getChildByName('redLine').active = true;
                                            distance2.getComponent(cc.Label).string = playList[nextUid] + 'm';
                                        } else {
                                            distance2.getComponent(cc.Label).string = playList[nextUid] + 'm';
                                        }
                                    }
                                }
                                if (playList[nextUid] <= 50) {
                                    var headInfo = playerInfo.getChildByTag(i);
                                    var headInfo2 = playerInfo.getChildByTag(j);
                                    this.headImage(headInfo, true);
                                    this.headImage(headInfo2, true);
                                }
                            }
                        }
                    }
                }
            }

            var childNode1, childNode2;
            var ipStr, ipStr1;
            var ips, ips1;
            if (i == 2) {
                childNode1 = playerInfo.getChildByTag(i);
                ips = cc.find('name', childNode1);
                ipStr = ips.getComponent('cc.Label').string;
                childNode2 = playerInfo.getChildByTag(0);
                ips1 = cc.find('name', childNode2);
                ipStr1 = ips1.getComponent('cc.Label').string;
            } else {
                childNode1 = playerInfo.getChildByTag(i);
                ips = cc.find('name', childNode1);
                ipStr = ips.getComponent('cc.Label').string;
                childNode2 = playerInfo.getChildByTag(i + 1);
                ips1 = cc.find('name', childNode2);
                ipStr1 = ips1.getComponent('cc.Label').string;
            }
            var equIp1, equIp2;
            if (ipStr == ipStr1) {
                this.headImage(childNode1, true);
                this.headImage(childNode2, true);
                equIp1 = cc.find('name', childNode1);
                equIp2 = cc.find('name', childNode2);
                equIp1.color = new cc.Color(255, 0, 0);
                equIp2.color = new cc.Color(255, 0, 0);
                // this.hint.active = true;
                GameData.danger = true;
            }
        }
    },
    showLayer: function (index) {
        var twoNode = cc.find('two', this.mapLayer);
        var threeNode = cc.find('three', this.mapLayer);
        twoNode.active = index;
        threeNode.active = !index;
    },
    headImage: function (parent, act) {
        var headImg1 = cc.find('headBg', parent);
        var headImg2 = cc.find('headBg1', parent);
        headImg1.active = act;
        headImg2.active = !act;
    },
    closeClick: function (eve) {
        this.mapLayer.active = false;
    }
});