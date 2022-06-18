
### 注意事项
```
deep报错： less ==> /deep/ className sass ==> ::v-deep className

svg配置：https://juejin.cn/post/6984977229562249252

清除代码注释：https://juejin.cn/post/7034851164923363359



```



### 技巧

#### 进程
```
删除所有进程 
ps ux | grep -E 'electron' | grep -v grep |awk '{print $2}' |xargs kill -s 9

mac
ps ux | grep -E 'electron' | grep -v grep |awk '{print $2}'|xargs kill

查询所有进程
ps ux | grep -E 'electron' | grep -v grep
```


### 发现问题

```
多开窗口后，快捷键重载后，      main.js 中 ipcRenderer.send("reloads"方法被多次触发，说明关闭了的页面的进程未退出
arg:winNum  11
arg:winNum  11
arg:winNum  11
arg:winNum  11
arg:winNum  11
arg:winNum  11
arg:winNum  11
arg:winNum  11
arg:winNum  11
arg:winNum  11
removeReload
removeReload
removeReload
removeReload
removeReload
removeReload
removeReload
removeReload
removeReload
removeReload
removeReload
removeReload

````

