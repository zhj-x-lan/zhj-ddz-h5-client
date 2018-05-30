var profileChangChun = profileChangChun || {};

profileChangChun.init = function () {
    this.registAllMessage();
    this.initRoomData();
};

profileChangChun.initRoomData = function () {
    this.initCreateRoomOpts();
    profileChangChun.roomInfo = {};
    profileChangChun.gameInfo = {};
    profileChangChun.resultData = {};
};

profileChangChun.initCreateRoomOpts = function () {

    var data = cc.sys.localStorage.getItem('createRoomOpts_changchun');
    if (data != null) {
        profileChangChun.createRoomOpts = JSON.parse(data);
        return;
    }
    profileChangChun.createRoomOpts = {};
    // 房间类型（默认普通房间）1：普通房间 2：俱乐部房间
    // 回合类型61：6局 62：12局 63：24局 64：1圈 65：2圈 66：4圈（默认24局.两人默认2圈）
    profileHuaDian.createRoomOpts.roundRule = 63;
    profileHuaDian.createRoomOpts.roomType = 1;
    profileChangChun.createRoomOpts.roundType = 1;
    profileChangChun.createRoomOpts.roundRule = 1;
    profileChangChun.createRoomOpts.bossType = 1;
    //局数
    profileChangChun.createRoomOpts.roundMax = 4;
    // 人数
    profileChangChun.createRoomOpts.joinermax = 2;
    /** 点炮包三家 */
    profileChangChun.createRoomOpts.dianpao = 0;
    //小鸡飞蛋
    profileChangChun.createRoomOpts.xiaojifeidan = 0;
    //下蛋算站立
    profileChangChun.createRoomOpts.xiadanzhanli = 0;
    /** 带缺门 */
    profileChangChun.createRoomOpts.quemen = 0;
    /** 对宝翻倍 */
    profileChangChun.createRoomOpts.duibaofanbei = 0;
    //明宝&暗宝 0  1
    profileChangChun.createRoomOpts.baotype = 0;
    //金币模式等级
    profileChangChun.createRoomOpts.scoreLv = 0;
    //七对
    profileChangChun.createRoomOpts.qiDui = 0;
};

profileChangChun.saveCreateRoomOpts = function () {
    if (profileChangChun.createRoomOpts == null || profileChangChun.createRoomOpts == undefined) return;
    cc.sys.localStorage.setItem('createRoomOpts_changchun', JSON.stringify(profileChangChun.createRoomOpts));
};

