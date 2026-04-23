# Quality Data Backend

This backend service stores Quality Data Core records in a local SQLite database and exposes a simple REST API.

## Setup

1. Install Node.js (version 16+ recommended).
2. Open a terminal and run:

```bash
cd "C:\Users\Mani\Downloads\quality_data_core_backend"
npm install
```

3. Start the server:

```bash
npm start
```

The server will run on `http://localhost:3000`.

## API Endpoints

- `GET /api/qualities` — fetch all quality records
- `PUT /api/qualities/bulk` — replace all records with the provided list

## Notes

- The backend stores data in `data/qualities.db`.
- CORS is enabled so your local frontend file can call the API.
- If the frontend is updated to use this backend, it will no longer depend only on browser storage.
