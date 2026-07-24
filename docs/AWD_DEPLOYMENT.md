# AWD — Deployment-Referenz

Stand: 24.07.2026 · Standard-Version 1.0 · Live seit 24.07.2026

Diese Datei beschreibt den **Produktivstand** des Agent-Washing-Detektors und die
Architektur des Deployments. Sie ist eine Referenz, **kein** abzuarbeitendes
Server-Runbook: Server-, Datenbank- und Deployment-Schritte werden gemäß
`CLAUDE.md` §7 immer **gemeinsam Schritt für Schritt** ausgeführt, nie als Liste
zum Selbstabarbeiten hinterlegt.

---

## 1. Was läuft wo

| | |
|---|---|
| **Öffentliche URL** | https://awd.automation-boost.io |
| **Server** | gha-live (hinter dem bestehenden Traefik) |
| **Laufzeit** | Docker-Container `awd-detektor`, Next.js Standalone (`node server.js`, Port 3000, nicht als root) |
| **Compose-Projekt** | `automation-boost` (eigenes Projekt, siehe Isolation) |
| **Traefik-Router** | `awd@docker`, Entrypoint `websecure`, Cert-Resolver `letsencrypt` |
| **Deployter Commit** | `3d1b06c` (AB-032) |

Die App ist ein Next.js-App-Router-Projekt (`apps/detektor/`) im
Standalone-Output. Der gesamte Prüfstandard liegt als Content-JSON in
`apps/detektor/content/` und wird zur Laufzeit per `fs` gelesen — deshalb kopiert
das `Dockerfile` `content/` explizit ins Runtime-Image (unabhängig vom
Next-File-Tracing).

---

## 2. Isolation — harte Vorgabe

Auf gha-live laufen bereits ki-boost.io, ki-anwendungsfaelle.de u. a. im
Compose-Projekt `gha-ki-kosmos`. Der AWD ist davon **vollständig getrennt**:

- **Fester Compose-Projektname** `automation-boost` (in `docker-compose.yml`
  gepinnt). Dadurch spricht `docker compose` in diesem Repo **nie** fremde
  Container an.
- Der AWD hängt sich **read-only** an das bestehende externe Traefik-Netz
  (`live-frontend`) und nutzt die vorhandene Traefik-Middleware
  `security-headers@docker` — ohne Traefik selbst zu verändern.
- **Kein** Host-Port veröffentlicht, eigener Container-Name, eigener
  Image-Name (`awd-detektor:latest`).
- Betriebsregel: nur den Service `awd` ansprechen, **niemals** `--remove-orphans`,
  **niemals** ein Traefik-Kommando.

Vor und nach jedem Deploy-Schritt wurde geprüft, dass ki-boost.io und
ki-anwendungsfaelle.de weiter mit 200 antworten und die ops-Dienste (api, cms)
unberührt bleiben.

---

## 3. Security-Header — klare Zuständigkeit

Doppelte Header werden vermieden, indem sich App und Traefik die Header teilen:

- **Die App** (`apps/detektor/middleware.ts`) liefert **nur** die
  Content-Security-Policy. Sie ist **nonce-basiert** (`script-src` mit frischem
  Nonce pro Request, `'strict-dynamic'`, kein `'unsafe-inline'` für Skripte) —
  der eigentliche XSS-Schutz. Der Nonce muss pro Request erzeugt werden, deshalb
  kommt genau diese eine Kopfzeile aus der App.
- **Traefik** (`security-headers@docker`) liefert die statischen Schutz-Header:
  `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `X-Xss-Protection`.

Die Middleware setzt daher bewusst **keine** statischen Header mehr (sonst
Doppelausgabe).

---

## 4. DNS

`awd.automation-boost.io` zeigt per **A-Record** auf gha-live. Ein zuvor
vorhandener **AAAA**-Record verwies auf ein falsches /64 (nicht gha-live) und
hätte die Let's-Encrypt-Ausstellung gebrochen — er wurde entfernt. Die übrigen
Sites (Apex, ki-boost) sind ebenfalls A-only; das ist konsistent.

Diagnose-Hinweis für die Zukunft: Ein `curl` **von gha-live auf die eigene
öffentliche IP** landet per NAT-Loopback/Hairpin beim Hetzner-Webhosting-Apache,
**nicht** beim lokalen Traefik — das ist ein Test-Artefakt, kein Fehler. Der
echte Live-Pfad wird extern (z. B. vom Arbeitsplatz) und im Traefik-Access-Log
geprüft.

---

## 5. Build- und Deploy-Weg (beschreibend, Weg B)

Gebaut wird auf **gha-ops** (mehr RAM), das fertige Image nach **gha-live**
übertragen und dort ohne Neubau gestartet — so bleibt gha-live ressourcenschonend
und die ops-Dienste werden beim Build durch ein Speicherlimit geschützt.

Grober Ablauf (jeweils gemeinsam Schritt für Schritt, §7):

1. Auf gha-ops den aktuellen Stand des Repos bereitstellen und das Image mit
   begrenztem Speicher bauen.
2. Image als komprimiertes Archiv exportieren und über den Arbeitsplatz-PC als
   Relais nach gha-live übertragen (kein Server-zu-Server-Schlüssel vorhanden).
3. Auf gha-live das Image laden und den Service `awd` per Compose ohne Neubau
   starten.
4. Extern und im Traefik-Access-Log verifizieren; ki-boost/ki-anwendungsfaelle
   und die ops-Dienste vor/nach dem Schritt auf 200 prüfen.

Diese Schritte sind bewusst **nicht** als Kommandoliste hinterlegt. Sie werden
bei Bedarf gemeinsam durchgesprochen und ausgeführt.

---

## 6. Verifizierter Live-Stand (24.07.2026)

Extern geprüft (HEAD auf `/`):

- `HTTP 200`, gültiges Let's-Encrypt-Zertifikat, TLS 1.3.
- Genau **eine** `Content-Security-Policy` mit frischem `nonce-…` (aus der App).
- Statische Schutz-Header inkl. `Strict-Transport-Security` (aus Traefik).
- Traefik-Access-Log: Router `awd@docker` → Container-IP:3000, 200, echte externe
  Besucher laden Homepage und statische Chunks.

---

## 7. Was bewusst nicht angefasst wurde

Traefik-Konfiguration, das Compose-Projekt `gha-ki-kosmos`, ki-boost.io,
ki-anwendungsfaelle.de, die ops-Dienste (api, cms, Metabase) sowie alle
bestehenden DNS-A-Records außer dem neuen `awd`-Record.

---

## 8. Offene Punkte

- **`X-Powered-By: Next.js`** wird noch ausgeliefert. Ein Einzeiler
  (`poweredByHeader: false` in `next.config.mjs`) entfernt ihn; das wird beim
  **nächsten** Rebuild (M4–M6) mitgenommen, um das laufende System jetzt nicht
  eigens dafür anzufassen.
- **M4–M6**: Upload/Claim-Extraktion (Extraktionsmodell offen: self-hosted Ollama
  auf gha-ops vs. EU-API-Fallback), Directus/DB-Anbindung, n8n-Automationen,
  Deployment-Feinschliff — gemeinsam Schritt für Schritt.
- Deferred aus M3: B7-Scope (Marktanker P2(a), M3-Sonderfall), B8
  (`mini-ai-act` kanzleireviewpflichtig vor Launch), Next-Dependency-Bump.
