var roomHandler = require('roomHandler');
var MjCards = {
	//条
	tiao: [1, 2, 3, 4, 5, 6, 7, 8, 9],
	//万
	wan: [11, 12, 13, 14, 15, 16, 17, 18, 19],
	//筒
	tong: [21, 22, 23, 24, 25, 26, 27, 28, 29],
	//东南西北
	feng: [31, 41, 51, 61],
	//中发白
	jian: [71, 81, 91],
	//春夏秋冬、梅兰竹菊
	hua: [111, 112, 113, 114, 121, 122, 123, 124]
};

var Mahjong = function () {
	this.huCards = [];
}
module.exports = Mahjong;

Mahjong.prototype.isHuier = function (card) {
	return (card >= MjCards['hua'][0] && card <= MjCards['hua'][7]);
}

Mahjong.prototype.canDianPao = function (uid, card) {
	var handcards = GameData.cards[uid]['hand'];
	var tempJson = JSON.stringify(handcards);
	var tempCard = JSON.parse(tempJson);
	tempCard[card] = tempCard[card] > 0 ? tempCard[card] + 1 : 1;
	return this.canHu(tempCard, card, false);
}

Mahjong.prototype.canZimo = function (handcards, obCard, checkFlag) {
	return this.canHu(handcards, obCard, checkFlag);
}

Mahjong.prototype.canHu = function (handcards, obCard, checkFlag) {
	this.getHuDecks(handcards);
	//cc.log('deck:'+JSON.stringify(handcards));
	//cc.log('hhhhhhhhhhhhhhh cards:'+JSON.stringify(this.huCards));
	return this.getHuType(this.huCards, handcards, obCard, checkFlag);
}

Mahjong.prototype.getHuDecks = function (handcards) {
	var cards = [],
		huiers = [];
	this.formatCards(handcards, cards, huiers);
	this.huCards.splice(0, this.huCards.length);

	var cardNum = cards.length,
		huierNum = huiers.length;
	for (var key = 0; key < cardNum; key++) {
		if (cards[key] > 1) {
			var tempCards = cards.concat();
			tempCards[key] -= 2;
			this.canGroup(tempCards, huiers, [key, key]);
		}
		if (cards[key] >= 1 && huierNum > 0) {
			var tempCards = cards.concat(),
				tempHuiers = huiers.concat(),
				tempDeck = [key, tempHuiers.pop()];
			tempCards[key]--;
			this.canGroup(tempCards, tempHuiers, tempDeck);
		}
	}
	if (huierNum > 1) {
		var tempCards = cards.concat(),
			tempHuiers = huiers.concat(),
			tempDeck = [tempHuiers.pop(), tempHuiers.pop()];
		this.canGroup(tempCards, tempHuiers, tempDeck);
	}
}

Mahjong.prototype.canTing = function (handcards) {
	var tingCards = [];
	var tempJson = JSON.stringify(handcards);
	for (var n in MjCards) {
		if (n == 'hua') continue;
		for (var i = 0; i < MjCards[n].length; i++) {
			var card = MjCards[n][i];
			if (this.isHuier(card)) continue;
			var tempCard = JSON.parse(tempJson);
			tempCard[card] = tempCard[card] > 0 ? tempCard[card] + 1 : 1;
			var huData = this.canHu(tempCard, card, false);
			if (huData != false && huData[0] && huData[0].length > 0) {
				tingCards.push({
					obcard: card,
					type: huData[0],
					score: huData[3]
				});
			}
		}
	}
	return tingCards;
}

Mahjong.prototype.discardTip = function (handcards) {
	var discards = [];
	var tempJson = JSON.stringify(handcards);
	for (var card in handcards) {
		if (this.isHuier(card)) continue;
		if (handcards[card] <= 0) continue;
		var tempCard = JSON.parse(tempJson);
		tempCard[card]--;
		var tingCards = this.canTing(tempCard);
		if (tingCards.length > 0) {
			discards.push({
				discard: card,
				ting: tingCards
			});
		}
	}
	//cc.log('discardTip:' + JSON.stringify(discards));
	return discards;
}

