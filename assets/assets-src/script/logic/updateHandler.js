var UpdateHandler = (function () {
  var _instance = null;
  var _updating = false;
  var _canRetry = true;
  var _assetsManager = null;
  var _checkListener = null;
  var _isNeedUpdate = true;

  function constructor() {
    return {
      checkUpdate: function (manifestUrl) {
        if (!cc.sys.isNative) {
          sendEvent('updateNoneed');
          return false;
        }
        if (_updating) {
          WriteLog('Checking or updating ...');
          return false;
        }

        if (!_isNeedUpdate) {
          WriteLog('checkUpdate,updateFinish');
          sendEvent('updateFinish');
          return false;
        }

        WriteLog('updateHandler checkUpdate ...');
        _init(manifestUrl);
        if (!_assetsManager.getLocalManifest().isLoaded()) {
          WriteLog('Failed to load local manifest ...');
          sendEvent('updateError');
          return false;
        }

        _checkListener = new jsb.EventListenerAssetsManager(_assetsManager, _checkCb.bind(this));
        cc.eventManager.addListener(_checkListener, 1);

        _assetsManager.checkUpdate();
        //_updating = true;

        return true;
      },

      initParam: function () {
        var _instance = null;
        var _updating = false;
        var _canRetry = false;
        var _assetsManager = null;
        var _checkListener = null;
        WriteLog('initParam');
      },

      retry: function () {
        if (!_updating && _canRetry) {
          _canRetry = false;

          WriteLog('Retry failed Assets...');
          _assetsManager.downloadFailedAssets();
        }
      },

      getVersion: function () {
        if (_assetsManager && _assetsManager.getLocalManifest().isLoaded()) {
          var project = _assetsManager.getLocalManifest();
          WriteLog('version: ' + project.getVersion());
          return project.getVersion();
        }
        return '0.0.1';
      }
    };
  }

  function _init(manifestUrl) {
    WriteLog('updateHandler checkUpdate ...');
    if (!_assetsManager) {
      var storagePath = jsb.fileUtils.getWritablePath() + "com.mahjong.tianjin/";
      _assetsManager = new jsb.AssetsManager(manifestUrl, storagePath);
      _assetsManager.setVersionCompareHandle(_compareCb);
      _assetsManager.setVerifyCallback(_verifyCb);

      WriteLog('assetsManager:' + JSON.stringify(_assetsManager));

      if (cc.sys.os === cc.sys.OS_ANDROID) {
        // Some Android device may slow down the download process when concurrent tasks is too much.
        // The value may not be accurate, please do more test and find what's most suitable for your game.
        _assetsManager.setMaxConcurrentTask(2);
        WriteLog("Max concurrent tasks count have been limited to 2");
      }
    }
  }

  function _update() {
    if (_assetsManager && !_updating) {
      WriteLog('hotUpdate ...');
      _updateListener = new jsb.EventListenerAssetsManager(_assetsManager, _updateCb.bind(this));
      cc.eventManager.addListener(_updateListener, 1);

      _assetsManager.update();
      _updating = true;
    }
  }

  function _checkCb(event) {
    WriteLog('Code: ' + event.getEventCode());
    switch (event.getEventCode()) {
      case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
        WriteLog("No local manifest file found, hot update skipped.");
        sendEvent('updateError');
        break;
      case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
      case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
        WriteLog("Fail to download manifest file, hot update skipped.");
        sendEvent('updateError');
        break;
      case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
        WriteLog("Already up to date with the latest remote version.");
        _isNeedUpdate = false;
        sendEvent('updateFinish');
        break;
      case jsb.EventAssetsManager.NEW_VERSION_FOUND:
        WriteLog('New version found, please try to update.');
        sendEvent('updateStart');
        _update();
        break;
      default:
        return;
    }

    cc.eventManager.removeListener(_checkListener);
    _checkListener = null;
    _updating = false;
  }

  function _updateCb(event) {
    var needRestart = false;
    var failed = false;
    switch (event.getEventCode()) {
      case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
        WriteLog('No local manifest file found, hot update skipped.');
        failed = true;
        break;
      case jsb.EventAssetsManager.UPDATE_PROGRESSION:
        var bytePer = event.getPercent();
        var filePer = event.getPercentByFile() / 100;
        var msg = event.getMessage();
        if (msg) {
          WriteLog('Updated file: ' + msg);
          WriteLog('bytePer : ' + bytePer);
        }
        sendEvent('updateProgress', bytePer);
        break;
      case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
      case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
        WriteLog('Fail to download manifest file, hot update skipped.');
        failed = true;
        break;
      case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
        WriteLog('Already up to date with the latest remote version.');
        failed = true;
        break;
      case jsb.EventAssetsManager.UPDATE_FINISHED:
        WriteLog('Update finished. ' + event.getMessage());
        needRestart = true;
        break;
      case jsb.EventAssetsManager.UPDATE_FAILED:
        WriteLog('Update failed. ' + event.getMessage());
        _updating = false;
        _canRetry = true;
        failed = true;
        break;
      case jsb.EventAssetsManager.ERROR_UPDATING:
        WriteLog('Asset update error: ' + event.getAssetId() + ', ' + event.getMessage());
        break;
      case jsb.EventAssetsManager.ERROR_DECOMPRESS:
        WriteLog('Asset decompress error: ' + event.getMessage());
        break;
      default:
        break;
    }

    if (failed) {
      WriteLog('Update Failed');
      cc.eventManager.removeListener(_updateListener);
      _updateListener = null;
      _updating = false;
    }

    if (needRestart) {
      cc.eventManager.removeListener(_updateListener);
      _updateListener = null;
      // Prepend the manifest's search path
      var searchPaths = jsb.fileUtils.getSearchPaths();
      var newPaths = _assetsManager.getLocalManifest().getSearchPaths();
      console.log(JSON.stringify(newPaths));
      Array.prototype.unshift(searchPaths, newPaths);
      // This value will be retrieved and appended to the default search path during game startup,
      // please refer to samples/js-tests/main.js for detailed usage.
      // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
      cc.sys.localStorage.setItem('UpdateSearchPaths', JSON.stringify(searchPaths));

      jsb.fileUtils.setSearchPaths(searchPaths);
      cc.game.restart();
    }
  }

  function _compareCb(versionA, versionB) {
    WriteLog("Version Compare: version A is " + versionA + ', version B is ' + versionB);
    var vA = versionA.split('.');
    var vB = versionB.split('.');
    for (var i = 0; i < vA.length; ++i) {
      var a = parseInt(vA[i]);
      var b = parseInt(vB[i] || 0);
      if (a === b) continue;
      else return a - b;
    }

    if (vB.length > vA.length) return -1;
    else return 0;
  }

  function _verifyCb(path, asset) {
    // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
    var compressed = asset.compressed;
    // Retrieve the correct md5 value.
    var expectedMD5 = asset.md5;
    // asset.path is relative path and path is absolute.
    var relativePath = asset.path;
    // The size of asset file, but this value could be absent.
    var size = asset.size;
    if (compressed) {
      WriteLog("Verification passed : " + relativePath);
      return true;
    } else {
      WriteLog("Verification passed : " + relativePath + ' (' + expectedMD5 + ')');
      return true;
    }
  }

  return {
    getInstance: function () {
      if (_instance == null) {
        _instance = constructor();
      }

      return _instance;
    }
  }

})();