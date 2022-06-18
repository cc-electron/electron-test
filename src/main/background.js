"use strict";
// https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration
// https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/recipes.html#multiple-pages
import {
    app,
    BrowserWindow,
    BrowserView,
    globalShortcut,
    dialog,
    Menu,
    protocol,
    ipcMain,
} from "electron";
import {
    createProtocol
} from "vue-cli-plugin-electron-builder/lib";
import installExtension, {
    VUEJS_DEVTOOLS
} from "electron-devtools-installer";
//import { autoUpdater } from "electron-updater"
const path = require("path");
const windowManager = require("electron-window-manager");
const i18n = require("i18n");

const isDev = process.env.NODE_ENV !== "production";
const menuTemplate = require("./electron/menu");
import {
    trays
} from "./trays";
//import { newWindow } from "./electron/AppWindow";

import ipcMainFun from "./tool/ipcMain";
import {
    setUserStore,
    windowHide,
    getUserStore,
    getChatLocalMsgStore,
} from "../renderer/tool/storage";

/* i18n config */
const i18nPath = path.join(
    __dirname,
    isDev ? "../public/static" : "./static",
    "locales"
);
i18n.configure({
    updateFiles: false,
    locales: ["zh", "en", "vi"],
    directory: i18nPath,
    defaultLocale: "en",
});
i18n.setLocale("zh");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, winTray;

let mainWindow;
let splash;
let tray = null;
app.isQuiting = false;
let winC = 0;
let doubleClick = 0;
let createWinDb = false;

let appName = i18n.__("superChat") || "";
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
	{ scheme: "app", privileges: { secure: true, standard: true } },
]);
console.log("123456");

global.__trayAry = [];
global.closeFlag = false;

