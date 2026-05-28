<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Marky012/LogicPlay">
    <img src="frontend\public\favicon.png" alt="Logo" width="120" height="120">
  </a>

  <h1 align="center">LogicPlay</h1>

  <p align="center">
    <strong>Gamified Digital Logic Learning Platform</strong>
    <br />
    Build, simulate, and master digital logic circuits through play.
    <br />
    <a href="https://logicplay-demo.vercel.app"><strong>Try Live Demo »</strong></a>
    ·
    <a href="https://github.com/your-username/LogicPlay/issues">Report Bug</a>
    ·
    <a href="https://github.com/your-username/LogicPlay/issues">Request Feature</a>
  </p>

  <!-- BADGES -->
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square" alt="Version">
    <!-- <img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License"> -->
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome">
    <img src="https://img.shields.io/badge/stack-React%20%7C%20FastAPI%20%7C%20Tailwind%20CSS-informational?style=flat-square" alt="Tech Stack">
    <img src="https://img.shields.io/badge/PWA-ready-blueviolet?style=flat-square&logo=pwa" alt="PWA Ready">
    <img src="https://img.shields.io/badge/ML--Powered-scikit--learn-orange?style=flat-square" alt="ML Powered">
  </p>
</div>

<br />

---

## <img src="images/icons/grid.svg" width="22" height="22" valign="middle"/> Table of Contents
- [<img src="images/icons/bullseye-arrow.svg" width="16" height="16" valign="middle"/> Overview](#overview)
- [<img src="images/icons/features.svg" width="16" height="16" valign="middle"/> Features](#features)
- [<img src="images/icons/photo-capture.svg" width="16" height="16" valign="middle"/> Demo & Screenshots](#demo--screenshots)
- [<img src="images/icons/code-window.svg" width="16" height="16" valign="middle"/> Tech Stack](#tech-stack)
- [<img src="images/icons/time-fast.svg" width="16" height="16" valign="middle"/> Quick Start](#quick-start)
- [<img src="images/icons/overview.svg" width="16" height="16" valign="middle"/> Detailed Setup](#detailed-setup)
- [<img src="images/icons/urban-planning.svg" width="16" height="16" valign="middle"/> Architecture](#architecture)
- [<img src="images/icons/console-controller.svg" width="16" height="16" valign="middle"/> Gamification System](#gamification-system)
- [<img src="images/icons/road-map-pin.svg" width="16" height="16" valign="middle"/> Roadmap](#roadmap)
- [<img src="images/icons/apps-add.svg" width="16" height="16" valign="middle"/> Contributing](#contributing)
- [<img src="images/icons/time-check.svg" width="16" height="16" valign="middle"/> License](#license)

---

## <img src="images/icons/bullseye-arrow.svg" width="24" height="24" valign="middle"/> Overview
**LogicPlay** transforms the way students and enthusiasts learn digital logic design. By combining a **drag‑and‑drop circuit builder**, **real‑time signal flow animation**, **instant ML‑powered grading**, and a full **gamification engine**, LogicPlay makes mastering gates, flip‑flops, and combinational/sequential circuits engaging, fun, and effective.

It works entirely in the browser (desktop & mobile) thanks to its **Progressive Web App (PWA)** architecture, and can even run **offline**.

---

## <img src="images/icons/features.svg" width="24" height="24" valign="middle"/> Features

| Category | Highlights |
|----------|------------|
| <img src="images/icons/apps-add.svg" width="18" height="18" valign="middle"/> **Circuit Builder** | Intuitive drag‑and‑drop canvas, unlimited undo/redo, component snapping |
| <img src="images/icons/time-fast.svg" width="18" height="18" valign="middle"/> **Real‑Time Simulation** | Live signal propagation with animated wires (powered by **p5.js**) |
| <img src="images/icons/user-robot.svg" width="18" height="18" valign="middle"/> **Auto‑Grading** | Instant feedback on exercises using an **ML model** (scikit‑learn) that understands truth tables and timing diagrams |
| <img src="images/icons/console-controller.svg" width="18" height="18" valign="middle"/> **Gamification** | Earn **points** and **badges**, climb the global **leaderboard**, and unlock advanced topics |
| <img src="images/icons/browser-ui.svg" width="18" height="18" valign="middle"/> **PWA & Offline** | Install on any device, work without internet – service workers via **Workbox** |
| <img src="images/icons/grid.svg" width="18" height="18" valign="middle"/> **Modern UI** | Sleek, responsive interface built with **React + Tailwind CSS** |
| <img src="images/icons/api-cloud.svg" width="18" height="18" valign="middle"/> **REST API** | Fully documented **FastAPI** backend for user accounts, progress, and grading |

---

## <img src="images/icons/photo-capture.svg" width="24" height="24" valign="middle"/> Demo & Screenshots

<p align="center">
  <em>Circuit builder with real‑time animation</em><br/>
  <img src="screenshots/builder.gif" alt="Circuit Builder Demo" width="600"/>
  <br/><br/>
  <em>Gamification dashboard</em><br/>
  <img src="screenshots/dashboard.png" alt="Gamification Dashboard" width="600"/>
</p>

> **Live demo:** [logicplay-demo.vercel.app](https://logicplay-demo.vercel.app) (temporary link – replace with your actual deployment)

---

## <img src="images/icons/code-window.svg" width="24" height="24" valign="middle"/> Tech Stack

### <img src="images/icons/browser-ui.svg" width="20" height="20" valign="middle"/> Frontend
- **React** with **Vite** – fast development & bundling
- **Tailwind CSS** – utility‑first styling
- **p5.js** – creative coding library for signal animation
- **Workbox** – service worker generation for PWA capabilities
- **React DnD** / **dnd kit** – drag‑and‑drop interactions

### <img src="images/icons/api-cloud.svg" width="20" height="20" valign="middle"/> Backend
- **FastAPI** – high‑performance Python web framework
- **SQLite** – zero‑config relational database
- **scikit‑learn** – machine learning for intelligent auto‑grading
- **JWT** authentication – secure user sessions

### <img src="images/icons/urban-planning.svg" width="20" height="20" valign="middle"/> DevOps & Tools
- **Docker** & **docker‑compose** – containerized development
- **GitHub Actions** – CI/CD pipeline (lint, test, deploy)
- **Vercel / Render** – deployment targets

---

## <img src="images/icons/time-fast.svg" width="24" height="24" valign="middle"/> Quick Start

Make sure you have **Node.js ≥ 18** and **Python ≥ 3.10** installed.

```bash
# Clone the repository
git clone https://github.com/your-username/LogicPlay.git
cd LogicPlay

# Start backend (in one terminal)
cd backend
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Start frontend (in another terminal)
cd frontend
npm install
npm run dev
```