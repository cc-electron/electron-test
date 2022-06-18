const path = require("path");
const ps = require("process");

//const CopyWebpackPlugin = require("copy-webpack-plugin");
const { appName } = require("./pack-box/configs");

const isProduction = ps.env.NODE_ENV === "production";
const isargv = true || ps.env.BUILD_TARGET === "devlog";
//const isnotools = ps.env.BUILD_TARGET === "notools";
const isAnalyze = false || ps.argv[3] == "-analyze";

const buildcfg = {
	title: "superchat",
	port: 9080, // 本地服务端口号
	outputDir: "dist", // 打包输出文件名
	publicPath: process.env.BASE_URL, // 打包后文件链接
	env: process.env.VUE_APP_ENV, // 环境变量值
	closeConsole: process.env.IS_NOCONSOLE, // 是否移除console
};


function resolve(dir) {
	return path.join(__dirname,dir)
}
const APP_NAME = `${appName}`;

module.exports = {
	publicPath: buildcfg.publicPath,
	outputDir: buildcfg.outputDir,
	assetsDir: "static",
	productionSourceMap: !process.argv.includes("electron:build"),
	pages: {
		index: {
			entry: "src/renderer/main.js",
			template: "public/index.html",
			filename: "index.html",
			title: buildcfg.title,
			//chunks: ["chunk-vendors", "chunk-common", "index"],
		},
		loader: "src/loader/main.js",
		//subpage: 'src/subpage/main.js'
	},
	devServer: {
		port: buildcfg.port,
		proxy: {
			"/app/api/v2": {
				target: "https://www.baidu.com",
				ws: true,
				changeOrigin: true, //是否跨域
			},
		},
		disableHostCheck: true,
	},
	chainWebpack: (config) => {
		// config
		// .plugin('html')
		// .tap(args => {
		//     args[0].title= 'chaoxin' //页面title
		//     return args
		// })
		config.resolve.alias
			.set("@", resolve("./src/renderer"))
			.set("static", resolve("./static"))
			.set("pack-box", resolve("./pack-box"))
			.set("tool", resolve("./src/renderer/tool"));

		/* svg 相关配置 */
		const svgRule = config.module.rule("svg");
		// 清空默认svg规则
		svgRule.uses.clear();
		//针对svg文件添加svg-sprite-loader规则
		svgRule
			.test(/\.svg$/)
			.use("svg-sprite-loader")
			.loader("svg-sprite-loader")
			.options({
				symbolId: "icon-[name]",
			});

		if (isProduction) {
			// 打包分析
			if (isAnalyze) {
				config
					.plugin("webpack-bundle-analyzer")
					.use(
						require("webpack-bundle-analyzer").BundleAnalyzerPlugin
					);
			}
		}
	},
	configureWebpack: (config) => {
		if (buildcfg.env === "production") {
			buildcfg.closeConsole &&
				config.plugins.push(
					new TerserPlugin({
						parallel: true,
						terserOptions: {
							output: { comments: false },
							compress: {
								warnings: false,
								drop_console: true,
								drop_debugger: true,
								pure_funcs: ["console.log"],
							},
						},
					})
				);
		}
		config.mode = process.env.NODE_ENV;
		//alias: {
		//	"@": path.join(__dirname, "./src"),
		//	static: path.join(__dirname, "./static"),
		//	"pack-box": path.join(__dirname, "./pack-box"),
		//	tool: path.join(__dirname, "./src/tool"),
		//},
		//extensions: [".js", ".vue", ".json", ".css", ".scss"],
	},
	pluginOptions: {
		electronBuilder: {
			nodeIntegration: true,
			preload: {
				preload: "src/preload/ipcRenderer.js",
				webviewPreload: "src/preload/webview.js",
			},
			mainProcessFile: "src/main/background.js",
			mainProcessWatch: ["src/main"],
			builderOptions: {
				//publish: ["github"],
				appId: `com.${appName}.app`, //ID 不用解释吧?
				asar: false,
				productName: APP_NAME, //项目名，也是生成的安装文件名，即aDemo.exe
				copyright: `Copyright © ${appName}`, //版权信息
				directories: {
					output: "./dist_electron", //打包后的输出文件路径
					//buildResources: "build",
					//app: "dist_electron/bundled"
				},
				//"artifactName": "demo-${version}-${arch}.${ext}",
				// "files": [
				//     "dist/electron/**/*"
				// ],
				//extraResources: [
				//	//{
				//	//	from: "src/electron/files",
				//	//	to: "app/electron/files",
				//	//},
				//	//{
				//	//	from: "src/static",
				//	//	to: "app/static",
				//	//},
				//],
				dmg: {
					contents: [
						{
							type: "link",
							path: "/Applications",
							x: 410,
							y: 150,
						},
						{
							type: "file",
							x: 130,
							y: 150,
						},
					],
				},
				mac: {
					icon: "./public/static/icons/icon.icns",
					target: ["dmg"],
				},
				protocols: [
					{
						name: "vue-cli-electron",
						schemes: ["vue-cli-electron"],
					},
				],
				win: {
					//win相关配置
					icon: "./public/static/icons/icon.ico", //图标，当前图标在根目录下，注意这里有个坑
					target: [
						{
							target: "nsis", //利用nsis制作安装程序
							arch: [
								"x64", //64位
							],
						},
					],
				},
				nsis: {
					oneClick: false,
					perMachine: true,
					allowToChangeInstallationDirectory: true,
					warningsAsErrors: false,
					allowElevation: false,
					createDesktopShortcut: true,
					createStartMenuShortcut: true,
					//include: "installer.nsh"
				},
			},
		},
	},
};