Mahjong.prototype.formatCards = function (cardObj, cards, huiers) {
	cards.push(0);
	for (var i = 1; i <= 91; i++) {
		if (cardObj[i] > 0) {
			if (this.isHuier(i)) {
				for (var n = 0; n < cardObj[i]; n++) huiers.push(i);
				cards.push(0);
			} else {
				cards.push(cardObj[i]);
			}
		} else {
			cards.push(0);
		}
	}
}

Mahjong.prototype.canGroup = function (cards, huiers, deck) {
	var cardSize = cards.length,
		huierSize = huiers.length;
	for (var i = 0; i < cardSize; i++) {
		if (cards[i] <= 0) continue;

		if (cards[i + 1] > 0 && cards[i + 2] > 0) {
			var tempCards = cards.concat(),
				tempDeck = deck.concat(i, i + 1, i + 2);
			tempCards[i]--;
			tempCards[i + 1]--;
			tempCards[i + 2]--;
			this.canGroup(tempCards, huiers, tempDeck);
		}
		if (cards[i + 1] > 0 && huierSize > 0) {
			var tempCards = cards.concat(),
				tempHuiers = huiers.concat(),
				tempDeck = deck.concat(i, i + 1, tempHuiers.pop());
			tempCards[i]--;
			tempCards[i + 1]--;
			this.canGroup(tempCards, tempHuiers, tempDeck);
		}
		if (cards[i + 2] > 0 && huierSize > 0 && i % 10 < 9) {
			var tempCards = cards.concat(),
				tempHuiers = huiers.concat(),
				tempDeck = deck.concat(i, tempHuiers.pop(), i + 2);
			tempCards[i]--;
			tempCards[i + 2]--;
			this.canGroup(tempCards, tempHuiers, tempDeck);
		}
		if (cards[i] == 3) {
			var tempCards = cards.concat(),
				tempDeck = deck.concat(i, i, i);
			tempCards[i] -= 3;
			this.canGroup(tempCards, huiers, tempDeck);
		}
		if (cards[i] == 2 && huierSize > 0) {
			var tempCards = cards.concat(),
				tempHuiers = huiers.concat(),
				tempDeck = deck.concat(i, i, tempHuiers.pop());
			tempCards[i] -= 2;
			this.canGroup(tempCards, tempHuiers, tempDeck);
		}
		if (huierSize > 1) {
			var tempCards = cards.concat(),
				tempHuiers = huiers.concat(),
				tempDeck = deck.concat(i, tempHuiers.pop(), tempHuiers.pop());
			tempCards[i]--;
			this.canGroup(tempCards, tempHuiers, tempDeck);
		}
		return;
	}

	if (huierSize % 3 != 0) return;
	for (var i = 0; i < huierSize; i++) {
		deck.push(huiers[i]);
	}

	this.huCards.push(deck);
}

Mahjong.prototype.matchGroup = function (deck, cards) {
	for (var i = 2; i < deck.length; i += 3) {
		if (deck[i] <= 0) continue;
		var tempDeck = [deck[i], deck[i + 1], deck[i + 2]];
		if (this.equal(tempDeck, cards)) {
			deck[i] = tempDeck[0];
			deck[i + 1] = tempDeck[1];
			deck[i + 2] = tempDeck[2];
			return true;
		}
	}
	return false;
}

Mahjong.prototype.removeGroup = function (deck, cards) {
	for (var i = 2; i < deck.length; i += 3) {
		if (deck[i] <= 0) continue;
		var tempDeck = [deck[i], deck[i + 1], deck[i + 2]];
		if (this.equal(tempDeck, cards)) {
			deck[i] = deck[i + 1] = deck[i + 2] = 0;
			return true;
		}
	}
	return false;
}

