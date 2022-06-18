let {
	app,
	Menu,
	Tray,
	shell,
	ipcMain,
	BrowserWindow,
	nativeImage,
} = require("electron");
const isDev = process.env.NODE_ENV !== "production";
var path = require("path");
const windowManager = require("electron-window-manager");

export const trays = (mainWindow, i18n, multipleName) => {
	// 托盘图标设置
	//console.log(__dirname,'dirpath')

	// 绑定托盘的右键菜单
	var tpl = [
		{
			label: multipleName,
		},
		{
			label: i18n.__("openSC"),
			click: () => {
				if (mainWindow && mainWindow.object) {
					mainWindow.object.show();
				} else if (windowManager.get("superchat1")) {
					windowManager.get("superchat1").object.show();
					mainWindow = null;
				} else {
					createWindow(mainWindow);
				}
			},
		},
		{
			label: i18n.__("exitProgram"),
			click: (item) => {
				mainWindow.object.webContents.send("closeCurrentWin");
				setTimeout(() => {
					windowManager.closeCurrent();
				}, 500);
			},
		},
	];

	let MenuTray = Menu.buildFromTemplate(tpl);

	let unread;
	let read;

	if (isDev) {
		read = path.join(__dirname, "../public/static/icons/icons.png");
	} else {
		read = path.join(__dirname, "./static/icons/icons.png");
	}

	let imgRead = nativeImage.createFromPath(read);
	// let imgUnread = nativeImage.createFromPath(unread)
	//mainWindow.setSkipTaskbar(true);

	// tray 分为 mac 和 windows 兼容 todo windows

	let tray = new Tray(imgRead);
	// tray.setImage(imgUnread) 根据状态设置不同图标
	// tray.destroy()
	// tray = new Tray(imgRead)
	// tray.setImage(imgUnread) 根据状态设置不同图标

	let appName = i18n.__("superChat") || "";
	tray.setToolTip(appName);
	tray.setContextMenu(MenuTray);

	//// 双击 托盘图标 打开窗口
	//tray.on('double-click',function(){
	//    win.show()
	//})
	return tray;
};
