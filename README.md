# Multilox Farm Management System

A web-based system for managing farm workers, daily work records, work rates, payroll calculations, payslips, and basic reports.

## How to Run

For one shared web app that works on phones, tablets, and computers, run the Node server:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

On a local farm Wi-Fi network, other devices can open the computer's LAN address, for example:

```text
http://192.168.1.20:3000
```

The app saves shared data through the server. In production, use PostgreSQL through `DATABASE_URL`.

## Login Credentials

On first use, create the first Main Admin account from the setup screen. After signing in as Main Admin, use the Accounts module to create Secondary Admin or Supervisor users.

The login screen lets users choose:

- Main Admin
- Secondary Admin
- Supervisor

## Deploy Online With A Cloud Database

Deploy this folder to a Node.js host such as Render, Railway, Fly.io, or a VPS. For production, use PostgreSQL through the `DATABASE_URL` environment variable.

Use these settings:

- Start command: `npm start`
- Port: use the host-provided `PORT` environment variable, already supported by `server.js`
- Database: set `DATABASE_URL` to your PostgreSQL connection string

When `DATABASE_URL` is present, the app stores all farm data in PostgreSQL instead of `data/db.json`. This means code redeploys will not erase workers, accounts, credits, loans, payroll records, or rates.

### Render PostgreSQL Setup

1. In Render, create a new PostgreSQL database.
2. Copy the database **Internal Database URL**.
3. Open your Multilox Web Service.
4. Go to **Environment**.
5. Add:

```text
DATABASE_URL=your_internal_database_url
NODE_ENV=production
SESSION_SECRET=a_long_random_secret_value
```

6. Redeploy the Web Service.
7. Open `/api/health` on your deployed app. It should show:

```json
{
  "storage": "postgresql"
}
```

If `storage` shows `json-file`, the app is not connected to the database yet.

`SESSION_SECRET` should be a long random value. It is used to protect login cookies.

### Before Switching An Existing Live App

If you already entered live data while using `data/db.json`, export or back it up before switching to PostgreSQL. Once `DATABASE_URL` is enabled, the app reads from PostgreSQL.

## Included

- Worker registration with auto-generated employee numbers
- Worker search, edit, delete, and active/inactive status
- Worker attendance with present/absent/sick/leave status
- Department filters for workers and payroll
- Daily work register with automatic earnings calculation
- Work rate management with active/inactive rates
- Grocery credit records for employee purchases
- Credit balance summaries by worker
- Loans, cash advances, and penalties with monthly payroll deductions
- Monthly payroll calculation with NSSA-style percentage deduction
- Automatic payroll deductions for grocery credits
- Company settings for farm name, currency, and payslip logo
- Printable payslips with browser PDF saving through the print dialog
- Printable payroll summary
- Daily labor cost, productivity, expense, department labor, attendance, and credit reports
- CSV and Excel-style exports for reports and payroll
- Admin and supervisor role views

## Production Next Steps

- Add full API endpoints per module
- Split the current shared state endpoint into full module-specific API endpoints
- Add supervisor-to-worker assignment rules
- Add server-generated PDFs and Excel exports
