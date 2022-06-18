const prodPlugins = [];
// 生产环境添加plugins，排除console.error 和console.warn
if (process.env.NODE_ENV === "production") {
	prodPlugins.push([
		"transform-remove-console",
		{ exclude: ["error", "warn"] },
	]);
}

module.exports = {
	presets: ["@vue/cli-plugin-babel/preset"],
	plugins: [...prodPlugins],
};
