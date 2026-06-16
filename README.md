# Medica

A modern pharmaceutical rep & medical-visit management platform built with **Laravel 12**, **React 19**, **Inertia.js**, and **TypeScript**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Linting & Code Style](#linting--code-style)
- [Deployment](#deployment)
- [CI/CD](#cicd)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Overview metrics and activity feed |
| **Doctors** | Full CRUD for doctor/physician profiles |
| **Visits** | Log, track, and review doctor visits |
| **Medications** | Manage the medication catalogue |
| **Objectives** | Set and track visit objectives |
| **Next Steps** | Action items created from visits |
| **Quarterly Logs** | Manager review of quarterly performance |
| **Notifications** | In-app notification centre |
| **AI Coach** | AI-powered coaching suggestions |
| **Admin Dashboard** | Feature flags, user management, permissions, activity logs |
| **Role-Based Access** | Granular permissions via Spatie Laravel Permission |
| **Onboarding** | Interactive onboarding flow for new users |

---

## Tech Stack

**Backend**

- [PHP 8.2+](https://www.php.net/) / [Laravel 12](https://laravel.com/)
- [Inertia.js (Laravel adapter)](https://inertiajs.com/)
- [Laravel Fortify](https://laravel.com/docs/fortify) – Authentication
- [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission) – Roles & Permissions
- [Pest](https://pestphp.com/) – Testing

**Frontend**

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Vite 7](https://vite.dev/)
- [Radix UI](https://www.radix-ui.com/) – Accessible component primitives
- [Recharts](https://recharts.org/) – Data visualisation

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| PHP | 8.2 |
| Composer | 2 |
| Node.js | 22 |
| npm | 10 |
| SQLite / MySQL / PostgreSQL | any |

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/abuel3ees/medica.git
cd medica

# 2. Run the one-command setup (installs deps, copies .env, generates key, migrates DB, builds assets)
composer run setup
```

The `setup` script:

1. `composer install`
2. Copies `.env.example` → `.env` (if not present)
3. Generates `APP_KEY`
4. Runs database migrations
5. `npm install`
6. `npm run build`

---

## Development

Start all development processes (Laravel server, queue worker, log viewer, Vite HMR) in one command:

```bash
composer run dev
```

Or start each process individually:

```bash
php artisan serve            # Laravel dev server  → http://localhost:8000
npm run dev                  # Vite HMR dev server → http://localhost:5173
php artisan queue:listen     # Queue worker
php artisan pail             # Real-time log viewer
```

**SSR mode** (server-side rendering):

```bash
composer run dev:ssr
```

---

## Testing

Run the full PHP test suite (Pest):

```bash
./vendor/bin/pest
```

Or via Composer:

```bash
php artisan test
```

Tests use an in-memory SQLite database and are located in `tests/Unit` and `tests/Feature`.

---

## Linting & Code Style

**PHP** – [Laravel Pint](https://laravel.com/docs/pint) (PSR-12 / Laravel preset)

```bash
composer run lint          # Auto-fix
composer run test:lint     # Check only (CI-safe)
```

**TypeScript / React** – [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)

```bash
npm run lint               # ESLint auto-fix
npm run format             # Prettier auto-format
npm run format:check       # Prettier check only (CI-safe)
npm run types              # TypeScript type-check (tsc --noEmit)
```

---

## Deployment

A deployment script is provided at [`deploy.sh`](./deploy.sh). Run it on the server after pulling new code:

```bash
# On the production server
git pull origin main
bash deploy.sh
```

The script:

1. `composer install --no-dev --optimize-autoloader`
2. Clears all Laravel caches (route, config, view, event)
3. Runs `php artisan migrate --force`

> **Note:** `route:cache` and `config:cache` are intentionally skipped — they break Inertia route macros on some hosting platforms.

---

## CI/CD

GitHub Actions workflows live in [`.github/workflows/`](./.github/workflows/):

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `lint.yml` | push / PR to `main`, `master`, `develop` | PHP Pint, Prettier check, ESLint |
| `tests.yml` | push / PR to `main`, `master`, `develop` | PHP tests (matrix: 8.3, 8.4), type check |
| `deploy.yml` | push to `main` / `master` | SSH deploy to production server |

### Setting up the deploy workflow

Add the following [repository secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `DEPLOY_HOST` | Production server hostname or IP |
| `DEPLOY_USER` | SSH username |
| `DEPLOY_SSH_KEY` | Private SSH key (paste the contents of `~/.ssh/id_rsa`) |
| `DEPLOY_PATH` | Absolute path to the app on the server (e.g. `/var/www/medica`) |

---

## Environment Variables

Copy `.env.example` to `.env` and adjust for your environment:

```bash
cp .env.example .env
php artisan key:generate
```

Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `Laravel` | Application display name |
| `APP_ENV` | `local` | `local`, `staging`, or `production` |
| `APP_DEBUG` | `true` | Set to `false` in production |
| `APP_URL` | `http://localhost` | Public URL of the application |
| `DB_CONNECTION` | `sqlite` | Database driver |
| `QUEUE_CONNECTION` | `database` | Queue driver |
| `MAIL_MAILER` | `log` | Mail driver |

---

## Contributing

1. Fork the repository and create your feature branch (`git checkout -b feature/my-feature`)
2. Make your changes and ensure tests pass (`./vendor/bin/pest`)
3. Run linters (`composer run lint && npm run lint`)
4. Commit your changes (`git commit -m 'feat: add my feature'`)
5. Push to the branch and open a Pull Request

---

## License

This project is open-sourced under the [MIT License](https://opensource.org/licenses/MIT).
