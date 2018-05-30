var CardType = {
  Spade:0,    //方块
  Heart:1,    //梅花
  Diamond:2,  //红心
  Club:3,     //黑桃
  King:4      //王牌
};

var PokerType = {
  WuLong: 1,       //乌龙
  DuiZi: 2,        //对子
  LiangDui: 3,     //两对
  SanTiao: 4,      //三条
  ShunZi: 5,       //顺子
  TongHua: 6,      //同花
  HuLu: 7,         //葫芦
  TieZhi: 8,       //铁支
  TongHuaShun: 9,  //同花顺
  WuTong: 10,      //五同
};

var TypeSize = {
  WuLong: 5,       //乌龙
  DuiZi: 2,        //对子
  LiangDui: 4,     //两对
  SanTiao: 3,      //三条
  ShunZi: 5,       //顺子
  TongHua: 5,      //同花
  HuLu: 5,         //葫芦
  TieZhi: 4,       //铁支
  TongHuaShun: 5,  //同花顺
  WuTong: 5,      //五同
};

/**
 * @class Poker13
 *
 */

function Poker13(cardHand) {
	this._pokerTypeList = {   
        DuiZi: [],        
        LiangDui: [],     
        SanTiao: [],      
        ShunZi: [],       
        TongHua: [],      
        HuLu: [],         
        TieZhi: [],       
        TongHuaShun: [],  
        WuTong: [],      
    };
    this._cardHandList = [];
    this.initCardHandList(cardHand);
}

var prototype = Poker13.prototype;

prototype.initCardHandList = function(cardHand) {
    this.clearArray(this._cardHandList);
    var cards = cardHand;
    // this.sortHandCard(cards);
    for (var i = 0; i < cards.length; i++)
    {
        this._cardHandList.push({card: cards[i], status: 0});
    }
}

