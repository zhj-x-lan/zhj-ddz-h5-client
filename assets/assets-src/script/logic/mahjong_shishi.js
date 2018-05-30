var mahjong = require('mahjong');
var util = require('utils');

var CardsType = {
  CT_None: 0,
  CT_Sudao: 1,		//速到
  CT_Zimo: 2,		//自摸
  CT_Dizhen: 3,		//地震
  CT_Mingyou: 4,	//明游
  CT_Anyou1: 5,		//暗游1
  CT_Anyou2: 6,		//暗游2
  CT_Anyou3: 7,		//暗游3
};

var ShishiMj = function() {
	mahjong.call(this);
};
util.inherits(ShishiMj, mahjong);

module.exports = ShishiMj;

ShishiMj.prototype.isHuier = function(card) {
	return GameData.game.cardHuier1 == card;
}

ShishiMj.prototype.canChi = function(uid, card) {
	for (var i in GameData.cards) {
		var youNum = GameData.cards[i]['youNum'];
		if (youNum > 0) return false;
	}
	var ret = mahjong.prototype.canChi.call(this, uid, card);
	return ret;
}

ShishiMj.prototype.canPeng = function(uid, card) {
	for (var i in GameData.cards) {
		var youNum = GameData.cards[i]['youNum'];
		if (youNum > 0) return false;
	}
	var ret = mahjong.prototype.canPeng.call(this, uid, card);
	return ret;
}

ShishiMj.prototype.canAnGang = function (uid) {
	if (GameData.game.cardleft == 0) return 0;
	if (uid != GameData.player.uid) return 0;
	//if (GameData.game.numMingYouOrAnYou3 > 0) return 0;
	for (var i in GameData.cards) {
		var youNum = GameData.cards[i]['youNum'];
		if (youNum == 3 || youNum == 10) return false;
	}
	var ret = mahjong.prototype.canAnGang.call(this, uid);
	return ret;
}

ShishiMj.prototype.canMingGang = function (uid, card) {
	if (this.isHuier(card) == true) return 0;
	if (GameData.game.cardleft == 0) return 0;
	//if (GameData.game.numMingYouOrAnYou3 > 0) return 0;
	for (var i in GameData.cards) {
		var youNum = GameData.cards[i]['youNum'];
		if (youNum == 3 || youNum == 10) return false;
	}
	var ret = mahjong.prototype.canMingGang.call(this, uid, card);
	return ret;
}

ShishiMj.prototype.canMingGangSelf = function () {
	if (GameData.game.cardleft == 0) return 0;
	//if (GameData.game.numMingYouOrAnYou3 > 0) return 0;
	for (var i in GameData.cards) {
		var youNum = GameData.cards[i]['youNum'];
		if (youNum == 3 || youNum == 10) return false;
	}
	var ret = mahjong.prototype.canMingGangSelf.call(this);
	return ret;
}

ShishiMj.prototype.canDianPao = function(uid, card) {
	var youNum = GameData.cards[GameData.player.uid]['youNum'];
	if (youNum > 0) return false;

	var handcards = GameData.getMyHandCards();
	
	var jinCard = GameData.game.cardHuier1;
	var jinNum = handcards[jinCard];
	var shuangjin = GameData.room.opts.shuangjin;
	if (shuangjin && jinNum>1 && GameData.cards[GameData.game.lastdisUid]['youNum']==0) return false;

	var tempJson = JSON.stringify(handcards);
	var tempCard = JSON.parse(tempJson);
	tempCard[card] = tempCard[card] > 0 ? tempCard[card]+1 : 1;
	this.getHuDecks(tempCard);
	var hu = this.checkHuType(tempCard, card, false);

	var youjin = [];
	//if (this.isMingYou(youNum)) youjin = this.getYoujinDeck(youNum, handcards);

	return [hu[0], hu[1], card, youjin[0], youjin[1]];
}

