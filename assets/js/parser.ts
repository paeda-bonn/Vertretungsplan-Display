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

function getWeekday(weekday) {
    const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    return weekdays[weekday - 1];
}

function getMonth(month) {
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    return months[month];
}

function klausurenDatum(datum) {
    let time = datum.split("-");
    let date = new Date(time[1] + "." + time[0] + "." + time[2]);
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    return day + "." + (month + 1) + "." + year;
}

function klausurenGetWeekday(datum) {
    let time = datum.split("-");
    let date = new Date(time[1] + "." + time[0] + "." + time[2]);
    let weekday = date.getDay();
    return getWeekday(weekday);
}

function timeDisplay(time) {
    let timestamp = new Date(time).getTime();
    let date = new Date(timestamp);
    let weekday = date.getDay();
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    return getWeekday(weekday) + ", " + day + ". " + getMonth(month) + " " + year;
}

/**
 * @return {string}
 */
function VplanParse(data) {
    let container = document.createElement('div');

    if (!data.hasOwnProperty("info")) {
        if (!data.info.hasOwnProperty("days")) {
            return container;
        }
    }

    for (let dayKey in data.info["days"]) {
        if (data.info["days"].hasOwnProperty(dayKey)) {
            let day = data.info["days"][dayKey];
            if (data.data["vertretungen"].hasOwnProperty(day)) {
                let prevTeacher = "";
                container.append(createDayHeader(data.data["vertretungen"][day][0]["Datum"]));
                let table = <HTMLTableElement>document.getElementById('vplanTemplate').cloneNode(true)
                container.append(table);

                let tableBody = <HTMLTableSectionElement>table.getElementsByTagName('tbody').item(1);
                tableBody.innerHTML = "";

                let rowTemplate = <HTMLTableRowElement>document.getElementById('vplanRowTemplate');

                for (let entry in data.data["vertretungen"][day]) {
                    let vertretung;
                    if (data.data["vertretungen"][day].hasOwnProperty(entry)) {
                        vertretung = data.data["vertretungen"][day][entry];
                        let teacher = "";

                        if (vertretung["Lehrer"] !== prevTeacher) {
                            teacher = vertretung["Lehrer"];
                            prevTeacher = vertretung["Lehrer"];
                        }
                        let row = <HTMLTableRowElement>rowTemplate.cloneNode(true);

                        //TODO make bold
                        row.getElementsByClassName("teacher").item(0).innerHTML = teacher;
                        row.getElementsByClassName("lesson").item(0).innerHTML = vertretung["Stunde"];
                        row.getElementsByClassName("course").item(0).innerHTML = vertretung["Kurs"];
                        row.getElementsByClassName("subject").item(0).innerHTML = vertretung["Fach"];
                        row.getElementsByClassName("newSubject").item(0).innerHTML = vertretung["FachNew"];
                        row.getElementsByClassName("newTeacher").item(0).innerHTML = vertretung["LehrerNeu"];
                        row.getElementsByClassName("newTeacher").item(0).innerHTML = vertretung["LehrerNeu"];
                        row.getElementsByClassName("newRoom").item(0).innerHTML = vertretung["RaumNew"];
                        row.getElementsByClassName("info").item(0).innerHTML = vertretung["info"];

                        tableBody.append(row);
                    }
                }
            }

            if (data.data["aufsichten"].hasOwnProperty(day)) {
                let aContainer = <HTMLDivElement>document.getElementById('aufsichtenTemplate').cloneNode(true);
                container.append(aContainer);

                aContainer.getElementsByTagName('table').item(0).innerHTML = "";
                let row = <HTMLTableRowElement>document.getElementById('aufsichtRowTemplate').cloneNode(true);
                aContainer.append(row);

                for (let entry in data.data["aufsichten"][day]) {
                    if (data.data["aufsichten"][day].hasOwnProperty(entry)) {
                        let aufsicht = data.data["aufsichten"][day][entry];
                        row.getElementsByTagName('td').item(0).innerText = aufsicht['Zeit'] + ': ' + aufsicht['Ort'] + ' --> ' + aufsicht['Lehrer'];
                    }
                }
            }
        }
    }

    let refreshedIndicator = document.createElement("span");
    refreshedIndicator.innerText = "Letzte Aktualisierung:" + data.info["refreshed"];

    return container;
}

function createDayHeader(date) {

    let table = document.createElement('table');
    table.className = "title";
    let row = document.createElement('tr');
    table.append(row);
    let column = document.createElement('td');
    row.append(column);
    column.innerText = timeDisplay(date);

    return table
}

