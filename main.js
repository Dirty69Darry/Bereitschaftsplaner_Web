//main.js
/*
    TODO:
    - Excel Tabelle erweitern 
        - Kalendarische übersicht für jeden Mitarbeiter
        - Feiertage in der Tabelle anzeigen
        - Übersicht mit mehr Daten wie z.B. Anzahl der Schichten pro Mitarbeiter
        - Metadaten wie z.B. Erstellungsdatum, Ersteller, Version
    
    DONE:
        - Speichern und Öffnen von Dateien
        - Plan-Generator individuell anpassen
        - Bundestagsabhängige Feiertage
*/

/*-------------------Globale Variable und Konstanten -------------------*/
// global Variablen
let globalEmployeesData = "TEAM.team"; // Local Storage Key für Mitarbeiterdaten
let currentEditIndex = null; // Aktueller Index für den zu bearbeitenden Mitarbeiter
let vacations = []; // Array für Urlaubsanträge

//global Konstanten
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
    "HeiligeDreiKönige", //1
    "InternationalerFrauentag", //2
    "Karfreitag", //3
    "Ostersonntag", //4
    "Ostermontag",  //5
    "TagDerArbeit", //6
    "ChristiHimmelfahrt", //7
    "Pfingstensonntag", //8
    "Pfingstmontag",    //9
    "Fronleichnam", //10
    "MariäHimmelfahrt", //11
    "Weltkindertag",    //12
    "TagDerDeutschenEinheit",   //13
    "Reformationstag",  //14
    "Allerheiligen",    //15
    "BußUndBetttag",    //16
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


// Event-Listener Main
window.addEventListener('DOMContentLoaded', () => {
    if (getTeamFromLocalStorage().teamKey != null) {
        globalEmployeesData = getTeamFromLocalStorage().teamKey; // Setzt den globalen Schlüssel für Mitarbeiterdaten
        document.getElementById("titleTeamName").textContent = globalEmployeesData.split('.team')[0]; // Setzt den Titel des Teamnamens
        console.log("Team aus Local Storage geladen:", globalEmployeesData);
    }
    else {
        console.log("Kein Team in Local Storage gefunden. Erstelle neues Team.");
        document.getElementById("titleTeamName").textContent = "Neues Team"; // Setzt den Titel des Teamnamens
    }
    const stored = getEmployees(getTeamFromLocalStorage().teamKey) || [];
    stored.forEach(emp => receiveEmployee(emp));
    showEmployees(); // Mitarbeiter anzeigen
});

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

// gibt die Feiertage für ein bestimmtes Jahr zurück
function getHolidays(year) {
    const easter = calculateEaster(year);
    const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

    const format = date => date.toISOString().split('T')[0];

    return [
        { name: holidays[0], date: format(new Date(year, 0, 1)) },
        { name: holidays[1], date: format(addDays(easter, -2)) },
        { name: holidays[2], date: format(addDays(easter, 1)) },
        { name: holidays[3], date: format(new Date(year, 4, 1)) },
        { name: holidays[4], date: format(addDays(easter, 39)) },
        { name: holidays[5], date: format(addDays(easter, 50)) },
        { name: holidays[6], date: format(new Date(year, 9, 3)) },
        { name: holidays[7], date: format(new Date(year, 11, 25)) },
        { name: holidays[8], date: format(new Date(year, 11, 26)) },
        { name: holidays[8], date: format(new Date(year, 11, 31)) }
    ];
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

function initHolidayTable(holTable) {
    console.log("Initialisiere Feiertagstabelle:", holTable);
    if (!holTable) {
        console.error("holTable ist nicht definiert.");
        return;
    }
    // Lese das employees-Array aus dem localStorage
    const employees = JSON.parse(localStorage.getItem(globalEmployeesData) || "[]");
    let employee = {};
    let holValue = null;
    const thisholidays = Bundeslaender[document.getElementById("stateSelect").value]; // Aktuell ausgewähltes Bundesland

    if (!thisholidays || !thisholidays.holidays || thisholidays.holidays.length === 0) {return console.error("Keine Feiertage für das ausgewählte Bundesland gefunden.");}
    if (currentEditIndex >= 0 && employees.length > 0) {
        employee = employees[currentEditIndex];
    }

    const table = document.getElementById(holTable);
    for (const h of thisholidays.holidays) {
        const row = table.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.innerText = holidays[h]; // Feiertagsname
        if (employee != null) {
            holValue = (employee.lastOnHolidayYear && employee.lastOnHolidayYear[h]) || null; // Fallback auf 0, wenn kein Wert vorhanden ist
        }
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

// Öffnet das Plan-Modal und generiert den Schichtplan
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
            //modal.reset(); // Formular zurücksetzen
        });
    });
}