profileChangChun.registAllMessage = function () {
    console.log("----- 初始化长春消息");
    // 游戏开局
    GameNet.getInstance().setCallBack('onMahjongStartRun', function (data) {
        //WriteLog("~~~~~~~~~~~onMahjongStartRunCC :~~~~~~~~~~~~~~" + JSON.stringify(data));
        GameData.game = GameData.game || GameData.initGameData();
        GameData.game.gameStart = true;
        GameData.game.cardleft = data.remainCardCount;  //剩余手牌的数量

        // 初始化手牌
        for (var i = 0; i < data.playerGameInfo.length; i++) {
            GameData.cards[data.playerGameInfo[i].uid] = (GameData.cards[data.playerGameInfo[i].uid] === undefined) ? {} : GameData.cards[data.playerGameInfo[i].uid];
            GameData.cards[data.playerGameInfo[i].uid]['hand'] = data.playerGameInfo[i].handCards;
            GameData.cards[data.playerGameInfo[i].uid]['handnum'] = data.playerGameInfo[i].countOfHandCards;
            GameData.cards[data.playerGameInfo[i].uid]['chi'] = data.playerGameInfo[i].cardsChi; // 吃
            GameData.cards[data.playerGameInfo[i].uid]['peng'] = data.playerGameInfo[i].cardsPeng; // 碰
            GameData.cards[data.playerGameInfo[i].uid]['gang'] = data.playerGameInfo[i].cardsGang; // 杠
            GameData.cards[data.playerGameInfo[i].uid]['dis'] = data.playerGameInfo[i].cardsPast; // 玩家打出去的牌
            GameData.game.noActions = false;
            GameData.player[data.playerGameInfo[i].uid] = data.playerGameInfo[i];

            // 把新摸得牌加入到手牌中
            if (data.playerGameInfo[i].cardLastAssigned) {
                GameData.cards[data.playerGameInfo[i].uid]['hand'].push(data.playerGameInfo[i].cardLastAssigned);
                GameData.game.obtain = data.playerGameInfo[i].cardLastAssigned;
            }else{
                if (data.playerGameInfo[i].uid  == GameData.player.uid) {
                    GameData.game.obtain = -1;
                }
            }

            if (data.playerGameInfo[i].isAssignedCard == 1) {
                GameData.cards[data.playerGameInfo[i].uid]['handnum']++;
            }
            //操作按钮
            if (data.playerGameInfo[i].operationList) {
                GameData.operations[data.playerGameInfo[i].uid] = data.playerGameInfo[i].operationList;
            }

            if (data.playerGameInfo[i].isBoss) {
                GameData.game.turn = data.playerGameInfo[i].uid;
                var lastIndex = i == 0 ? 0:i-1;
                GameData.game.lastdisUid = data.playerGameInfo[lastIndex].uid;
                GameData.game.zhuangUid = data.playerGameInfo[i].uid;
                GameData.game.checkPass.onGoingUserId = data.playerGameInfo[i].uid;
            }

            //听牌cards
            if (data.playerGameInfo[i].tingReady) {
                GameData.cards[data.playerGameInfo[i].uid]['tingData'] = data.playerGameInfo[i].tingReady;
            }else{
                GameData.cards[data.playerGameInfo[i].uid]['tingData'] = null;
            }
            //听牌状态
            if(data.playerGameInfo[i].isTing == 1 && data.playerGameInfo[i].isZiMoHuOnly == 1){
                GameData.cards[data.playerGameInfo[i].uid]['tingState'] = 1;
            }else if (data.playerGameInfo[i].isTing == 1 && data.playerGameInfo[i].isZiMoHuOnly == 0) {
                GameData.cards[data.playerGameInfo[i].uid]['tingState'] = 2;
            }else if (data.playerGameInfo[i].isTing == 0 && data.playerGameInfo[i].isZiMoHuOnly == 0) {
                GameData.cards[data.playerGameInfo[i].uid]['tingState'] = 0;
            }

        }
        GameData.game.initcards = true;
        sendEvent('onGameTurn',data.onGoingUserId);
        sendEvent('initZhuangInfo');
        sendEvent('onMahjongStartRun');
    });

    // 同步玩家操作信息
    GameNet.getInstance().setCallBack('onRegularCircle', function (data) {
        //WriteLog("~~~~~~~~~~~onRegularCircleCC :~~~~~~~~~~~~~~" + JSON.stringify(data));

        GameData.game.cardleft = data.remainCardCount;  //剩余手牌的数量
        GameData.game.turn = data.onGoingUserId;
        GameData.game.checkPass = data;
        GameData.game.lastdisCard = data.showCard[0];
        GameData.game.lastdisUid = data.currentPlayCardUser;
        GameData.game.dataInfo = data;
        profileChangChun.gameInfo = data;

        for (var i = 0; i < data.playerGameInfo.length; i++) {
            GameData.cards[data.playerGameInfo[i].uid]['handnum'] = data.playerGameInfo[i].countOfHandCards;
            GameData.cards[data.playerGameInfo[i].uid]['hand'] = data.playerGameInfo[i].handCards;
            GameData.cards[data.playerGameInfo[i].uid]['chi'] = data.playerGameInfo[i].cardsChi; // 吃
            GameData.cards[data.playerGameInfo[i].uid]['peng'] = data.playerGameInfo[i].cardsPeng; // 碰
            GameData.cards[data.playerGameInfo[i].uid]['gang'] = data.playerGameInfo[i].cardsGang; // 杠
            GameData.cards[data.playerGameInfo[i].uid]['dis'] = data.playerGameInfo[i].cardsPast; // 玩家打出去的牌
            GameData.player[data.playerGameInfo[i].uid] = data.playerGameInfo[i];
            // 把新摸得牌加入到手牌中
            if (data.playerGameInfo[i].cardLastAssigned) {
                GameData.cards[data.playerGameInfo[i].uid]['hand'].push(data.playerGameInfo[i].cardLastAssigned);
                GameData.game.obtain = data.playerGameInfo[i].cardLastAssigned;
            } else {
                if (data.playerGameInfo[i].uid == GameData.player.uid) {
                    GameData.game.obtain = -1;
                }
            }
            if (data.playerGameInfo[i].isAssignedCard == 1) {
                GameData.cards[data.playerGameInfo[i].uid]['handnum']++;
            }

            //操作按钮
            if (data.playerGameInfo[i].operationList) {
                GameData.operations[data.playerGameInfo[i].uid] = data.playerGameInfo[i].operationList;
            }
            //听牌cards
            if (data.playerGameInfo[i].tingReady) {
                GameData.cards[data.playerGameInfo[i].uid]['tingData'] = data.playerGameInfo[i].tingReady;
            }else{
                GameData.cards[data.playerGameInfo[i].uid]['tingData'] = null;
            }

            //听牌状态
            if (data.playerGameInfo[i].isTing == 1 && data.playerGameInfo[i].isZiMoHuOnly == 1) {
                GameData.cards[data.playerGameInfo[i].uid]['tingState'] = 1;
            } else if (data.playerGameInfo[i].isTing == 1 && data.playerGameInfo[i].isZiMoHuOnly == 0) {
                GameData.cards[data.playerGameInfo[i].uid]['tingState'] = 2;
            } else if (data.playerGameInfo[i].isTing == 0 && data.playerGameInfo[i].isZiMoHuOnly == 0) {
                GameData.cards[data.playerGameInfo[i].uid]['tingState'] = 0;
            }


            //点炮特效
            if (data.playerGameInfo[i].isWin == 2) {
                sendEvent('dianPao', data.playerGameInfo[i].uid);
            }
        }

        //发送出牌消息!GameData.player[data.currentPlayCardUser].cardLastAssigned
        var disCardData = {userId: data.currentPlayCardUser, card: data.showCard[0]};
        if (!data.operation) {
            sendEvent('onCardDis', disCardData);
        }

        //同步特效Start***************************^&^********************************************//
        if (data.operation) {
            var EffectData = data.operation.operation;
            if (EffectData == HuaDian.OPERATION.OPERATION_GONGGANG
                || EffectData == HuaDian.OPERATION.OPERATION_ANGANG
                || EffectData == HuaDian.OPERATION.OPERATION_MINGGANG
                || EffectData == HuaDian.OPERATION.OPERATION_MINGGANG
                || EffectData == HuaDian.OPERATION.OPERATION_GONGGANG_TING
                || EffectData == HuaDian.OPERATION.OPERATION_ANGANG_TING
                || EffectData == HuaDian.OPERATION.OPERATION_MINGGANG_TING
                || EffectData == HuaDian.OPERATION.OPERATION_XUAN_FENG_GANG
                || EffectData == HuaDian.OPERATION.OPERATION_XI_GANG
                || EffectData == HuaDian.OPERATION.OPERATION_YAO_GANG
                || EffectData == HuaDian.OPERATION.OPERATION_JIU_GANG
                || EffectData == HuaDian.OPERATION.OPERATION_BU_XUAN_FENG_GANG
                || EffectData == HuaDian.OPERATION.OPERATION_BU_XI_GANG
                || EffectData == HuaDian.OPERATION.OPERATION_BU_YAO_GANG
                || EffectData == HuaDian.OPERATION.OPERATION_BU_JIU_GANG
            ) {
                //杠特效
                sendEvent('onCardGang', data.operation);
            } else if (EffectData == HuaDian.OPERATION.OPERATION_PENG
                || EffectData == HuaDian.OPERATION.OPERATION_PENG_TING) {
                //碰特效
                sendEvent('onCardPeng', data.operation);
            } else if (EffectData == HuaDian.OPERATION.OPERATION_DIANPAO_HU
                || EffectData == HuaDian.OPERATION.OPERATION_HU
                || EffectData == HuaDian.OPERATION.OPERATION_QIANGGANG_HU) {
                //胡特效
                sendEvent('onCardHu', data.operation);
            } else if (EffectData == HuaDian.OPERATION.OPERATION_CHI
                || EffectData == HuaDian.OPERATION.OPERATION_CHI_TING) {
                //吃特效
                sendEvent('onCardChi', data.operation);
            }
            if (EffectData == HuaDian.OPERATION.OPERATION_TING
                || EffectData == HuaDian.OPERATION.OPERATION_CHI_TING
                || EffectData == HuaDian.OPERATION.OPERATION_PENG_TING
                || EffectData == HuaDian.OPERATION.OPERATION_GONGGANG_TING
                || EffectData == HuaDian.OPERATION.OPERATION_ANGANG_TING
                || EffectData == HuaDian.OPERATION.OPERATION_MINGGANG_TING) {
                var tingType = {userId: data.currentPlayCardUser, type: EffectData};
                sendEvent('onCardTing', tingType);
                setTimeout(function () {
                    sendEvent('onCardDis', disCardData);
                }, 1000);

            }
        }
        //摸宝特效
        if (data.bao) {
            var _type = 0;
            if (data.bao.oldBaoCard != 1000 && data.bao.oldBaoCard != -1) {
                //换宝
                _type = 1;
                GameData.game.cardHuier1 = data.bao.baoCard;
            }
            if (data.bao.oldBaoCard == 0) {
                //打宝
                _type = 2;
            }
            var baoType = {uid: data.currentPlayCardUser, type: _type};
            sendEvent('onCardBao', baoType);
        }

        //设置宝牌
        if (data.baoCardId) {
            GameData.game.cardHuier1 = data.baoCardId;
        }
        //同步特效End***************************^&^********************************************//
        sendEvent('onGameTurn', data.onGoingUserId);
        sendEvent('onRegularCircle');

    });


    // 断线重连  (如果玩家在麻将游戏中会收到这条消息)
    GameNet.getInstance().setCallBack('onHuaDianMahjongReconnecet', function (data) {
        WriteLog("~~~~~~~~~~~onHuaDianMahjongReconnecetCC :~~~~~~~~~~~~~~" + JSON.stringify(data));
        GameData.game =  GameData.game || GameData.initGameData();
        GameData.game.gameStart = true;
        GameData.game.cardleft = data.remainCardCount;  //剩余手牌的数量
        GameData.game.initcards = true;
        GameData.game.turn = data.onGoingUserId; //该轮到谁出牌了
        GameData.game.checkPass = data;
        GameData.game.lastdisCard = data.showCard[data.showCard.length-1];
        GameData.game.lastdisUid = data.currentPlayCardUser;
        GameData.game.dataInfo = data;
        profileChangChun.gameInfo = data;
        // 初始化手牌
        for (var i = 0; i < data.playerGameInfo.length; i++) {
            GameData.cards[data.playerGameInfo[i].uid] = (GameData.cards[data.playerGameInfo[i].uid] === undefined) ? {} : GameData.cards[data.playerGameInfo[i].uid];
            GameData.cards[data.playerGameInfo[i].uid]['hand'] = data.playerGameInfo[i].handCards;
            GameData.cards[data.playerGameInfo[i].uid]['handnum'] = data.playerGameInfo[i].countOfHandCards;
            GameData.cards[data.playerGameInfo[i].uid]['chi'] = data.playerGameInfo[i].cardsChi; // 吃
            GameData.cards[data.playerGameInfo[i].uid]['peng'] = data.playerGameInfo[i].cardsPeng; // 碰
            GameData.cards[data.playerGameInfo[i].uid]['gang'] = data.playerGameInfo[i].cardsGang; // 杠
            GameData.cards[data.playerGameInfo[i].uid]['dis'] = data.playerGameInfo[i].cardsPast; // 玩家打出去的牌
            GameData.player[data.playerGameInfo[i].uid] = data.playerGameInfo[i];
            GameData.game.noActions = false;


            // 把新摸得牌加入到手牌中
            if (data.playerGameInfo[i].cardLastAssigned) {
                GameData.cards[data.playerGameInfo[i].uid]['hand'].push(data.playerGameInfo[i].cardLastAssigned);
                GameData.game.obtain = data.playerGameInfo[i].cardLastAssigned;
            }else{
                if (data.playerGameInfo[i].uid  == GameData.player.uid) {
                    GameData.game.obtain = -1;
                }
            }

            if (data.playerGameInfo[i].isAssignedCard == 1) {
                GameData.cards[data.playerGameInfo[i].uid]['handnum']++;
            }

            if (data.playerGameInfo[i].isBoss) {
                GameData.game.zhuangUid = data.playerGameInfo[i].uid;
            }

            //操作按钮
            if (data.playerGameInfo[i].operationList) {
                GameData.operations[data.playerGameInfo[i].uid] = data.playerGameInfo[i].operationList;
            }

            //听牌cards
            if (data.playerGameInfo[i].tingReady) {
                GameData.cards[data.playerGameInfo[i].uid]['tingData'] = data.playerGameInfo[i].tingReady;
            }else{
                GameData.cards[data.playerGameInfo[i].uid]['tingData'] = null;
            }
            //听牌状态
            if(data.playerGameInfo[i].isTing == 1 && data.playerGameInfo[i].isZiMoHuOnly == 1){
                GameData.cards[data.playerGameInfo[i].uid]['tingState'] = 1;
            }else if (data.playerGameInfo[i].isTing == 1 && data.playerGameInfo[i].isZiMoHuOnly == 0) {
                GameData.cards[data.playerGameInfo[i].uid]['tingState'] = 2;
            }else if (data.playerGameInfo[i].isTing == 0 && data.playerGameInfo[i].isZiMoHuOnly == 0) {
                GameData.cards[data.playerGameInfo[i].uid]['tingState'] = 0;
            }

        }
        //设置宝牌
        if (data.bao) {
            GameData.game.cardHuier1 = data.bao.baoCard;
        }

        sendEvent('onGameTurn',data.onGoingUserId);
        sendEvent('onHuaDianMahjongReconnecet');
    });

    // 小结算
    GameNet.getInstance().setCallBack('onMahjongRunEnd', function (data) {
        //WriteLog("~~~~~~~~~~~onMahjongRunEndCC :~~~~~~~~~~~~~~" + JSON.stringify(data));
        profileChangChun.resultData = data;
        for (var i = 0; i < data.playerRecord.length; i++) {
            GameData.cards[data.playerRecord[i].uid]['Resulthand'] = [];
            for (var j = 0; j<data.playerRecord[i].handCards.length; j++) {
                GameData.cards[data.playerRecord[i].uid]['Resulthand'].push({card:data.playerRecord[i].handCards[j],type:0});
            }
            GameData.cards[data.playerRecord[i].uid]['peng'] = data.playerRecord[i].pengCards; // 吃
            GameData.cards[data.playerRecord[i].uid]['gang'] = data.playerRecord[i].gangCards; // 碰
            GameData.cards[data.playerRecord[i].uid]['chi'] = data.playerRecord[i].chiCards; // 杠
            GameData.cards[data.playerRecord[i].uid]['handnum'] = data.playerRecord[i].handCards.length;
            GameData.cards[data.playerRecord[i].uid].hasCheckedBao = data.playerRecord[i].hasCheckedBao; //
            GameData.ResultScoreInfo[data.playerRecord[i].uid] = data.playerRecord[i].socreInfo; //结算得分信息
            GameData.scores[data.playerRecord[i].uid] = data.playerRecord[i].socreInfo.totalRunScore;
            GameData.ResultData[data.playerRecord[i].uid] = data.playerRecord[i];

            //将最后一张牌push到手牌
            if (data.playerRecord[i].cardLastAssigned) {
                GameData.cards[data.playerRecord[i].uid]['Resulthand'].push({card:data.playerRecord[i].cardLastAssigned[0],type:1});
                GameData.game.winnerObtain = data.playerRecord[i].cardLastAssigned;
                GameData.cards[data.playerRecord[i].uid]['handnum'] ++;
            }
        }
        GameData.game.gameStart = false;
        sendEvent('onMahjongRunEnd');
    });

    // 大结算
    GameNet.getInstance().setCallBack('onMahjongRoomEnd', function (data) {
        //WriteLog("~~~~~~~~~~~onMahjongRoomEndCC :~~~~~~~~~~~~~~" + JSON.stringify(data));
        for (var i = 0; i<data.playerList.length; i++) {
            GameData.SummaryData[data.playerList[i].uid] = data.playerList[i];
        }
        GameData.room.close = true;
        sendEvent('onShowSummary');
    });

    //错误信息
    GameNet.getInstance().setCallBack('onPushErrorMsg', function (data) {
        //WriteLog("~~~~~~~~~~~onPushErrorMsgCC  :~~~~~~~~~~~~~~" + JSON.stringify(data));
        sendEvent('onPushErrorMsg',data);
    });
};

