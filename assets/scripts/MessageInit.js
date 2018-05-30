
var gt = {};

gt.CG_LOGIN					= 61001
gt.GC_LOGIN					= 61002
gt.CG_RECONNECT				= 61003
gt.CG_LOGIN_SERVER			= 61004
gt.GC_LOGIN_SERVER			= 61005
gt.GC_ROOM_CARD				= 61006
gt.GC_MARQUEE				= 61007
gt.CG_HEARTBEAT				= 61008
gt.GC_HEARTBEAT				= 61009
gt.CG_REQUEST_NOTICE		= 61010
gt.GC_REQUEST_NOTICE		= 61011
gt.CG_CREATE_ROOM			= 61012
gt.GC_CREATE_ROOM			= 61013
gt.CG_JOIN_ROOM				= 61014
gt.GC_JOIN_ROOM				= 61015
gt.CG_QUIT_ROOM				= 61016
gt.GC_QUIT_ROOM				= 61017
gt.CG_DISMISS_ROOM			= 61018
gt.GC_DISMISS_ROOM			= 61019
gt.CG_APPLY_DISMISS			= 61020
gt.CG_CREATE_ROOM_FZ		= 61021
gt.GC_ENTER_ROOM			= 61022
gt.GC_ADD_PLAYER			= 61023
gt.GC_REMOVE_PLAYER			= 61024
gt.CG_SELECT_SEAT			= 61025
gt.GC_SELECT_SEAT			= 61026
gt.GC_SYNC_ROOM_STATE		= 61027
gt.CG_READY					= 61028
gt.GC_READY					= 61029
gt.CG_START_GAME			= 61030
gt.GC_OFF_LINE_STATE		= 61031
gt.GC_ROUND_STATE			= 61032
gt.GC_START_GAME			= 61033
gt.GC_TURN_SHOW_MJTILE		= 61034
gt.CG_SHOW_MJTILE			= 61035
gt.GC_SYNC_SHOW_MJTILE		= 61036
gt.GC_MAKE_DECISION			= 61037
gt.CG_PLAYER_DECISION		= 61038
gt.GC_SYNC_MAKE_DECISION	= 61039
gt.CG_CHAT_MSG				= 61040
gt.GC_CHAT_MSG				= 61041
gt.GC_ROUND_REPORT			= 61042
// gt.GC_START_DECISION		= 65
gt.GC_START_DECISION		= 61043     //耗子牌显示消息 
gt.CG_START_PLAYER_DECISION	= 61044
gt.GC_SYNC_START_PLAYER_DECISION= 61045
gt.GC_SYNC_BAR_TWOCARD      = 61046
gt.CG_SYNC_HAIDI			= 61047
gt.CG_CHOOSE_HAIDI			= 61048
gt.CG_TURN_HAIDI			= 61049
gt.GC_FINAL_REPORT			= 61050
gt.CG_HISTORY_RECORD		= 61051
gt.GC_HISTORY_RECORD		= 61052
gt.CG_REPLAY				= 61053
gt.GC_REPLAY				= 61054
gt.CG_SHARE_REPLAY			= 61055
gt.GC_SHARE_REPLAY			= 61056
gt.CG_SHARE_BTN				= 61057
gt.GC_SHARE_BTN				= 61058
gt.GC_GET_VIDEO				= 61059
gt.GC_CHARGE_DIAMOND        = 61060
gt.GC_PURCHASE              = 61061
gt.GC_PLAYER_TYPE           = 61062
gt.CG_COUPONS_EXCHANGE      = 61063 //点击兑换礼券
gt.GC_COUPONS_EXCHANGE      = 61064
gt.CG_COUPONS_EXCHANGE_RECORD  = 61065 //查看兑换礼券列表
gt.GC_COUPONS_EXCHANGE_RECORD  = 61066 
gt.CG_GIFT_EXCHANGE         = 61067  //礼券兑换状态是否成功
gt.GC_GIFT_EXCHANGE         = 61068

gt.GC_GANG_AFTER_CHI_PENG   = 61069 //长沙麻将杠了之后没有人胡可以吃和碰通知
gt.CG_GANG_MAKE_DECISION    = 61070 //长沙麻将杠了之后没有人胡可以吃和碰通知后的决策

