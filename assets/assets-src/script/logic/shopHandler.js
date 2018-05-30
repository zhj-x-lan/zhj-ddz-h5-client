var errorCode = require('errorCode');
var shopConfig = require('shopConfig');
var gameDefine = require('gameDefine');

var shop = {};

module.exports = shop;

shop.exchange = function(exchangeId){
  var goods = shopConfig[exchangeId];
  if (!goods) return;
  var playerValue = 0, text = null;
  switch(goods.costType){
    case gameDefine.shopCostType.Shop_Cost_Card: 
      playerValue = GameData.player.card;
      text = '房卡不足';
    break;
    case gameDefine.shopCostType.Shop_Cost_Coin: 
      playerValue = GameData.player.coin;
      text = '金币不足';
    break;
    case gameDefine.shopCostType.Shop_Cost_Point: 
      playerValue = GameData.player.point;
      text = '积分不足';
    break;
  }

  if (playerValue < goods.costNum) {
    createMoveMessage(text);
    return;
  }

  GameNet.getInstance().request("game.shopHandler.exchange", {exchangeId:exchangeId}, function(res){
    switch(res.result){

      case errorCode.Success:
        text = '兑换成功';
      break;

      case errorCode.notEnoughCard: 
        text = '房卡不足';
      break;
      
      case errorCode.notEnoughCoin:
        text = '金币不足';
      break;

      case errorCode.notEnoughPoint:
        text = '积分不足';
      break;

      case errorCode.Fail:
        text = '兑换失败';
      break;
    }

      WriteLog('text = ' + text);
      createMoveMessage(text);
  });
}

