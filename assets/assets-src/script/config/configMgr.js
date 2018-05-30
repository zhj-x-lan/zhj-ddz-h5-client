var gameDefine = require('gameDefine');

var configMgr = {
  m_cur_config: null
};

module.exports = configMgr;

configMgr.init = function(){
  var curType = gameDefine.AreaType.Area_Test;  //测试
  //var curType = gameDefine.AreaType.Area_TianJin;  //天津
  // var curType = gameDefine.AreaType.Area_HuaDian;  //桦甸
  switch(curType){
    case gameDefine.AreaType.Area_Test: this.m_cur_config = require('test'); break;
    case gameDefine.AreaType.Area_TianJin: this.m_cur_config = require('tianjin'); break;
    case gameDefine.AreaType.Area_HuaDian: this.m_cur_config = require('huadian'); break;
    case gameDefine.AreaType.Area_DunHua: this.m_cur_config = require('dunhua'); break;
    case gameDefine.AreaType.Area_HEB: this.m_cur_config = require('haerbin'); break;
    case gameDefine.AreaType.Area_Hebei: this.m_cur_config = require('hebei'); break;
    case gameDefine.AreaType.Area_Changchun: this.m_cur_config = require('changchun'); break;
  }
}

configMgr.getConfig = function(){
  return this.m_cur_config;
}

configMgr.getServerConfig = function(){
  return this.m_cur_config.serverConfig;
}

configMgr.getAreaType = function(){
  return this.m_cur_config.areaType;
}

configMgr.getGameName = function(){
  return this.m_cur_config.gameName;
}

configMgr.getIP = function(){
  return this.m_cur_config.serverIP;
}

configMgr.getPort = function(){
  return this.m_cur_config.serverPort;
}

configMgr.getModeType = function(){
  return this.m_cur_config.ModeType;
}

configMgr.getWXShareUrl = function(){
  return this.m_cur_config.wxShareUrl;
}

configMgr.getWxWelcomeText = function(){
  return this.m_cur_config.wxWelcomeText;
}

configMgr.getLogo = function(){
  return this.m_cur_config.loginLogo;
}

configMgr.getNotice = function(){
  return this.m_cur_config.notice;
}

configMgr.getVersionText = function(){
  return this.m_cur_config.versionText;
}

configMgr.getGameVisible = function(){
  return this.m_cur_config.GameVisible;
}

configMgr.getSetCardsOpen = function(){
    return this.m_cur_config.SetCardsOpen;
}
configMgr.getArea = function(){
  return this.m_cur_config.areaType;
}

configMgr.getMatchGameType = function(){
    return this.m_cur_config.MatchGameType;
}

configMgr.getFightGameType = function(){
    return this.m_cur_config.FightGameType;
}

configMgr.getPoster = function(){
    return this.m_cur_config.Poster;
}