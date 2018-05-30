var errorCode = {
  Success: 0,
  Fail: 1,
  verifyPlayerFail: 2,
  emailUsed: 3,
  emailValid: 4,
  invalidMail: 5,
  playerNotFound: 6,
  guestCanNotRecommend: 7,
  canNotLogin: 8,
  alreadyInGame: 9,
  keepInGame: 10,
  accountHasSeal: 12,
  versionError: 17,
  packetVersionError: 18,
  codeVersionError: 19,
  notEnoughCard:20,
  notEnoughCoin:21,
  notEnoughPoint:22,
  sqlError: 30,
  lessMoney: 31,
  lessCoin: 32,
  clientRestart: 33,
  clientUpdate: 34,
  bindError: 35,
  joinRoomOK: 36,
  cfgVersionChange: 37,
  alreadyInRoom: 38,
  roomFull: 39,
  slotNotFound: 40,
  roomNotFound: 41,
  AgentRoomMax:43,
  zjhCfgChange: 50,
  zjhDateEnd: 51,
  zjhCfgStop: 52,
  roomInPlay: 53,
  playerNotWaitStart: 54,
  joinActOK: 60,
  canNotJoinActInPlay: 61,
  joinWrongAct: 62,
  alreadyInAct: 63,
  actClosed: 64, //no use
  invalidActPos: 65,
  invalidActRoom: 66,
  actEnd: 67,
  invaliReward: 68,
  canNotAddSelf: 80,
  isMemberAlready: 81,
  memberNotFound: 82,
  addMemberOK: 83,
  removeMemberOK: 84,
  membersNumLimit: 85,
  memberofNumLimit: 86,
  authAddPlayerExist: 87,
  rpcErr: 100,
  loginToMuch: 101,
  errorState: 102,
  serverFull: 103,
  LessClubMoney: 110, //俱乐部钻石不足
  LessCard: 111, //房卡不足
  LessCoin: 112, //金币不足
  ClubNotFound: 113, //俱乐部不存在
  HasJoinedClub: 114, //已经加入该俱乐部
  ApplyJoinClubSuc: 115, //俱乐部申请提交成功
  NoJoinThisClub: 116, //不是该俱乐部成员
  HasReqJoinClub: 117, //已经申请加入俱乐部  
  AgentMoneyNotEnough: 118, //代理钻石不足
  ClubLevelTooLow: 119, //俱乐部权限太低
  AgentMoneyDataError: 120,
  findAgentDBError: 121,
  HasInvited: 122, //已经邀请过玩家 
  NotFindInviteDB: 123, //没有从DB中找到邀请信息      
  NotFindApplyDB: 124, //没有从DB中找到申请信息 
  waitOthers: 130, //等待其他人操作
  NotPokerDis: 200, //大不过上家的信息
  HandPatternsError: 201, //出牌牌形错误
  NotHavePokerDis: 202, //    没有大过上家的牌
  MaxCardPut:203,         //只能从最大的牌出
  NotHaveThreePoker:204,  //不含有红桃三
  WarningDiscard:300,         //13水倒水
};

module.exports = errorCode;