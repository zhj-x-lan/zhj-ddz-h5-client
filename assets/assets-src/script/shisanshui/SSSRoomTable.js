var soundMngr = require('SoundMngr');
var RuleHandler = require('ruleHandler');
var RoomHandler = require('roomHandler');
var poker13 = require('../logic/poker13');
var errorCode = require('errorCode');

var SSSRoomTable =  cc.Class({
    extends: cc.Component,

    properties: {
        //tebleNode
        tableNode: {
            default: null,
            type: cc.Node
        },
        player: {
            default: [],
            type: [cc.Node]
        },
        poker_1: {
            default: null,
            type: cc.Node
        },
        poker_2: {
            default: null,
            type: cc.Node
        },
        poker_3: {
            default: null,
            type: cc.Node
        },
        poker_4: {
            default: null,
            type: cc.Node
        },
        poker_5: {
            default: null,
            type: cc.Node
        },
        roomId: {
            default: null,
            type: cc.Node
        },
        roundNum: {
            default: null,
            type: cc.Node
        },
        setBtn: {
            default: null,
            type: cc.Button
        },
        chatBtn: {
            default: null,
            type: cc.Button
        },
        VChatBtn: {
            default: null,
            type: cc.Button
        },
        ruleBtn: {
            default: null,
            type: cc.Button
        },
        readyBtn: {
            default: null,
            type: cc.Node
        },
        quitBtn: {
            default: null,
            type: cc.Node
        },
        upResetBtn: {
            default: null,
            type: cc.Node
        },
        midResetBtn: {
            default: null,
            type: cc.Node
        },
        downResetBtn: {
            default: null,
            type: cc.Node
        },
        animation: {
            default: null,
            type: cc.Node
        },
        startAnimation: {
            default: null,
            type: cc.Node
        },
        up: {
            default: null,
            type: cc.Node
        },
        mid: {
            default: null,
            type: cc.Node
        },
        down: {
            default: null,
            type: cc.Node
        },
        allScore: {
            default: null,
            type: cc.Node
        },
        waitNode: {
            default: null,
            type: cc.Node
        },
        jettonNode: {
            default: null,
            type: cc.Node
        },
        jetton: {
            default: null,
            type: cc.Node
        },
        specialPlayerName: {
            default: null,
            type: cc.Label
        },

        //neatenNode
        neatenNode: {
            default: null,
            type: cc.Node
        },
        poker: {
            default: null,
            type: cc.Node
        },
        cardHand: {
            default: null,
            type: cc.Node
        },
        upCardNode: {
            default: null,
            type: cc.Node
        },
        midCardNode: {
            default: null,
            type: cc.Node
        },
        downCardNode: {
            default: null,
            type: cc.Node
        },
        nodeMask: {
            default: null,
            type: cc.Node
        },
        promptScrollView: {
            default: null,
            type: cc.Node
        },
        selection: {
            default: null,
            type: cc.Node
        },
        disCardBtn: {
            default: null,
            type: cc.Button
        },
        reelectBtn: {
            default: null,
            type: cc.Button
        },
        cardGroup: {
            default: null,
            type: cc.Node
        },
        timeNode: {
            default: null,
            type: cc.Node
        },
        peculiarBtn: {
            default: null,
            type: cc.Button
        },

        //roomEndClear
        roomEndClear: {
            default: null,
            type: cc.Node
        },

        kaiguancao: cc.Node,
        kai: cc.Node,
        guan: cc.Node,
        timer: cc.Label
    },

    onLoad: function () {
        WriteLog("onLoad");
        this.declareParam();
        this.setMANNER(this._recommendManner.BTN_MANNER);

        //根据准备消息来控制自己的准备和退出房间按钮的显示
        this.readyBtnAndQuitBtnControl();

        this.showPlayers();
        this.showReady();

        registEvent('13-RoomBaseInfo', this, this.showPlayers);
        registEvent('13-GameStart',this,this.showCards);
        registEvent('onRoomReadyInfo',this,this.showReadyInfo);
        registEvent('13-ShowReadyUI', this, this.showReady);
        registEvent('13-PlayerCards', this, this.refreshCard);
        registEvent('13-RoomResult', this, this.showRoomResult);
        registEvent('13-Discard', this, this.showDisCardReady);
        registEvent('13-GameEnd', this, this.showGameEnd);
        registEvent('onJoinerLost', this, this.showJoinerLost);
        registEvent('onJoinerConnect', this, this.showJoinerConnect);
        registEvent('13-DiscardInfo', this, this.showConnectDisCardInfo);
        registEvent('13-SelfDiscard', this, this.showConnectDisCard);
        registEvent('againReady', this, this.againReady);

        this.onShow();
    },

    onShow: function() {
        WriteLog('onShow');

        this.clearArray(cardPoker13.up);
        this.clearArray(cardPoker13.mid);
        this.clearArray(cardPoker13.down);

        this.showPeculiarBtn(false);
        this.showWaitNode(true);
        this.showUpResetBtn(false);
        this.showMidResetBtn(false);
        this.showDownResetBtn(false);
        this.showNeatenNode(false);
        this.showRoomEndClear(false);

        this.registTouchEvent();
        this.setRoundNum();
        this.connectRecurrence();

        this._playerSex = GameData13.getPlayerSexByUid(GameData.player.uid);

        var disCardNode = cc.find('disCard', this.poker_1);
        disCardNode.y = this._disCardNodePosYList[0];
    },

    onDestroy: function() {
        WriteLog('onDestroy');

        unregistEvent('13-RoomBaseInfo', this, this.showPlayers);
        unregistEvent('13-GameStart',this,this.showCards);
        unregistEvent('onRoomReadyInfo', this, this.showReadyInfo);
        unregistEvent('13-ShowReadyUI', this, this.showReady);
        unregistEvent('13-PlayerCards', this, this.refreshCard);
        unregistEvent('13-RoomResult', this, this.showRoomResult);
        unregistEvent('13-Discard', this, this.showDisCardReady);
        unregistEvent('13-GameEnd', this, this.showGameEnd);
        unregistEvent('onJoinerLost', this, this.showJoinerLost);
        unregistEvent('onJoinerConnect', this, this.showJoinerConnect);
        unregistEvent('13-DiscardInfo', this, this.showConnectDisCardInfo);
        unregistEvent('13-SelfDiscard', this, this.showConnectDisCard);
        unregistEvent('againReady', this, this.againReady);

        this.unregistTouchEvent();
    },

    //注册触摸事件
    registTouchEvent: function() {
        
        this.promptScrollView.on('touch-up', this.lightFrame, this);

        this.upCardNode.on(cc.Node.EventType.TOUCH_START, this.startTouch, this);
        this.upCardNode.on(cc.Node.EventType.TOUCH_MOVE, this.moveTouch, this);
        this.upCardNode.on(cc.Node.EventType.TOUCH_END, this.endTouch, this);

        this.midCardNode.on(cc.Node.EventType.TOUCH_START, this.startTouch, this);
        this.midCardNode.on(cc.Node.EventType.TOUCH_MOVE, this.moveTouch, this);
        this.midCardNode.on(cc.Node.EventType.TOUCH_END, this.endTouch, this);

        this.downCardNode.on(cc.Node.EventType.TOUCH_START, this.startTouch, this);
        this.downCardNode.on(cc.Node.EventType.TOUCH_MOVE, this.moveTouch, this);
        this.downCardNode.on(cc.Node.EventType.TOUCH_END, this.endTouch, this);

        this.kaiguancao.on(cc.Node.EventType.TOUCH_START, this.onPauseEvent, this);
        this.kaiguancao.on(cc.Node.EventType.TOUCH_MOVE, function(){}, this);
        this.kaiguancao.on(cc.Node.EventType.TOUCH_END, function(){}, this);

        this.neatenNode.on(cc.Node.EventType.TOUCH_START, function(){}, this);
        this.neatenNode.on(cc.Node.EventType.TOUCH_MOVE, function(){}, this);
        this.neatenNode.on(cc.Node.EventType.TOUCH_END, function(){}, this);

        this.roomEndClear.on(cc.Node.EventType.TOUCH_START, function(){}, this);
        this.roomEndClear.on(cc.Node.EventType.TOUCH_START, function(){}, this);
        this.roomEndClear.on(cc.Node.EventType.TOUCH_START, function(){}, this);

        this.nodeMask.on(cc.Node.EventType.TOUCH_START, function(){}, this);
        this.nodeMask.on(cc.Node.EventType.TOUCH_START, function(){}, this);
        this.nodeMask.on(cc.Node.EventType.TOUCH_START, function(){}, this);
        
    },

    //注销触摸事件
    unregistTouchEvent: function() {
       
        this.promptScrollView.off('touch-up', this.lightFrame, this);

        this.upCardNode.off(cc.Node.EventType.TOUCH_START, this.startTouch, this);
        this.upCardNode.off(cc.Node.EventType.TOUCH_MOVE, this.moveTouch, this);
        this.upCardNode.off(cc.Node.EventType.TOUCH_END, this.endTouch, this);

        this.midCardNode.off(cc.Node.EventType.TOUCH_START, this.startTouch, this);
        this.midCardNode.off(cc.Node.EventType.TOUCH_MOVE, this.moveTouch, this);
        this.midCardNode.off(cc.Node.EventType.TOUCH_END, this.endTouch, this);

        this.downCardNode.off(cc.Node.EventType.TOUCH_START, this.startTouch, this);
        this.downCardNode.off(cc.Node.EventType.TOUCH_MOVE, this.moveTouch, this);
        this.downCardNode.off(cc.Node.EventType.TOUCH_END, this.endTouch, this);

        this.kaiguancao.off(cc.Node.EventType.TOUCH_START, this.onPauseEvent, this);
        this.kaiguancao.off(cc.Node.EventType.TOUCH_MOVE, function(){}, this);
        this.kaiguancao.off(cc.Node.EventType.TOUCH_END, function(){}, this);

        this.neatenNode.off(cc.Node.EventType.TOUCH_START, function(){}, this);
        this.neatenNode.off(cc.Node.EventType.TOUCH_MOVE, function(){}, this);
        this.neatenNode.off(cc.Node.EventType.TOUCH_END, function(){}, this);

        this.roomEndClear.off(cc.Node.EventType.TOUCH_START, function(){}, this);
        this.roomEndClear.off(cc.Node.EventType.TOUCH_MOVE, function(){}, this);
        this.roomEndClear.off(cc.Node.EventType.TOUCH_END, function(){}, this);

        this.nodeMask.off(cc.Node.EventType.TOUCH_START, function(){}, this);
        this.nodeMask.off(cc.Node.EventType.TOUCH_MOVE, function(){}, this);
        this.nodeMask.off(cc.Node.EventType.TOUCH_END, function(){}, this);
    },

    declareParam: function() {
        this._playerSex = 0;                           //玩家性别
        this._handSize = GameData13.handSize;          //最大手牌长度
        this._cardHandList = [];                       //手牌列表，列表里面的手牌对应现实当中的手牌位置，手牌为空的位置设为0，用于更新手排位置
        this._lastCardHand = [];                       //剩余手牌
        this._checkedCardList = [];                    //被选中的手牌
        this._cardRowList = [[], [], []];              //理牌列表，第一行三个牌，其余两行五个牌
        this._groupTypeList = [];                      //基础牌型选项列表
        this._firstScrollViewPos = 0;                  //scrollView的初始位置
        this._specialTypeOfPlayer = 0;                 //玩家自己的特殊牌型
        this._specialNum = 0;                          //当前特殊牌数量
        this._playSpecialNum = 0;                      //播放特殊动画次数
        this._roundAllScore = 0;                       //每局总分
        this._quanLeiDaGunScore = 0;                   //全垒打每枪分数
        this._gunNum = 0;                              //打枪次数
        this._shootCount = 0;                          //完成了第几次射击    
        this._specialAnimation;                        //特殊牌型动画
        this._playQuanLeiDaNum = 0;                    //播放全垒打次数
        this._jettonIndex = 0;                         //筹码索引
        this._jettonCount = 14;                        //筹码个数(暂时定为4个)
        this._winnerIndex = 0;                         //赢家索引
        this._gunAnimation;                            //打枪动画
        this._gunPlayerUid = [];                       //打枪的玩家
        this._holeList = [];                           //枪眼列表
        this._winnerToLoser = {winner: [], loser: []}; //赢家列表,输家列表
        this._gameTimer;                               //计时器
        this._disCardFunc;                             //比牌                           
        this._clearFunc;                               //小结算
        this._readyFunc;                               //开始下一局
        this._isDisCardEnd = false;                    //是否完成出牌
        this._isBiPaiEnd = false;                      //是否完成比牌
        this._isGunEnd = false;                        //是否打完枪
        this._isSpecialEnd = false;                    //是否播放完特殊牌型动画
        this._isClearEnd = false;                      //是否完成小结算动画
        this._isLoserClear = true;                     //输家动画播放状态（默认为已播放完成）
        this._isWinnerClear = true;                    //赢家动画播放状态（默认为已播放完成）
        this._isQuanLeiDa = false;                     //是否全垒打
        this._jettonList = [];                         //筹码列表

        this._disCardNodePosYList = [-25, -10, -10, -2, -7];

        this._specialName = ['couyise', 'liuduiban', 'quanda', 'quanxiao', 'sanhuangwudi', 
        'sanshunzi', 'santonghua', 'santonghuashun', 'shierhuangzu', 'wuduisantiao'];

        //推荐牌型方式，SCROLL_MANNER：滑块方式   BTN_MANNER：按钮方式
        this._recommendManner = { SCROLL_MANNER: 'scrollManner', BTN_MANNER: 'btnManner'};
        this._MANNER; 
    },

    initParam: function() {
       
        this.showPeculiarBtn(false);
        this.showWaitNode(false);
        this.showUpResetBtn(false);
        this.showMidResetBtn(false);
        this.showDownResetBtn(false);
        this.setRoundNum();
        this.concealAllSpecialTypeLabel();
        this.setJettonCount(14);

        //初始化部分參數
        if (moveCard.oneCard != 0) 
        {
            moveCard.oneCard = 0;
        }
        if (moveCard.towCard != 0) 
        {
            moveCard.towCard = 0;
        }

        this.clearArray(this._holeList);
        this.clearArray(this._gunPlayerUid);
        this.clearArray(this._groupTypeList);
        this.clearArray(this._jettonList);
        this.clearArray(GameData13.disCardPlayer);

        this._gunNum = 0;
        this._shootCount = 0;
        this._roundAllScore = 0;
        this._isDisCardEnd = false;
        //比牌状态一开始未未完成状态，因为是默认第一个折行的动画
        this._isBiPaiEnd = false;
        //动画的完成状态，一开始默认为完成状态，如果往后发现有该动画播放，则初始化为未完成状态
        this._isGunEnd = true;
        this._isSpecialEnd = true;
        this._isClearEnd = true;
        this._isLoserClear = true;                    //输家动画播放状态
        this._isWinnerClear = true;                   //赢家动画播放状态

        this._isQuanLeiDa = false;
        this._specialTypeOfPlayer = 0;
        this._specialNum = 0;
        this._playSpecialNum = 0;
        this._gunAnimation;
        this._specialAnimation;
        this._specialPoker = 0;
        this._quanLeiDaGunScore = 0;
        this._playQuanLeiDaNum = 0;
        this._jettonIndex = 0;
        this._winnerIndex = 0;

        //每局开始前清空结果对象，防止断线重连出问题
        GameData13.clearObject(GameData13.roomResult);
    },

    //更新_cardHandList,把所有手牌放到_cardHandList中
    refreshCard:function() {

        this.clearArray(this._cardHandList);

        if ((this._cardHandList = GameData13.getCardHand(GameData.player.uid)) == 0) 
        {
            return;
        }
        cc.log('cardHand: ', JSON.stringify( this._cardHandList));
        if (this._cardHandList.length == this._handSize) 
        {
            this.showCardHand(); //手牌显示
        }
        else 
        {
            cc.log('手牌数量小于或大于'+this._handSize+'个!');
        }
    },

    refreshRecommendType: function() {
    
        var array = [];
        var pokerTypeObj = {};
        for (var i = 0; i < this._lastCardHand.length; i++)
        {
            array.push(this._lastCardHand[i].card);
        }
        var poker = new poker13(array);
        for (var key in RecommendType)
        {
            pokerTypeObj = poker.getPokerTypeCards(array.length, RecommendType[key]);
        }
        poker.clearPokerTypeList();

        var parent = cc.find('pokerType', this.cardGroup);
        for (var key in RecommendType)
        {
            var node = cc.find(key, parent);
            var btn = node.getComponent(cc.Button);
            if (pokerTypeObj[key].length == 0)
            {
                btn.interactable = false;
            }
            else 
            {
                btn.interactable = true;
            }
        }

        var promptCard = this.node.getComponent('SSSPromptCard');
        promptCard.initPromptData(pokerTypeObj, this._cardHandList);

        // cc.log('推荐牌型: ', JSON.stringify(pokerTypeObj));
    },

    //更新被选中的手牌列表
    refreshCheckedCards: function() {
        this.clearArray(this._checkedCardList);
        for (var i = 0; i < this._cardHandList.length; i++) 
        {
            var node = cc.find('card'+i, this.cardHand);
            if (node.getComponent('SSSCard').isSelect == true && node.active == true) 
            {
                this._checkedCardList.push({
                    card: this._cardHandList[i], 
                    cardId: i
                });
            }
        }
    },

    //更新_lastCardHand
    refreshLastCard: function() {
        this._lastCardHand = [];
        var index = 0;
        for (var i = 0; i < this._handSize; i++) 
        {
            var node = cc.find('card'+i, this.cardHand);
            if (node.active == true) 
            {
                this._lastCardHand[index] = {
                    card: this._cardHandList[i], 
                    id: i
                };
                index++;
            }
        }
    },

    initCardStatus: function() {
        for (var i = 0; i < this.cardHand.childrenCount; i++) 
        {
            var node = cc.find('card'+i, this.cardHand);
            var card = node.getComponent("SSSCard");
            if (card.isSelect == true) 
            {
                card.isSelect = false;
                node.y = 0;
            }
        }
    },

    //初始化推荐牌型选项ui
    initGroupType: function() {
        WriteLog('initGroupType');
        var index = 0;
        var groupTypeNum;

        if (GameData13.player.recommend) 
        {
            groupTypeNum = GameData13.player.recommend.length;
        }
        var space = 50; //两个groupType的间距
        var distance; //两个groupType锚点的距离

        var node = cc.find('view/content', this.promptScrollView);
        if (node.childrenCount > 0) 
        {
            node.removeAllChildren(true);
        }
        var self = this;
        this._firstScrollViewPos = this.promptScrollView.getComponent(cc.ScrollView).getContentPosition(); //存储ScrollView初始位置

        for (var i = 0; i < groupTypeNum; i++)
        {
            cc.loader.loadRes('shisanshui/prefab/groupType', function(err, prefab)
            {
                if (err) 
                {
                    cc.log('err: ',err);
                    return;
                }
                var newNode = cc.instantiate(prefab);
                node.addChild(newNode);

                self._groupTypeList[self._groupTypeList.length] = newNode;
                distance = newNode.getContentSize().width + space;
                node.setContentSize(cc.size(2*(groupTypeNum+1) * distance , newNode.getContentSize().height + 10));
                self.scrollViewSize = node.getContentSize();

                var groupNode = newNode.getComponent('groupType');
                groupNode.id = index;
                groupNode.showRecommend(GameData13.player.recommend);
                newNode.x = distance * index;

                ++index;
            });
        }
    },

    initDisPos: function(show) {
        var iconUrl = "resources/shisanshui/cardUI/Poker_back.png";

        for (var i = 0; i < GameData13.joiners.length; i++) 
        {
            var seat = GameData13.getPosition(GameData13.joiners[i].uid);
            var node = cc.find('poker_'+seat, this.tableNode);
            var zhipai = cc.find('zhipai',node);
            var disCardNode = cc.find('poker_'+seat+'/disCard', this.tableNode);
            disCardNode.y = this._disCardNodePosYList[seat - 1];

            for (var j = 0; j < this._handSize; j++) 
            {
                var card = cc.find('card'+j, zhipai);
                this.setTexture(iconUrl, card);
            }
            zhipai.active = show;
        }
    },

    //排列手牌列表并返回手牌数
    sortCardHandList: function() {
        var tempList = [];

        for (var i = 0; i < this._cardHandList.length; i++) 
        {
            if (this._cardHandList[i] != 0) 
            {
                tempList[tempList.length] = this._cardHandList[i];
            }
        }
        for (var i = 0; i < tempList.length; i++) 
        {
            tempList[i].value = tempList[i].value * 50;
            tempList[i].type = tempList[i].type + tempList[i].value;
        }
        
        //排列手牌
        tempList.sort(function(a, b) 
        {
            return b.type - a.type;
        });

        for (var i = 0; i < tempList.length; i++) 
        {
            tempList[i].type = tempList[i].type - tempList[i].value;
            tempList[i].value = tempList[i].value / 50;
        }
        this.clearArray(this._cardHandList);
        for (var j = 0; j < this._handSize; j++) 
        {
            if (j < tempList.length) 
            {
                this._cardHandList[j] = tempList[j];
                continue;
            }
            this._cardHandList[j] = 0;
        }
        return tempList.length;
    },

    //调整手牌列表手牌的位置
    sortCardHand: function() {
        var list_len = this.sortCardHandList();

        var sub = GameData13.handSize - list_len;
        var len = Math.floor(sub / 2);

        for (var i = 0; i < list_len; i++) 
        {
            if (len == 0) 
            {
                break;
            }
            var index = 1;
            var pos = list_len - i;
            while(index <= len)
            {
                this._cardHandList[pos] = this._cardHandList[pos - 1];
                this._cardHandList[pos - 1] = 0;

                pos++;
                index++;
            }
        }
    },

    //显示手牌
    showCardHand: function(){
        WriteLog('showCardHand');

        var str = "resources/shisanshui/cardUI";
        this.sortCardHand();

        for (var i = 0; i < this._cardHandList.length; i++)
        {
            var cardNode = cc.find('card'+i, this.cardHand);

            if (this._cardHandList[i] != 0) 
            {
                cardNode.active = true;
                var iconUrl = str + "/" + (this._cardHandList[i].value+1) + '_' + (this._cardHandList[i].type+1) + ".png";
                this.setTexture(iconUrl, cardNode);
            }
            else 
            {
                cardNode.active = false;
            }
        }
        this.refreshLastCard();
        if (this._lastCardHand.length == 0) 
        {
            this.showCardHandLayer(false);
            if (this._MANNER == this._recommendManner.BTN_MANNER)
            {
                this.showCardGroupLayer(false);
            }
            return;
        }
        this.refreshRecommendType();
    },

    showSpecialType: function(type) {
        var self = this;
        if (type > 0)
        {
            this.showPeculiarBtn(true);
            var okFunc =function() {
                SSSHandler.getInstance().requestDiscard({}, type, function(res){
                    self._specialTypeOfPlayer = type;
                    var specialTypeHint = cc.find('zhipai/specialType', self.poker_1);
                    specialTypeHint.active = true;
                    self.clearCardType();
                });
            }
            for (var _type in SpecialType)
            {
                if(SpecialType[_type].id == type)
                {
                    poker13MessageBox('', SpecialType[_type].name, ',预计赢取每家'+SpecialType[_type].score, okFunc, function() {});
                    return;
                }
            }

        }
    },

    showPlayers: function() {
        this.showHead();
        this.setRoomNum(GameData.player.roomid);
    },

    showName: function(label, name) {
        if (isChinese(name)) 
        {
            label.string = getShortStr(name, 4);
        }
        else if (!isChinese(name)) 
        {
            label.string = getShortStr(name, 8);
        }
    },

    showHead: function() {
        var name, score;

        for (var i = 0; i < this.player.length; i++)
        {
            this.player[i].setLocalZOrder(2);
        }

        for (var key = 0; key < this.player.length; key++) {
            this.player[key].active = false;
        }

        for (var i = 0; i < GameData13.joiners.length; i++)
        {
            var ready = cc.find('ready', this.player[GameData13.getPosition(GameData13.joiners[i].uid) - 1]);

            var player = this.player[GameData13.getPosition(GameData13.joiners[i].uid) - 1];
            player.active = true;

            var head = cc.find('head', player);
            var headimgurl = GameData13.joiners[i].headimgurl;

            //设置头像
            this.setPlayerHead(head,headimgurl);

            this.showOwner(player, GameData13.joiners[i].uid);

            this.showLost(player, GameData13.joiners[i].status);

            name = cc.find('name', player);
            score = cc.find('score', player);
            score.getComponent(cc.Label).string = 0;
            
            this.showName(name.getComponent(cc.Label), GameData13.joiners[i].name);

            var button = player.getChildByName('button');
            button.setTag( GameData13.joiners[i].uid );
        }
    },

    setPlayerHead:function(head,headimgurl){
        if ( head == undefined
            || headimgurl == undefined
            || headimgurl == '')
        {
            return;
        }
        var headIcon = head.getComponent(cc.Sprite);
        cc.loader.load({url: headimgurl, type: 'png'}, function (error, texture) {
            if (!error && texture && headIcon) 
            {
                headIcon.spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },

    showOwner: function(player, uid) {
        cc.find('owner', player).active = false;
        if(uid == GameData13.owner) 
        {
            cc.find('owner', player).active = true;
        }
    },

    showLost: function(player, status) {
        cc.find('lost',player).active = false;
        if(status == 2)
        {
            cc.find('lost',player).active = true;
        }
    },

    showHeadScore: function() {
        //显示玩家头像总分
        for (var key = 0; key < GameData13.joiners.length; key++) {
            var uid = GameData13.joiners[key].uid;
            var player = this.player[GameData13.getPosition(uid) - 1];
            var score = cc.find('score', player);
            if (GameData13.playerAllScore[uid]) 
            {   
                score.getComponent(cc.Label).string = GameData13.playerAllScore[uid];
                this.scaleEffectsOfNode(score, 2, 2, 1, 1, 0.3, function(){});
            }
            else 
            {
                if (!GameData13.isEmptyObject(GameData13.allScores)) 
                {    
                    score.getComponent(cc.Label).string = GameData13.allScores[uid];
                    this.scaleEffectsOfNode(score, 2, 2, 1, 1, 0.3, function(){});
                }  
            }
        }
    },

    showReadyInfo: function() {
        WriteLog('showReadyInfo');

        for (var i = 0; i < GameData13.joiners.length; i++)
        {
            if (GameData.game.onRoomReadyInfo.data[GameData13.joiners[i].uid] == true)
            {
                var index = GameData13.getPosition(GameData13.joiners[i].uid);
                var ready = cc.find('ready', this.player[index - 1]);
                ready.active = true;
            }
        }
    },

    showReady: function() {
        WriteLog('showReady');

        for (var i = 0; i < GameData13.joiners.length; i++)
        {
            if (GameData13.readyInfo[GameData13.joiners[i].uid] == true)
            {
                var index = GameData13.getPosition(GameData13.joiners[i].uid);
                var ready = cc.find('ready', this.player[index - 1]);
                ready.active = true;
            }
        }

        //根据准备消息来控制自己的准备和退出房间按钮的显示
        this.readyBtnAndQuitBtnControl();
    },

    /**
     * 顯示手牌
     */
    showCards: function() {
        WriteLog('showCards');
        this.initParam();

        //开始动画，发牌动画，显示手牌
        var isGameEnd = GameData13.game.roundNum > GameData13.room.roundmax;
        if (!isGameEnd)
        {
            var self = this;
            var callback1 = function() {
        
                self.startAnimation.active = true;
                self.playAnimation(AnimateType.Start, self.startAnimation);
            }
            var callback2 = function() {
                self.startAnimation.active = false;
                soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_7);

                for (var i = 0; i < GameData13.joiners.length; i++) 
                {
                    var seat = GameData13.getPosition(GameData13.joiners[i].uid);
                    var node = cc.find('poker_'+seat+'/fapai', self.tableNode);
                    node.active = true;
                    self.dealAction(i);
                    var player = self.player[GameData13.getPosition(GameData13.joiners[i].uid) - 1];
                    var ready = cc.find('ready', player);
                    ready.active = false;
                }
            }
            var callback3 = function() {
               
                self.showNeatenNode(true);
                self.checkedRecommendManner();
                if (GameData.player.uid == GameData13.player.uid) 
                {
                    self.showSpecialType(GameData13.player.type);  //特殊牌型显示
                }
            }
            var CallFunc1 = cc.callFunc(callback1, this);
            var delayTime = cc.delayTime(1);
            var CallFunc2 = cc.callFunc(callback2, this);
            var CallFunc3 = cc.callFunc(callback3, this);
            var seq = cc.sequence(CallFunc1, delayTime, CallFunc2, delayTime, CallFunc3);
            this.tableNode.runAction(seq);
        }
    },

    //理牌界面的那三行的触摸事件,把选中的牌放到上面的三个空行中
    //row:_cardRowList下标, parent:哪一行，len:这行可以放置的扑克数
    showCardRow: function(row, parent, len) {
        WriteLog('showCardRow');

        var str = "resources/shisanshui/cardUI";
        var index = 0;
        var null_len = len - cardPoker13[row].length;   //该行空格还有多少个

        if (null_len < this._checkedCardList.length) 
        {
            createSSSMoveMessage('空位不足');
            return;
        }

        for (var i = cardPoker13[row].length; i < len; i++) 
        {
            if (index >= this._checkedCardList.length) 
            {
                break;
            }
            var cardNode = cc.find('card'+i, parent);
            this.hideCardMask(cardNode);

            cardNode.scaleX = 0.8515;
            cardNode.scaleY = 0.8515;

            var iconUrl = str+"/"+(this._checkedCardList[index].card.value+1) + '_' + (this._checkedCardList[index].card.type+1)+".png";
            this.setTexture(iconUrl, cardNode);

            cardPoker13[row][i] = this._checkedCardList[index].card;
            index++;
        }
        
        this.setCheckedCardStatus();
        this.initCardStatus();

        if (null_len >= this._checkedCardList.length) 
        {
            this.showCardHand();
        }
        if (cardPoker13[row].length > 0) 
        {
            if (row == 'up') 
            {
                this.showUpResetBtn(true);
            }
            else if (row == 'mid') 
            {
                this.showMidResetBtn(true);
            }
            else if (row == 'down') 
            {
                this.showDownResetBtn(true);
            }
        }
        if (cardPoker13['up'].length == 3 && cardPoker13['mid'].length == 5 && cardPoker13['down'].length == 5)
        {
            this.showSelection(true);
        }
        this.clearArray(this._checkedCardList);
        return;
    },

    /**
     * 隐藏卡牌遮罩
     */
    hideCardMask: function(cardNode) {
        var cardMask = cc.find('cardMask', cardNode);
        cardMask.active = false;
    },

    /**
     * 设置选中卡牌状态
     */
    setCheckedCardStatus: function() {
        if (this._checkedCardList.length <= 0)
        {
            return;
        }
        for (var i = 0; i < this._checkedCardList.length; i++) 
        {
            var cardNode = cc.find('card'+this._checkedCardList[i].cardId, this.cardHand);

            this.hideCardMask(cardNode);
            cardNode.active = false;

            cardNode.getComponent(cc.Sprite).spriteFrame = null;
            this._cardHandList[this._checkedCardList[i].cardId] = 0;
        }
    },

    /**
     * 显示置牌
     * @param uid{Number}:玩家id
     * @param row{String}:第几行牌,up:首墩  mid:中墩  down:尾墩
     * @param cards{Array}:手牌
     */
    showDisCard: function(uid, row, cards) {
        WriteLog("showDisCard");

        var index;
        var str = "resources/shisanshui/cardUI";
        var seat = GameData13.getPosition(uid); //玩家座位
        var idx = GameData13.getDisCardRow(row); //第几墩
        var node = cc.find('poker_'+seat+'/zhipai', this.tableNode);
        if (idx == 1) index = 0;
        else index = 3 + 5 * (idx - 2);

        if (idx == 1) 
        {
            for (var i = index; i < 3; i++)
            {
                var disCard = cards[i];
                var card = cc.find('card'+i, node);
                var iconUrl = str + "/" + (disCard.value+1) + '_' + (disCard.type+1) + ".png";
                this.setTexture(iconUrl, card);
            }
        }
        else 
        {
            for (var i = index; i < 5 + index; i++) 
            {
                var disCard = cards[i - index];
                var card = cc.find('card'+i, node);
                var iconUrl = str + "/" + (disCard.value+1) + '_' + (disCard.type+1) + ".png";
                this.setTexture(iconUrl, card);
            }
        }
    },

    showRoomResult: function() {
        WriteLog('showRoomResult');
        var self = this;
        var index = 0; //joiners索引
        var num_contrast = 1;   //比牌次数

        var cardNode = cc.find('zhipai', this.poker_1);
        for (var i = 0; i < this._handSize; i++) 
        {
            var card = cc.find('card'+i, cardNode);
            var texture = cc.textureCache.addImage(cc.url.raw("resources/shisanshui/cardUI/Poker_back.png"));
            card.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        }

        var playerCards = {
            up: [],
            mid: [],
            down: [],
        };

        for (var i = 0; i < GameData13.joiners.length; i++) 
        {
            if (GameData13.roomResult.result.ret[GameData13.joiners[i].uid].special.type == 0) 
            {
                playerCards.up.push({
                    uid: GameData13.joiners[i].uid, 
                    type: GameData13.roomResult.cards[GameData13.joiners[i].uid].up.type
                });
                playerCards.mid.push({
                    uid: GameData13.joiners[i].uid, 
                    type: GameData13.roomResult.cards[GameData13.joiners[i].uid].mid.type
                });
                playerCards.down.push({
                    uid: GameData13.joiners[i].uid, 
                    type: GameData13.roomResult.cards[GameData13.joiners[i].uid].down.type
                });
            }
        }

        //排列普通牌型
        playerCards.up.sort(function(a,b) { return a.type - b.type; });
        playerCards.mid.sort(function(a,b) { return a.type - b.type; });
        playerCards.down.sort(function(a,b) { return a.type - b.type; });

        //比牌 
        //row: 'up', 'mid', 'down';   parent: this.up, this.mid, this.down
        var notSpecial = true;
        var contrastCard = function(row, parent, idx, m) {
            var uid = playerCards[row][idx].uid;
            
            self.disCardAction(uid, row);
            if (num_contrast == m && self._specialTypeOfPlayer == 0) 
            {
                self.showScore(parent);
            }
        }

        var timeCallback = function(dt) {
           
            if (index >= GameData13.room.joinermax - self._specialNum) index = 0;
            if (num_contrast <= (GameData13.room.joinermax - self._specialNum))
            {  
                //第一轮比牌
                contrastCard('up', self.up, index, GameData13.room.joinermax - self._specialNum);
            }
            else if (num_contrast > GameData13.room.joinermax - self._specialNum && num_contrast <= (GameData13.room.joinermax*2 - self._specialNum*2))
            { 
                //第二轮比牌
                contrastCard('mid', self.mid , index, GameData13.room.joinermax*2 - self._specialNum*2);
            }
            else if (num_contrast > GameData13.room.joinermax*2 - self._specialNum*2 && num_contrast <= (GameData13.room.joinermax*3 - self._specialNum*3))
            { 
                //第三轮比牌
                contrastCard('down', self.down, index, GameData13.room.joinermax*3 - self._specialNum*3);
            }
            else if (num_contrast > GameData13.room.joinermax*3 - self._specialNum*3) 
            {
                //设置动画的播放状态
                self._isBiPaiEnd = true;
                if (self._gunNum > 0) 
                {
                    self._isGunEnd = false;
                }
                else if (self._specialNum > 0) 
                {
                    self._isSpecialEnd = false;
                }
                else 
                { 
                    self._isClearEnd = false;
                }

                for (var i = 0; i < self._handSize; i++) 
                {
                    var node = cc.find('card'+i, self.cardHand);
                    node.getComponent("SSSCard").isSelect = false;
                    node.y = 0;
                }

                self.clearArray(self._lastCardHand);
                self.clearArray(self._cardHandList);
                self.clearArray(self._cardRowList[0]);
                self.clearArray(self._cardRowList[1]);
                self.clearArray(self._cardRowList[2]);
                self.unschedule(timeCallback);
                self.concealAllSpecialTypeLabel();
                self.gameAnimation(); //如果有比牌动画，必须要走这里，以执行别的动画
            }
            ++index;
            ++num_contrast;
        }
        this.playRoomAnimate(timeCallback);
    },

    /**
     * 分數動畫效果
     */
    showScore:function(parent) {
        WriteLog('showScore');
        var self = this;
        var cardScore;
        var base = cc.find('base', parent);
        var extra = cc.find('extra', parent);

        parent.active = true;
        if (parent == this.up) 
        {
            cardScore = GameData13.roomResult.result.ret[GameData.player.uid].up;
        }
        else if (parent == this.mid) 
        {
            cardScore = GameData13.roomResult.result.ret[GameData.player.uid].mid;
        }
        else if (parent == this.down) 
        {
            cardScore = GameData13.roomResult.result.ret[GameData.player.uid].down;
        }
        this.playerRoundAllScore(cardScore.base);
        this.playerRoundAllScore(cardScore.extra);
        if (cardScore.base >= 0)
        {
            this.scaleEffectsOfNode(base, 1.5, 1.5, 1, 1, 0.3, function(){
                base.getComponent(cc.Label).string = '+' + cardScore.base;
            });
        }
        else 
        {
            this.scaleEffectsOfNode(base, 1.5, 1.5, 1, 1, 0.3, function(){
                base.getComponent(cc.Label).string = cardScore.base;
            });
        }
        if (cardScore.extra >= 0) 
        {
            this.scaleEffectsOfNode(extra, 1.5, 1.5, 1, 1, 0.3, function(){
                extra.getComponent(cc.Label).string = '(' + '+'+cardScore.extra + ')';
            });
        }
        else 
        {
            this.scaleEffectsOfNode(extra, 1.5, 1.5, 1, 1, 0.3, function(){
                extra.getComponent(cc.Label).string = '(' + cardScore.extra + ')';
            });
        }
        this.showRoundAllScore();
    },

    /**
     * 顯示每局的總分
     */
    showRoundAllScore: function() {
        var self = this;
        this.allScore.active = true;
        if (this._roundAllScore >= 0) 
        {
            this.scaleEffectsOfNode(this.allScore, 1.5, 1.5, 1, 1, 0.3, function(){
                self.allScore.getComponent(cc.Label).string = '总分:' + '+' + self._roundAllScore;
            });
        }
        else 
        {
            this.scaleEffectsOfNode(this.allScore, 1.5, 1.5, 1, 1, 0.3, function(){
                self.allScore.getComponent(cc.Label).string = '总分:' + self._roundAllScore;
            });
        }
    },

    /**
     * 全壘打每一槍的分數
     */
    quanLeiDaGunScoreByUid: function(uid) {
        var upScore = GameData13.roomResult.result.ret[uid].up;
        var midScore = GameData13.roomResult.result.ret[uid].mid;
        var downScore = GameData13.roomResult.result.ret[uid].down;
        this._quanLeiDaGunScore = (upScore.base + upScore.extra + midScore.base + midScore.extra + downScore.base + downScore.extra) / 2;
    },

    //确定打枪次数和玩家
    numuberOfShots: function() {
        for (var uid in GameData13.roomResult.result.ret) 
        {
            if (GameData13.roomResult.result.ret[uid].gun.length > 0) 
            {
                for (var i = 0; i < GameData13.roomResult.result.ret[uid].gun.length; i++) 
                {
                    this._gunNum++;
                    this._gunPlayerUid[this._gunPlayerUid.length] = {shoot: uid, target: GameData13.roomResult.result.ret[uid].gun[i]};
                }
            }
        }
    },

    /**
     * 枪口角度
     */
    angularByCoord : function(coord1, coord2) {
        var x = coord1.x - coord2.x;
        var y = coord1.y - coord2.y;
        //八个方位
        if (x < 0 && y < 0) { return 0 - Math.atan( Math.abs(y) / Math.abs(x) ); }
        else if (x > 0 && y < 0) { return Math.atan( Math.abs(y) / Math.abs(x) ); }
        else if (x < 0 && y > 0) { return Math.atan( Math.abs(y) / Math.abs(x) ); }
        else if (x > 0 && y > 0) { return 0 - Math.atan( Math.abs(y) / Math.abs(x) ); }
        else if (x > 0 && y == 0) { return Math.atan( Math.abs(y) / Math.abs(x) ); }
        else if (x < 0 && y == 0) { return Math.atan( Math.abs(y) / Math.abs(x) ); }
        else if (x == 0 && y > 0) 
        {
            if (coord1.x < 0) 
            { 
                return Math.atan( Math.abs(y) / Math.abs(x) ); 
            }
            else if (coord1.x > 0) 
            {
                    return 0 - Math.atan( Math.abs(y) / Math.abs(x) ); 
            }
        }
        else if (x == 0 && y < 0) 
        {
            if (coord1.x < 0) 
            { 
                return 0 - Math.atan( Math.abs(y) / Math.abs(x) ); 
            }
            else if (coord1.x > 0) 
            { 
                return Math.atan( Math.abs(y) / Math.abs(x) ); 
            }
        }
        return 0;
    },

    /**
     * 确定特殊牌型玩家
     */
    calculateSpecialPlayer: function() {
        var specialList = [];
        for (var uid in GameData13.roomResult.cards) 
        {
            if (GameData13.roomResult.cards[uid].special > 0) 
            {
                this._specialNum++;

                var seat = GameData13.getPosition(uid);
                var specialTypeHint = cc.find('poker_'+seat+'/zhipai'+'/specialType', this.tableNode);
                specialTypeHint.active = true;

                for (var _type in SpecialType) 
                {
                    if (SpecialType[_type].id == GameData13.roomResult.cards[uid].special) 
                    {
                        var node = cc.find(_type, this.animation);
                        specialList.push({
                            id: SpecialType[_type].id, 
                            type: _type, node: node, 
                            uid: uid, 
                            score: SpecialType[_type].score
                        });
                        break;
                    }
                }
            }
        }
        specialList.sort(function(a,b) { return a.id - b.id; });
        return specialList;
    },

    /**
     * 确定全垒打玩家
     */
    calculateQuanLeiDaPlayer: function() {
        var specialList = [];
        if (GameData13.roomResult.result.homeRun != 0 && GameData13.room.joinermax > 2) 
        {
            this._isQuanLeiDa = true;
            this.quanLeiDaGunScoreByUid(GameData13.roomResult.result.homeRun);
            var node = cc.find('QuanLeiDa', this.animation);
            specialList.push({
                id: SpecialType['QuanLeiDa'].id, type: 'QuanLeiDa', 
                node: node, 
                uid: GameData13.roomResult.result.homeRun, 
                scpre: 0
            });
        }
        return specialList;
    },

    /**
     * 枪机射击角度
     */
    getShootAngular: function() {
        var angular = [];
        if (this._gunNum > 0) 
        {
            for (var i = 0; i < this._gunPlayerUid.length; i++) 
            {
                var coord1 = this.player[GameData13.getPosition(this._gunPlayerUid[i].shoot) - 1].getPosition();
                var coord2 = this.player[GameData13.getPosition(this._gunPlayerUid[i].target) - 1].getPosition();
                angular.push(this.angularByCoord(coord1, coord2) / 3.14159 * 180); //弧度转换角度
            }
        }
        return angular;
    },

    /**
     * 從這裡開始播放動畫
     */
    playRoomAnimate: function(timeCallback) {
        WriteLog('playRoomAnimate');
        var self = this;
        var specialList = [];
        var angular = [];
        var isGameEnd = GameData13.game.roundNum == GameData13.room.roundmax;

        //确定打枪次数和玩家
        this.numuberOfShots();

        //全垒打
        specialList = this.calculateQuanLeiDaPlayer();

        //枪口角度
        angular = this.getShootAngular();

        if (!this._isQuanLeiDa) 
        {
            specialList = this.calculateSpecialPlayer();
        }
        if (this._specialNum == GameData13.room.joinermax) 
        {
            this._isSpecialEnd = false;
        }
        cc.log('quanLeiDa: ', this._isQuanLeiDa);
        cc.log('_gunNum: ', this._gunNum);
        cc.log('_specialNum: ', this._specialNum);

        var disCardFunc = function() {
            if (self._specialNum != GameData13.room.joinermax) 
            {
                soundMngr.instance.playSSSSpeakAudio(SSS_SpeakAudioType.Start, self._playerSex);
                self.schedule(timeCallback, 1.2);
            }
        }
        this._disCardFunc = disCardFunc;

        //播放打枪动画
        this.showGunAnimation(angular);

        //播放特殊牌型动画
        this.showSpecialAnimation(specialList);
       
        //结算动画
        var clearFunc = function() {
            self.showClearAnimation();
        }
        this._clearFunc = clearFunc;

        var playerReadyFunc = function() {
            self._specialNum = 0;  //从新初始化拥有特殊牌人数
            if (isGameEnd) 
            {
                self.showGameEnd(1);
            }
            else 
            {
                // self.ready();
                sendEvent('againReady');
            }
        }
        this._readyFunc = playerReadyFunc;

        this.gameAnimation();
    },

    /**
     * 游戏角度
     */
    gameAnimation: function() {
        WriteLog('gameAnimation');
        if (this._specialNum < GameData13.room.joinermax && this._isDisCardEnd && !this._isBiPaiEnd) 
        {
            this._disCardFunc();
        }
        else if (this._shootCount < this._gunNum && !this._isGunEnd) 
        {
            soundMngr.instance.playSSSSpeakAudio(SSS_SpeakAudioType.DaQiang, this._playerSex);
            this._gunAnimation();
        }
        else if (this._playSpecialNum < this._specialNum && !this._isSpecialEnd && !this._isQuanLeiDa) 
        {
            this._specialAnimation();
        }
        else if (!this._isSpecialEnd && this._isQuanLeiDa) 
        {
            this._specialAnimation();
        }
        else if (!this._isClearEnd && this._isBiPaiEnd) 
        {
            this._clearFunc();
        }
        else if (this._gunNum > 0 && this._specialNum <= 0 && !this._isQuanLeiDa) 
        {
            if (this._isGunEnd && this._isBiPaiEnd && this._isClearEnd) 
            {
                this._readyFunc();
            }
        }
        else if (this._gunNum >0 && this._specialNum > 0) 
        {
            if (this._isGunEnd && this._isSpecialEnd && this._isBiPaiEnd && this._isClearEnd) 
            {
                this._readyFunc();
            }
        }
        else if (this._gunNum <= 0 && this._specialNum > 0) 
        {
            if (this._isSpecialEnd && this._isBiPaiEnd && this._isClearEnd) 
            {
                this._readyFunc();
            }
        } 
        else if (this._gunNum <= 0 && this._specialNum <= 0) 
        {
            if (this._isBiPaiEnd && this._isDisCardEnd && this._isClearEnd) 
            {
                this._readyFunc();
            }
        }
        else if (this._gunNum > 0 && this._isQuanLeiDa) 
        {
            if (this._isBiPaiEnd && this._isDisCardEnd && this._playQuanLeiDaNum == 1 && this._isClearEnd) 
            {
                this._readyFunc();
            }
        }
    },

    /**
     * 打槍分數
     * @param shootCount{Number}:射擊次數
     */
    showGunScore: function(shootCount) {
        
        if (this._gunPlayerUid[shootCount].shoot == GameData.player.uid) 
        {
            for (var key in GameData13.roomResult.result.ret[GameData.player.uid].playerList) 
            {
                if (this._gunPlayerUid[shootCount].target == key) 
                {
                    if (this._isQuanLeiDa) 
                    {
                        this.playerRoundAllScore(this._quanLeiDaGunScore);
                    }
                    else if (!this._isQuanLeiDa) 
                    {
                        this.playerRoundAllScore(GameData13.roomResult.result.ret[GameData.player.uid].playerList[key].score / 2);
                    }
                    break;
                }
            }
            this.showRoundAllScore();
        }
        else if (this._gunPlayerUid[shootCount].target == GameData.player.uid)
        {
            for (var key in GameData13.roomResult.result.ret[GameData.player.uid].playerList)
            {
                if (this._gunPlayerUid[shootCount].shoot == key)
                {
                    if (this._isQuanLeiDa) 
                    {
                        this.playerRoundAllScore(0 - this._quanLeiDaGunScore);
                    }
                    else if (!this._isQuanLeiDa) 
                    {
                        this.playerRoundAllScore(GameData13.roomResult.result.ret[GameData.player.uid].playerList[key].score / 2);
                    }
                    break;
                }
            }
            this.showRoundAllScore();
        }
    },

    /**
     * 顯示槍眼
     * @param shootCount{Number}:射擊次數
     */
    showLoophole: function(shootCount) {
        var seat = GameData13.getPosition(this._gunPlayerUid[shootCount].target);
        var holeNode = cc.find('poker_'+seat+'/holeNode', this.tableNode);
        var hole = cc.find('hole'+this.getRandom(0, 6), holeNode);
        var quit = false;
        //防止出现相同的枪眼位置
        while(!quit)
        {
            if (hole.active == true) 
            {
                hole = cc.find('hole'+this.getRandom(0, 6), holeNode);
                quit = false;
            }
            else 
            {
                quit = true;
            }
        }
        this._holeList.push(hole);
        hole.active = true;
    },

    /**
     * 打枪动画
     * @param angular{Array}: 枪口的角度
     */
    showGunAnimation: function(angular) {
        var self = this;
        var index = 0;
        var gunNode;
        var gunAnimationCallBack;
        if (self._gunNum <= 0) 
        {
            return;
        }

        //打槍動畫
        gunAnimationCallBack = function() {

            var shootPlayer = self.player[GameData13.getPosition(self._gunPlayerUid[self._shootCount].shoot) - 1];
            var targetPlayer = self.player[GameData13.getPosition(self._gunPlayerUid[self._shootCount].target) - 1];

            gunNode = cc.find('gun', shootPlayer);
            gunNode.active = true;
            gunNode.rotation = angular[self._shootCount];

            //播放打枪动画
            soundMngr.instance.playSSSSpeakAudio(SSS_SpeakAudioType.SpecialType['QiangJi'], self._playerSex);
            self.playAnimation(AnimateType.QiangJi, gunNode);
            if (self._gunPlayerUid.length <= 0) 
            {
                return;
            }
            //打槍分數
            self.showGunScore(self._shootCount);
            //显示枪眼
            self.showLoophole(self._shootCount);
            self._shootCount++;
        }
        this._gunAnimation = gunAnimationCallBack;
    },

    /**
     * 计算和显示特殊牌型分数和全垒打分数
     * @param index{Number}:特殊牌型动画索引，一般为specialList下标
     * @param specialList{Array}:特殊牌型列表，全垒打也算作特殊牌型放入该列表
     */
    showSpecialScore: function(index, specialList) {
        var score;
        if (specialList[index].uid == GameData.player.uid) 
        {
            if (specialList[index].id == SpecialType['QuanLeiDa'].id) 
            {
                score = GameData13.roomResult.score[GameData.player.uid];
            }
            else 
            {
                score = SpecialType[specialList[index].type].score;
            }
            cc.log('特殊牌型加分： ', score);
        }
        else 
        {
            if (specialList[index].id == SpecialType['QuanLeiDa'].id) 
            {
                score = GameData13.roomResult.score[GameData.player.uid];
            }
            else 
            {
                score = 0 - SpecialType[specialList[index].type].score;
            }
            cc.log('特殊牌型减分: ', score);
        }
        this.playerRoundAllScore(score);
        if (this._playSpecialNum == this._specialNum - 1 && !this._isQuanLeiDa) 
        {
            if (index == specialList.length - 1) 
            {
                this._roundAllScore = GameData13.roomResult.result.ret[GameData.player.uid].score;
            }
            this.showRoundAllScore();
        }
        else if (this._isQuanLeiDa) 
        {
            this._roundAllScore = GameData13.roomResult.result.ret[GameData.player.uid].score;
            this.showRoundAllScore();
        }
    },

    /**
     * 显示特殊牌型手牌
     * @param cards{Array}:手牌列表
     * @param node{cc.Node}:卡牌父节点
     */
    showSpecialCard: function(cards, node) {
        var str = "resources/shisanshui/cardUI";
        if (cards.length < this._handSize) 
        {
            cc.log('传入的特殊牌长度小于'+this._handSize+'个');
            return;
        }
        for (var i = 0; i < this._handSize; i++) 
        {
            var disCard = cards[i];
            var card = cc.find('card'+i, node);
            var iconUrl = str + "/" + (disCard.value+1) + '_' + (disCard.type+1) + ".png";
            this.setTexture(iconUrl, card);
        }
    },

    //还原玩家手牌显示
    restoreCard: function() {
        var cards = GameData13.roomResult.cards[GameData.player.uid];
        if (GameData13.roomResult.result.ret[GameData.player.uid].special.type > 0) 
        {
            return;
        }
        else if (GameData13.roomResult.result.ret[GameData.player.uid].special.type == 0) 
        {
            this.showDisCard(GameData.player.uid, 'up', cards.up.card);
            this.showDisCard(GameData.player.uid, 'mid', cards.mid.card);
            this.showDisCard(GameData.player.uid, 'down', cards.down.card);
        }
    },

    /**
     * 特殊牌型动画
     * @param specialList{Array}: 当前局所有特殊牌
     */
    showSpecialAnimation: function(specialList) {
        WriteLog('show_specialAnimation');

        var str = "resources/shisanshui/cardUI";
        var self = this;
        var specialAnimationCallBack;

        //判断是否有特殊牌型
        if (this._specialNum <= 0 && !this._isQuanLeiDa) 
        {
            return;
        }

        cc.log('specialList: ', specialList);

        specialAnimationCallBack = function() {
            WriteLog('specialAnimationCallBack');

            self.showSpecialPlayerName(true);

            if (self._isQuanLeiDa) 
            {
                if (specialList[0].node) 
                {
                    specialList[0].node.active = true;
                }
                self.showSpecialScore(0, specialList);
                
                var name = GameData13.getJoinerByUid(specialList[0].uid).name;
                self.showName(self.specialPlayerName, name);

                soundMngr.instance.playSSSSpeakAudio(SSS_SpeakAudioType.SpecialType[specialList[0].type], self._playerSex);
                self.playAnimation(AnimateType[specialList[0].type], specialList[0].node);
                self.showSpecialScore(0, specialList);
                self._playQuanLeiDaNum = 1;
            }
            else 
            {
                if (self._playSpecialNum >= 0 && self._playSpecialNum < specialList.length) 
                {
                    if (specialList[self._playSpecialNum].node) 
                    {
                        specialList[self._playSpecialNum].node.active = true;
                    }
                }
                self.showSpecialScore(self._playSpecialNum, specialList);

                var name = GameData13.getJoinerByUid(specialList[self._playSpecialNum].uid).name;
                self.showName(self.specialPlayerName, name);

                soundMngr.instance.playSSSSpeakAudio(SSS_SpeakAudioType.SpecialType[specialList[self._playSpecialNum].type], self._playerSex);
                self.playAnimation(AnimateType[specialList[self._playSpecialNum].type], specialList[self._playSpecialNum].node);

                var uid = specialList[self._playSpecialNum].uid;
                var seat = GameData13.getPosition(uid);
                var zhipaiNode = cc.find('poker_'+seat+'/zhipai', self.tableNode);
                self.showSpecialCard(GameData13.roomResult.cards[uid].allCards, zhipaiNode);

                self._specialPoker = cc.find('zhipai', self.poker_1);
                self.showSpecialCard(GameData13.roomResult.cards[uid].allCards, self._specialPoker);
            }

            cc.find('animateBg', self.tableNode).active = true;
            ++self._playSpecialNum;
        }
        this._specialAnimation = specialAnimationCallBack;
    },

    /**
     * 输家动画
     */
    loserClearAnimation: function() {
        var str = "resources/shisanshui/tableUI/clearing/";

        var self = this;
        
        for (var i = 0; i < this._winnerToLoser.loser.length; i++)
        {
            var node;
            var jettonNum = this._jettonIndex + 1;
            if (!this.tableNode.getChildByName('jettonNode' + jettonNum))
            {
                node = cc.instantiate(this.jettonNode);
                node.name = 'jettonNode' + jettonNum;
                this.tableNode.addChild(node);
            }
            else 
            {
                node = this.tableNode.getChildByName('jettonNode' + jettonNum);
            }
            
            var localZOrder = this.player[0].getLocalZOrder();
            node.active = true;
            node.setLocalZOrder(localZOrder - 1);
            this._jettonList.push(node);

            var fileName = this.getRandom(1,5);
            if (fileName != 5)
            {
                node.scaleX = 0.26;
                node.scaleY = 0.26;
            }
            var iconUrl = str + fileName + '.png';
            this.setTexture(iconUrl, node);
            var seat = GameData13.getPosition(this._winnerToLoser.loser[i].uid);
            var player = this.player[seat - 1];
            node.setPosition(player.getPosition());

            var jettonPosX = this.getRandom(-100, 100);
            var jettonPosY = this.getRandom(-100, 100);
            var moveTo = cc.moveTo(0.32, cc.p(jettonPosX, jettonPosY));
            node.runAction(moveTo).easing(cc.easeCubicActionOut());
            this._jettonIndex++;
        }
        
        //this._jettonCount * this._winnerToLoser.loser.length筹码总数
        if (this._jettonIndex >= this._jettonCount * this._winnerToLoser.loser.length) 
        {
            this.unschedule(this.loserClearAnimation);
            this._isWinnerClear = false;
            this.winnerAction();
        }
    },

    /**
     * 赢家应得筹码数
     */
    winnerJettonCount: function() {
        var jettonAllCount = this._jettonCount * this._winnerToLoser.loser.length;
        var _winnerJettonCount = Math.floor(jettonAllCount / this._winnerToLoser.winner.length);
        return _winnerJettonCount;
    },

    /**
     * 赢家动画
     */
    winnerClearAnimation: function() {
        var self = this;
        var removeFunc;
        var lastWinner = this._winnerToLoser.winner.length - 1;

        for (var i = 0; i < this._winnerToLoser.loser.length; i++) 
        {
            var jettonNum = this._jettonIndex + 1;
            var moveTo;

            var jettonAction = function(num) {
                var seat = GameData13.getPosition(self._winnerToLoser.winner[self._winnerIndex].uid);
                var player = self.player[seat - 1];
                var offset_x = self.getRandom(-50, 50);
                var offset_y = self.getRandom(-50, 50);
                moveTo = cc.moveTo(0.5, cc.p(player.getPosition().x + offset_x, player.getPosition().y + offset_y));
                //移除筹码节点
                removeFunc = cc.callFunc(function()
                {
                    self._jettonList[num - 1].active = false;
                    self.tableNode.removeChild(self._jettonList[num - 1]);
                }, this);
            }

            //每个赢家应该得到的筹码数
            if (jettonNum <= this.winnerJettonCount() * (this._winnerIndex + 1) && this._winnerIndex < lastWinner) 
            {
                jettonAction(jettonNum);
            }
            //如果筹码数大于赢家应得筹码数，说明该筹码应给下一位赢家
            else if (jettonNum > this.winnerJettonCount() * (this._winnerIndex + 1) && this._winnerIndex < lastWinner) 
            {
                this._winnerIndex++;
                jettonAction(jettonNum);
            }
            //最后一名赢家得到剩余的所有筹码数(注：分数的多寡不会影响所得筹码数，一切都是固定的)
            else if (this._winnerIndex == lastWinner) 
            {
                jettonAction(jettonNum);
            }

            var fade = cc.fadeOut(0.1);
            var seq = cc.sequence(moveTo, fade, removeFunc);
            this._jettonList[this._jettonIndex].runAction(seq).easing(cc.easeCubicActionOut());

            this._jettonIndex++;
        }
       
        //this._jettonCount * this._winnerToLoser.loser.length筹码总数
        if (this._jettonIndex >= this._jettonCount * this._winnerToLoser.loser.length) 
        {
            this.unschedule(this.winnerClearAnimation);
            this.showHeadScore();
            this.gameAnimationMngr(AnimateType.JieSuan);
        }
    },

    loserJetton: function() {
        this._jettonIndex = 0;
        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_2);
        this.schedule(this.loserClearAnimation, 0.01);
    },

    winnerJetton: function() {
        this._jettonIndex = 0;
        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_3);
        this.schedule(this.winnerClearAnimation, 0.01);
    },

    winnerAction: function() {
        var delayTime = cc.delayTime(1);
        var self = this;
        var callFunc = cc.callFunc(function(){
            self.winnerJetton();
        }, this);
        var seq = cc.sequence(delayTime, callFunc);
        this.node.runAction(seq);
    },

    /**
     * 确定赢家输家
     */
    calculateWinnerAndLoser: function() {
        this.clearArray(this._winnerToLoser.winner);
        this.clearArray(this._winnerToLoser.loser);
        for (var uid in GameData13.roomResult.result.ret) 
        {
            if (GameData13.roomResult.result.ret[uid].score > 0) 
            {
                this._winnerToLoser.winner.push({
                    uid: uid, 
                    score: GameData13.roomResult.result.ret[uid].score
                });
            }
            else if (GameData13.roomResult.result.ret[uid].score < 0) 
            {
                this._winnerToLoser.loser.push({
                    uid: uid, 
                    score: GameData13.roomResult.result.ret[uid].score
                });
            }
        }
    },

    showClearAnimation: function() {
        WriteLog('showClearAnimation');

        //确定赢家输家
        this.calculateWinnerAndLoser();
        //确定有无赢家输家
        if (this._winnerToLoser.winner.length > 0) 
        {
            this._isLoserClear = false;
        }

        //输家筹码动画没有完成，则播放，完成，则不播放
        if (!this._isLoserClear) 
        {
            this.loserJetton();
        }
        else 
        {
            this._isLoserClear = false;
            this._isWinnerClear = false;
            // this.showHeadScore();
            this.scheduleOnce(this._readyFunc, 1);
        }
    },

    showBiPai: function(uid) {
        var seat = GameData13.getPosition(uid);
        var node = cc.find('poker_'+seat, this.tableNode);
        cc.find('fapai/bg', node).active = false;
        cc.find('fapai', node).active = false;
        cc.find('zhipai',node).active = true;
    },

    showDisCardReady: function() {
        WriteLog('showDisCardReady');
        if (!GameData13.isEmptyObject(GameData13.disCardReady))
        {
            this.showBiPai(GameData13.disCardReady.uid);
        }
        else 
        {
            cc.log('function:showDisCardReady.. GameData13.disCardReady is empty.');
        }
    },

    showGameEnd: function(data) {
        if (data == 1)
        {
            this.showRoomEndClear(true);
        }
        else if (data == 0) 
        {
            this.showRoomEndClear(false);
        }
    },

    //显示微信邀请
    showWaitNode: function(show) {
        this.waitNode.active = show;
    },

    //显示理牌层
    showNeatenNode: function(show) {
        this.neatenNode.active = show;
    },

    //显示总结算层
    showRoomEndClear: function(show) {
        this.roomEndClear.active = show;
        GameData13.game.start = false;
        this.stopGameAction();
    },

    //显示第一墩重置按钮
    showUpResetBtn: function(show) {
        this.upResetBtn.active = show;
    },

    //显示第二墩重置按钮
    showMidResetBtn: function(show) {
        this.midResetBtn.active = show;
    },

    //显示第三墩重置按钮
    showDownResetBtn: function(show) {
        this.downResetBtn.active = show;
    },

    //显示特殊牌型按钮
    showPeculiarBtn: function(show) {
        this.peculiarBtn.node.active = show;
    },

    //显示准备按钮
    showReadyBtn: function(show) {
        this.readyBtn.active = show;
    },

    //显示退出房间按钮
    showQuitBtn: function(show) {
        this.quitBtn.active = show;
    },

    //显示出牌按钮和重选按钮
    showSelection: function(show) {
        this.selection.active = show;
    },

    //显示手牌列表层
    showCardHandLayer: function(show) {
        this.cardHand.active = show;
    },

    //显示推荐牌型层
    showCardGroupLayer: function(show) {
        this.cardGroup.active = show;
    },

    showSpecialPlayerName: function(show) {
        this.specialPlayerName.node.active = show;
    },

    //显示计时器层
    showTimeNode: function(_isDisCardEnd, show, open, close) {
        this.timeNode.active = show;
        if (!_isDisCardEnd) 
        {
            // var widget = this.timeNode.getComponent(cc.Widget);
            // widget.top = 150;
            // widget.right = 35;
            this.timeNode.x = 215;
            this.timeNode.y = 395;
        }
        else if (_isDisCardEnd) 
        {
            // var widget = this.timeNode.getComponent(cc.Widget);
            // widget.top = 580;
            // widget.right = 250;
            this.timeNode.x = 0;
            this.timeNode.y = -30;
        }
        if (open) 
        {
            cc.log('运行时间计时器');
            this.openTimer(open);
        }
        else if (close) 
        {
            cc.log('关闭时间计时器');
            this.closeTimer(close);
        }
    },

    /*************************************断线重连*************************************************************/

    showJoinerLost: function(data) {
        WriteLog('showJoinerLost');
        this.showHeaderDisconnect(data.detail.uid, true);
    },

    showJoinerConnect: function(data) {
        WriteLog('showJoinerConnect');
        this.showHeaderDisconnect(data.detail.uid, false);
    },

    showHeaderDisconnect : function(uid, show)
    {
        WriteLog('showHeaderDisconnect');
        for(var i = 0; i < GameData13.joiners.length; i++)
        {
            var player = GameData13.joiners[i];
            if(player.uid == uid)
            {
                var playerNode = this.player[GameData13.getPosition(uid) - 1];
                var disNode = cc.find('lost',playerNode);
                disNode.active = show;
                return;
            }
        }
    },

    showConnectDisCardInfo: function() {
        WriteLog('showConnectDisCardInfo');

        var joiners = new Array();
        for (var key = 0; key < GameData13.joiners.length; key++) 
        {
            joiners.push(GameData13.joiners[key]);
        }

        if (!GameData13.isEmptyObject(GameData13.playerConnect.disCardInfo)) 
        {
            GameData13.game.start = true;
            this.readyBtnAndQuitBtnControl();

            for (var i = 0; i < GameData13.playerConnect.disCardInfo.length; i++) 
            {
                if (GameData.player.uid == GameData13.playerConnect.disCardInfo[i]) 
                {
                    this._isDisCardEnd = true;
                }
            }

            var disCardUid = [];
            for (var i = 0; i < GameData13.joiners.length; i++) 
            {
                for (var j = 0; j < GameData13.playerConnect.disCardInfo.length; j++) 
                {
                    if (GameData13.joiners[i].uid == GameData13.playerConnect.disCardInfo[j]) 
                    {
                        disCardUid.push(GameData13.joiners[i].uid);
                        break;
                    }
                }
            }
            for (var key = 0; key < joiners.length; key++) 
            {
                for (var num = 0; num < disCardUid.length; num++) 
                {
                    if (disCardUid[num] == joiners[key].uid) 
                    {
                        cc.log('disCardUid and joiners: ', disCardUid[num], joiners[key].uid);
                        joiners.splice(key, 1);
                    }
                }
            }

            for (var i = 0; i < GameData13.playerConnect.disCardInfo.length; i++) 
            {
                var seat = GameData13.getPosition(GameData13.playerConnect.disCardInfo[i]);
                cc.find('poker_'+seat+'/zhipai', this.tableNode).active = true;
            }
        }

        if(GameData13.game.reday){
            for (var key = 0; key < joiners.length; key++) 
            {
                var seat = GameData13.getPosition(joiners[key].uid);
                for (var i = 0; i < this._handSize; i++) 
                {
                    var card = cc.find('poker_'+seat+'/fapai/card'+i, this.tableNode);
                    card.active = true;
                }
            }
        }
        GameData13.clearObject(GameData13.playerConnect.disCardInfo);
    },

    showConnectDisCard: function() {
        WriteLog('showConnectDisCard');

        if (GameData13.isEmptyObject(GameData13.playerConnect.disCard)) 
        {
            for (var index = 0; index < GameData13.disCardPlayer.length; index++)
            {
                this.showBiPai(GameData13.disCardPlayer[index]);
            }

            cc.log('GameData13.playerConnect.disCard is empty');
            return;
        }
        else 
        {
            GameData13.game.start = true;
            this.showWaitNode(false);
            this.readyBtnAndQuitBtnControl();
            var disCardNode = cc.find('disCard', this.poker_1);
            disCardNode.y = this._disCardNodePosYList[0];
        }
        if (GameData13.playerConnect.disCard.special > 0) 
        {
            var specialTypeHint = cc.find('zhipai/specialType', this.poker_1);
            specialTypeHint.active = true;
        }
        else 
        {
            if (GameData13.playerConnect.disCard.upCards) 
            {
                this.showDisCard(GameData.joinContact.uid, 'up', GameData13.playerConnect.disCard.upCards);
            }
            if (GameData13.playerConnect.disCard.midCards) 
            {
                this.showDisCard(GameData.joinContact.uid, 'mid', GameData13.playerConnect.disCard.midCards);
            }
            if (GameData13.playerConnect.disCard.downCards) 
            {
                this.showDisCard(GameData.joinContact.uid, 'down', GameData13.playerConnect.disCard.downCards);
            }
        }
        GameData13.clearObject(GameData13.playerConnect.disCard);
    },

    //链接重现
    connectRecurrence: function() {
        if (!GameData13.isEmptyObject(GameData.joinContact)) 
        {
            this.setRoomNum(GameData13.joiners[0].roomid);
            this.showHeadScore();
            GameData.player.roomid = GameData13.joiners[0].roomid;
        }
        if (GameData13.readyInfo[GameData.joinContact.uid]) 
        {
        }
        if (GameData13.game.start) 
        {
            this.ready();
            this.showWaitNode(false);
        }
        if (!GameData13.isEmptyObject(GameData13.player)) 
        {
            GameData13.game.start = true;
            this.showNeatenNode(true);
            this.checkedRecommendManner();
            this.showWaitNode(false);
            this.refreshCard();
        }
        else if (!GameData13.isEmptyObject(GameData13.roomResult)) 
        {
            if (GameData13.isEmptyObject(GameData13.roomResult.result)) 
            {
                for (var i = 0; i < GameData13.joiners.length; i++) 
                {
                    var player = this.player[GameData13.getPosition(GameData13.joiners[i].uid) - 1];
                    var score = cc.find('score', player);
                    score.getComponent(cc.Label).string = GameData13.roomResult.score[GameData13.joiners[i].uid];
                }
            }
            GameData13.game.start = true;
            this.showWaitNode(false);
            this.ready();
            return;
        }

        this.showConnectDisCardInfo();
        this.showConnectDisCard();
    },

    /********************************************************************************************/

    //根据准备消息来控制准备和退出房间按钮的显示
    readyBtnAndQuitBtnControl : function(){

        this.showReadyBtn(true);
        this.showQuitBtn(true);

        //先判断是不是已经开局
        cc.log("..roundNum:"+GameData13.game.roundNum);
        if( GameData13.game.roundNum > 0 )
        {
            this.showReadyBtn(false);
            this.showQuitBtn(false);
            return;
        }

        for( var uid in GameData13.readyInfo )
        {
            if( uid != GameData.player.uid )
            {
                continue;
            }
            this.showReadyBtn(false);
            this.showQuitBtn(false);
            break;
        }
    },

    concealAllSpecialTypeLabel: function() {
        for (var num = 1; num <= 5; num++) 
        {
            var specialTypeHint = cc.find('poker_'+num+'/zhipai'+'/specialType', this.tableNode);
            specialTypeHint.active = false;
        }
    },

    stopGameAction: function() {
        this.tableNode.stopAllActions();

        if (this._jettonList.length > 0) 
        {
            for (var i = 0; i < this._jettonList.length; i++) 
            {
                if (this._jettonList[i])
                {
                    this._jettonList[i].stopAllActions();
                }
            }
        }

        // this.animation.stop();
    },

    getRandom: function(m, n) {
        var num = Math.ceil((Math.random()*(n - m) + m));
        return Math.floor(num);
    },

    setTexture: function(url, node) {
        var texture2D;
        if (url == null || url.length == 0 || url == undefined)
        {
            var spriteComponent;
            if (node.getComponent(cc.Sprite))
            {
                spriteComponent = node.getComponent(cc.Sprite);
                spriteComponent.spriteFrame = null;
            }
        }
        else
        {
            var textureUrl = cc.url.raw(url);
            if (textureUrl)
            {
                texture2D = cc.textureCache.addImage(textureUrl);
            }
            var spriteComponent;
            if (node.getComponent(cc.Sprite))
            {
                spriteComponent = node.getComponent(cc.Sprite);
                spriteComponent.spriteFrame = new cc.SpriteFrame(texture2D);
            }
        }
    },

    setJettonCount: function(count) {
        this._jettonCount = count;
    },

    /**
     * 显示交换位置的那两张卡牌
     */
    towMoveCardActive: function(parent) {
        if (moveCard.oneCard != 0)
        {
            if (moveCard.oneCard.card.parent == parent)
            {
                moveCard.oneCard.card.active = true;
            }
        }
        if (moveCard.towCard != 0)
        {
            if (moveCard.towCard.card.parent == parent)
            {
                moveCard.towCard.card.active = true;
            }
        }
    },

    /**
     * 节点缩放效果
     * @param node:要缩放的节点
     * @param fromScale:起始缩放偏移量 fromScaleX fromScaleY
     * @param toScale:目标缩放偏移量  toScaleX toScaleY
     * @param time:时间
     * @param func:缩放过程中的行为
     */
    scaleEffectsOfNode: function(node, fromScaleX, fromScaleY, toScaleX, toScaleY, time, func) {
        var fromAction = cc.scaleTo(time, fromScaleX, fromScaleY);
        var toAction = cc.scaleTo(time, toScaleX, toScaleY);
        var callFunc = cc.callFunc(func, this);
        var seq = cc.sequence(callFunc, fromAction, toAction);
        node.runAction(seq);
    },

    //玩家每局总分
    playerRoundAllScore: function(score) {
        this._roundAllScore += score;
        return this._roundAllScore;
    },

    clearArray: function(array) {
        if (array.length > 0) 
        {
            array.splice(0, array.length);
        }
    },

    clearCardType: function() {

        this._isDisCardEnd = true;
        this.showCardHandLayer(true);
        this.showCardGroupLayer(true);
        this.showNeatenNode(false);
        this.clearArray(cardPoker13.up);
        this.clearArray(cardPoker13.mid);
        this.clearArray(cardPoker13.down);

        for (var i = 0; i < 3; i++) 
        {
            var cardNode = cc.find('card'+i, this.upCardNode);
            cardNode.getComponent(cc.Sprite).spriteFrame = null;
            var card = cardNode.getComponent('SSSCard');
            card.isSelect = false;
            this.hideCardMask(cardNode);
        }

        for (var i = 0; i < 5; i++) 
        {
            var cardNode1 = cc.find('card'+i, this.midCardNode);
            var cardNode2 = cc.find('card'+i, this.downCardNode);
            cardNode1.getComponent(cc.Sprite).spriteFrame = null;
            cardNode2.getComponent(cc.Sprite).spriteFrame = null;

            var card1 = cardNode1.getComponent('SSSCard');
            var card2 = cardNode2.getComponent('SSSCard');
            card1.isSelect = false;
            card2.isSelect = false;

            this.hideCardMask(cardNode1);
            this.hideCardMask(cardNode2);
        }
    },

    cutOutArray: function(array, formIdx, toIdx) {
        var tempArr = [];
        if (array.length <= toIdx) 
        {
            return tempArr;
        }
        for (var index = formIdx; index <= toIdx; index++) 
        {
            tempArr.push(array[index]);
        }
        return tempArr;
    },

    openTimer: function() {
        var index = 0;  //时间索引，20为一秒
        var _Time = GameData13.game.time; //
        var time = 0.05;  //0.05秒执行一次
        var _idx = 1 / ((1 /time) * _Time);  //假设时间为_Time秒下,progress的变化
        var self = this;
        var node = cc.find('timeBar', this.timeNode);
        var progressBar = node.getComponent(cc.ProgressBar);
        var progress = 1;

        var changeTime = function(idx) {
            self.timer.string = idx;
        }
        // changeTime(Math.floor(_Time / 10), tensNode);
        // changeTime(_Time % 10, onesNode);

        var gameTimer = function(dt) {
            ++index;
            // tensNode.active = true;
            // onesNode.active = true;
            if (index == 20) 
            {
                --_Time;
                index = 0;
            }
            if (_Time >= 10) 
            {
                var tens = Math.floor(_Time / 10); //十位数
                var ones = _Time % 10; //个位数
                // changeTime(tens, tensNode);
                // changeTime(ones, onesNode);
                changeTime(_Time);
            }
            else if ( _Time >= 0) 
            {
                // changeTime(_Time, onesNode);
                // changeTime(0, tensNode);
                changeTime(_Time);
                // if (_Time == 0) {
                //     tensNode.active = false;
                //     onesNode.active = false;
                //     _Time = 30;
                //     progress = 1;
                //     progressBar.progress = 1;
                // }
            }

            if (progress > 0) 
            {
                progress -= _idx;
            }
            else
             {
                progress = 0;
                // var key = self.getRandom(0, self._groupTypeList.length - 1);
                self._groupTypeList[0].getComponent('groupType').showRecommendCard();
                self.onDisCardBtnCliked();
                self.unschedule(_gameTimer);
            }
            progressBar.progress = progress;
        }
        this._gameTimer = _gameTimer;
        this.schedule(gameTimer, time);
    },

    closeTimer: function() {
        this.unschedule(this.gameTimer);
    },

    /**
     * 设置选中的卡牌
     */
    setCheckedCards: function(cards) {
        
        //清空数组
        this.clearArray(this._checkedCardList);
        
        for (var i = 0; i < cards.length; i++) 
        {
            for (var j = 0; j < this._cardHandList.length; j++) 
            {
                if (this._cardHandList[j].type == cards[i].type && this._cardHandList[j].value == cards[i].value) 
                {
                    var repetition = false;
                    for (var n = 0; n < this._checkedCardList.length; n++) 
                    {
                        if (this._checkedCardList[n].cardId == j) 
                        {
                            repetition = true;
                            break;
                        }
                    }
                    if (!repetition)
                     {
                        this._checkedCardList.push({
                            card: this._cardHandList[j], 
                            cardId: j
                        });
                        break;
                    }
                    else continue;
                }
            }
        }
    },

    /**
     * 重置卡牌
     * @param parent:需要重置第几行牌的父节点
     * @param row:重置第几行牌
     */
    setResetCard: function(parent, row) {
        WriteLog('setResetCard');

        this.clearArray(this._checkedCardList); //重置之前先把selCardsList清空

        for (var i = 0; i < cardPoker13[row].length; i++)
        {
            var cardNode = cc.find('card'+i, parent);
            this.hideCardMask(cardNode);

            var card = cardNode.getComponent('SSSCard');
            card.removeAllCards();
            card.isSelect = false;

            this.setTexture(null, cardNode);
            cardNode.active = true;

            for (var j = 0; j < this._cardHandList.length; j++) 
            {
                if (this._cardHandList[j] == 0) 
                {
                    this._cardHandList[j] = cardPoker13[row][i];
                    break;
                }
            }
        }
        this.showSelection(false);
        this.showCardHandLayer(true);
        this.showCardGroupLayer(true);
        this.showCardHand();
        this.clearArray(cardPoker13[row]);
        this.towMoveCardActive(parent);
        this.initCardStatus();

        if (row == 'up') 
        {
            this.showUpResetBtn(false);
        }
        else if (row == 'mid') 
        {
            this.showMidResetBtn(false);
        }
        else if (row == 'down')
        {
            this.showDownResetBtn(false);
        }
    },

    setRoomNum: function(roomid) {
        var self = this;
        var str = 'resources/shisanshui/tableUI/';

        var addRoomID = function(parent, idx, num) {
            var id = new cc.Node();
            if (id) parent.addChild(id);
            id.addComponent(cc.Sprite);
            var iconUrl = str+'zhuomian'+num+'.png';
            self.setTexture(iconUrl, id);
            id.x = idx * 15 + 10;
        }
        var divistor = 100000;
        for (var i = 0; i < 6; i++) {
            var num = Math.floor(roomid / divistor);
            roomid = roomid % divistor;
            divistor = divistor / 10;
            addRoomID(this.roomId, i, num);
        }
    },

    setRoundNum: function() {
        var self = this;
        var roundNum = GameData13.game.roundNum > GameData13.room.roundmax? GameData13.room.roundmax:GameData13.game.roundNum;
        var str = 'resources/shisanshui/tableUI/';

        var addRoundNum = function(parent, idx, num) {
            var round = cc.find('num'+idx, parent);
            var iconUrl = str+'zhuomian'+num+'.png';
            self.setTexture(iconUrl, round);
        }
        if (roundNum >=0 && roundNum < 10) 
        {
            addRoundNum(this.roundNum, 1, roundNum);
        }
        else if (roundNum >= 10 && roundNum < 100) 
        {
            cc.find('num1', this.roundNum).active = false;
            var num = Math.floor(roundNum / 10);
            addRoundNum(this.roundNum, 0, num);
            num = roundNum % 10;
            addRoundNum(this.roundNum, 2, num);
        }
    },

    startTouch: function(e) {
        var cardRowSize = [{width: this.upCardNode.getContentSize().width, height: this.upCardNode.getContentSize().height},
            {width: this.midCardNode.getContentSize().width, height: this.midCardNode.getContentSize().height},
            {width: this.downCardNode.getContentSize().width, height: this.downCardNode.getContentSize().height}];

        var pos1 = this.upCardNode.convertTouchToNodeSpace(e);
        var pos2 = this.midCardNode.convertTouchToNodeSpace(e);
        var pos3 = this.downCardNode.convertTouchToNodeSpace(e);

        if ((pos1.x > 0 && pos1.x <= cardRowSize[0].width) && (pos1.y > 0 && pos1.y <= cardRowSize[0].height)) 
        {
            this.refreshCheckedCards();
            this.showCardRow('up', this.upCardNode, 3);
        }
        else if (pos2.y > 0 && pos2.y <= cardRowSize[1].height) 
        {
            this.refreshCheckedCards();
            this.showCardRow('mid', this.midCardNode, 5);
        }
        else if (pos3.y > 0 && pos3.y <= cardRowSize[2].height) 
        {
            this.refreshCheckedCards();
            this.showCardRow('down', this.downCardNode, 5);
        }
    },

    moveTouch: function(e){
    },

    endTouch: function(e) {
    },

    /**
     * 发牌动画
     * @param idx:玩家索引，第几个玩家，从0开始
     */
    dealAction: function(idx) {
        var node;
        var card;
        if (idx != 0) 
        {
            node = cc.find('poker_'+(idx + 1)+'/fapai', this.tableNode);
            cc.find('bg', node).active = true;
            var startPosX = cc.find('card0', node).getPositionX();
            for (var i = 0; i < this._handSize; i++) 
            {
                card = cc.find('card'+i, node);
                card.x = startPosX - 30;
                card.active = true;
                var actionTo = cc.moveTo(0.3, cc.p(startPosX + i*15, 0));
                card.runAction(actionTo);
            }
        }
        else if (idx == 0) 
        {
            node = cc.find('poker_'+(idx + 1)+'/fapai', this.tableNode);
            cc.find('bg', node).active = true;
            var startPosX = cc.find('card0', node).getPositionX();
            for (var i = 0; i < this._handSize; i++) 
            {
                card = cc.find('card'+i, node);
                card.x = startPosX - 30;
                card.active = true;
                var actionTo = cc.moveTo(0.3, cc.p(startPosX + i*13, 0));
                card.runAction(actionTo);
            }
        }
    },

    /**
     * 比牌动画
     * @param uid:玩家id
     * @param row:第几行牌,up:首墩  mid:中墩  down:尾墩
     */
    disCardAction: function(uid, row) {
        var str = "resources/shisanshui/cardUI";
        var index = 0;
        var card = [];
        var cards = [];
        var seat = GameData13.getPosition(uid); //玩家座位
        var line = GameData13.getDisCardRow(row); //第几墩牌
        var node = cc.find('poker_'+seat+'/disCard', this.tableNode);
        var commonType = cc.find('poker_'+seat+'/disCard/CommonType', this.tableNode);

        if (GameData13.roomResult.cards[uid].allCards) 
        {
            if (GameData13.roomResult.cards[uid].special > 0) 
            {
                return;
            }
        }

        node.active = true;
        var self = this;
        var timeCallback = function(dt) {
            commonType.active = false;
            node.active = false;
        }

        for (var i = 0; i < 5; i++) 
        {
            card[i] = cc.find('card'+i, node);
            card[i].active = true;
        }

        if (seat == 1 && (line-1) != 0) 
        {
            node.y = node.getPositionY() - 90;
        }
        else if (seat != 1 && (line-1) != 0) {node.y = node.getPositionY() - 65;}

        for (var i = 0; i < 5; i++) 
        {
            if (line == 1) 
            {
                if (i == 0 || i == 4) { card[i].active = false; continue };
                var disCard = GameData13.roomResult.cards[uid][row].card[index];  //第一墩牌只有3个，所以要用到index索引
                cards[cards.length] = disCard;
                var iconUrl = str + "/" + (disCard.value+1) + '_' + (disCard.type+1) + ".png";
                this.setTexture(iconUrl, card[i]);
                index++;
            }
            else 
            {
                var disCard = GameData13.roomResult.cards[uid][row].card[i];
                cards[cards.length] = disCard;
                var iconUrl = str + "/" + (disCard.value+1) + '_' + (disCard.type+1) + ".png";
                this.setTexture(iconUrl, card[i]);
            }
        }
        var cardType = GameData13.roomResult.cards[uid][row].type;
        for (var type in CommonType) 
        {
            if (cardType == CommonType[type].id) 
            {
                var iconUrl = "resources/shisanshui/cardTypeUI/"+CommonType[type].str+'.png';
                this.setTexture(iconUrl, commonType);
                commonType.active = true;
                soundMngr.instance.playSSSSpeakAudio(SSS_SpeakAudioType.CommonType[type], this._playerSex);
                break;
            }
        }
        if (seat == 1) 
        {
            this.playAnimation('bipai1', node);
        }
        else 
        {
            this.playAnimation('bipai2', node);
        }

        this.scheduleOnce(timeCallback, 1.05);
        this.showDisCard(uid, row, cards);
    },

    ready: function() {
        SSSHandler.getInstance().requestReady(function(){});

        //隐藏部分UI
        for (var i = 0; i < this._holeList.length; i++)
        {
            this._holeList[i].active = false;
        }
        this.up.active = false;
        this.mid.active = false;
        this.down.active = false;
        this.allScore.active = false;

        this.initDisPos(false);

        var index = GameData13.getPosition(GameData.player.uid);
        var ready = cc.find('ready', this.player[index - 1]);
        ready.active = true;
    },

    againReady: function() {
        this.ready();
    },

    onReadyBtnCliked: function(evt) {
        this.ready();
        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    //出牌事件
    onDisCardBtnCliked: function(evt) {
        this.showSelection(false);
        var self = this;
        var cards = {
            up: 0,
            mid: 0,
            down: 0
        };
        cards.up = cardPoker13['up'];
        cards.mid = cardPoker13['mid'];
        cards.down = cardPoker13['down'];
        SSSHandler.getInstance().requestDiscard(cards, 0, function(res){
            if (res.result == errorCode.WarningDiscard) 
            {
                self.showSelection(true);
                soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_8);
                createSSSMoveMessage('倒水');
            }
            else if (res.result == errorCode.Success) 
            {
                self.showDisCard(GameData.player.uid, 'up', cardPoker13.up);
                self.showDisCard(GameData.player.uid, 'mid', cardPoker13.mid);
                self.showDisCard(GameData.player.uid, 'down', cardPoker13.down);
                self.clearCardType();
            }
        });
        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    //重置事件
    onReelectBtnCliked: function(evt, customEventData) {
        if (customEventData == 1) 
        {
            this.setResetCard(this.upCardNode, 'up');
        }
        else if (customEventData == 2) 
        {
            this.setResetCard(this.midCardNode, 'mid');
        }
        else if (customEventData == 3) 
        {
            this.setResetCard(this.downCardNode, 'down');
        }
        else if (customEventData == 4) 
        {
            this.setResetCard(this.upCardNode, 'up');
            this.setResetCard(this.midCardNode, 'mid');
            this.setResetCard(this.downCardNode, 'down');
        }
        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    //特殊牌型事件
    onPeculiarBtnCliked: function(evt) {
        this.showSpecialType(GameData13.player.type);
        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    //微信分享
    onShareBtnCliked: function(evt) {
        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);

        if(inCD(3000)) 
        {
            return;
        }
        screenShootVertical(wxShareTexture);
    },

    onHeadBtnClicked: function(evt) {
        for (var i = 0; i < GameData13.joiners.length; i++) 
        {
            var player = this.player[GameData13.getPosition(GameData13.joiners[i].uid) - 1];
            var button = cc.find('button', player);
            button.setTag(GameData13.joiners[i].uid);
        }
        poker13createPlayerInfoPanel(GameData13.getJoinerByUid(evt.target.tag));
        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    /**
     * 复制房间号
     */
    onCopyRoomInfo: function(){
        var roomId = GameData.player.roomid;
        if (roomId > 0) 
        {
            var title = "十三水,"+"房间号:"+GameData.player.roomid+",";
            var des = this.getInviteStr();

            textClipboard(title+des);
            createSSSMoveMessage("复制信息成功。");
        }
        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    /**
     * 微信邀请
     */
    wxInviteBtnClicked: function() {
        var title = "十三水 "+"房间号:"+GameData.player.roomid;
        if(GameData13.room.costType == 4)
        {
            title = "十三水 "+"房间号:"+GameData.player.roomid +"(代开)";
        }
        var des = this.getInviteStr();
        wxShareWeb(title, des);
        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    /**
     * 返回邀请信息
     */
    getInviteStr: function(){
        var str1 = "玩法:";
        var inviteStr = getRuleStr13(GameData13.room);
        if(GameData13.room.joinermax)
        {
            inviteStr +=","+ GameData13.joiners.length + "等" + (GameData13.room.joinermax-GameData13.joiners.length);
        }

        var str2 = ",请您快速加入对局.";
        var des = str1+inviteStr+str2;
        console.log('des = ' + des);
        return des;
    },

    onDeleteRoom: function() {
        RoomHandler.deleteRoom(GameData.player.roomid);
        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    //退出房间
    onQuitRoom : function()
    {
        if (GameData13.owner == GameData.player.uid) 
        {
            cc.director.loadScene('home');
        } 
        else 
        {
            RoomHandler.quitRoom(GameData.player.roomid);
        }
    },

    //ScrollView回调事件，此回调事件用于把点亮的边框隐藏 lightFrame
    lightFrame: function(e) {
        //把点亮的边框隐藏
        var scrollView = this.promptScrollView.getComponent(cc.ScrollView);
        if (scrollView.getContentPosition().x == this._firstScrollViewPos.x) 
        {
            for (var i = 0; i < this._groupTypeList.length; i++) 
            {
                var twinkle = cc.find('twinkle', this._groupTypeList[i]);
                if (twinkle.active == true) twinkle.active = false;
            }
        }
    },

    //ScrollView回调事件，此回调事件用于动态改变ScrollView大小
    onScrollViewEvent: function(evt) {
        cc.log('scrollViewEvent');

        var firstContentSize = cc.find('view', this.promptScrollView).getContentSize();
        var scrollView = this.promptScrollView.getComponent(cc.ScrollView);

        if (scrollView.getContentPosition().x > 0) 
        {
            var content = cc.find('view/content', this.promptScrollView);
            content.setContentSize(firstContentSize);
        }
        else 
        {
            var content = cc.find('view/content', this.promptScrollView);
            content.setContentSize(this.scrollViewSize);
        }
        this._firstScrollViewPos = scrollView.getContentPosition();
    },

    onPauseEvent: function() {
        this.kai.active = !this.kai.active;
        this.guan.active = !this.guan.active;

        if (this.kai.active == true && this.guan.active == false) 
        {
            cc.director.resume();
        }
        else if (this.kai.active == false && this.guan.active == true) 
        {
            cc.director.pause();
        }
    },

    //播放动画，包括龙骨动画和帧动画
    playAnimation: function(animate, node) {
        WriteLog('playAnimation');
        var self = this;

        //龙骨动画
        for (var _type in AnimateType)
        {
            if (AnimateType[_type] == animate)
            {
                var url = 'shisanshui/animation/shisanshui/'+animate;

                cc.loader.loadResDir(url, function(err, assets)
                {
                    if (err) 
                    {
                        cc.log(err);
                        return;
                    }
                    if (assets.length <= 0) 
                    {
                        return;
                    }
                    node.parent.setLocalZOrder(10);
                    var armatureDisplay;
                    if (!node.getComponent(dragonBones.ArmatureDisplay))
                    {
                        cc.log('dragonBones add');
                        armatureDisplay = node.addComponent(dragonBones.ArmatureDisplay);
                    }
                    else 
                    {
                        cc.log('dragonBones get');
                        armatureDisplay = node.getComponent(dragonBones.ArmatureDisplay);
                    }
                    for (var elem in assets)
                    {
                        if (assets[elem] instanceof dragonBones.DragonBonesAsset)
                        {
                            if (armatureDisplay.dragonAsset != assets[elem])
                            {
                                armatureDisplay.dragonAsset = assets[elem];
                            }
                        }
                        if (assets[elem] instanceof dragonBones.DragonBonesAtlasAsset)
                        {
                            if (armatureDisplay.dragonAtlasAsset != assets[elem])
                            {
                                armatureDisplay.dragonAtlasAsset = assets[elem];
                            }
                        }
                    }

                    if (animate == AnimateType.Start || animate == AnimateType.QuanLeiDa)
                    {
                        armatureDisplay.armatureName  = 'armature';
                    }
                    else 
                    {
                        armatureDisplay.armatureName  = 'armature';
                        for (var i = 0; i < self._specialName.length; i++)
                        {
                            if (animate == self._specialName[i])
                            {
                                armatureDisplay.armatureName  = 'armature';
                                break;
                            }
                        }
                    }
                    armatureDisplay.playAnimation('newAnimation', 1);
                    armatureDisplay.addEventListener(dragonBones.EventObject.COMPLETE, function()
                    {
                        node.active = false;
                        cc.find('animateBg', self.tableNode).active = false;
                        
                        if (self._specialPoker != 0) 
                        {
                            self.restoreCard();
                        }
                        self.gameAnimationMngr(animate);
                        self.showSpecialPlayerName(false);
                        self.releaseRes(assets);
                    }, this);
                });
                return;
            }
        }
        //帧动画
        if (node != null) {
            node.getComponent(cc.Animation).play(animate);
            return;
        }
    },

    /**
     * 管理动画播放
     */
    gameAnimationMngr : function(animate){
        
        var time = 0.5;
        this.animationStatusMngr();
        if (animate == AnimateType.Start || animate == AnimateType.QiangJi) {
            time = 0.3;
        }else if (animate = AnimateType.JieSuan) {
            time = 1;
        }
        
        this.scheduleOnce(this.gameAnimation, time);
    },

    /**
     * 动画状态
     */
    animationStatusMngr: function() {
       
        if (this._shootCount >= this._gunNum) 
        {
            this._isGunEnd = true;
            if (this._playSpecialNum < this._specialNum && !this._isQuanLeiDa) 
            {
                this._isSpecialEnd = false;
            }
            else if (this._playSpecialNum >= this._specialNum && !this._isQuanLeiDa) 
            {
                if (this._specialNum == GameData13.room.joinermax) 
                {
                    this._isBiPaiEnd = true;
                    this.concealAllSpecialTypeLabel();
                }
                this._isSpecialEnd = true;
                if (this._isLoserClear && this._isWinnerClear) 
                {
                    this._isClearEnd = false;
                }
                else if (!this._isLoserClear && !this._isWinnerClear) 
                {
                    this._isClearEnd = true;
                }
            }
            else if (this._isQuanLeiDa &&  this._playQuanLeiDaNum == 0) 
            {
                this._isSpecialEnd = false;
            }
            else if (this._isQuanLeiDa && this._playQuanLeiDaNum == 1) 
            {
                this._isSpecialEnd = true;
                if (this._isLoserClear && this._isWinnerClear) 
                {
                    this._isClearEnd = false;
                }
                else if (!this._isLoserClear && !this._isWinnerClear) 
                {
                    this._isClearEnd = true;
                }
            }
        }
    },

    /**
     * 设置推荐牌型方式
     */
    setMANNER: function(manner) {
        this._MANNER = manner;
    },

    //选择推荐牌型方式
    checkedRecommendManner: function() {
        
        if (this._recommendManner.BTN_MANNER == this._MANNER)
        {
            this.cardHand.y = -348;
            this.cardGroup.y = -545;

            var scrollView = cc.find('ScrollView', this.cardGroup);
            scrollView.active = false;
            
            var pokerType = cc.find('pokerType', this.cardGroup);
            pokerType.active = true;
        }
        else if (this._recommendManner.SCROLL_MANNER == this._MANNER)
        {
            var scrollView = cc.find('ScrollView', this.cardGroup);
            scrollView.active = true;
            
            var pokerType = cc.find('pokerType', this.cardGroup);
            pokerType.active = false;

            this.initGroupType();
        }
    },

    /**
     * 快速理牌
     */
    checkedArrangeCards: function() {
        var self = this;
        var recommend = GameData13.player.recommend[0];
        var cards_row = function(cards, length, cardRow, row) {
            
            if (cardPoker13[row].length <= 0) {
                self.setCheckedCards(cards);
                self.showCardRow(row, cardRow, length);
            }
        }
        this.setResetCard(this.upCardNode, 'up');
        this.setResetCard(this.midCardNode, 'mid');
        this.setResetCard(this.downCardNode, 'down');

        cards_row(recommend[0].cards, 5, this.downCardNode, 'down');
        cards_row(recommend[1].cards, 5, this.midCardNode, 'mid');
        cards_row(recommend[2].cards, 3, this.upCardNode, 'up');

        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    releaseRes: function(assets) {
        for (var elem in assets)
        {
            var deps = cc.loader.getDependsRecursively(assets[elem]);
           
            for (var i = 0; i < deps.length; i++) 
            {
                // cc.loader.releaseResDir(deps[i], );
                cc.loader.release(deps[i]);
            }
        }
        // var depsDir = cc.loader.getDependsRecursively(url);
        // cc.log('depsDir: ', JSON.stringify(depsDir));
        
    }
});
module.exports = SSSRoomTable;
