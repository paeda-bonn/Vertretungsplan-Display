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

function AushangParse(data) {
    let content = "";
    for (let entry in data) {
        if (data.hasOwnProperty(entry)) {
            let aushang = data[entry];
            let spalten = false;
            aushang["Content"] = aushang["Content"].replace(/\n/g, "<br />");
            aushang["Content2"] = aushang["Content2"].replace(/\n/g, "<br />");
            if (aushang["spalten"] === "true") {
                spalten = true;
            }
            if (spalten) {
                content = content + '<table border=0 cellpadding=0 cellspacing=0 width=783 style="border-collapse:collapse;table-layout:fixed;width:100%">';
                content = content + '<col width=783 style="mso-width-source:userset;mso-width-alt:28634;width:50%">';
                content = content + '<col width=783 style="mso-width-source:userset;mso-width-alt:28634;width:50%">';
                content = content + '<tr height=24 style="height:18.0pt">';
                content = content + '<td colspan=1 height=24 class="aushang" style=background-color:' + aushang["Color"] + '; width=200 style="height:18.0pt;width:200pt">' + aushang["Content"];
                content = content + '<td colspan=1 height=24 class="aushang" style=background-color:' + aushang["Color"] + '; width=200 style="height:18.0pt;width:200pt">' + aushang["Content2"];
                content = content + '</td></tr></table>';
            } else {
                content = content + '<table border=0 cellpadding=0 cellspacing=0 width=783 style="border-collapse:collapse;table-layout:fixed;width:100%"><col width=783 style="mso-width-source:userset;mso-width-alt:28634;width:100%">';
                content = content + '<tr height=24 style="height:18.0pt">';
                content = content + '<td colspan=1 height=24 class="aushang" style=background-color:' + aushang["Color"] + '; width=200 style="height:18.0pt;width:200pt">' + aushang["Content"];
                content = content + '</td></tr></table>';
            }
        }

    }
    return content;
}

function klausurenParse(data) {
    let content = "";
    let i = 0;
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
                            if (i === 0) {
                                content = content + '<table border=0 cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;width:".$width."px"><tr class="xl74" height="24" style="height:18.0pt"><td style="height:18.0pt;width:70pt"></td><td style="width:70pt"></td><td style="width:40pt"></td><td style="width:5pt"></td><td style="width:47pt"></td><td style="width:30pt"></td><td style="width:30pt"></td><td style="width:30pt"></td><td style="width:30pt"></td><td style="width:30pt"></td><td style="width:30pt"></td><td style="width:30pt"></td></tr>';
                                content = content + '<tr><td colspan="12" class="xl94" style="height:56.25pt">';
                                content = content + 'Der Unterricht bei den aufsichtsf&uuml;hrenden Lehrern findet in den jeweiligen Stunden nicht statt';
                                content = content + '</td></tr>';
                                i = 1;
                            }
                            if (k === 0) {
                                content = content + '<tr><td colspan="12" style="border-bottom:2.0pt double windowtext">&nbsp;</td></tr>';
                                content = content + '<tr style="height:9.0pt"></tr><tr height="24" style="page-break-before:always;height:18.0pt"><td height="24" class="xl68" style="height:18.0pt">' + weekday + '</td><td class="xl70">' + day + '</td><td></td><td></td><td colspan="2" class="xl70">Klausur</td><td></td><td colspan="3" class="xl70">Aufsicht</td></tr>';
                                content = content + '<tr height="24" style="height:18.0pt"><td height="24" class="xl69" style="height:18.0pt">Std.</td><td class="xl69">Kurs</td><td class="xl71">Lehrer</td><td></td><td class="xl69">Raum</td><td class="xl69">1</td><td class="xl69">2</td><td class="xl69">3</td><td class="xl69">4</td><td class="xl69">5</td><td class="xl69">6</td><td class="xl69">7</td></tr>';
                                k = 1;
                            }
                            content = content + '<tr>';
                            content = content + '<td height="24" class="xl78" style="height:18.0pt; color:' + color + '">' + klausur["Std"] + '</td>';
                            if (klausur["Stufe"] == null) {
                                content = content + '<td class="xl78" style="color:' + color + '">' + klausur["Kurs"] + '</td>';
                            } else {
                                content = content + '<td class="xl78" style="color:' + color + '">' + klausur["Stufe"] + ' / ' + klausur["Kurs"] + '</td>';
                            }

                            content = content + '<td class="xl78" style="color:' + color + '">' + klausur["Lehrer"] + '</td>';
                            content = content + '<td class="xl72"></td>';
                            content = content + '<td class="xl74">' + klausur["Raum"] + '</td>';
                            content = content + '<td class="xl74">' + klausur["1"] + '</td>';
                            content = content + '<td class="xl74">' + klausur["2"] + '</td>';
                            content = content + '<td class="xl74">' + klausur["3"] + '</td>';
                            content = content + '<td class="xl74">' + klausur["4"] + '</td>';
                            content = content + '<td class="xl74">' + klausur["5"] + '</td>';
                            content = content + '<td class="xl74">' + klausur["6"] + '</td>';
                            content = content + '<td class="xl74">' + klausur["7"] + '</td>';
                            content = content + '</tr>';
                            console.log(klausur);
                        }
                    }
                    content = content + '<tr style="height:18.0pt"></tr>';
                }
            }
        }
    }
    return content;
}