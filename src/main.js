//main.js
/*
    TODO:
    - die großen .addEventListener in function umwandeln
    - Excel Tabelle erweitern 
        - zweite Excel-Tabelle Monatsweise Zeile pro Mitarbeiter
    
    DONE:
    - Bugfix: LastShiftdate als let definieren, weil verändert wird
    - Bugfix: Feiertagsprüfung auf richtiges Datum umstellen bei Prüfung -> US Format zu D Format
    - Bugfix: Fehler in Holiday Mapping Funktion
    - Bugfix: Periodenlänge bei nicht vollständiger Periode anpassen
    - Excel-Export: Spalte Feiertage hinzugefügt
    - Excel-Export: Gesamtsumme der Einsatzwochen pro Mitarbeiter
    - Alert, wenn kein Mitarbeiter verfügbar ist

*/


/*-------------------Globale Variable und Konstanten -------------------*/
// jetzt in globals.js
const OPENBTN  = document.getElementById('openModal');
const CLOSEBTN = document.getElementById('closeModal');
const ADDOVERLAY  = document.getElementById('addOverlay');
const ADDWINDOW  = document.getElementById('addWindow');
const FORM     = document.getElementById('employeeForm');

const OPENEDITBTN  = document.getElementById('openEditModal');
const CLOSEEDITBTN = document.getElementById('closeEditModal');
const EDITOVERLAY  = document.getElementById('editOverlay');
const EDITWINDOW  = document.getElementById('editWindow');
const EDITFORM     = document.getElementById('editForm');

