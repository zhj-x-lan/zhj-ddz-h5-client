var mahjong = require('mahjong');
var util = require('utils');

var CardsType = {
	CT_None: 0,
	CT_Diliu: 1, //提溜
	CT_Supai: 2, //素牌
	CT_Hundiao: 3, //混吊
	CT_DHundiao: 4, //双混吊
	CT_Zhuowu: 5, //捉五
	CT_Yitiaolong: 6, //一条龙
	CT_Benhuilong: 7, //本混儿龙
	CT_Tianhu: 8, //天胡
	CT_Dihu: 9, //地胡
	CT_Gangkaihua: 10, //杠上开花
	CT_SuBenlong: 11, //素本龙
	CT_Chan: 12, //产
	CT_Wulong: 13, //拉五龙
	CT_JinGang: 14, //胡金杠
};

var TianjinMj = function () {
	mahjong.call(this);
};
util.inherits(TianjinMj, mahjong);

module.exports = TianjinMj;

TianjinMj.prototype.canChi = function (uid, card) {
	return [];
}

TianjinMj.prototype.canDianPao = function (uid, card) {
	return false;
}

TianjinMj.prototype.isHuier = function (card) {
	if (GameData.game.cardHuier1 == card) return true;
	if (GameData.game.cardHuier2 == card) return true;
	return false;
}

TianjinMj.prototype.isDeckHuier = function (card, id) {
	return (card - 100 == id);
}

TianjinMj.prototype.canHu = function (handcards, obCard, checkFlag) {
	if (GameData.player.isXiangGong) {
		return false;
	}
	return mahjong.prototype.canHu.call(this, handcards, obCard, checkFlag);
}

TianjinMj.prototype.getHuType = function (huCards, handcards, obCard, checkFlag) {
	//var chiCards = GameData.getChiCards(GameData.player.uid);
	//var pengCards = GameData.getPengCards(GameData.player.uid);
	//var gangCards = GameData.getGangCards(GameData.player.uid);

	cc.log('TianjinMj.prototype.getHuType');

	var i = 0,
		typemax = -1,
		scoremax = 0;
	var huType = [],
		huDeck = [],
		mDeck = [];

	var getMaxScore = function (self, deck, type) {
		var score = self.calcHuScore(type);
		cc.log('score: deck:' + JSON.stringify(deck) + ' type:' + JSON.stringify(type) + ' score:' + score);
		if (score > scoremax) {
			huType = type;
			huDeck = deck;
			scoremax = score;
		}
	}

	var len = huCards.length;
	for (; i < len; i++) {
		//var deck = huCards[i].concat(chiCards, pengCards);
		var deck = huCards[i];

		var long = this.isLong(deck, mDeck);
		if (long) {
			var type = [];
			var tempDeck = JSON.stringify(mDeck);
			var LongDeck = JSON.parse(tempDeck);

			if (checkFlag) {
				if (this.isGangkaihua()) type.push(CardsType.CT_Gangkaihua);
				if (this.isTianhu()) type.push(CardsType.CT_Tianhu);
				else if (this.isDihu()) type.push(CardsType.CT_Dihu);
			}

			if (this.isSuBenLong(deck, mDeck, GameData.game.cardHuier1)) {
				type.push(CardsType.CT_SuBenlong);

				if (obCard == 15 && this.isZhuowu(mDeck, obCard)) type.push(CardsType.CT_Zhuowu);
			} else if (this.isBenLong(deck, mDeck, GameData.game.cardHuier1)) {
				type.push(CardsType.CT_Benhuilong);

				if (this.isDHundiao(deck, obCard, true)) {
					type.push(CardsType.CT_DHundiao);

					if (this.isZhuowu(mDeck, obCard)) type.push(CardsType.CT_Zhuowu);
				} else if (this.isHundiao(deck, obCard)) {
					type.push(CardsType.CT_Hundiao);
				} else if (this.isZhuowu(mDeck, obCard)) {
					type.push(CardsType.CT_Zhuowu);
				}
			} else {
				type.push(CardsType.CT_Yitiaolong);

				if (this.isSupai(deck)) {
					type.push(CardsType.CT_Supai);
					if (this.isZhuowu(LongDeck, obCard)) type.push(CardsType.CT_Zhuowu);
				} else if (this.isDHundiao(deck, obCard, true)) {
					type.push(CardsType.CT_DHundiao);
					if (this.isZhuowu(LongDeck, obCard)) type.push(CardsType.CT_Zhuowu);
				} else if (this.isHundiao(deck, obCard)) {
					type.push(CardsType.CT_Hundiao);
				} else if (this.isZhuowu(LongDeck, obCard)) {
					type.push(CardsType.CT_Zhuowu);
				}
			}

			getMaxScore(this, deck, type);
		}

		var zhuowu = this.isZhuowu(deck, obCard);
		if (zhuowu) {
			var type = [];

			if (checkFlag) {
				if (this.isGangkaihua()) type.push(CardsType.CT_Gangkaihua);
				if (this.isTianhu()) type.push(CardsType.CT_Tianhu);
				else if (this.isDihu()) type.push(CardsType.CT_Dihu);
			}

			type.push(CardsType.CT_Zhuowu);

			if (this.isSupai(deck)) type.push(CardsType.CT_Supai);
			else if (this.isDHundiao(deck, obCard, false)) type.push(CardsType.CT_DHundiao);

			getMaxScore(this, deck, type);
		}

		if (!long && !zhuowu) {
			var type = [];

			if (checkFlag) {
				if (this.isGangkaihua()) type.push(CardsType.CT_Gangkaihua);
				if (this.isTianhu()) type.push(CardsType.CT_Tianhu);
				else if (this.isDihu()) type.push(CardsType.CT_Dihu);
			}

			if (this.isSupai(deck)) type.push(CardsType.CT_Supai);
			else if ((type.length > 0 || GameData.room.opts.hd) && this.isHundiao(deck, obCard)) type.push(CardsType.CT_Hundiao);
			else if ((type.length > 0 || GameData.room.opts.hd) && this.isDHundiao(deck, obCard, false)) type.push(CardsType.CT_DHundiao);

			getMaxScore(this, deck, type);
		}
	}
	var deck = [];
	if (this.isJinGang(handcards, deck)) {
		var type = [];
		type.push(CardsType.CT_JinGang);

		if (this.isGangkaihua()) type.push(CardsType.CT_Gangkaihua);
		if (this.isTianhu()) type.push(CardsType.CT_Tianhu);
		else if (this.isDihu()) type.push(CardsType.CT_Dihu);

		getMaxScore(this, deck, type);
	}

	return [huType, huDeck, obCard, scoremax];
}

