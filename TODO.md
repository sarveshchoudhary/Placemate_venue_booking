# TODO: Fix Admin Visibility for Classroom Bookings

## Completed Steps
- [x] Update backend/index.js: Add 'status' column to 'bookings' table in createTables
- [x] Add GET /api/bookings endpoint to return all venue bookings
- [x] Add PUT /api/bookings/:id/:status endpoint for approve/reject
- [x] Update POST /api/bookings to use 'venue' instead of 'classroom'
- [x] Remove unused POST /api/classroom-bookings and 'classroom_bookings' table
- [x] Update booking.html: Consolidate scripts to use fetch POST to /api/bookings, remove localStorage logic

## Remaining Steps
- [ ] Restart the backend server (node backend/index.js) to apply table schema changes
- [ ] If 'bookings' table already exists, run SQL: ALTER TABLE bookings ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
- [ ] Test booking submission: Go to booking.html, submit a request, verify it saves to DB
- [ ] Test admin panel: Open admin.html, verify new bookings appear with 'pending' status
- [ ] Test approve/reject: Click approve/reject buttons, verify status updates in DB and UI
- [ ] Optional: Update script.js renderUserVenueBookings to fetch from backend instead of localStorage (requires adding GET /api/bookings?email=... endpoint)
