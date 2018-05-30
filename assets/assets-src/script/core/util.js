function registEvent(event, self, func) {
    cc.game.on(event, func, self);
}

function unregistEvent(event, self, func) {
    cc.game.off(event, func, self);
}

function sendEvent(eName, ePara) {
    if (ePara instanceof Object) {
        console.log("sendEvent " + eName + ":" + JSON.stringify(ePara));
    } else {
        console.log("sendEvent " + eName + ":" + ePara);
    }
    cc.game.emit(eName, ePara);
}

function isIllegal(object) {
    return (object == 'undefined' || object == null);
}

/*function getRandomNum(min, max) {   
    var range = max - min;
    var rand = Math.random();
    return(min + Math.round(rand * range));
}*/

function getRandomString(len) {
    /*var words = 'abcdefghijklmnopqrstuvwxyz';
    var str = '';
    for (var i=0; i<len; i++) {
        var idx = getRandomNum(0, words.length);
        str += words.charAt(idx);
    }*/
    var str = 'guest' + new Date().getTime();
    return str;
}

function stringEndWith(parent, child) {
    var reg = new RegExp(child + "$");
    return reg.test(parent);
}

function createMessageBox(content, ok_func, cancel_func, img) {
    var onResLoaded = function (err, res) {
        var point = cc.director.getWinSize();
        var messagebox = cc.instantiate(res);
        messagebox.getComponent('messagebox').setContent(content);
        messagebox.getComponent('messagebox').setArtwordSp(img);
        messagebox.getComponent('messagebox').setOkFunc(ok_func);
        if (cancel_func != null) {
            messagebox.getComponent('messagebox').setCancelFunc(cancel_func);
        } else {
            messagebox.getComponent('messagebox').setCancelFunc(null);
        }
        messagebox.getComponent('messagebox').updateBtnPos(cancel_func != null);
        messagebox.setPosition(cc.p(point.width / 2, point.height / 2));
        cc.director.getScene().addChild(messagebox);
    };
    cc.loader.loadRes('prefab/MessageBox', onResLoaded);
}

function createMoveMessage(content) {
    var onResLoaded = function (err, res) {
        var point = cc.director.getWinSize();
        var messageNode = cc.instantiate(res);
        messageNode.setPosition(cc.p(point.width / 2, point.height / 2));
        cc.find('Label', messageNode).getComponent(cc.Label).string = content + '';
        cc.director.getScene().addChild(messageNode);
    };
    cc.loader.loadRes('prefab/MoveMessage', onResLoaded);
}

function poker13MessageBox(content, name, content1, ok_func, cancel_func) {
    var onResLoaded = function(err, res) {
        var point = cc.director.getWinSize();
        var messagebox = cc.instantiate(res);
        messagebox.getComponent('messagebox').setContent(content);
        messagebox.getComponent('messagebox').setName(name);
        messagebox.getComponent('messagebox').setContent2(content1);
        messagebox.getComponent('messagebox').setStringVisbile();
        messagebox.getComponent('messagebox').setOkFunc(ok_func);
        if (cancel_func!=null) {
            messagebox.getComponent('messagebox').setCancelFunc(cancel_func);
        }else{
            messagebox.getComponent('messagebox').setCancelFunc(null);
        }
        messagebox.getComponent('messagebox').update13BtnPos(cancel_func!=null);
        // messagebox.setPosition(cc.p(point.width/2, point.height/2));
        messagebox.setPosition(cc.p(0, 0));
        cc.director.getScene().getChildByName('Canvas').addChild(messagebox);
    };
    cc.loader.loadRes('shisanshui/prefab/poker13MessageBox', onResLoaded);
}

function poker13createPlayerInfoPanel(player) {
    cc.log('createPlayerInfoPanel');
    var onResLoaded = function(err, res) {
        var point = cc.director.getWinSize();
        var perfabNode = cc.instantiate(res);
        perfabNode.getComponent('playerInfoTemplate').onShow(player);
        // perfabNode.setPosition(cc.p(point.width/2, point.height/2));
        perfabNode.setPosition(cc.p(0, 0));
        cc.director.getScene().getChildByName('Canvas').addChild(perfabNode);
        cc.log('createPlayerInfoPanel over');
    };
    cc.loader.loadRes('shisanshui/prefab/poker13PlayerInfoTemplate', onResLoaded);
}

function createSSSMoveMessage(content)
{
    var onResLoaded = function(err, res)
    {
        var point = cc.director.getWinSize();
        var messageNode = cc.instantiate(res);
        // messageNode.setPosition(cc.p(point.width/2, point.height/2));
        messageNode.setPosition(cc.p(0, 0));
        // messageNode.rotation = -90;
        messageNode.getComponent('MoveMessage').isSSS = true;
        cc.find('Label',messageNode).getComponent(cc.Label).string = content + '';
        cc.director.getScene().getChildByName('Canvas').addChild(messageNode);
    };
    cc.loader.loadRes('prefab/MoveMessage', onResLoaded);
}

