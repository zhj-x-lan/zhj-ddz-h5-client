
var profileHuaDian = profileHuaDian || {};

profileHuaDian.init = function () {
    this.registAllMessage();
    this.initCreateRoomOpts();
    this.initData();
};
profileHuaDian.initData = function () {
    this.initGameData();
    this.initRoomData();
}
profileHuaDian.initGameData = function () {
    profileHuaDian.PiaoInfo = {};
}
profileHuaDian.initRoomData = function () {
    profileHuaDian.roomInfo = {};
    profileHuaDian.resultData = {};
    profileHuaDian.roomInfo.isPiaoFinish = false;
    cc.log('init Hd roomData');
};

profileHuaDian.initCreateRoomOpts = function () {

    var data = cc.sys.localStorage.getItem('createRoomOpts_huadian');
    if (data != null) {
        profileHuaDian.createRoomOpts = JSON.parse(data);
        return;
    }
    profileHuaDian.createRoomOpts = {};

    // 桦甸麻将
    // gameType1：天津麻将 1：石狮麻将 3：十三水 4：衡水麻将 5：妞妞 6：桦甸麻将
    // 回合类型61：6局 62：12局 63：24局 64：1圈 65：2圈 66：4圈（默认24局.两人默认2圈）
    profileHuaDian.createRoomOpts.roundRule = 63;
    profileHuaDian.createRoomOpts.roundType = 1;
    profileHuaDian.createRoomOpts.roundMax = 16;
    // 扣钻类型 //房主付费1/AA付费2/赢家付费3/代开房付费4
    profileHuaDian.createRoomOpts.costType = 1;
    // 最大人数，默认2人
    profileHuaDian.createRoomOpts.joinermax = 2;
    profileHuaDian.createRoomOpts.clubId = null;
    profileHuaDian.createRoomOpts.scoreBase = 1;
    profileHuaDian.createRoomOpts.bossType = 1;
    // 大小番 默认大番 0：小番 1：大番
    profileHuaDian.createRoomOpts.isBigFan = 1;
    // 漂 默认不带 0为不带漂 1为带漂
    profileHuaDian.createRoomOpts.piao = 0;
    //摸宝加分 默认不带 0为不带漂 1为带漂
    profileHuaDian.createRoomOpts.mobaojiafen = 0;
    // 暗宝 0：明宝 1：暗宝
    profileHuaDian.createRoomOpts.anBao = 1;
    // 分张 0：不分张 1：分张
    profileHuaDian.createRoomOpts.fenZhang = 0;
    //搂点炮翻倍
    profileHuaDian.createRoomOpts.isLouDianPaoDouble = 0;
    //金币模式等级
    profileHuaDian.createRoomOpts.scoreLv = 0;
};

profileHuaDian.saveCreateRoomOpts = function () {
    if (profileHuaDian.createRoomOpts == null || profileHuaDian.createRoomOpts == undefined) return;
    cc.log("saveCreateRoomOpts=" + JSON.stringify(profileHuaDian.createRoomOpts));
    cc.sys.localStorage.setItem('createRoomOpts_huadian', JSON.stringify(profileHuaDian.createRoomOpts));
};

