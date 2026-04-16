# Job Application Tracker

A full-stack web app for managing your job search — track applications, monitor your pipeline, and export your data, all in one place.

**Live Demo:** [job-tracker-application-ten.vercel.app](https://job-tracker-application-ten.vercel.app/)

**Repository:** [github.com/sean-kim05/job-tracker-application](https://github.com/sean-kim05/job-tracker-application)

---

## Features

### Dashboard
- At-a-glance pipeline summary: total applications and counts per status (Applied, Interviewing, Offer, Rejected)
- Response rate calculation
- Recent applications list with company logos and status badges

### Applications Table
- Add, edit, and delete job applications via a modal form
- Fields: Company, Role, Status, Location, Job URL, Date Applied, Notes
- **Inline status picker** — click a status badge directly in the table to change it without opening the modal
- **Column sorting** — click any column header to sort ascending/descending
- **Search** — filter applications by keyword in real time
- **Filter by status** — narrow down to a specific stage of the pipeline
- **Result count** — see how many applications match your current filters
- **Notes indicator** — icon on rows with notes; hover for a tooltip preview
- **Job URL links** — company names link directly to the job posting
- **CSV export** — download all your applications as a spreadsheet

### UX & Polish
- Company logos fetched via Clearbit API with letter-avatar fallback
- Toast notifications for create/update/delete actions
- Custom confirm dialog before deleting an application
- Loading skeleton while data fetches
- Animated modal with smooth open/close
- Mobile responsive layout with collapsible sidebar and hamburger menu
- Keyboard shortcuts: `N` to open the new application form, `Escape` to close modals

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite                      |
| Backend  | Python, Flask                       |
| Database | SQLite (`jobs.db`)                  |
| Styling  | Custom CSS with CSS variables       |
| Logos    | Clearbit Logo API                   |

---

## Getting Started

### Prerequisites
- Node.js v16+
- Python 3.9+

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The Flask server runs on `http://localhost:5000` and creates a `jobs.db` SQLite file automatically on first run.

### Frontend

```bash
cd frontend
npm install
npm start
```

The Vite dev server runs on `http://localhost:5173` and proxies all `/api` requests to the Flask backend.

---

## API Endpoints

| Method | Endpoint                   | Description                          |
|--------|----------------------------|--------------------------------------|
| GET    | `/api/applications`        | List applications (supports `q`, `status` query params) |
| POST   | `/api/applications`        | Create a new application             |
| PUT    | `/api/applications/:id`    | Update an existing application       |
| DELETE | `/api/applications/:id`    | Delete an application                |
| GET    | `/api/stats`               | Get pipeline stats and response rate |

---

## Project Structure

```
JobApplicationTracker/
├── backend/
│   ├── app.py              # Flask app and API routes
│   ├── requirements.txt    # Python dependencies
│   └── jobs.db             # SQLite database (auto-created)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Applications.jsx   # Applications table with CRUD
│   │   │   ├── Dashboard.jsx      # Stats overview and recent list
│   │   │   ├── ModalForm.jsx      # Add/edit application modal
│   │   │   ├── Avatar.jsx         # Company logo with fallback
│   │   │   ├── Toast.jsx          # Toast notification component
│   │   │   └── ConfirmDialog.jsx  # Delete confirmation dialog
│   │   ├── api.js          # API client functions
│   │   ├── App.jsx         # Root component and routing
│   │   ├── main.jsx        # React entry point
│   │   └── styles.css      # Global styles
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Application Statuses

| Status       | Meaning                                      |
|--------------|----------------------------------------------|
| Applied      | Application submitted, waiting for response  |
| Interviewing | Active in the interview process              |
| Offer        | Received an offer                            |
| Rejected     | Application was not successful               |

