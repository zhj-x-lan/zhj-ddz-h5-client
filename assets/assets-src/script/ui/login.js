var soundMngr = require('SoundMngr');
var RuleHandler = require('ruleHandler');
var RoomHandler = require('roomHandler');
var matchHandler = require('matchHandler');
var tdk_roomData = require('tdkRoomData');
var configMgr = require('configMgr');
var loginHandler = require('loginHandler');

cc.Class({
  extends: cc.Component,
  properties: {
    manifestUrl: cc.RawAsset,
    versionfile: cc.RawAsset,
    toggle_agree: cc.Toggle,
    label_version: cc.Label,
    login_panel: cc.Node,
    update_panel: cc.Node,
    update_progress: cc.ProgressBar,
    uidInputBox: cc.EditBox,
    gengxinStr: cc.Label,
    huaNode: cc.Node,
    loginImage: cc.Node,
    wenAn: cc.Node,
  },

  // use this for initialization
  onLoad: function () {
    configMgr.init(); //配置文件初始化
    registEvent('updateStart', this, this.showUpdatePanel);
    registEvent('updateProgress', this, this.showUpdateProgress);
    registEvent('updateFinish', this, this.showLoginPanel);
    registEvent('updateNoneed', this, this.showLoginPanel);
    registEvent('updateError', this, this.showUpdateError);
    WriteLog("connect suc onLoad");
    this.uidInputBox.node.active = cc.sys.isNative ? false : true;
    if (cc.sys.os == cc.sys.OS_WINDOWS) {
      this.uidInputBox.node.active = true;
    }
    this.login_panel.active = false;
    tdk_roomData.unregistAllMessage();
    RoomHandler.registMessage();
    matchHandler.registMessage();
    tdk_roomData.registMessage();
    GameDataPDK.init();
    GameData.init();
    GameData13.init();
    GameDataTJDDZ.init();
    profileNiuNiu.init();  // 牛牛初始化
    UpdateHandler.getInstance().checkUpdate(this.manifestUrl);
    this.label_version.string = '版本号:' + UpdateHandler.getInstance().getVersion();
    this.flag_init_x = this.huaNode.x;
    this.setLoginWenAn();
    this.setLoginImage();
  },

  onEnable: function () {
    soundMngr.instance.stopAll();
    soundMngr.instance.playMusic('sound/wait');
    WriteLog("connect suc onEnable");
  },

  onDestroy: function () {
    unregistEvent('updateStart', this, this.showUpdatePanel);
    unregistEvent('updateProgress', this, this.showUpdateProgress);
    unregistEvent('updateFinish', this, this.showLoginPanel);
    unregistEvent('updateNoneed', this, this.showLoginPanel);
    unregistEvent('updateError', this, this.showUpdateError);
  },

  showLoginPanel: function () {
    WriteLog("connect suc showLoginPanel");
    this.login_panel.active = true;
    this.update_panel.active = false;
    loginHandler.loginByLocalData(); //静默登录
  },

  showUpdatePanel: function () {
    WriteLog("connect suc showUpdatePanel");
    this.login_panel.active = false;
    this.update_panel.active = true;
  },

  showUpdateProgress: function (data) {
    WriteLog("connect suc showUpdateProgress");
    if (data.detail) {
      this.gengxinStr.node.active = true;
      this.update_progress.node.active = true;
      this.huaNode.active = true;
      var nowPrg = data.detail * 100;
      nowPrg = parseInt(nowPrg);
      if (nowPrg > 100) return;
      this.gengxinStr.getComponent('cc.Label').string = nowPrg + '%';
      this.update_progress.progress = data.detail;
      this.huaNode.x = this.flag_init_x + this.update_progress.totalLength * this.update_progress.progress;
    } else {
      this.gengxinStr.node.active = false;
      // this.update_progress.node.active = false;
      this.huaNode.active = false;
    }
  },

  showUpdateError: function () {
    createMessageBox('更新失败，请检查您的网络', function () {
      UpdateHandler.getInstance().retry()
    });
  },

  loginBtnCliecked: function (evt) {
    var inputUid = this.uidInputBox.string;
    loginHandler.loginBtn(inputUid);
  },

  setLoginImage: function(){
    var textureUrl = configMgr.getLogo();
    var texture = cc.textureCache.addImage(cc.url.raw(textureUrl));
    if(texture && this.loginImage){
      this.loginImage.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    }
  },
  setLoginWenAn: function(){   
    var label1 = cc.find('label1',this.wenAn);
    var label2 = cc.find('label2',this.wenAn);
    label1.getComponent(cc.Label).string = configMgr.getNotice();
    label2.getComponent(cc.Label).string = configMgr.getVersionText();
  },
  showAgreePanel: function () {
    openView('AgreePanel');
  }
});