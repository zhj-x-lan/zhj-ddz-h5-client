var gt = require('MessageInit');

cc.Class({
    extends: cc.Component,

    properties: {
        gameRoot: cc.Node,

        prepareRoot: cc.Node,

        dissolvePrefab: cc.Prefab,

        _myMJArr: [],
        _options: null,
        _selectedMJ: null,
        _chupaiSprite: [],
        _mjcount: null,
        _gamecount: null,
        _hupaiTips: [],
        _sprHaoziBoard: null,   //耗子牌提示
        _playEfxs: [],
        _opts: [],
        _tingLayout: null,
        _haoziTags: [],     //耗子标签
        haoziLists: [],     //保存耗子sprite
        //_tingItems: [],
        dataEventHandler: null, //设置为当前节点
        //新增：//解散窗口是否显示
        disShowed: false,
        
        eventMap: null,   //注册的事件
        /**
         * 可能动态添加的属性:
         * seatIndex: 当前玩家位置
         * turnSeatIndex: 当前出牌玩家的位置
         * preSeatIndex: 上一个出牌玩家的位置
         * seats: 游戏场景中的所有用户位置信息
         */
    },

    onLoad: function () {
        console.error('================== 加载【MJGame.js】 ***************************************');
        //提前注册...

        //cc.vv.utils.screenAdapter();

        cc.vv.roomMgr.dataEventHandler = this.node;
        cc.vv.gameMgr.dataEventHandler = this.node;

        console.error('避免循环引用...');
        
        //this.addComponent("NoticeTip");
        this.addComponent("PengGangs");
        this.addComponent("MJRoom");
        this.addComponent("TimePointer");
        //this.addComponent("GameResult");
        //this.addComponent("Chat");
        this.addComponent("Folds");
        this.addComponent("GameOver");
        this.addComponent("GameResult");
        //this.addComponent("ReplayCtrl");
        //this.addComponent("PopupMgr");
        //this.addComponent("ReConnect");
        //this.addComponent("UserInfoShow");
        //this.addComponent("Status");

        this.initView();
        this.initEventHandlers();

        this.prepareRoot.active = true;
        this.gameRoot.active = false;

        this.initWanfaLabel();
        this.game_init();

        cc.vv.audioMgr.playBGM("bgFight.mp3");
        cc.vv.utils.addEscEvent(this.node);

        this.dataEventHandler = this.node;

        console.error('【*---==================加载【MJGame.js】---完成!!!');
        cc.vv.gameMgr.gameLoaded = true;
        if (cc.vv.gameMgr.gameRecData) {
            //替换cc.vv.gameMgr.dispatchEvent('game_recovery_info', cc.vv.gameMgr.gameRecData);
            console.error('gameRecData存在,恢复桌面信息...');
            this.onRcvSyncRoomState(cc.vv.gameMgr.gameRecData);
            cc.vv.gameMgr.gameRecData = null;
        }
        /**
         * 1.自己只收到61034,          不管之前有无其他玩家出过牌.自己选项显示不受影响 (暗杠、补杠正确)
         * 2.自己依次收到61037和61036, 此时，其他玩家打出了自己能碰杠的牌,分析自己选项显示:
         * 
         */
        /**处理断线重连时有操作情况: */
        /**
         * 1.自己轮,自己无杠听等,其他玩家无操作.只接收61034.无特殊操作
         */
        if (cc.vv.gameMgr.delayId19) {
            console.log('===== 缓存消息数据 game_dispress_result =====');
            cc.vv.dispatcher.fire('game_dispress_result', cc.vv.gameMgr.delayData19);
            cc.vv.gameMgr.delayId19 = null;
            cc.vv.gameMgr.delayData19 = null;
        }
        if (cc.vv.gameMgr.reconnFlag) {
            console.warn('【MJGame.js】--> 进入reconnFlag 块');
            
            /** 36,37一组: 其他玩家出的牌, 自己有思考操作 */
            var data36 = cc.vv.gameMgr.data36;   //其他玩家出牌信息
            var data37 = cc.vv.gameMgr.data37;   //可能的选项信息
            /** 34一组: 自己摸牌有思考操作 */
            var data34 = cc.vv.gameMgr.data34;
            var data = {
                data36: data36,
                data37: data37,
                data34: data34
            };
            cc.vv.gameMgr.data36 = null;
            cc.vv.gameMgr.data37 = null;
            cc.vv.gameMgr.data34 = null;
            cc.vv.gameMgr.reconnFlag = null;
            
            console.warn(data34);
            console.warn(data36);
            console.warn(data37);
           
            if (data36 || data37 || data34) {
                console.log('***************---5');
                cc.vv.dispatcher.fire('game_reconn_result', data);
            }
            data = null;
        }

       
        this.parseRefreshData();

        this.eventMap = {};
        this.registerGameListeners();

        cc.loader.loadResDir("end", cc.loader.onProgress, function (err, assets) {
            console.warn('结算面板加载完成...');
        });

    },

    start: function () {
        console.error('执行start方法...');
    },

    dispatchEvent(event, data) {
        if (this.dataEventHandler) {
            this.dataEventHandler.emit(event, data);
        }
    },


    registerGameListeners: function () {
        console.error('【MJGame.js】---> registerGameListeners()... 注册游戏事件监听器');
        
        var self = this;
        var registerMsgListener = (msgId, msgHandler, target) => {
            let eventName = msgId.toString();
            if (!self.eventMap[eventName]) {
                cc.vv.dispatcher.on(eventName, msgHandler.bind(target));      //将msgHandler回调函数绑定到target上下文
                self.eventMap[eventName] = true;
            } else {
                console.error('事件: ' + msgId + '已经注册过 ================= ');
            }
        };

        //-------------------------------------------------------------------------
        /**
         * 游戏场景中断网恢复场景也会在这里收到登陆3消息.
         */
        //gt.GC_LOGIN					= 61002  onRcvLogin
        registerMsgListener(gt.GC_LOGIN, cc.vv.userMgr.onRcvLogin, cc.vv.userMgr);
        //gt.GC_LOGIN_GATE			= 61115 //Gate回客户端登录消息 onRcvLoginGate
        registerMsgListener(gt.GC_LOGIN_GATE, cc.vv.userMgr.onRcvLoginGate, cc.vv.userMgr);
        //gt.GC_LOGIN_SERVER			= 61005 onRcvLoginServer
        registerMsgListener(gt.GC_LOGIN_SERVER, cc.vv.userMgr.onRcvLoginServer, cc.vv.userMgr);
        //-------------------------------------------------------------------------

        //gt.GC_DISMISS_ROOM			= 61019
        registerMsgListener(gt.GC_DISMISS_ROOM, this.onRcvDismissRoom, this);
        //-------------------------------------------------------------------------
        //gt.GC_ENTER_ROOM			= 61022 onRcvEnterRoom
        registerMsgListener(gt.GC_ENTER_ROOM, cc.vv.roomMgr.onRcvEnterRoom, cc.vv.roomMgr);
        //gt.GC_ADD_PLAYER			= 61023  onRcvAddPlayer
        registerMsgListener(gt.GC_ADD_PLAYER, cc.vv.roomMgr.onRcvAddPlayer, cc.vv.roomMgr);
        //gt.GC_SELECT_SEAT			= 61026 onRcvSelectSeat
        registerMsgListener(gt.GC_SELECT_SEAT, cc.vv.roomMgr.onRcvSelectSeat, cc.vv.roomMgr);
        //-------------------------------------------------------------------------

        //gt.GC_READY				= 61029 onRcvReady
        registerMsgListener(gt.GC_READY, this.onRcvReady, this);

        //gt.GC_ROUND_STATE			= 61032  onRcvRoundState
        registerMsgListener(gt.GC_ROUND_STATE, this.onRcvRoundState, this);
        //gt.GC_START_GAME			= 61033  onRcvStartGame
        registerMsgListener(gt.GC_START_GAME, this.onRcvStartGame, this);
        //gt.GC_TURN_SHOW_MJTILE		= 61034 
        registerMsgListener(gt.GC_TURN_SHOW_MJTILE, this.onRcvTurnShowMjTile, this);
        //gt.GC_SYNC_SHOW_MJTILE		= 61036 
        registerMsgListener(gt.GC_SYNC_SHOW_MJTILE, this.onRcvSyncShowMjTile, this);
        //gt.GC_MAKE_DECISION			= 61037 
        registerMsgListener(gt.GC_MAKE_DECISION, this.onRcvMakeDecision, this);

        //GC_SYNC_MAKE_DECISION         = 61039
        registerMsgListener(gt.GC_SYNC_MAKE_DECISION, this.onRcvSyncMakeDecision, this);

        //gt.GC_START_DECISION         = 61043      onRcvStartDecision
        registerMsgListener(gt.GC_START_DECISION, this.onRcvStartDecision, this);

        //gt.GC_ROUND_REPORT         = 61042      onRcvRoundReport
        registerMsgListener(gt.GC_ROUND_REPORT, this.onRcvRoundReport, this);

        //gt.GC_FINAL_REPORT         = 61050      onRcvFinalReport
        registerMsgListener(gt.GC_FINAL_REPORT, this.onRcvFinalReport, this);

        //gt.GC_SYNC_ROOM_STATE		= 61027
        registerMsgListener(gt.GC_SYNC_ROOM_STATE, this.onRcvSyncRoomState, this);

    },

    createUserData: function (data) {
        var userData = {
            //kId, kDestId, kPos, kReady, kScore 
        };
        if (!data.kUserId) {    //61022
            userData['kId'] = cc.vv.userMgr.kId;
            userData['kNike'] = cc.vv.userMgr.kNike;
        } else {
            userData['kId'] = data.kUserId;
            userData['kNike'] = data.kNike;
        }
        userData['kPos'] = 4;   //初始化为4

        userData['kDeskId'] = data.kDeskId;
        userData['holds'] = [];
        userData['folds'] = [];
        userData['pengs'] = [];
        userData['angangs'] = [];
        userData['diangangs'] = [];
        userData['wangangs'] = [];

        return userData;
    },

    //#61029 收到用户准备信息
    onRcvReady: function (msgTbl) {
        console.warn('【MJGame.js】--> #61029 onRcReady()... 收到用户准备信息');
        console.warn(msgTbl);
        //var seatData = cc.vv.gameMgr.userMap[msgTbl.kPos];
        //seatData.kReady = 1;
        //self.node.getComponent('MJRoom').initSingleSeat(seatData);
        this.node.getComponent('MJRoom').setReady(msgTbl.kPos);
    },

    //#61032 当局状态
    onRcvRoundState: function (msgTbl) {
        console.error('【MJGame.js】--> #61032 onRcvRoundState()... 当局状态');
        console.error(msgTbl);
        //var self = this;
        if (cc.vv.userMgr.needReconn) {
            console.error('通过onShow()...重连过...');
        }
        
        //替换self.dispatchEvent('game_sync_info', data);
        this._mj = msgTbl.kCurCircle;

        cc.vv.gameMgr.numOfGames = msgTbl.kCurCircle + 1;
        cc.vv.gameMgr.maxNumOfGames = msgTbl.kCurMaxCircle;

        //收到此消息后,表示游戏已经开始.
        cc.vv.gameMgr.gameState = 'started';

        /**暂时此时通知游戏开始 */
        //替换self.dispatchEvent('game_num');
        this.node.getComponent('MJRoom').refreshBtns();
        this.node.getComponent('MJRoom').initSeats();
        //追加隐藏准备
        this.node.getComponent('MJRoom').resetAllReady();

        this._gamecount.string = "" + cc.vv.gameMgr.numOfGames + "/" + cc.vv.gameMgr.maxNumOfGames + "局";
        //替换self.dispatchEvent('game_begin');
        this.node.getComponent('TimePointer').initPointer();
    },

    //#61033 发牌信息
    onRcvStartGame: function (msgTbl) {
        var self = this;
        console.warn('【MJGame.js】--> #61033 【onRcvStartGame()... 开始发牌');
        console.warn(msgTbl);

        //将庄家位置保存为初始的turn
        //cc.vv.gameMgr.turn = msgTbl.kZhuang;
        //初始化定时器指向

        var localIndex = cc.vv.gameMgr.getLocalIndex(msgTbl.kZhuang);
        var zside = cc.vv.mahjongmgr.getSide(localIndex);
        console.warn('庄家位置: ' + msgTbl.kZhuang + ', 本地位置: ' + zside);

        //self.node.getComponent('TimePointer').updatePointer();

        var preSides = ["right", "up", "left"];
        /** 计算另外一个玩家的位置 */
        var userMap = cc.vv.gameMgr.userMap;
        var sides = [];
        for (let index in userMap) {
            if (index < 4 && index != cc.vv.gameMgr.seatIndex) {
                console.warn('另外玩家的逻辑位置: ===> ' + index);
                var pIndex = cc.vv.gameMgr.getLocalIndex(index);
                var pSide = cc.vv.mahjongmgr.getSide(pIndex);
                sides.push(pSide);
            }
        }

        var gameChild = self.node.getChildByName("game");

        //初始化其他玩家手牌, 首先全部14张隐藏
        for (var i = 0; i < sides.length; ++i) {
            var sideChild = gameChild.getChildByName(sides[i]);
            console.warn('sides[' + i + ']' + '为: ' + sides[i]);

            var holds = sideChild.getChildByName("holds");

            for (var j = 0; j < holds.childrenCount; ++j) {
                var nc = holds.children[j];
                nc.active = true;
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
                var sprite = nc.getComponent(cc.Sprite);
                if (cc.vv.gameMgr.seatIndex == 1) {
                    sprite.spriteFrame = cc.vv.mahjongmgr.holdsEmpty[i + 3];
                } else {
                    sprite.spriteFrame = cc.vv.mahjongmgr.holdsEmpty[i + 1];
                }
            }

            if (sides[i] != zside) {    //不是庄家,隐藏最后一张摸牌
                //如果另外3边的玩家有一个是庄家,则显示第14张牌
                var index = self.getMJIndex(sides[i], 13);  //取得最后一张牌的位置
                var n = holds.children[index];
                n.active = false;
            }
        }
        for (let i = 0; i < preSides.length; i++) {
            if (sides.indexOf(preSides[i]) == -1) {
                gameChild.getChildByName(preSides[i]).active = false;
            }
        }


        self.prepareRoot.active = false;
        self.gameRoot.active = true;

        var myCards = msgTbl.kMyCard; //自己牌：数组,每个元素为数组-> 花色:数字  /**1->万 2->筒 3->条 4->东南西北 */    
        console.log(myCards);

        var userData = cc.vv.gameMgr.userMap[cc.vv.gameMgr.seatIndex];

        var cardCount = msgTbl.kCardCount[userData.kPos];
        var result = cc.vv.mahjongmgr.converArr2Ids(msgTbl.kMyCard);

        userData.holds = result;
        self.initMahjongs(userData);
    },

    initOtherHoldsEmpty: function () {
        var sides = ["right", "up", "left"];
        var gameChild = this.node.getChildByName("game");
        for (var i = 0; i < sides.length; ++i) {
            var sideChild = gameChild.getChildByName(sides[i]);
            var holds = sideChild.getChildByName("holds");

            for (var j = 0; j < holds.childrenCount; ++j) {
                var nc = holds.children[j];
                nc.active = true;
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
                var sprite = nc.getComponent(cc.Sprite);
                sprite.spriteFrame = cc.vv.mahjongmgr.holdsEmpty[i + 1];
            }
        }

    },

    doTurnChange: function (si) {
        var data = {
            last: cc.vv.gameMgr.turn,
            turn: si,
        }
        console.log(data);
        cc.vv.gameMgr.last = data.last;
        cc.vv.gameMgr.turn = si;

        this.hideChupai();
        if (data.last != cc.vv.gameMgr.seatIndex) {
            this.initMopai(data.last, null);
        }

        if (data.turn != cc.vv.gameMgr.seatIndex) {
            this.initMopai(data.turn, -1);
        }

        //game_chupai作用: 1.更新initMopai 2.更新指针
        /** 此处必须补加game_chupai,用于更新指针指向... */
        this.node.getComponent('TimePointer').updatePointer();
    },

    //#61034 玩家操作信息
    onRcvTurnShowMjTile: function (msgTbl) {
        console.warn('【MJGame.js】--> #61034 onRcvTurnShowMjTile()... 玩家操作信息');
        console.error(msgTbl);

        console.warn('61034中跟踪userMap: --->');
        console.warn(cc.vv.gameMgr.userMap);

        var self = this;
        cc.vv.gameMgr.curaction = msgTbl;  // 目前可以的操作
        var pos = msgTbl.kPos;

        //替换cc.vv.gameMgr.dispatchEvent('mj_count', msgTbl.kDCount);
        self._mjcount.string = "剩余" + msgTbl.kDCount + "张";

        //取消cc.vv.gameMgr.dispatchEvent('game_timer');

        cc.vv.gameMgr.data34 = {};

        if (cc.vv.gameMgr.seatIndex == pos) {
            console.error('当前该我操作...');
            if (msgTbl.kTingChuKou.length > 0) { //自己能听牌
                console.error('听出口长度' + msgTbl.kTingChuKou.length);
                var mapTingChuKou = {};
                var arrTingChuKou = msgTbl.kTingChuKou;
                for (let i = 0; i < arrTingChuKou.length; i++) {
                    var item = arrTingChuKou[i];
                    var pai = cc.vv.mahjongmgr.converVal2Id(item.kOutTile);
                    var arrTingKou = item.kTingKou;
                    var arrTpais = [];
                    for (let j = 0; j < arrTingKou.length; j++) {
                        var tpai = cc.vv.mahjongmgr.converVal2Id(arrTingKou[j]);
                        arrTpais.push(tpai);

                    }
                    mapTingChuKou[pai] = arrTpais;  //出牌id --> 对应胡牌数组
                }
                cc.vv.gameMgr.mapTingChuKou = mapTingChuKou;
            }


            if (msgTbl.kTingCards.length > 0) { //前者kTingChuKou存在,后者kTingCards肯定存在
                console.error('msgTbl.kTingCards.length: ' + msgTbl.kTingCards.length);
                console.error(msgTbl.kTingCards);
                var tingCards = cc.vv.mahjongmgr.converArr2Ids(msgTbl.kTingCards);
                cc.vv.gameMgr.canTingCards = tingCards;  //报听时,可以打出去的牌
            }

            if (msgTbl.kFlag == 0) {    //需要摸牌
                console.warn('当前玩家需要摸牌,玩家位置: ' + pos);
                var pai = cc.vv.mahjongmgr.converDesc2Id(msgTbl.kColor, msgTbl.kNumber); //牌索引.

                var seatData = cc.vv.gameMgr.userMap[pos];  //玩家自己信息
                if (seatData.holds.length > 0) {
                    console.warn('【】【】【】【】【】----------1111111111111111111----------- seatData.holds.push()' + '---摸的牌为: ' + pai);
                    seatData.holds.push(pai);
                    //替换this.dispatchEvent('game_mopai', { seatIndex: seatIndex, pai: pai });
                    self.player_mopai(pos, pai);
                }

                //保存pai的数据,用于断线恢复
                cc.vv.gameMgr.data34.pai = pai;
            }

            console.error('msgTbl.kThink.length' + msgTbl.kThink.length);
            console.error('msgTbl.kTing' + msgTbl.kTing);
            if (msgTbl.kThink.length > 0) {
                console.error('msgTbl.kThink.length: ' + msgTbl.kThink.length);
                //玩家有思考选项
                //可以有的操作
                var thinkData = cc.vv.utils.checkOption(msgTbl);
                //听牌检测
                var tingCards = cc.vv.mahjongmgr.converArr2Ids(msgTbl.kTingCards);

                if (msgTbl.kPos == cc.vv.gameMgr.seatIndex && msgTbl.kTingCards.length > 0) {
                    thinkData.tingCards = tingCards;
                };
                if (thinkData.gang.length > 0) {
                    //有杠
                    thinkData['gangFromId'] = 61034;    //暗杠
                    if (msgTbl.kTing == 1) {  //听牌过,用户可能过杠(暗杠、补杠)
                        cc.vv.gameMgr.tinged = true;
                        cc.vv.gameMgr.gangpaiItem = pai;    //摸的牌
                    }
                }
                if (thinkData.hu.length > 0) {
                    thinkData['huFromId'] = 61034;  //自摸胡,此时肯定听牌过
                    /**用户可能在听牌情况下过胡,需要保存要自动打的牌 */
                    var huItem = thinkData.hu[0];
                    cc.vv.gameMgr.hupaiItem = huItem.pai;
                }
                cc.vv.gameMgr.thinkData = thinkData;
                if (cc.vv.gameMgr.data34) {
                    cc.vv.gameMgr.data34.thinkData = thinkData;
                }
                
                
                console.log('61034中thinkData数据==================================');
                console.log(thinkData);
                if (thinkData != null) {
                    console.error('thinkData不为空,显示思考面板...');
                    //替换cc.vv.gameMgr.dispatchEvent('game_option', thinkData);
                    self.showAction(thinkData);
                }

            } else if (msgTbl.kThink.length == 0 && msgTbl.kTing == 1) {    //听牌过
                var shootCard = cc.vv.mahjongmgr.converDesc2Id(msgTbl.kColor, msgTbl.kNumber);
                console.error('shootCard' + shootCard);
                //替换cc.vv.gameMgr.dispatchEvent('game_auto_shoot', shootCard);
                self.player_auto_shoot(shootCard);
            }
        }
        //替换cc.vv.gameMgr.doTurnChange(pos);     ////通知出牌
        self.doTurnChange(pos);
    },

    doMopai: function (index, pai) {
        console.error('【MJGame.js】---> doMopai()...');
        var seatData = this.seats[index];
        console.error(seatData);
        if (seatData.holds.length > 0) {
            seatData.holds.push(pai);
        }

        this.hideChupai();
        var localIndex = cc.vv.gameMgr.getLocalIndex(index);
        if (localIndex == 0) {
            var pos = 13;
            var sprite = this._myMJArr[pos];
            this.setSpriteFrameByMJID("M_", sprite, pai, pos);
            sprite.node.mjId = pai;
        }
    },

    initMopai: function (seatIndex, pai) {
        console.error('【MJGame.js】---> initMopai()...');

        var localIndex = cc.vv.gameMgr.getLocalIndex(seatIndex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);

        var gameChild = this.node.getChildByName("game");
        var sideChild = gameChild.getChildByName(side);
        var holds = sideChild.getChildByName("holds");

        var lastIndex = this.getMJIndex(side, 13);

        var nc = holds.children[lastIndex];

        nc.scaleX = 1.0;
        nc.scaleY = 1.0;

        if (pai == null) {
            nc.active = false;
        }
        else if (pai >= 0) {
            nc.active = true;
            if (side == "up") {
                nc.scaleX = 0.73;
                nc.scaleY = 0.73;
            }
            var sprite = nc.getComponent(cc.Sprite);
            sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, pai);
        }
        else if (pai != null) {
            nc.active = true;
            if (side == "up") {
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
            }
            var sprite = nc.getComponent(cc.Sprite);
            sprite.spriteFrame = cc.vv.mahjongmgr.getHoldsEmptySpriteFrame(side);
        }
    },


    //#61036 广播玩家出牌
    onRcvSyncShowMjTile: function (msgTbl) {
        console.warn('【MJGame.js】--> #61036 onRcvSyncShowMjTile()... 收到玩家操作牌广播信息...');
        console.warn(msgTbl);
        console.warn('进入61036时: 跟踪userMap: ----》----');
        console.warn(cc.vv.gameMgr.userMap);
        var self = this;

        if (msgTbl.kPos < 0 || msgTbl.kPos > 3) {
            console.warn('出牌玩家位置错误...');
            return;
        }

        if (msgTbl.kErrorCode != 0) {
            console.warn('发生错误: ' + msgTbl.kErrorCode);
            return;
        }

        var d = (msgTbl.kThink)[0];
        var pai = cc.vv.mahjongmgr.converDesc2Id(d[0], d[1]);
        var si = msgTbl.kPos;


        var kouFlag = false;    //是否需要扣牌
        //判断玩家是否需要扣牌
        if (msgTbl.kFlag == 5) {
            kouFlag = true;
        }

        var gangtype = null;
        var hutype = null;
        var rdata = {
            si: si,
            pai: pai,
            respId: 61036
        };
        if (cc.vv.gameMgr.reconnFlag) {
            var data36 = {
                si: si,
                pai: pai
            };
            cc.vv.gameMgr.data36 = data36;
        }

        switch (msgTbl.kType) {
            case 1:  //kType: 1,出牌
                //替换cc.vv.gameMgr.doChupai(si, pai);
                self.player_chupai(si, pai, kouFlag);
                break;
            case 3:
            case 4:
                self.player_gangpai(si, pai, msgTbl.kType, 61036);
                break;
            case 2:
                self.player_hupai(si, pai, 1);  //1自摸 0胡
                break;
            case 7:
                self.player_tingpai(msgTbl.kPos, pai);
                break;
        }
    },

    //#61037 玩家思考信息
    onRcvMakeDecision: function (msgTbl) {
        var self = this;
        console.warn('【MJGame.js】--> #61037 onRcvMakeDecision()... 玩家操作信息');
        console.error(msgTbl);

        if (msgTbl.kFlag == 1) {  //该我思考
            console.error('【MJGame.js】---> onRcvMakeDecision()... 该我思考');
            var thinkData = cc.vv.utils.checkOption(msgTbl);
            if (thinkData != null) {
                thinkData['needSend'] = true;
                console.warn('61037中thinkData数据===================');
                console.warn(thinkData);
                thinkData['gangFromId'] = 61037;
                self.thinkData = thinkData;
                console.error(self.thinkData);
                self.data37 = thinkData;
                self.showAction(thinkData);
            }
        }
    },


    //#61039 玩家决策广播消息
    onRcvSyncMakeDecision: function (msgTbl) {
        console.warn('【MJGame.js】--> #61039 onRcvSyncMakeDecision()... 广播玩家决策信息...');
        console.error(msgTbl);
        var self = this;

        var si = msgTbl.kPos;
        var pai = cc.vv.mahjongmgr.converDesc2Id(msgTbl.kColor, msgTbl.kNumber);
        var type = (msgTbl.kThink)[0];
        console.error('思考操作：------- 玩家位置:==> ' + si + ' ==> 牌id为: ' + pai + '==> 类型为: ==> ' + type);

        switch (type) {
            case 2:
                self.player_hupai(si, pai, 0);  //0点炮
                break;
            case 4:
                self.player_gangpai(si, pai, type, 61039);
                break;
            case 5:
                self.player_pengpai(si, pai);
                break;
        }
    },



    //#61043 耗子牌信息(正常开局)
    onRcvStartDecision: function (msgTbl) {
        console.warn('【MJGame.js】--> #61043 onRcvStartDecision()... 耗子牌信息(正常开局)');
        console.error(msgTbl);
        /*      var haoziCards = [];   //首先置空
             for (let i = 0; i < msgTbl.kHaoZiCards.length; i++) {
                 var item = msgTbl.kHaoZiCards[i];
                 var pai = cc.vv.mahjongmgr.converDesc2Id(item[0], item[1]);
                 haoziCards.push(pai);
             }
             cc.vv.gameMgr.haoziCards = haoziCards; */
        var self = this;
        self.initHaoziBoard(cc.vv.gameMgr.haoziCards);
    },

    //#61042 单局结算信息
    onRcvRoundReport: function (msgTbl) {
        console.warn('【MJGame.js】--> #61042 onRcvRoundReport()... 单局结算信息');
        console.error(msgTbl);
        var self = this;
        /**更新玩家分数 */
        var userMap = cc.vv.gameMgr.userMap;
        console.warn('结算时查看userMap信息...');
        console.warn(userMap);
        msgTbl.kScore.length = cc.vv.gameMgr.playerNum;
        for (let i = 0; i < msgTbl.kScore.length; i++) {
            userMap[i].score = msgTbl.kScore[i];
            self.node.getComponent('MJRoom').initSingleSeat(userMap[i]);
        }

        //结算
        self.node.getComponent('GameOver').onGameOver(msgTbl);
    },

    //#61050 整轮结算信息
    onRcvFinalReport: function (msgTbl) {
        console.warn('【MJGame.js】--> #61050 onRcvFinalReport()... 整轮结算信息');
        console.error(msgTbl);
        cc.vv.gameMgr.gameEndData = msgTbl;
    },

    onRcvDismissRoom: function (msgTbl) {
        console.warn('【MJGame.js】--> #61019 onRcvDismissRoom()... 解散消息');
        var self = this;
        /** 此处只负责解析和处理数据 */
        console.error(msgTbl);


        var dissolvePanel = self.node.getChildByName('disPanel');
        if (dissolvePanel) {
            dissolvePanel.destroy();
        }
        dissolvePanel = cc.instantiate(self.dissolvePrefab);
        dissolvePanel.name = 'disPanel';
        dissolvePanel.parent = self.node;
        
        var arrAgrees = msgTbl.kAgreeUserId;
        var arrWaits = msgTbl.kWaitUserId;
        var arrRejects = [];
        
        if (!self.disShowed) {
            self.disShowed = true;
        } else {

        }

        // 位置index 名字kNike 是否决定过 voted
        var arrVotes = [];     //kErrorCode == 1 游戏未开始,直接解散. 只是玩家表决面板不需要显示

        var errorCode = msgTbl.kErrorCode;
        var disData = {};
        disData['errCode'] = msgTbl.kErrorCode;
        disData['time'] = msgTbl.kTime;

        var userMap = cc.vv.gameMgr.userMap;
        if (errorCode == 0) {
            for (let uid in userMap) {
                if (uid > 4) {
                    uid = Number(uid);
    
                    var item = {};
                    item['index'] = userMap[uid].kPos;
                    item['name'] = userMap[uid].kNike;
                    if (arrAgrees.indexOf(uid) > -1) {
                        item['vote'] = 1;  // 1:  同意                  
                    } else if (arrWaits.indexOf(uid) > -1) {
                        item['vote'] = -1; // -1: 待确认                   
                    } else {
                        item['vote'] = 0;  //  0: 拒绝 
                    }
                    arrVotes.push(item);
                }
            }
            disData['arrVotes'] = arrVotes;
            disData['tag'] = -1;
            dissolvePanel.getComponent('Dissolve').show(disData);
        }

        if (msgTbl.kErrorCode == 1) {
            disData['tag'] = 1;
            dissolvePanel.getComponent('Dissolve').show(disData);

            cc.vv.gameMgr.kDeskId = null;
            cc.vv.gameMgr.oldRoomId = null;
            cc.vv.gameMgr.clearRoomData();
            cc.vv.gameMgr.initSeatSelects();
            cc.vv.gameMgr.userMap = {};
            cc.vv.gameMgr.seats = [];
            setTimeout(() => {
                cc.director.loadScene('hall');
            }, 1000);
        }

        if (msgTbl.kErrorCode == 2) {   //
            for (let uid in userMap) {
                if (uid > 4) {
                    uid = Number(uid);
                    var item = {};
                    item['index'] = userMap[uid].kPos;
                    item['name'] = userMap[uid].kNike;
                    item['vote'] = 1;  // 1:  同意                  
                    arrVotes.push(item);
                }
            }
            disData['arrVotes'] = arrVotes;
            disData['tag'] = 2;
            dissolvePanel.getComponent('Dissolve').show(disData);
            self.disShowed = false;

            cc.vv.gameMgr.initSeatSelects();
            cc.vv.gameMgr.clearRoomData();
        }

        if (msgTbl.kErrorCode == 4) {   //
            for (let uid in userMap) {
                if (uid > 4) {
                    uid = Number(uid);
                    var item = {};
                    item['index'] = userMap[uid].kPos;
                    item['name'] = userMap[uid].kNike;
                    item['vote'] = 0;  // 0:  拒绝                  
                    if (arrAgrees.indexOf(uid) > -1) {
                        item['vote'] = 1;  // 1:  同意                  
                    } else if (userMap[uid].kNike == msgTbl.kRefuse) {    //=4 此时arrWaits肯定为空
                        item['vote'] = 0;  // 0:  拒绝 
                    } else {
                        item['vote'] = -1; //-1:  待确认
                    }
                    arrVotes.push(item);
                }
            }
            disData['arrVotes'] = arrVotes;
            disData['tag'] = 0;
            self.disShowed = false;
            dissolvePanel.getComponent('Dissolve').show(disData);
        }
        
        if (msgTbl.kErrorCode == 3) {
            for (let uid in userMap) {
                if (uid > 4) {
                    uid = Number(uid);
    
                    var item = {};
                    item['index'] = userMap[uid].kPos;
                    item['name'] = userMap[uid].kNike;
                    if (arrAgrees.indexOf(uid) > -1) {
                        item['vote'] = 1;  // 1:  同意                  
                    } else if (arrWaits.indexOf(uid) > -1) {
                        item['vote'] = -1; // -1: 待确认                   
                    } else {
                        item['vote'] = 0;  //  0: 拒绝 
                    }
                    arrVotes.push(item);
                }
            }

            disData['arrVotes'] = arrVotes;
            disData['tag'] = 3;
            dissolvePanel.getComponent('Dissolve').show(disData);

            cc.vv.gameMgr.initSeatSelects();
            cc.vv.gameMgr.clearRoomData();
        }
    },


    //#61027 恢复桌子状态
    onRcvSyncRoomState: function (msgTbl) {
        console.warn('【MJGame.js】--> #61027 onRcvSyncRoomState()... 恢复桌子状态...');
        console.warn('msgTbl数据信息: ===========> ');
        console.error(msgTbl);
        var self = this;

        /**情况1: */
        cc.vv.gameMgr.turn = msgTbl.kPos;

        /** 保存用户能胡的牌信息: */
        var arrTemp = msgTbl.kITingHuCard;
        cc.vv.gameMgr.arrCanHus = [];
        for (let i = 0; i < arrTemp.length; i++) {
            var temp = arrTemp[i];
            var pai = cc.vv.mahjongmgr.converDesc2Id(temp[0], temp[1]);
            cc.vv.gameMgr.arrCanHus.push(pai);
        }
        console.log('重连保存用户可以胡的牌数组信息: ------------ ');
        console.log(cc.vv.gameMgr.arrCanHus);

        //kPos: 保存游戏中正在操作的玩家.
        /**情况2: */
        /**此处代码必须保留, 因为长时间无响应断开连接，重连后,MJGame加载完成后还没收到game_recovery_info消息*/
        //cc.vv.gameMgr.dispatchEvent('game_recovery_info', msgTbl);

        /**
             * 1.恢复自己座位信息: 已由61022完成 (kPos已经<4)
             */
        /**
         * 2.依次恢复其他3个玩家位置信息: 已由61023完成 (kPos已经<4)
         */

        var zhuang = msgTbl.kZhuang;  //庄家
        var scores = msgTbl.kScore;   //分数 [0, 0, 0, 0]数组
        //var pos = msgTbl.kPosUserid; //位置 [userid]
        var playerCount = msgTbl.kGamePlayerCount;    //玩家数量
        var dcount = msgTbl.kDCount;      //剩余牌数量 

        var seatData = cc.vv.gameMgr.userMap[cc.vv.gameMgr.seatIndex];
        seatData.holds = cc.vv.mahjongmgr.converArr2Ids(msgTbl.kMyCard);

        self._mjcount.string = "剩余" + msgTbl.kDCount + "张";

        var cardCountArr = msgTbl.kCardCount; //[14, 13,..] //[]数组,0-3逻辑位置

        /**查找自己数据 */
        var si = cc.vv.gameMgr.seatIndex;

        var seats = cc.vv.gameMgr.seats;
        console.warn(seats);

        // msgTbl.kKouCount: 玩家报听时,出的牌的位置
        // msgTbl.kTCard0: 玩家0报听时出的牌 不用
        console.warn('**************** ---- 恢复扣牌状态');
        var arrKouPos = msgTbl.kKouCount;
        for (let i = 0; i < seats.length; i++) {
            //碰牌
            seats[i].pengs = cc.vv.mahjongmgr.converArr2Ids(msgTbl['kPCard' + i]);
            //暗杠
            seats[i].angangs = cc.vv.mahjongmgr.converArr2Ids(msgTbl['kACard' + i]);
            //明杠(包含补杠)
            seats[i].diangangs = cc.vv.mahjongmgr.converArr2Ids(msgTbl['kMCard' + i]);
            //出牌
            seats[i].folds = cc.vv.mahjongmgr.converArr2Ids(msgTbl['kOCard' + i]);


            var kouFlag = false;
            var pos = arrKouPos[i];
            if (pos != -1) {
                console.warn('扣牌的位置为: ' + arrKouPos[i]);
                var localIndex = cc.vv.gameMgr.getLocalIndex(i);    //本地位置
                var cside = cc.vv.mahjongmgr.getSide(localIndex);
                switch (cside) {
                    case 'myself':
                        seats[i].folds[pos] = -1;
                        break;
                    case 'right':
                        seats[i].folds[pos] = -2;
                        break;
                    case 'up':
                        seats[i].folds[pos] = -3;
                        break;
                    case 'left':
                        seats[i].folds[pos] = -4;
                        break;
                }
            }
        }

        //恢复手牌
        //计算另外三个玩家碰杠后的剩余牌的数目
        var seats = cc.vv.gameMgr.seats;
        var sideNumMap = {};
        for (let i = 0; i < seats.length; i++) {
            var localIndex = cc.vv.gameMgr.getLocalIndex(i);
            var side = cc.vv.mahjongmgr.getSide(localIndex);
            sideNumMap[side] = cardCountArr[i];
        }

        var gameChild = self.node.getChildByName("game");

        var preSides = ["right", "up", "left"];
        /** 计算另外一个玩家的位置 */

        var userMap = cc.vv.gameMgr.userMap;
        var sides = [];
        for (let index in userMap) {
            if (index < 4 && index != cc.vv.gameMgr.seatIndex) {
                console.warn('另外玩家的逻辑位置: ===> ' + index);
                var pIndex = cc.vv.gameMgr.getLocalIndex(index);
                var pSide = cc.vv.mahjongmgr.getSide(pIndex);
                sides.push(pSide);
            }
        }

        /**去除碰杠站位的牌 */
        //left
        var leftSide = gameChild.getChildByName('left');
        if (sides.indexOf('left') > -1) {
            leftSide.active = true;
            var holds = leftSide.getChildByName('holds');
            var lnum = holds.childrenCount - sideNumMap.left;
            for (let j = 0; j < holds.childrenCount; j++) {
                var nc = holds.children[j];
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
                var sprite = nc.getComponent(cc.Sprite);
                if (j < lnum) {
                    sprite.spriteFrame = null;
                } else {
                    sprite.spriteFrame = cc.vv.mahjongmgr.holdsEmpty[3];
                }
            }
        } else {
            leftSide.active = false;
        }

        //up
        var upSide = gameChild.getChildByName('up');
        if (sides.indexOf('up') > -1) {
            upSide.active = true;
            var holds = upSide.getChildByName('holds');
            var unum = holds.childrenCount - sideNumMap.up;
            for (let j = 0; j < holds.childrenCount; j++) {
                var nc = holds.children[j];
                /* if (j < sideNumMap.up) {
                    nc.active = true;
                } else {
                    nc.active = false;
                } */
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
                var sprite = nc.getComponent(cc.Sprite);
                if (j <= sideNumMap.up) {
                    sprite.spriteFrame = cc.vv.mahjongmgr.holdsEmpty[2];
                } else {
                    sprite.spriteFrame = null;
                }
            }
        } else {
            upSide.active = false;
        }

        //right
        var rightSide = gameChild.getChildByName('right');
        if (sides.indexOf('right') > -1) {
            rightSide.active = true;
            var holds = rightSide.getChildByName('holds');
            var rnum = holds.childrenCount - sideNumMap.right;
            for (let j = 0; j < holds.childrenCount; j++) {
                var nc = holds.children[j];
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
                var sprite = nc.getComponent(cc.Sprite);
                if (j <= sideNumMap.right) {
                    sprite.spriteFrame = cc.vv.mahjongmgr.holdsEmpty[1];
                } else {
                    sprite.spriteFrame = null;
                }
            }
        } else {
            rightSide.active = false;
        }

        //从cardCountArr中去除玩家自己的，从而决定其他玩家中是否显示第14张
        /*      var idx = cardCountArr.indexOf(msgTbl.kMyCard.length);
             cardCountArr.splice(idx);
             var pos = cardCountArr.indexOf(14); */

        if (msgTbl.kMyCard.length == 14) {  //其他3人都隐藏最后一张
            for (let i = 0; i < sides.length; i++) {
                var s = gameChild.getChildByName(sides[i]);
                var h = s.getChildByName("holds");
                var p = self.getMJIndex(sides[i], 13);
                var n = h.children[p];
                n.active = false;
            }
        } else if (msgTbl.kPos != cc.vv.gameMgr.seatIndex) {
            if (msgTbl.kFlag == 0) {    //其他玩家需要摸牌

                var zIndex = cc.vv.gameMgr.getLocalIndex(msgTbl.kPos);
                var zside = cc.vv.mahjongmgr.getSide(zIndex);
                for (var i = 0; i < sides.length; ++i) {

                    var sideChild = gameChild.getChildByName(sides[i]);
                    var holds = sideChild.getChildByName("holds");

                    if (sides[i] != zside) {
                        //如果另外3边的玩家有一个是庄家,则显示第14张牌
                        var index = self.getMJIndex(sides[i], 13);  //取得最后一张牌的位置
                        var n = holds.children[index];
                        n.active = false;
                    }
                }
            }
        }

        self.prepareRoot.active = false;

        self.gameRoot.active = true;


        console.warn(self.prepareRoot.active);
        console.warn(self.gameRoot.active);

        self.initMahjongs(seatData);

        //恢复玩家碰杠牌信息
        for (let i = 0; i < seats.length; i++) {
            self.node.getComponent('PengGangs').onPengGangChanged(seats[i]);
            self.node.getComponent('Folds').initFolds({
                seatData: seats[i]
            });
        }
        //kTingState: []
        if (msgTbl.kTingState[cc.vv.gameMgr.seatIndex] == 1) {
            for (let i = 0; i < self._myMJArr.length; i++) {
                var sprite = self._myMJArr[i];
                sprite.node.getComponent(cc.Button).interactable = false;
            }
        }
        //恢复玩家听标志
        var arrTingFlags = msgTbl.kTingState;
        for (let i = 0; i < arrTingFlags.length; i++) {
            if (arrTingFlags[i] == 1) {
                self.node.getComponent('MJRoom').setTing(i);
            }
        }
    },

    /** 处理刷新重进消息, 其余走正常开局或场景中直接恢复 */
    parseRefreshData: function () {
        console.error('【MJGame.js】---> parseRefreshData()... 处理刷新重进消息, 其余走正常开局或场景中直接恢复');
        if (cc.vv.gameMgr.dataInfo19) {
            this.onRcvDismissRoom(cc.vv.gameMgr.dataInfo19);
            console.error('222222222222222 parseRefreshData() ========= 刷新重进中的解散恢复.............');
            cc.vv.gameMgr.dataInfo19 = null;
        }

        if (cc.vv.gameMgr.dataInfo32) {
            this.onRcvRoundState(cc.vv.gameMgr.dataInfo32);
            cc.vv.gameMgr.dataInfo32 = null;
        }

        if (cc.vv.gameMgr.dataInfo33) {
            this.onRcvStartGame(cc.vv.gameMgr.dataInfo33);
            cc.vv.gameMgr.dataInfo33 = null;
        }

        if (cc.vv.gameMgr.dataInfo34) {
            this.onRcvTurnShowMjTile(cc.vv.gameMgr.dataInfo34);
            cc.vv.gameMgr.dataInfo34 = null;
        }

        if (cc.vv.gameMgr.dataInfo36) {
            console.warn('【MJGame.js】--> parseRefreshData()... ');
            console.warn('查看dataInfo36是否存在');
            console.warn(cc.vv.gameMgr.dataInfo36);
            this.onRcvSyncShowMjTile(cc.vv.gameMgr.dataInfo36);

            cc.vv.gameMgr.dataInfo36 = null;
        }

        if (cc.vv.gameMgr.dataInfo37) {
            this.onRcvMakeDecision(cc.vv.gameMgr.dataInfo37);
            cc.vv.gameMgr.dataInfo37 = null;
        }
    },

    initView: function () {
       

        //搜索需要的子节点
        var gameChild = this.node.getChildByName("game");

        this._mjcount = gameChild.getChildByName('mjcount').getComponent(cc.Label);
        this._mjcount.string = "剩余" + cc.vv.gameMgr.numOfMJ + "张";
        this._gamecount = gameChild.getChildByName('gamecount').getComponent(cc.Label);
        this._gamecount.string = "" + cc.vv.gameMgr.numOfGames + "/" + cc.vv.gameMgr.maxNumOfGames + "局";

        var myselfChild = gameChild.getChildByName("myself");
        var myholds = myselfChild.getChildByName("holds");

        this._chupaidrag = gameChild.getChildByName('chupaidrag');
        this._chupaidrag.active = false;

      
        for (var i = 0; i < myholds.children.length; ++i) {
            this._haoziTags.push(myholds.children[i].getChildByName('haozi')); //只需保存节点
            this._haoziTags[i].active = false;
            var sprite = myholds.children[i].getComponent(cc.Sprite);
            this._myMJArr.push(sprite);
            sprite.spriteFrame = null;
            //this.initDragStuffs(sprite.node);
        }


        var realwidth = cc.director.getVisibleSize().width;
        myholds.scaleX *= realwidth / 1280;
        myholds.scaleY *= realwidth / 1280;

        var sides = ["myself", "right", "up", "left"];
        for (var i = 0; i < sides.length; ++i) {
            var side = sides[i];

            var sideChild = gameChild.getChildByName(side);
            this._hupaiTips.push(sideChild.getChildByName("HuPai"));
            this._playEfxs.push(sideChild.getChildByName("play_efx").getComponent(cc.Animation));
            this._chupaiSprite.push(sideChild.getChildByName("ChuPai").children[0].getComponent(cc.Sprite));

            var opt = sideChild.getChildByName("opt");
            opt.active = false;
            var sprite = opt.getChildByName("pai").getComponent(cc.Sprite);
            var data = {
                node: opt,
                sprite: sprite
            };
            this._opts.push(data);
        }

        this._settings = this.node.getChildByName('settings');

        this._btnDispress = gameChild.getChildByName('btnDispress');
        cc.vv.utils.addClickEvent(this._btnDispress, this.node, "MJGame", "onBtnDispressClicked");
        this._btnDispress.active = true;

        var opts = gameChild.getChildByName("ops");
        this._options = opts;

        /** 新增查听功能 */
        this._tingLayout = gameChild.getChildByName('tingLayout');
        /* for (let i = 0; i < tingNode.childrenCount; i++) {
            //保存的是sprite
            var n = tingNode.children[i];
            var spItem = n.getComponent(cc.Sprite);
            spItem.spriteFrame = null;
            this._tingItems.push(spItem);
        } */
        this._btnQuery = gameChild.getChildByName('btnQuery');
        this._btnQuery.active = cc.vv.gameMgr.kTinged;
        cc.vv.utils.addClickEvent(this._btnQuery, this.node, 'MJGame', 'onBtnQueryClicked');
        /** 耗子牌相关 */
        console.warn('');
        this._sprHaoziBoard = gameChild.getChildByName('haoziBoard');
        for (let i = 0; i < this._sprHaoziBoard.childrenCount; i++) {
            var child = this._sprHaoziBoard.children[i];
            if (child.name.indexOf('haozi') == 0) {
                var sprChild = child.getComponent(cc.Sprite);
                console.warn('初始化时候隐藏耗子节点...');
                sprChild.node.active = false;
                //sprChild.spriteFrame = null;
                this.haoziLists.push(sprChild);
            }
        }

        console.warn('初始化 initHaoziBoard ^^^^^^^^^^^^');
        this.initHaoziBoard(cc.vv.gameMgr.haoziCards);

        this.hideOptions();
        
        //this._options.active == false;
       

        console.warn('【this.hideChupai】---1');
        this.hideChupai();
    },

    initDragStuffs: function (node) {
        //break if it's not my turn.
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            if (cc.vv.gameMgr.turn != cc.vv.gameMgr.seatIndex) {
                return;
            }
            node.interactable = node.getComponent(cc.Button).interactable;
            if (!node.interactable) {
                return;
            }
            node.opacity = 255;
            this._chupaidrag.active = false;
            this._chupaidrag.getComponent(cc.Sprite).spriteFrame = node.getComponent(cc.Sprite).spriteFrame;
            this._chupaidrag.x = event.getLocationX() - cc.director.getVisibleSize().width / 2;
            this._chupaidrag.y = event.getLocationY() - cc.director.getVisibleSize().height / 2;
        }.bind(this));

        node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            if (cc.vv.gameMgr.turn != cc.vv.gameMgr.seatIndex) {
                return;
            }
            if (!node.interactable) {
                return;
            }
            if (Math.abs(event.getDeltaX()) + Math.abs(event.getDeltaY()) < 0.5) {
                return;
            }
            this._chupaidrag.active = true;
            node.opacity = 150;
            this._chupaidrag.opacity = 255;
            this._chupaidrag.scaleX = 1;
            this._chupaidrag.scaleY = 1;
            this._chupaidrag.x = event.getLocationX() - cc.director.getVisibleSize().width / 2;
            this._chupaidrag.y = event.getLocationY() - cc.director.getVisibleSize().height / 2;
            node.y = 0;
        }.bind(this));

        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (cc.vv.gameMgr.turn != cc.vv.gameMgr.seatIndex) {
                return;
            }
            if (!node.interactable) {
                return;
            }
            this._chupaidrag.active = false;
            node.opacity = 255;
            if (event.getLocationY() >= 200) {
                this.shoot(node.mjId);
            }
        }.bind(this));

        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            if (cc.vv.gameMgr.turn != cc.vv.gameMgr.seatIndex) {
                return;
            }
            if (!node.interactable) {
                return;
            }
            this._chupaidrag.active = false;
            node.opacity = 255;
            if (event.getLocationY() >= 200) {
                this.shoot(node.mjId);
            } else if (event.getLocationY() >= 150) {
                //this._huadongtishi.active = true;
                //this._huadongtishi.getComponent(cc.Animation).play('huadongtishi');
            }
        }.bind(this));
    },

    hideChupai: function () {
        for (var i = 0; i < this._chupaiSprite.length; ++i) {
            this._chupaiSprite[i].node.active = false;
        }
    },

    //隐藏胡牌
    hideHupai: function () {
        for (let i = 0; i < 4; i++) {
            var localIndex = cc.vv.gameMgr.getLocalIndex(i);
            var hupai = this._hupaiTips[localIndex];
            hupai.active = false;
        }
    },

    initEventHandlers: function () {
        //cc.vv.gameMgr.dataEventHandler = this.node;
        console.log('【1*---==================初始化【MJGame.js】事件处理器完毕...');
        //初始化事件监听器
        var self = this;

        //当前桌面信息:
        //game_sync_info
        this.node.on('game_sync_info', function (data) {
            //kCurCircle
            //kCurMaxCircle
            this._mj = data.detail.kCurCircle;
            cc.vv.gameMgr.maxNumOfGames = data.detail.kCurMaxCircle;
        });

        //game_fapai
        this.node.on('game_fapai', function (data) {
            console.warn('【MJGame.js】--> game_fapai()... ');

            var sides = ["right", "up", "left"];
            var gameChild = self.node.getChildByName("game");
            for (var i = 0; i < sides.length; ++i) {
                var sideChild = gameChild.getChildByName(sides[i]);
                var holds = sideChild.getChildByName("holds");

                for (var j = 0; j < holds.childrenCount; ++j) {
                    var nc = holds.children[j];
                    nc.active = true;
                    nc.scaleX = 1.0;
                    nc.scaleY = 1.0;
                    var sprite = nc.getComponent(cc.Sprite);
                    sprite.spriteFrame = cc.vv.mahjongmgr.holdsEmpty[i + 1];
                }
            }

            self.prepareRoot.active = false;
            self.gameRoot.active = true;

            var data = data.detail;

            var myCards = data.kMyCard; //自己牌：数组,每个元素为数组-> 花色:数字  /**1->万 2->筒 3->条 4->东南西北 */    
            console.log(myCards);

            var userData = cc.vv.gameMgr.userMap[cc.vv.gameMgr.seatIndex];

            var cardCount = data.kCardCount[userData.kPos];
            var result = cc.vv.mahjongmgr.converArr2Ids(data.kMyCard);
            console.log('直接转换来的ids: ===> ***');
            console.log(result);
            userData.holds = result;
            /* userData.holds = [];
            console.log('count: ' + cardCount);
            for (let i = 0; i < cardCount; i++) {
                userData.holds.push(result[i]);
            } */
            self.initMahjongs(userData);
            //self.dispatchEvent('game_begin');     
        });

        this.node.on('game_fapai_rec', function (data) {
            console.log('恢复当前玩家手牌信息: ---------------------');
            var data = data.detail;
            var cardCountArr = data.cardCountArr; //[]数组,0-3逻辑位置
            //计算另外三个玩家碰杠后的剩余牌的数目
            var seats = cc.vv.gameMgr.seats;
            var sideNumMap = {};
            for (let i = 0; i < seats.length; i++) {
                var localIndex = cc.vv.gameMgr.getLocalIndex(i);
                var side = cc.vv.mahjongmgr.getSide(localIndex);
                sideNumMap[side] = cardCountArr[i];
            }

            var gameChild = self.node.getChildByName("game");
            var sides = ["right", "up", "left"];
            /**去除碰杠站位的牌 */
            /**
             * 其他玩家持有牌摆放起点: 左上 上 右上
             * -------碰杠牌摆放起点: 左上 上右 右下
             */
            //left
            var leftSide = gameChild.getChildByName('left');
            var holds = leftSide.getChildByName('holds');
            var lnum = holds.childrenCount - sideNumMap.left;
            for (let j = 0; j < holds.childrenCount; j++) {
                var nc = holds.children[j];
                /* if (j < lnum) {
                    nc.active = false;
                } else {
                    nc.active = true;
                } */
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
                var sprite = nc.getComponent(cc.Sprite);
                if (j < lnum) {
                    sprite.spriteFrame = null;
                } else {
                    sprite.spriteFrame = cc.vv.mahjongmgr.holdsEmpty[3];
                }
            }
            //up
            var upSide = gameChild.getChildByName('up');
            var holds = upSide.getChildByName('holds');
            var unum = holds.childrenCount - sideNumMap.up;
            for (let j = 0; j < holds.childrenCount; j++) {
                var nc = holds.children[j];
                /* if (j < sideNumMap.up) {
                    nc.active = true;
                } else {
                    nc.active = false;
                } */
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
                var sprite = nc.getComponent(cc.Sprite);
                if (j <= sideNumMap.up) {
                    sprite.spriteFrame = cc.vv.mahjongmgr.holdsEmpty[2];
                } else {
                    sprite.spriteFrame = null;
                }
            }

            //right
            var rightSide = gameChild.getChildByName('right');
            var holds = rightSide.getChildByName('holds');
            var rnum = holds.childrenCount - sideNumMap.right;
            for (let j = 0; j < holds.childrenCount; j++) {
                var nc = holds.children[j];
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
                /*  if (j < sideNumMap.right) {
                     nc.active = true;
                 } else {
                     nc.active = false;
                 } */
                var sprite = nc.getComponent(cc.Sprite);
                if (j <= sideNumMap.right) {
                    sprite.spriteFrame = cc.vv.mahjongmgr.holdsEmpty[1];
                } else {
                    sprite.spriteFrame = null;
                }
            }

            self.prepareRoot.active = false;
            self.gameRoot.active = true;

            self.initMahjongs(data.seatData);
        });

        //通知下一个该出牌的玩家
        this.node.on('game_chupai', function (data) {
            data = data.detail;
            self.hideChupai();
            if (data.last != cc.vv.gameMgr.seatIndex) {
                self.initMopai(data.last, null);
            }

            if (data.turn != cc.vv.gameMgr.seatIndex) {
                self.initMopai(data.turn, -1);
            }
        });

        this.node.on('game_auto_shoot', function (data) {

            //自动出牌
            var mjNode = self._myMJArr[self._myMJArr.length - 1].node;
            var mjId = data.detail;
            mjNode.y = 0;
            mjNode.getComponent(cc.Sprite).spriteFrame = null;
            var msg = {
                'kMId': 61035,
                'kType': 1,
                'kThink': [
                    cc.vv.mahjongmgr.converId2Arr(mjId)
                ]
            };
            setTimeout(() => {
                cc.vv.gameMgr.chupai_push(msg);
            }, 300);
        });

        //显示自己或其他人出牌效果.
        this.node.on('game_chupai_notify', function (data) {
            var seatData = data.detail.seatData;
            self.hideChupai();
            console.warn('【this.hideChupai】---1');
            if (seatData.kPos == cc.vv.gameMgr.seatIndex) {
                self.initMahjongs(seatData);
            }
            else {
                self.initOtherMahjongs(seatData);
            }
            self.showChupai();
            var audioUrl = cc.vv.mahjongmgr.getAudioURLByMJID(data.detail.pai);
            cc.vv.audioMgr.playSFX(audioUrl);

            //var localIndex = self.getLocalIndex(seatData.kPos);
            //self.playEfx(localIndex, "play_peng");

        });

        this.node.on('game_mopai', function (data) {
            console.log('当前需要摸牌: ********* doMopai  *********** --- 4');
            self.hideChupai();
            console.warn('【this.hideChupai】---1');
            /** 摸牌时候首先恢复最后牌的基本状态 */
            var resumeLast = function () {
                var lastNode = self._myMJArr[13].node;
                if (!lastNode.active) {
                    console.warn('最后节点被隐藏了...');
                    lastNode.active = true;
                }
                lastNode.getChildByName('haozi').active = false;
                lastNode.getComponent(cc.Button).interactable = true;
            };
            resumeLast();

            data = data.detail;
            var pai = data.pai;
            var localIndex = cc.vv.gameMgr.getLocalIndex(data.seatIndex);
            var haoziCards = cc.vv.gameMgr.haoziCards;
            if (localIndex == 0 && data.pai != -1) {
                /** 获取手牌信息 */
                var seatData = cc.vv.gameMgr.userMap[data.seatIndex];
                var holds = seatData.holds;

                var index = 13;
                var sprite = self._myMJArr[index];
                self.setSpriteFrameByMJID("M_", sprite, pai, index);
                sprite.node.mjId = pai;

                console.warn('本局耗子牌信息: ===> ');
                console.warn(haoziCards);
                console.warn('当前摸牌信息: ===> ' + pai);
                console.warn('自己听牌状态: ===> ' + cc.vv.gameMgr.kTinged);
                /** 如果摸的牌为耗子牌，加标记，禁用 */
                for (let i = 0; i < haoziCards.length; i++) {
                    if (haoziCards[i] == pai) {
                        console.warn('只要是耗子牌,标志都要显示');

                        var showLast = function () {
                            var lastNode = self._myMJArr[13].node;
                            if (!lastNode.active) {
                                lastNode.active = true;
                            }
                            lastNode.getChildByName('haozi').active = true;
                        };

                        showLast();
                        /** 同时耗子牌不能被点击 */
                        if (holds.length == 1 && holds[0] == haoziCards[i] && !cc.vv.gameMgr.kTinged) {
                            sprite.node.getComponent(cc.Button).interactable = true;
                        } else {
                            sprite.node.getComponent(cc.Button).interactable = false;
                        }
                    }
                }
            }
        });

        this.node.on('game_option', function (data) {
            console.log('进入game_option()...');
            self.showAction(data.detail);
        });

        this.node.on('game_ting', function (data) {
            //可以听牌,只能打kTingCards数组中的牌
            //需要将能有叫的牌设置为不可用
            console.log('cc.vv.gameMgr.kTinged = true; 还有点早 只是点击了听牌');
            cc.vv.gameMgr.kTinged = true;
            var tingCards = data.detail.tingCards;    //听牌后必须可以打出的牌,亮色.    //[{type: , pai: }]
            console.log(' 重点跟踪 tingCards: ============ 处理前');
            console.log(tingCards);

            var contains = function (arr, val) {
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i] == val) {
                        return true;
                    }
                }
                return false;
            }

            var holds = cc.vv.gameMgr.userMap[cc.vv.gameMgr.seatIndex].holds;
            console.log(holds.length);
            console.log(holds);

            for (var i = 0; i < holds.length; i++) {
                var sprite = self._myMJArr[i + cc.vv.gameMgr.lackingNum];
                if (contains(tingCards, holds[i])) {     //位置为i的手牌可以打出.
                    console.log('包含' + i);
                    sprite.node.getComponent(cc.Button).interactable = true;
                } else {
                    console.log('不包含' + i);
                    sprite.node.getComponent(cc.Button).interactable = false;
                }
            }
        });

        this.node.on('game_hupai', function (data) {
            console.warn('【MJGame.js】--> game_hupai()... hideOptions 1');

            /**
             * si: si,
                pai: pai,
                gangtype: gangtype,
                hutype: hutype,
                respId: 61039
             */
            var data = data.detail;
            //如果不是玩家自己，则将玩家的牌都放倒
            var seatIndex = data.si;
            var localIndex = cc.vv.gameMgr.getLocalIndex(seatIndex);
            var hupai = self._hupaiTips[localIndex];
            hupai.active = true;
            if (localIndex == 0) {
                console.warn('【MJGame.js】--> game_hupai()... hideOptions 2');


                //self.hideOptions();
                /*     console.warn('消息隐藏选项改为前端手动处理...');
                    self._options.active == false; */
            }
            var seatData = cc.vv.gameMgr.userMap[data.si];
            if (!seatData) {
                console.warn('11111111');
                return;
            }

            seatData.hued = true;
            if (data.hutype == 1) { //1 自摸
                hupai.getChildByName("sprHu").active = false;
                hupai.getChildByName("sprZimo").active = true;

                self.playEfx(localIndex, "play_zimo");
            } else if (data.hutype == 0) { //胡
                hupai.getChildByName("sprHu").active = true;
                hupai.getChildByName("sprZimo").active = false;


                self.playEfx(localIndex, "play_hu");
            }
            cc.vv.audioMgr.playSFX("nv/hu.mp3");
            if (data.hutype == 1) {
                if (seatData.kPos == cc.vv.gameMgr.seatIndex) {
                    seatData.holds.pop();
                    self.initMahjongs(seatData);
                }
                else {
                    self.initOtherMahjongs(seatData);
                }
            }
            /* if (cc.vv.replayMgr.isReplay() == true && cc.vv.gameMgr.conf.type != "xlch") {
                var opt = self._opts[localIndex];
                opt.node.active = true;
                opt.sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_", data.hupai);
            } */
        });

        this.node.on('mj_count', function (data) {
            self._mjcount.string = "剩余" + data.detail + "张";
        });

        this.node.on('game_num', function (data) {
            self._gamecount.string = "" + cc.vv.gameMgr.numOfGames + "/" + cc.vv.gameMgr.maxNumOfGames + "局";
        });

        this.node.on('game_over', function (data) {
            var data = data.detail;
            /**更新玩家分数 */
            var userMap = cc.vv.gameMgr.userMap;
            console.warn('【MJGame.js】--> game_over()...');
            console.warn('结算时查看userMap信息...');
            console.warn(userMap);
            console.warn('结算时准备更新玩家数据...');
            for (let i = 0; i < data.kScore.length; i++) {
                userMap[i].score = data.kScore[i];
                cc.vv.gameMgr.dispatchEvent('user_state_changed', userMap[i]);
            }
        });

        this.node.on('game_end', function (data) {
            console.warn('game_end()...');
        });

        this.node.on('game_guo', function (data) {
            console.warn('【this.hideChupai】---1');
            self.hideChupai();
            console.warn('【MJGame.js】--> game_guo()... hideOptions');

            console.warn('消息隐藏选项改为前端手动处理...');
            //self._options.active == false;
            //self.hideOptions();
            var seatData = data.detail;
            //如果是自己，则刷新手牌
            if (seatData.seatindex == cc.vv.gameMgr.seatIndex) {
                self.initMahjongs(seatData);
            }
            cc.vv.audioMgr.playSFX("give.mp3");
        });

        this.node.on('guo_result', function (data) {
            console.warn('【MJGame.js】--> guo_result()... hideOptions');

            /*    console.warn('消息隐藏选项改为前端手动处理...');
               self._options.active == false; */
            //self.hideOptions();
        });



        this.node.on('game_peng', function (data) {
            console.warn('【MJGame.js】--> game_peng()... hideOptions');
            self.hideChupai();
            console.warn('【this.hideChupai】---1');
            var seatData = data.detail;
            if (seatData.kPos == cc.vv.gameMgr.seatIndex) {
                self.initMahjongs(seatData);
                console.warn('消息隐藏选项改为前端手动处理...');
                //self._options.active == false;
                //self.hideOptions();
            }
            else {
                self.initOtherMahjongs(seatData);
            }
            var localIndex = self.getLocalIndex(seatData.kPos);
            self.playEfx(localIndex, "play_peng");
            cc.vv.audioMgr.playSFX("nv/peng.mp3");
            //隐藏选项的前提：是自己操作了
        });

        this.node.on('game_gang', function (data) {
            console.warn('【this.hideChupai】---1');
            self.hideChupai();
            var data = data.detail;
            var seatData = data.seatData;
            var gangtype = data.gangtype;
            if (seatData.kPos == cc.vv.gameMgr.seatIndex) {
                self.initMahjongs(seatData);
                //隐藏前提是自己杠牌了.
                console.warn('消息隐藏选项改为前端手动处理...');
                //self._options.active == false;
                //self.hideOptions();
            }
            else {
                self.initOtherMahjongs(seatData);
            }
            var localIndex = self.getLocalIndex(seatData.kPos);
            if (gangtype == 8) {
                self.playEfx(localIndex, "play_guafeng");
                cc.vv.audioMgr.playSFX("guafeng.mp3");
            }
            else {
                self.playEfx(localIndex, "play_xiayu");
                cc.vv.audioMgr.playSFX("rain.mp3");
            }

        });

        //新增玩家听牌动画
        this.node.on('player_ting', function (data) {
            var si = data.detail;
            var localIndex = self.getLocalIndex(si);
            console.warn('听牌玩家位置...' + si);
            self.playEfx(localIndex, "play_ting");
            cc.vv.audioMgr.playSFX("nv/ting.mp3");
        });

        this.node.on('game_reconn', function (data) {
            var data = data.detail;
            console.warn('跟踪 game_reconn data');
            console.warn(data);
            /** 恢复其他玩家出牌的UI */
            console.warn('其他玩家的操作选项界面恢复: --------------------------');
            if (data.data36 && !cc.vv.gameMgr.handled) {
                console.warn('data36存在... 跟踪 =========== **********');
                console.log(data.data36);
                var pai = data.data36.pai;
                var si = data.data36.si;
                console.warn('当前出牌玩家是: ' + si);
                if (pai >= 0) {
                    console.warn('pai > 0 : ' + pai);
                    var localIndex = cc.vv.gameMgr.getLocalIndex(si);
                    var sprite = self._chupaiSprite[localIndex];
                    sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_", pai);
                    sprite.node.active = true;
                }
            }

            /** 恢复自己可以思考的选项 */
            var data37 = data.data37;
            console.warn('自己可以思考的选项数据恢复: -------------&&&&&&&&&&&&&&----------- ');
            console.warn(data37);
            /** 如果之前已经处理过, 则跳过*/
            console.warn('选项是否处理过： ' + cc.vv.gameMgr.handled);
            if (data37 && !cc.vv.gameMgr.handled) {
                console.warn('存在data37, 并且之前没处理过');
                console.warn('【showAction()...】');
                self.showAction(data37);
                return;
            }
            data.data37 = null;
            /** 2中情况不能同时存在... */

            var data34 = data.data34;
            /** 自己摸牌恢复以及可以有的思考操作 */
            if (data34 && !cc.vv.gameMgr.handled) {
                console.warn('**********************************断线重连时候恢复自己摸的牌...');
                console.warn();
                var pai = data34.pai;   //需要摸牌
                if (pai && pai != -1) {
                    cc.vv.gameMgr.doMopai(cc.vv.gameMgr.seatIndex, pai);
                }
                //self.initMahjongs(userData);
                console.warn(data34);
                console.warn('【showAction()...】');
                self.showAction(data34.thinkData);
            }
            cc.vv.gameMgr.reconnFlag = null;
        });

        this.node.on('game_recovery_info', function (data) {
            /**
             * 1.恢复自己座位信息: 已由61022完成 (kPos已经<4)
             */
            /**
             * 2.依次恢复其他3个玩家位置信息: 已由61023完成 (kPos已经<4)
             */
            var data = data.detail;

            var zhuang = data.kZhuang;  //庄家
            var scores = data.kScore;   //分数 [0, 0, 0, 0]数组
            var poss = data.kPosUserid; //位置 [userid]
            var playerCount = data.kGamePlayerCount;    //玩家数量
            var dcount = data.kDCount;      //剩余牌数量 

            var seatData = cc.vv.gameMgr.userMap[cc.vv.gameMgr.seatIndex];
            seatData.holds = cc.vv.mahjongmgr.converArr2Ids(data.kMyCard);

            cc.vv.gameMgr.dispatchEvent('mj_count', data.kDCount);  //剩余牌数量 

            //当前游戏轮kPos
            cc.vv.gameMgr.turn = data.kPos;
            var cardCountArr = data.kCardCount; //[14, 13,..]

            /**查找自己数据 */
            var si = cc.vv.gameMgr.seatIndex;
            var seats = cc.vv.gameMgr.seats;


            for (let i = 0; i < seats.length; i++) {
                //碰牌
                seats[i].pengs = cc.vv.mahjongmgr.converArr2Ids(data['kPCard' + i]);
                //暗杠
                seats[i].angangs = cc.vv.mahjongmgr.converArr2Ids(data['kACard' + i]);
                //明杠(包含补杠)
                seats[i].diangangs = cc.vv.mahjongmgr.converArr2Ids(data['kMCard' + i]);
                //出牌
                seats[i].folds = cc.vv.mahjongmgr.converArr2Ids(data['kOCard' + i]);
            }

            //恢复手牌
            cc.vv.gameMgr.dispatchEvent('game_fapai_rec', {
                'seatData': seatData,
                'cardCountArr': cardCountArr
            });

            var node12 = self._myMJArr[12].node;
            console.warn('node12.active: 恢复手牌后' + node12.active);

            //恢复玩家碰杠牌信息
            for (let i = 0; i < seats.length; i++) {
                cc.vv.gameMgr.dispatchEvent('game_peng_rec', seats[i]);
                cc.vv.gameMgr.dispatchEvent('game_gang_rec', seats[i]);
                cc.vv.gameMgr.dispatchEvent('game_folds_rec', {
                    seatData: seats[i]
                });
            }
            //kTingState: []
            if (data.kTingState[cc.vv.gameMgr.seatIndex] == 1) {
                for (let i = 0; i < self._myMJArr.length; i++) {
                    var sprite = self._myMJArr[i];
                    sprite.node.getComponent(cc.Button).interactable = false;
                }
            }

            var node12 = self._myMJArr[12].node;
            console.warn('node12.active: 4444444444444' + node12.active);
        });

        /** 游戏界面重置 */
        this.node.on('game_reset', function () {
            for (var i = 0; i < self._playEfxs.length; ++i) {
                self._playEfxs[i].node.active = false;
            }

            console.log('隐藏听字 牌统计信息 ');
            cc.vv.gameMgr.mapPaiInfo = null;
            cc.vv.gameMgr.kTinged = false;
            cc.vv.gameMgr.arrCanHus = null;
            //重置玩家思考选项操作过
            cc.vv.gameMgr.handled = false;
            self._btnQuery.active = false;

            console.warn('【this.hideChupai】---1');
            self.hideChupai();
            self.hideHupai();
            console.warn('【MJGame.js】--> game_reset()... hideOptions');
            console.warn('消息隐藏选项改为前端手动处理...');
            // self._options.active == false;

            console.warn('此处必须隐藏,否则存在多胡的情况下,自己没胡成，就不会隐藏。');
            self.hideOptions();

            //重置其他玩家牌
            self.initOtherBgPais(false);
            //重置自己牌显示
            self.initMyselfBgPais();

            //重置听牌效果 
            for (let i = 0; i < self._myMJArr.length; i++) {
                var sprite = self._myMJArr[i];
                sprite.node.getComponent(cc.Button).interactable = true;
            }
            //重置听图标
            self.node.getComponent('MJRoom').resetAllTing();

            /**隐藏牌数、局数显示 */
            self._mjcount.string = '';
            self._gamecount.string = '';

            /** 隐藏耗子牌面板 */
            self.hideHaoziBoard();

            self.prepareRoot.active = false;
            self.gameRoot.active = true;
        });

        this.node.on('game_query_ting', function (data) {
            var data = data.detail;
        });

        this.node.on('game_haozi', function () {
            console.log('接收到开局后的耗子牌信息: ---- ');
            console.log(cc.vv.gameMgr.haoziCards);

            console.warn('【MJGame.js】---> game_haozi()... ^^^^^^^^');
            console.warn('初始化 initHaoziBoard ^^^^^^^^^^^^');
            self.initHaoziBoard(cc.vv.gameMgr.haoziCards);
        });

        this.node.on('game_wanfa', function (data) {
            console.warn('更新玩法...');
            self.updateWanfaLabel(data.detail);
        });

        cc.game.on('game_wanfa2', function (data) {
            console.warn('game 监听测试');
            console.warn(data);
        });
    },

    initOtherBgPais: function (flag) {
        var sides = ["right", "up", "left"];
        var gameChild = this.node.getChildByName("game");
        for (var i = 0; i < sides.length; ++i) {
            var sideChild = gameChild.getChildByName(sides[i]);
            var holds = sideChild.getChildByName("holds");
            for (var j = 0; j < holds.childrenCount; ++j) {
                var nc = holds.children[j];
                nc.active = true;
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
                var sprite = nc.getComponent(cc.Sprite);
                if (flag) {
                    sprite.spriteFrame = cc.vv.mahjongmgr.holdsEmpty[i + 1];
                } else {
                    sprite.spriteFrame = null;
                }
            }
        }
    },

    initMyselfBgPais: function () {
        for (let i = 0; i < this._myMJArr.length; i++) {
            var sprite = this._myMJArr[i];
            sprite.spriteFrame = null;
            //重置耗子牌标志
            var haozi = sprite.node.getChildByName('haozi');
            haozi.active = false;
        }
    },

    showChupai: function () {
        
        var pai = cc.vv.gameMgr.chupai;
        console.warn(cc.vv.gameMgr.chupai);
        if (pai >= 0) {
            var localIndex = this.getLocalIndex(cc.vv.gameMgr.turn);
            var sprite = this._chupaiSprite[localIndex];
            sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_", pai);
            sprite.node.active = true;
        }
    },

    addOption: function (btnName, pai, gtype, fromId) {
        for (var i = 0; i < this._options.childrenCount; ++i) {
            var child = this._options.children[i];
            if (child.name == "op" && child.active == false) {
                child.active = true;
                var sprite = child.getChildByName("opTarget").getComponent(cc.Sprite);
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_", pai);
                var btn = child.getChildByName(btnName);
                btn.active = true;
                if (btnName == 'btnGang') {
                    btn.gtype = gtype;
                    btn.gangFromId = fromId;
                }
                if (btnName == 'btnHu') {
                    btn.huFromId = fromId;
                }
                btn.pai = pai;
                return;
            }
        }
    },

    hideOptions: function (data) {
        console.log('调用hideOptions()...------------------');
        this._options.active = false;
        for (var i = 0; i < this._options.childrenCount; ++i) {
            var child = this._options.children[i];
            if (child.name == "op") {
                child.active = false;
                child.getChildByName("btnPeng").active = false;
                child.getChildByName("btnGang").active = false;
                child.getChildByName("btnHu").active = false;
            } else if (child.name == 'btnTing') {
                child.active = false;
            }
        }
    },

    showAction: function (data) {
        console.log('[MJGame.js]--> showAction()..thinkData数据信息...');
        console.log(data);
        if (this._options.active) {
            console.log('_options.active == true');
            console.warn('【MJGame.js】--> showAction()... hideOptions');
            console.warn('注释this.hideOptions()...');
            this.hideOptions();
        }
        // data.pai: 为[0]-[33]
        var checkAction = function (data) {
            if (data && (data.peng.length > 0 || data.gang.length > 0 || data.ting || data.hu.length > 0)) {
                return true;
            } else {
                return false;
            }
        };
        if (checkAction(data)) {
            this._options.active = true;
            if (data.hu.length > 0) {
                for (let i = 0; i < data.hu.length; i++) {
                    var huItem = (data.hu)[i];
                    this.addOption("btnHu", huItem.pai, null, data.huFromId);
                }
            }
            if (data.peng.length > 0) {
                for (let i = 0; i < data.peng.length; i++) {
                    var pengItem = (data.peng)[i];
                    this.addOption("btnPeng", pengItem.pai);
                }
            }

            if (data.gang.length > 0) {
                for (let i = 0; i < data.gang.length; i++) {
                    var gangItem = (data.gang)[i];
                    this.addOption("btnGang", gangItem.pai, gangItem.type, data.gangFromId);
                    console.log('=======当前杠选项中保存的杠类型为: =====> ' + gangItem.type);
                }
            }

            if (data.ting.length > 0) {
                this._options.getChildByName('btnTing').active = true;
                this._options.getChildByName('btnTing').tingCards = data.tingCards;
            }
            /*  if (data.gang) {
                 for (var i = 0; i < data.gangpai.length; ++i) {
                     var gp = data.gangpai[i];
                     this.addOption("btnGang", gp);
                 }
             } */
            if (data.needSend) {    //消息来自61037,玩家出牌,我的决策操作.
                this._options.getChildByName('btnGuo').needSend = data.needSend;
                var pai = null;
                if (data.peng.length > 0) {
                    pai = ((data.peng)[0]).pai;
                } else if (data.gang.length > 0) {
                    pai = ((data.gang)[0]).pai;
                } else if (data.hu.length > 0) {
                    pai = ((data.hu)[0]).pai;
                }

                this._options.getChildByName('btnGuo').pai = pai;
            }
        }
    },

    initWanfaLabel: function () {
        this.wanfa = cc.find("Canvas/infobar/wanfa").getComponent(cc.Label);
        this.wanfa.string = cc.vv.gameMgr.wanfa;
    },
    updateWanfaLabel: function (data) {
        this.wanfa = cc.find("Canvas/infobar/wanfa").getComponent(cc.Label);
        this.wanfa.string = data;
    },

    playEfx: function (index, name) {
        this._playEfxs[index].node.active = true;
        this._playEfxs[index].play(name);
    },

    game_init: function () {
        for (var i = 0; i < this._playEfxs.length; ++i) {
            this._playEfxs[i].node.active = false;
        }
    },

    onMJClicked: function (event) {
        //如果不是自己的轮子，则忽略
        if (cc.vv.gameMgr.turn != cc.vv.gameMgr.seatIndex) {
            return;
        }
        var chupaiMode = cc.vv.gameMgr.chupaiMode;

        for (var i = 0; i < this._myMJArr.length; ++i) {
            if (event.target == this._myMJArr[i].node) {

                if (chupaiMode == 2) {   //双击出牌模式
                    //如果是再次点击，则出牌
                    if (event.target == this._selectedMJ) {
                        this.shoot(this._selectedMJ.mjId, this.clickTinged);
                        this._selectedMJ.y = 0;
                        this._selectedMJ = null;
                        return;
                    }

                    if (this._selectedMJ != null) {
                        this._selectedMJ.y = 0;
                    }

                    //----------------------------
                    /** 显示tingKou界面 */
                    console.log('跟踪听牌状态');
                    console.error(cc.vv.gameMgr.kTinged);
                    if (cc.vv.gameMgr.kTinged) {
                        var pai = event.target.mjId;
                        if (cc.vv.gameMgr.mapTingChuKou) {
                            console.log('牌: ' + pai + '打出去后可以胡的牌数组为: ===>');
                            var arrCanHus = cc.vv.gameMgr.mapTingChuKou[pai];
                            cc.vv.gameMgr.arrCanHus = arrCanHus;
                            console.log(arrCanHus);
                            var mapPaiInfo = this.getPaiInfo();
                            this.initTingItems(arrCanHus, mapPaiInfo);
                            setTimeout(() => {
                                this._tingLayout.active = false;
                            }, 2000);
                        }
                    }
                    //---------------------------- 

                    event.target.y = 15;
                    this._selectedMJ = event.target;
                    return;
                } else {
                    event.target.y = 15;
                    this.shoot(event.target.mjId, this.clickTinged);
                    event.target.y = 0;
                }
                //----------------------------
                /** 显示tingKou界面 */
                console.log('跟踪听牌状态');
                console.error(cc.vv.gameMgr.kTinged);
                if (cc.vv.gameMgr.kTinged) {
                    console.log('kTinged: ' + cc.vv.gameMgr.kTinged);
                    var pai = event.target.mjId;
                    if (cc.vv.gameMgr.mapTingChuKou) {
                        console.log('牌: ' + pai + '打出去后可以胡的牌数组为: ===>');
                        var arrCanHus = cc.vv.gameMgr.mapTingChuKou[pai];
                        cc.vv.gameMgr.arrCanHus = arrCanHus;
                        console.log(arrCanHus);
                        var mapPaiInfo = this.getPaiInfo();
                        this.initTingItems(arrCanHus, mapPaiInfo);
                        setTimeout(() => {
                            this._tingLayout.active = false;
                        }, 2000);
                    }
                }
                //---------------------------- 
            }
        }
    },

    //出牌
    shoot: function (mjId, tinged) {
        if (mjId == null) {
            return;
        }
        var data = {
            'kMId': 61035,
            'kThink': [
                cc.vv.mahjongmgr.converId2Arr(mjId)
            ]
        };
        if (tinged) {   //进行过听牌操作
            console.log('点击过听牌 ***********  【【【】】】】】】】】】】 11111111111111');
            data['kType'] = 7;
            cc.vv.gameMgr.ting_push(data);
            this.clickTinged = false;
            /** 此后本局玩家状态为tinging */
            cc.vv.gameMgr.kTinged = true;
            /** 显示查听按钮 */
            this._btnQuery.active = true;
            /**
             * 听牌操作完成后,会收到kType=7的61036消息.然后再次收到kType=1的61036
             */
            /** 此时保存当前玩家可以胡的牌 */
            var result = cc.vv.gameMgr.mapTingChuKou[mjId];
            console.log('------  -- 我现在可以胡的牌信息为: -- ------');
            console.log(result);
            cc.vv.gameMgr.arrCanHus = result;
        } else {
            data['kType'] = 1;
            cc.vv.gameMgr.chupai_push(data);
        }
        /** 如果存在听提示,隐藏 */
        this._tingLayout.active = false;
    },

    getMJIndex: function (side, index) {
        if (side == "right" || side == "up") {
            return 13 - index;
        }
        return index;
    },

    initMopai: function (seatIndex, pai) {
        if (seatIndex == -1) {

        }

        var localIndex = cc.vv.gameMgr.getLocalIndex(seatIndex);
       
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        
        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);

        var gameChild = this.node.getChildByName("game");
        var sideChild = gameChild.getChildByName(side);
        var holds = sideChild.getChildByName("holds");

        var lastIndex = this.getMJIndex(side, 13);
        console.warn('lastIndex: ' + lastIndex);

        var nc = holds.children[lastIndex];

        nc.scaleX = 1.0;
        nc.scaleY = 1.0;

        if (pai == null) {
            if (seatIndex == -1) {
                console.warn('刚好开局不隐藏...');
                return;
            }
            nc.active = false;
            console.warn('隐藏最后一个节点...');
        }
        else if (pai >= 0) {
            nc.active = true;
            if (side == "up") {
                nc.scaleX = 0.73;
                nc.scaleY = 0.73;
            }
            var sprite = nc.getComponent(cc.Sprite);
            sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, pai);
        }
        else if (pai != null) {
            nc.active = true;
            if (side == "up") {
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
            }
            var sprite = nc.getComponent(cc.Sprite);
            sprite.spriteFrame = cc.vv.mahjongmgr.getHoldsEmptySpriteFrame(side);
        }
    },

    initEmptySprites: function (seatIndex) {
        var localIndex = cc.vv.gameMgr.getLocalIndex(seatIndex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);

        var gameChild = this.node.getChildByName("game");
        var sideChild = gameChild.getChildByName(side);
        var holds = sideChild.getChildByName("holds");
        var spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame(side);
        for (var i = 0; i < holds.childrenCount; ++i) {
            var nc = holds.children[i];
            nc.scaleX = 1.0;
            nc.scaleY = 1.0;

            var sprite = nc.getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        }
    },

    initOtherMahjongs: function (seatData) {
        if (JSON.stringify(seatData) == '{}') {
            return;
        }
        var localIndex = this.getLocalIndex(seatData.kPos);
        if (localIndex == 0) {
            return;
        }
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var game = this.node.getChildByName("game");
        var sideRoot = game.getChildByName(side);
        var sideHolds = sideRoot.getChildByName("holds");
        //初始化手牌
        if (seatData.pengs == null) {
            seatData.pengs = [];
        }
        if (seatData.angangs == null) {
            seatData.angangs = [];
        }
        if (seatData.diangangs == null) {
            seatData.diangangs = [];
        }
        if (seatData.wangangs == null) {
            seatData.wangangs = [];
        }
        var num = seatData.pengs.length + seatData.angangs.length + seatData.diangangs.length + seatData.wangangs.length;
        num *= 3;
        for (var i = 0; i < num; ++i) {
            var idx = this.getMJIndex(side, i);
            sideHolds.children[idx].active = false;
        }

        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
        var holds = this.sortHolds(seatData);
        if (holds != null && holds.length > 0) {
            for (var i = 0; i < holds.length; ++i) {
                var idx = this.getMJIndex(side, i + num);
                var sprite = sideHolds.children[idx].getComponent(cc.Sprite);
                if (side == "up") {
                    sprite.node.scaleX = 0.73;
                    sprite.node.scaleY = 0.73;
                }
                sprite.node.active = true;
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, holds[i]);
            }

            if (holds.length + num == 13) {
                var lasetIdx = this.getMJIndex(side, 13);
                sideHolds.children[lasetIdx].active = false;
            }
        }
    },

    sortHolds: function (seatData) {
        var holds = seatData.holds;
        if (holds == null) {
            return null;
        }
        //如果手上的牌的数目是2,5,8,11,14，表示最后一张牌是刚摸到的牌
        var mopai = null;
        var l = holds.length
        if (l == 2 || l == 5 || l == 8 || l == 11 || l == 14) {
            mopai = holds.pop();
        }

        cc.vv.mahjongmgr.sortMJ(holds);
        //将摸牌添加到最后
        if (mopai != null) {
            holds.push(mopai);
        }
        return holds;
    },

    initTingItems: function (tingItems, mapPaiInfo) {
        if (!this._tingLayout.active) {
            this._tingLayout.active = true;
            /** 首先清空之前节点... */
            for (let i = 0; i < this._tingLayout.childrenCount; i++) {
                var child = this._tingLayout.children[i];
                if (child) {
                    console.warn('销毁之前节点...');
                    child.destroy();
                }
            }
        }
        //tingItems: mjId数组
        // var holds = ;
        var tings = tingItems;
    
        cc.vv.mahjongmgr.sortMJ(tings);
        var length = tingItems.length;

        /**
         * 玩家有耗子后,可能出现手牌和桌面打出的牌都没有它,但是还是可以胡它.这种情况下 mapPaiInfo[mjid] undefined，直接设置为4
         */
        for (var i = 0; i < tings.length; i++) {
            var mjid = tings[i];
            //初始数量都为1
            var num = null;
            if (mapPaiInfo[mjid]) {
                num = 4 - mapPaiInfo[mjid];
            } else {
                num = 4;
            }
            var mjNode = cc.vv.mahjongmgr.createTingItem(mjid, num);
            mjNode.position = this._tingLayout.position;
            this._tingLayout.addChild(mjNode); //0 11 x += 50  12 23 x += 50 y -= 50 
            if (i <= 11) {
                mjNode.x = 50 * i;
                mjNode.y = 0;
            } else if (i <= 23) {
                mjNode.x = 50 * (i - 12);
                mjNode.y = -50;
            } else if (i <= 33) {
                mjNode.x = 50 * (i - 24);
                mjNode.y = -100;
            }
            //var px = this._tingLayout.x;
            //var py = this._tingLayout.y;
        }
    },

    resetTingLayout: function () {
        this._tingLayout.x = 0;
        this._tingLayout.y = 0;
    },



    initHaoziBoard: function (arrHaozis) {  //耗子牌id数组
        console.warn('显示耗子牌 ----------------------  ====');
        console.log(arrHaozis);
        if (!arrHaozis) {
            this.hideHaoziBoard();
            return;
        }

        if (arrHaozis.length == 0) {
            this.hideHaoziBoard();
            return;
        }

        if (!this._sprHaoziBoard.active) {
            this._sprHaoziBoard.active = true;
        }
        for (let i = 0; i < arrHaozis.length; i++) {
            if (!this.haoziLists) {
                this.haoziLists = [];
            }
            this.haoziLists[i].node.active = true;
            this.haoziLists[i].spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID('M_', arrHaozis[i]);
        }
    },

    hideHaoziBoard: function () {
        this._sprHaoziBoard.active = false;
        for (let i = 0; i < this._sprHaoziBoard.childrenCount; i++) {
            var child = this._sprHaoziBoard.children[i];
            child.active = false;
            if (child.name.indexOf('haozi') == 0) {
                var sprChild = child.getComponent(cc.Sprite);
                sprChild.spriteFrame = null;
            }
        }
    },

    initMahjongs: function (userData) {
        console.log('【MJGame.js】---> initMahjongs()... ');
        /** 玩家摸过耗子牌,此时也要恢复状态 */
        /** 摸牌时候首先恢复最后牌的基本状态 */
        var resumeLast = () => {
            var lastNode = this._myMJArr[13].node;
            if (!lastNode.active) {

                lastNode.active = true;
            }
            lastNode.getChildByName('haozi').active = false;
            lastNode.getComponent(cc.Button).interactable = true;
        };
        resumeLast();


        var seatData = userData;
        var holds = this.sortHolds(seatData);

        //先将耗子牌排序:
        if (!cc.vv.gameMgr.haoziCards) {
            cc.vv.gameMgr.haoziCards = [];
        }
        var haoziCards = cc.vv.mahjongmgr.sortMJ(cc.vv.gameMgr.haoziCards);

        console.warn(holds);
        holds = cc.vv.utils.sortHzCards(holds, haoziCards);
        console.log(holds);
        if (holds == null) {
            console.log('直接退出?');
            return;
        }

        var lackingNum = (seatData.pengs.length + seatData.angangs.length + seatData.diangangs.length + seatData.wangangs.length) * 3;
        cc.vv.gameMgr.lackingNum = lackingNum;

        var haoziCards = cc.vv.gameMgr.haoziCards;
        var arrHaoziPos = cc.vv.utils.getHaoziPos(holds, haoziCards);

        var hzNum = arrHaoziPos.length;    //耗子牌的牌数量
        for (var i = 0; i < holds.length; ++i) {
            var mjid = holds[i];
            var sprite = this._myMJArr[i + lackingNum];
            if (!sprite) {
                console.error('索引: ' + (i + lackingNum));
                console.error('sprite不存在...');
            } else {
               
            }
            sprite.node.mjId = mjid;
            sprite.node.y = 0;
            sprite.node.active = true;  //临时
            this.setSpriteFrameByMJID("M_", sprite, mjid);
            /** 显示耗子标签 */
            if (i < hzNum) {
                var pos = arrHaoziPos[i];   //耗子牌在holds中的位置
                var id = holds[pos];
                var sp = this._myMJArr[pos + lackingNum];
                var haozi = sprite.node.getChildByName('haozi');
                haozi.active = true;
                sprite.node.getComponent(cc.Button).interactable = false;
            }

        }

        if (cc.vv.gameMgr.kTinged) {
            console.error('55555555555555');
            for (let i = 0; i < this._myMJArr.length - 1; i++) {
                this._myMJArr[i].node.getComponent(cc.Button).interactable = false;
            }
            this._myMJArr[this._myMJArr.length - 1].node.getComponent(cc.Button).interactable = true;
        }
        //cc.vv.gameMgr.tinged = null;    //重置

        for (var i = 0; i < lackingNum; ++i) {
            var sprite = this._myMJArr[i];
            sprite.node.mjId = null;
            sprite.spriteFrame = null;
            sprite.node.active = false;
        }

        for (var i = lackingNum + holds.length; i < this._myMJArr.length; ++i) {
            var sprite = this._myMJArr[i];
            sprite.node.mjId = null;
            sprite.spriteFrame = null;
            sprite.node.active = false;
        }
    },
    showHzIcon: function () {
        //haoziCards
        //[8,8,27, 0,5,66,8]  3张耗子牌   [8,27]
        var seatData = cc.vv.gameMgr.userMap[cc.vv.gameMgr.seatIndex];
        var holds = seatData.holds;
        var haoziCards = cc.vv.gameMgr.haoziCards;
        var arrHaoziPos = cc.vv.utils.getHaoziPos(holds, haoziCards);
    },
    hideHzIcon: function () {

    },

    setSpriteFrameByMJID: function (pre, sprite, mjid) {
        sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjid);
        sprite.node.active = true;
    },

    getLocalIndex: function (index) {
        var ret = (index - cc.vv.gameMgr.seatIndex + 4) % 4;
        console.log("old:" + index + ",base:" + cc.vv.gameMgr.seatIndex + ",new:" + ret);
        return ret;
    },

    /** 新增方法: 计算所有玩家打出去的牌以及自己手牌的数目: */
    //如果存在耗子牌, 也要将其加进去
    // {pai1: num1, pai2: num2}
    getPaiInfo: function () {
        var userMap = cc.vv.gameMgr.userMap;
        var seats = cc.vv.gameMgr.seats;
        console.log(seats);

        cc.vv.gameMgr.mapPaiInfo = {};
        var mapPaiInfo = cc.vv.gameMgr.mapPaiInfo;
        var calNum = function (arr) {
            for (let i = 0; i < arr.length; i++) {
                var p = arr[i];
                if (!mapPaiInfo[p]) {
                    mapPaiInfo[p] = 1;
                } else {
                    mapPaiInfo[p] += 1;
                }
            }
        };

        /** 追加玩家碰杠牌的统计 */
        for (let index in userMap) {
            if (index < 4) {
                calNum(userMap[index].folds);
                calNum(userMap[index].pengs);
                calNum(userMap[index].angangs);
                calNum(userMap[index].diangangs);
                calNum(userMap[index].wangangs);
                if (index == cc.vv.gameMgr.seatIndex) {
                    calNum(userMap[index].holds);
                }
            }
        }
        if (cc.vv.gameMgr.haoziCards) {
            var temp = cc.vv.gameMgr.haoziCards;
            for (let i = 0; i < temp.length; i++) {
                var t = temp[i];
                if (!mapPaiInfo[t]) {
                    //直接为0
                    mapPaiInfo[t] = 0;
                }
            }
        }
        //统计牌的数目
        //当前牌统计信息为: ========>>>>>>>>>>>>>>>>>>>>>>>>>>>
        //mapPaiInfo
        return cc.vv.gameMgr.mapPaiInfo;
    },

    onOptionClicked: function (event) {
        var self = this;
        //this._options.active = false;
        this.hideOptions();

        /** 同时清除节点数据 */

        // event.target.pai为[id], 比如id=0, 表示1万, 可能为空,当点过时.           
        var data = {
            'kMId': 61038,
            //'kType': 
            //'kThink':
        };
        if (event.target.name == "btnPeng") {
            data['kType'] = 5;
            data['kThink'] = [
                cc.vv.mahjongmgr.converId2Arr(event.target.pai)
            ];
        }
        else if (event.target.name == "btnGang") {
            // 3,暗杠 4,明杠 // 4,补杠
            console.log(cc.vv.gameMgr.gangMap);
            var pai = event.target.pai;
            console.log('点击选项中保存的杠类型: ' + event.target.gtype);
            data['kType'] = event.target.gtype;
            console.log('kType:  ==>');
            console.log(data.kType);
            if (data.kType == 3) {   //暗杠3、补属于自己摸牌,出牌操作.kMId=61035
                data.kMId = 61035;
            }
            ////明杠、补杠都为4,需要再次判断kMId.
            if (event.target.gangFromId == 61034) { //补杠
                data.kMId = 61035;
            } else if (event.target.gangFromId == 61037) {
                data.kMId = 61038;
            }
            data['kThink'] = [
                cc.vv.mahjongmgr.converId2Arr(event.target.pai)
            ];

        }
        else if (event.target.name == "btnHu") {
            data['kType'] = 2;
            data['kThink'] = [
                cc.vv.mahjongmgr.converId2Arr(event.target.pai)
            ];
            if (event.target.huFromId == 61034) {   //自摸
                data.kMId = 61035;
            } else if (event.target.huFromId == 61037) {
                data.kMId = 61038;
            }

            console.warn('点击胡时,全局保存的胡牌信息id: ' + cc.vv.gameMgr.hupai);
            cc.vv.gameMgr.hupai = event.target.pai;
        }
        else if (event.target.name == "btnGuo") {
            if (event.target.needSend) {
                console.error('点击过, 需要发送给后台...');
                /**需要发送给后台，同时fire */
                data['kType'] = 0;
                data['kThink'] = [[]];
                cc.vv.gameMgr.think_push(data);
                var result = {
                    si: cc.vv.gameMgr.last,
                    pai: event.target.pai
                };

                cc.vv.dispatcher.fire('game_guo_result', result);
                console.log('hupaiItemxxxxxxx: ---> ' + cc.vv.gameMgr.hupaiItem);
                console.log('tinged: ---> ' + cc.vv.gameMgr.kTinged);
                console.log(' **************跟踪报听后自摸过胡 ***********  ');
                console.log(cc.vv.gameMgr.kTinged);

                if (cc.vv.gameMgr.kTinged) {
                    console.error('kTinged : ' + cc.vv.gameMgr.kTinged);
                    var mjId = this._myMJArr[13].node.mjId;
                    console.log('=====1..1======');
                    console.log('该自动出的牌id: ' + mjId);
                    if (mjId) {
                        this.player_auto_shoot(mjId);
                    }

                }
                return;
            } else {
                console.warn('【MJGame.js】--> 过不需要发送()... hideOptions');
                
                this.hideOptions();

                /**如果用户已经听过牌,61034自摸过胡的话,需要打出最后一张自摸牌 */
                if (cc.vv.gameMgr.hupaiItem) {  //存在表明肯定听过
                    self.player_auto_shoot(cc.vv.gameMgr.hupaiItem);
                    cc.vv.gameMgr.hupaiItem = null;
                }
                console.warn('点过后跟踪听状态: ===> ' + cc.vv.gameMgr.kTinged);
                if (cc.vv.gameMgr.kTinged) {
                    self.player_auto_shoot(cc.vv.gameMgr.gangpaiItem);
                    cc.vv.gameMgr.gangpaiItem = null;
                    cc.vv.gameMgr.kTinged = null;
                }
            }
        } else if (event.target.name == 'btnTing') {
            console.warn('【MJGame.js】--> 点击了听()... hideOptions');
            console.warn('《点击听后，跟踪usermap》');
            console.warn(cc.vv.gameMgr.userMap);

            //this.hideOptions();
            
            this._options.active == false;
            var tingCards = event.target.tingCards;
            this.clickTinged = true;
            var data = {
                tingCards: tingCards //[{type: , pai: }]
            };
            //this.game_ting(data);
            cc.vv.dispatcher.fire('game_ting_result', data);

            return;
        }
        cc.vv.gameMgr.think_push(data);
        //发送决策后,处理标记为true
        cc.vv.gameMgr.handled = true;
    },

    onBtnShezhiClicked: function () {
        this._settings.active = true;
    },

    onBtnDispressClicked: function () {
        cc.vv.gameMgr.deviced = true;
        cc.vv.gameMgr.dispress_push();
    },

    onBtnQueryClicked: function () {
        var mapPaiInfo = this.getPaiInfo();
        
        var canHus = cc.vv.gameMgr.arrCanHus;
        console.log(canHus);
        console.log(mapPaiInfo);
        this.initTingItems(canHus, mapPaiInfo);
        setTimeout(() => {
            this._tingLayout.active = false;
        }, 2000);
    },

    onDestroy: function () {
        console.error('销毁: [MJGame.js]--> onDestroy()...');
        if (cc.vv) {
            cc.vv.gameMgr.clear();
        }
    },

    player_mopai: function (seatIndex, pai) {
        console.error('[MJGame.js]--> player_mopai()...');
        var self = this;

        self.hideChupai();

        /** 摸牌时候首先恢复最后牌的基本状态 */
        var resumeLast = function () {
            var lastNode = self._myMJArr[13].node;
            lastNode.getChildByName('haozi').active = false;
            lastNode.getComponent(cc.Button).interactable = true;
        };
        resumeLast();

        var localIndex = cc.vv.gameMgr.getLocalIndex(seatIndex);
        var haoziCards = cc.vv.gameMgr.haoziCards;
        if (localIndex == 0 && pai != -1) {
            /** 获取手牌信息 */
            var seatData = cc.vv.gameMgr.userMap[seatIndex];
            var holds = seatData.holds;

            var index = 13;
            var sprite = self._myMJArr[index];
            self.setSpriteFrameByMJID("M_", sprite, pai, index);
            sprite.node.mjId = pai;

            /** 如果摸的牌为耗子牌，加标记，禁用 */
            for (let i = 0; i < haoziCards.length; i++) {
                if (haoziCards[i] == pai) {
                    console.warn('只要是耗子牌,标志都要显示');

                    var showLast = function () {
                        var lastNode = self._myMJArr[13].node;
                        if (!lastNode.active) {
                            lastNode.active = true;
                        }
                        lastNode.getChildByName('haozi').active = true;
                    };

                    showLast();
                    /** 同时耗子牌不能被点击 */
                    if (holds.length == 1 && holds[0] == haoziCards[i] && !cc.vv.gameMgr.kTinged) {
                        sprite.node.getComponent(cc.Button).interactable = true;
                    } else {
                        sprite.node.getComponent(cc.Button).interactable = false;
                    }
                }
            }
        }
    },

    player_chupai: function (seatIndex, pai, kouFlag) {
        console.error('查看调用几次player_chupai...');
        var self = this;

        cc.vv.gameMgr.chupai = pai;
        var seatData = cc.vv.gameMgr.userMap[seatIndex];
        console.log('出牌玩家 seatData: ');
        console.log(seatData);

        if (JSON.stringify(seatData) == '{}') {
            consol.log('seatData is {}');
        }

        if (seatData.holds.length > 0) {
            //断线重连且当前用户出牌被其他思考玩家操作阻断
            /* if (cc.vv.gameMgr.recFlag) {
                seatData.holds.push(pai);
                cc.vv.gameMgr.recFlag = null;
            } */
            var idx = seatData.holds.indexOf(pai);
            console.warn('传入的pai信息: ' + pai);
            console.warn('gameMgr中chupai: ' + cc.vv.gameMgr.chupai);
            console.warn('idx: ' + idx);
            if (idx >= 0) {
                console.warn('找得到那张才减少.');
                seatData.holds.splice(idx, 1);
            } else {
                console.warn('出的牌: ' + pai + '索引idx: 为' + idx);
            }

            console.log(seatData.holds);
        }
        cc.vv.gameMgr.recFlag = null;

        if (!seatData.folds) {
            console.warn('seatData.folds不存在');
            seatData.folds = [];
        }

        var localIndex = cc.vv.gameMgr.getLocalIndex(seatIndex);    //本地位置
        var cside = cc.vv.mahjongmgr.getSide(localIndex);
        if (kouFlag) {  //扣牌的话放入-1(上下) -2(左右)
            switch (cside) {
                case 'myself':
                    seatData.folds.push(-1);
                    break;
                case 'right':
                    seatData.folds.push(-2);
                    break;
                case 'up':
                    seatData.folds.push(-3);
                    break;
                case 'left':
                    seatData.folds.push(-4);
                    break;
            }
        } else {
            seatData.folds.push(pai);
            console.warn('push的牌为: ==================================' + pai);
        }
        console.warn(seatData.folds);
        var data = {
            seatData: seatData,
            pai: pai
        };
        //以下代码替换this.dispatchEvent('game_chupai_notify', data);
        console.warn(cc.vv.gameMgr.userMap);
        console.warn('【MJGame.js】---> player_chupai()... initFolds()...');
        self.node.getComponent('Folds').initFolds(data);

        self.hideChupai();
        if (seatData.kPos == cc.vv.gameMgr.seatIndex) {
            self.initMahjongs(seatData);
        } else {
            self.initOtherMahjongs(seatData);
        }
        self.showChupai();
        var audioUrl = cc.vv.mahjongmgr.getAudioURLByMJID(pai);
        cc.vv.audioMgr.playSFX(audioUrl);
    },

    player_tingpai: function (si, pai) {
        var self = this;
        self.node.getComponent('MJRoom').setTing(si);

        var localIndex = self.getLocalIndex(si);
        console.warn('听牌玩家位置...' + si);
        self.playEfx(localIndex, "play_ting");
        cc.vv.audioMgr.playSFX("nv/ting.mp3");
    },

    player_pengpai: function (seatIndex, pai) {
        var self = this;

        var seatData = cc.vv.gameMgr.userMap[seatIndex];
        //移除手牌
        if (seatData.holds) {
            for (var i = 0; i < 2; ++i) {
                var idx = seatData.holds.indexOf(pai);
                seatData.holds.splice(idx, 1);
            }
        }
        seatData.pengs.push(pai);

        //替换this.dispatchEvent('game_peng', seatData);
        self.hideChupai();

        if (seatData.kPos == cc.vv.gameMgr.seatIndex) {
            self.initMahjongs(seatData);
        } else {
            self.initOtherMahjongs(seatData);
        }
        var localIndex = self.getLocalIndex(seatData.kPos);
        self.playEfx(localIndex, "play_peng");
        cc.vv.audioMgr.playSFX("nv/peng.mp3");
        //添加碰牌效果
        self.node.getComponent('PengGangs').onPengGangChanged(seatData);
    },

    player_gangpai: function (si, pai, gangtype, respId) {

        console.log('分析doGang操作=====================================');
        var seatData = cc.vv.gameMgr.userMap[si];
        console.error(seatData);

        console.log('C:------杠牌类型gangtype:--------------' + gangtype);

        //if (gangtype == "wangang") {
        if (gangtype == 4 && respId == 61036) {  //弯杠即补杠,type=4. 碰牌后再摸到碰的牌，再杠它.
            console.log('------补杠(type = 4)-----------------------------------');
            if (seatData.pengs.indexOf(pai) != -1) {
                var idx = seatData.pengs.indexOf(pai);
                if (idx != -1) {
                    seatData.pengs.splice(idx, 1);
                }
            }
            seatData.wangangs.push(pai);
        }
        console.warn('此处if判断增加了.length');
        if (seatData.holds.length) {   //默认 
            for (var i = 0; i <= 4; ++i) {
                var idx = seatData.holds.indexOf(pai);
                if (idx == -1) {
                    //如果没有找到，表示移完了，直接跳出循环
                    break;
                }
                seatData.holds.splice(idx, 1);
            }
        }
        //if (gangtype == "angang") {
        if (gangtype == 3) {    //自己没碰过,摸到杠牌再杠
            console.warn('------暗杠(type = 3)-----------------------------------');
            seatData.angangs.push(pai);
        }
        //else if (gangtype == "diangang") {
        else if (gangtype == 4 && respId == 61039) {  //点杠即明杠,type=4.其他玩家打了一张你有点的三张一样的牌.
            console.warn(':------明杠(type = 4)-----------------------------------');
            seatData.diangangs.push(pai);
        }
        this.dispatchEvent('game_gang', { seatData: seatData, gangtype: gangtype });
    },

    player_hupai: function (seatIndex, pai, hutype) {
        var self = this;
        console.warn('【MJGame.js】--> player_hupai()...');
        /**
         * si: si,
            pai: pai,
            hutype: hutype,
            respId: 61039
         */
        //如果不是玩家自己，则将玩家的牌都放倒
        var localIndex = cc.vv.gameMgr.getLocalIndex(seatIndex);
        var hupai = self._hupaiTips[localIndex];
        hupai.active = true;

        var seatData = cc.vv.gameMgr.userMap[seatIndex];
        if (!seatData) {
            console.warn('11111111');
            return;
        }

        seatData.hued = true;
        if (hutype == 1) { //1 自摸
            hupai.getChildByName("sprHu").active = false;
            hupai.getChildByName("sprZimo").active = true;
            self.playEfx(localIndex, "play_zimo");
        } else if (hutype == 0) { //胡
            hupai.getChildByName("sprHu").active = true;
            hupai.getChildByName("sprZimo").active = false;
            self.playEfx(localIndex, "play_hu");
        }
        cc.vv.audioMgr.playSFX("nv/hu.mp3");

        if (hutype == 1) {
            if (seatData.kPos == cc.vv.gameMgr.seatIndex) {
                seatData.holds.pop();
                self.initMahjongs(seatData);
            }
            else {
                self.initOtherMahjongs(seatData);
            }
        }
    },

    player_auto_shoot: function (mjId) {
        var self = this;
        //自动出牌
        var mjNode = self._myMJArr[self._myMJArr.length - 1].node;

        mjNode.y = 0;
        //之前设置null导致有耗子牌的时候先牌消失,再耗子标记消失
        //mjNode.getComponent(cc.Sprite).spriteFrame = null;
        mjNode.active = false;
        mjNode.getChildByName('haozi').active = false;

        var data = {
            'kMId': 61035,
            'kType': 1,
            'kThink': [
                cc.vv.mahjongmgr.converId2Arr(mjId)
            ]
        };
        cc.vv.gameMgr.chupai_push(data);
        setTimeout(() => {
        }, 300);
    },

    game_ting: function (data) {
        //可以听牌,只能打kTingCards数组中的牌
        //需要将能有叫的牌设置为不可用
        console.error('【MJGame.js】---> game_ting()...');
        
        cc.vv.gameMgr.kTinged = true;
        var tingCards = data.tingCards;    //听牌后必须可以打出的牌,亮色.    //[{type: , pai: }]
        console.error(tingCards);

        var contains = function (arr, val) {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] == val) {
                    return true;
                }
            }
            return false;
        }

        var holds = cc.vv.gameMgr.userMap[cc.vv.gameMgr.seatIndex].holds;
        console.log(holds.length);
        console.log(holds);

        for (var i = 0; i < holds.length; i++) {
            var sprite = self._myMJArr[i + cc.vv.gameMgr.lackingNum];
            if (contains(tingCards, holds[i])) {     //位置为i的手牌可以打出.
                console.log('包含' + i);
                sprite.node.getComponent(cc.Button).interactable = true;
            } else {s
                sprite.node.getComponent(cc.Button).interactable = false;
            }
        }
    }
});
