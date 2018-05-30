cc.Class({
    extends: cc.Component,

    properties: {
        bgmVolume: 1.0,
        sfxVolume: 1.0,

        bgmAudioID: -1,
        wxAudio: null,  //小游戏音频播放上下文

    },

    // use this for initialization
    init: function () {
        var t = cc.sys.localStorage.getItem("bgmVolume");
        if (t != null) {
            this.bgmVolume = parseFloat(t);
        }

        var t = cc.sys.localStorage.getItem("sfxVolume");
        if (t != null) {
            this.sfxVolume = parseFloat(t);
        }

        cc.game.on(cc.game.EVENT_HIDE, function () {
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            cc.audioEngine.resumeAll();
        });

        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.wxAudio = wx.createInnerAudioContext();
           
        }
    },



    getUrl: function (url) {
        return cc.url.raw("resources/sounds/" + url);
    },

    playBGM(url) {
        var audioUrl = this.getUrl(url);
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.stop(this.bgmAudioID);
        }
        this.bgmAudioID = cc.audioEngine.play(audioUrl, true, this.bgmVolume);
    },

    /** 新增小游戏音效播放功能 */
    playSFX(url) {
        console.warn('【AudioMgr.js】---> playSFX()...');

        var prefix = 'https://zhj-1256759288.file.myqcloud.com/';
        //var audioUrl = 'res/raw-assets/resources/sounds/nv/hu.mp3'
        var audioUrl = prefix + this.getUrl(url);
        
        var wxTest = false;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wxTest = true;
        }
        if (wxTest) {
            console.warn('音效地址: ===> ' + audioUrl);
            this.wxAudio = wx.createInnerAudioContext();
            this.wxAudio.src = audioUrl; // src 可以设置 http(s) 的路径，本地文件路径或者代码包文件路径
            this.wxAudio.play();
            return;
        }

        if (this.sfxVolume > 0) {
            var audioId = cc.audioEngine.play(audioUrl, false, this.sfxVolume);
        }
    },

    setSFXVolume: function (v) {
        if (this.sfxVolume != v) {
            cc.sys.localStorage.setItem("sfxVolume", v);
            this.sfxVolume = v;
        }
    },

    setBGMVolume: function (v, force) {
        if (this.bgmAudioID >= 0) {
            if (v > 0) {
                cc.audioEngine.resume(this.bgmAudioID);
            }
            else {
                cc.audioEngine.pause(this.bgmAudioID);
            }
            //cc.audioEngine.setVolume(this.bgmAudioID,this.bgmVolume);
        }
        if (this.bgmVolume != v || force) {
            cc.sys.localStorage.setItem("bgmVolume", v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID, v);
        }
    },

    pauseAll: function () {
        cc.audioEngine.pauseAll();
    },

    resumeAll: function () {
        cc.audioEngine.resumeAll();
    }
});
