<div align="center">

<img src="https://img.shields.io/badge/version-0.1.0-blue?style=flat-square" />
<img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />
<img src="https://img.shields.io/badge/self--hosted-yes-purple?style=flat-square" />
<img src="https://img.shields.io/badge/cloud-optional-orange?style=flat-square" />
<img src="https://img.shields.io/badge/docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white" />

<br /><br />

```
  ██████╗ ██████╗ ███████╗███╗   ██╗    ██████╗ ██████╗ ██╗███╗   ██╗████████╗
 ██╔═══██╗██╔══██╗██╔════╝████╗  ██║    ██╔══██╗██╔══██╗██║████╗  ██║╚══██╔══╝
 ██║   ██║██████╔╝█████╗  ██╔██╗ ██║    ██████╔╝██████╔╝██║██╔██╗ ██║   ██║   
 ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║    ██╔═══╝ ██╔══██╗██║██║╚██╗██║   ██║   
 ╚██████╔╝██║     ███████╗██║ ╚████║    ██║      ██║  ██║██║██║ ╚████║   ██║   
  ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝   ╚═╝      ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝   ╚═╝  

        D  A  S  H  B  O  A  R  D
```

### Your 3D printer, fully visible. No cloud required.

**OpenPrintDashboard** is a beautiful, self-hosted dashboard for Bambu Lab 3D printers.  
Live status, filament inventory, print history, cost tracking — all in one place, all yours.

<br />