profileChangChun.unregistAllMessage = function () {
    console.log("----- 注销长春消息");
    GameNet.getInstance().removeAllListeners('onMahjongStartRun');
    GameNet.getInstance().removeAllListeners('onHuaDianMahjongReconnecet');
    GameNet.getInstance().removeAllListeners('onMahjongStartRun');
    GameNet.getInstance().removeAllListeners('onRegularCircle');
    GameNet.getInstance().removeAllListeners('onHuaDianPiaoInfo');
    GameNet.getInstance().removeAllListeners('onMahjongRunEnd');
    GameNet.getInstance().removeAllListeners('onMahjongRoomEnd');
    GameNet.getInstance().removeAllListeners('onPushErrorMsg');
};

//返回玩家的操作列表
profileChangChun.getPlayerOperationsByUid = function(uid){
    //cc.log('GameData.operations:'+JSON.stringify(GameData.operations));
    for (var key in GameData.operations) {
        if (uid == key) {
            return GameData.operations[key];
        }
    }
    return null;
};
//返回玩家的听牌状态
profileChangChun.getTingStateByUid = function(uid){
    for (var key in GameData.cards) {
        if (uid == key) {
            if (GameData.cards[key]['tingState'] == 1 || GameData.cards[key]['tingState'] == 2) {
                return true;
            }else{
                return false;
            }
        }
    }
    return null;
};
//返回小结算得分描述
profileChangChun.getResultScoreInfoByUid = function(uid){
    for (var key in GameData.ResultScoreInfo) {
        if (uid == key) {
            return GameData.ResultScoreInfo[key];
        }
    }
    return null;
};