export function createWindow(mainWindow, devPath = "", prodPath = "index.html", winNum) {
    console.log('创建了窗口');
    // 设置原生应用菜单
    winC++;

    let multipleName = appName + (winNum||winC);
    console.log("multipleName: ", multipleName);
    //console.log("__trayAry: ", global.__trayAry);

    let menu = Menu.buildFromTemplate(menuTemplate.template(i18n, app));
    Menu.setApplicationMenu(menu);
    let x, y;
    const currentWindow = BrowserWindow.getFocusedWindow();

    if (currentWindow) {
        const [currentWindowX, currentWindowY] = currentWindow.getPosition();
        x = currentWindowX + 10;
        y = currentWindowY + 10;
    }

    let tray = null;
    let winObj = {
		x,
		y,
		width: 450,
		height: 750,
		title: appName,
		useContentSize: true,
		fullscreenable: true, //是否允许全屏
		// titleBarStyle: 'hidden',
		// frame: false,
		center: true,
		webPreferences: {
			// Use pluginOptions.nodeIntegration, leave this alone
			// See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
		},
	};

    // Create the browser window.
    //  const window = new BrowserWindow(winObj);
    let winURL;
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        winURL = process.env.WEBPACK_DEV_SERVER_URL + devPath;
        //if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
    } else {
        // Load the index.html when not in development
        winURL = `app://./${prodPath}`;
    }
    mainWindow = windowManager.createNew(
        multipleName,
        multipleName,
        winURL,
        false,
        winObj,
        isDev
    );
    splash = new BrowserWindow({
        width: 450,
        height: 750
    });
    const splashPath = path.join(
		__dirname,
		isDev ? "../public/static" : "./static",
		"splash.html"
	);
    splash.loadFile(splashPath);
    mainWindow.create();
    
    tray = trays(mainWindow, i18n, multipleName);
    global.__trayAry.push(tray);
    ipcMainFun(mainWindow, app, i18n, global);

    //let webContents = mainWindow.object.webContents
    //isDev ? webContents.openDevTools() : webContents.closeDevTools();

    //mainWindow.registerShortcut("CmdOrCtrl+N", function () {
    //	app.emit("newSession")
    //});

    //if (process.env.WEBPACK_DEV_SERVER_URL) {
    //	// Load the url of the dev server if in development mode
    //	mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + devPath);
    //	if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
    //} else {
    //	// Load the index.html when not in development
    //	mainWindow.loadURL(`app://./${prodPath}`);
    //}

    // mainWindow.setSkipTaskbar (true);
    /*
        mainWindow.registerShortcut('dblclick', function() {
            console.log('gsdhgsdgh')

        }); */
    mainWindow.onReady(true, function (window) {
        let wins = mainWindow.object;
		setTimeout(() => {
			splash && splash.close();
			if (mainWindow && !wins.isDestroyed()) {
				wins.show();
                wins.webContents.send("winNum", winC);
			}
		}, 300);
		//let menu = Menu.buildFromTemplate(menuTemplate.template(i18n, app));
		//Menu.setApplicationMenu(menu);
	});

    
    const dockIcon = path.join(
        __dirname,
        isDev ? "../public/static/icons" : "./static/icons",
        "icon.png"
    );
    if (process.platform === "darwin") {
        app.dock.setIcon(dockIcon);
        // 设置扩展栏菜单
        // Set the extension bar menu
        const dockMenu = Menu.buildFromTemplate([{
            label: i18n.__("newInstance"),
            click() {
                let mainWindowF;
                createWindow(mainWindowF)
            },
        }, ]);

        app.dock.setMenu(dockMenu);
    }
    
    //console.log("content: ", mainWindow.name);
    //mainWindow.content().on("close", (e) => {
    //    if (!global.willQuitApp) {
	//		//mainWindow.object.send("renderer-close-tips", { isMac });

	//		// 需要自己写一个头部图标 才能这样使用
	//		// 点击退出 直接退出的话 这里需要一个提示
	//		//const options = {
	//		//	type: "warning",
	//		//	title: "提示",
	//		//	buttons: ["确认", "取消"],
	//		//	message: "确认退出吗？",
	//		//	cancelId: 2,
	//		//};
	//		//const result = dialog.showMessageBox(options);
	//		//result.then(({ response: index, checkboxChecked }) => {
	//		//	if (index == 0) {
	//		//		console.log("确认", index);
	//		//	} else {
	//		//		mainWindow.object.hide();
	//		//		console.log("取消", index);
	//		//	}
	//		//});
    //       e.preventDefault();
	//	}else{
            
    //        console.log("closessssss");
    //        tray.destroy();
    //        //global.__trayAry.splict(x,1)
    //        if (Object.keys(windowManager.windows).length < 2) {
    //            app.isQuiting = true;
    //            app.quit();
    //        }
    //    }

		
	//	//mainWindow = null;
	//	// 回收BrowserWindow对象
	//	// 窗口缩小到最小才能关闭程序
	//	//let curWin = mainWindow.object;
	//	//console.log(curWin, "curWin");

	//	//if (mainWindow.isMinimized() || app.isQuiting) {
	//	//	mainWindow = null;
	//	//} else {
	//	//	event.preventDefault();
	//	//	// mainWindow.minimize();
	//	//	app.isQuiting = false;

	//	//	console.log(tray, "istray");

	//	//	if (loginStore.get("isLogin")) {
	//	//		console.log("设置loginStore为false");
	//	//		loginStore.set("isLogin", false);
	//	//		console.log(loginStore.get("isLogin"), "islogin??");
	//	//	}
	//	//	mainWindow.hide();
	//	//	mainWindow.setSkipTaskbar(true);
	//	//}
	//});

    // console.log('关闭主窗口')
    mainWindow.content().on("closed", () => {
        //mainWindow = null;
    })

    // const view = new BrowserView();
    // app.dock.setBadge('.');

    mainWindow.content().on("focus", () => {
        if (windowHide.get("isHide")) {
            windowHide.set("isHide", false);
            //mainWindow.webContents.send('windowHideReceipt');
        }
        //console.log('focus',windowHide.get("isHide"))
    });

    mainWindow.content().on("blur", () => {
        console.log("test blur");
        // 弹跳功能 information 只跳一次 critical 直到窗口激活才会停止
        // app.dock.bounce("critical");
        // 更改底部扩展栏图标
        // app.dock.setIcon(path.join(__static, '/appicon.png'));

        // 冒泡信息提示
        // const badgeString = app.dock.getBadge();
        // console.log(badgeString,'badgeString')

        // if (badgeString === '') {
        //   app.dock.setBadge('1');
        //   console.log(badgeString,'2333badgeString')
        // } else {
        //   app.dock.setBadge((parseInt(badgeString) + 1).toString());
        // }

        // let countssss = app.badgeCount;
        //mainWindow.reload();
        windowHide.set("isHide", true);

        //console.log('countssss',windowHide.get("isHide"))
        // // if (badge.count > 0) {
        // //     app.dock.setBadge('12345654');
        // // } else {
        // //     app.dock.setBadge('99000');
        // // }
        // if (app.badgeCount > 0) {
        //     app.dock.setBadge('12345654');
        // } else {
        //     app.dock.setBadge('99000');
        // }
        // if (process.platform === 'darwin') {
        //     app.dock.setBadge('2');
        //     app.setBadgeCount(2);

        // }
    });


    globalShortcut.register("CommandOrControl+Shift+I", () => {
        //if(!isDev)return
        let focusWin = BrowserWindow.getFocusedWindow();
        focusWin && focusWin.toggleDevTools();
    });

    

    let win = BrowserWindow.getFocusedWindow();
    if (win) {
        win.setThumbarButtons([{
            tooltip: i18n.__("newInstance"),
            icon: dockIcon,
            click() {
                let mainWindowF;
                createWindow(mainWindowF)
            },
        }, ]);
        win.on("minimize", () => {
            if (doubleClick > 0) {
                doubleClick = 0;
                let mainWindowF;
                createWindow(mainWindowF)
                createWinDb = true;
            } else {
                doubleClick++;
                if (createWinDb) {
                    createWinDb = false;
                    doubleClick = 0;
                }
            }

            setTimeout(function () {
                doubleClick = 0;
            }, 500);
        });
        win.on("restore", () => {
            if (doubleClick > 0) {
                let mainWindowF;
                createWindow(mainWindowF)
                doubleClick = 0;
                createWinDb = true;
            } else {
                doubleClick++;
                if (createWinDb) {
                    createWinDb = false;
                    doubleClick = 0;
                }
            }

            setTimeout(function () {
                doubleClick = 0;
            }, 500);
        });
    }
}

