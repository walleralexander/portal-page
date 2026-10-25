<?php
// Meldeformular "Eintrag melden": prueft serverseitig und mailt ueber mailrelay.
// Empfaenger nur in REPORT_TO (.env), nie im Frontend.
declare(strict_types=1);

date_default_timezone_set('Europe/Vienna');
header('Content-Type: application/json; charset=utf-8');

function reply(int $code, string $msg): never {
    http_response_code($code);
    echo json_encode(['ok' => $code === 200, 'message' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') reply(405, 'Nur POST erlaubt.');

$to   = getenv('REPORT_TO') ?: '';
$from = getenv('REPORT_FROM') ?: 'lvs@vmcv.at';
$smtp = getenv('SMTP_HOST') ?: 'mailrelay';
$port = (int)(getenv('SMTP_PORT') ?: 25);
if ($to === '') reply(500, 'Meldungen sind derzeit nicht moeglich.');

// ponytail: Rate-Limit per IP in Dateien unter /tmp, reicht fuer ein Formular mit wenig Last.
$ip = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '')[0]);
$rlFile = sys_get_temp_dir() . '/report_' . hash('sha256', $ip);
$now = time();
$hits = array_filter(
    is_file($rlFile) ? array_map('intval', file($rlFile, FILE_IGNORE_NEW_LINES)) : [],
    fn($t) => $t > $now - 600
);
if (count($hits) >= 3) reply(429, 'Zu viele Meldungen. Bitte spaeter erneut versuchen.');

$in = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($in)) reply(400, 'Ungueltige Anfrage.');

$clean = fn($v, int $max) => mb_substr(trim(str_replace("\0", '', (string)($v ?? ''))), 0, $max);
$types   = ['falsch' => 'Eintrag ist falsch', 'fehlt' => 'Eintrag fehlt', 'anderes' => 'Anderes Problem'];
$type    = $types[$in['type'] ?? ''] ?? null;
$url     = $clean($in['url'] ?? '', 500);
$details = $clean($in['details'] ?? '', 1500);
$email   = $clean($in['email'] ?? '', 200);
$startedAt = (int)($in['started_at'] ?? 0);

// Bots: Honeypot gefuellt oder in unter 3 s abgeschickt -> still "ok", nichts senden.
if ($clean($in['website'] ?? '', 200) !== '' || $startedAt <= 0 || $now * 1000 - $startedAt < 3000) {
    reply(200, 'Danke fuer die Meldung.');
}
if ($type === null) reply(400, 'Bitte die Art der Meldung waehlen.');
if (mb_strlen($details) < 10) reply(400, 'Bitte eine genauere Beschreibung eingeben (mindestens 10 Zeichen).');
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) reply(400, 'Die E-Mail-Adresse ist ungueltig.');

$body = implode("\r\n", [
    'Neue Meldung aus dem Portal:',
    '',
    "Art: $type",
    'Betroffener Link: ' . ($url ?: '(nicht angegeben)'),
    'Rueckmeldung an: ' . ($email ?: '(keine E-Mail angegeben)'),
    'Zeitpunkt: ' . date('d.m.Y H:i'),
    '',
    'Beschreibung:',
    $details,
]);

$headers = [
    "From: VMCV Portal <$from>",
    "To: <$to>",
    'Subject: =?UTF-8?B?' . base64_encode("[Portal] Meldung: $type") . '?=',
    'Date: ' . date('r'),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
];
// filter_var oben schliesst CR/LF aus -> keine Header-Injection.
if ($email !== '') $headers[] = "Reply-To: <$email>";
$data = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($body));

function smtpSend(string $host, int $port, string $from, string $to, string $data): bool {
    $s = @fsockopen($host, $port, $errno, $errstr, 10);
    if (!$s) return false;
    stream_set_timeout($s, 15);
    $expect = function (string $code) use ($s): bool {
        while (($line = fgets($s, 512)) !== false) {
            if ($line[3] === ' ') return str_starts_with($line, $code);
        }
        return false;
    };
    $cmd = function (string $c, string $code) use ($s, $expect): bool {
        fwrite($s, "$c\r\n");
        return $expect($code);
    };
    $ok = $expect('220')
        && $cmd('EHLO portal.vmcv.at', '250')
        && $cmd("MAIL FROM:<$from>", '250')
        && $cmd("RCPT TO:<$to>", '250')
        && $cmd('DATA', '354')
        // Base64-Body hat keine Zeile ".", Dot-Stuffing unnoetig.
        && $cmd($data . "\r\n.", '250');
    fwrite($s, "QUIT\r\n");
    fclose($s);
    return $ok;
}

if (!smtpSend($smtp, $port, $from, $to, $data)) {
    error_log('report.php: SMTP-Versand fehlgeschlagen');
    reply(502, 'Senden fehlgeschlagen. Bitte spaeter erneut versuchen.');
}

$hits[] = $now;
file_put_contents($rlFile, implode("\n", $hits), LOCK_EX);
reply(200, 'Danke fuer die Meldung. Sie wurde verschickt.');