function NiuNiuMessageBox(content, ok_func, cancel_func) {
    var onResLoaded = function(err, res) {
        var point = cc.director.getWinSize();
        var messagebox = cc.instantiate(res);
        messagebox.getComponent('messagebox').setContent(content);
        messagebox.getComponent('messagebox').setOkFunc(ok_func);
        if (cancel_func!=null) {
            messagebox.getComponent('messagebox').setCancelFunc(cancel_func);
        }else{
            messagebox.getComponent('messagebox').setCancelFunc(null);
        }
        messagebox.getComponent('messagebox').updateBtnPos(cancel_func!=null);
        messagebox.setPosition(cc.p(point.width/2, point.height/2));
        cc.director.getScene().addChild(messagebox);
    };
    cc.loader.loadRes('prefab/niuNiu/NiuNIuMessageBox', onResLoaded);
}

function messageBoxWithoutCB(content) {
    createMessageBox(content, function(){});
}

function createPlayerInfoPanel(player) {
    cc.log('createPlayerInfoPanel');
    var onResLoaded = function (err, res) {
        var point = cc.director.getWinSize();
        var perfabNode = cc.instantiate(res);
        perfabNode.getComponent('playerInfoTemplate').onShow(player);
        perfabNode.setPosition(cc.p(point.width / 2, point.height / 2));
        cc.director.getScene().addChild(perfabNode);
        cc.log('createPlayerInfoPanel over');
    };
    var curSceneName = cc.director.getScene().name;
    var url = 'prefab/PlayerInfoTemplate';
    if (curSceneName == "table-niuNiu" || curSceneName == "table-TDK") {
        url = 'prefab/niuNiu/niuNiuPlayerInfoTemplate';
    }
    cc.loader.loadRes(url, onResLoaded);
}

function WriteLog(text) {
    if (cc.sys.isNative) {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "writelog", "(Ljava/lang/String;)V", text);
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "writelog:", String(text));
        } else {
            cc.log(text);
        }
    } else {
        cc.log(text);
    }
}

function SaveLog() {
    if (!jsb.fileUtils.isDirectoryExist("/sdcard/com.mahjong.tianjin/log/")) {
        jsb.fileUtils.createDirectory("/sdcard/com.mahjong.tianjin/log/");
    }
    jsb.fileUtils.writeStringToFile(GameData.log, '/sdcard/com.mahjong.tianjin/log/gamelog.log');
}

//微信分享文字,就跟发聊文字一样,没啥用
function wxShareText(text) {
    try {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "wxsharetext", "(Ljava/lang/String;)V", text);
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "wxsharetext:", String(text));
        }
    } catch (e) {
        WriteLog("wxShareText error " + test);
    }
}

//微信分享图片
function wxShareTexture(path) {
    try {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "wxsharetexture", "(Ljava/lang/String;)V", path);
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "wxsharetexture:", String(path));
        }
    } catch (e) {
        WriteLog("wxShareTexture error " + path);
    }
}

//微信分享链接
function wxShareWeb(title, text) {
    try {
        var configMgr = require('configMgr');
        var url = configMgr.getWXShareUrl();
        WriteLog('url = ' + url);
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "wxshareweb", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",
                url, title, text);
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "wxshareweb:andTitle:andText:", String(url), String(title), String(text));
        }
    } catch (e) {
        WriteLog("wxShareWeb error " + "  " + url + "  " + title + "  " + text);
    }
}

//微信分享朋友圈
function wxShareTimeline(title, text) {
    try {
        var configMgr = require('configMgr');
        var url = configMgr.getWXShareUrl();
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "wxsharetimeline", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",
                url, title, text);
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "wxsharetimeline:andTitle:andText:", url, title, text);
        }
    } catch (e) {
        WriteLog("wxShareWeb error " + "  " + url + "  " + title + "  " + text);
    }
}

//截屏
function screenShoot(fun) {
    if (!cc.sys.isNative) return;

    var dirpath = jsb.fileUtils.getWritablePath() + 'ScreenShoot/';
    if (!jsb.fileUtils.isDirectoryExist(dirpath)) {
        jsb.fileUtils.createDirectory(dirpath);
    }
    var name = 'ScreenShoot/' + 'wx_share.jpg';
    var size = cc.director.getWinSize();
    var texture = new cc.RenderTexture(size.width, size.height);
    texture.setPosition(cc.p(size.width / 2, size.height / 2));
    //texture.setVisible(false);
    texture.begin();
    cc.director.getRunningScene().visit();
    texture.end();

    texture.saveToFile(name, cc.ImageFormat.JPG, true, function () {
        WriteLog("save success! path = " + dirpath);
        //texture.removeFromParent();
        if (fun) {
            fun(jsb.fileUtils.getWritablePath() + name);
        }
    });
};

//名字截取
function getShortStr(name, len) {
    var nameStr = name;
    if (name.length > len) {
        nameStr = name.substr(0, len) + '...';
    }
    return nameStr;
};

/**
 * 字符串截取，中英文都能用
 * @param str: 被截取的字符串
 * @param len: 要截取的长度
 */
