
/*-------------------Globale Variable und Konstanten -------------------*/
// global Variablen
window.globalEmployeesData = "TEAM.team"; // Local Storage Key für default Mitarbeiterdaten
window.currentEditIndex = null; // Aktueller Index für den zu bearbeitenden Mitarbeiter
window.vacations = []; // Array für Urlaubsanträge

//global Konstanten
window.GITHUB_OWNER = "dirty69darry";
window.DATAURL = "https://github.com/Dirty69Darry/Bereitschaftsplaner_Web"; // URL zum Repository
window.CURRENTVERSION = "0.2.6"; // Aktuelle Version der Anwendung


// Feiertage
window.HOLIDAYS = [
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
window.BUNDESLAENDER = {
    BW: {
        name: "Baden-Württemberg",
        HOLIDAYS: [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 13, 15, 17, 18, 19, 20]
    },
    BY: {
        name: "Bayern",
        HOLIDAYS: [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 18, 19, 20]
    },
    BE: {
        name: "Berlin",
        HOLIDAYS: [0, 2, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20]
    },
    BB: {
        name: "Brandenburg",
        HOLIDAYS: [0, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20]
    },
    HB: {
        name: "Bremen",
        HOLIDAYS: [0, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20]
    },
    HH: {
        name: "Hamburg",
        HOLIDAYS: [0, 3, 4, 5, 6, 7, 8, 9, 13, 18, 17, 19, 20]
    },
    HE: {
        name: "Hessen",
        HOLIDAYS: [0, 3, 4, 5, 6, 7, 8, 9, 10, 13, 17, 18, 19, 20]
    },
    MV: {
        name: "Mecklenburg-Vorpommern",
        HOLIDAYS: [0, 2, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20]
    },
    NI: {
        name: "Niedersachsen",
        HOLIDAYS: [0, 3, 4, 5, 6, 7, 8, 9, 13, 17, 18, 19, 20]
    },
    NW: {
        name: "Nordrhein-Westfalen",
        HOLIDAYS: [0, 3, 4, 5, 6, 7, 8, 9, 10, 13, 15, 17, 18, 19, 20]
    },
    RP: {
        name: "Rheinland-Pfalz",
        HOLIDAYS: [0, 3, 4, 5, 6, 7, 8, 9, 10, 13, 15, 17, 18, 19, 20]
    },
    SL: {
        name: "Saarland",
        HOLIDAYS: [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 18, 19, 20]
    },
    SN: {
        name: "Sachsen",
        HOLIDAYS: [0, 3, 4, 5, 6, 7, 8, 9, 13, 14, 16, 17, 18, 19, 20]
    },
    ST: {
        name: "Sachsen-Anhalt",
        HOLIDAYS: [0, 1, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20]
    },
    SH: {
        name: "Schleswig-Holstein",
        HOLIDAYS: [0, 3, 4, 5, 6, 7, 8, 9, 13, 17, 18, 19, 20]
    },
    TH: {
        name: "Thüringen",
        HOLIDAYS: [0, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20]
    }
};

/* ===================== Hilfsfunktionen ===================== */
window.calculateEaster = function(year) {
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
};

window.calculateFirstAdvent = function(year){
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
};

window.getHolidays = function(year) {
    const easter = calculateEaster(year);
    const firstAdvent = calculateFirstAdvent(year);
    const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
    const format = date => formatDateGerman(date);

    let currentHolidays = [];

        const allHolidays = [
        {index: 0, name: HOLIDAYS[0], date: format(new Date(year, 0, 1)) }, //Neujahr
        {index: 1, name: HOLIDAYS[1], date: format(new Date(year, 0, 6) ) }, //Heilige drei Könige
        {index: 2, name: HOLIDAYS[2], date: format(new Date(year, 2, 8)) }, // Frauentag
        {index: 3, name: HOLIDAYS[3], date: format(addDays(easter, -2)) }, //Karfreitag
        {index: 4, name: HOLIDAYS[4], date: format(addDays(easter, 0)) }, //Ostersonntag
        {index: 5, name: HOLIDAYS[5], date: format(addDays(easter, 1)) }, //Ostermontag
        {index: 6, name: HOLIDAYS[6], date: format(new Date(year, 4, 1)) }, //Tag der Arbeit
        {index: 7, name: HOLIDAYS[7], date: format(addDays(easter, 40)) }, //Himmelfahrt
        {index: 8, name: HOLIDAYS[8], date: format(addDays(easter, 50)) }, //Pfingstsonntag
        {index: 9, name: HOLIDAYS[9], date: format(addDays(easter, 51)) }, //Pfingstmontag
        {index: 10, name: HOLIDAYS[10], date: format(addDays(easter, 60)) }, //Frohnleichnam
        {index: 11, name: HOLIDAYS[11], date: format(new Date(year, 7, 15)) }, //Maria Himmelfahrt
        {index: 12, name: HOLIDAYS[12], date: format(new Date(year, 8, 20)) }, //Kindertag
        {index: 13, name: HOLIDAYS[13], date: format(new Date(year, 9, 3)) }, //Tag der deutschen Einheit
        {index: 14, name: HOLIDAYS[14], date: format(new Date(year, 9, 31)) }, //Reformationstag
        {index: 15, name: HOLIDAYS[15], date: format(new Date(year, 10, 1)) }, //Allerheiligen
        {index: 16, name: HOLIDAYS[16], date: format(addDays(firstAdvent, -11)) }, //Buß- und Bettag
        {index: 17, name: HOLIDAYS[17], date: format(new Date(year, 11, 24)) }, //HeiligAbend
        {index: 18, name: HOLIDAYS[18], date: format(new Date(year, 11, 25)) }, //Erster X-Mas Tag 
        {index: 19, name: HOLIDAYS[19], date: format(new Date(year, 11, 26)) }, //Zweiter X-Mas Tag
        {index: 20, name: HOLIDAYS[20], date: format(new Date(year, 11, 31)) } //Silvester
    ];

    if (localStorage.getItem("selectedState")){
        const inState = localStorage.getItem("selectedState")
        for (let index = 0; index < BUNDESLAENDER[inState].HOLIDAYS.length; index++) {
            currentHolidays.push(allHolidays[BUNDESLAENDER[inState].HOLIDAYS[index]]);
            //console.log("Bundesland: ",BUNDESLAENDER[inState].HOLIDAYS[index]);
        }
    }
    return currentHolidays;

};

window.formatDateGerman = function(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
};


/*========================GETTER UND SETTER===================================*/

function getConstant(key) {
    switch (key) {
        case 'dataUrl':
            return dataUrl;
        case 'versionUrl':
            return versionUrl;
        case 'currentVersion':
            return currentVersion;
        default:
            throw new Error(`Unbekannte Konstante: ${key}`);
    }
}