gt.CG_GET_TASK_LIST   		= 61071 //获取任务列表请求
gt.GC_GET_TASK_LIST    		= 61072 //获取任务列表回复
gt.CG_FINISH_TASK   		= 61073 //完成任务请求
gt.GC_FINISH_TASK    		= 61074 //完成任务回复

gt.CG_FIND_INVITE_PLAYER   	= 61075 //获取玩家信息
gt.GC_FIND_INVITE_PLAYER    = 61076 //返回玩家信息
gt.CG_GET_INVITE_INFO   	= 61077 //获取邀请信息
gt.GC_GET_INVITE_INFO    	= 61078 //返回邀请信息
gt.CG_INVITE_OK   			= 61079 //绑定邀请者
gt.GC_INVITE_OK    			= 61080 //绑定邀请者结果
gt.CG_SHARE_GAME    		= 61081 //玩家通过微信分享了游戏
gt.CG_LUCKY_DRAW_NUM        = 61082 // 请求玩家抽奖次数
gt.GC_LUCKY_DRAW_NUM        = 61083 // 服务器推送玩家抽奖次数

gt.GC_MOON_FREE_FANGKA        = 61084 // 中秋节送礼券活动服务器推送获奖玩家信息

gt.GC_ZHANIAO				= 61085 // 扎鸟

// 转盘抽奖相关
gt.GC_LOTTERY				= 61086  // 服务器推送活动相关信息
gt.CG_GET_GETLOTTERY		= 61087  // 玩家请求抽奖
gt.GC_RET_GETLOTTERY		= 61088  // 服务器返回此次抽奖结果
gt.CG_SAVE_PHONENUM			= 61089  // 客户端请求写入电话号码
gt.GC_SAVE_PHONENUM			= 61090  // 服务器返回写入电话号码结果
gt.CG_GET_GETLOTTERYRESULT	= 61091 // 玩家请求自己的抽奖结果
gt.GC_GET_GETLOTTERYRESULT	= 61092 // 服务器返回玩家抽奖结果
gt.GC_IS_ACTIVITIES			= 61093 // 服务器推送是否有活动
gt.CG_GET_ACTIVITIES		= 61094 // 客户端请求活动信息 返回94号指令

gt.CG_HISTORY_ONE = 61095 // 客户端请求单把(8局)数据
gt.GC_HISTORY_ONE = 61096// 服务器推送单把数据

gt.CG_UPDATE_SCORE = 61097 // 客户端请求分数
gt.GC_UPDATE_SCORE = 61098 // 服务器返回分数

gt.GC_LONGITUDE_LATITUDE = 61099 // 请求经纬度
gt.CG_LONGITUDE_LATITUDE = 61100// 返回经纬度

gt.CG_FZ_RECORD = 61101
gt.GC_FZ_RECORD = 61102

// gt.GC_TIPS = 170 // 服务器统一推送所有提示协议
gt.CG_FZ_DISMISS = 61103
gt.GC_FZ_DISMISS = 61104


gt.GC_GET_PHONE_VLDCODE = 61105  //请求获得手机号验证码
gt.CG_GET_PHONE_VLDCODE = 61106  //返回手机号验证码
gt.GC_BIND_PHONE_CODE = 61107   //请求 绑定手机
gt.CG_BIND_PHONE_CODE = 61108   //回复 绑定手机
gt.CG_USER_EXTERN_INFO = 61109  //玩家扩展信息，登陆完成后会带这个消息

gt.CG_PIAO_MSG = 61110//请求飘信息           
gt.GC_PIAO_MSG = 61111//返回飘的信息
gt.GC_PIAO_NUM_MSG = 61112 //断线重连飘的信息

gt.MSG_S_2_C_ZHIDUI = 61113	 //玩家支队



gt.CG_LOGIN_GATE			= 61114 //客户端登录Gate
gt.GC_LOGIN_GATE			= 61115 //Gate回客户端登录消息
gt.CG_VERIFY_HEAD           = 61116

gt.GC_TOAST           		= 61117//服务端群发消息

//棋牌室  301//350
gt.CG_ENTER_CLUB			= 61130    //进入棋牌室
gt.GC_CLUB_SCENE			= 61131    //棋牌室界面内容