function cutstr(str, len){
    var str_length = 0;
    var str_len = 0;
    var str_cut = new String();
    str_len = str.length;
    for (var i = 0; i < str_len; i++) {
        var a = str.charAt(i);
        str_length++;
        //中文字符经编码后长度大于4
        if (escape(a).length > 4) {
            str_length++;
        }
        str_cut = str_cut.concat(a);
        if (str_length >= len) {
            str_cut = str_cut.concat("...");
            return str_cut;
        }
    }
    //被截取的字符串str小于要截取的长度
    if (str_length < len) {
        return str;
    }
}

function isChinese(str) {
    var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
    if (!patrn.exec(str)) {
        return false;
    } else {
        return true;
    }
}

function emoji2Str(str) {

    return unescape(escape(str).replace(/\%uD.{3}/g, ''));

}

function contains(arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
}

//赋值文字到粘帖板
function textClipboard(text) {
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        var ret = jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "textClipboard",
            "(Ljava/lang/String;)I", text);
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("AppController", "textClipboard:", String(text));
    }
}

//从粘帖板获取文字
function getTextClipboard(){
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        return jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "getClipboardText", "()Ljava/lang/String;");
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        return jsb.reflection.callStaticMethod("AppController", "getClipboardText");
    }
}

function formatSeconds(value, types) {
    var theTime = parseInt(value); // 秒 
    var theTime1 = 0; // 分 
    var theTime2 = 0; // 小时 
    // alert(theTime); 
    if (theTime > 60) {
        theTime1 = parseInt(theTime / 60);
        theTime = parseInt(theTime % 60);
        // alert(theTime1+"-"+theTime); 
        if (theTime1 > 60) {
            theTime2 = parseInt(theTime1 / 60);
            theTime1 = parseInt(theTime1 % 60);
        }
    }
    if (types == 1) {
        var result = "";
        var times1 = theTime.toString().length == 1 ? "0" + parseInt(theTime) : parseInt(theTime);
        var times2 = theTime1.toString().length == 1 ? "0" + parseInt(theTime1) : parseInt(theTime1);
        var times3 = theTime2.toString().length == 1 ? "0" + parseInt(theTime2) : parseInt(theTime2);
        result = times3 + ":" + times2 + ":" + times1;
    } else {
        var result = "" + parseInt(theTime) + "秒";
        if (theTime1 > 0) {
            result = "" + parseInt(theTime1) + "分" + result;
        }
        if (theTime2 > 0) {
            result = "" + parseInt(theTime2) + "小时" + result;
        }
    }
    return result;
}

function getDate(tm) {
    //var SimpleDateFormat = new SimpleDateFormat("yyyy-MM-dd 　　HH:mm:ss")
    var time = new Date(tm);
    var year = time.getFullYear();
    var month = time.getMonth() + 1;
    var date = time.getDate();
    var h = time.getHours();
    var m = time.getMinutes();
    var s = time.getSeconds();
    month = month.toString().length == 1 ? '0' + month : month;
    date = date.toString().length == 1 ? '0' + date : date;
    h = h.toString().length == 1 ? '0' + h : h;
    m = m.toString().length == 1 ? '0' + m : m;
    s = s.toString().length == 1 ? '0' + s : s;
    return year + '/' + month + '/' + date + ' ' + h + ':' + m + ':' + s;
}

function getTimeStr(time) {
    var time = new Date(time);
    var year = time.getFullYear();
    var month = time.getMonth() + 1;
    var date = time.getDate();
    var h = time.getHours();
    var m = time.getMinutes();
    var s = time.getSeconds();
    month = month.toString().length == 1 ? '0' + month : month;
    date = date.toString().length == 1 ? '0' + date : date;
    h = h.toString().length == 1 ? '0' + h : h;
    m = m.toString().length == 1 ? '0' + m : m;
    s = s.toString().length == 1 ? '0' + s : s;
    return [year, month, date, h, m, s];
}
var cdLastTime = 0;

function inCD(internal) {
    if (new Date().getTime() - cdLastTime > internal) {
        cdLastTime = new Date().getTime();
        return false;
    }
    return true;
}

function loginYunwa(uid, nickname) {
    console.log("yun wa login");
    if (cc.sys.OS_ANDROID == cc.sys.os) {
        jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "loginYunwa", "(Ljava/lang/String;Ljava/lang/String;)V", uid, nickname);
    } else if (cc.sys.OS_IOS == cc.sys.os) {
        jsb.reflection.callStaticMethod("AppController", "loginYunwa:andNickname:", String(uid), String(nickname));
    }
}

function yunwaStartTalk() {
    console.log("yunwaStartTalk...................");
    if (cc.sys.OS_ANDROID == cc.sys.os) {
        jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "startRecord", "()V");
    } else if (cc.sys.OS_IOS == cc.sys.os) {
        jsb.reflection.callStaticMethod("AppController", "startRecord");
    }
}