TianjinMj.prototype.calcHuScore = function (type) {
	if (type.length <= 0) return 0;
	var fan = false;
	var times = 1, point = 0;
	for (var i = 0; i < type.length; i++) {
		switch (type[i]) {
			case CardsType.CT_Supai:
				times *= 2;
				break;
			case CardsType.CT_Hundiao:
				times *= 2;
				break;
			case CardsType.CT_DHundiao:
				times *= 2;
				break;
			case CardsType.CT_Gangkaihua:
				times *= 2;
				break;
			case CardsType.CT_Zhuowu: {
				if (GameData.room.opts.longwufan) fan = true;
				point += 3;
				break;
			}
			case CardsType.CT_Yitiaolong: {
				if (GameData.room.opts.longwufan) fan = true;
				point += 4;
				break;
			}
			case CardsType.CT_Benhuilong: {
				if (GameData.room.opts.longwufan) fan = true;
				point += 8;
				break;
			}
			case CardsType.CT_Tianhu:
				times *= 8;
				break;
			case CardsType.CT_Dihu:
				times *= 4;
				break;
			case CardsType.CT_SuBenlong: {
				if (GameData.room.opts.longwufan) times *= 2;
				point += 4, times *= 4;
				break;
			}
			case CardsType.CT_JinGang:
				point += GameData.createRoomOpts.jGangScore;
				break;
			default:
				break;
		}
	}

	point = point || 1;
	times = times || 1;
	times = fan ? times*2 : times;

	return times * point;
}