gt.CG_LEAVE_CLUB			= 61132    //离开棋牌室   
gt.GC_LEAVE_CLUB			= 61133    //离开棋牌室

gt.CG_SWITCH_PLAY_SCENE		= 61134    //棋牌室界面切换玩法
gt.GC_SWITCH_PLAY_SCENE		= 61135    //棋牌室界面切换玩法内容

gt.GC_CLUB_DESK_INFO		= 61138    //刷新棋牌室桌子信息
gt.GC_CLUB_DESK_PLAYERINFO  = 61139    //俱乐部桌子信息

gt.MSG_C_2_S_CLUB_MASTER_RESET_ROOM = 61152     //俱乐部会长申请解散房间
gt.MSG_S_2_C_CLUB_MASTER_RESET_ROOM = 61153     //服务器返回申请解散房间结果

//防作弊模块
gt.IS_VIP_ROOM               = 61118 //查看是否为vip防作弊房间
gt.SEND_VIDEO_INVITATION     = 61119 //发起视频邀请
gt.RECEIVE_VIDEO_INVITATION  = 61120 //收到视频邀请
gt.INBUSY_VIDEO_INVITATION   = 61121 //视频邀请忙线中
gt.ONLINE_VIDEO_INVITATION   = 61122//视频已连线
gt.SHUTDOWN_VIDEO_INVITATION = 61123 //关闭视频
gt.UPLOAD_GPS_INFORMATION    = 61124//上传GPS坐标
gt.UPLOAD_VIDEO_PERMISSION   = 61125//上传视频是否允许
gt.UPDATE_USER_VIP_INFO      = 61126 //查看是否为vip防作弊房间





//-  poker message
gt.MH_MSG_S_2_C_USER_DESK_COMMAND = 61200


gt.MSG_S_2_S_POKER_GAME  = 62010 //   // 游戏消息

gt.MSG_C_2_S_POKER_GAME_MESSAGE = 62001 // 
gt.MSG_S_2_C_VIP_INFO 			= 61032  // 刷新局数
gt.MSG_S_2_C_POKER_GAME_END_RESULT=62002 // 大结算
gt.SUB_S_GAME_START           =  61030 // 开始游戏

gt.MSG_YINGSANZHANG_S_2_C_LUN = 111
gt.MSG_C_2_S_POKER_RECONNECT = 62007


gt.SUB_S_AUTO_COMPARE_CARD    =113
gt.SUB_C_FINISH_FLASH 		  = 112
gt.SUB_S_LOOK_CARD            = 107
gt.SUB_C_LOOK_CARD            = 108

gt.SUB_S_COMPARE_CARD         = 109
gt.SUB_C_COMPARE_CARD         = 110

gt.SUB_S_GIVE_UP              = 105
gt.SUB_C_GIVE_UP              = 106

gt.SUB_S_AUTO_ADDSCORE        = 101
gt.SUB_C_AUTO_ADDSCORE        = 102

gt.SUB_S_ADD_SCORE            = 62012
gt.SUB_C_ADD_SCORE            = 104



gt.SUB_S_GAME_END             = 0
gt.SUB_S_BEGIN_BUTTON         = 0 
gt.SUB_S_AUTO_SCORE_RESULT    = 0 
gt.SUB_S_SCORE_LUN            = 0


gt.MSG_S_2_C_JOIN_ROOM_CHECK = 62064
gt.MSG_C_2_S_JOIN_ROOM_CHECK = 62063

gt.MH_MSG_C_2_S_QUERY_ROOM_GPS_LIMIT = 61150 ////查询房间的GPS距离限制配置信息
gt.MH_MSG_S_2_C_QUERY_ROOM_GPS_LIMIT_RET = 61151 ////返回房间的GPS距离限制配置信息 
gt.MSG_C_2_S_POKER_ROOM_LOG = 62003 ////查询战绩 
gt.MSG_S_2_C_POKER_ROOM_LOG = 62004 // //服务端返回战绩记录-match

var playType = {
    //1: '报听',
    //2: '带风',
    //8: '抢杠胡',
    18: '暗杠可见',
    6: '随机耗子',
    45: '双耗子',
    49: '风耗子',
    //1002: '大胡',
};

gt.playType = playType;

module.exports = gt;