function yunwaStopTalk() {
    console.log("yunwaStopTalk...................");
    if (cc.sys.OS_ANDROID == cc.sys.os) {
        jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "stopRecord", "()V");
    } else if (cc.sys.OS_IOS == cc.sys.os) {
        jsb.reflection.callStaticMethod("AppController", "stopRecord");
    }
}

function yunwaLogout() {
    console.log("yunwaLogout...................");
    if (cc.sys.OS_ANDROID == cc.sys.os) {
        jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "logOut", "()V");
    } else if (cc.sys.OS_IOS == cc.sys.os) {
        jsb.reflection.callStaticMethod("AppController", "logOutYunWa");
    }
}

function nativePower(percent) {
    sendEvent('nativePower', percent);
}

//开始定位
function startLocation() {
    try {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "startLocation", "()V");
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "startLocation:");
        }
    } catch (e) {
        WriteLog("startLocation throw: " + JSON.stringify(e));
    }
}

//获取玩家纬度
function getLatitudePos() {
    try {
        if (cc.sys.OS_ANDROID == cc.sys.os) {
            return jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "getLatitudePos", "()Ljava/lang/String;");
        } else if (cc.sys.OS_IOS == cc.sys.os) {
            return String(jsb.reflection.callStaticMethod("AppController", "getLatitudePos"));
        } else {
            return "0";
        }
    } catch (e) {
        WriteLog("getLatitudePos throw: " + JSON.stringify(e));
        return "0";
    }
}

//获取玩家经度
function getLongitudePos() {
    try {
        if (cc.sys.OS_ANDROID == cc.sys.os) {
            return jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "getLongitudePos", "()Ljava/lang/String;");
        } else if (cc.sys.OS_IOS == cc.sys.os) {
            return String(jsb.reflection.callStaticMethod("AppController", "getLongitudePos"));
        } else {
            return "0";
        }
    } catch (e) {
        WriteLog("getLongitudePos throw: " + JSON.stringify(e));
        return "0";
    }
}

function getPosInfo() {
    return {
        latPos: getLatitudePos(),
        longPos: getLongitudePos()
    };
}

//计算2个点之间的距离
function getDistance(latitude1, longitude1, latitude2, longitude2) {
    if (latitude1 == 0 || longitude1 == 0 || latitude2 == 0 || longitude2 == 0)
        return 0;
    try {
        if (cc.sys.OS_ANDROID == cc.sys.os) {
            var dis = jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "getDistance",
                "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;",
                String(latitude1), String(longitude1), String(latitude2), String(longitude2));
            var disVar = parseFloat(dis).toFixed(1);
            return disVar;
        } else if (cc.sys.OS_IOS == cc.sys.os) {
            var dis = jsb.reflection.callStaticMethod("AppController", "getDistance:lon1:lat2:lon2:",
                String(latitude1), String(longitude1), String(latitude2), String(longitude2));
            var disVar = parseFloat(dis).toFixed(1);
            return disVar;
        } else {
            return 0;
        }
    } catch (e) {
        WriteLog("getDistance throw: " + JSON.stringify(e));
        return 0;
    }
}

function getRuleStrNiuNiu(data){
    if (!data || Object.keys(data).length == 0) return "";
    var des = "2/" + data.joinermax +"人,明牌抢庄,";
    des += data.roundMax + "局,";
    des += "底分 *" + data.scoreBase;
    return des;
}

function getRuleStrTDK(data){
    if (!data || Object.keys(data).length == 0) return "";

    var roundNum = data.roundMax+'局,';
    var pokersNum = '';
    if (data.cardType === 1) {
        pokersNum = pokersNum+'9起,';
    }else if (data.cardType === 2) {
        pokersNum = pokersNum+'10起,';
    }
    var king = '';
    if(data.king){
        king = king+'带王,';
    }else{
        king = king+'不带王,';
    }
    var nextDouble = '';
    if (data.nextDouble) {
        nextDouble = nextDouble+'烂锅翻倍,';
    }else{
        nextDouble = nextDouble+'烂锅不翻倍,';
    }
    var quanya = '';
    if (data.allin === 0) {
        quanya = quanya+'不带全压,';
    }else if (data.allin === 30) {
        quanya = quanya+'全压30倍,';
    }else if (data.allin === 60) {
        quanya = quanya+'全压60倍,';
    }
    var des = roundNum + pokersNum + king + nextDouble + quanya;
    console.log('des = ' + des);
    return des;
}

