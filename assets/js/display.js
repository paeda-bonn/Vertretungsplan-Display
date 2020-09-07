/*
 * Copyright (c) 2020.
 */

let wait_start = 5000;
let wait_end = 5000;
let refresh_time = 60000;
let step = 1;
let intervalId = 0;

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

function loadDataVertretungsplan() {
    let key = window.localStorage.getItem("key");
    let xhttpVert = new XMLHttpRequest();
    xhttpVert.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("rechts").innerHTML = VplanParse(xhttpVert.responseText);
            openRequest = false;
        }
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("offlineIndicatior").style.visibility = "hidden";
        }
        if (this.readyState === 4 && this.status === 0) {
            document.getElementById("offlineIndicatior").style.visibility = "visible";
        }
    };
    xhttpVert.open("GET", "xmlhttp/vertretungsplan.php?key=" + key, true);
    xhttpVert.send();
}

function loadDataAushang() {
    let key = window.localStorage.getItem("key");
    let xhttpAushang = new XMLHttpRequest();
    xhttpAushang.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("aushang").innerHTML = AushangParse(xhttpAushang.responseText);
        }
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("offlineIndicatior").style.visibility = "hidden";
        }
        if (this.readyState === 4 && this.status === 0) {
            document.getElementById("offlineIndicatior").style.visibility = "visible";
        }
    };
    xhttpAushang.open("GET", "xmlhttp/aushang.php?key=" + key, true);
    xhttpAushang.send();
}

function loadDataKlausuren() {
    let key = window.localStorage.getItem("key");
    let xhttpKlausuren = new XMLHttpRequest();
    xhttpKlausuren.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            try {
                document.getElementById("klausuren").innerHTML = klausurenParse(xhttpKlausuren.responseText);
            } catch (e) {
                document.getElementById("keyInput").style.visibility = "visible";
                document.getElementById("saveKey").style.visibility = "visible";
                clearInterval(intervalId);
            }

        }
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("offlineIndicatior").style.visibility = "hidden";
        }
        if (this.readyState === 4 && this.status === 0) {
            document.getElementById("offlineIndicatior").style.visibility = "visible";
        }
    };
    xhttpKlausuren.open("GET", "xmlhttp/klausuren.php?key=" + key, true);
    xhttpKlausuren.send();
}

function setKey() {
    document.getElementById("keyInput").style.visibility = "hidden";
    document.getElementById("saveKey").style.visibility = "hidden";
    let key = document.getElementById("keyInput").value;
    window.localStorage.setItem("key", key);

    loadDataVertretungsplan();
    loadDataAushang();
    loadDataKlausuren();

    intervalId = setInterval(function () {
        loadDataAushang();
        loadDataKlausuren();
        loadDataVertretungsplan();
    }, refresh_time);
}


//Initial start for all cycle functions
function start() {

    //first DataLoad
    loadDataVertretungsplan();
    loadDataAushang();
    loadDataKlausuren();

    //start scrolling of divs
    window.setTimeout("scrolldiv('links')", wait_start);
    window.setTimeout("scrolldiv('rechts')", wait_start);

    //Set interval to pull data
    intervalId = setInterval(function () {
        loadDataAushang();
        loadDataKlausuren();
        loadDataVertretungsplan();
    }, refresh_time);
}


//Wait for Dom ready 
document.addEventListener("DOMContentLoaded", function (event) {

    setTimeout(function () {
        document.getElementById("loadScreen").style.display = "none";
        document.getElementById("rechts").style.display = "inherit";
        document.getElementById("links").style.display = "inherit"
    }, 5000);
    start();
});