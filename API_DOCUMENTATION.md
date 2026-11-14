# PaaniLink – API Documentation

## 1. Introduction

PaaniLink uses JSON Server as a mock REST API to store and retrieve project data.

The frontend communicates with the API using JavaScript Fetch requests.

## 2. Base URL

```text
http://localhost:3000
```

All API requests use this local base URL.

## 3. Data Collections

| Collection | Purpose |
|---|---|
| customers | Customer registration and login |
| bookings | Water tanker booking and delivery records |
| tankers | Tanker capacity and availability |
| drivers | Driver details and availability |
| hydrants | Hydrant information and availability |
| zones | Available service zones |
| subsidies | Customer subsidy applications |
| bills | Customer billing records |
| officers | Zone Officer accounts |
| operators | Hydrant Operator accounts |

## 4. Customer APIs

### Register a Customer

- Method: POST
- Endpoint: `/customers`

Request body:

```json
{
  "fullName": "Customer Name",
  "cnic": "12345-1234567-1",
  "phone": "03001234567",
  "email": "customer@example.com",
  "address": "Zone A, Karachi",
  "password": "password123"
}
```

### Check Existing CNIC

- Method: GET
- Endpoint: `/customers?cnic=12345-1234567-1`

Used to check whether a CNIC is already registered.

### Customer Login Lookup

- Method: GET
- Endpoint: `/customers?email=customer@example.com`

The frontend checks the submitted password against the returned customer record.

## 5. Booking APIs

### Get All Bookings

- Method: GET
- Endpoint: `/bookings`

### Create a Booking

- Method: POST
- Endpoint: `/bookings`

Request body:

```json
{
  "capacity": 1000,
  "bookingType": "commercial",
  "deliveryAddress": "Zone A, Karachi",
  "zone": "Zone A",
  "deliveryDate": "2026-12-23",
  "status": "Pending",
  "customerId": "CUSTOMER_ID",
  "customerName": "Customer Name",
  "customerEmail": "customer@example.com"
}
```

### Update Booking Status

- Method: PATCH
- Endpoint: `/bookings/BOOKING_ID`

Example request body:

```json
{
  "status": "Approved"
}
```

Other booking status updates include:

- Rejected
- Cancelled

### Assign Tanker and Driver

- Method: PATCH
- Endpoint: `/bookings/BOOKING_ID`

Example request body:

```json
{
  "tankerId": "2",
  "driverId": "DRIVER_ID",
  "driverName": "Driver Name",
  "dispatchStatus": "Assigned"
}
```

### Update Filling and Departure

- Method: PATCH
- Endpoint: `/bookings/BOOKING_ID`

Filling request:

```json
{
  "fillingStatus": "Filled"
}
```

Departure request:

```json
{
  "departureStatus": "Departed"
}
```

### Confirm Delivery

- Method: PATCH
- Endpoint: `/bookings/BOOKING_ID`

```json
{
  "deliveryConfirmation": "Confirmed"
}
```

### Report Delivery Dispute

- Method: PATCH
- Endpoint: `/bookings/BOOKING_ID`

```json
{
  "disputeStatus": "Reported",
  "disputeReason": "Water tanker was not delivered to my address."
}
```

### Update Driver Trip Status

- Method: PATCH
- Endpoint: `/bookings/BOOKING_ID`

Example:

```json
{
  "tripStatus": "Delivered"
}
```

For failed delivery:

```json
{
  "tripStatus": "Failed",
  "failureReason": "Customer was not available."
}
```

## 6. Tanker APIs

### Get All Tankers

- Method: GET
- Endpoint: `/tankers`

### Add a Tanker

The current frontend loads and displays tanker records. No tanker creation form is implemented.

### Update Tanker Status

- Method: PATCH
- Endpoint: `/tankers/TANKER_ID`

Example:

```json
{
  "status": "Assigned"
}
```

Other status values used include `Available`.

## 7. Driver APIs

### Get All Drivers

- Method: GET
- Endpoint: `/drivers`

### Add a Driver

- Method: POST
- Endpoint: `/drivers`

Request body:

```json
{
  "name": "Driver Name",
  "phone": "03001234567",
  "status": "Available"
}
```

### Driver Login Lookup

- Method: GET
- Endpoint: `/drivers?email=driver@example.com`

### Update Driver Status

- Method: PATCH
- Endpoint: `/drivers/DRIVER_ID`

Example:

```json
{
  "status": "Assigned"
}
```

## 8. Hydrant APIs

### Get All Hydrants

- Method: GET
- Endpoint: `/hydrants`

### Add a Hydrant

- Method: POST
- Endpoint: `/hydrants`

Request body:

```json
{
  "name": "Main Hydrant A",
  "location": "Zone A",
  "status": "Available"
}
```

### Get Assigned Hydrant

- Method: GET
- Endpoint: `/hydrants/HYDRANT_ID`

### Update Hydrant Availability

- Method: PATCH
- Endpoint: `/hydrants/HYDRANT_ID`

Example:

```json
{
  "status": "Unavailable"
}
```

## 9. Zone Officer APIs

### Officer Login Lookup

- Method: GET
- Endpoint: `/officers?email=officer@example.com`

### Get Bookings

- Method: GET
- Endpoint: `/bookings`

The frontend filters bookings using the officer's assigned zone.

### Get Subsidy Applications

- Method: GET
- Endpoint: `/subsidies`

### Update Subsidy Application

- Method: PATCH
- Endpoint: `/subsidies/SUBSIDY_ID`

Example:

```json
{
  "status": "Approved"
}
```

The officer dashboard also uses booking records to display and resolve reported delivery disputes.

## 10. Hydrant Operator APIs

### Operator Login Lookup

- Method: GET
- Endpoint: `/operators?email=operator@example.com`

### Load Assigned Hydrant

- Method: GET
- Endpoint: `/hydrants/HYDRANT_ID`

### Load Approved Bookings and Resources

- Method: GET
- Endpoints:
  - `/bookings`
  - `/tankers`
  - `/drivers`

The frontend filters approved bookings for the operator's hydrant zone and displays available resources.

## 11. Subsidy APIs

### Submit a Subsidy Application

- Method: POST
- Endpoint: `/subsidies`

Request body:

```json
{
  "customerName": "Customer Name",
  "address": "Zone A, Karachi",
  "status": "Pending"
}
```

### Get Subsidy Applications

- Method: GET
- Endpoint: `/subsidies`

### Update Subsidy Status

- Method: PATCH
- Endpoint: `/subsidies/SUBSIDY_ID`

Example:

```json
{
  "status": "Rejected"
}
```

## 12. Billing APIs

### Get All Bills

- Method: GET
- Endpoint: `/bills`

### Update Payment Status

- Method: PATCH
- Endpoint: `/bills/BILL_ID`

Example:

```json
{
  "paymentStatus": "Paid"
}
```

Other payment status used: `Unpaid`.

## 13. HTTP Methods Used

| Method | Purpose |
|---|---|
| GET | Retrieve records |
| POST | Create new records |
| PATCH | Update existing records |

## 14. Error Handling

The frontend checks API responses using the `response.ok` property.

If a request fails, the application displays an error message or logs the error in the browser console.

## 15. Important Implementation Notes

- JSON Server is used as a mock backend for this academic project.
- The frontend uses Fetch API to communicate with the backend.
- Login information is stored in browser localStorage.
- Password checking is performed by frontend JavaScript against records returned by JSON Server.
- This is a frontend academic implementation, not a production-secure authentication system.
- JSON Server provides the REST endpoints; it does not implement server-side role-based authorization.