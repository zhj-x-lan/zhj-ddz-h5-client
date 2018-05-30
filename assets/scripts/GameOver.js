cc.Class({
    extends: cc.Component,

    properties: {
        _gameover: null,
        _gameresult: null,
        _seats: [],
        _isGameEnd: false,
        _pingju: null,
        _win: null,
        _lose: null,

    },

    onLoad: function () {
        this._gameover = this.node.getChildByName("game_over");
        this._gameover.active = false;

        this._pingju = this._gameover.getChildByName("pingju");
        this._win = this._gameover.getChildByName("win");
        this._lose = this._gameover.getChildByName("lose");

        this._gameresult = this.node.getChildByName("game_result");

        var wanfa = this._gameover.getChildByName("wanfa").getComponent(cc.Label);
        //wanfa.string = '扣点 底分1 ';
        wanfa.string = cc.vv.gameMgr.wanfa;

        var btnOk = this._gameover.getChildByName('btnOk');
        cc.vv.utils.addClickEvent(btnOk, this.node, 'GameOver', 'onBtnOkClicked');

        var listRoot = this._gameover.getChildByName("result_list");
        var len = cc.vv.gameMgr.playerNum;
        for (var i = 1; i <= 4; ++i) {
            var s = "s" + i;
            var sn = listRoot.getChildByName(s);

            if (i > len) {
                sn.active = false;
                continue;
            }

            var viewdata = {};
            viewdata.username = sn.getChildByName('username').getComponent(cc.Label);
            viewdata.reason = sn.getChildByName('reason').getComponent(cc.Label);

            var f = sn.getChildByName('fan');
            if (f != null) {
                viewdata.fan = f.getComponent(cc.Label);
            }

            viewdata.score = sn.getChildByName('score').getComponent(cc.Label);
            viewdata.hu = sn.getChildByName('hu');
            viewdata.mahjongs = sn.getChildByName('pai');
            viewdata.zhuang = sn.getChildByName('zhuang');
            viewdata.hupai = sn.getChildByName('hupai');
            viewdata._pengandgang = [];
            this._seats.push(viewdata);
        }

        //初始化网络事件监听器
        var self = this;
        this.node.on('game_over', function (data) {
            //console.warn('跟踪game_over');
            self.onGameOver(data.detail);
        });

        this.node.on('game_end', function (data) { self._isGameEnd = true; });
    },

    onGameOver(data) {
        console.log('显示结算页面, data info: =====');
        console.log(data);
        console.log(cc.vv.gameMgr.userMap);

        this._gameover.active = true;

        this._pingju.active = false;
        this._win.active = false;
        this._lose.active = false;

        var myscore = data.kScore[cc.vv.gameMgr.seatIndex];

        if (myscore > 0) {
            this._win.active = true;
        }
        else if (myscore < 0) {
            this._lose.active = true;
        }
        else {
            this._pingju.active = true;
        }


        var len = cc.vv.gameMgr.playerNum;
        
        //获得每个玩家的holds牌信息
        var holds = [];
        for (let i = 0; i < len; i++) {
            var key = 'kArray' + i;
            holds[i] = cc.vv.mahjongmgr.converArr2Ids(data[key]);
        }

        //显示玩家信息
        for (var i = 0; i < len; ++i) {
            var seatView = this._seats[i];
            //每个玩家数据
            var userData = cc.vv.gameMgr.userMap[i];
            
            console.warn('当前玩家信息为: ===> ');
            console.warn(userData);

            var numOfGangs = userData.angangs.length + userData.wangangs.length + userData.diangangs.length;
            
            for (var o = 0; o < 3; ++o) {
                seatView.hu.children[o].active = false;
            }

            console.warn(userData.kNike);
            if (userData.kNike) {
                seatView.username.string = userData.kNike;
            } else {
                seatView.username.string = cc.vv.userMgr.kNike;
            }

            //seatView.zhuang.active = cc.vv.gameMgr.button == i;

            //胡牌的玩家才有番
            var fan = 0;

            seatView.reason.string = '杠分: ' + data.kGangScore[i]; //杠分
            seatView.fan.string = '胡分: ' + data.kHuScore[i];      //胡分


            seatView.score.string = data.kScore[i];

            //初始化每个玩家的hold牌信息:
            userData.holds = holds[i];
            //console.warn('当前玩家holds信息: ===> 系统已经大小排序过...');
            //console.warn(userData.holds);

            //隐藏所有牌以及其耗子标记
            for (var k = 0; k < seatView.mahjongs.childrenCount; k++) {
                console.warn('】】】】: =============== k: ' + k);
                var n = seatView.mahjongs.children[k];
                if (!n) {
                    console.warn('pai节点n不存在');
                    console.warn(n);
                }
                n.active = false;
                var haozi = n.getChildByName('haozi');
                if (!haozi) {
                    console.warn('haozi不存在...');
                    console.warn(haozi);
                    console.warn('耗子标记不存在...');
                } else {
                    haozi.active = false;
                }
            }

            var lackingNum = (userData.pengs.length + numOfGangs) * 3;

            var haoziCards = [];
            var arrHaoziPos = [];
            if (cc.vv.gameMgr.haoziCards) {
                haoziCards = cc.vv.gameMgr.haoziCards;
                userData.holds = cc.vv.utils.sortHzCards(userData.holds, haoziCards);
                arrHaoziPos = cc.vv.utils.getHaoziPos(userData.holds, haoziCards);
            }

            //判断是否胡牌 必须在耗子牌排序后再放入
            var key = 'kHucards' + (i + 1);
            var item = data[key];
            if (item.length > 0) {
                //存在胡牌
                var hp = cc.vv.mahjongmgr.converDesc2Id(item[0][0], item[0][1]);
                console.warn('玩家' + i + '胡牌hp为： ' + hp);
                userData.holds.push(hp);
            }

            //显示相关的牌
            for (var k = 0; k < userData.holds.length; ++k) {
                var pai = userData.holds[k];
                var n = seatView.mahjongs.children[k + lackingNum];
                n.active = true;
                var sprite = n.getComponent(cc.Sprite);
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_", pai);

                //增加耗子牌显示功能
                var hzNum = arrHaoziPos.length;    //耗子牌的牌数量

                /** 显示耗子标签 */
                if (k < hzNum) {
                    var pos = arrHaoziPos[k];   //耗子牌在holds中的位置
                    var id = holds[pos];
                    var sp = seatView.mahjongs.children[pos + lackingNum];
                    var haozi = sprite.node.getChildByName('haozi');
                    haozi.active = true;
                }
            }

            for (var k = 0; k < seatView._pengandgang.length; ++k) {
                seatView._pengandgang[k].active = false;
            }

            //初始化杠牌
            var index = 0;
            var agangs = userData.angangs;
            for (var k = 0; k < agangs.length; ++k) {
                var mjid = agangs[k];
                this.initPengAndGangs(seatView, index, mjid, "angang");
                index++;
            }

            var dgangs = userData.diangangs;
            for (var k = 0; k < dgangs.length; ++k) {
                var mjid = dgangs[k];
                this.initPengAndGangs(seatView, index, mjid, "diangang");
                index++;
            }

            var wgangs = userData.wangangs;
            for (var k = 0; k < wgangs.length; ++k) {
                var mjid = wgangs[k];
                this.initPengAndGangs(seatView, index, mjid, "wangang");
                index++;
            }

            //初始化碰牌
            var pengs = userData.pengs
            if (pengs) {
                for (var k = 0; k < pengs.length; ++k) {
                    var mjid = pengs[k];
                    this.initPengAndGangs(seatView, index, mjid, "peng");
                    index++;
                }
            }
        }
    },

    initPengAndGangs: function (seatView, index, mjid, flag) {
        var pgroot = null;
        if (seatView._pengandgang.length <= index) {
            pgroot = cc.instantiate(cc.vv.mahjongmgr.pengPrefabSelf);
            seatView._pengandgang.push(pgroot);
            seatView.mahjongs.addChild(pgroot);
        }
        else {
            pgroot = seatView._pengandgang[index];
            pgroot.active = true;
        }

        var sprites = pgroot.getComponentsInChildren(cc.Sprite);
        for (var s = 0; s < sprites.length; ++s) {
            var sprite = sprites[s];
            if (sprite.node.name == "gang") {
                var isGang = flag != "peng";
                sprite.node.active = isGang;
                sprite.node.scaleX = 1.0;
                sprite.node.scaleY = 1.0;
                if (flag == "angang") {
                    sprite.spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame("myself");
                    sprite.node.scaleX = 1.4;
                    sprite.node.scaleY = 1.4;
                }
                else {
                    sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("B_", mjid);
                }
            }
            else {
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("B_", mjid);
            }
        }
        pgroot.x = index * 55 * 3 + index * 10;
    },

    /* onBtnReadyClicked: function () {
        console.log("onBtnReadyClicked");
        if (this._isGameEnd) {
            this._gameresult.active = true;
        }
        else {
            var data = {
                'kMId': 61028,
                'kPos': cc.vv.gameMgr.seatIndex
            };
            cc.vv.gameMgr.ready_push(data);
            cc.vv.dispatcher.fire('game_reset_result');
        }
        this._gameover.active = false;
    }, */

    onBtnOkClicked: function () {
        if (cc.vv.gameMgr.gameEndData) {
            console.warn(cc.vv.gameMgr.gameEndData);
            console.log('gameEndData存在');
            this._gameresult.active = true;
            cc.vv.gameMgr.dispatchEvent('game_end', cc.vv.gameMgr.gameEndData);
        } else {
            var data = {
                'kMId': 61028,
                'kPos': cc.vv.gameMgr.seatIndex
            };
            cc.vv.gameMgr.ready_push(data);
            
            //bug: 如果单局结算时,玩家没点下局准备.直接刷新
            cc.vv.dispatcher.fire('game_reset_result');
        }
        this._gameover.active = false;
    },
});
