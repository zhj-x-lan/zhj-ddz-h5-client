var mahjong = require('mahjong');
var util = require('utils');

var CardsType = {
  CT_None: 0,
  CT_Diliu: 1,		//提溜
  CT_Supai: 2,		//素牌
  CT_Hundiao: 3,	//混吊
  CT_DHundiao: 4,	//双混吊
  CT_Zhuowu: 5,	  //捉五
  CT_Yitiaolong: 6,//一条龙
  CT_Benhuilong: 7,//本混儿龙
  CT_Tianhu: 8,	  //天胡
  CT_Dihu: 9,		  //地胡
  CT_Gangkaihua: 10,//杠上开花
  CT_SuBenlong: 11, //素本龙
  CT_Chan: 12,    //产
  CT_Wulong: 13,  //拉五龙
  CT_JinGang: 14, //胡金杠
};

var HuadianMj = function() {
	mahjong.call(this);
};
util.inherits(HuadianMj, mahjong);

module.exports = HuadianMj;

HuadianMj.prototype.canChi = function(uid, card) {
	//if (!GameData.isPrevPlayer(uid)) return false;
	//if (this.isHuier(card)) return false;
	var chiCards = [];
	var handcard = GameData.getMyHandCards();
	//数组去重
	handcard.sort(); //先排序
	var res = [handcard[0]];
	for(var i = 1; i < handcard.length; i++){
		if(handcard[i] !== res[res.length - 1]){
			res.push(handcard[i]);
		}
	}
	var c1 = card-2, c2 = card-1, c3 = card-0+1, c4 = card-0+2;
	//var getChiCard = function (card1,card2) {
	//
	//}
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

HuadianMj.prototype.canDianPao = function(uid, card) {
	return false;
}

HuadianMj.prototype.isHuier = function(card) {
	if (GameData.game.cardHuier1 == card) return true;
	if (GameData.game.cardHuier2 == card) return true;
	return false;
}

HuadianMj.prototype.canHu = function(handcards, obCard, checkFlag) {
	if (GameData.player.isXiangGong) {
		return false;
	}
	return mahjong.prototype.canHu.call(this, handcards, obCard, checkFlag);
}

HuadianMj.prototype.getHuType = function(huCards, handcards, obCard, checkFlag) {
	//var chiCards = GameData.getChiCards(GameData.player.uid);
	//var pengCards = GameData.getPengCards(GameData.player.uid);
	//var gangCards = GameData.getGangCards(GameData.player.uid);

	var i = 0;
	var type = [];
	var len = huCards.length;
	for (; i<len; i++) {
		//var deck = huCards[i].concat(chiCards, pengCards);
		type[i] = [];
		var deck = huCards[i];

		if (checkFlag) {
			if (this.isGangkaihua()) type[i].push(CardsType.CT_Gangkaihua);
			if (this.isTianhu()) type[i].push(CardsType.CT_Tianhu);
			else if (this.isDihu()) type[i].push(CardsType.CT_Dihu);
		}

		if (this.isSuBenLong(deck, GameData.game.cardHuier1)) {
			type[i].push(CardsType.CT_SuBenlong);

			if (this.isZhuowu(deck, obCard)) type[i].push(CardsType.CT_Zhuowu);
			continue;
		}

		if (this.isBenLong(deck, GameData.game.cardHuier1)) {
			type[i].push(CardsType.CT_Benhuilong);

			if (this.isHundiao(deck, obCard)) {
				type[i].push(CardsType.CT_Hundiao);
			} else {
				if (this.isDHundiao(deck, obCard, true)) type[i].push(CardsType.CT_DHundiao);
				if (this.isZhuowu(deck, obCard)) type[i].push(CardsType.CT_Zhuowu);
			}
			continue;
		}

		if (this.isLong(deck, GameData.game.cardHuier1)) {
			type[i].push(CardsType.CT_Yitiaolong);

			if (this.isSupai(deck)) type[i].push(CardsType.CT_Supai);
			else if (this.isHundiao(deck, obCard)) type[i].push(CardsType.CT_Hundiao);
			else {
				if (this.isDHundiao(deck, obCard, true)) type[i].push(CardsType.CT_DHundiao);
				if (this.isZhuowu(deck, obCard)) type[i].push(CardsType.CT_Zhuowu);
			}
			continue;
		}
		
		if (this.isZhuowu(deck, obCard)) {
			type[i].push(CardsType.CT_Zhuowu);

			if (this.isSupai(deck)) type[i].push(CardsType.CT_Supai);
			else if (this.isDHundiao(deck, obCard, false)) type[i].push(CardsType.CT_DHundiao);
			continue;
		}

		if (this.isSupai(deck)) type[i].push(CardsType.CT_Supai);
		else if (this.isHundiao(deck, obCard)) type[i].push(CardsType.CT_Hundiao);
		else if (this.isDHundiao(deck, obCard, false)) type[i].push(CardsType.CT_DHundiao);
	}
	var deck = [];
	if (this.isJinGang(handcards, deck)) {
		type[i] = [];
		type[i].push(CardsType.CT_JinGang);
		huCards[i] = deck;

		if (this.isGangkaihua()) type[i].push(CardsType.CT_Gangkaihua);
		if (this.isTianhu()) type[i].push(CardsType.CT_Tianhu);
		else if (this.isDihu()) type[i].push(CardsType.CT_Dihu);
	}

	var typemax = -1;
	var scoremax = 0;
	for (var i=0; i<type.length; i++) {
		if (!GameData.room.opts.hd && type[i].length == 1 && (type[i][0] == CardsType.CT_Hundiao || type[i][0] == CardsType.CT_DHundiao)) {
			continue;
		}

		var score = this.calcHuScore(type[i]);
		if (score > scoremax) {
			typemax = i;
			scoremax = score;
		}
	}
	//cc.log('hhhhhhhhhhhhhhh array:'+huCards.length);
	//cc.log('hhhhhhhhhhhhhhh types:'+JSON.stringify([type[typemax], huCards[typemax]]));      
	return [type[typemax], huCards[typemax], obCard, scoremax];
}

HuadianMj.prototype.calcHuScore = function(type) {
	if (type.length <= 0) return 0;
	var times = 1, point = 0;
	for (var i=0; i<type.length; i++) {
		switch (type[i]) {
			case CardsType.CT_Supai: times *= 2; break;
			case CardsType.CT_Hundiao: times *= 2; break;
			case CardsType.CT_DHundiao: times *= 2; break;
			case CardsType.CT_Gangkaihua: times *= 2; break;
			case CardsType.CT_Zhuowu: point += 3; break;
			case CardsType.CT_Yitiaolong: point += 4; break;
			case CardsType.CT_Benhuilong: point += 8; break;
			case CardsType.CT_Tianhu: times *= 8; break;
			case CardsType.CT_Dihu: times *= 4; break;
			case CardsType.CT_SuBenlong: point += 4,times *= 4; break;
			case CardsType.CT_JinGang: point += GameData.createRoomOpts.jGangScore; break;
			default: break;
		}
	}

	times = times || 1;
	point = point || 1; 
	return times * point;
}

HuadianMj.prototype.getHuTypeString = function() {
	var detail = '', chan = false;
	var size = GameData.game.winnerType.length;
	for (var i=0; i<size; i++) {
		switch (GameData.game.winnerType[i]) {
			case CardsType.CT_Tianhu: detail += '天胡 *8   '; break;
			case CardsType.CT_Dihu: detail += '地胡 *4   '; break;
			case CardsType.CT_Supai: detail += '没混 *2   '; break;
			case CardsType.CT_Hundiao: detail += '混吊 *2   '; break;
			case CardsType.CT_DHundiao: detail += (size > 1 ? '双混吊 *2   ' : '混吊 *2   '); break;
			case CardsType.CT_Gangkaihua: detail += '杠开花 *2   '; break;
			case CardsType.CT_Zhuowu: detail += '捉五 +3   '; break;
			case CardsType.CT_Yitiaolong: detail += '一条龙 +4   '; break;
			case CardsType.CT_Benhuilong: detail += '本混龙 +4 *2 '; break;
			case CardsType.CT_Chan: chan = true; break;
			case CardsType.CT_Wulong: detail += '拉五龙   '; break;
			case CardsType.CT_SuBenlong: detail += '素本龙 +4 *4   '; break;
			case CardsType.CT_JinGang: {
				if (GameData.room.opts.jingang == 4) detail += '金杠胡 +4   ';
				else if (GameData.room.opts.jingang == 8) detail += '金杠胡 +8   ';
			} break;
			default: break;
		}
	}

	if (chan) {
		detail += ' 铲牌 -1';
	}

	return detail;
}

HuadianMj.prototype.isSupai = function(deck) {
	for (var i=0; i<deck.length; i++) {
		if (this.isHuier(deck[i])) return false;
	}
	return true;
}

HuadianMj.prototype.isHundiao = function(deck, obCard) {
	if (!this.isHuier(deck[1])) return false;
	if (!this.isHuier(obCard) && obCard == deck[0]) return true;
	if (this.isHuier(obCard) && this.isHuier(deck[0])) return true;
	return false;
}

HuadianMj.prototype.isDHundiao = function(deck, obCard, long) {
	var tempDeck = deck.concat();
	if (long) {
		for (var n=0; n<3; n++) {
			if (this.checkLong(tempDeck, n*10)) break;
		}
	}

	for (var i=2; i<tempDeck.length; i+=3) {
		if (tempDeck[i] <= 0) continue;
		if (this.isHuier(obCard)) {
			if (this.isHuier(tempDeck[i]) && this.isHuier(tempDeck[i+1]) && this.isHuier(tempDeck[i+2])) return true;
		} else {
			if (obCard == tempDeck[i] && this.isHuier(tempDeck[i+1]) && this.isHuier(tempDeck[i+2])) return true;
			if (obCard == tempDeck[i+1] && this.isHuier(tempDeck[i]) && this.isHuier(tempDeck[i+2])) return true;
			if (obCard == tempDeck[i+2] && this.isHuier(tempDeck[i]) && this.isHuier(tempDeck[i+1])) return true;
		}
	}
	return false;
}

HuadianMj.prototype.isZhuowu = function(deck, obCard) {
	if (this.isHuier(obCard)) {
		for (var i=2; i<deck.length; i+=3) {
			if (deck[i] == 14 && this.isHuier(deck[i+1]) && deck[i+2] == 16) return true;
			if (deck[i] == 14 && this.isHuier(deck[i+1]) && this.isHuier(deck[i+2])) return true;
			if (deck[i] == 16 && this.isHuier(deck[i+1]) && this.isHuier(deck[i+2])) return true;
			if (this.isHuier(deck[i]) && this.isHuier(deck[i+1]) && this.isHuier(deck[i+2])) return true;
		}
	} else if (obCard == 15) {
		for (var i=2; i<deck.length; i+=3) {
			if (deck[i] == 14 && deck[i+1] == 15 && deck[i+2] == 16) return true;
			if (deck[i] == 14 && deck[i+1] == 15 && this.isHuier(deck[i+2])) return true;
			if (deck[i] == 15 && deck[i+1] == 16 && this.isHuier(deck[i+2])) return true;
			if (deck[i] == 15 && this.isHuier(deck[i+1]) && this.isHuier(deck[i+2])) return true;
		}
	}
	return false;
}

HuadianMj.prototype.checkLong = function(deck, key) {
	if (!this.matchGroup(deck, [key+1, key+2, key+3])) return false;
	if (!this.matchGroup(deck, [key+4, key+5, key+6])) return false;
	if (!this.matchGroup(deck, [key+7, key+8, key+9])) return false;
	return true;
}

HuadianMj.prototype.isLong = function(deck) {
	for (var n=0; n<3; n++) {
		var key = n*10, tempDeck = deck.concat();
		if (!this.checkLong(tempDeck, key)) continue;
		return true;
	}
	return false;
}

HuadianMj.prototype.isBenLong = function(deck, huierCard) {
	var n = parseInt(huierCard / 10);
	if (n >= 3) return false;
	var key = n*10, tempDeck = deck.concat();
	return this.checkLong(tempDeck, key);
}

HuadianMj.prototype.isSuBenLong = function(deck, huierCard) {
	var n = parseInt(huierCard / 10);
	if (n >= 3) return false;
	var tempDeck = deck.concat();
	var huierNum = 0, lastHuier = 0;
	for (var i=0; i<tempDeck.length; i++) {
		if (this.isHuier(tempDeck[i])) {
			if (++huierNum > 2) return false;
			if (lastHuier == tempDeck[i]) return false;
			lastHuier = tempDeck[i];
		}
	}
	if (huierNum != 2) return false;
	var key = n*10;
	return this.checkLong(tempDeck, key);
}

HuadianMj.prototype.isGangkaihua = function() {
	return GameData.game.gangOver == 1;
}

HuadianMj.prototype.isTianhu = function() {
	return (GameData.game.noActions && GameData.player.uid == GameData.game.zhuangUid && GameData.game.discard == 0);
}

HuadianMj.prototype.isDihu = function() {
	return (GameData.game.noActions && GameData.player.uid != GameData.game.zhuangUid && GameData.game.discard == 0);
}

HuadianMj.prototype.isJinGang = function(handcards, deck) {
	var huier1 = handcards[GameData.game.cardHuier1],
			huier2 = handcards[GameData.game.cardHuier2];
	if (huier1 != 4 && huier2 != 4) return false;
	for (var key in handcards) {
		for (var i=0; i<handcards[key]; i++) deck.push(key);
	}
	return true;
}