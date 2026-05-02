<div align="center">

<img src="https://img.shields.io/badge/version-0.1.0-blue?style=flat-square" />
<img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />
<img src="https://img.shields.io/badge/docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white" />

<br> <br>

```
        ██████╗ ██████╗ ███████╗███╗   ██╗    ██████╗ ██████╗ ██╗███╗   ██╗████████╗
         ██╔═══██╗██╔══██╗██╔════╝████╗  ██║    ██╔══██╗██╔══██╗██║████╗  ██║╚══██╔══╝
         ██║   ██║██████╔╝█████╗  ██╔██╗ ██║    ██████╔╝██████╔╝██║██╔██╗ ██║   ██║   
         ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║    ██╔═══╝ ██╔══██╗██║██║╚██╗██║   ██║   
         ╚██████╔╝██║     ███████╗██║ ╚████║    ██║      ██║  ██║██║██║ ╚████║   ██║   
          ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝   ╚═╝      ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝   ╚═╝  

     ██████╗  █████╗ ███████╗██╗  ██╗
     ██╔══██╗██╔══██╗██╔════╝██║  ██║
     ██║  ██║███████║███████╗███████║
     ██║  ██║██╔══██║╚════██║██╔══██║
     ██████╔╝██║  ██║███████║██║  ██║
      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝

```

### Your 3D printer, fully visible. No cloud required.

**OpenPrintDashboard** is a beautiful, self-hosted dashboard for Bambu Lab 3D printers.  
Live status, filament inventory, print history, cost tracking — all in one place, all yours.

<br />

[🚀 Quick Start](#-quick-start) · [✨ Features](#-features) · [⚙️ Configuration](#%EF%B8%8F-configuration) · [🗺️ Roadmap](#%EF%B8%8F-roadmap)

<br />

</div>

---

## ✨ Features

### 🖨️ Live Printer Status
Real-time data streamed directly from your printer over your local network via MQTT — no polling, no lag.
- Nozzle & bed temperature (current + target)
- Print progress bar, layer count, and time remaining
- Cooling fan speed and print speed level
- Online / offline detection
- Auto-reconnects after network blips

<img width="800" alt="{FD839F04-1978-4423-B766-153F8D3C6BBA}" src="https://github.com/user-attachments/assets/45fe02d7-1744-44b9-a927-ea94e821ea9a" /> <br> <br>



### 📊 Print History & Analytics
Every print is automatically captured and logged when it completes.
- Full print timeline with title, duration, weight used
- Status tracking: Finished / Canceled / Running
- Success rate statistics
- Cover image thumbnails from Bambu Cloud
- Delete individual records to clean up your history

<img width="800" alt="{E3A513A6-D0BE-4BAB-AAD6-5E50F2B00795}" src="https://github.com/user-attachments/assets/f552e7e1-4aed-4a49-a5d9-990ed040b236" />
<img width="800" alt="{3D7260DF-735A-4490-AD50-93BE3D179B08}" src="https://github.com/user-attachments/assets/92f3735d-ce22-45bb-8168-a2b9ece6b6b6" /><br> <br>


### 🎨 Filament Library
Build a catalogue of every filament type you own, with all the details that matter.
- Brand, material type, and color (with visual color swatch)
- Nozzle and bed temperature profiles
- Bambu AMS info index for automatic slot mapping
- Remaining stock aggregated across all spools
- Average price per kg, calculated from real purchase data

<img width="800" alt="{7B86884E-5E37-471E-8EDC-6E92E82EE0DF}" src="https://github.com/user-attachments/assets/c0aaee83-4664-4203-b07f-e34af6212b6e" /><br> <br>


### 🧵 Spool Inventory
Track individual spools from purchase to empty.
- Remaining weight with a color-coded progress bar
- Mark a spool as active (currently loaded in the printer)
- NFC tag support — scan a tag to instantly activate a spool
- Price per kg for per-print cost calculations
- Usage automatically deducted after every print

<img width="800" alt="{D344FB10-801D-43ED-AEC8-F6974E3A808E}" src="https://github.com/user-attachments/assets/63db7912-07f4-4c99-8975-9bca487dd1b7" /><br> <br>




---


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
<br><br>
```
Step 1: Create Account
     (local admin)
```
<img width="600" alt="{09A32FFD-8D3D-494B-BB68-3A63E58B7C85}" src="https://github.com/user-attachments/assets/fa60fa82-6124-48d6-9da4-5885fd0f8cba" /><br><br>
```
Step 2: Bambu Lab Login   →   Step 3: Printer Setup
(cloud sync + history)        (LAN connection)
```
<img width="600" alt="{38251648-B05F-4E96-B369-7CCE06B1FD88}" src="https://github.com/user-attachments/assets/1686ee65-41e0-4c54-8b83-7d71874fe846" /><br><br>
```
Step 3: Verification Code
     (IF activated)
```
<img width="600" alt="{EA0E10D4-21A5-47C8-8605-5130462C086A}" src="https://github.com/user-attachments/assets/0e118c5d-f6e2-4f23-a293-f90e4656d103" /><br><br>
```
Step 4: Printer Setup
   (LAN connection)
```
<img width="600" alt="{FF73790A-81B4-4846-BBDB-DEE7133FDAE7}" src="https://github.com/user-attachments/assets/c0222dc0-6fe0-4cb7-bb0a-e2e5a1f4ddbb" />

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


---

## 🔄 Updating

```bash
git pull
docker compose down
docker compose up -d --build
```

Your database data is persisted in a Docker volume (`postgres_data`) and survives updates.

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