const deleteEmployeeDialog = document.getElementById('deleteEmployeeDialog');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');


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
    startVersionCheck(); // Überprüft die Version

    //Bundesland auswählen und nicht nachher änderbar 

    if(stateSelect.disabled == false && stateSelect.value == "none"){
        toggleActionButtons();
    }
    if (localStorage.getItem("selectedState") !== null){
        stateSelect.value = localStorage.getItem("selectedState");
        stateSelect.disabled = true;
    }

});

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
    const thisholidays = BUNDESLAENDER[document.getElementById("stateSelect").value]; // Aktuell ausgewähltes Bundesland

    if (!thisholidays || !thisholidays.HOLIDAYS || thisholidays.HOLIDAYS.length === 0) {return console.error("Keine Feiertage für das ausgewählte Bundesland gefunden.");}


    const table = document.getElementById(holTable);
    for (const h of thisholidays.HOLIDAYS) {
        const row = table.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.innerText = HOLIDAYS[h]; // Feiertagsname
        holValue = (employee.lastOnHolidayYear && employee.lastOnHolidayYear[HOLIDAYS[h]]) ? employee.lastOnHolidayYear[HOLIDAYS[h]] : null;
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

            const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            const fullPeriods = Math.ceil(totalDays / (periodLength-1));
            const adjustedEndDate = new Date(startDate);
            adjustedEndDate.setDate(adjustedEndDate.getDate() + (fullPeriods * (periodLength-1)));

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
                    console.log(`Zuweisung: ${employee.firstName} ${employee.lastName} fuer ${periodStart.toLocaleDateString()} bis ${periodEnd.toLocaleDateString()}`);
                    assignments.push({
                        employeeId: employee.id,
                        firstName: employee.firstName,
                        lastName: employee.lastName,
                        lastShiftDate: employee.lastShiftDate,
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
                alert(`Ab dem ${periodStart.toLocaleDateString()} steht kein freier Mitarbeiter zur Verfügung.`);
                throw new Error(`Ab dem ${periodStart.toLocaleDateString()} steht kein freier Mitarbeiter zur Verfügung.`);
            }
        }
        periodStart.setDate(periodStart.getDate() + (periodLength - 1));
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

function parseGermanDate(str) {
    const [d, m, y] = str.split(".");
    return new Date(+y, m - 1, +d);
}

function getAvailableEmployee(emp, periodStart, periodEnd) {
    //sicherstellen, dass Datumsformat verwendet wird
    if (!(periodStart instanceof Date)) periodStart = new Date(periodStart);
    if (!(periodEnd instanceof Date)) periodEnd = new Date(periodEnd);
    const startYear = new Date(periodStart).getFullYear();
    const endYear = new Date(periodEnd).getFullYear();

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
        const hDate = parseGermanDate(h.date);
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

    // Letzte Bereitschaft prüfen
    if (emp.lastShiftDate) {
        const lastShiftDate = new Date(emp.lastShiftDate);
        const periodDuration = periodEnd - periodStart; // Zeitspanne des Zeitraums in ms
        const requiredGap = periodDuration * (emp?.length || 1);
        const timeSinceLastShift = periodStart - lastShiftDate;

        if (timeSinceLastShift < requiredGap) {
            console.log(`${emp.name} wurde zu kürzlich eingesetzt.`);
            return null; // zu früh wieder eingeplant
        }
    }

    return 1;
    
}

function mapDateToHolidayType(date) {
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
// jetzt in excelexport.js

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
    const stateValue = "BB"; //TODO: Dynamisch den aktuellen Bundeslandwert holen
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
function openAddModal() {

    ADDOVERLAY.style.display = 'flex';
    ADDWINDOW.scrollTop = 0; // Scrollen nach oben
    FORM.reset(); // Formular zurücksetzen
    vacations.splice(0, vacations.length); // Urlaubsanträge zurücksetzen
    currentEditIndex = null; // Index zurücksetzen
    updateVacationTable("vacationTable"); // Urlaubstabelle initialisieren
    initHolidayTable("holidaysTable"); // Feiertage initialisieren

    const addVacationBtn = document.getElementById("addVacationBtn");
    // Vor dem Hinzufügen: alle EventListener entfernen
    addVacationBtn.replaceWith(addVacationBtn.cloneNode(true));
    document.getElementById("addVacationBtn").addEventListener("click", (e) => addVacation(e, 'vacationBegin', 'vacationEnd', 'vacationTable')); 

}

// Modal Neuer Mitarbeiter schließen
function closeAddModal() {
    document.getElementById("vacationTable").querySelector("tbody").innerHTML = ""; // Urlaubstabelle leeren
    document.getElementById("holidaysTable").innerHTML = ""; // Feiertagstabelle leeren
    document.getElementById("holidaysTable").innerHTML = "<thead><tr><th>Feiertag</th><th>Jahr</th></tr></thead>";
    ADDOVERLAY.style.display = 'none';
    FORM.reset();
}

// Modal Neuer Mitarbeiter schließen bei Klick außerhalb des Fensters
function closeAddModalOnClickOutside(e) {
if (e.target === ADDOVERLAY) {
    closeAddModal(); // Schließt das Modal
}
}

// Modal für Mitarbeiter speichern
function saveNewEmployee(e) {
    e.preventDefault();
    const firstName = document.getElementById('forename').value.trim();
    const lastName  = document.getElementById('surname').value.trim();
    const id = crypto.randomUUID();
    const holidayData = {};
    const rows = document.getElementById('holidaysTable').rows;
    let lastShiftDate = document.getElementById('lastShiftDate').value;

    if (!firstName || !lastName) {
        alert("Bitte Vorname und Nachname eingeben.");
        return;
    }

    if (!lastShiftDate) {
        lastShiftDate = null;
    }

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
        lastShiftDate,
        vacations: [...vacations],
        lastOnHolidayYear: holidayData
    };

    // bestehende Liste aus localStorage laden oder neuen Array anlegen
    const employees = getEmployees(globalEmployeesData) || [];

    employees.push(employee);

    // zurück ins localStorage
    setEmployees(globalEmployeesData, employees);
    
    alert('Mitarbeiter gespeichert!');
    CLOSEBTN.click(); // Modal schließen
    vacations = []; // Urlaubsanträge zurücksetzen
    showEmployees(); // Tabelle aktualisieren
}

/*--------------------Mitarbeiter bearbeiten----------------------------------------------------*/
//Modal-Elemente für Mitarbeiter bearbeiten
function openEditModal(index) {
    const employees = JSON.parse(localStorage.getItem(globalEmployeesData)) || [];
    const emp = employees[index];
    if (!emp) return;

    vacations = emp.vacations ? [...emp.vacations] : []; // Urlaube des Mitarbeiters laden
    currentEditIndex = index;
    EDITOVERLAY.style.display = 'flex';
    EDITWINDOW.scrollTop = 0; // Scrollen nach oben
    console.log("Editiere Mitarbeiter:", emp);
    // Felder befüllen

    document.getElementById('editForename').value = emp.firstName;
    document.getElementById('editSurname').value = emp.lastName;
    document.getElementById('editlastShiftDate').value = emp.lastShiftDate || "";
    document.getElementById('editlastShiftDate').addEventListener('change', () => {
        console.log("Edit: "+document.getElementById('editlastShiftDate').value);
    });

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
function closeEditModal() {
    document.getElementById("editHolidaysTable").innerHTML = ""; // Urlaubstabelle leeren
    document.getElementById("editHolidaysTable").innerHTML = "<thead><tr><th>Feiertag</th><th>Jahr</th></tr></thead>";
    EDITOVERLAY.style.display = 'none';
    EDITFORM.reset();
}

//Modal Edit Mitarbeiter schließen bei Klick außerhalb des Fensters
function closeEditModalOnClickOutside(e) {
if (e.target === EDITOVERLAY) {
    CLOSEEDITBTN.click(); // Schließt das editModal
}
}

//öffnen des Lösch-Dialogs
function openDeleteDialog() {
    const employees = getEmployees(globalEmployeesData) || [];
    if (currentEditIndex === null || currentEditIndex < 0 || currentEditIndex >= employees.length) {
        alert("Kein Mitarbeiter ausgewählt zum Löschen.");
        return;
    }
    const emp = employees[currentEditIndex];
    document.getElementById('deleteMessage').innerHTML = `Möchten Sie <b>${emp.firstName} ${emp.lastName}</b> wirklich löschen?`;

    if (!deleteEmployeeDialog.open) 
        deleteEmployeeDialog.showModal(); // opens dialog
}

// Bestätigen des Löschens
function confirmDeleteEmployee() {
    deleteEmployee();
    deleteEmployeeDialog.close(); // closes dialog
}
// Abbrechen des Löschens
function cancelDeleteEmployee() {
    deleteEmployeeDialog.close(); // closes dialog
}

// Löschen des Mitarbeiters
function deleteEmployee() {
    const employees = getEmployees(globalEmployeesData) || [];
    if (currentEditIndex !== null && currentEditIndex >= 0 && currentEditIndex < employees.length) {
        employees.splice(currentEditIndex, 1); // Mitarbeiter löschen
        setEmployees(globalEmployeesData, employees); // Mitarbeiter aktualisieren
        console.log("Mitarbeiter gelöscht:", employees);
        alert('Mitarbeiter gelöscht!');       
        showEmployees(); // Tabelle aktualisieren
        closeEditModal(); // Modal schließen
        currentEditIndex = null; // Index zurücksetzen
    } else {
        alert("Kein Mitarbeiter ausgewählt zum Löschen.");
    }
}

// Modal Edit Mitarbeiter speichern
function saveEditedEmployee(e) {
    e.preventDefault();
    const firstName = document.getElementById('editForename').value.trim();
    const lastName  = document.getElementById('editSurname').value.trim();
    const lastShiftDate = document.getElementById('editlastShiftDate').value || "";

    if (!firstName || !lastName) {
        alert("Bitte Vorname und Nachname eingeben.");
        return;
    }

    const employees = getEmployees(globalEmployeesData) || [];
    const emp = employees[currentEditIndex];

    emp.firstName = firstName;
    emp.lastName  = lastName;
    emp.lastShiftDate = lastShiftDate;

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
    EDITOVERLAY.style.display = 'none';
    showEmployees(); // Tabelle aktualisieren
    EDITFORM.reset();
}

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