ShishiMj.prototype.canZimo = function(handcards, obCard) {
	this.getHuDecks(handcards);
	var hu = this.checkHuType(handcards, obCard, true);

	var youNum = GameData.cards[GameData.player.uid]['youNum'];
	var youjin = [];
	if (this.isMingYou(youNum)) youjin = this.getYoujinDeck(youNum, handcards);
	else if (this.isAnYou(youNum)) youjin = this.getYoujinDeck(youNum, handcards);

	return [hu[0], hu[1], obCard, youjin[0], youjin[1]];
}

ShishiMj.prototype.checkHuType = function(cards, obcard, zimo) {
	var deck = [], type = [];
	var len = this.huCards.length;
	if (zimo && this.isDizhen(cards)) {
		type.push(CardsType.CT_Dizhen);
	} else if (len > 0) {
		var youNum = GameData.cards[GameData.player.uid]['youNum'];
		var t = this.isYoujinHu(youNum);
		if (t[0] > 0) {
			deck = t[1];
			type.push(t[0]);
		} else {
			if (zimo) {
				deck = this.huCards[0].slice();
				type.push(CardsType.CT_Zimo);
			} else {
				var len = this.huCards.length; 
				for (var i=0; i<len; i++) {
					if ((this.isHuier(this.huCards[i][0]) && obcard == this.huCards[i][1]) ||
						(this.isHuier(this.huCards[i][1]) && obcard == this.huCards[i][0])) {
						continue;
					}

					var flag = true;
					for (var t=2; t<this.huCards[i].length; t+=3) {
						if (obcard == this.huCards[i][t] && this.isHuier(this.huCards[i][t+1]) && this.isHuier(this.huCards[i][t+2]) ||
							obcard == this.huCards[i][t+1] && this.isHuier(this.huCards[i][t]) && this.isHuier(this.huCards[i][t+2]) ||
							obcard == this.huCards[i][t+2] && this.isHuier(this.huCards[i][t]) && this.isHuier(this.huCards[i][t+1])) {
							flag = false;
							break;
						}
					}
					
					if (flag) {
						deck = this.huCards[i].slice();
						type.push(CardsType.CT_Sudao);
						break;
					}
				}
			}
		}
	}
	return [type, deck];
}

ShishiMj.prototype.checkYoujin = function(discard) {
	var cards = [], huiers = [];
	var handcards = GameData.getMyHandCards();
	this.formatCards(handcards, cards, huiers);
	this.huCards.splice(0, this.huCards.length);

	if (this.isHuier(discard)) {
		if (huiers.length > 1) {
			var deck = [huiers.pop(), huiers.pop()];
			this.canGroup(cards, huiers, deck);
			return this.huCards.length > 0;
		}
	} else {
		if (huiers.length > 0) {
			var deck = [discard, huiers.pop()];
			cards[discard]--;
			this.canGroup(cards, huiers, deck);
			return this.huCards.length > 0;
		}
	}
	return false;
}

ShishiMj.prototype.isYoujinHu = function(youNum) {
	var type = CardsType.CT_None, deck = [];
	if (youNum > 0) {	
		var len = this.huCards.length; 
		for (var i=0; i<len; i++) {
			if (this.isHuier(this.huCards[i][0]) || this.isHuier(this.huCards[i][1])) {
				deck = this.huCards[i].slice();
				break;
			}
		}
		if (youNum == YoujinType.Ming) type = CardsType.CT_Mingyou;
		else if (youNum == YoujinType.An1) type = CardsType.CT_Anyou1;
		else if (youNum == YoujinType.An2) type = CardsType.CT_Anyou2;
		else if (youNum == YoujinType.An3) type = CardsType.CT_Anyou3;
	}
	return [type, deck];
}

ShishiMj.prototype.isMingYou = function(youNum) {
	if (GameData.room.opts.youJin != YoujinType.Ming) return false;
	//if (youNum == YoujinType.Ming) return false;
	cc.log('isMingYou '+GameData.room.opts.youJin+' '+youNum);
	return true;
}

