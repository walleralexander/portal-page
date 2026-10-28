// Klick aufs Symbol: alle Instagram-Konten aus portal.vmcv.at/links.yaml der Reihe nach im
// Hintergrund-Tab oeffnen (eingeloggte Sitzung), Profilbild lesen, nach Downloads/ig-logos/<konto>.jpg.
// Ergebnis: Badge (Anzahl ok, rot = Fehler), Details in der Service-Worker-Konsole (chrome://extensions).
const PORTAL = 'https://portal.vmcv.at/links.yaml';
const sleep = ms => new Promise(r => setTimeout(r, ms));

function loaded(tabId) {
  return new Promise(resolve => {
    const fn = (id, info) => {
      if (id === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(fn);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(fn);
  });
}

// Laeuft in der Instagram-Seite: Profilbild im Kopf, sonst og:image.
function findPic() {
  const img = document.querySelector('header img');
  if (img && img.src) return img.src;
  const og = document.querySelector('meta[property="og:image"]');
  return og ? og.content : null;
}

chrome.action.onClicked.addListener(async () => {
  chrome.action.setBadgeBackgroundColor({ color: '#666' });
  chrome.action.setBadgeText({ text: '…' });
  const yaml = await (await fetch(PORTAL, { cache: 'no-store' })).text();
  const konten = [...new Set([...yaml.matchAll(/instagram\.com\/([A-Za-z0-9_.]+)/g)].map(m => m[1]))].sort();
  const fehlt = [];
  let ok = 0;

  for (const k of konten) {
    const tab = await chrome.tabs.create({ url: `https://www.instagram.com/${k}/`, active: false });
    try {
      await loaded(tab.id);
      let src = null;
      for (let i = 0; i < 10 && !src; i++) {   // Seite rendert nach "complete" noch nach
        await sleep(1000);
        [{ result: src }] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: findPic });
      }
      if (!src) throw new Error('kein Profilbild gefunden');
      await chrome.downloads.download({ url: src, filename: `ig-logos/${k}.jpg`, conflictAction: 'overwrite' });
      ok++;
      console.log('ok', k);
    } catch (e) {
      fehlt.push(k);
      console.warn('FEHLT', k, e.message);
    } finally {
      chrome.tabs.remove(tab.id);
    }
    chrome.action.setBadgeText({ text: String(ok) });
    await sleep(1500);   // nicht im Sekundentakt bei Instagram anklopfen
  }

  chrome.action.setBadgeBackgroundColor({ color: fehlt.length ? '#c00' : '#080' });
  console.log(`${ok}/${konten.length} geholt`, fehlt.length ? 'fehlt: ' + fehlt.join(', ') : '');
});
