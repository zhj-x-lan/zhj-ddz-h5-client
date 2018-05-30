var gameDefine = require('gameDefine');

var SoundMngr = cc.Class({
    extends: cc.Component,

    properties: {
        displayId: 0,
        displayUrl: '',
        displayAudio: {
            url: cc.AudioClip,
            default: null
        },
    },

    statics: {
        instance: null
    },

    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
        SoundMngr.instance = this;
    },

    stopAll: function () {
        this.displayId = 0;
        this.displayUrl = '';
        cc.audioEngine.stopAll();
    },

    playMusic: function(url) {
        if (this.displayUrl == url) {
            return;
        }

        var self = this;
        this.displayUrl = url;
        cc.audioEngine.stop(this.displayId);
        cc.loader.loadRes(url, cc.AudioClip, function (err, audioClip) {
            var volume = GameData.SetLayerData.musicOpen == true ? GameData.SetLayerData.musicVolume : 0;
            self.displayAudio = audioClip;
            self.displayId = cc.audioEngine.play(self.displayAudio, true, volume);
            cc.audioEngine.setVolume(self.displayId, volume);
        });
    },

    bgmVolume: function (v) {
        cc.audioEngine.setVolume(this.displayId, v);
    },

    playAudio: function (type, card, sex) {
        cc.log("...type, card, sex:"+type, card, sex);
        var resAudio = '';
        var LanguageType = cc.sys.localStorage.getItem('languageType' + GameData.player.uid) || GameData.language_putong;

        switch (type) {
            case 'dis':
                resAudio = 'card_' + card;
                break;
            case 'peng':
                resAudio = 'peng';
                break;
            case 'gang':
                resAudio = 'gang';
                break;
            case 'hu':
                resAudio = 'hu';
                break;
            case 'chi':
                resAudio = 'chi';
                break;
                // case 'click':resAudio = 'card_click';break;
                // case 'out':resAudio = 'card_out';break;
                // case 'countdown':resAudio = 'countdown';break;
            default:
                return;
        }
        var LanguagePath = '';
        if (LanguageType == GameData.language_putong) {
            if (sex == 1) {
                LanguagePath = 'putong/boy/';
            } else {
                LanguagePath = 'putong/girl/';
            }
        } else if (LanguageType == GameData.language_tianjin) {
            if (sex == 1) {
                LanguagePath = 'tianjin/boy/';
            } else {
                LanguagePath = 'tianjin/girl/';
            }
        }
        var audioUrl = 'resources/sound/' + LanguagePath + resAudio + '.mp3';
        cc.log('...play audio '+ resAudio);
        cc.log('...audioUrl '+ audioUrl);
        var audioDis = new cc.AudioSource();
        audioDis.clip = cc.url.raw(audioUrl);
        if (GameData.SetLayerData.soundOpen == false) {
            audioDis.volume = 0;
        } else {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }

        audioDis.play();
    },
    //播放聊天快捷语音
    playAudioChat: function (data, sex) {

        console.log("GameData.client.sex,GameData.player.uid", GameData.client.sex, GameData.player.uid, GameData.player.sex);
        var resAudio = '';
        var LanguagePath = '';
        if( GameData.client.gameType == gameDefine.GameType.Game_Mj_Tianjin) {
            if (sex == 1) {
                LanguagePath = 'resources/sound/tianjin/boy/';
            } else {
                LanguagePath = 'resources/sound/tianjin/girl/';
            }
        }
        else if( GameData.client.gameType == gameDefine.GameType.Game_niu_niu) {
            cc.log("..niuniu");
            if (sex == 1) {
                LanguagePath = 'resources/sound/niuniu/nan/';
            }else{
                LanguagePath = 'resources/sound/niuniu/nv/';
            }
        }
        else if( GameData.client.gameType == gameDefine.GameType.Game_TDK) {
            cc.log("..tdk");
            if (sex == 1) {
                LanguagePath = 'resources/TDK/sound/man/';
            }else{
                LanguagePath = 'resources/TDK/sound/woman/';
            }
        }
        else if( GameData.client.gameType == gameDefine.GameType.Game_Mj_Shishi ) {
            cc.log("..shishi");
            if (sex == 1) {
                LanguagePath = 'resources/shishi/sound/shishi_fangyan/man/';
            }else{
                LanguagePath = 'resources/shishi/sound/shishi_fangyan/woman/';
            }

        }else if (GameData.client.gameType == gameDefine.GameType.Game_MJ_HuaDian
                    || GameData.client.gameType == gameDefine.GameType.Game_Mj_CC
                    || GameData.client.gameType == gameDefine.GameType.Game_Mj_Heb) {
            cc.log("..huadian or changchun or heb");
            if (sex == 1) {
                LanguagePath = 'resources/huadian/sound/boy/';
            } else {
                LanguagePath = 'resources/huadian/sound/girl/';
            }
        }

        //cc.log('play audio '+ resAudio);
        var audioDis = new cc.AudioSource();
        audioDis.clip = cc.url.raw(LanguagePath + data + '.mp3');
        if (GameData.SetLayerData.soundOpen == false) {
            audioDis.volume = 0;
        } else {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }
        audioDis.play();
    },
    //播放其他音效（cutdown、clik、out）
    playAudioOther: function (data) {
        var resAudio = '';
        switch (data) {
            case 'click':
                resAudio = 'card_click';
                break;
            case 'out':
                resAudio = 'card_out';
                break;
            case 'countdown':
                resAudio = 'countdown';
                break;
            default:
                return;
        }
        var audioDis = new cc.AudioSource();
        audioDis.clip = cc.url.raw('resources/sound/' + resAudio + '.mp3');
        if (GameData.SetLayerData.soundOpen == false) {
            audioDis.volume = 0;
        } else {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }

        audioDis.play();
    },
    //播放胡牌音效
    playAudioHu: function (data, sex) {
        var resAudio = '';
        var audioDis = new cc.AudioSource();
        var temp = null;
        var HuTypeStr = '';
        var SexPath = '';
        if (sex == 1) {
            SexPath = 'tianjin/boy/';
        } else {
            SexPath = 'tianjin/girl/';
        }
        //cc.log('data ===============>',data.type);
        data.type.sort(function (a, b) {
            return a - b;
        });
        //cc.log('data ===============>',data.type);
        HuTypeStr = data.type.toString();
        //cc.log('HuTypeStr ===============>',HuTypeStr);
        switch (HuTypeStr) {
            case '2':
                resAudio = '1';
                break; //没混
            case '3':
                resAudio = '2';
                break; //混吊
            case '2,10':
                resAudio = '3';
                break; //杠开
            case '5':
                resAudio = '4';
                break; //捉五
            case '6':
                resAudio = '5';
                break; //一条龙 
            case '3,10':
                resAudio = '6';
                break; //杠开混吊
            case '2,10':
                resAudio = '7';
                break; //杠开没混
            case '4,5':
                resAudio = '8';
                break; //双混捉五
            case '2,5':
                resAudio = '9';
                break; //没混捉五
            case '5,10':
                resAudio = '10';
                break; //杠开捉五
            case '5,6':
                resAudio = '11';
                break; //捉五龙
            case '7':
                resAudio = '12';
                break; //本混龙
            case '3,6':
                resAudio = '13';
                break; //混吊龙
            case '3,7':
                resAudio = '14';
                break; //混吊本混龙
            case '2,6':
                resAudio = '15';
                break; //素龙
            case '6,10':
                resAudio = '16';
                break; //杠开一条龙
            case '4,5,10':
                resAudio = '17';
                break; //杠开双混捉五
            case '2,5,10':
                resAudio = '18';
                break; //杠开素捉五
            case '4,5,6':
                resAudio = '19';
                break; //双混捉五龙
            case '5,7':
                resAudio = '20';
                break; //捉五本混龙
            case '2,5,6':
                resAudio = '21';
                break; //没混捉五龙
            case '5,6,10':
                resAudio = '22';
                break; //杠开捉五龙
            case '7,10':
                resAudio = '23';
                break; //杠开本混龙
            case '3,6,10':
                resAudio = '24';
                break; //杠开混吊龙
            case '2,6,10':
                resAudio = '25';
                break; //杠开没混龙
            case '2,7':
                resAudio = '26';
                break; //素本混龙
            case '4,5,7':
                resAudio = '27';
                break; //双混捉五本混龙
            case '2,5,6,10':
                resAudio = '28';
                break; //杠开没混捉五龙
            case '5,7,10':
                resAudio = '29';
                break; //杠开捉五本混龙
            case '2,5,7':
                resAudio = '30';
                break; //素捉五本混龙
            case '3,7,10':
                resAudio = '31';
                break; //杠开混吊本混龙
            case '2,7,10':
                resAudio = '32';
                break; //杠开素本混龙
            case '2,5,7,10':
                resAudio = '33';
                break; //杠开素捉五本混龙
            case '8':
                resAudio = '34';
                break;
            case '4':
                resAudio = '2';
                break; //双混吊
            default:
                return;
        }
        //cc.log('resAudio======================>',resAudio);
        audioDis.clip = cc.url.raw('resources/sound/' + SexPath + 'card_h_' + resAudio + '.mp3');
        if (GameData.SetLayerData.soundOpen == false) {
            audioDis.volume = 0;
        } else {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }
        audioDis.play();
    },
    //ddz 音效************************************************************************************//
    //播放poker 音效
    playAudioPokerDisType: function (data, sex, bool) {
        var resAudio = '';
        var audioDis = new cc.AudioSource();
        var SexPath = '';
        var pokerDisTypeStr = data.detail.type;
        if (sex == 1) {
            SexPath = 'boy/';
        } else {
            SexPath = 'girl/';
        }
        switch (pokerDisTypeStr) {
            case 'straights':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'shunzi';
                }
                break; //顺子
            case 'threeAndOne':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'sandaiyi';
                }
                break; //3代1
            case 'threeAndTwo':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'sandaiyidui';
                }
                break; //3代2
            case 'fourAndTwo':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'sidaier';
                }
                break; //4代2
            case 'fourAndFour':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'sidailiangdui';
                }
                break; //4代2
            case 'doublestraights':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'liandui';
                }
                break; //连对
            case 'bomb':
                resAudio = 'zhadan';
                break; //炸弹
            case 'jokerBomb':
                resAudio = 'wangzha';
                break; //王炸
            case 'aircraft':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'feiji';
                }
                break; //飞机
            case 'aircraft2':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'feiji';
                }
                break; //飞机
            case 'aircraft3':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'feiji';
                }
                break; //飞机
            case 'aircraft4':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'feiji';
                }
                break; //飞机
            case 'aircraft5':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'feiji';
                }
                break; //飞机
            case 'aircraft6':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'feiji';
                }
                break; //飞机
            case 'aircraft7':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'feiji';
                }
                break; //飞机
            case 'aircraft8':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'feiji';
                }
                break; //飞机
            case 'singleCard':
                resAudio = 'dan' + data.detail.card;
                break; //单
            case 'doubleCards':
                resAudio = 'dui' + data.detail.card;
                break; //对
            case 'threeCards':
                if (bool) {
                    resAudio = 'dani' + Math.floor(Math.random() * 3 + 1)
                } else {
                    resAudio = 'san' + data.detail.card;
                }
                break; //3张
            default:
                return;
        }
        //cc.log('resAudio======================>',resAudio);
        audioDis.clip = cc.url.raw('resources/ddz/sound/' + SexPath + resAudio + '.mp3');
        if (GameData.SetLayerData.soundOpen == false) {
            audioDis.volume = 0;
        } else {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }
        audioDis.play();
    },
    //ddz其他音效
    playOtherAudioPoker: function (str, sex) {
        var resAudio = '';
        var audioDis = new cc.AudioSource();
        var SexPath = '';
        cc.log('sex ' + sex);
        if (sex == 1) {
            SexPath = 'boy/';
        } else if (sex == 2) {
            SexPath = 'girl/';
        }
        switch (str) {
            case 'buyao':
                resAudio = 'buyao' + Math.floor(Math.random() * 4 + 1);
                break; //不要
            case 'pdk-buyao':
                resAudio = 'buyao4';
                break; //不要
            case 'baojing1':
                resAudio = 'baojing1';
                break; //报单1
            case 'baojing2':
                resAudio = 'baojing2';
                break; //报单2
            case 'baojing':
                resAudio = 'baojing';
                break; //报警音效
            case 'yifen':
                resAudio = 'yifen';
                break; //叫分1
            case 'liangfen':
                resAudio = 'liangfen';
                break; //叫分2
            case 'sanfen':
                resAudio = 'sanfen';
                break; //叫分3
            case 'bujiao':
                resAudio = 'bujiao';
                break; //不叫
            case 'bomb':
                resAudio = 'bomb';
                break; //炸弹音效
            case 'chuntian':
                resAudio = 'chuntian';
                break; //春天音效
            case 'plane':
                resAudio = 'plane';
                break; //飞机音效
            case 'shengli':
                resAudio = 'shengli';
                break; //胜利音效
            case 'shibai':
                resAudio = 'shibai';
                break; //失败音效
            case 'click':
                resAudio = 'click';
                break; //点击音效
            case 'discard':
                resAudio = 'discard';
                break; //出牌音效
            default:
                return;
        }
        WriteLog('resAudio' + resAudio);
        WriteLog('SexPath' + SexPath);
        //cc.log('resAudio======================>',resAudio);
        audioDis.clip = cc.url.raw('resources/ddz/sound/' + SexPath + resAudio + '.mp3');
        if (GameData.SetLayerData.soundOpen == false) {
            audioDis.volume = 0;
        } else {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }
        audioDis.play();
    },
    //播放聊天快捷语音
    playAudioPokerChat: function (data, sex) {
        var resAudio = '';
        var SexPath = '';
        if (sex == 1) {
            SexPath = 'boy/';
        } else {
            SexPath = 'girl/';
        }
        //cc.log('play audio '+ resAudio);
        var audioDis = new cc.AudioSource();
        audioDis.clip = cc.url.raw('resources/ddz/sound/' + SexPath + data + '.mp3');
        if (GameData.SetLayerData.soundOpen == false) {
            audioDis.volume = 0;
        } else {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }
        audioDis.play();
    },

    /**
     * 播放牛牛的音频
     * @param pokerType 牌型  -1 开始音频 -2 发牌 -3 win -4 lose
     * @param sex 性别
     */
    playNiuNiuAudio : function (pokerType, sex) {
        sex = sex || 1;
        var LanguagePath = '';
        if (parseInt(sex)  == 1) {
            LanguagePath = 'nan/niu_';
        }else{
            LanguagePath = 'nv/niu_';
        }

        var audioUrl = 'resources/sound/niuniu/'+LanguagePath+pokerType+'.mp3';

        if (pokerType == -1) {
            audioUrl = 'resources/sound/niuniu/startgame.mp3'
        }
        if (pokerType == -2) {
            audioUrl = 'resources/sound/niuniu/xitongfapai.mp3'
        }
        if (pokerType == -3) {
            audioUrl = 'resources/sound/niuniu/niu_win.mp3'
        }
        if (pokerType == -4) {
            audioUrl = 'resources/sound/niuniu/niu_lose.mp3'
        }

        var audioDis = new cc.AudioSource();
        audioDis.clip = cc.url.raw(audioUrl);
        if(GameData.SetLayerData.soundOpen == false)
        {
            audioDis.volume = 0;
        }
        else
        {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }
        audioDis.play();
    },
    //播放十三水音效
    playSSSAudio : function( data ){
        if( data == undefined || data.length <= 0 ){
            return;
        }
        var resAudio = data;

        var audioDis = new cc.AudioSource();
        audioDis.clip = cc.url.raw('resources/shisanshui/sound/'+resAudio+'.mp3');
        if(GameData.SetLayerData.soundOpen == false) {
            audioDis.volume = 0;
        } else {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }

        audioDis.play();
    },
    //播放十三水打牌时说话音效
    playSSSSpeakAudio : function( data,sex ){
        if( data == undefined || sex == undefined || data.length <= 0 ){
            return;
        }
        var resAudio = data;

        var LanguagePath = '';
        if (sex == 1) {
            LanguagePath = 'man/'+resAudio;
        }else{
            LanguagePath = 'woman/'+resAudio+"_n";
        }

        var audioDis = new cc.AudioSource();
        audioDis.clip = cc.url.raw('resources/shisanshui/sound/'+LanguagePath+'.mp3');
        if(GameData.SetLayerData.soundOpen == false) {
            audioDis.volume = 0;
        } else {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }

        audioDis.play();
    },

    //填大坑音效
    playTDKAudio: function(type,sex){
        var resAudio = '';
        var LanguagePath = '';
        if (sex == 1) {
            LanguagePath = 'man/0_';
        }else{
            LanguagePath = 'woman/1_';
        }
        switch(type){
            case 2:
                resAudio = 'kou'+Math.floor(Math.random()*2+1);
            break;
            case 3:
                resAudio = 'xz1';
            break;
            case 4:
                resAudio = 'gen'+Math.floor(Math.random()*2+1);
            break;
            case 5:
                resAudio = 'ti'+Math.floor(Math.random()*2+1);
            break;
            case 6:
                resAudio = 'bt'+Math.floor(Math.random()*2+1);
            break;
            case 7:
                resAudio = 'ft'+Math.floor(Math.random()*2+1);
            break;
            case 8:
                resAudio = 'quanxia';
            break;
            case 'kaipai':
                resAudio = 'bp'+Math.floor(Math.random()*2+1);
            break;
        }
        var audioDis = new cc.AudioSource();
        audioDis.clip = cc.url.raw('resources/TDK/sound/' + LanguagePath + resAudio + '.mp3');
        //cc.log(LanguagePath);
        if (GameData.SetLayerData.soundOpen == false) {
            audioDis.volume = 0;
        }
        else {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }
        audioDis.play();
    },
    //填大坑其他音效
    playTDKOther: function(type){
        var resAudio = '';
        switch(type){
            case 'fapai': resAudio = 'card'; break;
            case 'chouma': resAudio = 'chip_end'; break;
            case 'start': resAudio = 'start'; break;
            case 'languo': resAudio = 'languo'; break;
            case 'win': resAudio = 'dayingjia'; break;
            case 'lost': resAudio = 'lost'; break;
            case 'xiaguo': resAudio = 'chip_add'; break;
        }
        var audioDis = new cc.AudioSource();
        audioDis.clip = cc.url.raw('resources/TDK/sound/' + resAudio + '.mp3');
        //cc.log(LanguagePath);
        if (GameData.SetLayerData.soundOpen == false) {
            audioDis.volume = 0;
        }
        else {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }
        audioDis.play();
    },

    //石狮麻将
    playAudioShiShi: function(type, card,sex) {
        var resAudio = '';
        var LanguageType = cc.sys.localStorage.getItem('languageType'+GameData.player.uid)||GameData.language_tianjin;

        switch (type) {
            case 'dis': {
                resAudio = 'card_'+card;
            } break;
            case 'peng': {
                resAudio = 'peng';
            } break;
            case 'gang': {
                resAudio = 'gang';
            } break;
            case 'hu': {
                resAudio = 'hu';
            } break;
            case 'chi': {
                resAudio = 'chi';
            } break;
            case 'buhua': {
                resAudio = 'buhua';
            }break;
            default:return;
        }
        var LanguagePath = '';
        if(LanguageType == GameData.language_putong ){
            if(sex == 1){
                LanguagePath = 'shishi_putong/man/';
            }else{
                LanguagePath = 'shishi_putong/woman/';
            }
        }
        else if (LanguageType == GameData.language_tianjin) {
            if(sex == 1){
                LanguagePath = 'shishi_fangyan/man/';
            }else{
                LanguagePath = 'shishi_fangyan/woman/';
            }
        }
        cc.log('play audio '+ resAudio);
        var audioDis = new cc.AudioSource();
        console.log('LanguagePath '+LanguagePath);
        audioDis.clip = cc.url.raw('resources/shishi/sound/'+LanguagePath+resAudio+'.mp3');
        cc.log(LanguagePath);
        if(GameData.SetLayerData.soundOpen == false) {
            audioDis.volume = 0;
        } else {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }
        audioDis.play();
    },

    playAudioHD: function (type, card, sex) {
        var resAudio = '';
        var LanguageType = cc.sys.localStorage.getItem('languageType' + GameData.player.uid) || GameData.language_tianjin;
        console.log('LanguageType:'+cc.sys.localStorage.getItem('languageType' + GameData.player.uid));
        switch (type) {
            case 'dis': resAudio = 'card_' + card; break;
            case 'cha': resAudio = 'cha'; break;
            case 'andan': resAudio = 'andan'; break;
            case 'mingdan': resAudio = 'mingdan'; break;
            case 'hu': resAudio = 'hu'; break;
            case 'chi': resAudio = 'chi'; break;
            case 'buhua': resAudio = 'buhua'; break;
            case 'ting': resAudio = 'ting'; break;
            default: return;
        }
        var LanguagePath = '';
        if (LanguageType == GameData.language_putong) {
            if (sex == 1) {
                LanguagePath = 'sound/putong/boy/';
            } else {
                LanguagePath = 'sound/putong/girl/';
            }
        }
        else if (LanguageType == GameData.language_tianjin) {
            if (sex == 1) {
                LanguagePath = 'huadian/sound/boy/';
            } else {
                LanguagePath = 'huadian/sound/girl/';
            }
        }
        var audioDis = new cc.AudioSource();
        console.log('LanguagePath ' + LanguagePath);
        audioDis.clip = cc.url.raw('resources/' + LanguagePath + resAudio + '.mp3');
        if (GameData.SetLayerData.soundOpen == false) {
            audioDis.volume = 0;
        }
        else {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }

        audioDis.play();
    },

    playAudioCC: function (type, data, sex) {
        var resAudio = '';
        var LanguageType = cc.sys.localStorage.getItem('languageType' + GameData.player.uid) || GameData.language_tianjin;
        console.log('LanguageType:'+cc.sys.localStorage.getItem('languageType' + GameData.player.uid));
        switch (type) {
            case 'dis': resAudio = 'card_' + data; break;
            case 'cha': resAudio = 'cha'; break;
            case 'andan': resAudio = 'andan'; break;
            case 'mingdan': resAudio = 'mingdan'; break;
            case 'hu': resAudio = 'hu'; break;
            case 'chi': resAudio = 'chi'; break;
            case 'ting': resAudio = 'ting'; break;
            case 'dan' : resAudio = 'dan'; break;
            default: return;
        }
        var LanguagePath = '';
        if (LanguageType == GameData.language_putong) {
            if (sex == 1) {
                LanguagePath = 'changchun/sound/putong/boy/';
            } else {
                LanguagePath = 'changchun/sound/putong/girl/';
            }
        }
        else if (LanguageType == GameData.language_tianjin) {
            if (sex == 1) {
                LanguagePath = 'changchun/sound/local/boy/';
            } else {
                LanguagePath = 'changchun/sound/local/girl/';
            }
        }
        var audioDis = new cc.AudioSource();
        console.log('LanguagePath ' + LanguagePath);
        audioDis.clip = cc.url.raw('resources/' + LanguagePath + resAudio + '.mp3');
        if (GameData.SetLayerData.soundOpen == false) {
            audioDis.volume = 0;
        }
        else {
            audioDis.volume = GameData.SetLayerData.soundVolume;
        }

        audioDis.play();
    },
});