function getRuleStrShiShi(data){
    if (!data || Object.keys(data).length == 0) return "";
    var playStr = '';

    playStr += this.checkCostType(data);

    if (data.roundRule) {
        if (data.roundRule == 1) playStr += "4局";
        else if(data.roundRule == 2) playStr += "8局";
        else if(data.roundRule == 3) playStr += "16局";
    }

    if(data.joinermax){playStr +=",人数"+ data.joinermax}

    if(data.roundRule == 4 || data.roundRule == 5){
        if (data.dianpao == 1) {playStr += "点炮单赔";}else {playStr += "点炮通赔";}
    }else{
        if (data.dianpao == 1) {playStr += ",点炮单赔";}else {playStr += ",点炮通赔";}
    }

    if (data.scoreBase != 0){
        playStr += ',一课:'+data.scoreBase+'分';
    }
    if (data.youJin < 10){
        playStr += ',暗游:'+data.youJin + "游";
    }
    else if (data.youJin == 10){
        playStr += ',明游';

        if(data.qg_zimo){
            playStr += ',抢杠自摸';
        }
        if(data.qg_pinghu){
            playStr += ',抢杠平胡';
        }
    }

    if(data.fengtou)playStr += ",风头跟打";
    if(data.water)playStr += ",插水";
    if(data.shuangjin)playStr += ",双金不平胡";

    WriteLog('playStr = '+playStr);
    return playStr;
}

function getRuleStr13(data) {
    if (!data || Object.keys(data).length == 0) return "";
    var playStr = '';
    if (data.roundRule) {
        if (data.roundRule == 1) playStr += '15局';
        else if (data.roundRule == 2) playStr += '30局';
        else if (data.roundRule == 3) playStr += '45局';
        else if (data.roundRule == 1) playStr += '60局';
        else if (data.roundRule == 1) playStr += '75局';
    }
    if(data.joinermax){playStr +=",人数"+ data.joinermax}
    if (data.costType) {
        if(data.costType == 1){
            playStr += ",房主付费";
        }
        else if(data.costType == 2){
            playStr += ",AA付费";
        }
    }
    if (data.limitTime == 0) {playStr += ',时间无限';}
    else if (data.limitTime == 30) {playStr += ','+data.limiteTime+'秒';}
    else if (data.limitTime == 60) {playStr += ',1分';}
    else if (data.limitTime == 300) {playStr += ',5分';}
    return playStr;
}

function getRuleStrTJDDZ(data) {
    if (!data || Object.keys(data).length == 0) return "";
    var str = '';

    str += this.checkCostType(data);

    if (data.jiaofenType == 1)
    {
        str += "赢家叫分,";
    }
    else if (data.jiaofenType == 2)
    {
        str += '轮庄叫分,';
    }
    if (data.mud == true)
    {
        str += "带泥儿,";
    }
    if (data.kicking == true)
    {
        str += "带踢踹,";
    }
    str += '局数:' + data.roundMax + ',';
    str += '封顶:' + (data.fanshu == 15 ? '无限番' : data.fanshu);
    return str;
}

function getRuleStrPDK(data) {
    if (!data || Object.keys(data).length == 0) return "";
    var str = '';

    str += this.checkCostType(data);

    str += '局数:' + data.roundMax + ',';
    str += '人数:' + data.joinermax;

    if (data.passFlag == 1)
    {
        str += '必须管,'
    }
    else if (data.passFlag == 2)
    {
        str += '可不要,'
    }
    if (data.zhuangType == true)
    {
        str += '红桃3先出,'
    }
    return str;
}

function getRuleStrDDZ(data){

    if (!data || Object.keys(data).length == 0) return "";
    var str = '';

    str += this.checkCostType(data);

    var detainArr = ['不押,','1分,','2分,','3分,'];
    var jiaofenTypeArr = ['赢家叫分,','轮庄叫分,','霸王叫分,'];

    str += jiaofenTypeArr[data.jiaofenType - 1];

    if (data.suppress == true)
    {
        str += "憋三家,";
    } 
    if (data.kicking == true)
    {
        str += "带踢踹,";
    }
    if (data.fourFlag == true)
    {
        str += "四带2对,";
    }
    if (data.fullMark == true)
    {
        str += "两王或4个2叫满,";
    }
    str += '押底:';
    str += detainArr[data.detain];
    str += '局数:' + data.roundMax + ',';
    str += '封顶:' + (data.fanshu == 15 ? '无限番' : data.fanshu);
    return str;
}

function getRuleStrHd(data) {
    if (!data || Object.keys(data).length == 0) return "";
    var playStr = "";

    playStr += this.checkCostType(data);

    switch (data.joinermax) {
        case 2:
            playStr += "2人,";
            break;
        case 4:
            playStr += "4人,";
            break;
    }
    switch (data.roundRule) {
        case 61:
            playStr += "6局,";
            break;
        case 62:
            playStr += "12局,";
            break;
        case 63:
            playStr += "24局,";
            break;
        case 64:
            playStr += "1圈,";
            break;
        case 65:
            playStr += "2圈,";
            break;
        case 66:
            playStr += "4圈,";
            break;
    }

    if (data.piao == 0) {
        playStr += "不带漂,";
    } else if (data.piao == 1) {
        playStr += "带漂,";
    }
    if (data.isBigFan == 0) {
        playStr += "小番,";
    } else if (data.isBigFan == 1) {
        playStr += "大番,";
    }
    if (data.fenZhang == 0) {
        playStr += "不分张,";
    } else if (data.fenZhang == 1) {
        playStr += "分张,";
    }
    if (data.mobaoBuf == 0) {
        playStr += "不带摸宝加分";
    } else if (data.mobaoBuf == 1) {
        playStr += "带摸宝加分";
    }
    if (data.isLouDianPaoDouble == 1) {
        playStr += "搂点炮双倍";
    }
    WriteLog('playStr = ' + playStr);
    return playStr;
}

