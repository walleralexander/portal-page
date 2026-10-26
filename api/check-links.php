<?php
// Prueft alle Links aus links.yaml: erreichbar? sichtbarer Text geaendert?
// Laeuft stuendlich im Container vmcv-portal-linkcheck (Schleife in docker-compose.yml).
// Kein Monitoring: nur Anzeige im Portal (roter Punkt, "Neu", Info-Popup).
// Schreibt /data/status.json (oeffentlich, ohne Hashes) und /data/state.json (intern).
declare(strict_types=1);

if (PHP_SAPI !== 'cli') exit(1);
date_default_timezone_set('Europe/Vienna');

$yaml = file_get_contents('/config/links.yaml') ?: '';
// ponytail: Regex statt YAML-Parser, links.yaml hat einfache "url:"-Zeilen. Parser, falls das Format komplexer wird.
preg_match_all('/^\s*(?:-\s*)?url:\s*["\']?([^"\'\s#]+)/m', $yaml, $m);
$urls = array_values(array_unique($m[1]));

$stateFile = '/data/state.json';
$old = is_file($stateFile) ? (json_decode((string)file_get_contents($stateFile), true) ?: []) : [];

function fetchPage(string $url): array {
    $ctx = stream_context_create(['http' => [
        'timeout' => 15,
        'ignore_errors' => true,
        'follow_location' => 1,
        'max_redirects' => 5,
        'user_agent' => 'VMCV-Portal-Linkcheck (+https://portal.vmcv.at)',
        'header' => "Accept: text/html\r\n",
    ], 'socket' => [
        // Nur IPv4: Container hat kein IPv6, PHP faellt bei AAAA-Eintraegen nicht auf IPv4 zurueck
        // (eigene Domains auf server.vmcv.at waren sonst "Network unreachable").
        'bindto' => '0.0.0.0:0',
    ]]);
    $body = @file_get_contents($url, false, $ctx, 0, 2_000_000);
    $headers = function_exists('http_get_last_response_headers')
        ? (http_get_last_response_headers() ?? [])
        : ($http_response_header ?? []);
    $code = null;
    // Bei Weiterleitungen zaehlt die letzte Statuszeile.
    foreach ($headers as $h) {
        if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $mm)) $code = (int)$mm[1];
    }
    return [$code, $body === false ? '' : $body];
}

// Nur der sichtbare Text: der rohe Code aendert sich bei vielen Seiten bei jedem Abruf
// (Tokens, Nonces). Gemessen 2026-10-26: Roh-Hash 29/52 Fehlalarme, Text-Hash 0/52.
// Ziffern fliegen raus: Uhrzeiten, Datumsangaben, Countdowns ("Zuletzt aktualisiert 13:00",
// "noch 258 Tage") sind keine Neuigkeit.
function visibleText(string $html): string {
    $html = (string)preg_replace('#<(script|style|noscript)\b[^>]*>.*?</\1>#is', ' ', $html);
    $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = (string)preg_replace('/\d+/', '', $text);
    return trim((string)preg_replace('/\s+/u', ' ', $text));
}

// Seiten mit wechselndem Inhalt aendern sich staendig; dort ist "Neu" bedeutungslos und wird
// unterdrueckt. Gemessen 2026-10-26 binnen 20 Min.: Facebook (3), bregancea.at (Bildunterschrift),
// cloud.vmcv.at. Damit das erkennbar ist, gibt es "Neu" erst nach NEW_DAYS Beobachtung (Lernphase).
const NEW_DAYS = 7;
const MAX_CHANGES_FOR_NEW = 3;

// Wartungs-/Offline-Seiten kommen oft mit Status 200 (ogv.mkv.at: "Service offline").
// Nur kurze Seiten pruefen, sonst schlaegt jedes "offline" im Fliesstext an.
// Getestet 2026-10-26 an allen Links: nur ogv.mkv.at trifft.
const SOFT_DOWN_MAX_LEN = 400;
const SOFT_DOWN = '/offline|wartungsarbeiten|wartungsmodus|in wartung|maintenance|vor(ü|ue)bergehend nicht (verf(ü|ue)gbar|erreichbar)|temporarily unavailable|account (has been )?suspended|domain.{0,30}(zu verkaufen|for sale)/iu';

$now = time();
$state = [];
$public = [];
$down = $changed = 0;

foreach ($urls as $url) {
    $s = $old[$url] ?? [];
    $s['first_seen'] ??= time();
    [$code, $body] = fetchPage($url);
    // 401/403: Seite ist da, nur geschuetzt.
    $ok = $code !== null && ($code < 400 || $code === 401 || $code === 403);
    $reason = null;
    $text = $ok ? visibleText($body) : '';
    if ($ok && mb_strlen($text) < SOFT_DOWN_MAX_LEN && preg_match(SOFT_DOWN, $text, $mm)) {
        $ok = false;
        $reason = "Seite meldet „{$mm[0]}“";
    }

    if ($ok) {
        unset($s['down_since']);
        if ($text !== '') {
            $h = hash('sha256', $text);
            if (!isset($s['hash'])) {
                $s['hash'] = $h;                    // erster Lauf: nur Basis, kein "Neu"
            } elseif ($h === $s['hash']) {
                unset($s['pending']);
            } elseif (($s['pending'] ?? null) === $h) {
                $s['hash'] = $h;                    // zweimal gleich gesehen -> echte Aenderung
                $s['changes'][] = $now;
                unset($s['pending']);
            } else {
                $s['pending'] = $h;                 // abwarten, ob der neue Stand bleibt
            }
        }
    } else {
        $s['down_since'] ??= $now;
        $down++;
    }
    $s['code'] = $code;
    $s['changes'] = array_values(array_filter($s['changes'] ?? [], fn($t) => $t > $now - NEW_DAYS * 86400));
    $state[$url] = $s;

    $recent = $s['changes'];
    $learned = $s['first_seen'] <= $now - NEW_DAYS * 86400;
    $isNew = $learned && $recent && count($recent) <= MAX_CHANGES_FOR_NEW;
    if ($isNew) $changed++;
    $public[$url] = [
        'ok' => $ok,
        'code' => $code,
        'reason' => $reason,
        'down_since' => isset($s['down_since']) ? date('c', $s['down_since']) : null,
        'changed' => $isNew ? date('c', end($recent)) : null,
    ];
}

function writeJson(string $file, array $data): void {
    file_put_contents("$file.tmp", json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    rename("$file.tmp", $file);
}
writeJson($stateFile, $state);
writeJson('/data/status.json', ['checked' => date('c', $now), 'links' => $public]);

echo date('Y-m-d H:i') . ' Linkcheck: ' . count($urls) . " Links, $down nicht erreichbar, $changed in 7 Tagen geaendert\n";