profileHuaDian.registAllMessage = function () {
    //profileChangChun.unregistAllMessage();
    console.log("----- 初始化桦甸消息");
    // 游戏开局
    GameNet.getInstance().setCallBack('onMahjongStartRun', function (data) {
        WriteLog("~~~~~~~~~~~onMahjongStartRunHD :~~~~~~~~~~~~~~" + JSON.stringify(data));
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

            //累计得分
            //GameData.allScores[data.playerGameInfo[i].uid] = data.playerGameInfo[i].totalScore;
        }
        //cc.log('GameData.cards:'+JSON.stringify(GameData.cards));
        GameData.game.initcards = true;
        //GameData.game.gameStart = true;
        sendEvent('onGameTurn',data.onGoingUserId);
        sendEvent('initZhuangInfo');
        sendEvent('onMahjongStartRun');
    });
    //同步玩家开局前飘的状态
    GameNet.getInstance().setCallBack('onHuaDianPiaoInfo', function (data) {
        WriteLog("~~~~~~~~~~~onHuaDianPiaoInfoHD :~~~~~~~~~~~~~~" + JSON.stringify(data));
        profileHuaDian.PiaoInfo = data;
        //var isFinish = false;
        //var i = 0;
        //for (var j = 0; j<profileHuaDian.PiaoInfo.result.length; j++) {
        //    if (profileHuaDian.PiaoInfo.result[j].hasPiao > -1) {
        //        i++;
        //    }
        //}
        //if (i == profileHuaDian.PiaoInfo.result.length) {
        //    isFinish = true;
        //}
        cc.log('profileHuaDian.roomInfo.isPiaoFinish:'+profileHuaDian.roomInfo.isPiaoFinish);
        if (data.runState >= HuaDian.RunStateEmnum.PIAO && !profileHuaDian.roomInfo.isPiaoFinish) {
            sendEvent('onStarPiao');
            if (data.runState == HuaDian.RunStateEmnum.BEGIN) {
                profileHuaDian.roomInfo.isPiaoFinish = !profileHuaDian.roomInfo.isPiaoFinish;
            }
        }
    });


    // 同步玩家操作信息
    GameNet.getInstance().setCallBack('onRegularCircle', function (data) {
        WriteLog("~~~~~~~~~~~onRegularCircleHD :~~~~~~~~~~~~~~" + JSON.stringify(data));

        GameData.game.cardleft = data.remainCardCount;  //剩余手牌的数量
        GameData.game.turn = data.onGoingUserId;
        GameData.game.checkPass = data;
        GameData.game.lastdisCard = data.showCard[0];
        GameData.game.lastdisUid = data.currentPlayCardUser;

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
                || EffectData == HuaDian.OPERATION.OPERATION_MINGGANG_TING) {
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
        WriteLog("~~~~~~~~~~~onHuaDianMahjongReconnecetHD :~~~~~~~~~~~~~~" + JSON.stringify(data));
        GameData.game =  GameData.game || GameData.initGameData();
        GameData.game.gameStart = true;
        GameData.game.cardleft = data.remainCardCount;  //剩余手牌的数量
        GameData.game.initcards = true;
        GameData.game.turn = data.onGoingUserId; //该轮到谁出牌了
        GameData.game.checkPass = data;
        GameData.game.lastdisCard = data.showCard[data.showCard.length-1];
        GameData.game.lastdisUid = data.currentPlayCardUser;

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

            //累计得分
            //GameData.allScores[data.playerGameInfo[i].uid] = data.playerGameInfo[i].roomScore;

        }
        //设置宝牌
        if (data.baoCardId) {
            GameData.game.cardHuier1 = data.baoCardId;
        }
        sendEvent('onGameTurn',data.onGoingUserId);
        sendEvent('onHuaDianMahjongReconnecet');
    });

    // 小结算
    GameNet.getInstance().setCallBack('onMahjongRunEnd', function (data) {
        WriteLog("~~~~~~~~~~~onMahjongRunEndHD :~~~~~~~~~~~~~~" + JSON.stringify(data));
        profileHuaDian.resultData = data;
        profileHuaDian.roomInfo.isPiaoFinish = false;
        for (var i = 0; i < data.playerRecord.length; i++) {
            GameData.cards[data.playerRecord[i].uid]['Resulthand'] = [];
            for (var j = 0; j<data.playerRecord[i].handCards.length; j++) {
                GameData.cards[data.playerRecord[i].uid]['Resulthand'].push({card:data.playerRecord[i].handCards[j],type:0});
            }
            GameData.cards[data.playerRecord[i].uid]['peng'] = data.playerRecord[i].pengCards; // 吃
            GameData.cards[data.playerRecord[i].uid]['gang'] = data.playerRecord[i].gangCards; // 碰
            GameData.cards[data.playerRecord[i].uid]['chi'] = data.playerRecord[i].chiCards; // 杠
            GameData.cards[data.playerRecord[i].uid]['handnum'] = data.playerRecord[i].handCards.length;
            GameData.ResultScoreInfo[data.playerRecord[i].uid] = data.playerRecord[i].socreInfo; //结算得分信息
            GameData.scores[data.playerRecord[i].uid] = data.playerRecord[i].socreInfo.totalRunScore;
            GameData.ResultData[data.playerRecord[i].uid] = data.playerRecord[i];

            //将最后一张牌push到手牌
            if (data.playerRecord[i].cardLastAssigned) {
                GameData.cards[data.playerRecord[i].uid]['Resulthand'].push({card:data.playerRecord[i].cardLastAssigned[0],type:1});
                GameData.game.winnerObtain = data.playerRecord[i].cardLastAssigned;
                GameData.cards[data.playerRecord[i].uid]['handnum'] ++;
            }
            //累计得分
            //GameData.allScores[data.playerRecord[i].uid] = data.playerRecord[i].roomScore;
        }
        GameData.game.gameStart = false;
        sendEvent('onMahjongRunEnd');
    });

    // 大结算
    GameNet.getInstance().setCallBack('onMahjongRoomEnd', function (data) {
        WriteLog("~~~~~~~~~~~onMahjongRoomEnd :~~~~~~~~~~~~~~" + JSON.stringify(data));
        for (var i = 0; i<data.playerList.length; i++) {
            GameData.SummaryData[data.playerList[i].uid] = data.playerList[i];
        }
        GameData.room.close = true;
        sendEvent('onShowSummary');
    });

    //错误信息
    GameNet.getInstance().setCallBack('onPushErrorMsg', function (data) {
        WriteLog("~~~~~~~~~~~onPushErrorMsgHD  :~~~~~~~~~~~~~~" + JSON.stringify(data));
        sendEvent('onPushErrorMsg',data);
    });
};