profileChangChun.canHu = function(){
    for (var key in GameData.operations) {
        if (GameData.player.uid == key) {
            var j = 0 ;
            for (var i = 0; i< GameData.operations[key].length ;i++) {
                if(GameData.operations[key][i] == HuaDian.OPERATION.OPERATION_DIANPAO_HU
                    ||GameData.operations[key][i] == HuaDian.OPERATION.OPERATION_HU
                    ||GameData.operations[key][i] == HuaDian.OPERATION.OPERATION_QIANGGANG_HU) {
                    return true;
                }else{
                    j ++ ;
                }
            }
            if (j == GameData.operations[key].length) {
                return false;
            }
        }
    }
    return null;
};

profileChangChun.canGang = function(){
    for (var key in GameData.operations) {
        if (GameData.player.uid == key) {
            var j = 0;
            for (var i = 0; i< GameData.operations[key].length ;i++) {
                if(parseInt(GameData.operations[key][i]) == HuaDian.OPERATION.OPERATION_GONGGANG
                    ||parseInt(GameData.operations[key][i]) == HuaDian.OPERATION.OPERATION_ANGANG
                    ||parseInt(GameData.operations[key][i]) == HuaDian.OPERATION.OPERATION_MINGGANG) {
                    return true;
                }else{
                    j ++ ;
                }
            }
            if (j == GameData.operations[key].length) {
                return false;
            }
        }
    }
    return null;
};