function getRuleStrCC (data) {
    if (!data || Object.keys(data).length == 0) return "";
    var playStr = "";

    playStr += this.checkCostType(data);

    switch (data.joinermax) {
        case 2:
            playStr += "2人,";
            break;
        case 4:
            playStr += "4人,";
            break;
    }
    if (data.roundType == 1) {
        switch (data.roundMax) {
            case 4:
                playStr += "4局,";
                break;
            case 8:
                playStr += "8局,";
                break;
            case 16:
                playStr += "16局,";
                break;
            default :break;
        }
    }else{
        switch (data.roundMax) {
            case 1:
                playStr += "1圈,";
                break;
            case 2:
                playStr += "2圈,";
                break;
            case 4:
                playStr += "4圈,";
                break;
            default :break;
        }
    }

    if (data.dianPaoBaoFu == 1) {
        playStr += "点炮包三家,";
    }
    if (data.xiaoJiFeiDan == 1) {
        playStr += "小鸡飞蛋,";
    }
    if (data.xiaDanZhanLi == 1) {
        playStr += "下蛋算站立,";
    }
    if (data.queMen == 1) {
        playStr += "带缺门,";
    }else{
        playStr += "三门齐,";
    }
    if (data.duiBaoDouble == 1) {
        playStr += "对宝翻倍,";
    }
    if (data.qiDui == 1) {
        playStr += "带七对,";
    }
    //默认选项
    playStr += "三风蛋,";

    if (data.anBao == 0) {
        playStr += "明宝";
    } else if (data.anBao == 1) {
        playStr += "暗宝";
    }



    WriteLog('playStr = ' + playStr);
    return playStr;
}

function getRuleStrHongZhong(data){
    if (!data || Object.keys(data).length == 0) return "";
    var str = "";

    str += this.checkCostType(data);

    if (data.roundRule) {
        if (data.roundRule == 1) str += "4局";
        else if (data.roundRule == 2) str += "8局";
        else if (data.roundRule == 3) str += "16局";
    }
    str += data.joinermax + "人";

    if(data.BuyM){
        if(data.BuyM == 2) str += ",买2马";
        else if(data.BuyM == 4) str += ",买4马";
        else if(data.BuyM == 6) str += ",买6马";
    }
    if (data.times) {
        if (data.times == 1) str += ",底分1倍";
        else if (data.times == 2) str += ",底分2倍";
        else if (data.times == 5) str += ",底分5倍";
    }
    return str;
}

