// 登录状态缓存
const Store = require("electron-store");

// let customStorage = require()
export const loginStore = new Store({ name: "loginStore" });
export const windowHide = new Store({ name: "windowHide" });
//export const windowHideReceipt = new Store({ name: "windowHideReceipt" });
// 再写此方法的原因 文件之间不能存在互相引用的情况 否则会导致编译不通过
const getLocalStorage = (key) => {
        let objstr = localStorage.getItem(key);
        objstr = JSON.parse(objstr);
        return objstr || "";
    }
    // 用户信息缓存
const userSchema = {
    name: "userStores",
    userCommon: {
        type: "object",
    },
    userInfo: {
        type: "object",
    },
    token: {
        type: "string",
    },
    // chatInRooms: {
    // 	type: "array",
    // },
    DELKEY: {
        type: "string",
        default: "",
    },
    // [usersId]:{
    //  chatInRooms: chatInRooms
    //  noticeMsgs: [arr]
    // 	chatLocalMsg: {
    // 		[roomIdAndId]: [...list],
    // 	},
    // }
};
export const userStore = new Store({ userSchema });
// console.log("userStore: ", userStore);
export const setUserStore = (key, value) => {
    userStore.set(key, value);
};
export const getUserStore = (key) => {
    return userStore.get(key);
};

// todo 不同环境下的账号缓存

// 每个房间的聊天信息
// Chat information for each room
export const CHATLOCALMSG = "chatLocalMsg";
// 正在聊天的房间信息
// Room information being chatted
export const CHAT_IN_ROOMS = "chatInRooms";
// 系统通知消息
// System notification message
export const NOTICE_MSGS = "noticeMsgs";
// 全局用户未读数
// Global user reading
export const UNREAD_NUM = "unReadNum";
// 正在聊天的房间信息的扩展信息
// Extended information about the room being chatted
export const CHAT_IN_ROOMSPRO = "chatInRoomsPro";
// 自定义表情
// Custom emoticons
export const CUSTOM_FACE = "customFace";
// 加入的群聊
// group chat Lists
export const ROOMS = "rooms";
// 好友列表
// Buddy Lists
export const FRIENDS = "friends";
// 房间用户信息表
// Room User Information Sheet Lists
export const ROOMS_MEMBER_OBJ = "roomsMemberObj";
// 好友查询表
// Friends query table Lists
export const FRIENDS_OBJ = "friendsObj";
// 房间查询表
// Room Enquiry Form Lists
export const ROOMS_OBJ = "roomsObj";
// 当前用户信息
// Current user information
export const USERS_OBJ = "usersObj";
// 离线消息
// Offline message
export const OFFLINE_MSG = "offLineMsg";
// 离线消息扩展
// Offline message extension
export const OFFLINE_MSGPRO = "offLineMsgPro";
// Language settings
export const LANGUAGE = "Language";

export const USERINFO = "userInfo";
export const TOKEN = "token";
export const DELKEY = "DELKEY";
export const USER = "user";

export const composeChatKey = (type = 1, key) => {
    // console.log(23333333, "composeChatKey");
    let TYPE;
    let RKey;
    let userId;
    if (type === LANGUAGE) {
        TYPE = type;
        RKey = `${TYPE}.${key}`
            // console.log("RKey: ", RKey);
        return RKey;
    }


    let userInfo = sessionStorage.getItem("userInfo")
    if (!userInfo || userInfo == null) return;
    userInfo = JSON.parse(userInfo);
    userId = (userInfo && userInfo.id) || '';

    if (type === USERINFO || type === TOKEN) {
        TYPE = type;
        RKey = `RC_${userId}.${TYPE}`;
    } else if (type == USER) {
        RKey = `RC_${userId}`
    } else if (type == 5) {
        TYPE = CHAT_IN_ROOMSPRO;
        RKey = `RC_${userId}.${TYPE}`;
    } else if (type == 6) {
        TYPE = CUSTOM_FACE;
        RKey = `RC_${userId}.${TYPE}`;
    } else if (type == 7) {
        TYPE = ROOMS;
        RKey = `RC_${userId}.${TYPE}`;
    }
    // console.log("RKey: ", RKey);
    return RKey;
}
export const getChatLocalMsgStore = (type, key) => {
    return userStore.get(composeChatKey(type, key)) || false;
};
export const setChatLocalMsgStore = (type, key, value) => {
    // console.log("setName: ", key);
    // console.log("setVal: ", value);
    userStore.set(composeChatKey(type, key), value);
    //console.log("userstore: ", userStore.store);
};
export const hasChatLocalMsgStore = (type, key) => {
    return userStore.has(composeChatKey(type, key));
};
export const delChatLocalMsgStore = (type, key) => {
    // DELKEY = key;
    setUserStore("DELKEY", key);
    // console.log("deleteName: ", composeChatKey(key) == "chatLocalMsg.173_1",composeChatKey(key));
    key && userStore.delete(composeChatKey(type, key));
};