profileChangChun.canTing = function(){
    for (var key in GameData.operations) {
        if (GameData.player.uid == key) {
            for (var i = 0; i< GameData.operations[key].length ;i++) {
                var j = 0;
                if(GameData.operations[key][i] ==  HuaDian.OPERATION.OPERATION_TING
                    ||GameData.operations[key][i] == HuaDian.OPERATION.OPERATION_CHI_TING
                    ||GameData.operations[key][i] == HuaDian.OPERATION.OPERATION_GONGGANG_TING
                    ||GameData.operations[key][i] == HuaDian.OPERATION.OPERATION_ANGANG_TING
                    ||GameData.operations[key][i] == HuaDian.OPERATION.OPERATION_MINGGANG_TING
                    ||GameData.operations[key][i] == HuaDian.OPERATION.OPERATION_PENG_TING) {
                    return true;
                }else{
                    j ++ ;
                }
            }
            if (j == GameData.operations[key].length) {
                return false;
            }
        }
    }
    return null;
};

profileChangChun.getGangCardByUid = function (uid,GangType) {
    var handCard = GameData.getHandCards(uid);
    var pengCard = GameData.getPengCards(uid);
    var gangData = {};
    var cardArray = [];
    var gangCards = [];
    var isXiaoji = GameData.room.opts.xiaoJiFeiDan;
    //判断杠
    // gangData = {card:12,type:1};type  0 明杠 1 暗杠 -1 其他
    switch  (parseInt(GangType)) {
        case HuaDian.OPERATION.OPERATION_MINGGANG:
        //判断明杠
            for (var key in pengCard) {
                for (var i = 0; i<handCard.length; i++) {
                    if (pengCard[key].cards[0] == handCard[i]) {
                        gangData = {card:handCard[i],type:0};
                        return gangData ;
                        break;
                    }
                }
            }
            break;
        case HuaDian.OPERATION.OPERATION_ANGANG:
            //判断暗杠(手中有3张或4张同样的牌)
            handCard.sort();
            for (var i = 0; i<handCard.length; i++) {
                //暗杠
                if (handCard[i] == handCard[i+1] && handCard[i] == handCard[i+2] && handCard[i] == handCard[i+3]) {
                    gangData = {card:handCard[i],type:1};
                    return gangData ;
                    break;
                }
            }
            break;
        case HuaDian.OPERATION.OPERATION_GONGGANG:
            //判断公杠
            handCard.sort();
            for (var i = 0; i<handCard.length; i++) {
                if (handCard[i] == handCard[i+1] && handCard[i] == handCard[i+2]) {
                    //杠到的公杠
                    if (handCard[i] == GameData.game.lastdisCard) {
                        gangData = {card:GameData.game.lastdisCard,type:0};
                        return gangData ;
                        break;
                    }
                }
            }
            break;
        case HuaDian.OPERATION.OPERATION_XUAN_FENG_GANG:
            //判断旋风杠
            cardArray = this.removerepeat(handCard);
            for (var i = 0; i<cardArray.length; i++) {
                if (cardArray[i] == 31 || cardArray[i] == 41 || cardArray[i] == 51 || cardArray[i] == 61){
                    if (gangCards.length < 3) {
                        gangCards.push(cardArray[i]);
                    }
                }
            }
            //2风带一鸡
            if (gangCards.length == 2 && cardArray.indexOf(1) !== -1) {
                gangCards.push(1);
            }
            //1风带二鸡
            var isTwoji = this.isHasTwoJiToHandcard();
            if (gangCards.length == 1 && isTwoji) {
                for (var j = 0; j<2; j++) {
                    gangCards.push(1);
                }
            }
            if (gangCards.length == 3) {
                gangData = {card:gangCards,type:-1};
                return gangData;
            }
            break;
        case HuaDian.OPERATION.OPERATION_XI_GANG:
            //判断囍杠
            cardArray = this.removerepeat(handCard);
            for (var i = 0; i<cardArray.length; i++) {
                if (cardArray[i] == 71 || cardArray[i] == 81 || cardArray[i] == 91){
                    if (gangCards.length < 3) {
                        gangCards.push(cardArray[i]);
                    }
                }
            }
            //2字带一鸡
            if (gangCards.length == 2 && cardArray.indexOf(1) !== -1) {
                gangCards.push(1);
            }
            //1字带二鸡
            var isTwoji = this.isHasTwoJiToHandcard();
            if (gangCards.length == 1 && isTwoji) {
                for (var j = 0; j<2; j++) {
                    gangCards.push(1);
                }
            }
            if (gangCards.length == 3) {
                gangData = {card:gangCards,type:-1};
                return gangData;
            }
            break;
        case HuaDian.OPERATION.OPERATION_YAO_GANG:
            //判断幺杠
            cardArray = this.removerepeat(handCard);
            for (var i = 0; i<cardArray.length; i++) {
                if (cardArray[i] == 1 || cardArray[i] == 11 || cardArray[i] == 21){
                    if (gangCards.length < 3) {
                        gangCards.push(cardArray[i]);
                    }
                }
            }
            //2幺带一鸡
            if (gangCards.length == 2 && cardArray.indexOf(1) !== -1) {
                gangCards.push(1);
            }
            //1幺带二鸡
            var isTwoji = this.isHasTwoJiToHandcard();
            if (gangCards.length == 1 && isTwoji) {
                for (var j = 0; j<2; j++) {
                    gangCards.push(1);
                }
            }
            if (gangCards.length == 3) {
                gangData = {card:gangCards,type:-1};
                return gangData;
            }
            break;
        case HuaDian.OPERATION.OPERATION_JIU_GANG:
            //判断九杠
            cardArray = this.removerepeat(handCard);
            for (var i = 0; i<cardArray.length; i++) {
                if (cardArray[i] == 9 || cardArray[i] == 19 || cardArray[i] == 29){
                    if (gangCards.length < 3) {
                        gangCards.push(cardArray[i]);
                    }
                }
            }
            //2九带一鸡
            if (gangCards.length == 2 && cardArray.indexOf(1) !== -1) {
                gangCards.push(1);
            }
            //1九带二鸡
            var isTwoji = this.isHasTwoJiToHandcard();
            if (gangCards.length == 1 && isTwoji) {
                for (var j = 0; j<2; j++) {
                    gangCards.push(1);
                }
            }
            if (gangCards.length == 3) {
                gangData = {card:gangCards,type:-1};
                return gangData;
            }
            break;
        case HuaDian.OPERATION.OPERATION_BU_XUAN_FENG_GANG:
            //判断补风杠
            cardArray = this.removerepeat(handCard);
            for (var i = 0; i<cardArray.length; i++) {
                if (cardArray[i] == 31 || cardArray[i] == 41 || cardArray[i] == 51 || cardArray[i] == 61){
                    gangCards.push([cardArray[i]]);
                }
                if (isXiaoji && cardArray[i] == 1) {
                    gangCards.push([cardArray[i]]);
                }
            }
            gangData = {card:gangCards,type:-1};
            return gangData;
            break;
        case HuaDian.OPERATION.OPERATION_BU_XI_GANG:
            //判断补喜杠
            cardArray = this.removerepeat(handCard);
            for (var i = 0; i<cardArray.length; i++) {
                if (cardArray[i] == 71 || cardArray[i] == 81 || cardArray[i] == 91){
                    gangCards.push([cardArray[i]]);
                }
                if (isXiaoji && cardArray[i] == 1) {
                    gangCards.push([cardArray[i]]);
                }
            }
            gangData = {card:gangCards,type:-1};
            return gangData;
            break;
        case HuaDian.OPERATION.OPERATION_BU_YAO_GANG:
            //判断补幺杠
            cardArray = this.removerepeat(handCard);
            for (var i = 0; i<cardArray.length; i++) {
                if (cardArray[i] == 1 || cardArray[i] == 11 || cardArray[i] == 21){
                    gangCards.push([cardArray[i]]);
                }
            }
            gangData = {card:gangCards,type:-1};
            return gangData;
            break;
        case HuaDian.OPERATION.OPERATION_BU_JIU_GANG:
            //判断补九杠
            cardArray = this.removerepeat(handCard);
            for (var i = 0; i<cardArray.length; i++) {
                if (cardArray[i] == 9 || cardArray[i] == 19 || cardArray[i] == 29){
                    gangCards.push([cardArray[i]]);
                }
                if (isXiaoji && cardArray[i] == 1) {
                    gangCards.push([cardArray[i]]);
                }
            }
            gangData = {card:gangCards,type:-1};
            return gangData;
            break;
    }
};
//数组去重
profileChangChun.removerepeat = function (array){
    array.sort(); //先排序
    var res = [array[0]];
    for(var i = 1; i < array.length; i++){
        if(array[i] !== res[res.length - 1]){
            res.push(array[i]);
        }
    }
    return res;
};
//数组过滤
/**
 *
 * @param array1 数组1
 * @param array2    数组2
 * @returns {Array} 过滤后的数组
 */
