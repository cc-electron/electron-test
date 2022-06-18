const path = require("path");
const Store = require("electron-store");
//const openElseWin = require("../main/menu").openElseWin;
const { dialog } = require("electron");
const windowManager = require("electron-window-manager");

import { log } from "console";
// const settingStore = new Store({
//     name: 'Settings'
// })
import { ipcMain } from "electron";

import { setUserStore, setChatLocalMsgStore } from '../../renderer/tool/storage'
import { createWindow } from '../background'

const isDev = process.env.NODE_ENV !== "production";
// const fixPath = () => {
//     var icon
//     var contentImage
//     var open
//     if (isDev) {
//         icon = path.join(__dirname, 'a.png')
//         contentImage = path.join(__dirname, 'a.png')
//         open = path.join(__dirname, 'a.png')
//     } else {
//         icon = path.join(__dirname, "/static/icon.png");
//         contentImage = path.join(__dirname, "/static/icon.png");
//         open = path.join(__dirname, "/static/icon.png");
//     }
//
//     return {
//         icon,
//         contentImage,
//         open
//     }
// }

// var nodeConsole = require('console');
// let { icon, contentImage, open } = fixPath()
// var notifyInfo = null
// var consoles = new nodeConsole.Console(process.stdout, process.stderr);
// consoles.log('Hello World!', path.join(__dirname));

// export const ipcToNotify = (arg) => {
//     return new Promise(resolve => {
//         ipcRenderer.send('ipcToNotify', arg)
//         resolve()
//     });
// }



const ipcMainFun = (mainWindow, app, i18n, global, newSession) => {
	let { __trayAry: trayAry } = global;
	// if (newSession) {
	//     mainWindow.object.webContents.send('OpenNewSession')
	// }
	function listenerFunc(arg) {
		console.log("listenerFunc: ", arg);
	}

	// 调整窗口大小
	ipcMain.on("resize", (event, arg) => {
		//mainWindow.resize(arg).restore();
	});

	// 登陆处理逻辑
	ipcMain.on("logined", (event, arg) => {
		if (windowManager) {
			windowManager.getCurrent().resize(1300, 750).restore();
			windowManager.getCurrent().object.center();
		}
	});
	ipcMain.on("setNameSession", (event, arg) => {
		setUserStore(arg, windowManager.getCurrent().name);
	});

	ipcMain.on("logout", (event, arg) => {
		if (windowManager) {
			// console.log(windowManager.getCurrent())
			// console.log("resize: ",windowManager.getCurrent().resize)
			windowManager.getCurrent().resize(450, 750).restore();
			windowManager.getCurrent().object.center();
		}
		// windowManager.getCurrent().object.center()
	});
	//
	ipcMain.on(
		"notify",
		(evt, dataMsgNotDis, data, msgType, title, logoIcon) => {
			const eNotify = require("electron-notify");
			const { msg, logo } = data;
			console.log(
				getUserStore(data.senderId + "NOTIFY"),
				"sasasasasa",
				data,
				data.senderId
			);
			if (
				dataMsgNotDis === 1 ||
				getUserStore(data.senderId + "NOTIFY") === mainWindow.name ||
				notifyInfo === data.msgId
			) {
				console.log(notifyInfo, "aaaaa bbb");
				return;
			}
			eNotify.setConfig({
				appIcon: icon,
				displayTime: 10000,
				border: "1px solid #CCC",
				defaultStyleText: {
					color: "green",
					fontWeight: "bold",
				},
				defaultStyleContainer: {
					backgroundColor: "#f0f0f0",
					overflow: "hidden",
					padding: 8,
					border: "1px solid #CCC",
					fontFamily: "Arial",
					fontSize: 12,
					position: "relative",
					lineHeight: "15px",
					top: 0,
				},
				defaultStyleAppIcon: {
					overflow: "hidden",
					float: "right",
					height: 40,
					width: 40,
					marginRight: 15,
				},
				defaultStyleImage: {
					overflow: "hidden",
					float: "left",
					height: 40,
					width: 40,
					marginRight: 10,
					borderRadius: "50%",
				},
			});
			eNotify.notify({
				title: title || "data",
				text: JSON.parse(msg).message || msgType || "data2",
				//closeLabel: 'Close', // String. Label for cancel button
				//actions: 'show', // String | Array<String>. Action label or list of labels in case of dropdown
				image: logoIcon,
				onClickFunc: function () {
					//console.log(data,'icon:'+logoIcon)
					mainWindow.object.show();
					mainWindow.object.webContents.send("OpenChat", data);
					//eNotify.closeAll()
				},
			});
			notifyInfo = data.msgId;
		}
	);

	ipcMain.on("changeLang", (evt, lang, info) => {
		if (info && info.id) {
			setUserStore("userCommon", { id: info.id });
			setChatLocalMsgStore("Language", info.id, lang);
			console.log("langsssdddds: ", lang);
			console.log("info: ", info);
		} else {
			setUserStore("userCommon", { id: "unpass_user" });
			setChatLocalMsgStore("Language", "unpass_user", lang);
		}
		app.relaunch();
		app.exit(0);
	});
	ipcMain.on("refresh", () => {
		app.isQuiting = true;
		/* app.quit()
            // todo windows 使用
            openElseWin() */
		app.quit();
		app.relaunch();
		app.exit(0);
	});
	ipcMain.on("reload", (e, arg) => {
		//console.log("event: ", e);
		console.log("arg:winNum ", arg);

		/* if (mainWindow.isDestroyed()) {
            app.relaunch();
            app.exit(0);
        } else { */
		/* BrowserWindow.getAllWindows().forEach((w) => {
            if (w.id !== mainWindow.id) w.destroy();
        }); */
		//mainWindow.reload();
		//if (!mainWindow.isDestroyed()) {
		//    mainWindow.object.reload();
		//}

		//app.emit("newReloadWin", arg);
		if (isDev && windowManager.getCurrent()) {
			let winName = windowManager.getCurrent().name;
			console.log("winName: ", winName, trayAry);
			let trayobj = trayAry[arg - 1];
			trayobj.destroy();
			//trayobj.splice(0,1)
			console.log("trayobj: ", trayobj);
			winName && windowManager.destroy(winName);

			let mainWindowF;
			createWindow(mainWindowF, "", "index.html");
		}
	});
	ipcMain.on("removeReload", (e, arg) => {
		console.log("[ removeReload ] >");
		ipcMain.removeListener("reload", listenerFunc("removeListener"));
		//ipcMain.removeAllListeners([channel]);
	});

	ipcMain.on("win-close", (e, arg) => {
        console.log("win-closes: ", arg);
		//const options = {
		//	type: "warning",
		//	title: "提示",
		//	buttons: ["确认退出", "最小化到系统托盘"],
		//	message: "确认退出吗？",
		//	cancelId: 2,
		//};
		//const result = dialog.showMessageBox(options);
		//result.then(({ response: index, checkboxChecked }) => {
		//	if (index == 0) {
		//		console.log("确认", index);
		//		let trayobj = trayAry[arg - 1];
		//		trayobj.destroy();
		//		mainWindow.object.close();
		//		if (Object.keys(windowManager.windows).length < 2) {
		//			app.isQuiting = true;
		//			app.quit();
		//		}
		//	} else {
		//		mainWindow.object.hide();
		//		console.log("取消", index);
		//	}
		//});
	});

	//
};

export default ipcMainFun;
