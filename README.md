# Mini Task Management System

Full-stack monolith interview project built with:
- **Frontend**: Next.js + Axios
- **Backend**: Spring Boot + Spring Security + JWT + JPA
- **Database**: MySQL

## Project Overview

This application supports:
- User registration and login (JWT authentication)
- Role-based access (`ADMIN`, `USER`)
- Task CRUD operations
- Task filtering by status/priority
- Mark task as complete
- Pagination and sorting (due date / priority)

## Folder Structure

```
.
├── backend
├── frontend
└── docs
    ├── API.md
    └── schema.sql
```

## Environment Variables

### Backend (`backend/.env` or system env)

- `DB_URL` (example: `jdbc:mysql://localhost:3306/task_management_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`)
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET` (must be Base64 and sufficiently long)
- `JWT_EXPIRATION_MS` (default `86400000`)
- `SEED_ADMIN_EMAIL` (default `admin@local.com`)
- `SEED_ADMIN_PASSWORD` (default `Admin@123`)
- `SERVER_PORT` (default `8080`)

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_BASE_URL` (example: `http://localhost:8080`)

## Setup Instructions

### 1) Database (MySQL)

Create MySQL database (optional when using `createDatabaseIfNotExist=true` in `DB_URL`):

```sql
CREATE DATABASE task_management_db;
```

### 2) Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`.

Swagger documentation:
- `http://localhost:8080/swagger-ui/index.html`

### 3) Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## API Documentation

See:
- [docs/API.md](docs/API.md)
- Swagger UI at runtime

## Database Schema

See:
- [docs/schema.sql](docs/schema.sql)

## Default Admin Account

An admin user is automatically seeded on startup:
- Email from `SEED_ADMIN_EMAIL`
- Password from `SEED_ADMIN_PASSWORD`

Use this account to verify `ADMIN` behavior (view/manage all tasks).
