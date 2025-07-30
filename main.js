//main.js
/*
    TODO:
    - die großen .addEventListener in function umwandeln
    - Excel Tabelle erweitern 
        - Kalendarische übersicht für jeden Mitarbeiter
        - Feiertage in der Tabelle anzeigen
        - Übersicht mit mehr Daten wie z.B. Anzahl der Schichten pro Mitarbeiter
        - Metadaten wie Erstellungsdatum, Ersteller, Version
    
    DONE:
        - Bundesland disable if team in local storage is not empty und save Bundesland in .team 
        - Feiertage überprüfen
        - Bugfix: Versionskontrolle nur alert wenn online Version größer ist als aktuelle
        - Bugfix: letzte Feiertage wurden nicht angezeigt
        - Bugfix: correct display of holiday
        - Bugfix: gernerated Plan was wrong (ignored holidays)
*/


/*-------------------Globale Variable und Konstanten -------------------*/
// global Variablen
let globalEmployeesData = "TEAM.team"; // Local Storage Key für default Mitarbeiterdaten
let currentEditIndex = null; // Aktueller Index für den zu bearbeitenden Mitarbeiter
let vacations = []; // Array für Urlaubsanträge

//global Konstanten
const dataUrl = "https://github.com/Dirty69Darry/Bereitschaftsplaner_Web"; // URL zum Repository
const versionUrl = "https://raw.githubusercontent.com/Dirty69Darry/Bereitschaftsplaner_Web/main/meta.json"; // URL zur Versionskontrolle

const currentVersion = "0.2.4"; // Aktuelle Version der Anwendung

const openBtn  = document.getElementById('openModal');
const closeBtn = document.getElementById('closeModal');
const addOverlay  = document.getElementById('addOverlay');
const addWindow  = document.getElementById('addWindow');
const form     = document.getElementById('employeeForm');

const openEditBtn  = document.getElementById('openEditModal');
const closeEditBtn = document.getElementById('closeEditModal');
const editOverlay  = document.getElementById('editOverlay');
const editWindow  = document.getElementById('editWindow');
const editform     = document.getElementById('EditForm');

// Feiertage
const holidays = [
    "Neujahr", //0
    "Heilige Drei Könige", //1
    "Internationaler Frauentag", //2
    "Karfreitag", //3
    "Ostersonntag", //4
    "Ostermontag",  //5
    "Tag der Arbeit", //6
    "Christi Himmelfahrt", //7
    "Pfingstensonntag", //8
    "Pfingstmontag",    //9
    "Fronleichnam", //10
    "Mariä Himmelfahrt", //11
    "Weltkindertag",    //12
    "Tag der Deutschen Einheit",   //13
    "Reformationstag",  //14
    "Allerheiligen",    //15
    "Buß- und Betttag",    //16
    "Weihnachten",      //17
    "1. Weihnachtstag", //18
    "2. Weihnachtstag", //19
    "Silvester"        //20
];

// Feiertage in Bundesländern
const Bundeslaender = {
    BW: {
        name: "Baden-Württemberg",
        holidays: [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 13, 15, 17, 18, 19, 20]
    },
    BY: {
        name: "Bayern",
        holidays: [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 18, 19, 20]
    },
    BE: {
        name: "Berlin",
        holidays: [0, 2, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20]
    },
    BB: {
        name: "Brandenburg",
        holidays: [0, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20]
    },
    HB: {
        name: "Bremen",
        holidays: [0, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20]
    },
    HH: {
        name: "Hamburg",
        holidays: [0, 3, 4, 5, 6, 7, 8, 9, 13, 18, 17, 19, 20]
    },
    HE: {
        name: "Hessen",
        holidays: [0, 3, 4, 5, 6, 7, 8, 9, 10, 13, 17, 18, 19, 20]
    },
    MV: {
        name: "Mecklenburg-Vorpommern",
        holidays: [0, 2, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20]
    },
    NI: {
        name: "Niedersachsen",
        holidays: [0, 3, 4, 5, 6, 7, 8, 9, 13, 17, 18, 19, 20]
    },
    NW: {
        name: "Nordrhein-Westfalen",
        holidays: [0, 3, 4, 5, 6, 7, 8, 9, 10, 13, 15, 17, 18, 19, 20]
    },
    RP: {
        name: "Rheinland-Pfalz",
        holidays: [0, 3, 4, 5, 6, 7, 8, 9, 10, 13, 15, 17, 18, 19, 20]
    },
    SL: {
        name: "Saarland",
        holidays: [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 18, 19, 20]
    },
    SN: {
        name: "Sachsen",
        holidays: [0, 3, 4, 5, 6, 7, 8, 9, 13, 14, 16, 17, 18, 19, 20]
    },
    ST: {
        name: "Sachsen-Anhalt",
        holidays: [0, 1, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20]
    },
    SH: {
        name: "Schleswig-Holstein",
        holidays: [0, 3, 4, 5, 6, 7, 8, 9, 13, 17, 18, 19, 20]
    },
    TH: {
        name: "Thüringen",
        holidays: [0, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20]
    }
};

/*--------------------Main-Event und Organisation----------------------------- */
// Event-Listener Main
window.addEventListener('DOMContentLoaded', () => {
    const stateSelect = document.getElementById("stateSelect");
    if (getTeamFromLocalStorage().teamKey != null) {
        globalEmployeesData = getTeamFromLocalStorage().teamKey; // Setzt den globalen Schlüssel für Mitarbeiterdaten
        document.getElementById("titleTeamName").textContent = globalEmployeesData.split('.team')[0]; // Setzt den Titel des Teamnamens
        console.log("Team aus Local Storage geladen:", globalEmployeesData);
        stateSelect.value = localStorage.getItem("selectedState" || "none");
    }
    else {
        console.log("Kein Team in Local Storage gefunden. Erstelle neues Team.");
        document.getElementById("titleTeamName").textContent = "Neues Team"; // Setzt den Titel des Teamnamens
        stateSelect.value = "none";
    }
    const stored = getEmployees(getTeamFromLocalStorage().teamKey) || [];
    stored.forEach(emp => receiveEmployee(emp));
    showEmployees(); // Mitarbeiter anzeigen
    checkVersion(); // Überprüft die Version

    //Bundesland auswählen und nicht nachher änderbar 

    if(stateSelect.disabled == false && stateSelect.value == "none"){
        toggleActionButtons();
    }
    if (localStorage.getItem("selectedState") !== null){
        stateSelect.value = localStorage.getItem("selectedState");
        stateSelect.disabled = true;
    }
});

