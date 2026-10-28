#!/usr/bin/env python3
"""Holt die Profilbilder aller Instagram-Links aus portal.vmcv.at und kopiert sie auf server.

Laeuft auf Alex' PC (Heim-IP, keine Zugangsdaten). Nur Standardbibliothek.
Aufruf:  python ig-logos.py            (holen + per scp auf server)
         python ig-logos.py --nur-holen (nur in Ordner ig-logos/ speichern)
         python ig-logos.py --hochladen (nur Downloads/ig-logos/ von der Chrome-Erweiterung hochladen)
Ziel:    server.vmcv.at:/workspace/vmcv-portal/public/img/ig/<konto>.jpg
"""
import pathlib, re, subprocess, sys, urllib.request

PORTAL = "https://portal.vmcv.at/links.yaml"
ZIEL = "root@server.vmcv.at:/workspace/vmcv-portal/public/img/ig/"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
OUT = pathlib.Path(__file__).with_name("ig-logos")


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "de-AT,de;q=0.9"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()


def main() -> int:
    if "--hochladen" in sys.argv:  # Bilder kommen von der Chrome-Erweiterung (tools/ig-logos-chrome)
        return hochladen(pathlib.Path.home() / "Downloads" / "ig-logos")
    yaml = get(PORTAL).decode()
    konten = sorted(set(re.findall(r"instagram\.com/([A-Za-z0-9_.]+)", yaml)))
    OUT.mkdir(exist_ok=True)
    fehlt = []
    for k in konten:
        try:
            html = get(f"https://www.instagram.com/{k}/").decode("utf-8", "replace")
            m = re.search(r'<meta property="og:image" content="([^"]+)"', html)
            if not m:
                raise ValueError("kein og:image (Instagram verlangt Login)")
            bild = get(m.group(1).replace("&amp;", "&"))
            (OUT / f"{k}.jpg").write_bytes(bild)
            print(f"ok     {k}  ({len(bild)} Bytes)")
        except Exception as e:  # ein Konto darf die anderen nicht abbrechen
            fehlt.append(k)
            print(f"FEHLT  {k}: {e}")

    if "--nur-holen" not in sys.argv:
        hochladen(OUT)
    if fehlt:
        print("Nicht geholt:", ", ".join(fehlt))
    return 1 if fehlt else 0


def hochladen(ordner: pathlib.Path) -> int:
    dateien = sorted(str(p) for p in ordner.glob("*.jpg"))
    if not dateien:
        print(f"Keine Bilder in {ordner}")
        return 1
    subprocess.run(["ssh", "-p", "47251", ZIEL.split(":")[0], "mkdir -p " + ZIEL.split(":")[1]], check=True)
    subprocess.run(["scp", "-P", "47251", *dateien, ZIEL], check=True)
    print(f"{len(dateien)} Bilder nach {ZIEL} kopiert.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