// Plan-Generator
function generatePlan(employees, startDate, endDate, periodLength = 7, employeesPerShift = 1) {
    const assignments = [];

    if (!employees.length || startDate >= endDate) return assignments;

    const ordered = [...employees].sort((a, b) => getLastHolidayInterval(a) - getLastHolidayInterval(b));
    let periodStart = new Date(startDate);

    while (periodStart <= endDate) {
        let periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + periodLength - 1);
        if (periodEnd > endDate) periodEnd = new Date(endDate);

        const assignedEmployees = [];
        for (let i = 0; i < employeesPerShift; i++) {
            const employee = getNextAvailableEmployee(ordered, periodStart, periodEnd);
            if (!employee) {
                throw new Error(`Ab dem ${periodStart.toLocaleDateString()} steht kein freier Mitarbeiter zur Verfügung.`);
            }

            assignments.push({
                employeeId: employee.id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                startShiftDate: new Date(periodStart),
                endShiftDate: new Date(periodEnd)
            });

            assignedEmployees.push(employee);
            // Entferne den Mitarbeiter temporär aus der Rotation für diesen Zeitraum
            const idx = ordered.indexOf(employee);
            ordered.splice(idx, 1);
        }

        // Nach der Zuweisung kommen die MA ans Ende der Liste zurück
        ordered.push(...assignedEmployees);
        periodStart.setDate(periodStart.getDate() + periodLength);
    }
    localStorage.setItem('shiftPlan', JSON.stringify(assignments));
    return assignments;
}

// Abstand seit letztem Feiertagsdienst in Jahren
function getLastHolidayInterval(emp) {
    if (!emp || !Object.keys(emp.lastOnHolidayYear).length) {
    return Number.MAX_SAFE_INTEGER;
    }
    const years = Object.values(emp.lastOnHolidayYear);
    const lastYear = Math.min(...years);
    return new Date().getFullYear() - lastYear;
}

function getNextAvailableEmployee(ordered, periodStart, periodEnd) {
    for (const emp of ordered) {
        // Urlaub prüfen
        const onVacation = emp.vacations.some(v => {
            const vStart = new Date(v.start);
            const vEnd = new Date(v.end);
            return vStart <= periodEnd && vEnd >= periodStart;
        });
        if (onVacation) continue;
        // Feiertagsprüfung
        let conflict = false;
        for (const h of holidays) {
            const holidayDate = new Date(h.date);
            if (holidayDate >= periodStart && holidayDate < periodEnd) {
                const lastYear = emp.lastOnHolidayYear[holidayDate];
                if (lastYear && lastYear === holidayDate.getFullYear() - 1) {
                    conflict = true;
                    break;
                }
            }
        }
        if (conflict) continue;
        return emp;
    }
    return null;
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

async function exportPlan() {
    // Prüfen, ob SheetJS geladen ist
    if (localStorage.getItem("shiftPlan") != null) {
        // Daten aus dem LocalStorage holen
        let eintraege = [];
        const data = localStorage.getItem("shiftPlan");
        if (data) {
            try {
                const parsed = JSON.parse(data);
                eintraege = parsed; // Annahme: das ist ein Array von Objekten
            } catch (e) {
                alert("Fehler beim Lesen der gespeicherten Daten.");
                return;
            }
        } else {
            alert("Keine gespeicherten Daten gefunden.");
            return;
        }

        // Wir bereiten die Daten für den Export vor
        const exportData = eintraege.map(entry => {
            return {
                "Start": formatDateGerman(entry.startShiftDate),
                "Ende": formatDateGerman(entry.endShiftDate),
                "Name": entry.firstName + " " + entry.lastName,
            };
        });

        // Excel-Export via SheetJS
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bereitschaftsplan");

        // Trigger Download
        XLSX.writeFile(wb, 'Bereitschaftsplan.xlsx');
    } else {
        alert("Es gibt keinen Schichtplan zum Exportieren. Bitte erstellen Sie zuerst einen Plan.");
    }
}

/*--------------------Datei-Management----------------------------- */

function openSaveFileModal() {
    if (localStorage.getItem(globalEmployeesData)) {
        document.getElementById("saveOverlay").style.display = "flex";
    }
    else {
        alert("Sie müssen zuerst ein Team erstellen oder laden, bevor Sie eine Datei speichern können.");
    }
}

// get team from localStorage
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
        const content = event.target.result;
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
    if (!filename) {
        alert("Bitte geben Sie einen Dateinamen ein.");
        return;
    }
    if (!data) {
        alert("Keine Mitarbeiterdaten zum Speichern gefunden.");
        return;
    }
    const blob = new Blob([data], { type: 'text/plain' });
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
    }

    const employee = {
        id,
        firstName,
        lastName,
        vacations,
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