// Überprüft die Version
async function checkVersion() {
        document.getElementById("version-label").innerHTML = `aktuelle Version: <a href = ${dataUrl} target ="_blank">${currentVersion}</a>`;

        const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(versionUrl)}`;
        fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("Fehler beim Abrufen der Remote-Version");
            return response.json();
        })
        .then(data => {
            const remote = JSON.parse(data.contents);
            const remoteVersion = remote.version;

            if (remoteVersion > currentVersion) {
            alert(`Neue Version verfügbar: ${remoteVersion} (aktuell: ${currentVersion})`);
            }
        })
        .catch(error => {
            console.error("Versionsprüfung fehlgeschlagen:", error);
        });
}

//enable/disable Action-Buttons
function toggleActionButtons(){
    const stateSelect = document.getElementById("stateSelect");
    const div = document.getElementById("action-buttonsID");
    if(stateSelect.value == "none" ){
        div.classList.add("disabled");
        div.querySelectorAll("button").forEach(
            btn => btn.disabled = true
        );
    }
    else{
        div.classList.remove("disabled");
        div.querySelectorAll("button").forEach(
            btn => btn.disabled = false
        );
    }
}

function openBugReport() {
    const title = encodeURIComponent("Bug Report: [Kurze Fehlerbeschreibung]");
    const body = encodeURIComponent(
        "" +
        "Bitte beschreiben Sie den Fehler hier:\n\n" +
        "---\n" +
        "Technische Details:\n" +
        `Datum: ${new Date().toLocaleString()}\n` +
        `Browser: ${navigator.userAgent}\n` +
        `Plattform: ${navigator.platform}\n`+
        `Version: ${currentVersion}\n` +
        "---\n\n" 
    );

    //window.open(dataUrl +'/issues/new?template=bug_report.md');
    window.open (dataUrl + '/issues/new?title=' + title + '&body=' + body, "_blank");
}

/*--------------------Feiertage und Urlaub----------------------------- */
// Berechnet das Datum von Ostersonntag
function calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);  // 3=Mar, 4=Apr
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

function calculateFirstAdvent(year){
    const christmas = new Date(year, 11, 25); //4ter Advent und Heiligabend können den selben Tag haben
    let firstAdvent = new Date(christmas);
    let sundaysCount = 0;

    for (let index = 0 ; sundaysCount < 4 && index <= 31 ;index++){
        firstAdvent.setDate(firstAdvent.getDate() -1);
        if (firstAdvent.getDay === 0){ // Sunday = 0
            sundaysCount++;
        }
    }

    return firstAdvent;
}

function getHolidays(year) {
    const easter = calculateEaster(year);
    const firstAdvent = calculateFirstAdvent(year);
    const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
    const format = date => formatDateGerman(date);

    let currentHolidays = [];

        const allHolidays = [
        {index: 0, name: holidays[0], date: format(new Date(year, 0, 1)) }, //Neujahr
        {index: 1, name: holidays[1], date: format(new Date(year, 0, 6) ) }, //Heilige drei Könige
        {index: 2, name: holidays[2], date: format(new Date(year, 2, 8)) }, // Frauentag
        {index: 3, name: holidays[3], date: format(addDays(easter, -2)) }, //Karfreitag
        {index: 4, name: holidays[4], date: format(addDays(easter, 0)) }, //Ostersonntag
        {index: 5, name: holidays[5], date: format(addDays(easter, 1)) }, //Ostermontag
        {index: 6, name: holidays[6], date: format(new Date(year, 4, 1)) }, //Tag der Arbeit
        {index: 7, name: holidays[7], date: format(addDays(easter, 40)) }, //Himmelfahrt
        {index: 8, name: holidays[8], date: format(addDays(easter, 50)) }, //Pfingstsonntag
        {index: 9, name: holidays[9], date: format(addDays(easter, 51)) }, //Pfingstmontag
        {index: 10, name: holidays[10], date: format(addDays(easter, 60)) }, //Frohnleichnam
        {index: 11, name: holidays[11], date: format(new Date(year, 7, 15)) }, //Maria Himmelfahrt
        {index: 12, name: holidays[12], date: format(new Date(year, 8, 20)) }, //Kindertag
        {index: 13, name: holidays[13], date: format(new Date(year, 9, 3)) }, //Tag der deutschen Einheit
        {index: 14, name: holidays[14], date: format(new Date(year, 9, 31)) }, //Reformationstag
        {index: 15, name: holidays[15], date: format(new Date(year, 10, 1)) }, //Allerheiligen
        {index: 16, name: holidays[16], date: format(addDays(firstAdvent, -11)) }, //Buß- und Bettag
        {index: 17, name: holidays[17], date: format(new Date(year, 11, 24)) }, //HeiligAbend
        {index: 18, name: holidays[18], date: format(new Date(year, 11, 25)) }, //Erster X-Mas Tag 
        {index: 19, name: holidays[19], date: format(new Date(year, 11, 26)) }, //Zweiter X-Mas Tag
        {index: 20, name: holidays[20], date: format(new Date(year, 11, 31)) } //Silvester
    ];

    if (localStorage.getItem("selectedState")){
        const inState = localStorage.getItem("selectedState")
        for (let index = 0; index < Bundeslaender[inState].holidays.length; index++) {
            currentHolidays.push(allHolidays[Bundeslaender[inState].holidays[index]]);
            //console.log("Bundesland: ",Bundeslaender[inState].holidays[index]);
        }
    }
    return currentHolidays;

}

function addVacation(ev, startName, endName, vacTableName) {
    ev.preventDefault(); // Verhindert das Standardverhalten des Buttons
    
    const startInput = document.getElementById(startName);
    const endInput = document.getElementById(endName);
    
    if (!startInput || !endInput) {
        console.error("Eingabefelder #vacStart/#vacEnd nicht gefunden");
        return;
    }

    const startVal = startInput.value;
    const endVal = endInput.value;

    const startDate = new Date(startVal);
    const endDate   = new Date(endVal);

    if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
        alert("Ungültige Datumsangabe.");
        return;
    }

    vacations.push({ start: startVal, end: endVal });
    updateVacationTable(vacTableName);
}

function updateVacationTable(vacTableName) {
    console.log("Aktualisiere Urlaubstabelle:", vacTableName);
    if (!vacTableName) {
        console.error("vacTableName ist nicht definiert.");
        return;
    }
    const tbody = document.querySelector(`#${CSS.escape(vacTableName)} tbody`);
    // Alten Inhalt löschen
    tbody.innerHTML = "";

    // Delete‑Listener einmalig per Delegation binden
    if (!tbody.__hasDeleteListener) {
        tbody.addEventListener("click", e => {
        const btn = e.target;
        if (!btn.classList.contains("deleteBtn")) return;
        const idx = parseInt(btn.dataset.index, 10);
        vacations.splice(idx, 1);
        updateVacationTable(vacTableName);
        });
        tbody.__hasDeleteListener = true;
    }

    vacations.forEach((vac, idx) => {

        const tr = document.createElement("tr");
        const d1 = new Date(vac.start);
        const d2 = new Date(vac.end);

        tr.innerHTML = `
        <td>${formatDateGerman(d1)}</td>
        <td>${formatDateGerman(d2)}</td>
        <td><button class="deleteBtn" data-index="${idx}">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteVacation(index) {
    vacations.splice(index, 1);
    updateVacationTable();
}

function formatDateGerman(date) {
    let realdate = new Date(date);
    return realdate.toLocaleDateString('de-DE');
}

function isSameDayMonth(date1, date2) {
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth();
}

function initHolidayTable(holTable) {
    console.log("Initialisiere Feiertagstabelle:", holTable);
    if (!holTable) {
        console.error("holTable ist nicht definiert.");
        return;
    }
    // Lese das employees-Array aus dem localStorage
    const employees = JSON.parse(localStorage.getItem(globalEmployeesData) || "[]");
    let employee = employees[currentEditIndex] || {};
    let holValue = null;
    const thisholidays = Bundeslaender[document.getElementById("stateSelect").value]; // Aktuell ausgewähltes Bundesland

    if (!thisholidays || !thisholidays.holidays || thisholidays.holidays.length === 0) {return console.error("Keine Feiertage für das ausgewählte Bundesland gefunden.");}


    const table = document.getElementById(holTable);
    for (const h of thisholidays.holidays) {
        const row = table.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.innerText = holidays[h]; // Feiertagsname
        holValue = (employee.lastOnHolidayYear && employee.lastOnHolidayYear[holidays[h]]) ? employee.lastOnHolidayYear[holidays[h]] : null;
        cell2.innerHTML = `<input type="number" placeholder="Jahr" value="${holValue}" style="width:80px;" min="1999"  max="2100" step="1" pattern="\\d{4}"  title="Bitte vierstellige Jahreszahl (z. B. 2025) eingeben"">`;
    }
}

