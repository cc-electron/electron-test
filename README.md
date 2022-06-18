# chat-os

### test-steps
```
yarn
yarn dev

focus window and press command+N => create new window
click window close icon at top-right

will recieve
    win-closes:  1
    win-closes:  1
    win-closes:  2
    win-closes:  2

i need only 1 times console
 like   win-closes:  1 or 
        win-closes:  2

```


### 运行环境

```
Node: v14.17.0
Vue-cli: v4.5.0

```

### create app
```
vue create app
cd app
vue add electron-builder
```

## Project setup

```
npm install
node > v12
```

### Compiles and hot-reloads for development
```
npm run serve
-- electron-vue
npm run eserve
```

### Compiles and minifies for production
```
npm run build
-- electron-vue
npm run ebuild
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
