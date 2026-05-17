# Multilox Farm Management System MVP

A web-based MVP for managing farm workers, daily work records, work rates, payroll calculations, payslips, and basic reports.

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

The app now saves shared data through the server in `data/db.json`. Opening `index.html` directly still works as a single-device fallback, but it will not share data across devices.

## Login Credentials

On first use, create the first admin account from the setup screen. After signing in as admin, use the Accounts module to create additional admin or supervisor users.

## Deploy Online

Deploy this folder to a Node.js host such as Render, Railway, Fly.io, or a VPS.

Use these settings:

- Start command: `npm start`
- Port: use the host-provided `PORT` environment variable, already supported by `server.js`
- Persistent storage: mount or configure a persistent disk for the `data` folder

Important: if the host uses temporary file storage, `data/db.json` may reset when the app restarts. For a production version, move the data to PostgreSQL or MySQL.

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

- Replace the JSON data file with PostgreSQL or MySQL
- Add full API endpoints per module
- Add secure role-based authentication
- Add supervisor-to-worker assignment rules
- Move user accounts and passwords to a backend with proper password hashing
- Add server-generated PDFs and Excel exports