profileChangChun.guolv = function(array1,array2){
    var array =[];
    array2 = this.removerepeat(array2);
    for (var i = 0; i<array2.length; i++) {
        if (array1.indexOf(array2[i]) == -1) {
            array.push(array2[i]);
        }
    }
    //cc.log('过滤后的数组：'+array);
    return array;
};

/*
 判断数组元素是否相等
 */
profileChangChun.isAllEqual =function (array) {
    var firstNum = array[0];
    return allsame = array.every(function(x){
        return x == firstNum;
    });
};

//判断数组是否有2个幺鸡
profileChangChun.isHasTwoJiToHandcard = function () {
    var handCards = GameData.getMyHandCards();
    handCards.sort(function(a,b){
        return a-b;
    });
    if (handCards[0] == handCards[1] == 1) {
        return true;
    }else{
        return false;
    }
};

profileChangChun.summaryDataByUid = function(uid) {
    for (var key in GameData.SummaryData) {
        if (key == uid) {
            return GameData.SummaryData[key];
        }
    }
    return null;
};

profileChangChun.checkIsTingPlayer = function() {
    var i = 0;
    for (var key in GameData.cards) {
        if (GameData.cards[key]['tingState'] == 1 || GameData.cards[key]['tingState'] == 2) {
            return true;
        }
        i++;
    }
    if (i == Object.keys(GameData.cards).length) {
        return false;
    }
};