/* --------------------Mitarbeiterverwaltung----------------------------- */

function getEmployees(employeesData) {
    if (employeesData) {
        try {
            return JSON.parse(localStorage.getItem(employeesData)) || [];
        } catch (error) {
            console.error('Fehler beim Parsen der Mitarbeiterdaten:', error);
            return null;
        }
    } else {
        console.log('Keine Mitarbeiterdaten im Local Storage gefunden.');
        return null;
    }
}

function setEmployees(employeesData ,employees) {
    if (!Array.isArray(employees)) {
        console.error('setEmployees erwartet ein Array von Mitarbeitern.');
        return;
    }
    localStorage.setItem(employeesData, JSON.stringify(employees));
    console.log('Mitarbeiter erfolgreich gespeichert:', employees);
}

function loadEmployees() {
    const employeesData = getEmployees(globalEmployeesData);
    
    if (employeesData) {
        try {
            console.log('Mitarbeiter gefunden:', employeesData);
            return employeesData;
        } catch (error) {
            console.error('Fehler beim Parsen der Employees-Daten:', error);
            return null;
        }
    } else {
        console.log('Keine Employees-Daten im Local Storage gefunden.');
        return null;
    }
}

function showEmployees() {
    const employees = loadEmployees();
    const table = document.getElementById("employeeTable").querySelector("tbody");
    if (!employees) {
        console.error("Keine Mitarbeiterdaten gefunden.");
        table.innerHTML = ""; // leeren
        return;
    }

    table.innerHTML = ""; // leeren

    employees.forEach(employee => {
        const row = document.createElement("tr");
        row.classList.add("clickable");

        const nameCell1 = document.createElement("td");
        nameCell1.textContent = employee.firstName;
        row.appendChild(nameCell1);

        const nameCell2 = document.createElement("td"); 
        nameCell2.textContent = employee.lastName;
        row.appendChild(nameCell2);

        [nameCell1, nameCell2].forEach(cell => {
            cell.addEventListener("click", () => {
                console.log(`Mitarbeiter ausgewählt: ${employee.firstName} ${employee.lastName} (ID: ${employee.id})`);
                openEditModal(row.rowIndex - 1); // rowIndex - 1, da die erste Zeile die Header-Zeile ist
            });
        });

        table.appendChild(row);
    });
}

function checkIfAdded() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('added') === 'true') {
        alert('Employee wurde erfolgreich hinzugefügt!');
    }
}

function receiveEmployee(employee) {
    // Tabelle updaten
    const tbody = document.querySelector('#employeeTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `<td>${employee.firstName}</td><td>${employee.lastName}</td>`;
    tbody.appendChild(row);
}

/*-----------------------Bereitschaftsplangenerator------------------------- */

async function createShiftPlan() {
    const employees = getEmployees(globalEmployeesData);
    if (localStorage.getItem('shiftPlan') != null) {
    localStorage.removeItem('shiftPlan'); // Entferne den alten Plan, wenn vorhanden
    }
    await openPlanModal(employees);
    renderPlan();   
}

// Öffnet das Plan-Modal
function openPlanModal(employees) {
    return new Promise((resolve) => {
        const modal = document.getElementById('planOverlay');
        let plan = []; // Initialisiere den Plan
        modal.style.display = 'block';

        document.getElementById('planForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const startDateStr = document.getElementById('startDate').value;
            const endDateStr = document.getElementById('endDate').value;
            const periodLength = parseInt(document.getElementById('periodLength').value);
            const employeesPerShift = parseInt(document.getElementById('employeesPerShift').value);

            const startDate = new Date(startDateStr);
            let endDate = new Date(endDateStr);

            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            const fullPeriods = Math.ceil(totalDays / periodLength);
            const adjustedEndDate = new Date(startDate);
            adjustedEndDate.setDate(startDate.getDate() + fullPeriods * periodLength - 1);

            if (adjustedEndDate.getTime() !== endDate.getTime()) {
                alert(`Das Enddatum wurde auf den ${adjustedEndDate.toLocaleDateString()} angepasst, um volle Perioden zu gewährleisten.`);
                endDate = adjustedEndDate;
            }
            // Plan generieren mit den neuen Parametern
            plan = generatePlan(employees, startDate, endDate, periodLength, employeesPerShift);
            console.log("Generierter Plan:", plan);
            modal.style.display = 'none'; // Schließt das Modal
            resolve(plan); // Gibt den generierten Plan zurück

        });
        document.getElementById('closePlanModal').addEventListener('click', function() {
            modal.style.display = 'none';
        });
    });
}

