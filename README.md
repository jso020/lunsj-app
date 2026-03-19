# Lunsj-app (v1)

En enkel app der ansatte logger inn med OAuth2/OIDC, registrerer om de er pa jobb man-fre i innevaerende uke, og backend sender Excel-rapport pa e-post kl. 08:00.

## Funksjoner i v1

- OIDC-login med domene-sjekk (styres med `ALLOWED_EMAIL_DOMAIN`, default `computas.com`)
- Registrering av ukevalg (man-fre)
- Valg av uke (denne eller neste)
- Ukemeny med "dagens rett"
- Lagring i lokal JSON-fil
- Daglig scheduler kl. 08:00 (serverens lokale tid)
- Excel-rapport (`.xlsx`) + e-post via SMTP
- Admin-endepunkt for manuell rapportkjøring
- Admin-knapp i UI for nedlasting av Excel-rapport

## Kjor lokalt

1. Installer avhengigheter:
   `npm install`
2. Lag `.env` fra `.env.example` og fyll ut verdier.
3. Start appen:
   `npm run dev`
4. Aapne `http://localhost:3000`

## Rask dev-test uten OIDC

Hvis du vil teste flyten uten ferdig OIDC-oppsett, sett:
`DEV_AUTH_BYPASS_EMAIL=fornavn.etternavn@computas.com`

Da vil "Logg inn med OAuth2" bruke lokal dev-login automatisk.

## Viktige env-variabler

- `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_REDIRECT_URI`
- `ALLOWED_EMAIL_DOMAIN`
- `DEV_AUTH_BYPASS_EMAIL` (kun lokal dev)
- `SESSION_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `REPORT_FROM_EMAIL`, `REPORT_TO_EMAIL`
- `ADMIN_TRIGGER_TOKEN`
- `ADMIN_EMAILS` (kommaseparert liste over admin-brukere)

## API

- `GET /api/me` - hvem er logget inn
- `GET /api/week` - henter status for innevaerende uke
- `POST /api/week` - lagrer status for valgt uke (`?week=current|next`)
- `POST /api/admin/run-report` - trigger rapport manuelt (`x-admin-token`)
- `GET /api/admin/report/download` - laster ned Excel for innevaerende uke (krever innlogget admin)
- `POST /api/admin/menu` - oppdaterer meny for valgt uke (`?week=current|next`, admin)

## Neste steg

- Bytte JSON-lagring til database (f.eks. Postgres)
- Bedre access-kontroll (roller/admin)
- Integrere Google Calendar for autofyll
- Legge pa deploy-oppsett (f.eks. Azure Web App + Key Vault)
