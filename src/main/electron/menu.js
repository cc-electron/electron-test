const { BrowserWindow, Menu, app, shell, dialog, ipcMain } = require('electron')
const exec = require('child_process').exec;
//const windowManager = require("electron-window-manager");
// 生产环境
//const isDev = process.env.NODE_ENV !== 'production';
//const path = require('path')
//const { appName } = require("../../pack-box/configs");

//const openElseWin = () => {
//    // todo windows 使用
//    if (process.platform === 'darwin'){
//        // const macShell = `${path.join(__dirname, '/mac-o.sh')}`
//        // 获取的app路径 需要配置
//        let appPath = path.resolve(__dirname, `../dist_electron/mac/${appName}.app`)
//        let appPaths = path.resolve(__dirname, `../../../../${appName}.app`)
//        // appPaths = '/Users/js103/pkorg/electron/chat-os/dist_electron/mac/chaoxin.app '
//        //console.log(appPaths)
//        //console.log(appPath,'appPath')
//        let openPath
//        if (isDev){
//            openPath = appPath
//        }else{
//            openPath = appPaths
//        }
//        // 此路径为shell脚本多开路径
//        // 键入路径
//        var yourscript = exec(`open -n ${openPath}`,
//            (error, stdout, stderr) => {
//                //console.log(stdout);
//                //console.log(stderr);
//                if (error !== null) {
//                    console.log(`exec error: ${error}`);
//                }
//            });

//    } else if (process.platform === "win32") {
//        // D:\Softwares\BaiduYun\baiduyun.exe
//        let winPath = path.resolve(__dirname, `../../dist_electron/win-unpacked/${appName}.exe`);
//        let winPaths = path.resolve(__dirname, `../../../../${appName}.exe`);
//        let openPath = isDev ? winPath : winPaths;
//        exec(`start ${openPath}`, (error, stdout, stderr) => {
//            if (error !== null) {
//                console.log(`exec error: ${error}`);
//            }
//        });
//    }
//}

