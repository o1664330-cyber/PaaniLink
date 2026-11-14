
# PaaniLink - Project Assumptions

## 1. Project Scope
PaaniLink is an academic midterm project developed as a frontend prototype for water tanker booking and dispatch management.

## 2. Backend and Database
- JSON Server is used as a mock REST API.
- Project data is stored locally in `db.json`.
- The backend runs locally during project testing.

## 3. User Accounts and Login
- The system supports Customer, Zone Officer, Hydrant Operator, Driver, and Administrator roles.
- Demo login information is stored in the local database.
- Login and role-based page navigation are implemented on the frontend.
- This prototype does not provide production-level authentication or server-side security.

## 4. Booking Management
- Customers can submit tanker booking requests.
- Booking availability and approval depend on the records stored in the database.
- Customers can cancel eligible bookings.
- Administrators manage booking approval and rejection.

## 5. Zone Management
- Each Zone Officer is associated with a specific zone.
- Zone Officers are responsible for reviewing bookings and subsidy applications in their assigned zone.
- Hydrant Operators work with their assigned hydrant.

## 6. Tanker Dispatch
- Only approved bookings are eligible for dispatch.
- A tanker must be available and have sufficient capacity for the booking.
- A driver must also be available before assignment.
- The Hydrant Operator records filling and departure progress.

## 7. Delivery Management
- Drivers can update the status of assigned trips.
- A delivery may be marked as Arrived, Delivered, or Failed.
- A reason is recorded when a delivery fails.
- Customers can confirm delivery or report a dispute after a delivery attempt.

## 8. Subsidies and Disputes
- Subsidy applications are reviewed by authorized project roles.
- Customer delivery disputes can be reviewed and resolved by a Zone Officer.

## 9. Billing and Payments
- Billing records are sample project data.
- Payment status changes are demonstrations only.
- No real payment gateway or financial transaction is connected.

## 10. External Services
- The prototype does not use real-time GPS tracking, map services, SMS notifications, or email notifications.
- All test records are illustrative and intended for academic demonstration.
