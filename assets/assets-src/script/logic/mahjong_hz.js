var mahjong = require('mahjong');
var util = require('utils');
var hongzhongData = require('hongzhongData');

var CardsType = {
	CT_None: 0
};

var HongZhongMj = function () {
	mahjong.call(this);
};
util.inherits(HongZhongMj, mahjong);

module.exports = HongZhongMj;

HongZhongMj.prototype.getCardNumber = function(HandCards,cardId){
    var number = 0;
    if(HandCards == undefined || cardId <= 0){
        return number;
    }
    for(var ii = 0;ii < HandCards.length;ii++){
        if(HandCards[ii] == cardId){
            number++;
        }
    }
    return number;
};
HongZhongMj.prototype.isHuier = function (cardId) {
    var gameInfoData = hongzhongData.getGameInfoData();
    if(gameInfoData){
        if(gameInfoData.wildcard){
            for(var ii = 0;ii < gameInfoData.wildcard.length;ii++){
                if(cardId == gameInfoData.wildcard[ii]){
                    return true;
                }
            }
        }
    }
    return false;
};
HongZhongMj.prototype.canChi = function (uid,card) {
    var chiCards = [];
    var HandCards = hongzhongData.getHandCards(uid);
    if(HandCards == undefined || card <= 0){
        return chiCards;
    }
    var c1 = card - 2,
        c2 = card - 1,
        c3 = card - 0 + 1,
        c4 = card - 0 + 2;
    if (!this.isHuier(c1)
        && !this.isHuier(c2)
        && this.getCardNumber(HandCards,c1) > 0
        && this.getCardNumber(HandCards,c2) > 0)
    {
        chiCards.push([c1, c2]);
    }
    if (!this.isHuier(c2)
        && !this.isHuier(c3)
        && this.getCardNumber(HandCards,c2) > 0
        && this.getCardNumber(HandCards,c3) > 0)
    {
        chiCards.push([c2, c3]);
    }
    if (!this.isHuier(c3)
        && !this.isHuier(c4)
        && this.getCardNumber(HandCards,c3) > 0
        && this.getCardNumber(HandCards,c4) > 0)
    {
        chiCards.push([c3, c4]);
    }
    cc.log("....chi:"+JSON.stringify(chiCards));
    return chiCards;
};
HongZhongMj.prototype.canAnGang = function(uid){
	var gangCards = [];

    var HandCards = hongzhongData.getHandCards(uid);
    if(HandCards == undefined){
        return gangCards;
    }

    for(var ii = 0;ii < HandCards.length;ii++){
        var cardId = HandCards[ii];
        if(cardId == undefined || cardId <= 0){
        	continue;
		}
    	var number = this.getCardNumber(HandCards,cardId);
        if(number >= 4){
        	if(this.getCardNumber(gangCards,cardId) > 0){
        		continue;
			}
        	gangCards.push(cardId);
		}
    }
    cc.log("....anGang:"+JSON.stringify(gangCards));
	return gangCards;
};
HongZhongMj.prototype.canBuGang = function(uid){
    var gangCards = [];

    var HandCards = hongzhongData.getHandCards(uid);
    var PengCards = hongzhongData.getPengCards(uid);
    if(PengCards == undefined || HandCards == undefined){
        return gangCards;
    }

    for(var ii = 0;ii < PengCards.length;ii++){
        var cardObject = PengCards[ii];
        if(cardObject == undefined || Object.keys(cardObject).length <= 0){
            continue;
        }
        var cardArray = cardObject.cards;
        if(cardArray == undefined || cardArray.length <= 0){
        	continue;
		}
		var cardId = cardArray[0];
        var number = this.getCardNumber(HandCards,cardId);
        if(number >= 1){
            gangCards.push(cardId);
        }
    }
    cc.log("....buGang:"+JSON.stringify(gangCards));
    return gangCards;
};