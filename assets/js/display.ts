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
    return new Promise<void>(async (resolve, reject) => {
        console.log("Phase 2: initialising Data and Layout")
        try {
            await establishConnection();
            console.log("Phase 2: Connection established")

            await start();

            /**
             * Switch View
             */
            setTimeout(() => {
                document.getElementById("loadScreen").style.display = "none";
                document.getElementById("rechts").style.display = "inherit";
                document.getElementById("links").style.display = "inherit";
            }, 5000)

        } catch (e) {

        }
        resolve();
    });
}

function establishConnection() {
    return new Promise<void>(async (resolve, reject) => {

        let success: boolean = false;
        while(!success){
            try {
                console.log("Phase 2: try top connect")
                await ApiConnector.testApiConnection();
                console.log("Successfully connected")
                success = true;
            }catch (e) {
                if (e === 1) {
                    console.log("Phase 2: no connection to the API")
                    let sec = 30;

                    await new Promise<void>(async (resolve, reject) => {
                        document.getElementById('loadingStatus').innerText = "Can´t contact Server - retrying in 30 sec"
                        let intId = setInterval(() => {
                            document.getElementById('loadingStatus').innerText = "Can´t contact Server - retrying in " + sec + " sec"
                            if (sec === 0) {
                                clearInterval(intId);
                                resolve()
                            }
                            sec--;
                        }, 1000);
                    });
                } else if (e === 2) {
                    console.log("Phase 2: auth error")
                    document.getElementById('loadingStatus').innerText = "Error while authentication";
                    document.getElementById("keyInput").style.visibility = "visible";
                    document.getElementById("saveKey").style.visibility = "visible";
                    reject("Auth error");
                } else {
                    console.log(e);
                }
            }
        }
        console.log("Done")
        resolve();
    });
}


