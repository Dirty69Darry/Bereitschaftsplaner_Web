// Beispiel-Konstanten anpassen:
const GHP_META_URL = "https://dirty69darry.github.io/Bereitschaftsplaner_Web/meta.json";

// Falls primärer URL scheitert, nutze GitHub-API (owner/repo/path)
const GITHUB_REPO  = "Bereitschaftsplaner_Web";
const GITHUB_PATH  = "meta.json"; // Pfad im Repo-Root

// Optionaler Proxy-Fallback (letztes Mittel)
const ALLORIGINS_PROXY = "https://api.allorigins.win/get?url=";

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
        `Version: ${CURRENTVERSION}\n` +
        "---\n\n" 
    );

    window.open (DATAURL + '/issues/new?title=' + title + '&body=' + body, "_blank");
}


// Hilfsfunktion: Versionsvergleich
function isNewerVersion(remote, local) {
if (!remote || !local) return false;
const r = remote.split('.').map(n => parseInt(n, 10) || 0);
const l = local.split('.').map(n => parseInt(n, 10) || 0);
for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const diff = (r[i] || 0) - (l[i] || 0);
    if (diff > 0) return true;
    if (diff < 0) return false;
}
return false;
}

// Utility: erkenne ob Fehler vermutlich CORS/Network ist
function isNetworkOrCORS(error) {
if (!error) return false;
const msg = (error.message || "").toLowerCase();
// typische Browser-Fehlermeldungen: "failed to fetch", "networkerror", "blocked by CORS policy"
return error.name === "TypeError" || msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("cors") || msg.includes("blocked");
}

// Versuche GitHub API (gibt base64 content zurück)
async function fetchViaGitHubAPI(owner, repo, path) {
const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`;
const res = await fetch(apiUrl, { cache: "no-cache" });
if (!res.ok) throw new Error(`GitHub API Fehler: ${res.status} ${res.statusText}`);
const json = await res.json();
if (!json.content) throw new Error("GitHub API: Kein content-Feld");
const decoded = atob(json.content.replace(/\n/g, ""));
return JSON.parse(decoded);
}

// Versuche AllOrigins-Proxy
async function fetchViaAllOrigins(targetUrl) {
const url = ALLORIGINS_PROXY + encodeURIComponent(targetUrl);
const res = await fetch(url, { cache: "no-cache" });
if (!res.ok) throw new Error(`Proxy Fehler: ${res.status}`);
const wrapper = await res.json();
if (!wrapper || !wrapper.contents) throw new Error("Proxy: kein contents-Feld");
return JSON.parse(wrapper.contents);
}

// Versuche lokale Datei (relative Pfad)
async function fetchLocalRelative(path) {
const res = await fetch(path, { cache: "no-cache" });
if (!res.ok) throw new Error(`Lokale Datei nicht gefunden: ${res.status}`);
return await res.json();
}

//starte Versionsprüfung
window.startVersionCheck = function() {
    checkVersion();
}

async function checkVersion() {
const versionLabel = document.getElementById("version-label");
if (versionLabel) {
    versionLabel.innerHTML = `Aktuelle Version: <a href="${DATAURL}" target="_blank" rel="noopener noreferrer">${CURRENTVERSION}</a>`;
}

// 1) Primärer Versuch: direkte GitHub Pages URL (normalerweise CORS-freundlich)
try {
    const res = await fetch(GHP_META_URL, { cache: "no-cache", mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status} beim Laden von GitHub Pages`);
    const meta = await res.json();
    handleMeta(meta);
    return;
} catch (err) {
    console.warn("Direkter Fetch von GitHub Pages fehlgeschlagen:", err);
    if (!isNetworkOrCORS(err)) {
    console.error("Unerwarteter Fehler beim direkten Fetch:", err);
    return;
    }
    // CORS/Network - weiter zu Fallbacks
}

// 2) Fallback: GitHub REST API (gute CORS-Unterstützung)
try {
    const metaFromApi = await fetchViaGitHubAPI(GITHUB_OWNER, GITHUB_REPO, GITHUB_PATH);
    console.info("Version via GitHub API geladen.");
    handleMeta(metaFromApi);
    return;
} catch (err) {
    console.warn("GitHub API-Fallback fehlgeschlagen:", err);
}

// 3) Fallback: öffentlicher Proxy (AllOrigins)
try {
    const metaFromProxy = await fetchViaAllOrigins(GHP_META_URL);
    console.info("Version via Proxy geladen.");
    handleMeta(metaFromProxy);
    return;
} catch (err) {
    console.warn("Proxy-Fallback fehlgeschlagen:", err);
}

// 4) Letzter Fallback: lokale meta.json (relative Datei im Projekt)
try {
    const metaLocal = await fetchLocalRelative("meta.json");
    console.info("Lokale meta.json geladen.");
    handleMeta(metaLocal, {localFallback: true});
    return;
} catch (err) {
    console.warn("Lokale meta.json nicht gefunden oder Fehler:", err);
}

// Alles gescheitert
console.error("Versionsprüfung: Alle Methoden gescheitert. (CORS/Netzwerk/Dateifehler)");
if (versionLabel) {
    versionLabel.innerHTML += ` <span style="color:crimson">(Versionsprüfung fehlgeschlagen)</span>`;
}
}

// Verarbeite geladene meta.json
function handleMeta(meta, opts = {}) {
try {
    const remoteVersion = (meta && meta.version) ? String(meta.version).trim() : null;
    const changelog = meta && meta.changelog ? String(meta.changelog) : "";

    if (!remoteVersion) {
    console.warn("meta.json enthält keine version.");
    if (opts.localFallback) {
        console.log("Lokaler Fallback verwendet, keine Onlineprüfung möglich.");
    }
    return;
    }

    console.log("Remote Version:", remoteVersion, "| Lokal:", CURRENTVERSION);

    if (isNewerVersion(remoteVersion, CURRENTVERSION)) {
    const msg = `Neue Version verfügbar: ${remoteVersion}\nAktuell: ${CURRENTVERSION}\n\n${changelog}`;
    // UI: label + alert
    const versionLabel = document.getElementById("version-label");
    if (versionLabel) {
        versionLabel.innerHTML = `Aktuelle Version: ${CURRENTVERSION} — <strong style="color:darkgreen">Neu: <a href="${DATAURL}" target="_blank" rel="noopener noreferrer">${remoteVersion}</a></strong>`;
    }
    alert(msg);
    } else {
    console.log("Version ist aktuell.");
    const versionLabel = document.getElementById("version-label");
    if (versionLabel) {
        versionLabel.innerHTML = `Aktuelle Version: ${CURRENTVERSION} (Server: <a href="${DATAURL}" target="_blank" rel="noopener noreferrer">${remoteVersion}</a>)`;
    }
    }
} catch (err) {
    console.error("Fehler beim Verarbeiten der meta.json:", err);
}
}
