var cardTypes = {
    straights: {
        level: 1,
        colorFormat: false,
        numFormat: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        allowedLength: [5, 6, 7, 8, 9, 10, 11, 12],
        notAllowedCard: [15]
    },
}

var soundMngr = require('SoundMngr');
cc.Class({
    extends: cc.Component,

    properties: {
        pokerParent: {
            default: null,
            type: cc.Node
        },
        cardMask: {
            default: null,
            type: cc.Prefab
        }
    },

    // use this for initialization
    onLoad: function () {

        //牌
        this.cards = this.pokerParent.children;
        for (var key in this.pokerParent.children) {
            this.cardInitY = this.cards[key].y;
        }
        //牌初始位置
        //this.cardInitY = this.cards[0].y;
        //触摸选择到的牌
        this.touchedCards = [];

        //选中的牌
        this.selectedCards = [];

        this.addTouchEvent();
        // registEvent('ddz-resetPoker', this, this.resetPoker);
    },

    start: function () {
        // this.cards = this.pokerParent.children;

        //this.addTouchEvent();
    },
    onDestroy: function () {
        // unregistEvent('ddz-resetPoker', this, this.resetPoker);
    },
    /**
     * 添加事件
     */
    addTouchEvent: function () {

        //父节点监听touch事件（直接子节点必须注册同样的事件方能触发）
        this.pokerParent.on(cc.Node.EventType.TOUCH_START, function (event) {
            console.log('pokerParent TOUCH_START');

            //牌
            var card = event.target;
            //cc.log('card :'+event);
            //起始触摸位置（和第一张card一样，相对于pokerParent的位置）
            this.touchStartLocation = this.cards[0].convertTouchToNodeSpace(event);
            //console.log('touch start Location:'+ JSON.stringify(this.touchStartLocation));

            //计算牌位置
            var index = 0;
            for (var i = 0; i < this.cards.length; i++) {
                var c = this.cards[i];
                if (c.name == card.name) {
                    index = i;
                    break;
                }
            }
            if (card.name == 'handLayout') {
                this.firstTouchedCard = undefined;
                this.clearTouchedCards();
                return;
            }
            //暂存第一次触摸到的牌
            var touchedCard = {
                index: index,
                card: card
            };
            cc.log('card.active:' + card.active, card.name);
            this.firstTouchedCard = touchedCard;
            this.pushTouchedCards(touchedCard.index, touchedCard.card);
        }, this);

        //父节点监听touch事件（直接子节点必须注册同样的事件方能触发）
        this.pokerParent.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            console.log('pokerParent TOUCH_MOVE');
            //先清除原先触摸到的牌
            this.clearTouchedCards();
            //保存第一张牌
            if (this.firstTouchedCard == undefined) return
            this.pushTouchedCards(this.firstTouchedCard.index, this.firstTouchedCard.card);

            //触摸点转换为card节点坐标
            var nodeLocation = this.cards[0].convertTouchToNodeSpace(event);
            //console.log('touch nodeLocation:'+ JSON.stringify(nodeLocation));
            var x = nodeLocation.x;
            var y = nodeLocation.y;

            // //找到当前选中的牌
            // var currentCard = null;
            // for(var i=0;i< this.cards.length;i++){
            //     var card = this.cards[i];
            //     var cardX = card.x;
            //     var cardY = card.y;
            //     //console.log('card x='+cardX+',y='+cardY);


            //     //某张牌范围包括了鼠标位置，选中此牌与触摸开头的所有牌
            //     //var cardWidth = i==5 ? card.width:19;
            //     var cardWidth = 19;
            //     var cardHeight = card.height;
            //     if(cardX<=x && x <= cardX+cardWidth && cardY<=y && y<= cardY+cardHeight){
            //         currentCard = card;

            //         //暂存触摸到的牌
            //         this.pushTouchedCards(i,card);

            //         break;
            //     }
            // }

            //添加开头与此牌之间的所有牌
            var startTouchLocation = this.touchStartLocation;
            for (var i = 0; i < this.cards.length; i++) {
                var card = this.cards[i];
                var cardX = card.x + 20;
                //框选的范围包括了的牌
                var min, max;
                if (startTouchLocation.x < nodeLocation.x) {
                    //cc.log('1111111111111');
                    min = startTouchLocation.x;
                    max = nodeLocation.x;
                } else {
                    // cc.log('22222222222');
                    min = nodeLocation.x;
                    max = startTouchLocation.x;
                }
                //console.log('min='+min+', max='+max);

                if (min <= cardX && cardX <= max) {
                    //暂存触摸到的牌
                    if (card.active) {
                        this.pushTouchedCards(i, card);
                    }
                }
            }


        }, this);

        //父节点监听touch事件（直接子节点必须注册同样的事件方能触发）
        this.pokerParent.on(cc.Node.EventType.TOUCH_END, function (event) {
            console.log('pokerParent TOUCH_END');
            //soundMngr.instance.playOtherAudioPoker('click',null);
            this.doSelectCard();
        }, this);

        //父节点监听touch事件（直接子节点必须注册同样的事件方能触发）
        this.pokerParent.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            console.log('pokerParent TOUCH_CANCEL');
            //soundMngr.instance.playOtherAudioPoker('click',null);
            this.doSelectCard();
        }, this);

        //给所有的牌注册事件，会自动冒泡到pokerParent节点
        for (var i = 0; i < this.cards.length; i++) {
            var cards = this.cards;
            //闭包传递i值
            (function (i) {
                var card = cards[i];
                card.on(cc.Node.EventType.TOUCH_START, function (event) {
                    console.log('card TOUCH_START');
                }, card);

                card.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
                    console.log('card TOUCH_MOVE');
                }, card);

                card.on(cc.Node.EventType.TOUCH_END, function (event) {
                    console.log('card TOUCH_END');
                    if (card.active) {
                        soundMngr.instance.playOtherAudioPoker('click', null);
                    }
                }, card);

                card.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
                    console.log('card TOUCH_CANCEL');
                    if (card.active) {
                        soundMngr.instance.playOtherAudioPoker('click', null);
                    }
                }, card);


            })(i)

        }

    },

    /**
     * 暂存触摸到的牌
     */
    pushTouchedCards: function (index, card) {
        //构造牌对象
        //cc.log('card.y :'+card.y);
        var cardObj = {
            index: index,
            name: card.name,
            isSelected: card.y == this.cardInitY ? false : true //高度不一样，表示选中
        };

        //防止重复添加
        var existCard = this.touchedCards.find(function (obj) {
            if (obj.name == card.name) {
                return obj;
            } else {
                return null;
            }
        });
        if (!existCard) {
            //添加暂存
            this.touchedCards.push(cardObj);

            //包含提示
            this.addCardMask(card);
        }
    },

    /**
     * 清除原先暂存的触摸到的牌
     */
    clearTouchedCards: function () {
        for (var i = 0; i < this.touchedCards.length; i++) {
            var cardIndex = this.touchedCards[i].index;
            var card = this.cards[cardIndex];
            card.removeChildByTag(100);
        }
        this.touchedCards = [];
    },

    /**
     * 选择牌
     */
    /*doSelectCard: function () {
        this.selectedCards = [];
        this.pokerTypeArry = [];
        this.shunziArry = [];
        // console.log(this.touchedCards);
        //将poker push进数组
        for (var i = 0; i < this.touchedCards.length; i++) {
            var cardObj = this.touchedCards[i];
            var card = this.cards[cardObj.index];
            var cardId = card.getComponent('Card').id;
            this.pokerTypeArry.push(cardId);
        }
        //数组去重
        for (var j = 0; j < this.pokerTypeArry.length; j++) {
            for (var k = 0; k < this.pokerTypeArry.length; k++) {
                if (k != j) {
                    if (this.pokerTypeArry[k] % 100 == this.pokerTypeArry[j] % 100) {
                        this.pokerTypeArry.splice(k, 1);
                    }
                }

            }
        }
        //选中poker是否有顺子
        var bool = this.getCardsType(this.pokerTypeArry);
        //cc.log('111111111data:'+bool);
        if (bool) {
            for (var j = 0; j < this.pokerTypeArry.length; j++) {
                var exist = true;
                for (var k = 0; k < this.shunziArry.length; k++) {
                    if (this.pokerTypeArry[j] % 100 == this.shunziArry[k] % 100)
                        exist = false;
                }
                if (exist) {
                    this.shunziArry.push(this.pokerTypeArry[j]);
                }
            }
        }

        //改变牌状态
        for (var i = 0; i < this.touchedCards.length; i++) {
            var cardObj = this.touchedCards[i];
            var card = this.cards[cardObj.index];
            var cardId = card.getComponent('Card').id;
            cc.log('card:' + card.name);
            //显示顺子poker
            for (var j = 0; j < this.shunziArry.length; j++) {
                if (cardId == this.shunziArry[j]) {
                    if (cardObj.isSelected) { //如果是选中改为不选中
                        card.y = card.y - 30;
                    } else { //不选中改为选中状态
                        card.y = card.y + 30;
                    }
                }
            }
            //显示非顺子poker
            if (this.shunziArry.length == 0) {
                if (cardObj.isSelected) { //如果是选中改为不选中
                    card.y = card.y - 30;
                } else { //不选中改为选中状态
                    card.y = card.y + 30;
                }
            }

        }


        //重置
        this.clearTouchedCards();

        //显示选中的牌
        this.showSelectedCards();
    },*/

    contain: function(arr, obj) {
        if (arr.toString() == obj.toString()) {  
            return true;  
        }    
        return false;  
    },

    doSelectCard: function () {
        this.selectedCards = [];
        this.pokerTypeArry = [];
        this.shunziArry = [];
        var tempPokerArr = [];
        var flag = true;
        // console.log(this.touchedCards);
        //将poker push进数组
        for (var i = 0; i < this.touchedCards.length; i++) {
            var cardObj = this.touchedCards[i];
            var card = this.cards[cardObj.index];
            var cardId = card.getComponent('Card').id;
            this.pokerTypeArry.push(cardId);
            tempPokerArr.push(cardId % 100);
        }
        //数组去重
        for (var j = 0; j < this.pokerTypeArry.length; j++) {
            for (var k = 0; k < this.pokerTypeArry.length; k++) {
                if (k != j) {
                    if (this.pokerTypeArry[k] % 100 == this.pokerTypeArry[j] % 100) {
                        this.pokerTypeArry.splice(k, 1);
                    }
                }

            }
        }
        
        //选中poker是否有顺子
        var bool = this.getCardsType(this.pokerTypeArry);
       
        if(bool){
            var pokerArr = [];
            for (var j = 0; j < this.pokerTypeArry.length; j++) {
                pokerArr.push(this.pokerTypeArry[j] % 100);
                pokerArr.push(this.pokerTypeArry[j] % 100);
            }
            pokerArr.sort(function(a, b) {
                return a - b;
            });
            tempPokerArr.sort(function(a, b) {
                return a - b;
            });
            if(this.contain(pokerArr,tempPokerArr)){
                flag = false;
            }
        }
        //cc.log('111111111data:'+bool);
        if (flag && bool == 'straights') {
            for (var j = 0; j < this.pokerTypeArry.length; j++) {
                var exist = true;
                for (var k = 0; k < this.shunziArry.length; k++) {
                    if (this.pokerTypeArry[j] % 100 == this.shunziArry[k] % 100)
                        exist = false;
                }
                if (exist) {
                    this.shunziArry.push(this.pokerTypeArry[j]);
                }
            }
        }

        //改变牌状态
        for (var i = 0; i < this.touchedCards.length; i++) {
            var cardObj = this.touchedCards[i];
            var card = this.cards[cardObj.index];
            var cardId = card.getComponent('Card').id;
            cc.log('card:' + card.name);
            //显示顺子poker
            for (var j = 0; j < this.shunziArry.length; j++) {
                if (cardId == this.shunziArry[j]) {
                    if (cardObj.isSelected) { //如果是选中改为不选中
                        card.y = card.y - 30;
                    } else { //不选中改为选中状态
                        card.y = card.y + 30;
                    }
                }
            }
            //显示非顺子poker
            if (this.shunziArry.length == 0) {
                if (cardObj.isSelected) { //如果是选中改为不选中
                    card.y = card.y - 30;
                } else { //不选中改为选中状态
                    card.y = card.y + 30;
                }
            }

        }


        //重置
        this.clearTouchedCards();

        //显示选中的牌
        this.showSelectedCards();
    },


    /**
     * 包含牌遮罩
     */
    addCardMask: function (card) {
        var cardMask = cc.instantiate(this.cardMask);
        cardMask.setTag(100);
        cardMask.setPosition(cc.p(0, 0));
        card.addChild(cardMask);
    },

    /**
     * 显示选中的牌
     */
    showSelectedCards: function () {
        this.selectedCards = [];
        for (var i = 0; i < this.cards.length; i++) {
            var card = this.cards[i];
            var isSelected = card.y == this.cardInitY ? false : true;
            if (isSelected) {
                this.selectedCards.push(card.name);
            }
        }
        //输出
        sendEvent("ddz-disPokerArry", this.selectedCards);
    },


    getCardsType: function (cards) {
        for (var key in cardTypes) {
            // cc.log("key = " + key);
            var type = cardTypes[key];
            // 只判断长度相等的牌型
            var lengthmatch = false;
            for (var i = 0; i < type.allowedLength.length; i++) {
                if (type.allowedLength[i] == cards.length) {
                    lengthmatch = true;
                }
            };
            // 只判断长度相等的牌型
            if (!lengthmatch) {
                continue;
            }
            var numbers = this.createSortedCardNumbers(cards);
            cc.log("numbers = " + numbers);
            // 如果牌型中有禁止的数字(顺子不能带2)
            var fatch = true;
            if (type.notAllowedCard) {
                for (var i = 0; i < numbers.length; i++) {
                    for (var j = 0; j < type.notAllowedCard.length; j++) {
                        if (numbers[i] == type.notAllowedCard[j]) {
                            //cc.log('fatch:'+fatch);
                            fatch = false;
                        }
                    }
                }
            }
            var count1 = 0,
                count2 = 0;
            if (key.substring(0, key.length - 1) == 'aircraft' || key == 'aircraft') {
                for (var i = 0; i < cards.length; i++) {
                    if (cards[i] == 115 || cards[i] == 215 || cards[i] == 315 || cards[i] == 415) {
                        count1++;
                    } else if (cards[i] == 114 || cards[i] == 214 || cards[i] == 314 || cards[i] == 414) {
                        count2++;
                    }
                    if (count1 == 3 && count2 == 3) {
                        fatch = false;
                    }
                }
            }
            if (!fatch) {
                continue;
            }
            // 判断匹配格式
            var formatMacth = true;
            var format = type.numFormat;
            var cutNum = null;
            var startNum = [];
            //数组去重
            for (var j = 0; j < numbers.length; j++) {
                for (var k = 0; k < numbers.length; k++) {
                    if (k != j) {
                        if (numbers[k] == numbers[j]) {
                            numbers.splice(k, 1);
                        }
                    }

                }
            }
            //数组排序
            numbers.sort(function (a, b) {
                return a - b;
            })
            cc.log('numbers = ' + numbers);
            for (var i = 0; i < numbers.length; i++) {
                // 等于零则跳过
                if (format[i] == 0) {
                    continue;
                } else if (format[i] < 0) {
                    if (!startNum[-format[i]]) {
                        startNum[-format[i]] = numbers[i]
                    } else {
                        if (startNum[-format[i]] != numbers[i]) {
                            formatMacth = false;
                            break;
                        }
                    }
                } else {
                    if (cutNum == null) {
                        cutNum = numbers[i] - format[i];
                    } else {
                        if (cutNum != numbers[i] - format[i]) {
                            formatMacth = false;
                            break;
                        }
                    }
                }
            };
            if (formatMacth && numbers.length >= 5) {
                return key;
            }
        };
        return false;
    },
    createSortedCardNumbers: function (cards) {
        // 所有牌余除100得到纯点数
        var numbers = [];
        for (var i = 0; i < cards.length; i++) {
            numbers[i] = cards[i] % 100;
        };
        return numbers;

    }
});