// Plan-Generator
function generatePlan(employees, startDate, endDate, periodLength = 7, employeesPerShift = 1) {
    const assignments = [];
    if (!employees.length || startDate >= endDate) return assignments;

    let periodStart = new Date(startDate);
    let ordered = [...employees];

    while (periodStart <= endDate) {
        let periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + periodLength - 1);
        if (periodEnd > endDate) periodEnd = new Date(endDate);
        let assignedThisPeriod = [];
        for (let i = 0; i < employeesPerShift; i++) {
            let found = false;
            for (let j = 0; j < ordered.length; j++) {
                const employee = ordered[j];
                if (assignedThisPeriod.includes(employee.id)) continue;
                if (getAvailableEmployee(employee, periodStart, periodEnd) !== null) {
                    assignments.push({
                        employeeId: employee.id,
                        firstName: employee.firstName,
                        lastName: employee.lastName,
                        startShiftDate: new Date(periodStart),
                        endShiftDate: new Date(periodEnd)
                    });
                    ordered.push(ordered.splice(j, 1)[0]);
                    assignedThisPeriod.push(employee.id)
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw new Error(`Ab dem ${periodStart.toLocaleDateString()} steht kein freier Mitarbeiter zur Verfügung.`);
            }
        }
        periodStart.setDate(periodStart.getDate() + periodLength);
    }

    localStorage.setItem('shiftPlan', JSON.stringify(assignments));
    return assignments;
}


function getNextAvailableEmployee(employees, periodStart, periodEnd)  {
    for (const emp of employees) {

        const score = getAvailableEmployee(emp, periodStart, periodEnd);
        if (score !== null) {
            return emp;
        }
    }
    return null;
}

function getAvailableEmployee(emp, periodStart, periodEnd) {
    //sicherstellen, dass Datumsformat verwendet wird
    if (!(periodStart instanceof Date)) periodStart = new Date(periodStart);
    if (!(periodEnd instanceof Date)) periodEnd = new Date(periodEnd);
    const startYear = new Date(periodStart).getFullYear();
    const endYear = new Date(periodEnd).getFullYear();

console.log("startperiod:", periodStart,"// endPeriod: ", periodEnd);

    // Urlaub prüfen
    const onVacation = emp.vacations.some(v => {
        const vStart = new Date(v.start);
        const vEnd = new Date(v.end);
        return vStart <= periodEnd && vEnd >= periodStart;
    });

    if (onVacation) return null; // Konflikt mit Urlaub

    // Feiertagsprüfung
    const holidaysThisYear = getHolidays(startYear);
    const lastYear = holidaysThisYear.some(h => {
        const hDate = new Date(h.date);
        //console.log(hDate, ">=", periodStart ,"&&", hDate, "<=", periodEnd);
        if (hDate >= periodStart && hDate <= periodEnd) {
        return Object.entries(emp.lastOnHolidayYear || {}).some(([, year]) => {
            const lastYearHoliday = getHolidays(year).find(h2 => isSameDayMonth(new Date(h2.date), hDate));
            return lastYearHoliday && year === startYear - 1;
        });
        }
        return null;
    });
    if (lastYear) {
        return null; //Konflikt mit Feiertag
    }
    //console.log("Vacation: ", onVacation);
    //console.log("Holiday: ", lastYear," -> ", emp.lastOnHolidayYear);
    return 1;
    
}

function mapDateToHolidayType(date) {
    // Beispiel: Key als "MM-DD"
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${mm}-${dd}`;
}

function renderPlan() {
    if (localStorage.getItem('shiftPlan') != null) {
        console.log("Rendering shift plan...");
        const plan = JSON.parse(localStorage.getItem('shiftPlan'));
        const container = document.getElementById('planContent');
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const header = ['Von', 'Bis', 'Bereitschaft'];
        const tr = document.createElement('tr');
        header.forEach(text => { const th = document.createElement('th'); th.textContent = text; tr.appendChild(th); });
        thead.appendChild(tr);
        table.appendChild(thead);
        table.id ='shiftPlanTable';
        const tbody = document.createElement('tbody');
        plan.forEach(e => {
            const row = document.createElement('tr');
            ['startShiftDate','endShiftDate'].forEach(key => { const td=document.createElement('td'); td.textContent=formatDateGerman(e[key]); row.appendChild(td); });
            const td = document.createElement('td'); td.textContent = e ? `${e.firstName} ${e.lastName}` : 'Kein verfügbar'; row.appendChild(td);
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        container.innerHTML=''; container.appendChild(table);
    } else {
        alert("Es gibt keinen Bereitschaftsplan zum Anzeigen. Bitte erstellen Sie zuerst einen Plan.");
    }
}

/*--------------------Export-Plan----------------------------------- */

function startOfDay(date) { const d = new Date(date); d.setHours(0,0,0,0); return d; }
function endOfDay(date)   { const d = new Date(date); d.setHours(23,59,59,999); return d; }
function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function toISODate(d) { return d.toISOString().slice(0,10); }
function weekdayMon0(d) { return (d.getDay() + 6) % 7; } // Mo=0 ... So=6
const WEEKEND_JS = new Set([5,6]); // Sa=5, So=6 bei weekdayMon0

/*====================== Gruppierung und Jahre ============================================*/
function makeMonthGrid(year, month0, markedDatesInput, holidayDatesInput) {
    const markedSet = (markedDatesInput instanceof Set)? markedDatesInput: new Set(markedDatesInput || []);
    const holidaysSet = (holidayDatesInput instanceof Set)? holidayDatesInput: new Set(holidayDatesInput || []);

    const monthNames = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
    const grid = {
        title: `${monthNames[month0]} ${year}`,
        header: ['Mo','Di','Mi','Do','Fr','Sa','So'],
        rows: Array.from({length: 6}, () => Array.from({length: 7}, () => ({ text: '', styleId: 'normal' })))
    };

    const first = new Date(year, month0, 1);
    const last = new Date(year, month0 + 1, 0);
    let col = weekdayMon0(first); // 0..6
    let row = 0;

    for (let day=1; day<=last.getDate(); day++) {
        const d = new Date(year, month0, day);
        const iso = toISODate(d);
        const isWE = WEEKEND_JS.has(weekdayMon0(d));
        const isMarked = markedSet.has(iso);
        const isHoliday = holidaysSet.has(iso);

        let style = 'normal';
        if (isHoliday && isMarked && isWE) style = 'holidayShiftWeekend';
        else if (isHoliday && isMarked)    style = 'holidayShift';
        else if (isHoliday && isWE)        style = 'holidayWeekend';
        else if (isMarked && isWE)         style = 'shiftWeekend';
        else if (isHoliday)                style = 'holiday';
        else if (isMarked)                 style = 'shift';
        else if (isWE)                     style = 'weekend';

        grid.rows[row][col] = { text: String(day), styleId: style };

        col++;
        if (col > 6) { col = 0; row++; }
    }

    return grid;
}


function* daysInclusive(s, t) {
    let d = new Date(s); d.setHours(0,0,0,0);
    const end = new Date(t); end.setHours(0,0,0,0);
    while (d <= end) { yield new Date(d); d.setDate(d.getDate()+1); }
}

function yearsCovered(entries) {
    let min=Infinity, max=-Infinity;
    for (const e of entries) {
        const s = new Date(e.startShiftDate);
        const t = new Date(e.endShiftDate);
        if (Number.isFinite(s.getTime())) min = Math.min(min, s.getFullYear());
        if (Number.isFinite(t.getTime())) max = Math.max(max, t.getFullYear());
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
    const out=[]; for (let y=min;y<=max;y++) out.push(y); return out;
}

function groupByEmployee(entries) {
    const map = new Map();
    for (const e of entries) {
        const name = `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || 'Unbenannt';
        if (!map.has(name)) map.set(name, []);
        map.get(name).push(e);
    }
    return map;
}

