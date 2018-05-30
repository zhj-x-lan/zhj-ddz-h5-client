var soundMngr = require('SoundMngr');

var SSSPromptCard = cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...

        cardHand: {
            default: null,
            type: cc.Node,
        }
    },

    // use this for initialization
    onLoad: function () {
        WriteLog('SSSPromptCard onLoad');
        //推荐牌型列表索引
        this._pokerDuiZiIndex = 0;                     
        this._pokerLiangDuiIndex = 0;
        this._pokerSanTiaoIndex = 0;
        this._pokerTongHuaIndex = 0;
        this._pokerShunZiIndex = 0;
        this._pokerHuLuIndex = 0;
        this._pokerTongHuaShunIndex = 0;
        this._pokerTieZhiIndex = 0;
        this._pokerWuTongIndex = 0;
    },

    onDestroy: function() {
        WriteLog('SSSPromptCard onDestroy');
    },

    /**
     * 初始化数据
     */
    initPromptData: function(pokerTypeObj, cardHand) {
        //推荐牌型列表索引
        this._pokerDuiZiIndex = 0;                     
        this._pokerLiangDuiIndex = 0;
        this._pokerSanTiaoIndex = 0;
        this._pokerTongHuaIndex = 0;
        this._pokerShunZiIndex = 0;
        this._pokerHuLuIndex = 0;
        this._pokerTongHuaShunIndex = 0;
        this._pokerTieZhiIndex = 0;
        this._pokerWuTongIndex = 0;

        this._cardHandList = cardHand;
        this._pokerTypeObj = pokerTypeObj;
    },

    /**
     * 初始化卡牌状态
     */
    initCardStatus: function() {
        for (var count = 0; count < this.cardHand.childrenCount; count++)
        {
            var node = cc.find('card'+count, this.cardHand);
            var card = node.getComponent('SSSCard');
            if (card.isSelect = true)
            {
                card.isSelect = false;
                node.y = 0;
            }
        }
    },

    /**
     * 清空数组
     */
    clearArray: function(array) {
        if (array.length > 0)
        {
            array.splice(0, array.length);
        }
    },

    /**
     * 排序数组
     */
    sortArray: function(array) {
        var tempArr = [];
        for (var i = 0; i < array.length; i++)
        {
            tempArr.push(array[i]);
        }
        for (var i = 0; i < tempArr.length; i++)
        {
            tempArr[i].value = tempArr[i].value * 50;
            tempArr[i].type = tempArr[i].value + tempArr[i].type;
        }
        tempArr.sort(function(a, b) {
            return b.type - a.type;
        });
        for (var i = 0; i < tempArr.length; i++)
        {
            tempArr[i].type = tempArr[i].type - tempArr[i].value;
            tempArr[i].value = tempArr[i].value / 50;
        }
        this.clearArray(array);
        for (var i = 0; i < tempArr.length; i++)
        {
            array.push(tempArr[i]);
        }
    },

    /**
     * 是否有相同的卡牌
     */
    isSameCard: function(cards) {
        var sameCount = 0;
        for (var i = 0; i < cards.length; i++)
        {
            var card = cards[i];
            for (var key = 0; key < cards.length; key++)
            {
                if (card.value == cards[key].value && card.type == cards[key].type)
                {
                    sameCount++;
                }
            }
            if (sameCount >= 2)
            {
                return true;
            }
        }
        return false;
    },

    /**
     * 判断相同的数组
     */
    isSameArray: function(array1, array2) {
        this.sortArray(array1);
        this.sortArray(array2);

        if (array1.length != array2.length)
        {
            return false;
        }

        for (var i = 0; i < array1.length; i++)
        {
            if (array1[i].value == array2[i].value && array1[i].type == array2[i].type)
            {
                continue;
            }
            else
            {
                return false;
            }
        }
        return true;
    },

    /**
     * 重复的卡牌
     */
    repetCard: function(cardId, cardIdArr) {
        var repetition = false;
        for (var count = 0; count < cardIdArr.length; count++)
        {
            if (cardIdArr[count] == cardId)
            {
                repetition = true;
                break;
            }
        }
        return repetition;
    },

    /**
     * 跳过重复牌型
     */
    AvoidDuplicateCardType: function(pokerIndex, pokerType, cardType, func) {
        var index = pokerIndex - 1;
        if (index >= 0)
        {
            if (this.isSameArray(this._pokerTypeObj[cardType][index], pokerType))
            {
                pokerIndex++;
                if (pokerIndex == this._pokerTypeObj[cardType].length)
                {
                    pokerIndex = 0;
                }
                pokerType = this._pokerTypeObj[cardType][pokerIndex];
                func();
                return pokerType;
            }
        }
        return null;
    },

    /**
     * 选中的卡牌
     */
    checkedCard: function(cardIdArr, cardId, repetition) {
        if (!repetition)
        {
            var node = cc.find('card'+cardId, this.cardHand);
            var card = node.getComponent('SSSCard');
            card.isSelect = true;
            cardIdArr.push(cardId);
            return true;
        }
        else if (repetition)
        {
            if (!this.repetCard(cardId, cardIdArr))
            {
                var node = cc.find('card'+cardId, this.cardHand);
                var card = node.getComponent('SSSCard');
                card.isSelect = true;
                cardIdArr.push(cardId);
                return true;
            }
            else
            {
                return false;
            }
        }
        return false;
    },

    /**
     * 选中的牌型
     */
    checkedCardType: function(pokerIndex, cardType, func) {
       
        var pokerType;
        var repetition = false;
        var cardIdArr = [];

        this.initCardStatus();
        
        if (pokerIndex == this._pokerTypeObj[cardType].length)
        {
            pokerIndex = 0;
            pokerType = this._pokerTypeObj[cardType][pokerIndex];
            
            if (this.AvoidDuplicateCardType(pokerIndex, pokerType, cardType, func))
            {
                pokerType = this.AvoidDuplicateCardType(pokerIndex, pokerType, cardType, func);
            }
        }
        else if (pokerIndex < this._pokerTypeObj[cardType].length)
        {
            pokerType = this._pokerTypeObj[cardType][pokerIndex];
            
            if (this.AvoidDuplicateCardType(pokerIndex, pokerType, cardType, func))
            {
                pokerType = this.AvoidDuplicateCardType(pokerIndex, pokerType, cardType, func);
            }
        }

        if (this.isSameCard(pokerType))
        {
            repetition = true;
        }

        for (var i = 0; i < pokerType.length; i++)
        {
            var card1 = pokerType[i];

            for (var key = 0; key < this._cardHandList.length; key++)
            {
                var card2 = this._cardHandList[key];

                if (card1.value == card2.value && card1.type == card2.type)
                {
                    if (this.checkedCard(cardIdArr, key, repetition))
                    {
                        break;
                    }
                    else if (!this.checkedCard(cardIdArr, key, repetition)) continue;
                }
            }
        }
       
        var node = cc.find('card0', this.cardHand);
        var card = node.getComponent('SSSCard');
        card.setCardList(cardIdArr);
        card.bounceCard();
        cc.log('cardIdArr: ', cardIdArr);
    },

    checkedDuiZi: function(evt) {

        var self = this;
        this.checkedCardType(this._pokerDuiZiIndex, RecommendType.DuiZi, function() {
            self._pokerDuiZiIndex++;
        });

        this._pokerDuiZiIndex++;
        if (this._pokerDuiZiIndex >= this._pokerTypeObj[RecommendType.DuiZi].length)
        {
            this._pokerDuiZiIndex = 0;
        }

        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    checkedLiangDui: function(evt) {

        var self = this;
        this.checkedCardType(this._pokerLiangDuiIndex, RecommendType.LiangDui, function() {
            self._pokerLiangDuiIndex++;
        });

        this._pokerLiangDuiIndex++;
        if (this._pokerLiangDuiIndex >= this._pokerTypeObj[RecommendType.LiangDui].length)
        {
            this._pokerLiangDuiIndex = 0;
        }

        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    checkedSanTiao: function(evt) {

        var self = this;
        this.checkedCardType(this._pokerSanTiaoIndex, RecommendType.SanTiao, function() {
            self._pokerSanTiaoIndex++;
        });

        this._pokerSanTiaoIndex++;
        if (this._pokerSanTiaoIndex >= this._pokerTypeObj[RecommendType.SanTiao].length)
        {
            this._pokerSanTiaoIndex = 0;
        }

        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    checkedShunZi: function(evt) {

        var self = this;
        this.checkedCardType(this._pokerShunZiIndex, RecommendType.ShunZi, function() {
            self._pokerShunZiIndex++;
        });

        this._pokerShunZiIndex++;
        if (this._pokerShunZiIndex >= this._pokerTypeObj[RecommendType.ShunZi].length)
        {
            this._pokerShunZiIndex = 0;
        }

        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    checkedTongHua: function(evt) {

        var self = this;
        this.checkedCardType(this._pokerTongHuaIndex, RecommendType.TongHua, function() {
            self._pokerTongHuaIndex++;
        });

        this._pokerTongHuaIndex++;
        if (this._pokerTongHuaIndex >= this._pokerTypeObj[RecommendType.TongHua].length)
        {
            this._pokerTongHuaIndex = 0;
        }

        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    checkedHuLu: function(evt) {

        var self = this;
        this.checkedCardType(this._pokerHuLuIndex, RecommendType.HuLu, function() {
            self._pokerHuLuIndex++;
        });

        this._pokerHuLuIndex++;
        if (this._pokerHuLuIndex >= this._pokerTypeObj[RecommendType.HuLu].length)
        {
            this._pokerHuLuIndex = 0;
        }

        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    checkedTongHuaShun: function(evt) {

        var self = this;
        this.checkedCardType(this._pokerTongHuaShunIndex, RecommendType.TongHuaShun, function() {
            self._pokerTongHuaShunIndex++;
        });

        this._pokerTongHuaShunIndex++;
        if (this._pokerTongHuaShunIndex >= this._pokerTypeObj[RecommendType.TongHuaShun].length)
        {
            this._pokerTongHuaShunIndex = 0;
        }

        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    checkedTieZhi: function(evt) {

        var self = this;
        this.checkedCardType(this._pokerTieZhiIndex, RecommendType.TieZhi, function() {
            self._pokerTieZhiIndex++;
        });

        this._pokerTieZhiIndex++;
        if (this._pokerTieZhiIndex >= this._pokerTypeObj[RecommendType.TieZhi].length)
        {
            this._pokerTieZhiIndex = 0;
        }

        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },

    checkedWuTong: function(evt) {

        var self = this;
        this.checkedCardType(this._pokerWuTongIndex, RecommendType.WuTong, function() {
            self._pokerWuTongIndex++;
        });

        this._pokerWuTongIndex++;
        if (this._pokerWuTongIndex >= this._pokerTypeObj[RecommendType.WuTong].length)
        {
            this._pokerWuTongIndex = 0;
        }

        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);
    },
});

module.exports = SSSPromptCard;
