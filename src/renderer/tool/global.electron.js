
export const gElecSet = (electron) => {
    let { ipcRenderer } = electron;

    ipcRenderer.on("winNum", (event, winNum) => {
		console.log("winNum: ", winNum);
		sessionStorage.setItem("winNum", winNum);
	});
    ipcRenderer.on('reload', (event, arg) => {
        console.log("不能重载 我擦勒")
        //ipcRenderer.send("removeReload");
        let winNum = sessionStorage.getItem("winNum") * 1
        ipcRenderer.send("reload", winNum);
    })

    // 阻止窗口关闭
    window.onbeforeunload = (e) => {
		console.log("I do not want to be closed");
        //ipcRenderer.send("win-close", winNum);
        let winNum = sessionStorage.getItem("winNum") * 1;
		ipcRenderer.send("win-close", winNum);
		e.returnValue = false;
        
	};
    //const beforeUnloadListener = (event) => {
	//	event.preventDefault();
	//	return (event.returnValue = "Are you sure you want to exit?");
	//};

	//const nameInput = document.querySelector("#fixClose");
    //console.log("nameInput: ", nameInput);
	//nameInput.addEventListener("input", (event) => {
	//	if (event.target.value !== "") {
	//		addEventListener("beforeunload", beforeUnloadListener, {
	//			capture: true,
	//		});
	//	} else {
	//		removeEventListener("beforeunload", beforeUnloadListener, {
	//			capture: true,
	//		});
	//	}
	//});

}

