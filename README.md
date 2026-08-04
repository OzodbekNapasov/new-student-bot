# 🎓 Student Management Platform

Enterprise-grade **Student Management Platform** built with **Next.js 15 App Router**, **NestJS**, **Prisma ORM**, **Neon PostgreSQL**, **TailwindCSS**, **Shadcn UI**, and **Telegram WebApp SDK**.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19/18, TypeScript, TailwindCSS, Shadcn UI, Lucide Icons.
- **Backend**: NestJS 10, TypeScript, Prisma ORM, Socket.io WebSockets, grammY Bot Engine.
- **Database**: Neon Serverless PostgreSQL (with Pooling & Direct URLs).
- **Deployment Pipeline**:
  - **Frontend**: Vercel
  - **Backend**: Railway
  - **Bot Mode**: Telegram Webhook Integration

---

## 🛠️ Project Monorepo Structure

```
student-management-platform/
├── apps/
│   ├── backend/               # NestJS API, Prisma Models & Telegram Bot Webhook
│   │   ├── prisma/            # schema.prisma (Neon PostgreSQL) & Seed scripts
│   │   └── src/               # NestJS Modules, Controllers, Guards & Repositories
│   └── frontend/              # Next.js 15 App Router (Telegram WebApp & Admin Panel)
│       ├── app/               # App Router Pages & API routes
│       └── components/        # Shadcn UI & Custom Glassmorphic Components
├── .env.example               # Complete Environment Variables Template
├── package.json               # Monorepo NPM Workspaces setup
└── README.md
```

---

## ⚙️ Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Setup Database (Neon PostgreSQL)
```bash
cd apps/backend
npx prisma db push
npm run seed
```

### 4. Run Development Servers
- **Backend (NestJS API)**: `npm run dev:backend` (runs on http://localhost:5000)
- **Frontend (Next.js 15)**: `npm run dev:frontend` (runs on http://localhost:3000)

---

## 🔑 Pre-seeded Test Accounts

| Role | Email / Telegram ID | Password / Credentials |
| :--- | :--- | :--- |
| **Super Admin** | `admin@student.uz` | `admin123` |
| **Group Leader (CS-101)** | `rahbar1@student.uz` | `leader123` |
| **Student (Ali Valiyev)** | Telegram ID: `300001` | Telegram `initData` / WebApp |
