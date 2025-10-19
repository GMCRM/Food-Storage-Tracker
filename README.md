## Overview

The Food Storage Tracker is a small full-stack web app I built to deepen my skills as a software engineer. It connects a JavaScript frontend to an Express API and a PostgreSQL relational database. The app helps track food items (name, description, storage type, dates) and dynamically shows how many days remain until each item’s use-by date.

### How it works with a SQL Relational Database

- The backend is a Node.js/Express server connecting to PostgreSQL using the `pg` library.
- CRUD endpoints allow the frontend to create, read, update, and delete rows in a `food_items` table.
- The “days left” value is calculated on the fly from the `use_by_date` so it’s always accurate when you load the page.

### How to use the program

1. Start PostgreSQL and create the database and table (see the Relational Database section below).
2. Start the API server:

```zsh
node server.js
```

The server listens at [http://localhost:3000](http://localhost:3000).

3. Open the frontend (served statically by the server):

- [http://localhost:3000/javascriptModule.html](http://localhost:3000/javascriptModule.html)

4. Use the form to add items. You can edit or delete from the table. “Days left” updates automatically based on the current date and the use-by date.

### Purpose

- Practice building an end-to-end feature: UI form + dynamic table, REST API, and relational database.
- Gain experience with Express routing, SQL schema design, and safe query patterns.
- Learn how to structure a lightweight full-stack app and document its setup clearly for others.

[Software Demo Video](https://youtu.be/nN4oxbnezKw)

## Relational Database

### Database: PostgreSQL (local instance)

Schema overview (file: `code.sql`):

- Table: `public.food_items`
  - `id` SERIAL PRIMARY KEY
  - `name` VARCHAR(255) NOT NULL
  - `description` TEXT
  - `storage_type` VARCHAR(50) NOT NULL (e.g., pantry, fridge, freezer)
  - `date_stored` DATE NOT NULL
  - `use_by_date` DATE NOT NULL
  - `days_left` INTEGER (legacy column; computed dynamically by the API at read time)

### Notes

- The backend calculates `days_left` each time items are fetched, using today’s date and the `use_by_date`.
- The POST/PUT endpoints intentionally ignore any `daysLeft` provided by the client to avoid stale data.

### Quick start (psql)

```zsh
# Connect to Postgres (adjust user/host as needed)
psql -U grantcross -h localhost postgres

# Create the database (once)
CREATE DATABASE food_storage_tracker;

# Connect to the new database
\c food_storage_tracker

# Run the schema and sample data from code.sql (from the project directory)
\i code.sql
```

## Development Environment

### Tools

- Visual Studio Code, Git, and a modern browser
- PostgreSQL (running locally on port 5432)

### Backend

- Node.js + Express
- Libraries: `pg`, `cors`, `body-parser`
- Endpoints (high level):
  - `GET /items` – returns all items with computed `days_left`
  - `POST /items` – creates an item (ignores `daysLeft` in payload)
  - `PUT /items/:id` – updates an item (ignores `daysLeft` in payload)
  - `DELETE /items/:id` – deletes an item

### Frontend

- HTML (`javascriptModule.html`), CSS (`style.css`), and JavaScript (`script.js`)
- Uses the Fetch API to call the Express endpoints and renders a table of items

## Useful Websites

- https://www.w3schools.com/postgresql/
- Express Guide – https://expressjs.com/
- node-postgres (pg) – https://node-postgres.com/
- PostgreSQL Docs – https://www.postgresql.org/docs/
- MDN Fetch API – https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- MDN Date – https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
- MDN CORS – https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

## Future Work

- Full input validation and detailed server-side error messages
- Search, sort, and filter controls on the table (e.g., by storage type or date)
- Visual indicators for items expiring soon (color coding, badges)
- Optional background job or view to flag expired items
- Authentication and per-user inventories
- Replace the legacy `days_left` DB column with a database view or computed column
- Add tests (unit for utilities and integration for endpoints)
