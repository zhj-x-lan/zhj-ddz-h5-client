var mahjong = require('mahjong');
var util = require('utils');

var GangType = {
    GT_MING_GANG:0, // 隴話
    GT_AN_GANG:1,   //做話
    GT_FENG_GANG:2, //唅瑞話
    GT_XI_GANG:3,   //炰話
    GT_YAO_GANG:4,  //誻話
    GT_JIU_GANG:5   //嬝話
};

var ChangChunMj = function() {
    mahjong.call(this);
};
util.inherits(ChangChunMj, mahjong);

module.exports = ChangChunMj;

ChangChunMj.prototype.canChi = function(uid, card) {
    var chiCards = [];
    var handcard = GameData.getMyHandCards();
    //杅郪�皮�
    handcard.sort(); //珂齬唗
    var res = [handcard[0]];
    for(var i = 1; i < handcard.length; i++){
        if(handcard[i] !== res[res.length - 1]){
            res.push(handcard[i]);
        }
    }
    var c1 = card-2, c2 = card-1, c3 = card-0+1, c4 = card-0+2;

    for (var i = 0; i< res.length; i++) {
        if (c1 == res[i]) {
            for (var j = 0; j<res.length; j++) {
                if (c2 == res[j]) {
                    chiCards.push([c1, c2]);
                    break;
                }
            }
        }
    }

    for (var i = 0; i< res.length; i++) {
        if (c2 == res[i]) {
            for (var j = 0; j<res.length; j++) {
                if (c3 == res[j]) {
                    chiCards.push([c2, c3]);
                    break;
                }
            }
        }
    }

    for (var i = 0; i< res.length; i++) {
        if (c3 == res[i]) {
            for (var j = 0; j<res.length; j++) {
                if (c4 == res[j]) {
                    chiCards.push([c3, c4]);
                    break;
                }
            }
        }
    }

    return chiCards;
}

ChangChunMj.prototype.canDianPao = function(uid, card) {

}

ChangChunMj.prototype.isHuier = function(card) {
    if (GameData.game.cardHuier1 == card) return true;
    //if (GameData.game.cardHuier2 == card) return true;
    return false;
}

ChangChunMj.prototype.canHu = function(handcards, obCard, checkFlag) {
    //if (GameData.player.isXiangGong) {
    //    return false;
    //}
    return mahjong.prototype.canHu.call(this, handcards, obCard, checkFlag);
}




ChangChunMj.prototype.getGangCardsByType = function(type) {

}





