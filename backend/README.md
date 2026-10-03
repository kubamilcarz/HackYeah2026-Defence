# Hubmi - Django Backend

Django REST Framework backend for the Hubmi project.

## Features

- **Django 6.1** with **Django REST Framework (DRF 3.18)**
- **CORS Support** (`django-cors-headers`) configured for Next.js frontend (`http://localhost:3000`)
- **OpenAPI 3 / Swagger Documentation** via `drf-spectacular`
- Environment variables support with `python-dotenv`
- Health check endpoint at `/api/health/`

## Quick Start (Local Setup)

### 1. Create and Activate Virtual Environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 6. Run the Development Server

```bash
python manage.py runserver 8000
```

The API will be available at `http://127.0.0.1:8000/`.

## Endpoints

- **Health Check**: `GET /api/health/`
- **Swagger UI**: `GET /api/docs/`
- **Redoc UI**: `GET /api/redoc/`
- **OpenAPI Schema**: `GET /api/schema/`
- **Django Admin**: `GET /admin/`

## Running Tests

```bash
python manage.py test
```

