# Production Deployment Guide
## Student Management Platform

Step-by-step production deployment guide for launching the **Student Management Platform** using Docker Compose, PostgreSQL + PgBouncer, Redis, Nginx Reverse Proxy, and SSL certificates.

---

## 1. Prerequisites

Before deploying to your cloud VPS (Ubuntu 22.04 LTS / Debian 12 recommended):

- **System Requirements**: 2 CPU Cores, 4 GB RAM minimum (8 GB recommended for 100k users).
- **Installed Software**:
  - Docker Engine `v24.0+`
  - Docker Compose `v2.20+`
  - Git
  - Domain Name configured with DNS A-records pointing to server IP.

---

## 2. One-Command Production Launch

### Step 1: Clone Repository & Configure Environment
```bash
git clone https://github.com/your-org/student-management-platform.git
cd student-management-platform

# Copy Environment Template
cp .env.example .env
```

Edit `.env` file and set your production secrets:
```env
TELEGRAM_BOT_TOKEN="your_actual_bot_token_from_botfather"
JWT_SECRET="generate_a_random_32_character_string"
WEBAPP_URL="https://yourdomain.com/app"
ADMIN_URL="https://yourdomain.com/admin"
```

### Step 2: Build & Start All Services
Launch the entire platform (PostgreSQL, PgBouncer, Redis, Backend API, Telegram Bot, Mini App, Admin Panel, and Nginx) with a single command:

```bash
docker-compose up -d --build
```

---

## 3. Database Migration & Seeding

Run database schema migration and seed production accounts inside the running backend container:

```bash
# Run Prisma Database Push
docker exec -it smp_backend npx prisma db push

# Seed Initial Roles, Super Admin, and Sample Groups
docker exec -it smp_backend npm run seed
```

---

## 4. HTTPS & SSL Certification (Certbot)

To secure WebApp and Web Admin Panel with HTTPS:

```bash
# Install Certbot
sudo apt update && sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL Certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 5. Verification & Health Monitoring

Verify all services are healthy and running:

```bash
# Check Docker Container Status
docker-compose ps

# Check Backend API Health Endpoint
curl http://localhost/api/v1/health
```

Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2026-08-04T05:00:00.000Z",
  "platform": "Student Management Platform"
}
```

---

## 6. Default Admin & Leader Credentials

| Service / Role | URL / Interface | Login Email / ID | Default Password |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `https://yourdomain.com/admin` | `admin@student.uz` | `admin123` |
| **Group Leader (CS-101)** | `https://yourdomain.com/app` | `rahbar1@student.uz` | `leader123` |
| **Student** | Telegram Bot (`@your_bot`) | Telegram `initData` | Automatic Auth |
