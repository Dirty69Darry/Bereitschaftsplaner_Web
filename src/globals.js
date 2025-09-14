
/*-------------------Globale Variable und Konstanten -------------------*/
// global Variablen
let globalEmployeesData = "TEAM.team"; // Local Storage Key für default Mitarbeiterdaten
let currentEditIndex = null; // Aktueller Index für den zu bearbeitenden Mitarbeiter
let vacations = []; // Array für Urlaubsanträge

//global Konstanten
const dataUrl = "https://github.com/Dirty69Darry/Bereitschaftsplaner_Web"; // URL zum Repository
const versionUrl = "https://raw.githubusercontent.com/Dirty69Darry/Bereitschaftsplaner_Web/main/meta.json"; // URL zur Versionskontrolle
const currentVersion = "0.2.5"; // Aktuelle Version der Anwendung
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