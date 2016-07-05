if (window.top === window) {
    console.log("Add event listeners [endScript.js]");
    safari.self.addEventListener("message", handleMessage, false);
}

function handleMessage(event) {

    if (event.name === "checkIfWordPress") {
        // Time to check for wordpress...

        var onWordPress = false;

        var contents = document.body.innerHTML;

        if (contents.search("wp-content") >= 0) {
            onWordPress = true;
            // event.message();
        }

        safari.self.tab.dispatchMessage("onWordPress", onWordPress);
    }
}