/*
 * Copyright (c) 2020. Witt, Nils
 * MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

let wait_start = 5000;
let wait_end = 5000;
let refresh_time = 60000;
let step = 1;
let intervalId = 0;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serviceworker.js', {}).then(function (reg) {
        console.log('Registrierung erfolgreich. Scope ist ' + reg.scope);
        if (!reg.active) {
            console.log('SW not active');
            location.reload();
        }
    }).catch(function (error) {
        console.log('Registrierung fehlgeschlagen mit ' + error);
    });
} else {
    console.log("No sw avilible")
}


function scrolldiv(scroll_element) {
    let div = document.getElementById(scroll_element);
    let y = div.scrollTop;
    div.scrollTop = y + step;
    if (y === div.scrollTop) {
        setTimeout(function () {
            div.scrollTop = 0;
            setTimeout(function () {
                scrolldiv(scroll_element);
            }, wait_start);
        }, wait_end);
    } else {
        window.setTimeout("scrolldiv('" + scroll_element + "')", 80);
    }
}

async function initConnection() {
    return new Promise(async (resolve, reject) => {
        try {
            let res = await fetch("/display/xmlhttp/vertretungsplan.php?key=" + window.localStorage.getItem("key"));
            console.log(res.status)
            if (res.status === 200) {
                await start();
                setTimeout(() => {
                    document.getElementById("loadScreen").style.display = "none";
                    document.getElementById("rechts").style.display = "inherit";
                    document.getElementById("links").style.display = "inherit";
                }, 5000)

                document.getElementById("keyInput").style.visibility = "hidden";
                document.getElementById("saveKey").style.visibility = "hidden";
                document.getElementById('loadingStatus').innerText = "Erfolgreich initialisiert";
            } else if (res.status === 401) {
                document.getElementById('loadingStatus').innerText = "Error while authentication";
                document.getElementById("keyInput").style.visibility = "visible";
                document.getElementById("saveKey").style.visibility = "visible";
            }

        } catch (e) {
            let sec = 30;

            document.getElementById('loadingStatus').innerText = "Can´t contact Server - retrying in 30 sec"

            let intId = setInterval(() => {

                document.getElementById('loadingStatus').innerText = "Can´t contact Server - retrying in " + sec + " sec"

                if (sec === 0) {
                    clearInterval(intId);
                    initConnection();
                }
                sec--;
            }, 1000);
        }
        resolve();
    });
}

async function loadDataVertretungsplan() {
    return new Promise(async (resolve, reject) => {
        let res;
        try {
            res = await fetch("/display/xmlhttp/vertretungsplan.php?key=" + window.localStorage.getItem("key"));
            document.getElementById("offlineIndicatior").style.visibility = "hidden";
        } catch (e) {
            console.log(e);
            document.getElementById("offlineIndicatior").style.visibility = "visible";
        }

        if (res.status === 200) {
            document.getElementById("offlineIndicatior").style.visibility = "hidden";
            document.getElementById("rechts").innerHTML = VplanParse(await res.json()).innerHTML;
        }
        resolve();
    });
}

async function loadDataAushang() {
    return new Promise(async (resolve, reject) => {
        let res;
        try {
            res = await fetch("/display/xmlhttp/aushang.php?key=" + window.localStorage.getItem("key"));
            document.getElementById("offlineIndicatior").style.visibility = "hidden";
        } catch (e) {
            console.log(e);
            document.getElementById("offlineIndicatior").style.visibility = "visible";
        }

        if (res.status === 200) {
            document.getElementById("offlineIndicatior").style.visibility = "hidden";
            document.getElementById("aushang").innerHTML = AushangParse(await res.json());
        }
        resolve();
    });
}

async function loadDataKlausuren() {
    return new Promise(async (resolve, reject) => {
        let res;
        try {
            res = await fetch("/display/xmlhttp/klausuren.php?key=" + window.localStorage.getItem("key"));
            document.getElementById("offlineIndicatior").style.visibility = "hidden";
        } catch (e) {
            console.log(e);
            document.getElementById("offlineIndicatior").style.visibility = "visible";
        }

        if (res.status === 200) {
            document.getElementById("offlineIndicatior").style.visibility = "hidden";
            document.getElementById("klausuren").innerHTML = klausurenParse(await res.json());
        }
        resolve();
    });

}

function setKey() {
    return new Promise(async (resolve, reject) => {
        document.getElementById("keyInput").style.visibility = "hidden";
        document.getElementById("saveKey").style.visibility = "hidden";
        let keyInput = <HTMLInputElement>document.getElementById("keyInput");
        let key = keyInput.value;
        window.localStorage.setItem("key", key);

        await loadDataVertretungsplan();
        await loadDataAushang();
        await loadDataKlausuren();

        intervalId = setInterval(async () => {
            await loadDataAushang();
            await loadDataKlausuren();
            await loadDataVertretungsplan();
        }, refresh_time);
        resolve();
    });
}


//Initial start for all cycle functions
function start() {
    return new Promise(async (resolve, reject) => {
        //first DataLoad
        await loadDataVertretungsplan();
        await loadDataAushang();
        await loadDataKlausuren();

        //start scrolling of divs
        window.setTimeout("scrolldiv('links')", wait_start);
        window.setTimeout("scrolldiv('rechts')", wait_start);

        //Set interval to pull data
        intervalId = setInterval(async () => {
            await loadDataAushang();
            await loadDataKlausuren();
            await loadDataVertretungsplan();
        }, refresh_time);
        resolve();
    });
}


//Wait for Dom ready
document.addEventListener("DOMContentLoaded", async function (event) {
    await initConnection();
});

