
/* ===================== Hilfsfunktionen ===================== */
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

function formatDateGerman(date) {
    let realdate = new Date(date);
    return realdate.toLocaleDateString('de-DE');
}
/* ============================================================*/

function startOfDay(date) { const d = new Date(date); d.setHours(0,0,0,0); return d; }
function endOfDay(date)   { const d = new Date(date); d.setHours(23,59,59,999); return d; }
function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function toISODate(d) { 
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
function weekdayMon0(d) { return (d.getDay() + 6) % 7; } // weil default Sonntag=0
const WEEKEND_JS = new Set([5,6]); 

/*====================== Gruppierung und Jahre ============================================*/
function makeMonthGrid(year, month0, markedDatesInput, holidayDatesInput) {
    const markedSet = (markedDatesInput instanceof Set) ? markedDatesInput : new Set(markedDatesInput || []);
    // Convert holidayDatesInput (dd.mm.yyyy) to ISO format (yyyy-mm-dd)
    const holidaysSet = new Set(
        (holidayDatesInput || []).map(h => {
            const [dd, mm, yyyy] = h.date.split('.');
            return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
        })
    );


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
        console.log('is Holiday: ', iso, isHoliday);

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

    const blockW = 8;               
    const daysCols = 7;
    const gridCols = 3;
    const gridRows = 4;
    const totalCols = gridCols * blockW - 1; // letzte Spalte ohne Abstand
    const colWidth = 20;            

    // XML: Table-Start 
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

document.getElementById('exportPlan').addEventListener('click', () => {
    exportPlanSpreadsheetML();
});