function AushangParse(data): HTMLDivElement {
    let container = document.createElement('div');

    for (let entry in data) {
        if (data.hasOwnProperty(entry)) {
            let aushang = data[entry];

            let row = <HTMLTableElement> document.getElementById('aushangTableRowTemplate').cloneNode(true);
            container.append(row);
            let contentColumn = <HTMLTableCellElement> row.getElementsByClassName('aushang').item(0);
            contentColumn.style.backgroundColor = aushang["Color"];
            contentColumn.innerText = aushang["Content"];

            if (aushang["spalten"] === "true") {
                contentColumn.colSpan = 1

                let contentColumnTwo = <HTMLTableCellElement> contentColumn.cloneNode(true);
                row.append(contentColumnTwo);

                contentColumnTwo.innerText = aushang["Content2"];
                contentColumnTwo.colSpan = 1
            }
        }
    }
    return container;
}

function klausurenParse(data) {

    let container = <HTMLTableSectionElement>document.createElement('tbody');

    for (let date in data) {
        if (data.hasOwnProperty(date)) {
            let weekday;
            let day;
            for (let grade in data[date]) {
                if (data[date].hasOwnProperty(grade)) {
                    for (let entry in data[date][grade]) {
                        if (data[date][grade].hasOwnProperty(entry)) {
                            day = klausurenDatum(data[date][grade][entry]["Datum"]);
                            weekday = klausurenGetWeekday(data[date][grade][entry]["Datum"]);
                        }
                    }
                }
            }

            let k = 0;
            for (let grade in data[date]) {
                if (data[date].hasOwnProperty(grade)) {
                    for (let entry in data[date][grade]) {
                        if (data[date][grade].hasOwnProperty(entry)) {
                            let klausur = data[date][grade][entry];
                            let color = "#000000";
                            if (klausur["Stufe"] === "EF") {
                                color = "#C00000";
                            } else if (klausur["Stufe"] === "Q2") {
                                color = "#00B050";
                            } else if (klausur["Stufe"] === "Q1") {
                                color = "#0000C0";
                            }

                            if (k === 0) {
                                let dayHeader = <HTMLTableSectionElement>document.getElementById('klausurenDayHeaderTemplate').cloneNode(true);
                                container.append(dayHeader)

                                dayHeader.getElementsByClassName('weekday').item(0).innerHTML = weekday;
                                dayHeader.getElementsByClassName('date').item(0).innerHTML = day;
                                k = 1;
                            }

                            let eventRow = <HTMLTableRowElement>document.getElementById('klausurenRowTamplate').cloneNode(true);
                            container.appendChild(eventRow);

                            let timeFrameTd = <HTMLTableRowElement>eventRow.getElementsByClassName("timeframe").item(0);
                            let courseTd = <HTMLTableRowElement>eventRow.getElementsByClassName("course").item(0);
                            let teacherTd = <HTMLTableRowElement>eventRow.getElementsByClassName("teacher").item(0);
                            let roomTd = <HTMLTableRowElement>eventRow.getElementsByClassName("room").item(0);
                            let r1Td = <HTMLTableRowElement>eventRow.getElementsByClassName("r1").item(0);
                            let r2Td = <HTMLTableRowElement>eventRow.getElementsByClassName("r2").item(0);
                            let r3Td = <HTMLTableRowElement>eventRow.getElementsByClassName("r3").item(0);
                            let r4Td = <HTMLTableRowElement>eventRow.getElementsByClassName("r4").item(0);
                            let r5Td = <HTMLTableRowElement>eventRow.getElementsByClassName("r5").item(0);
                            let r6Td = <HTMLTableRowElement>eventRow.getElementsByClassName("r6").item(0);
                            let r7Td = <HTMLTableRowElement>eventRow.getElementsByClassName("r7").item(0);

                            timeFrameTd.style.color = color;
                            courseTd.style.color = color;
                            teacherTd.style.color = color;

                            timeFrameTd.innerText = klausur["Std"];
                            teacherTd.innerHTML = klausur["Lehrer"];
                            roomTd.innerHTML = klausur["Raum"];
                            r1Td.innerHTML = klausur["1"];
                            r2Td.innerHTML = klausur["2"];
                            r3Td.innerHTML = klausur["3"];
                            r4Td.innerHTML = klausur["4"];
                            r5Td.innerHTML = klausur["5"];
                            r6Td.innerHTML = klausur["6"];
                            r7Td.innerHTML = klausur["7"];
                            if (klausur["Stufe"] == null) {
                                courseTd.innerText = klausur["Kurs"];
                            } else {
                                courseTd.innerText = klausur["Stufe"] + ' / ' + klausur["Kurs"];
                            }
                        }
                    }
                    container.append(document.getElementById('gradeSpaceholderTemplate').cloneNode(true));
                }
            }
        }
    }
    return container;
}