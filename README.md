# METASURE — NAWI Test & OIML R-76 Compliance System

SIH 26035 software application for Non-Automatic Weighing Instrument (NAWI) test workflow, metrological calculations, compliance evaluation and report generation.

## What is included

- Professional React + TypeScript UI
- Express API server
- Offline laboratory mode with local browser cache
- Instrument registration and inventory
- OIML R-76 test wizard
- Weighing performance / MPE evaluation
- Repeatability evaluation
- Eccentricity evaluation
- Discrimination evaluation
- Overall PASS / FAIL verdict
- Test and report history
- QR verification and SHA-256 integrity hash
- PDF/DOCX-oriented report workflow already present in the application
- ML sample analytics / anomaly analysis
- Projects and lab work tracking
- Audit log endpoints
- AI assistant endpoint (optional Gemini key)
- Electron desktop packaging configuration for Windows NSIS installer

## Important regulatory note

This application is a software demonstrator and implementation aid. Validate every regulatory formula, clause interpretation, test sequence and report wording against the exact OIML R-76 edition and applicable Indian Legal Metrology rules used by the competent authority before using it for official certification or legal decisions.

## Requirements

- Windows 10/11
- Node.js 20+ recommended
- npm 10+
- Internet connection for the first dependency installation (unless dependencies are already cached)

## Run in VS Code

1. Extract the ZIP.
2. Open the project folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

   npm install
   npm run dev

5. Open the local URL printed by the terminal (normally http://localhost:3000).

### Fast Windows launcher

Double-click `RUN-METASURE.bat`.

## Build a Windows installer

The project is configured for Electron + electron-builder.

Run:

    npm install
    npm run desktop:build

The installer will be created under `release/` with a name similar to:

    Metasure-Setup-1.0.0.exe

You can also double-click `BUILD-WINDOWS.bat`.

## Architecture

Browser/Web mode:

React/Vite → Express API → in-memory/offline cache

Desktop mode:

Electron shell → bundled React/Vite build → bundled Express server

The current server stores demo data in memory and the frontend has resilient offline caching. For a production multi-user deployment, replace the in-memory layer with PostgreSQL (or another approved database), add real authentication/session management, and configure secure secret management.

## Demo roles

The application contains seeded demonstration roles. They are intended only for the SIH prototype/demo and are not production credentials.

## Manual instrument reading mode

The core workflow supports a lab assistant observing the NAWI display and entering readings manually. Direct instrument connectivity (RS-232/USB/TCP-IP) should be implemented as a separate device adapter layer when the actual instrument protocol is known.

## Project structure

- `src/pages` — application screens
- `src/components` — reusable UI components
- `src/services` — API and report services
- `src/utils/oimlCalculations.ts` — metrological calculation engine
- `src/utils/mlEngine.ts` — analytics/demo ML logic
- `src/data/mockData.ts` — seeded demo data
- `server.ts` — Express API and production/static server
- `electron/main.cjs` — Windows desktop shell
- `vite.config.ts` — Vite configuration

## Development workflow

Keep the source folder as the master copy. Edit it in VS Code, run `npm run dev`, test, then run `npm run desktop:build` whenever you want a new Windows installer.
