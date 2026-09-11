# Budget Tracker Project Notes

## Project goal
Private local-network budget tracker for 3 users on the same Wi-Fi or local LAN. The intended setup is:

Browser on user device
  -> Node.js + Express backend
  -> SQLite database

The app is intended to stay private to the local network and not be exposed publicly over the internet.

## Architecture
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Session management: express-session with SQLite-backed session store
- Database: SQLite via better-sqlite3
- Auth: username/password login with bcrypt password hashing

## Completed implementation in the current project files
The project already contains a substantial working local budget-tracker app with a frontend, backend, and SQLite database layer.

### Session updates completed during this session
- The Windows build blocker was resolved by installing Node.js 20 LTS, which allowed project dependencies to install successfully.
- The app was verified to start successfully with `npm start` at http://localhost:3000.
- The default local accounts were aligned with the original 3-user LAN goal:
  - user1 / ChangeMe1!
  - user2 / ChangeMe2!
  - user3 / ChangeMe3!
  - admin / admin (legacy local testing account)
- The UI styling was improved with a cleaner blue theme, DM Sans typography, tighter spacing, and Nepali rupee currency formatting.
- The history panel gained a compact date-range filter for viewing expenses within a selected period.
- Automatic backup guidance was documented for the SQLite database files.
- Auto Save was enabled in the editor workflow to reduce file-save friction.

### Frontend files
- index.html
- style.css
- app.js

Implemented features include:
- Login screen with session-based authentication
- User logout
- Expense entry form with date, place, category, amount, and description
- Monthly dashboard cards
- Calendar month navigation
- Selected-day spending details
- Expense history table with date-range filtering
- Delete expense action
- Date-range analysis section
- Budget summary statistics
- Responsive styling for desktop/mobile
- Nepali rupee currency display for local usability

### Backend files
- server.js
- auth.js

Implemented backend features include:
- Express app setup
- JSON parsing
- Session middleware
- /api/health endpoint
- /api/auth/login
- /api/auth/logout
- /api/auth/me
- Protected expense endpoints
  - GET /api/expenses
  - POST /api/expenses
  - DELETE /api/expenses/:id
- Login enforcement via requireLogin middleware

### Database files
- database.js

Implemented database behavior includes:
- SQLite database creation in data/budget.sqlite
- data directory creation
- WAL mode enabled
- foreign keys enabled
- users table
- expenses table
- user/date index on expenses
- default user creation for:
  - user1 / ChangeMe1!
  - user2 / ChangeMe2!
  - user3 / ChangeMe3!
  - admin / admin

This matches the intended private local-network model for 3 users, while preserving a legacy admin account for local testing. The app stores all user data in a shared SQLite database and filters records by `user_id` so each user sees only their own expenses.

## Important technical decisions and project conventions
- The application keeps each user's expenses separate by filtering by `user_id`.
- The frontend does not rely on browser localStorage for expenses; data is stored in SQLite on the server.
- The app is designed for a private LAN environment rather than public internet hosting.
- The project should not be rebuilt from scratch; existing frontend and backend code should be preserved unless a specific bug requires a targeted fix.
- The intended 3-user LAN workflow is represented by default accounts for user1, user2, and user3.
- A legacy admin/admin account remains for local testing convenience.
- UI styling was intentionally adjusted toward a professional blue palette, DM Sans typography, and compact layout spacing without changing the app architecture.
- Currency output was changed to Nepali rupees (NPR) to match local usage.
- Auto Save was enabled in the editor workflow, but no application logic was rewritten.

## Project files currently in the workspace
- app.js
- auth.js
- database.js
- index.html
- package.json
- PROJECT_NOTES.md
- README.md
- server.js
- style.css
- test.md
- .gitignore

## Dependency and runtime state
Package configuration in package.json includes:
- express
- express-session
- better-sqlite3
- connect-sqlite3
- bcrypt

Scripts available:
- npm start -> node server.js
- npm run dev -> node --watch server.js

## Current working state
The project is now running successfully in this environment after installing Node.js 20 LTS and completing the dependency install.

The current project state is:
- frontend UI implemented and polished
- backend API implemented
- SQLite database schema implemented and active
- intended 3-user LAN defaults created for user1, user2, and user3
- legacy admin/admin account also exists for local testing
- app confirmed to start successfully with `npm start` at http://localhost:3000
- project has a working date-range history filter and Nepali rupee display

## Unresolved issues and errors
At the time of this update, no application startup error is blocking the project in this environment. The remaining work is functional validation and feature completion rather than environment repair.

Items still not yet fully implemented or validated:
- user-management UI for creating additional accounts from the browser
- password-change workflow
- formal backup/export feature in the app UI
- broader live testing from multiple devices on the same local network
- automated end-to-end test coverage

## Recommended next step
1. Launch the app at http://localhost:3000
2. Sign in with user1 / ChangeMe1!, user2 / ChangeMe2!, or user3 / ChangeMe3!
3. Validate add-expense, delete-expense, calendar, daily summary, range filter, and analysis flows
4. Confirm each user keeps their own expenses separate in SQLite
5. Test the same flow from phones on the same local Wi-Fi network
6. After validation, add password-change and account-management features
7. Set up a scheduled SQLite backup routine for the `data` folder

## Files created or modified during this session
- PROJECT_NOTES.md
- database.js
- index.html
- README.md
- style.css
- app.js

The core app logic was preserved, while the project was aligned to the original 3-user local-network goal, the runtime environment was corrected by using Node.js 20 LTS, and the UI was refined for a more local, polished experience.

## Notes on accuracy
The current project code is treated as the source of truth. The setup now reflects the actual app state: the project runs with Node.js 20 LTS, the 3-user LAN defaults are seeded, the app is locally usable, and the remaining work is live validation and feature completion rather than fixing install errors.