//应产品要求显示下家提示改为：
//轮到非下家操作时提示仍然在本家显示
//轮到下家操作自然而然轮到下家 mmp ~&~!
profileChangChun.getTurnByUid = function () {
    var isNextPlayer = profileChangChun.isNextPlayer(GameData.game.lastdisUid,GameData.game.turn);
    if (isNextPlayer) {
        return  GameData.game.turn;
    }else{
        return GameData.game.lastdisUid;
    }
};

profileChangChun.isNextPlayer = function (CurrUid,nextUid) {
    if (CurrUid == null) {
        return true;
    }
    var currIndex = GameData.getPlayerIndex (CurrUid);
    var nextIndex = GameData.getPlayerIndex (nextUid);

    if (currIndex == GameData.joiners.length-1 && nextIndex == 0) {
        return true;
    }else{
        if ((nextIndex - currIndex) == 1) {
            return true;
        }else{
            return false;
        }
    }

    return null;
};
/**
 * 返回碰杠玩家的位置来源
 * @param uid1 有吃碰杠玩家id
 * @param uid2  吃碰杠牌来源玩家id
 * @returns {number}
 */
profileChangChun.getCardIndexByUid = function (uid1,uid2) {
    var currInde = GameData.getPlayerIndex(uid1);
    var comeInde = GameData.getPlayerIndex(uid2);
    var distance = currInde - comeInde;
    //cc.log(currInde + '222' +comeInde);
    var index = 0;
    if (GameData.room.opts.joinermax == 2) {
        index = 2;
        return index;
    }else {
        switch (distance){
            case 1:
                index = 1;
                break;
            case -1:
                index = 3;
                break;
            case 2:
                index = 2;
                break;
            case -2:
                index = 2;
                break;
            case -3:
                index = 1;
                break;
            case 3:
                index = 3;
                break;
            default:break;
        }
        return index;
    }

};