TianjinMj.prototype.getHuTypeString = function () {
	var detail = '',
		chan = false,
		flag = false;
	var size = GameData.game.winnerType.length;
	for (var i = 0; i < size; i++) {
		switch (GameData.game.winnerType[i]) {
			case CardsType.CT_Tianhu:
				detail += '天胡 *4  ';
				break;
				// case CardsType.CT_Dihu: detail += '地胡 *4  '; break;
			case CardsType.CT_Supai:
				detail += '没混 *2  ';
				break;
			case CardsType.CT_Hundiao:
				detail += '混吊 *2  ';
				break;
			case CardsType.CT_DHundiao:
				detail += (size > 1 ? '双混吊 *2  ' : '混吊 *2  ');
				break;
			case CardsType.CT_Gangkaihua:
				detail += '杠开花 *2  ';
				break;
			case CardsType.CT_Zhuowu:
				detail += '捉五 +3  ';
				flag = true;
				break;
			case CardsType.CT_Yitiaolong:
				detail += '一条龙 +4  ';
				flag = true;
				break;
			case CardsType.CT_Benhuilong:
				detail += '本混龙 +4 *2  ';
				flag = true;
				break;
			case CardsType.CT_Chan:
				chan = true;
				break;
			case CardsType.CT_Wulong:
				detail += '拉五龙  ';
				break;
			case CardsType.CT_SuBenlong:
				detail += '素本龙 +4 *4  ';
				flag = true;
				break;
			case CardsType.CT_JinGang:
				{
					if (GameData.room.opts.jingang == 4) detail += '金杠胡 +4  ';
					else if (GameData.room.opts.jingang == 8) detail += '金杠胡 +8  ';
				}
				break;
			default:
				break;
		}
	}

	if (flag && GameData.room.opts.longwufan) {
		detail += '龙五翻 *2  ';
	}

	return [detail, chan];

}

TianjinMj.prototype.isSupai = function (deck) {
	for (var i = 0; i < deck.length; i++) {
		if (this.isHuier(deck[i])) return false;
	}
	return true;
}

TianjinMj.prototype.isHundiao = function (deck, obCard) {
	if (!this.isHuier(deck[1])) return false;
	if (!this.isHuier(obCard) && obCard == deck[0]) return true;
	if (this.isHuier(obCard) && this.isHuier(deck[0])) return true;
	return false;
}

TianjinMj.prototype.isDHundiao = function (deck, obCard, long) {
	var tempDeck = [];
	if (long) {
		for (var n = 0; n < 3; n++) {
			var key = n * 10;
			tempDeck = deck.concat();
			if (!this.removeGroup(tempDeck, [key + 1, key + 2, key + 3])) continue;
			if (!this.removeGroup(tempDeck, [key + 4, key + 5, key + 6])) continue;
			if (!this.removeGroup(tempDeck, [key + 7, key + 8, key + 9])) continue;
			break;
		}
	} else {
		tempDeck = deck.concat();
	}

	for (var i = 2; i < tempDeck.length; i += 3) {
		if (tempDeck[i] <= 0) continue;
		if (this.isHuier(obCard)) {
			if (this.isHuier(tempDeck[i]) && this.isHuier(tempDeck[i + 1]) && this.isHuier(tempDeck[i + 2])) return true;
		} else {
			if (obCard == tempDeck[i] && this.isHuier(tempDeck[i + 1]) && this.isHuier(tempDeck[i + 2])) return true;
			if (obCard == tempDeck[i + 1] && this.isHuier(tempDeck[i]) && this.isHuier(tempDeck[i + 2])) return true;
			if (obCard == tempDeck[i + 2] && this.isHuier(tempDeck[i]) && this.isHuier(tempDeck[i + 1])) return true;
		}
	}
	return false;
}

