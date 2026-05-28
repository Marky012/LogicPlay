<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/your-username/LogicPlay">
    <img src="D:\LogicPlay\frontend\public\favicon.png" alt="Logo" width="120" height="120">
  </a>

  <h1 align="center">⚡ LogicPlay</h1>

  <p align="center">
    <strong>🎮 Gamified Digital Logic Learning Platform</strong>
    <br />
    Build, simulate, and master digital logic circuits through play.
    <br />
    <a href="https://logicplay-demo.vercel.app"><strong>🚀 Try Live Demo »</strong></a>
    ·
    <a href="https://github.com/your-username/LogicPlay/issues">🐛 Report Bug</a>
    ·
    <a href="https://github.com/your-username/LogicPlay/issues">✨ Request Feature</a>
  </p>

  <!-- BADGES -->
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square" alt="Version">
    <img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome">
    <img src="https://img.shields.io/badge/stack-React%20%7C%20FastAPI%20%7C%20Tailwind%20CSS-informational?style=flat-square" alt="Tech Stack">
    <img src="https://img.shields.io/badge/PWA-ready-blueviolet?style=flat-square&logo=pwa" alt="PWA Ready">
    <img src="https://img.shields.io/badge/ML--Powered-scikit--learn-orange?style=flat-square" alt="ML Powered">
  </p>
</div>

<br />

---

## 📖 Table of Contents
- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🎥 Demo & Screenshots](#-demo--screenshots)
- [⚙️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [🧰 Detailed Setup](#-detailed-setup)
- [🏗️ Architecture](#️-architecture)
- [🎮 Gamification System](#-gamification-system)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview
**LogicPlay** transforms the way students and enthusiasts learn digital logic design. By combining a **drag‑and‑drop circuit builder**, **real‑time signal flow animation**, **instant ML‑powered grading**, and a full **gamification engine**, LogicPlay makes mastering gates, flip‑flops, and combinational/sequential circuits engaging, fun, and effective.

It works entirely in the browser (desktop & mobile) thanks to its **Progressive Web App (PWA)** architecture, and can even run **offline**.

---

## ✨ Features

| Category | Highlights |
|----------|------------|
| 🧩 **Circuit Builder** | Intuitive drag‑and‑drop canvas, unlimited undo/redo, component snapping |
| ⚡ **Real‑Time Simulation** | Live signal propagation with animated wires (powered by **p5.js**) |
| 🤖 **Auto‑Grading** | Instant feedback on exercises using an **ML model** (scikit‑learn) that understands truth tables and timing diagrams |
| 🏆 **Gamification** | Earn **points** and **badges**, climb the global **leaderboard**, and unlock advanced topics |
| 📱 **PWA & Offline** | Install on any device, work without internet – service workers via **Workbox** |
| 🎨 **Modern UI** | Sleek, responsive interface built with **React + Tailwind CSS** |
| 🔌 **REST API** | Fully documented **FastAPI** backend for user accounts, progress, and grading |

---

## 🎥 Demo & Screenshots

<p align="center">
  <em>Circuit builder with real‑time animation</em><br/>
  <img src="screenshots/builder.gif" alt="Circuit Builder Demo" width="600"/>
  <br/><br/>
  <em>Gamification dashboard</em><br/>
  <img src="screenshots/dashboard.png" alt="Gamification Dashboard" width="600"/>
</p>

> 💡 **Live demo:** [logicplay-demo.vercel.app](https://logicplay-demo.vercel.app) (temporary link – replace with your actual deployment)

---

## ⚙️ Tech Stack

### 🖥️ Frontend
- **React** with **Vite** – fast development & bundling
- **Tailwind CSS** – utility‑first styling
- **p5.js** – creative coding library for signal animation
- **Workbox** – service worker generation for PWA capabilities
- **React DnD** / **dnd kit** – drag‑and‑drop interactions

### 🛠️ Backend
- **FastAPI** – high‑performance Python web framework
- **SQLite** – zero‑config relational database
- **scikit‑learn** – machine learning for intelligent auto‑grading
- **JWT** authentication – secure user sessions

### ☁️ DevOps & Tools
- **Docker** & **docker‑compose** – containerized development
- **GitHub Actions** – CI/CD pipeline (lint, test, deploy)
- **Vercel / Render** – deployment targets

---

## 🚀 Quick Start

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