Mahjong.prototype.equal = function (deck, cards) {
	if (deck[0] == cards[0] && deck[1] == cards[1] && deck[2] == cards[2]) return true;
	if (deck[0] == cards[0] && this.isHuier(deck[1]) && deck[2] == cards[2]) {
		deck[1] = cards[1] + 100;
		return true;
	}
	if (deck[0] == cards[0] && deck[1] == cards[1] && this.isHuier(deck[2])) {
		deck[2] = cards[2] + 100;
		return true;
	}
	if (deck[0] == cards[0] && this.isHuier(deck[1]) && this.isHuier(deck[2])) {
		deck[1] = cards[1] + 100;
		deck[2] = cards[2] + 100;
		return true;
	}
	if (deck[0] == cards[1] && deck[1] == cards[2] && this.isHuier(deck[2])) {
		deck[0] = cards[0] + 100;
		deck[1] = cards[1];
		deck[2] = cards[2];
		return true;
	}
	if (deck[0] == cards[1] && this.isHuier(deck[1]) && this.isHuier(deck[2])) {
		deck[0] = cards[0] + 100;
		deck[1] = cards[1];
		deck[2] = cards[2] + 100;
		return true;
	}
	if (deck[0] == cards[2] && this.isHuier(deck[1]) && this.isHuier(deck[2])) {
		deck[0] = cards[0] + 100;
		deck[1] = cards[1] + 100;
		deck[2] = cards[2];
		return true;
	}
	if (this.isHuier(deck[0]) && this.isHuier(deck[1]) && this.isHuier(deck[2])) {
		deck[0] = cards[0] + 100;
		deck[1] = cards[1] + 100;
		deck[2] = cards[2] + 100;
		return true;
	}
	return false;
}

Mahjong.prototype.canChi = function (uid, card) {
	if (!GameData.isPrevPlayer(uid)) return false;
	if (this.isHuier(card)) return false;
	var chiCards = [];
	var handcard = GameData.getMyHandCards();
	var c1 = card - 2,
		c2 = card - 1,
		c3 = card - 0 + 1,
		c4 = card - 0 + 2;
	if (!this.isHuier(c1) && !this.isHuier(c2) && handcard[c1] > 0 && handcard[c2] > 0) chiCards.push([c1, c2]);
	if (!this.isHuier(c2) && !this.isHuier(c3) && handcard[c2] > 0 && handcard[c3] > 0) chiCards.push([c2, c3]);
	if (!this.isHuier(c3) && !this.isHuier(c4) && handcard[c3] > 0 && handcard[c4] > 0) chiCards.push([c3, c4]);
	return chiCards;
}

Mahjong.prototype.canPeng = function (uid, card) {
	if (uid == GameData.player.uid) return false;
	if (this.isHuier(card) == true) return false;
	return (GameData.cards[GameData.player.uid]['hand'][card] > 1);
}

Mahjong.prototype.canAnGang = function (uid) {
	if (GameData.game.cardleft == 0) return 0;
	if (uid != GameData.player.uid) return 0;
	var cards = GameData.getMyHandCards();
	for (var key in cards) {
		if (cards[key] >= 4) return key;
	}
	return 0;
}

Mahjong.prototype.canMingGang = function (uid, card) {
	if (this.isHuier(card) == true) return 0;
	if (GameData.game.cardleft == 0) return 0;
	if (uid != GameData.player.uid) {
		var cards = GameData.getMyHandCards();
		if (cards[card] == 3) return card;
	}
	return 0;
}

Mahjong.prototype.canMingGangSelf = function () {
	if (GameData.game.cardleft == 0) return 0;
	var cards = GameData.cards[GameData.player.uid]['peng'];
	var handcards = GameData.getMyHandCards();
	for (var i = 0; i < cards.length; i++) {
		if (handcards[cards[i][0]] > 0) return cards[i][0];
	}
	return 0;
}

Mahjong.prototype.getHuType = function (huCards, handcards, obCard, checkFlag) {
	return [];
}

Mahjong.prototype.calcHuScore = function (type) {
	return 0;
}

Mahjong.prototype.getHuTypeString = function () {
	return '';
}