let templates = (i18n) => {
	let template = [
		{
			label: i18n.__("theEdit"),
			submenu: [
				{
					label: i18n.__("undo"),
					accelerator: "CmdOrCtrl+Z",
					role: "undo",
				},
				// {
				//     label: i18n.__('redo'),
				//     accelerator: 'Shift+CmdOrCtrl+Z',
				//     role: 'redo'
				// },
				//{
				//	label: "切换开发者工具",
				//	accelerator: (() => {
				//		if (process.platform === "darwin") {
				//			return "Alt+Command+I";
				//		} else {
				//			return "Ctrl+Shift+I";
				//		}
				//	})(),
				//	click: (item, focusedWindow) => {
				//		if (focusedWindow) {
				//			focusedWindow.toggleDevTools();
				//		}
				//	},
				//},
				{
					type: "separator",
				},
				{
					label: i18n.__("shear"),
					accelerator: "CmdOrCtrl+X",
					role: "cut",
				},
				{
					label: i18n.__("copy"),
					accelerator: "CmdOrCtrl+C",
					role: "copy",
				},
				{
					label: i18n.__("paste"),
					accelerator: "CmdOrCtrl+V",
					role: "paste",
				},
				{
					label: i18n.__("selectAll"),
					accelerator: "CmdOrCtrl+A",
					role: "selectall",
				},
			],
		},
		{
			label: i18n.__("toView"),
			submenu: [
				{
					label: i18n.__("overloading"),
					accelerator: "CmdOrCtrl+R",
					click: (item, focusedWindow) => {
						if (focusedWindow) {
							// 重载之后, 刷新并关闭所有之前打开的次要窗体
							// if (focusedWindow.id === 1) {
							//     BrowserWindow.getAllWindows().forEach(win => {
							//         if (win.id > 1) win.close()
							//     })
							// }
                            //focusedWindow.reload()
							//app.emit("relaunch");
                            focusedWindow.webContents.send("reload");

						}
					},
				},
				{
					label: i18n.__("switchTheFullScreen"),
					accelerator: (() => {
						if (process.platform === "darwin") {
							return "Ctrl+Command+F";
						} else {
							return "F11";
						}
					})(),
					click: (item, focusedWindow) => {
						if (focusedWindow) {
							focusedWindow.setFullScreen(
								!focusedWindow.isFullScreen()
							);
						}
					},
				},
				{
					type: "separator",
				},
				/* , {
                                label: '应用程序菜单演示',
                                click: function (item, focusedWindow) {
                                    if (focusedWindow) {
                                        const options = {
                                            type: 'info',
                                            title: '应用程序菜单演示',
                                            buttons: ['好的'],
                                            message: '此演示用于 "菜单" 部分, 展示如何在应用程序菜单中创建可点击的菜单项.'
                                        }
                                        dialog.showMessageBox(focusedWindow, options, function () {})
                                    }
                                }
                            } */
			],
		},
		{
			label: i18n.__("window"),
			role: "window",
			submenu: [
				{
					label: i18n.__("toMinimizeThe"),
					accelerator: "CmdOrCtrl+M",
					role: "minimize",
				},
				{
					label: i18n.__("shutDown"),
					accelerator: "CmdOrCtrl+W",
					role: "close",
				},
				{
					type: "separator",
				},
				{
					label: i18n.__("openTheWindowAgain"),
					accelerator: "CmdOrCtrl+Shift+T",
					enabled: false,
					key: "reopenMenuItem",
					click: () => {
						app.emit("activate");
					},
				},
			],
		},
		{
			label: i18n.__("extension"),
			role: "shili",
			submenu: [
				{
					label: i18n.__('newInstance'),
					accelerator: "CmdOrCtrl+N",
					role: "shili",
					click: (item, focusedWindow) => {
                        app.emit("newSession");
					},
				},
			],
		},
		// {
		//     label: '帮助',
		//     role: 'help',
		//     submenu: [{
		//         label: '学习更多',
		//         click: () => {
		//             shell.openExternal('http://electron.atom.io')
		//         }
		//     }]
		// }
	];
	if (process.platform === "darwin") {
		const name = i18n.__("superChat") || app.name;
		template.unshift({
			label: name,
			submenu: [
				{
					label: `${i18n.__("about")} ${name}`,
					role: "about",
				},
				{
					type: "separator",
				},
				{
					label: i18n.__("service"),
					role: "services",
					submenu: [],
				},
				{
					type: "separator",
				},
				{
					label: `${i18n.__("hidden")} ${name}`,
					accelerator: "Command+H",
					role: "hide",
				},
				{
					label: i18n.__("hideTheOther"),
					accelerator: "Command+Alt+H",
					role: "hideothers",
				},
				{
					label: i18n.__("revealAll"),
					role: "unhide",
				},
				{
					type: "separator",
				},
				{
					label: i18n.__("exit"),
					accelerator: "Command+Q",
					click: () => {
						app.quit();
					},
				},
			],
		});

		// complete project && pack it use this
		// isDev?template[3].submenu.push(
		//     {
		//         label: '切换开发者工具',
		//         accelerator: (() => {
		//             if (process.platform === 'darwin') {
		//                 return 'Alt+Command+I'
		//             } else {
		//                 return 'Ctrl+Shift+I'
		//             }
		//         })(),
		//         click: (item, focusedWindow) => {
		//             if (focusedWindow) {
		//                 focusedWindow.toggleDevTools()
		//             }
		//         }
		//     }
		// ):null

		// 窗口菜单.
		// template[3].submenu.push({
		//     type: 'separator'
		// }, {
		//     label: '前置所有',
		//     role: 'front'
		// })

		addUpdateMenuItems(template[0].submenu, 1, i18n);
	}
	return template;
};

function addUpdateMenuItems(items, position, i18n) {
	if (process.mas) return;

	const version = app.getVersion();
	let updateItems = [
		{
			label: `${i18n.__("version")} ${version}`,
			enabled: false,
		},
		{
			label: i18n.__("checkForUpd"),
			enabled: false,
			key: "checkingForUpdate",
		},
		{
			label: i18n.__("checkUpd"),
			visible: false,
			key: "checkForUpdate",
			click: () => {
				require("electron").autoUpdater.checkForUpdates();
			},
		},
		{
			label: i18n.__("restAndInsUpd"),
			enabled: true,
			visible: false,
			key: "restartToUpdate",
			click: () => {
				require("electron").autoUpdater.quitAndInstall();
			},
		},
	];

	items.splice.apply(items, [position, 0].concat(updateItems));
}

function findReopenMenuItem() {
	const menu = Menu.getApplicationMenu();
	if (!menu) return;

	let reopenMenuItem;
	menu.items.forEach((item) => {
		if (item.submenu) {
			item.submenu.items.forEach((item) => {
				if (item.key === "reopenMenuItem") {
					reopenMenuItem = item;
				}
			});
		}
	});
	return reopenMenuItem;
}

// if (process.platform === 'win32') {
//     const helpMenu = template[template.length - 1].submenu
//     addUpdateMenuItems(helpMenu, 0)
// }

// app.on('ready', () => {
//     const menu = Menu.buildFromTemplate(template)
//     Menu.setApplicationMenu(menu)
// })

app.on("browser-window-created", () => {
	let reopenMenuItem = findReopenMenuItem();
	if (reopenMenuItem) reopenMenuItem.enabled = false;
});

app.on("window-all-closed", () => {
	let reopenMenuItem = findReopenMenuItem();
	if (reopenMenuItem) reopenMenuItem.enabled = true;
});


module.exports = {
	template: (i18n, app) => {
		return templates(i18n, app);
	},
};