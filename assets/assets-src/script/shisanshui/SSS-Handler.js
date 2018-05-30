var SSSHandler = (function() {
  var _instance = null;

  function constructor() {
    return {
      requestReady: function(cb) {
        GameNet.getInstance().request("room.poker13Handler.ready", {}, cb);
      },

      requestDiscard: function(cards, special, cb) {
        GameNet.getInstance().request("room.poker13Handler.discard", {cards: cards, special: special}, cb);
      }
    };
  }

  return {
    getInstance: function() {
      if(_instance == null) {
        _instance = constructor();
      }
      return _instance;
    }
  }
})();