async function loadVplan() {
    //TODO set last refreshed
    let container: HTMLDivElement = document.createElement("div");
    let activeDays: string[] = await ApiConnector.loadVplanActiveDays();
    let nowDate = new Date();

    let todayString = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1).toString().padStart(2, "0") + "-" + nowDate.getDate().toString().padStart(2, "0")
    if (!activeDays.includes(todayString) && nowDate.getHours() < 16) {
        activeDays.push(todayString);
    }
    activeDays.sort();

    for (let i = 0; i < activeDays.length; i++) {
        console.log("Got Date: " + activeDays[i])
        let date = activeDays[i];
        if (date != "") {
            let headerContainer = <HTMLDivElement>document.getElementById('vplanHeaderTemplate').cloneNode(true);
            (<HTMLSpanElement>headerContainer.getElementsByClassName('dateContainer').item(0)).innerText = timeDisplay(date);
            container.append(headerContainer);
            let dayContainer = <HTMLDivElement>document.getElementById('vplanTemplate').cloneNode(true);
            dayContainer.id = "Container-" + date;
            container.append(dayContainer);

            let eventsContainer = dayContainer.getElementsByTagName('tbody').item(1);
            eventsContainer.innerHTML = "";
            let events = await ApiConnector.loadVplanByDay(date);

            events.sort(function (e1, e2) {
                if (e1["course"] < e2["course"]) {
                    return -1;
                } else if (e1["course"] > e2["course"]) {
                    return 1;
                } else {
                    if (e1["subject"] < e2["subject"]) {
                        return -1;
                    } else if (e1["subject"] > e2["subject"]) {
                        return 1;
                    } else {
                        if (e1["lesson"] < e2["lesson"]) {
                            return -1;
                        } else if (e1["lesson"] > e2["lesson"]) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                }
            });

            if (todayString == date) {
                for (let j = 0; j < events.length; j++) {
                    let event = events[j];
                    if (lessonTimes[event["lesson"]] < ((nowDate.getHours() * 60) + nowDate.getMinutes())) {
                        events.splice(j, 1);
                        j--;
                    }
                }
            }

            for (let j = 0; j < events.length; j++) {
                let event = events[j];

                if (events[j + 1] != null) {
                    let next = events[j + 1];
                    if (event["date"] == next["date"]) {
                        if (event["course"] == next["course"]) {
                            if (event["subject"] == next["subject"]) {
                                if (event["subjectNew"] == next["subjectNew"]) {
                                    if (event["teacher"] == next["teacher"]) {
                                        if (event["teacherNew"] == next["teacherNew"]) {
                                            if (event["room"] == next["room"]) {
                                                event["lesson"] = event["lesson"] + " / " + next["lesson"];
                                                j++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                let row = <HTMLTableRowElement>document.getElementById('vplanRowTemplate').cloneNode(true);
                eventsContainer.append(row);
                row.getElementsByClassName("lesson").item(0).innerHTML = event["lesson"];
                row.getElementsByClassName("course").item(0).innerHTML = event["course"];
                row.getElementsByClassName("subject").item(0).innerHTML = event["subject"];
                row.getElementsByClassName("newSubject").item(0).innerHTML = event["subjectNew"];
                row.getElementsByClassName("newTeacher").item(0).innerHTML = event["teacherNew"];
                row.getElementsByClassName("newRoom").item(0).innerHTML = event["room"];
                row.getElementsByClassName("info").item(0).innerHTML = event["info"];
            }
        }
    }
    document.getElementById('rechts').innerHTML = container.innerHTML;
}

async function loadDataAushang() {
    return new Promise<void>(async (resolve, reject) => {
        let res;
        try {
            res = await ApiConnector.loadDataAushang();
            document.getElementById("aushangTableBody").innerHTML = AushangParse(res).innerHTML;
            document.getElementById("offlineIndicatior").style.visibility = "hidden";
        } catch (e) {
            console.log(e);
            document.getElementById("offlineIndicatior").style.visibility = "visible";
        }

        resolve();
    });
}

async function loadDataKlausuren() {
    return new Promise<void>(async (resolve, reject) => {
        let res;
        try {
            console.log("KL load")
            res = await ApiConnector.loadDataKlausuren();
            document.getElementById('klausurenTableBody').innerHTML = klausurenParse(res).innerHTML;
            document.getElementById("offlineIndicatior").style.visibility = "hidden";
        } catch (e) {
            console.log(e);
            document.getElementById("offlineIndicatior").style.visibility = "visible";
        }

        if (res.status === 200) {
            document.getElementById("offlineIndicatior").style.visibility = "hidden";

        }
        resolve();
    });

}

function setKey() {
    return new Promise<void>(async (resolve, reject) => {
        document.getElementById("keyInput").style.visibility = "hidden";
        document.getElementById("saveKey").style.visibility = "hidden";
        let keyInput = <HTMLInputElement>document.getElementById("keyInput");
        let key = keyInput.value;
        window.localStorage.setItem("key", key);

        await loadVplan();
        await loadDataAushang();
        await loadDataKlausuren();

        intervalId = setInterval(async () => {
            await loadDataAushang();
            await loadDataKlausuren();
            await loadVplan();
        }, refresh_time);
        window.location.reload();
        resolve();
    });
}


//Initial start for all cycle functions
function start() {
    return new Promise<void>(async (resolve, reject) => {

        //first DataLoad
        await loadVplan();
        await loadDataAushang();
        await loadDataKlausuren();

        //start scrolling of divs
        window.setTimeout("scrolldiv('links')", wait_start);
        window.setTimeout("scrolldiv('rechts')", wait_start);

        //Set interval to pull data
        intervalId = setInterval(async () => {
            await loadDataAushang();
            await loadDataKlausuren();
            await loadVplan();
        }, refresh_time);


        resolve();
    });
}


//Wait for Dom ready
document.addEventListener("DOMContentLoaded", async function (event) {
    console.log("Phase 1: Dom loaded")
    await initConnection();
});

