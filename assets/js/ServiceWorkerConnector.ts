/*
 * Copyright (c) 2020.
 */

class ServiceWorkerConnector {
    async loadVplanData() {
        let messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = replyHandler;
        navigator.serviceWorker.controller.postMessage({"command": "getVplanData"}, [messageChannel.port2]);

        function replyHandler(event) {
            console.log(event.data)
        }

        console.log("lpad")
    }
}