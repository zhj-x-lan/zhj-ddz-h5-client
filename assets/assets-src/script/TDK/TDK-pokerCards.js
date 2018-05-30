var TDKPokerCard = TDKPokerCard || {};

TDKPokerCard.ActionType = {
  Wait:1,     //等待
  Drop:2,     //扣牌
  Inc:3,      //加注
  Flow:4,     //跟注
  Tick:5,     //起脚
  Pass:6,     //不踢
  ReTick:7,   //反踢
  AllIn:8,    //全押
};
TDKPokerCard.STATUS = {
  WAITING: 0,     //等待进人
  READY: 1,       //准备中
  GAMING: 2,      //游戏中
  DISSOLVE: 3     //解散投票
};
TDKPokerCard.CardsFrom9 = [
  109, 110, 111, 112, 113, 115,   //方块 9~A
  209, 210, 211, 212, 213, 215,   //梅花 9~A
  309, 310, 311, 312, 313, 315,   //红桃 9~A
  409, 410, 411, 412, 413, 415,   //黑桃 9~A
];

TDKPokerCard.CardsFrom10 = [
  110, 111, 112, 113, 115,   //方块 10~A
  210, 211, 212, 213, 215,   //梅花 10~A
  310, 311, 312, 313, 315,   //红桃 10~A
  410, 411, 412, 413, 415,   //黑桃 10~A
];

TDKPokerCard.CardsFull = [
  102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 115,  //方块 2~A
  202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 215,  //梅花 2~A
  302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 315,  //红桃 2~A
  402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 415,  //黑桃 2~A
];

TDKPokerCard.CardsKing = [514, 516]; //小王、大王

TDKPokerCard.ScoreType = {
  normal: 0,
  BaoZi: 30,
  ZhaDan: 60,
  DoubleKing: 30,
  BaoZiAndKing: 60
};
TDKPokerCard.calcScore = function (playerCards){
  var cards = [];
  cards = cards.concat(playerCards);
  cards.sort(function (a, b) {return a%100 - b%100;});
  var score = 0, kingS = 0, kingB = 0, max = 0, sum = 0, lastValue = 0;
  var cardType = [];
  for(var i=0;i<cards.length;i++){
    var value = cards[i]%100;
    score += value;
    if(value == 14) kingS ++ ;
    if (value == 16) kingB ++;
    if(lastValue > 0){
      if(lastValue == value){
        sum++;
        if(sum > max) max = sum;
      }
      else{
        if(sum > max) max = sum;
        sum = 1;
      }
    }
    else sum = 1;
    lastValue = value;
  }

  if (kingS > 0 && kingB > 0) score += TDKPokerCard.ScoreType.DoubleKing;
  if (max == 3) score += TDKPokerCard.ScoreType.BaoZi;
  if (max == 4) score += TDKPokerCard.ScoreType.ZhaDan;

  return score;
}