function getRoomRuleStr(data) {
    var gameDefine = require('gameDefine');
    if (gameDefine == undefined
        || data == undefined
        || Object.keys(data).length == 0)
    {
        return "";
    }
    var str = "";

    str += this.checkCostType(data);

    if (data.roundRule) {
        if (data.roundRule == 1) str += "4局";
        else if (data.roundRule == 2) str += "8局";
        else if (data.roundRule == 3) str += "16局";
        else if (data.roundRule == 4) str += "1圈";
        else if (data.roundRule == 5) str += "2圈";
        else if (data.roundRule == 6) str += "4圈";
    }
    str += data.joinermax + "人";

    if (data.times) {
        if (data.times == 1) str += ",底分1倍";
        else if (data.times == 2) str += ",底分2倍";
        else if (data.times == 5) str += ",底分5倍";
    }
    if (data.hd) {
        str += ",带混吊";
    } else {
        str += ",不带混吊";
    }
    if (data.longwufan) {
        str += ",龙五翻";
    } else {
        str += ",不带龙五翻";
    }
    if (data.doubleGang) {
        str += ",杠翻番";
    }
    if (data.feng) {
        str += ",带风";
    } else {
        str += ",不带风";
    }
    // if (data.disfeng) {str += ",带逢字必打";}else {str += ",不带逢字必打";}
    if (data.lazhuang == 1) str += ",坐二拉一";
    else if (data.lazhuang == 2) str += ",连庄拉庄";
    else if (data.lazhuang == 3) str += ",不坐不拉";
    // if (data.chan) {str += ",带铲牌";}else {str += ",不带铲牌";}
    // if (data.jingang == 4) {str += ",金杠4分";}else {str += ",金杠8分";}

    return str;
}
//房间类型
function checkRoomType(data){
    var gameDefine = require('gameDefine');
    var str = '';
    if(data == undefined || gameDefine == undefined){
        return str;
    }

    switch (data.roomType){
        case gameDefine.roomType.Room_Common:{
            str += ' 普通房间';
        }break;
        case gameDefine.roomType.Room_Club:{
            str += ' 俱乐部房间';
        }break;
        case gameDefine.roomType.Room_Contest:{
            str += ' 比赛房间';
        }break;
        case gameDefine.roomType.Room_Match:{
            str += ' 匹配房间';
        }break;
    }
    return str;
}
//付费类型
function checkCostType(data){
    var gameDefine = require('gameDefine');
    var str = '';
    var roundIndex = 0;
    if(data == undefined || gameDefine == undefined){
        return str;
    }
    str += checkRoomType(data);

    if (data.costType) {
        if (data.costType == gameDefine.CostType.Cost_Creator) {
            str += ",房主付费 ";
        } else if (data.costType == gameDefine.CostType.Cost_AA) {
            str += ",AA付费 ";
        } else if (data.costType == gameDefine.CostType.Cost_Winner) {
            str += ",赢家付费 ";
        } else if (data.costType == gameDefine.CostType.Cost_Agent) {
            str += ",代开房付费 ";
        } else if (data.costType == gameDefine.CostType.Cost_Table) {
            var number = 0, limit = 0;
            switch (data.roomType){
                case gameDefine.roomType.Room_Common:
                case gameDefine.roomType.Room_Club:{
                    switch (data.gameType){
                        case gameDefine.GameType.Game_Mj_Tianjin:
                        case gameDefine.GameType.Game_Mj_Shishi:
                        case gameDefine.GameType.Game_Mj_HZ:{
                            roundIndex = data.roundRule -1;
                        }break;
                        case gameDefine.GameType.Game_Mj_CC:{
                            data.roundMax == 4 ? roundIndex = 0 : null;
                            data.roundMax == 8 ? roundIndex = 1 : null;
                            data.roundMax == 16 ? roundIndex = 2 : null;
                            data.roundMax == 1 ? roundIndex = 3 : null;
                            data.roundMax == 2 ? roundIndex = 4 : null;
                            data.roundMax == 4 ? roundIndex = 5 : null;
                        }break;
                        case gameDefine.GameType.Game_MJ_HuaDian:{
                            roundIndex = data.roundRule -61;
                        }break;
                        case gameDefine.GameType.Game_Poker_DDZ:
                        case gameDefine.GameType.Game_Poker_TianjinDDZ:{
                            data.roundMax == 6 ? roundIndex = 0 : null;
                            data.roundMax == 10 ? roundIndex = 1 : null;
                            data.roundMax == 20 ? roundIndex = 2 : null;
                        }break;
                        case gameDefine.GameType.Game_Poker_paodekuai:{
                            data.roundMax == 10 ? roundIndex = 0 : null;
                            data.roundMax == 20 ? roundIndex = 1 : null;
                            data.roundMax == 30 ? roundIndex = 2 : null;
                        }break;
                    }
                    number = this.getCostTableFinal(data.gameType, roundIndex, data.joinermax, data.scorelv);
                    limit = this.getCoinEnterLimit(data.gameType, roundIndex, data.joinermax, data.scorelv);
                }break;
                case gameDefine.roomType.Room_Contest:{}break;
                case gameDefine.roomType.Room_Match:{
                    number = this.getMatchCostTableFinal(data.gameType, data.scorelv);
                    limit = this.getMatchCoinEnterLimit(data.gameType, data.scorelv);
                }break;
            }
            number == undefined ? number = 0 : null;
            str += ",底分" + number + ",进入条件:" + limit;
        }
    }
    return str;
}
//获取匹配金币场台费
function getMatchCostTableFinal(gameType, scoreLv){
    var configMgr = require('configMgr');
    if(configMgr == undefined
        || gameType == undefined
        || scoreLv == undefined){
        return 0;
    }
    var serverConfig = configMgr.getServerConfig();
    if(serverConfig == undefined) {
        return 0;
    }
    var spendData = serverConfig.matchCoin[gameType];
    if(spendData == undefined){
        return 0;
    }
    var final = spendData.cost[scoreLv];
    cc.log("...match.final"+final);
    return final;
}
//获取匹配金币场限制进入条件
function getMatchCoinEnterLimit(gameType, scoreLv){
    var configMgr = require('configMgr');
    if(configMgr == undefined
        || gameType == undefined
        || scoreLv == undefined){
        return 0;
    }
    var serverConfig = configMgr.getServerConfig();
    if(serverConfig == undefined) {
        return 0;
    }
    var spendData = serverConfig.matchCoin[gameType];
    if(spendData == undefined){
        return 0;
    }
    var enter = spendData.enter[scoreLv];
    cc.log("...match.enter"+enter);
    return enter;
}
//获取金币场台费
function getCostTableFinal(gameType, round, number, scoreLv){
    var configMgr = require('configMgr');
    if(configMgr == undefined
        || gameType == undefined
        || round == undefined
        || number == undefined
        || scoreLv == undefined){
        return 0;
    }
    var serverConfig = configMgr.getServerConfig();
    if(serverConfig == undefined) {
        return 0;
    }
    var spendData = serverConfig.roomCoin[gameType];
    if(spendData == undefined){
        return 0;
    }
    var cost = spendData[round].cost;
    var final = cost[number][scoreLv];
    cc.log("...final"+final);
    return final;
}
//获取金币场进入限制金币数
function getCoinEnterLimit(gameType, round, number, scoreLv){
    var configMgr = require('configMgr');
    if(configMgr == undefined
        || gameType == undefined
        || round == undefined
        || number == undefined
        || scoreLv == undefined) {
        return 0;
    }
    var serverConfig = configMgr.getServerConfig();
    if(serverConfig == undefined) {
        return 0;
    }
    var spendData = serverConfig.roomCoin[gameType];
    if(spendData == undefined){
        return 0;
    }
    var enter = spendData[round].enter;
    var enterFinal = enter[number][scoreLv];
    cc.log("...enterFinal"+enterFinal);
    return enterFinal;
}