function escapeXml(text) {
    return String(text)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function sanitizeSheetName(name) {
    const bad = /[\\/?*:[\]]/g;
    let out = (name || 'Mitarbeiter').replace(bad, ' ');
    if (out.length > 31) out = out.slice(0, 31);
    return out.trim() || 'Mitarbeiter';
    }


/* ===================== SpreadsheetML: XML-Bausteine ===================== */

function buildWorkbookHeader() {
    return `<?xml version="1.0"?>
        <?mso-application progid="Excel.Sheet"?>
        <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:html="http://www.w3.org/TR/REC-html40">`;
}

function buildStyles() {
    return `
        <Styles>
            <Style ss:ID="Default" ss:Name="Normal">
            <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
            <Font ss:FontName="Calibri" ss:Size="11"/>
            </Style>
            <Style ss:ID="header">
            <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
            <Interior ss:Color="#D9E1F2" ss:Pattern="Solid"/>
            </Style>
            <Style ss:ID="normal">
            <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
            <Font ss:FontName="Calibri" ss:Size="11"/>
            </Style>
            <Style ss:ID="weekend">
            <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
            <Font ss:FontName="Calibri" ss:Size="11"/>
            <Interior ss:Color="#FFFF99" ss:Pattern="Solid"/>
            </Style>
            <Style ss:ID="shift">
            <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
            <Font ss:FontName="Calibri" ss:Size="11"/>
            <Interior ss:Color="#9BC2E6" ss:Pattern="Solid"/>
            </Style>
            <Style ss:ID="shiftWeekend">
            <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
            <Font ss:FontName="Calibri" ss:Size="11"/>
            <Interior ss:Color="#F4B183" ss:Pattern="Solid"/>
            </Style>
            <Style ss:ID="holiday">
            <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
            <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
            </Style>
            <Style ss:ID="holidayWeekend">
            <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
            <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
            <Interior ss:Color="#FFFF99" ss:Pattern="Solid"/>
            </Style>
            <Style ss:ID="holidayShift">
            <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
            <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
            <Interior ss:Color="#9BC2E6" ss:Pattern="Solid"/>
            </Style>
            <Style ss:ID="holidayShiftWeekend">
            <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
            <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
            <Interior ss:Color="#F4B183" ss:Pattern="Solid"/>
            </Style>
            <Style ss:ID= "legend">
            <Alignment ss:Vertical="Center" ss:Horizontal="Left"/>
            <Font ss:FontName="Calibri" ss:Size="9"/>
            </Style>
        </Styles>`;
}

function worksheetOptionsA4() {
    return `
        <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
            <PageSetup>
            <Layout Orientation="Portrait"/>
            <Header x:Margin="0.3"/>
            <Footer x:Margin="0.3"/>
            <PageMargins x:Bottom="0.4" x:Left="0.3" x:Right="0.3" x:Top="0.4"/>
            </PageSetup>
            <Print>
            <ValidPrinterInfo/>
            <PaperSizeIndex>9</PaperSizeIndex> <!-- 9 = A4 -->
            <FitWidth>1</FitWidth>
            <FitHeight>1</FitHeight>
            <HorizontalResolution>300</HorizontalResolution>
            <VerticalResolution>300</VerticalResolution>
            </Print>
        </WorksheetOptions>`;
}

function buildColumns(count, width) {
    let cols = '';
    for (let block = 0; block < count; block++) {
        for (let d = 0; d < 7; d++) cols += `<Column ss:Width="${width}"/>`;
        if (block < 2) cols += `<Column ss:Width="${width}"/>`;
    }
    return cols;
}

/* ===================== Worksheets erzeugen ===================== */

function buildMainSheetXML(entries) {
    let tableXml = '<Table>' + buildColumns(2, 120) + buildColumns(1, 200);

    // Header
    tableXml += `
    <Row>
        <Cell ss:StyleID="header"><Data ss:Type="String">Start</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Ende</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Name</Data></Cell>
    </Row>`;

    // Daten
    for (const e of entries) {
        const name = `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim();
        tableXml += `<Row>
        <Cell><Data ss:Type="String">${escapeXml(formatDateGerman(e.startShiftDate))}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(formatDateGerman(e.endShiftDate))}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(name)}</Data></Cell>
        </Row>`;
    }

    tableXml += '</Table>';

    return `
    <Worksheet ss:Name="Bereitschaftsplan">
        ${tableXml}
        ${worksheetOptionsA4()}
    </Worksheet>`;
}

function buildEmployeeSheetXML(employeeName, items) {
    const safeName = sanitizeSheetName(employeeName);

    // Einsatztage sammeln
    const years = yearsCovered(items);
    const markedByYear = new Map();
    for (const y of years) markedByYear.set(y, new Set());
    for (const it of items) {
        const s = startOfDay(new Date(it.startShiftDate));
        const t = endOfDay(new Date(it.endShiftDate));
        for (const d of daysInclusive(s, t)) {
        const iso = toISODate(d);
        const y = d.getFullYear();
        if (markedByYear.has(y)) markedByYear.get(y).add(iso);
        }
    }

    // Layout: 3 Spalten × 4 Zeilen. Jeder Monatsblock: 7 Spalten (Tage).
    // Wir setzen zwischen Blöcken 1 Leer-Spalte Abstand -> BlockBreite = 7 + 1 = 8
    const blockW = 8;               // 7 Tage + 1 Abstand
    const daysCols = 7;
    const gridCols = 3;
    const gridRows = 4;
    const totalCols = gridCols * blockW - 1; // letzte Spalte ohne Abstand
    const colWidth = 20;            // „quadratisch“ wirkend

    // XML: Table-Start inkl. Columns
    let tableXml = `<Table>${buildColumns(totalCols, colWidth)}`;

    // Kopf/Legende
    tableXml += `
        <Row><Cell ss:MergeAcross="${1*blockW - 2}" ss:StyleID="header"><Data ss:Type="String">${escapeXml(employeeName)}</Data></Cell></Row>
        <Row><Cell ss:MergeAcross="${2*blockW + 2}" ss:StyleID="legend"><Data ss:Type="String">Legende: Hellblau=Bereitschaft, Gelb=Wochenende, Orange=Bereitschaft+WE, *Feiertag fett</Data></Cell></Row>
        <Row/>`;

    let grandTotal = 0;

    for (const y of years) {
        tableXml += `<Row><Cell ss:MergeAcross="${2}" ss:StyleID="header"><Data ss:Type="String">Jahr ${y}</Data></Cell></Row>`;

        const holidaysSet = getHolidays(y);
        const markedSet = markedByYear.get(y) || new Set();

        // 12 Monats-Grids vorbereiten
        const monthGrids = [];
        for (let m=0; m<12; m++) monthGrids.push(makeMonthGrid(y, m, markedSet, holidaysSet));

        // 4 Zeilen mit je 3 Monaten nebeneinander
        for (let band=0; band<gridRows; band++) {
        const m0 = band*gridCols + 0;
        const m1 = band*gridCols + 1;
        const m2 = band*gridCols + 2;

        // Titelzeile der drei Monate
        let rowXml = '<Row>';
        // Monat 0
        rowXml += `<Cell ss:Index="${1 + 0*blockW}" ss:MergeAcross="${2}" ss:StyleID="header"><Data ss:Type="String">${monthGrids[m0].title}</Data></Cell>`;
        // Monat 1
        rowXml += `<Cell ss:Index="${1 + 1*blockW}" ss:MergeAcross="${2}" ss:StyleID="header"><Data ss:Type="String">${monthGrids[m1].title}</Data></Cell>`;
        // Monat 2
        rowXml += `<Cell ss:Index="${1 + 2*blockW}" ss:MergeAcross="${2}" ss:StyleID="header"><Data ss:Type="String">${monthGrids[m2].title}</Data></Cell>`;
        rowXml += '</Row>';
        tableXml += rowXml;

        // Wochentagszeilen
        const heads = ['Mo','Di','Mi','Do','Fr','Sa','So'];

        rowXml = '<Row>';
        // Monat 0
        rowXml += `<Cell ss:Index="${1 + 0*blockW}" ss:StyleID="header"><Data ss:Type="String">${heads[0]}</Data></Cell>`;
        for (let i=1;i<daysCols;i++) rowXml += `<Cell ss:StyleID="header"><Data ss:Type="String">${heads[i]}</Data></Cell>`;
        // Monat 1
        rowXml += `<Cell ss:Index="${1 + 1*blockW}" ss:StyleID="header"><Data ss:Type="String">${heads[0]}</Data></Cell>`;
        for (let i=1;i<daysCols;i++) rowXml += `<Cell ss:StyleID="header"><Data ss:Type="String">${heads[i]}</Data></Cell>`;
        // Monat 2
        rowXml += `<Cell ss:Index="${1 + 2*blockW}" ss:StyleID="header"><Data ss:Type="String">${heads[0]}</Data></Cell>`;
        for (let i=1;i<daysCols;i++) rowXml += `<Cell ss:StyleID="header"><Data ss:Type="String">${heads[i]}</Data></Cell>`;
        rowXml += '</Row>';
        tableXml += rowXml;

        // Bis zu 6 Kalenderwochen
        for (let wk=0; wk<6; wk++) {
            rowXml = '<Row>';

            // Für jeden der drei Monate in diesem Band
            for (let colBlock=0; colBlock<3; colBlock++) {
            const monthIdx = band*gridCols + colBlock;
            const grid = monthGrids[monthIdx];

            // Startspalte via ss:Index setzen
            rowXml += `<Cell ss:Index="${1 + colBlock*blockW}" ss:StyleID="${grid.rows[wk][0].styleId}"><Data ss:Type="${grid.rows[wk][0].text ? 'Number':'String'}">${grid.rows[wk][0].text || ''}</Data></Cell>`;
            for (let d=1; d<daysCols; d++) {
                const cell = grid.rows[wk][d];
                rowXml += `<Cell ss:StyleID="${cell.styleId}"><Data ss:Type="${cell.text ? 'Number':'String'}">${cell.text || ''}</Data></Cell>`;
            }
            }

            rowXml += '</Row>';
            tableXml += rowXml;
        }

        // Leerzeile zwischen Bands
        tableXml += '<Row/>';
        }

        // Summe Einsatztage für das Jahr berechenen
        const sumYear = (markedSet.size || 0);
        grandTotal += sumYear;
    }

    // Gesamtsumme
    tableXml += `<Row><Cell ss:MergeAcross="${1*blockW}" ss:StyleID="header"><Data ss:Type="String">Gesamtsumme Einsatztage: ${grandTotal}</Data></Cell></Row></Table>`;

    // Worksheet zusammensetzen
    return `
    <Worksheet ss:Name="${escapeXml(safeName)}">
        ${tableXml}
        ${worksheetOptionsA4()}
    </Worksheet>`;
}

/* ===================== Workbook bauen & herunterladen ===================== */

function createSpreadsheetMLWorkbookXml(entries) {
    let xml = buildWorkbookHeader();
    xml += buildStyles();

    // Hauptblatt
    xml += buildMainSheetXML(entries);

    // Mitarbeiterblätter
    const byEmp = groupByEmployee(entries);
    for (const [name, list] of byEmp) {
        xml += buildEmployeeSheetXML(name, list);
    }

    xml += '</Workbook>';
    return xml;
}

function downloadFile(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
}

/* ===================== Öffentliche Export-Funktion ===================== */

async function exportPlanSpreadsheetML() {
    const raw = localStorage.getItem("shiftPlan");
    if (!raw) { alert("Es gibt keinen Schichtplan zum Exportieren. Bitte erstellen Sie zuerst einen Plan."); return; }
    let entries = [];
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error('shiftPlan ist kein Array');
        entries = parsed;
    } catch (e) {
        console.error(e);
        alert("Fehler beim Lesen der gespeicherten Daten.");
        return;
    }

    try {
        const xml = createSpreadsheetMLWorkbookXml(entries);
        downloadFile(xml, 'Bereitschaftsplan.xml', 'application/vnd.ms-excel');
    } catch (err) {
        console.error(err);
        alert("Fehler beim Erstellen der Excel-Datei.");
    }
}


async function exportPlan() { 
    return exportPlanSpreadsheetML(); 
}


/*
async function exportPlan() {
    // Prüfen, ob SheetJS geladen ist
    if (localStorage.getItem("shiftPlan") != null) {

        // Daten aus dem LocalStorage holen
        let eintraege = [];
        const data = localStorage.getItem("shiftPlan");
        if (data) {
            try {
                const parsed = JSON.parse(data);
                eintraege = Array.isArray(parsed) ? parsed : []; 
            } catch (e) {
                alert("Fehler beim Lesen der gespeicherten Daten.");
                return;
            }
        } else {
            alert("Keine gespeicherten Daten gefunden.");
            return;
        }

        // Excel-Export via SheetJS
        try {
            const wb = createWorkbook(eintraege);
            XLSX.writeFile(wb, 'Bereitschaftsplan.xlsx');
        } catch (err) {
            console.error(err);
            alert("Fehler beim Erstellen der Excel-Datei.");
        }
        // Trigger Download
        XLSX.writeFile(wb, 'Bereitschaftsplan.xlsx');
    } else {
        alert("Es gibt keinen Schichtplan zum Exportieren. Bitte erstellen Sie zuerst einen Plan.");
    }
}
*\


/*--------------------Datei-Management----------------------------- */

function openSaveFileModal() {
    if (localStorage.getItem(globalEmployeesData)) {
        document.getElementById("saveOverlay").style.display = "flex";
    }
    else {
        alert("Sie müssen zuerst ein Team erstellen oder laden, bevor Sie eine Datei speichern können.");
    }
}

function getTeamFromLocalStorage() {
    let teamKey = null;
    let teamFound = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('.team')) {      
            teamKey = key; // Setzt den Team-Schlüssel
            teamFound++ ; // Zählt die Anzahl der gefundenen Teams
        }
    }
    return {teamKey , teamFound};
}

function newFile() {  
    localStorage.clear(); // Löscht alle Daten im Local Storage
    window.location.reload(); // Lädt die Seite neu
    document.getElementById("employeeTable").querySelector("tbody").innerHTML = ""; // Leert die Tabelle
    }

function openFile() {
    document.getElementById("openOverlay").style.display = "flex"; // Öffnet das Modal zum Öffnen
}

function loadFile() {
    const input = document.getElementById('fileID');
    if (getTeamFromLocalStorage().teamFound > 0) {
        localStorage.clear(); // Löscht alle Daten im Local Storage, wenn bereits ein Team gefunden wurde
        console.log("Alte Team-Daten gelöscht, neues Team wird geladen.");
    }
    if (!input.files.length) {
        alert("Bitte wählen Sie zuerst eine .team-Datei aus.");
        return;
    }
    const file = input.files[0];
    if (!file.name.endsWith('.team')) {
        alert("Ungültiger Dateityp. Bitte laden Sie eine .team-Datei hoch.");
        return;
    }
    const key = file.name; // Der Schlüssel, unter dem die Datei gespeichert wird
    globalEmployeesData = key; // Setzt den globalen Schlüssel für Mitarbeiterdaten
    const reader = new FileReader();
    reader.onload = function(event) {
        const fullContent = event.target.result;
        const stateValue = fullContent.slice(-2);
        const content = fullContent.slice(0,-2).trim();

        document.getElementById("stateSelect").disabled = true;
        document.querySelector('#stateSelect').value = stateValue;
        localStorage.setItem("selectedState", stateValue);
        localStorage.setItem(key, content);
        document.getElementById("titleTeamName").textContent = key; // Setzt den Titel des Teamnamens
        console.log("Datei erfolgreich geladen und im LocalStorage unter dem Schlüssel gespeichert: " + key + " " + globalEmployeesData);
    };
        reader.onerror = function() {
        alert("Datei konnte nicht geladen werden. Bitte versuchen Sie es erneut.");
    };

    reader.readAsText(file);
    closeOpenModal.click(); // Schließt das Modal nach dem Laden der Datei
}

function saveFile() {
    const filename = document.getElementById("saveFilename").value.trim();
    const data = localStorage.getItem(globalEmployeesData);
    const stateValue = "BB";
    if (!filename) {
        alert("Bitte geben Sie einen Dateinamen ein.");
        return;
    }
    if (!data) {
        alert("Keine Mitarbeiterdaten zum Speichern gefunden.");
        return;
    }
    const blob = new Blob([data, stateValue], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename + '.team'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    document.getElementById("saveOverlay").style.display = "none"; // Schließt das Modal
}


/**--------------------Mitarbeiter hinzufügen----------------------------------------------------*/
//Modal-Elemente für neuen Mitarbeiter
openBtn.addEventListener('click', () => {

    addOverlay.style.display = 'flex';
    addWindow.scrollTop = 0; // Scrollen nach oben
    form.reset(); // Formular zurücksetzen
    vacations.splice(0, vacations.length); // Urlaubsanträge zurücksetzen
    currentEditIndex = null; // Index zurücksetzen
    updateVacationTable("vacationTable"); // Urlaubstabelle initialisieren
    initHolidayTable("holidaysTable"); // Feiertage initialisieren

    const addVacationBtn = document.getElementById("addVacationBtn");
    // Vor dem Hinzufügen: alle EventListener entfernen
    addVacationBtn.replaceWith(addVacationBtn.cloneNode(true));
    document.getElementById("addVacationBtn").addEventListener("click", (e) => addVacation(e, 'vacationBegin', 'vacationEnd', 'vacationTable')); 

});

// Modal Neuer Mitarbeiter schließen
closeBtn.addEventListener('click', () => {
    document.getElementById("vacationTable").querySelector("tbody").innerHTML = ""; // Urlaubstabelle leeren
    document.getElementById("holidaysTable").innerHTML = ""; // Feiertagstabelle leeren
    document.getElementById("holidaysTable").innerHTML = "<thead><tr><th>Feiertag</th><th>Jahr</th></tr></thead>";
    addOverlay.style.display = 'none';
    form.reset();
});

// Modal Neuer Mitarbeiter schließen bei Klick außerhalb des Fensters
addOverlay.addEventListener('click', e => {
if (e.target === addOverlay) {
    closeBtn.click(); // Schließt das Modal
}
});

// Modal für Mitarbeiter speichern
form.addEventListener('submit', e => {
    e.preventDefault();
    const firstName = document.getElementById('forename').value.trim();
    const lastName  = document.getElementById('surname').value.trim();

    if (!firstName || !lastName) {
        alert("Bitte Vorname und Nachname eingeben.");
        return;
    }

    const id = crypto.randomUUID();
    const holidayData = {};

    const rows = document.getElementById('holidaysTable').rows;

    for (let i = 1; i < rows.length; i++) {
        const holiday = rows[i].cells[0].innerText;
        const year = parseInt(rows[i].cells[1].querySelector("input").value);
        if (year) {
            if (!/^\d{4}$/.test(year)) {
                alert(`Ungültiges Jahr für ${year}: Bitte vierstellige Jahreszahl.`);
                throw "Invalid year";
            }
            holidayData[holiday] = Number(year);
            }
        //else holidayData[holiday] = 0;
    }

    const employee = {
        id,
        firstName,
        lastName,
        vacations: [...vacations],
        lastOnHolidayYear: holidayData
    };

    // bestehende Liste aus localStorage laden oder neuen Array anlegen
    const employees = getEmployees(globalEmployeesData) || [];

    employees.push(employee);

    // zurück ins localStorage
    setEmployees(globalEmployeesData, employees);
    
    alert('Mitarbeiter gespeichert!');
    closeBtn.click(); // Modal schließen
    vacations = []; // Urlaubsanträge zurücksetzen
    showEmployees(); // Tabelle aktualisieren
});

/*--------------------Mitarbeiter bearbeiten----------------------------------------------------*/
//Modal-Elemente für Mitarbeiter bearbeiten
function openEditModal(index) {
    const employees = JSON.parse(localStorage.getItem(globalEmployeesData)) || [];
    const emp = employees[index];
    if (!emp) return;

    vacations = emp.vacations ? [...emp.vacations] : []; // Urlaube des Mitarbeiters laden
    currentEditIndex = index;
    editOverlay.style.display = 'flex';
    editWindow.scrollTop = 0; // Scrollen nach oben
    console.log("Editiere Mitarbeiter:", emp);
    // Felder befüllen

    document.getElementById('editForename').value = emp.firstName;
    document.getElementById('editSurname').value = emp.lastName;

    // Vorher alte Listener entfernen
    const editVacationBtn = document.getElementById("editVacationBtn");
    editVacationBtn.replaceWith(editVacationBtn.cloneNode(true));

    document.getElementById("editVacationBtn")
        .addEventListener("click", (e) => addVacation(e, "editVacationBegin", "editVacationEnd", "editVacationTable"));

    // Hier verzögern wir den nächsten Schritt minimal
    setTimeout(() => {
        updateVacationTable("editVacationTable"); 
        initHolidayTable("editHolidaysTable");
    }, 0);
}

// Edit Modal schließen
closeEditBtn.addEventListener('click', () => {
    document.getElementById("editHolidaysTable").innerHTML = ""; // Urlaubstabelle leeren
    document.getElementById("editHolidaysTable").innerHTML = "<thead><tr><th>Feiertag</th><th>Jahr</th></tr></thead>";
    editOverlay.style.display = 'none';
    editForm.reset();
});

//Modal Edit Mitarbeiter schließen bei Klick außerhalb des Fensters
editOverlay.addEventListener('click', e => {
if (e.target === editOverlay) {
    closeEditBtn.click(); // Schließt das editModal
}
});

// Löschen des Mitarbeiters
deleteEditBtn.addEventListener('click', () => {
    const employees = getEmployees(globalEmployeesData) || [];
    if (currentEditIndex !== null && currentEditIndex >= 0 && currentEditIndex < employees.length) {
        employees.splice(currentEditIndex, 1); // Mitarbeiter löschen
        setEmployees(globalEmployeesData, employees); // Mitarbeiter aktualisieren
        console.log("Mitarbeiter gelöscht:", employees);
        alert('Mitarbeiter gelöscht!');       
        showEmployees(); // Tabelle aktualisieren
        closeEditBtn.click(); // Modal schließen
        currentEditIndex = null; // Index zurücksetzen
    } else {
        alert("Kein Mitarbeiter ausgewählt zum Löschen.");
    }
});

// Modal Edit Mitarbeiter speichern
editForm.addEventListener('submit', e => {
    e.preventDefault();
    const firstName = document.getElementById('editForename').value.trim();
    const lastName  = document.getElementById('editSurname').value.trim();

    if (!firstName || !lastName) {
        alert("Bitte Vorname und Nachname eingeben.");
        return;
    }

    const employees = getEmployees(globalEmployeesData) || [];
    const emp = employees[currentEditIndex];

    emp.firstName = firstName;
    emp.lastName  = lastName;

    // Urlaubsanträge aktualisieren
    emp.vacations = vacations;

    // Feiertage aktualisieren
    const holidayData = {};

    const rows = document.getElementById('editHolidaysTable').rows;

    for (let i = 1; i < rows.length; i++) {
        const holiday = rows[i].cells[0].innerText;
        const year = parseInt(rows[i].cells[1].querySelector("input").value);
        if (year) {
            if (!/^\d{4}$/.test(year)) {
                alert(`Ungültiges Jahr für ${year}: Bitte vierstellige Jahreszahl.`);
                throw "Invalid year";
            }
            holidayData[holiday] = Number(year);
            }
    }

    emp.lastOnHolidayYear = holidayData;

    employees[currentEditIndex] = emp; // Mitarbeiter aktualisieren
    setEmployees(globalEmployeesData, employees); // Mitarbeiter aktualisieren
    console.log("Aktualisierte Mitarbeiter:", emp);

    document.getElementById("editHolidaysTable").innerHTML = ""; // Urlaubstabelle leeren
    document.getElementById("editHolidaysTable").innerHTML = "<thead><tr><th>Feiertag</th><th>Jahr</th></tr></thead>";
    alert('Mitarbeiter aktualisiert!');
    vacations = []; // Urlaubsanträge zurücksetzen
    currentEditIndex = null; // Index zurücksetzen
    editOverlay.style.display = 'none';
    showEmployees(); // Tabelle aktualisieren
    editForm.reset();
});

/*----------------------Team speichern------------------------------------------------------------*/
// Modal File save schließen
closeSaveModal.addEventListener('click', () => {
    document.getElementById("saveOverlay").style.display = "none"; // Schließt das Modal
    document.getElementById("saveForm").reset(); // Formular zurücksetzen
});

// Modal File save schließen bei Klick außerhalb des Fensters
saveOverlay.addEventListener('click', e => {
if (e.target === saveOverlay) {
    closeSaveModal.click(); // Schließt das Modal
}
});

/*----------------------Team öffnen---------------------------------------------------------------*/
// Schließen des Modals zum Öffnen
closeOpenModal.addEventListener('click', () => {
    document.getElementById("openOverlay").style.display = "none"; // Schließt das Modal
    document.getElementById("openForm").reset(); // Formular zurücksetzen
});

// Klick auf Overlay (außerhalb Fenster) schließt Modal
openOverlay.addEventListener('click', e => {
if (e.target === openOverlay) {
    closeOpenModal.click(); // Schließt das Modal
}
});