//自定义事件
app.on("newSession", (arg) => {
    let mainWindowF;
    createWindow(mainWindowF);
});

//app.on("newReloadWin", (arg) => {
//	console.log("newReloadWin:winNum", arg);
//    if(windowManager.getCurrent()){
//        let winName = windowManager.getCurrent().name;
//        console.log("winName: ", winName);

//        winName && windowManager.destroy(winName);

//        let mainWindowF;
//        createWindow(mainWindowF, "", "index.html");
//    }
		
//});

// 重启
app.on("relaunch", () => {
    app.relaunch({
        args: process.argv.slice(1).concat(["--relaunch"])
    });
    // relaunch不会退出当前应用，需要调用exit或者quit
    app.exit(0);
});

// 退出应用时触发
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// 当应用被激活时发出。 各种操作都可以触发此事件, 例如首次启动应用程序、尝试在应用程序已运行时或单击应用程序的坞站或任务栏图标时重新激活它。
app.on("activate", () => {
    console.log("activate");
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.

    app.isQuiting = false
    //  !win.isVisible() && win.show();
    //  if (win === null) {
    //    win = createWindow('', 'index.html')
    //  }

    if (doubleClick > 0) {
        let mainWindowF;
        createWindow(mainWindowF)
    } else {
        doubleClick++;
    }
    setTimeout(function () {
        doubleClick = 0;
    }, 500);

});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.on('ready', async () => {
//  if (isDev && !process.env.IS_TEST) {
//    // Install Vue Devtools
//    try {
//      await installExtension(VUEJS_DEVTOOLS)
//    } catch (e) {
//      console.error('Vue Devtools failed to install:', e.toString())
//    }
//  }
//  // createWindow()
//  if (!process.env.WEBPACK_DEV_SERVER_URL) {
//    createProtocol('app')
//  }
//  win = createWindow('', 'index.html')

//  //托盘
////  winTray = trays(win)

//  win.on('close', (event) => {
//      // 回收BrowserWindow对象
//      // 窗口缩小到最小才能关闭程序
//      if(win.isMinimized()||app.isQuiting){
//        win = null;
//      }else{
//        event.preventDefault();
//        // win.minimize();
//        app.isQuiting = false

//        win.hide();
//        win.setSkipTaskbar(true);
//      }

//  });

//  win.once("ready-to-show", () => {
//    //autoUpdater.checkForUpdatesAndNotify();
//  });

//  win.on("closed", () => { win = null; });

//})
app.on("ready", async () => {
    if (isDev && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS);
        } catch (e) {
            console.error("Vue Devtools failed to install:", e.toString());
        }
    }
    // createWindow()
    if (!process.env.WEBPACK_DEV_SERVER_URL) {
        createProtocol("app");
    }
    let mainWindowF;
    createWindow(mainWindowF)
    doubleClick = 0;
});

app.on("before-quit", () => {
    console.log("2333强制退出前！！！");
    app.isQuiting = true;
});
app.on("quit", () => {
    console.log("2333强制退出了2333！！！");
});

// Exit cleanly on request from parent process in development mode.
if (isDev) {
    if (process.platform === "win32") {
        process.on("message", (data) => {
            if (data === "graceful-exit") {
                app.quit();
            }
        });
    } else {
        process.on("SIGTERM", () => {
            app.quit();
        });
    }
}