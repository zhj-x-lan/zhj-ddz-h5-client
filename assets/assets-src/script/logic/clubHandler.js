var ClubHandler = (function () {
  var _instance = null;

  function constructor() {
    return {

      reqJoinClub: function (club_id) {
        var self = this;
        GameNet.getInstance().request("game.playerHandler.reqJoinClub", {
          club_id: club_id
        }, function (rtn) {
          //console.log('game.playerHandler.reqJoinClub response:%d', rtn.result);
          var errorCode = require('errorCode');
          if (rtn.result == errorCode.ApplyJoinClubSuc) {
            GameData.player.clubApply = rtn.sendClubApplyData;
            sendEvent('refreshUIClubApply');
            createMessageBox("申请成功，等待审批!", function () {});
            //sendEvent('refreshUIClubData');
          } else if (rtn.result == errorCode.ClubNotFound) {
            createMessageBox("俱乐部不存在!", function () {});
          } else if (rtn.result == errorCode.HasJoinedClub) {
            createMessageBox("您已经在该俱乐部!", function () {});
          } else if (rtn.result == errorCode.NoJoinThisClub) {
            createMessageBox("抱歉!您不在该俱乐部.", function () {});
          } else if (rtn.result == errorCode.HasReqJoinClub) {
            createMessageBox("已经提交申请，请耐心等待审批！", function () {});
          }
        });
      },

      doInvite: function (club_id, isAgree) {
        var self = this;
        GameNet.getInstance().request("game.playerHandler.doInvite", {
          club_id: club_id,
          isAgree: isAgree
        }, function (rtn) {
          //console.log('game.playerHandler.reqJoinClub response:%d', rtn.result);
          var errorCode = require('errorCode');
          if (rtn.result == errorCode.Success) {
            var txt = "";
            if (isAgree == true) {
              GameData.player.club = rtn.sendClubData;
              sendEvent('refreshUIClubData');
              GameData.player.clubInvite = rtn.sendClubInviteData;
              sendEvent('refreshUIClubInvite');
              GameData.player.clubApply = rtn.sendClubApplyData;
              sendEvent('refreshUIClubApply');
              txt = "成功";
            } else {
              GameData.player.clubInvite = rtn.sendClubInviteData;
              sendEvent('refreshUIClubInvite');
              GameData.player.clubApply = rtn.sendClubApplyData;
              sendEvent('refreshUIClubApply');
              txt = "拒绝";
            }
            createMessageBox("已" + txt + "加入该俱乐部.", function () {});
          }
        });
      },

      reqQuitClub: function (playerId, club_id) {
        var self = this;
        GameNet.getInstance().request("game.playerHandler.reqQuitClub", {
          uid: playerId,
          clubId: club_id
        }, function (rtn) {
          GameData.player.club = rtn.sendClubData;
          cc.log('sendClubData: ' + JSON.stringify(rtn.sendClubData));
          if (rtn.sendClubData == undefined) {
            GameData.player.club = rtn.sendClubData;
          }
          GameData.playerCurrClubId = null;
          sendEvent('refreshUIClubData');
        });
      },

      reqBindAgent: function (playerId, agentId) {
        var self = this;
        GameNet.getInstance().request("game.playerHandler.reqBindAgent", {
          uid: playerId,
          agentId: agentId
        }, function (rtn) {
          var errorCode = require('errorCode');
          if (rtn.result == errorCode.Success) {
            GameData.player.agentFlag = rtn.agentFlag;
            GameData.player.card += rtn.num;
            createMessageBox('成功绑定代理，赠送您' + rtn.num + '房卡奖励!', function () {});
            sendEvent('onCardChange');
            sendEvent('closeAgentBind');
          } else if (rtn.result == errorCode.findAgentDBError) {
            createMessageBox('代理不存在', function () {});
          }
        });
      },

    };
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