prototype.sortHandCard = function(cards) {
    var tempList = [];

    for (var i = 0; i < cards.length; i++) 
    {
        if (cards[i] != 0) 
        {
            tempList[tempList.length] = cards[i];
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
    this.clearArray(cards);
    for (var j = 0; j < GameData13.handSize; j++) 
    {
        if (j < tempList.length) 
        {
            cards[j] = tempList[j];
            continue;
        }
        cards[j] = 0;
    }
    return tempList.length;
}

prototype.compare = function(a, b) {
    if (a > b)
    {
        return true;
    }
    return false;
}

prototype.sortArray = function(begin, end, array) {
    for (var i = begin; i < end; ++i)
    {
        if (this.compare(array[i + 1].status, array[i].status))
        {
            array[i + 1].status = 0;
            array[i].status = 1;
            i = -1;
        }
    }
}

prototype.permResult = function(n, array) {
    var cards = [];
    for (var key = 0; key < n; key++)
    {
        if (array[key].status == 1)
        {
            cards.push(array[key].card);
        }
    }
    return cards;
}

prototype.permPoker = function(array, n, m, type) {
    if (m <= n) 
    {
        for (var i = 0; i < n; i++)
        {
            if (i < m)
            {
                array[i].status = 1;
            }
            else
            {
                array[i].status = 0;
            }
        }
    }

    this.pokerType(this.permResult(n, array), type);

    for (var i = 0; i < n; ++i)
    {
        var index = i + 1;
        if (index < n)
        {
            if (array[i].status == 1 && array[index].status == 0)
            {
                array[i].status = 0;
                array[index].status = 1;
                this.sortArray(0, i, array);
                var cards = this.permResult(n, array);
                this.pokerType(cards, type);
                i = -1;
            }
        }
    }
}

prototype.searchPokerType = function(handSize, type) {
    
    if (this._cardHandList.length <= 0)
    {
        cc.log('function:searchPokerType.. _cardHandList is empty.');
        return;
    }
    var array = [];
    for (var i = 0; i < this._cardHandList.length; i++)
    {
        array.push(this._cardHandList[i]);
    }

    this.permPoker(array, handSize, TypeSize[type], type);
}

prototype.isSameValueOfCard = function(cards, cardCount, sameCount) {
    
    if (cards.length <= 0)
    {
        return false;
    }

    var _sameCount = 0;
    var tempCardList = [];

    for (var i = 0; i < cards.length; i++)
    {
        tempCardList.push({card: cards[i], status: 0});
    }

    for (var key = 0; key < tempCardList.length; key++)
    {
        var _cardCount = 0;

        for (var i = 0; i < tempCardList.length; i++)
        {
            if (tempCardList[i].status == 0)
            {
                if (tempCardList[key].card.value == tempCardList[i].card.value)
                {
                    tempCardList[i].status = 1;
                    _cardCount++;
                }
                else
                {
                    continue;
                }
            }
        }
        if (_cardCount == cardCount)
        {
            _sameCount++;
            continue;
        }
        else 
        {
            continue;
        }
    }

    if (_sameCount == sameCount)
    {
        return true;
    }

    return false;
}

prototype.isDuiZi = function(cards) {
    
    if (cards.length <= 0 || cards.length != TypeSize['DuiZi'])
    {
        return false;
    }
    if (this.isSameValueOfCard(cards, 2, 1))
    {
        return true;
    }
    return false;
}

prototype.isLiangDui = function(cards) {
    
    if (cards.length <= 0 || cards.length != TypeSize['LiangDui'])
    {
        return false;
    }
    if (this.isSameValueOfCard(cards, 2, 2))
    {
        return true;
    }
    return false;
}

prototype.isSanTiao = function(cards) {
    
    if (cards.length <= 0 || cards.length != TypeSize['SanTiao'])
    {
        return false;
    }
    if (this.isSameValueOfCard(cards, 3, 1))
    {
        return true;
    }
    return false;
}

prototype.isShunZi = function(cards) {
    
    var count = 0;
    if (cards.length <= 0 || cards.length != TypeSize['ShunZi'])
    {
        return false;
    }

    cards.sort(function(a, b) {
        return a.value - b.value;
    });

    for (var i = 0; i < cards.length; i++)
    {
        var value = cards[0].value;
        if ((cards[i].value - i) == value)
        {
            count++;
        }
    }
    if (count == 5)
    {
        return true;
    }
    return false;
}

prototype.isTongHua = function(cards) {
    
    var count = 0;
    if (cards.length <= 0 || cards.length != TypeSize['TongHua'])
    {
        return false;
    }
    
    for (var i = 0; i < cards.length; i++)
    {
        var type = cards[0].type;
        if (cards[i].type == type)
        {
            count++;
        }
    }
    if (count == 5)
    {
        return true;
    }
    return false;
}

prototype.isHuLu = function(cards) {
    
    if (cards.length <= 0 || cards.length != TypeSize['HuLu'])
    {
        return false;
    }
    if (this.isSameValueOfCard(cards, 3, 1))
    {
        if (this.isSameValueOfCard(cards, 2, 1))
        {
            return true;
        }
    }
    return false;
}

prototype.isTieZhi = function(cards) {
    
    if (cards.length <= 0 || cards.length != TypeSize['TieZhi'])
    {
        return false;
    }

    if (this.isSameValueOfCard(cards, 4, 1))
    {
        return true;
    }
    return false;
}

prototype.isTongHuaShun = function(cards) {
    
    var tempCard, isTongHua = false, isShunZi, count = 0;
    if (cards.length <= 0 || cards.length != TypeSize['TongHuaShun'])
    {
        return false;
    }
    if (this.isTongHua(cards))
    {
        isTongHua = true;
    }
    if (isTongHua)
    {
        if (this.isShunZi(cards))
        {
            return true;
        }
    }
    return false;
}

prototype.isWuTong = function(cards) {
    
    var tempCard, count = 0;
    if (cards.length <= 0 || cards.length != TypeSize['WuTong']) 
    {
        return;
    }
   
    if (this.isSameValueOfCard(cards, 5, 1))
    {
        return true;
    }
    return false;
}

prototype.pokerType = function(cards, type) {
    
    if (PokerType[type] == PokerType.DuiZi)
    {
        if (this.isDuiZi(cards))
        {
            this._pokerTypeList['DuiZi'].push(cards);
        }
    }
    else if (PokerType[type] == PokerType.LiangDui)
    {
        if (this.isLiangDui(cards))
        {
            this._pokerTypeList['LiangDui'].push(cards);
        }
    }
    else if (PokerType[type] == PokerType.SanTiao)
    {
        if (this.isSanTiao(cards))
        {
            this._pokerTypeList['SanTiao'].push(cards);
        }
    }
    else if (PokerType[type] == PokerType.ShunZi)
    {
        if (this.isShunZi(cards))
        {
            this._pokerTypeList['ShunZi'].push(cards);
        }
    }
    else if (PokerType[type] == PokerType.TongHua)
    {
        if (this.isTongHua(cards))
        {
            this._pokerTypeList['TongHua'].push(cards);
        }
    }
    else if (PokerType[type] == PokerType.HuLu)
    {
        if (this.isHuLu(cards))
        {
            this._pokerTypeList['HuLu'].push(cards);
        }
    }
    else if (PokerType[type] == PokerType.TieZhi)
    {
        if (this.isTieZhi(cards))
        {
            this._pokerTypeList['TieZhi'].push(cards);
        }
    }
    else if (PokerType[type] == PokerType.TongHuaShun)
    {
        if (this.isTongHuaShun(cards))
        {
            this._pokerTypeList['TongHuaShun'].push(cards);
        }
    }
    else if (PokerType[type] == PokerType.WuTong)
    {
        if (this.isWuTong(cards))
        {
            this._pokerTypeList['WuTong'].push(cards);
        }
    }
    return [];
}

prototype.getPokerTypeCards = function(handSize, type) {
    this.searchPokerType(handSize, type);
    return this._pokerTypeList;
}

prototype.clearArray = function(array) {
    if (array.length > 0)
    {
        array.splice(0, array.length);
    }
}

prototype.clearPokerTypeList = function() {
    this.clearArray(this._pokerTypeList);
}

module.exports = Poker13;