function cloneObject(srcObject) {
    var obj = {};

    for (var i in srcObject) {
        obj[i] = srcObject[i];
    }

    return obj;
}

function cloneArray(srcArray, desArray) {
    desArray.splice(0, desArray.length);

    var len = srcArray.length;
    for (var i = 0; i < len; i++) {
        if (typeof srcArray[i] === "object") {
            var obj = cloneObject(srcArray[i]);
            desArray.push(obj);
            //cc.log('push object');
        } else {
            desArray.push(srcArray[i]);
            //cc.log('push number');
        }
    }

    //cc.log('cloneArray srcArray:'+JSON.stringify(srcArray));
    //cc.log('cloneArray desArray:'+JSON.stringify(desArray));
}

function scheduleLamp(self) {
    if (GameData.serverNoticeData) {
        if ((parseInt(Number(new Date()) / 1000) <= parseInt(Number(new Date(GameData.serverNoticeData[0].lastTime) / 1000)))) {
            self.schedule(this.lampHandler, 1);
        }

        if (GameData.serverNoticeData.length > 1) {
            if ((parseInt(Number(new Date()) / 1000) <= parseInt(Number(new Date(GameData.serverNoticeData[1].lastTime) / 1000)))) {
                self.schedule(lampHandler1, 1);
            }
        }
    }
}

function handlerServerNotice() {
    openView("RunlampPanel");
}

function lampHandler() {
    if (GameData.serverNoticeData) {
        if (GameData.serverNoticeData[0]) {
            var nowtime = parseInt(Number(new Date()) / 1000)
            var lastTime = parseInt(Number(new Date(GameData.serverNoticeData[0].lastTime) / 1000));
            if ((lastTime - nowtime) / (GameData.serverNoticeData[0].time * 60) % 1 === 0) {
                if (cc.find("lampNode").getChildByName("RunlampPanel") || cc.find("lampNode").getChildByName("RunlampPanel1")) {
                    cc.log("~~~~~~~~~~~~~~~当前有条目正在播放，所以此条目不播放~~~~~~~~~~~~~~~~")
                } else {
                    openView("RunlampPanel");
                }
            }
        }
    }
}

function lampHandler1() {
    if (GameData.serverNoticeData) {
        if (GameData.serverNoticeData[1]) {
            var nowtime = parseInt(Number(new Date()) / 1000)
            var lastTime = parseInt(Number(new Date(GameData.serverNoticeData[1].lastTime) / 1000));
            if ((lastTime - nowtime) / (GameData.serverNoticeData[1].time * 60) % 1 === 0) {
                if (cc.find("lampNode").getChildByName("RunlampPanel") || cc.find("lampNode").getChildByName("RunlampPanel1")) {
                    cc.log("~~~~~~~~~~~~~~~当前有条目正在播放，所以此条目不播放~~~~~~~~~~~~~~~~")
                } else {
                    openView("RunlampPanel1");
                }
            }
        }
    }
}

function arraySum(arr) {
    var len = arr.length;
    if(len == 0){
        return 0;
    } else if (len == 1){
        return arr[0];
    } else {
        return arr[0] + arraySum(arr.slice(1));
    }
}

//从数组中删除一个元素
function spliceArrayElementOne(array,element){
    if(array == undefined){
        return array;
    }
    for(var ii = 0;ii < array.length;ii++){
        if(array[ii] == element){
            array.splice( ii,1 );
            break;
        }
    }
    return array;
}

//比较日期
function ComparingDate(date1, date2){
    var Date1 = new Date(date1);
    var Date2 = new Date(date2);

    var diff = Date1.getTime() - Date2.getTime();
    if(diff < 0){
        //时间1 小于时间2
        return false;
    } else if(diff > 0){
        //时间1 大于时间2
        return true;
    } else {
        //两个时间相等，返回false
        return false;
    }
}

//微信登录os回调
function OnWXLogin(wxData){
    var loginHandler = require('loginHandler');
    loginHandler.OnWXLogin(wxData);
}

function OnWXFailed(){
    var loginHandler = require('loginHandler');
    loginHandler.OnWXFailed();
}

// '0':无连接  1:'运营商网络' 2:'Wifi网络'
function OnIOSNetChanged(status){
    WriteLog('回调ios net changed status = ' + status);
    GameNet.getInstance().setNetStatus(status);
}

function OnPasteboardChanged(param){
    WriteLog('JS OnPasteboardChanged');
    //createMessageBox('123123', function(){});
}