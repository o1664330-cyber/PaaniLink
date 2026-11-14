# PaaniLink – Water Tanker Booking and Management System

## 1. Project Overview

PaaniLink is a web-based Water Tanker Booking and Management System designed to simplify water tanker booking, allocation, delivery tracking and resource management.

The system connects customers, administrators, Zone Officers, Hydrant Operators and Drivers through separate dashboards.

## 2. Technologies Used

- HTML5 – Website structure
- CSS3 – Styling and responsive design
- JavaScript – Frontend functionality
- JSON Server – Mock REST API and data storage
- Visual Studio Code – Development environment

## 3. User Roles

### Customer
- Register and log in.
- Book water tankers.
- View booking history.
- Cancel eligible bookings.
- Confirm water delivery.
- Report delivery disputes.

### Administrator
- Manage customer bookings.
- Manage tankers and drivers.
- Manage hydrants.
- Review subsidy applications.
- Manage billing records.

### Zone Officer
- View bookings in the assigned zone.
- Review subsidy applications.
- Handle customer delivery disputes.

### Hydrant Operator
- View assigned hydrant information.
- Manage hydrant availability.
- View approved bookings.
- Assign available tankers and drivers.
- Record tanker filling and departure.

### Driver
- View assigned trips.
- Update trip status.
- Mark delivery as completed or failed.
- Provide a reason for failed delivery.

## 4. Project Structure

```text
PaaniLink/
│
├── index.html
├── login.html
├── register.html
├── customer.html
├── admin.html
├── officer.html
├── operator.html
├── driver.html
├── style.css
├── script.js
├── db.json
├── package.json
└── package-lock.json
```

## 5. Installation and Setup

1. Install Node.js.
2. Open the PaaniLink project folder in Visual Studio Code.
3. Open the VS Code terminal.
4. Install JSON Server:

```bash
npm install json-server
```

5. Start the JSON Server:

```bash
npx json-server db.json --port 3000
```

6. Keep the terminal running.
7. Open `index.html` using the VS Code Live Server extension.

The website will use the local JSON Server API at:

`http://localhost:3000`

## 6. Database Collections

The `db.json` file contains the following collections:

- customers
- bookings
- tankers
- drivers
- hydrants
- zones
- subsidies
- bills
- officers
- operators

## 7. Responsive Design

PaaniLink includes responsive layouts for desktop and mobile devices using CSS media queries, Flexbox and Grid.

The dashboards have been tested using mobile preview at 360 × 800 pixels.

## 8. Project Purpose

The purpose of PaaniLink is to improve the organization of water tanker booking and delivery operations by providing separate dashboards and responsibilities for each user role.

## 9. Project Type

Academic Midterm Project – Frontend Web Development

**Project Name:** PaaniLink  
**Project Domain:** Water Tanker Booking and Management System