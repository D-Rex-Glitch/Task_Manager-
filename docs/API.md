# API Documentation

Base URL: `http://localhost:8080`

Swagger UI: `http://localhost:8080/swagger-ui/index.html`

## Auth APIs

### Register
- `POST /api/auth/register`
- Public
- Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

### Login
- `POST /api/auth/login`
- Public
- Body:
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

## Task APIs

All task APIs require `Authorization: Bearer <token>`.

### List Tasks
- `GET /api/tasks`
- Query params:
  - `status` = `TODO | IN_PROGRESS | DONE`
  - `priority` = `LOW | MEDIUM | HIGH`
  - `page` (default `0`)
  - `size` (default `10`)
  - `sortBy` = `dueDate | priority` (default `dueDate`)
  - `direction` = `asc | desc` (default `asc`)

### Get Task By Id
- `GET /api/tasks/{id}`

### Create Task
- `POST /api/tasks`
- Body:
```json
{
  "title": "Implement JWT",
  "description": "Add authentication",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2026-03-20"
}
```

### Update Task
- `PUT /api/tasks/{id}`
- Body same as create

### Mark Complete
- `PATCH /api/tasks/{id}/complete`

### Delete Task
- `DELETE /api/tasks/{id}`

## Role Rules

- `ADMIN`: can view/manage all tasks.
- `USER`: can view/manage only own tasks.