[🚀 Quick Start](#-quick-start) · [✨ Features](#-features) · [📸 Screenshots](#-screenshots) · [⚙️ Configuration](#%EF%B8%8F-configuration) · [🗺️ Roadmap](#%EF%B8%8F-roadmap)

<br />

> 📸 **Screenshots / demo video wanted here** — if you have the dashboard running, open a PR or issue with screenshots and we'll feature them prominently!

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🖨️ Live Printer Status
Real-time data streamed directly from your printer over your local network via MQTT — no polling, no lag.
- Nozzle & bed temperature (current + target)
- Print progress bar, layer count, and time remaining
- Cooling fan speed and print speed level
- Online / offline detection
- Auto-reconnects after network blips

</td>
<td width="50%">

### 📊 Print History & Analytics
Every print is automatically captured and logged when it completes.
- Full print timeline with title, duration, weight used
- Status tracking: Finished / Canceled / Running
- Success rate statistics
- Cover image thumbnails from Bambu Cloud
- Delete individual records to clean up your history

</td>
</tr>
<tr>
<td width="50%">

### 🎨 Filament Library
Build a catalogue of every filament type you own, with all the details that matter.
- Brand, material type, and color (with visual color swatch)
- Nozzle and bed temperature profiles
- Bambu AMS info index for automatic slot mapping
- Remaining stock aggregated across all spools
- Average price per kg, calculated from real purchase data

</td>
<td width="50%">

### 🧵 Spool Inventory
Track individual spools from purchase to empty.
- Remaining weight with a color-coded progress bar
- Mark a spool as active (currently loaded in the printer)
- NFC tag support — scan a tag to instantly activate a spool
- Price per kg for per-print cost calculations
- Usage automatically deducted after every print

</td>
</tr>
<tr>
<td width="50%">

### 💰 Cost Estimation
Know exactly how much each print costs before you even remove it from the bed.
- Cost calculated from spool price × grams used
- Averages across the last 5 purchases of the same filament
- Cumulative cost displayed on the dashboard overview
- Per-print breakdown in print history

</td>
<td width="50%">

### 🔐 Self-Hosted & Private
Your data lives on your hardware. Full stop.
- Single-user account with secure password hashing
- Guided setup wizard — no manual config files needed
- All data stored in a local PostgreSQL database
- Works entirely on your LAN; cloud is optional for history sync
- Docker Compose deployment — up in minutes

</td>
</tr>
</table>

---

## 📸 Screenshots

> 🙏 **We need your screenshots!**  
> This project is young and we'd love to show it off properly.  
> If you're running OpenPrintDashboard, please [open an issue](../../issues/new) or PR with screenshots of:
> - The main dashboard (especially while a print is running!)
> - The filament / spool pages
> - The print history table
> - The setup wizard
>
> A short screen recording or GIF of the live printer status updating in real time would be absolutely incredible.

*Until then, here's what each page contains at a glance:*

| Page | What you'll see |
|------|----------------|
| **Dashboard** | Stat cards (prints, filament used, print time, total cost) · live printer card with temps and progress · loaded filament swatch · inventory summary · recent prints table |
| **Printer** | Device card with online/offline badge · nozzle/bed/fan/speed cards · active print progress · firmware versions |
| **Print History** | Filterable table with cover thumbnails · quick stats (total, completed, canceled, success rate) · detail modal |
| **Filaments** | Color grid of all filament types · remaining weight per type · temperature profiles |
| **Spools** | Spool cards with color-coded fill bars · active spool badge · NFC UID display |
| **Settings** | Account info · Bambu Cloud connection status · printer IP/serial/access code editor |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Your Network                          │
│                                                             │
│   ┌──────────────┐   MQTT/8883   ┌──────────────────────┐  │
│   │  Bambu Lab   │◄─────────────►│                      │  │
│   │   Printer    │               │    FastAPI Backend    │  │
│   └──────────────┘               │    (Python 3.13)     │  │
│                                  │                      │  │
│   ┌──────────────┐   REST API    │  ┌────────────────┐  │  │
│   │  Bambu Lab   │◄─────────────►│  │  PostgreSQL 16 │  │  │
│   │  Cloud API   │               │  │   (your data)  │  │  │
│   └──────────────┘               │  └────────────────┘  │  │
│                                  └──────────┬───────────┘  │
│                                             │ REST          │
│                                  ┌──────────▼───────────┐  │
│                                  │   Next.js Frontend   │  │
│                                  │  (React 19 + TS)     │  │
│                                  └──────────────────────┘  │
│                                             ▲               │
└─────────────────────────────────────────────┼───────────────┘
                                              │
                                        Your Browser
```

**Stack at a glance:**

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 |
| Backend | FastAPI · Python 3.13 · SQLModel · Pydantic |
| Database | PostgreSQL 16 |
| Protocol | MQTT (local LAN, TLS) · Bambu Cloud REST API |
| Deployment | Docker · Docker Compose |

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed
- Your Bambu Lab printer on the same local network
- Your printer's **IP address**, **serial number**, and **access code** (see [finding these values](#finding-printer-credentials))

### 1. Clone the repository

```bash
git clone https://github.com/your-username/OpenPrintDashboard.git
cd OpenPrintDashboard
```

### 2. Create your environment file

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
POSTGRES_USER=opd
POSTGRES_PASSWORD=change_me_please
POSTGRES_DB=openprintdashboard
```

### 3. Start the stack

```bash
docker compose up -d
```

That's it. Docker will pull the images, start the database, API, and web frontend.

### 4. Run the setup wizard

Open **http://localhost:3000** in your browser.

You'll be guided through three steps:

```
Step 1: Create Account   →   Step 2: Bambu Lab Login   →   Step 3: Printer Setup
     (local admin)            (cloud sync + history)        (LAN connection)
```

> **Note:** After completing the printer setup, the backend will automatically connect to your printer via MQTT. First data usually arrives within a few seconds.

---

## ⚙️ Configuration

### Finding Printer Credentials

You'll need three values from your printer:

| Value | Where to find it |
|-------|-----------------|
| **IP Address** | Printer touchscreen → **Settings** → **Network** → **IP Address** — or check your router's DHCP client list |
| **Serial Number** | Printer touchscreen → **Settings** → **Device** → **Serial Number** — also on the sticker on the back of the machine |
| **Access Code** | Printer touchscreen → **Settings** → **Network** → **Access Code** — requires LAN mode to be enabled |

📖 Official guide: [Bambu Lab Wiki — Finding Serial Number](https://wiki.bambulab.com/en/general/find-sn)

### Enabling LAN Mode

LAN mode must be enabled on your printer for direct MQTT communication to work:

1. On the printer screen, go to **Settings**
2. Navigate to **Network**
3. Enable **LAN Mode** (also called "Local LAN")
4. Note the **Access Code** shown on this screen

### Docker Compose Configuration

The default `compose.yml` exposes:

| Service | Port | Description |
|---------|------|-------------|
| `web` | `3000` | Next.js frontend |
| `api` | `8000` | FastAPI backend + Swagger UI at `/docs` |
| `db` | `5432` | PostgreSQL (internal, exposed for debugging) |

To run on a different port, edit `compose.yml`:

```yaml
services:
  web:
    ports:
      - "8080:3000"   # Change 8080 to whatever you want
```

### API Environment Variables

The backend reads from `api/.env` (copy from `api/.env.example`):

```env
# Optional — the setup wizard writes these to the database automatically
PRINTER_IP=192.168.0.100
PRINTER_SERIAL=03919C462700XXX
PRINTER_ACCESS_CODE=12345678

DEBUG=False
```

> **Tip:** You don't need to set these manually — the setup wizard saves them to the database. Environment variables are a fallback for headless deployments.

---

## 🔄 Updating

```bash
git pull
docker compose down
docker compose up -d --build
```

Your database data is persisted in a Docker volume (`postgres_data`) and survives updates.

---

## 🧵 NFC Spool Scanning

OpenPrintDashboard supports NFC tags on spools for instant activation. Here's the flow:

1. Attach an NFC tag to a spool
2. POST the tag's UID to `/spools/scan` — the API matches it to a spool and activates it
3. First scan of an unknown tag returns `found: false` with a list of unassigned spools
4. Assign the tag to a spool via `/spools/scan/assign`
5. Every subsequent scan of that tag auto-activates the correct spool

This is designed to work with a small NFC reader connected to a Raspberry Pi or similar device sitting next to your printer.

---

## 🗺️ Roadmap

These are planned features — contributions welcome!

- [ ] **Multi-printer support** — monitor more than one printer simultaneously
- [ ] **Klipper / Moonraker support** — extend beyond Bambu Lab ecosystem
- [ ] **OctoPrint support**
- [ ] **Prusa Connect support**
- [ ] **Camera stream** — live view using the Bambu ttcode API (groundwork already laid)
- [ ] **Notifications** — push alerts on print complete, failure, or low filament
- [ ] **Charts & analytics** — weekly/monthly print trends, material usage over time
- [ ] **Mobile app** — React Native companion
- [ ] **Reverse proxy / HTTPS guide** — for external access

Have an idea? [Open a discussion](../../discussions/new) or a feature request issue.

---

## 🛠️ Development

### Running locally (without Docker)

**Backend:**

```bash
cd api
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Set your database URL
export DATABASE_URL=postgresql://opd:password@localhost:5432/openprintdashboard

uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd web
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000` and the API at `http://localhost:8000`.

**API docs** (Swagger UI): `http://localhost:8000/docs`

### Project Structure

```
OpenPrintDashboard/
├── api/                        # FastAPI backend
│   ├── app/
│   │   ├── core/               # Config, MQTT commands, exceptions
│   │   ├── db/                 # SQLModel models, database engine, helpers
│   │   ├── routers/            # auth, printers, prints, filaments, spools, settings, users
│   │   └── services/           # BambuClient (MQTT), BambuCloudClient, PrinterService
│   ├── requirements.txt
│   └── Dockerfile
├── web/                        # Next.js frontend
│   ├── app/
│   │   ├── dashboard/          # Dashboard, Printer, Prints, Filaments, Spools, Settings pages
│   │   └── setup/              # Setup wizard
│   ├── components/
│   │   ├── layout/             # Sidebar, DashboardLayout
│   │   └── ui/                 # Card, Button, Badge, Input, Modal, EmptyState, StatCard
│   ├── lib/                    # api.ts, auth.tsx, utils.ts
│   └── Dockerfile
├── compose.yml
└── .env.example
```

---

## 🤝 Contributing

Contributions are very welcome! This project is in early development and there's a lot of ground to cover.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Open a pull request with a clear description

Please open an issue first for larger changes so we can discuss the approach.

---

## 📄 License

MIT — do whatever you want, just keep the attribution. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- MQTT commands adapted from [ha-bambulab](https://github.com/greghesp/ha-bambulab) by greghesp
- Built on top of the unofficial Bambu Lab cloud and MQTT APIs

---

## Use of AI

- Intigrated JetBrains AI assistant for smart code completion
- Github Copilot for code review and error checking
- Claude for react components and help with all kinds of things

<div align="center">

Made with ❤️ for the 3D printing community

⭐ **Star this repo** if it's useful to you — it helps others find it!

</div>