//获得杠的得分
//明蛋：1分（三家给）
//暗蛋：2分（三家给）
//旋风杠，幺九杠，喜杠，亮出加1分，每补一次加1分（三家给）
//幺鸡蛋、一筒蛋、红中蛋、发财蛋、白板蛋：明的，获得的番数+2，暗的，获得的番数+8（三家给）1,2,8
var spacialGang = [1,21,71,81,91];
profileChangChun.getGangSorce = function(gangArray) {
    var score = 0;
    if(gangArray == null || gangArray == undefined){
        return null;
    }

    if ((gangArray.length == 5 && this.isAllEqual(gangArray) && spacialGang.indexOf(gangArray[0]) == -1)
        ||(gangArray.length == 4 && this.isAllEqual(gangArray) && spacialGang.indexOf(gangArray[0]) != -1))
    {
        //暗杠+2 特殊明杠+2
        score += 2;
    }else if (gangArray.length == 5 && spacialGang.indexOf(gangArray[0]) != -1 && this.isAllEqual(gangArray)) {
        // 特殊暗杠+8
        score += 4;
    }else if (gangArray.length >= 3 && !this.isAllEqual(gangArray)){
        //特殊杠+1 补几次杠+几次
        for (var i = 2; i<gangArray.length ;i++) {
            score++;
        }
    }else{
        //其他+1
        score++;
    }
    return score;
};

profileChangChun.getHuType = function(){
   if(!GameData.ResultData){
       cc.log('data is undefine..');
       return ;
   }
    for(var key in GameData.ResultData) {
        if (GameData.ResultData[key].isWin == 1 || GameData.ResultData[key].isWin == 3) {
            return GameData.ResultData[key].isWin;
        }
    }
};

//var a = [1,1,19];
//var b = [1,1,19,19,29,29];
//function isShunzi (arrary){
//    arrary.sort((a,b)=>{return a-b;});
//    var firstNum = arrary[0];
//    arrary.shift();
//    return arrary.every((Value,index,arry)=>{
//        return Value == firstNum + (index+1);
//    });
//}

//console.log(b.indexOf(29));