ShishiMj.prototype.isAnYou = function(youNum) {
	cc.log('isAnYou '+GameData.room.opts.youJin+' '+youNum);
	if (youNum >= GameData.room.opts.youJin) return false;
	return true;
}

ShishiMj.prototype.getYoujinDeck = function(youNum, handcards) {
	var ret = false;
	var len = this.huCards.length;
	var jinCard = GameData.game.cardHuier1;
	var jinNum = handcards[jinCard];
	for (var i=0; i<len; i++) {
		if (youNum == 1 || youNum == 2) {
			cc.log('huCards:'+this.huCards[i][0]+' '+this.huCards[i][1]);
			if (this.isHuier(this.huCards[i][0]) && this.isHuier(this.huCards[i][1])) {
				GameData.youJinDeck = this.huCards[i].slice();
				ret = true;
				cc.log('getYoujinDeck:'+GameData.youJinDeck);
				break;
			}
		} else {
			if (jinNum > 1) {
				if (this.isHuier(this.huCards[i][0]) && this.isHuier(this.huCards[i][1])) {
					GameData.youJinDeck = this.huCards[i].slice();
					ret = true;
					break;
				}
				if (this.isHuier(this.huCards[i][0]) || this.isHuier(this.huCards[i][1])) {
					GameData.youJinDeck = this.huCards[i].slice();
					ret = true;
				}
			} else {
				if (this.isHuier(this.huCards[i][0]) || this.isHuier(this.huCards[i][1])) {
					GameData.youJinDeck = this.huCards[i].slice();
					ret = true;
					break;
				}
			}
		}
	}
	return [ret, GameData.youJinDeck];
}

ShishiMj.prototype.isDizhen = function(handcards) {
	var jinCard = GameData.game.cardHuier1;
	return handcards[jinCard] == 3;
}

ShishiMj.prototype.calcHuScore = function(type) {
	return 1;
}

ShishiMj.prototype.calcHuaScore = function(uid) {
  var hua = GameData.getHuaCard(uid);
  this.huaScore(hua);
}
//计算花杠
ShishiMj.prototype.huaScore = function(hua) {
	var huaNum = hua.length;
	console.log('..hua = '+JSON.stringify(hua));
	console.log(huaNum);
	if (huaNum < 4) {
		return 0;
	} else if (huaNum >= 4 && huaNum < 8)
	{
		for (var n=0; n<huaNum; n++)
		{
			var same = parseInt(hua[n]/10), sameNum = 0;
			for (var i=0; i<huaNum; i++)
			{
				if (same == parseInt(hua[i]/10)) sameNum++;
			}
			if (sameNum == 4)
				return 2;
		}
		return 1;
	} else if (huaNum == 8)
	{
		return 4;
	}
	return 0;
}

ShishiMj.prototype.getHuType = function(huCards, handcards, obCard, checkFlag) {
	if (huCards.length > 0) {
		return [[CardsType.CT_Sudao], huCards[0], obCard, 0];
	} else {
		return [];
	}
}

ShishiMj.prototype.getHuTypeString = function() {
	var detail = '';
	var size = GameData.game.winnerType.length;
	for (var i=0; i<size; i++) {
		switch (GameData.game.winnerType[i]) {
			case CardsType.CT_Sudao: detail += '速到*1   '; break;
			case CardsType.CT_Zimo: detail += '自摸*2   '; break;
			case CardsType.CT_Dizhen: detail += '地震*3   '; break;
			case CardsType.CT_Mingyou: detail += '明游*3   '; break;
			case CardsType.CT_Anyou1: detail += '暗游1游*3   '; break;
			case CardsType.CT_Anyou2: detail += '暗游2游*6   '; break;
			case CardsType.CT_Anyou3: detail += '暗游3游*9   '; break;
			default: break;
		}
	}
	return detail;
}