profileHuaDian.unregistAllMessage = function () {
    console.log("----- 注销桦甸消息");
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
profileHuaDian.getPlayerOperationsByUid = function(uid){
    cc.log('GameData.operations:'+JSON.stringify(GameData.operations));
    for (var key in GameData.operations) {
        if (uid == key) {
            return GameData.operations[key];
        }
    }
    return null;
};
//返回玩家的听牌状态
profileHuaDian.getTingStateByUid = function(uid){
    //cc.log('GameData.operations:'+JSON.stringify(GameData.operations));
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
profileHuaDian.getResultScoreInfoByUid = function(uid){
    //cc.log('getResultScoreInfoByUid:'+JSON.stringify(GameData.ResultScoreInfo));
    for (var key in GameData.ResultScoreInfo) {
        if (uid == key) {
            return GameData.ResultScoreInfo[key];
        }
    }
    return null;
};

profileHuaDian.canHu = function(){
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

profileHuaDian.canGang = function(){
    for (var key in GameData.operations) {
        if (GameData.player.uid == key) {
            var j = 0;
            for (var i = 0; i< GameData.operations[key].length ;i++) {
                if(GameData.operations[key][i] == HuaDian.OPERATION.OPERATION_GONGGANG
                    ||GameData.operations[key][i] == HuaDian.OPERATION.OPERATION_ANGANG
                    ||GameData.operations[key][i] == HuaDian.OPERATION.OPERATION_MINGGANG) {
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

profileHuaDian.canTing = function(){
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

profileHuaDian.getGangCardByUid = function (uid,type) {
    var handCard = GameData.getHandCards(uid);
    var pengCard = GameData.getPengCards(uid);
    var gangData = {};
    //判断杠
    //type  0 明杠 1 暗杠
    switch  (type) {
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

    }
};

profileHuaDian.summaryDataByUid = function(uid) {
    for (var key in GameData.SummaryData) {
        if (key == uid) {
            return GameData.SummaryData[key];
        }
    }
    return null;
};

profileHuaDian.checkIsTingPlayer = function() {
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
profileHuaDian.getTurnByUid = function () {
    var isNextPlayer = profileHuaDian.isNextPlayer(GameData.game.lastdisUid,GameData.game.turn);
    if (isNextPlayer) {
        return  GameData.game.turn;
    }else{
        return GameData.game.lastdisUid;
    }
};

profileHuaDian.isNextPlayer = function (CurrUid,nextUid) {
    if (!CurrUid) {
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

profileHuaDian.getPiaoStateByUid = function (uid) {
    for (var key in profileHuaDian.PiaoInfo.result) {
        if (profileHuaDian.PiaoInfo.result[key].userId == uid){
            return profileHuaDian.PiaoInfo.result[key].hasPiao;
        }
    }

};
//房间玩家全部选择飘
profileHuaDian.allPiaoState = function () {
    var i = 0;
    for (var key in profileHuaDian.PiaoInfo.result) {
        if (profileHuaDian.PiaoInfo.result[key].hasPiao == 2){
            i++;
        }
    }
    if (i == Object.keys(profileHuaDian.PiaoInfo.result).length){
        return true;
    }else{
        return false;
    }

};
/**
 * 返回碰杠玩家的位置来源
 * @param uid1 有吃碰杠玩家id
 * @param uid2  吃碰杠牌来源玩家id
 * @returns {number}
 */
profileHuaDian.getCardIndexByUid = function (uid1,uid2) {
    var currInde = GameData.getPlayerIndex(uid1);
    var comeInde = GameData.getPlayerIndex(uid2);
    var distance = currInde - comeInde;
    cc.log(currInde + '222' +comeInde);
    var index = 0;
    if (GameData.room.opts.joinermax == 2) {
        index = 2;
        return index;
    }else {
        switch (distance){
            case 1:index = 1;
                break;
            case -1:index = 3;
                break;
            case 2:index = 2;
                break;
            case -2:index = 2;
                break;
            case -3:index = 1;
                break;
            case 3:index = 3;
                break;
            default :break;
        }
        return index;
    }

};