TianjinMj.prototype.isZhuowu = function (deck, obCard) {
	if (this.isHuier(obCard)) {
		for (var i = 2; i < deck.length; i += 3) {
			if (deck[i] == 14 &&
				(this.isHuier(deck[i + 1]) || this.isDeckHuier(deck[i + 1], 15)) &&
				(deck[i + 2] == 16 || this.isHuier(deck[i + 2]) || this.isDeckHuier(deck[i + 2], 16))) return true;

			if (deck[i] == 16 &&
				(this.isHuier(deck[i + 1]) || this.isDeckHuier(deck[i + 1], 14)) &&
				(this.isHuier(deck[i + 2]) || this.isDeckHuier(deck[i + 2], 15))) return true;

			if ((this.isHuier(deck[i]) || this.isDeckHuier(deck[i], 14)) &&
				(this.isHuier(deck[i + 1]) || this.isDeckHuier(deck[i + 1], 15)) &&
				(this.isHuier(deck[i + 2]) || this.isDeckHuier(deck[i + 2], 16))) return true;

			if ((deck[i] == 14 || this.isDeckHuier(deck[i], 14)) &&
				(this.isDeckHuier(deck[i + 1], 15)) &&
				(deck[i + 2] == 16 || this.isDeckHuier(deck[i + 2], 16))) return true;
		}
	} else if (obCard == 15) {
		for (var i = 2; i < deck.length; i += 3) {
			if (deck[i] == 14 && deck[i + 1] == 15 && deck[i + 2] == 16) return true;
			if (deck[i] == 14 && deck[i + 1] == 15 && this.isHuier(deck[i + 2])) return true;
			if (deck[i] == 14 && deck[i + 1] == 15 && this.isDeckHuier(deck[i + 2], 16)) return true;
			if (deck[i] == 15 && deck[i + 1] == 16 && this.isHuier(deck[i + 2])) return true;
			if (deck[i] == 15 && deck[i + 1] == 16 && this.isDeckHuier(deck[i + 2], 14)) return true;
			if (deck[i] == 15 &&
				(this.isHuier(deck[i + 1]) || this.isDeckHuier(deck[i + 1], 14)) &&
				(this.isHuier(deck[i + 2]) || this.isDeckHuier(deck[i + 2], 16))) return true;

			if (deck[i] == 14 && deck[i + 1] == 15 && this.isDeckHuier(deck[i + 2], 16)) return true;
			if (this.isDeckHuier(deck[i], 14) && deck[i + 1] == 15 && deck[i + 2] == 16) return true;
			if (this.isDeckHuier(deck[i], 14) && deck[i + 1] == 15 && this.isDeckHuier(deck[i + 2], 16)) return true;
		}
	}
	return false;
}

TianjinMj.prototype.checkLong = function (deck, key) {
	if (!this.matchGroup(deck, [key + 1, key + 2, key + 3])) return false;
	if (!this.matchGroup(deck, [key + 4, key + 5, key + 6])) return false;
	if (!this.matchGroup(deck, [key + 7, key + 8, key + 9])) return false;
	return true;
}

TianjinMj.prototype.isLong = function (deck, mDeck) {
	for (var n = 0; n < 3; n++) {
		var key = n * 10;
		cloneArray(deck, mDeck);
		if (this.checkLong(mDeck, key)) return true;
	}
	return false;
}

TianjinMj.prototype.isBenLong = function (deck, mDeck, huierCard) {
	var n = parseInt(huierCard / 10);
	if (n >= 3) return false;
	var key = n * 10;
	cloneArray(deck, mDeck);
	return this.checkLong(mDeck, key);
}

TianjinMj.prototype.isSuBenLong = function (deck, mDeck, huierCard) {
	var n = parseInt(huierCard / 10);
	if (n >= 3) return false;
	var huierNum = 0,
		lastHuier = 0;
	for (var i = 0; i < deck.length; i++) {
		if (this.isHuier(deck[i])) {
			if (++huierNum > 2) return false;
			if (lastHuier == deck[i]) return false;
			lastHuier = deck[i];
		}
	}
	if (huierNum != 2) return false;
	var key = n * 10;
	cloneArray(deck, mDeck);
	return this.checkLong(mDeck, key);
}

TianjinMj.prototype.isGangkaihua = function () {
	return GameData.game.gangOver == 1;
}

TianjinMj.prototype.isTianhu = function () {
	return (GameData.game.noActions && GameData.player.uid == GameData.game.zhuangUid);
}

TianjinMj.prototype.isDihu = function () {
	return false;
}

TianjinMj.prototype.isJinGang = function (handcards, deck) {
	var huier1 = handcards[GameData.game.cardHuier1],
		huier2 = handcards[GameData.game.cardHuier2];
	//console.log('isJinGang huier1:'+huier1+' huier2:'+huier2);
	if (huier1 != 4 && huier2 != 4) return false;
	for (var key in handcards) {
		for (var i = 0; i < handcards[key]; i++) deck.push(key);
	}
	return true;
}
TianjinMj.prototype.getHuTypeArry = function (huType) {
	for (var i = 0; i < GameData.game.winnerType.length; i++) {
		if (huType == GameData.game.winnerType[i]) return true;
	}
	return false;
}