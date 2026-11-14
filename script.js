

function toggleMenu() {

    const navLinks = document.getElementById("navLinks");

    navLinks.classList.toggle("active");

}

// ==================================
// PAANILINK - BOOKING FORM API
// ==================================

const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {

    bookingForm.addEventListener("submit", async function(event) {

        event.preventDefault();
// Get logged-in customer
const loggedInCustomer = JSON.parse(
    localStorage.getItem("loggedInCustomer") || "null"
);

if (!loggedInCustomer) {
    alert("Please log in as a customer first.");
    window.location.href = "login.html";
    return;
}
        // Get form values
        const capacity = document.getElementById("capacity").value;
        const bookingType = document.getElementById("bookingType").value;
        const deliveryAddress = document.getElementById("deliveryAddress").value;
        const zone = document.getElementById("zone").value;
        const deliveryDate = document.getElementById("deliveryDate").value;

        // Create booking object
       const booking = {
    capacity: Number(capacity),
    bookingType: bookingType,
    deliveryAddress: deliveryAddress,
    zone: zone,
    deliveryDate: deliveryDate,
    status: "Pending",

    customerId: loggedInCustomer.id,
    customerName: loggedInCustomer.fullName,
    customerEmail: loggedInCustomer.email
};

        try {

            // Send booking to JSON Server
            const response = await fetch("http://localhost:3000/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(booking)
            });

            if (!response.ok) {
                throw new Error("Booking could not be saved");
            }

            const savedBooking = await response.json();

            alert("Booking submitted successfully! Booking ID: " + savedBooking.id);

            // Clear form
            bookingForm.reset();

        } catch (error) {

            console.error("Booking Error:", error);

            alert("Unable to submit booking. Please check your server.");

        }

    });

}
// ==================================
// LOAD BOOKING HISTORY
// ==================================


async function loadBookingHistory() {
    const table = document.getElementById("bookingHistoryTable");

    if (!table) return;

    const loggedInCustomer = JSON.parse(
        localStorage.getItem("loggedInCustomer") || "null"
    );

    if (!loggedInCustomer) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/bookings");

        if (!response.ok) {
            throw new Error("Unable to load bookings");
        }

        const bookings = await response.json();

        const customerBookings = bookings.filter(function(booking) {
            return String(booking.customerId) === String(loggedInCustomer.id);
        });

        const tableBody = table.querySelector("tbody");
        tableBody.innerHTML = "";

        if (customerBookings.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">You have not made any bookings yet.</td>
                </tr>
            `;
            return;
        }

        customerBookings.forEach(function(booking) {
            const row = document.createElement("tr");

            let actions = "Not Available";

            if (booking.status === "Pending" && !booking.tankerId) {
                actions = `
                    <button onclick="cancelCustomerBooking('${booking.id}')">
                        Cancel Booking
                    </button>
                `;
            }

            if (booking.tripStatus === "Delivered") {
                actions = `
                    ${booking.deliveryConfirmation === "Confirmed"
                        ? "Delivery Confirmed"
                        : `<button onclick="confirmCustomerDelivery('${booking.id}')">
                            Confirm Delivery
                           </button>`
                    }
                    <button onclick="reportCustomerDispute('${booking.id}')">
                        Report Dispute
                    </button>
                `;
            }

            if (booking.tripStatus === "Failed") {
                actions = `
                    <button onclick="reportCustomerDispute('${booking.id}')">
                        Report Dispute
                    </button>
                `;
            }

            row.innerHTML = `
                <td>${booking.id}</td>
                <td>${booking.capacity} Gallons</td>
                <td>${booking.bookingType}</td>
                <td>${booking.deliveryAddress}</td>
                <td>${booking.zone}</td>
                <td>${booking.deliveryDate}</td>
                <td>${booking.status}</td>
                <td>${actions}</td>
            `;

            tableBody.appendChild(row);
        });

// Load customer delivery disputes

    } catch (error) {
        console.error("Error loading bookings:", error);
    }
}

loadOfficerDashboard();


// ==================================
// CUSTOMER DELIVERY CONFIRMATION
// ==================================

async function confirmCustomerDelivery(bookingId) {
    const customer = JSON.parse(
        localStorage.getItem("loggedInCustomer") || "null"
    );

    if (!customer) {
        alert("Please log in first.");
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/bookings/${bookingId}`
        );

        if (!response.ok) throw new Error("Booking not found.");

        const booking = await response.json();

        if (String(booking.customerId) !== String(customer.id)) {
            alert("You cannot update another customer's booking.");
            return;
        }

        if (booking.tripStatus !== "Delivered") {
            alert("Delivery has not been marked as delivered yet.");
            return;
        }

        const confirmed = confirm(
            "Have you received your water tanker delivery?"
        );

        if (!confirmed) return;

        const update = await fetch(
            `http://localhost:3000/bookings/${bookingId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    deliveryConfirmation: "Confirmed"
                })
            }
        );

        if (!update.ok) throw new Error("Confirmation failed.");

        alert("Delivery confirmed successfully!");
        loadBookingHistory();

    } catch (error) {
        console.error(error);
        alert("Unable to confirm delivery.");
    }
}


// ==================================
// CUSTOMER DELIVERY DISPUTE
// ==================================

async function reportCustomerDispute(bookingId) {
    const customer = JSON.parse(
        localStorage.getItem("loggedInCustomer") || "null"
    );

    if (!customer) {
        alert("Please log in first.");
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/bookings/${bookingId}`
        );

        if (!response.ok) throw new Error("Booking not found.");

        const booking = await response.json();

        if (String(booking.customerId) !== String(customer.id)) {
            alert("You cannot report another customer's booking.");
            return;
        }

        if (
            booking.tripStatus !== "Delivered" &&
            booking.tripStatus !== "Failed"
        ) {
            alert("You can report a dispute after a delivery attempt.");
            return;
        }

        if (booking.disputeStatus === "Reported") {
            alert("A dispute has already been reported for this booking.");
            return;
        }

        const reason = prompt("Please describe your delivery problem:");

        if (!reason || !reason.trim()) {
            alert("Please enter a dispute reason.");
            return;
        }

        const update = await fetch(
            `http://localhost:3000/bookings/${bookingId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    disputeStatus: "Reported",
                    disputeReason: reason.trim()
                })
            }
        );

        if (!update.ok) throw new Error("Dispute submission failed.");

        alert("Your delivery dispute has been submitted!");
        loadBookingHistory();

    } catch (error) {
        console.error(error);
        alert("Unable to submit your dispute.");
    }
}
loadBookingHistory();

// ==================================
// PAANILINK - ADMIN BOOKING MANAGEMENT
// ==================================

async function loadAdminBookings() {
    const table = document.getElementById("adminBookingTable");

    if (!table) return;

    try {
        const response = await fetch("http://localhost:3000/bookings");

        if (!response.ok) {
            throw new Error("Unable to load bookings");
        }

        const bookings = await response.json();
        const tableBody = table.querySelector("tbody");

        tableBody.innerHTML = "";

        bookings.forEach(function(booking) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${booking.id}</td>
                <td>${booking.capacity} Gallons</td>
                <td>${booking.bookingType}</td>
                <td>${booking.deliveryAddress}</td>
                <td>${booking.zone}</td>
                <td>${booking.deliveryDate}</td>
                <td>${booking.status}</td>
            `;

            const actionCell = document.createElement("td");

            const approveButton = document.createElement("button");
            approveButton.textContent = "Approve";

            approveButton.addEventListener("click", function() {
                updateBookingStatus(booking.id, "Approved");
            });

            const rejectButton = document.createElement("button");
            rejectButton.textContent = "Reject";

            rejectButton.addEventListener("click", function() {
                updateBookingStatus(booking.id, "Rejected");
            });

            actionCell.appendChild(approveButton);
            actionCell.appendChild(rejectButton);

            row.appendChild(actionCell);
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Admin booking error:", error);
    }
}


async function updateBookingStatus(id, status) {
    try {
        const response = await fetch(
            `http://localhost:3000/bookings/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: status })
            }
        );

        if (!response.ok) {
            throw new Error("Could not update booking");
        }

        alert("Booking status updated to " + status);

        loadAdminBookings();

    } catch (error) {
        console.error("Status update error:", error);
        alert("Unable to update booking status.");
    }
}
// Load bookings only on the Admin Dashboard
loadAdminBookings();

// ==================================
// PAANILINK - TANKER MANAGEMENT
// ==================================

async function loadTankers() {
    const tableBody = document.getElementById("tankerTableBody");

    if (!tableBody) return;

    try {
        const response = await fetch("http://localhost:3000/tankers");

        if (!response.ok) {
            throw new Error("Unable to load tankers");
        }

        const tankers = await response.json();

        tableBody.innerHTML = "";

        tankers.forEach(function(tanker) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${tanker.id}</td>
                <td>${tanker.capacity} Gallons</td>
                <td>${tanker.status}</td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Tanker loading error:", error);
    }
}

loadTankers();

// ==================================
// PAANILINK - DRIVER MANAGEMENT
// ==================================

const driverForm = document.getElementById("driverForm");

if (driverForm) {
    driverForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const driverName = document.getElementById("driverName").value;
        const driverPhone = document.getElementById("driverPhone").value;

        const driver = {
            name: driverName,
            phone: driverPhone,
            status: "Available"
        };

        try {
            const response = await fetch("http://localhost:3000/drivers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(driver)
            });

            if (!response.ok) {
                throw new Error("Unable to add driver");
            }

            alert("Driver added successfully!");

            driverForm.reset();
            loadDrivers();

        } catch (error) {
            console.error("Driver Error:", error);
            alert("Unable to add driver. Check your server.");
        }
    });
}

async function loadDrivers() {
    const tableBody = document.getElementById("driverTableBody");

    if (!tableBody) return;

    try {
        const response = await fetch("http://localhost:3000/drivers");
        const drivers = await response.json();

        tableBody.innerHTML = "";

        drivers.forEach(function(driver) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${driver.id}</td>
                <td>${driver.name}</td>
                <td>${driver.phone}</td>
                <td>${driver.status}</td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Driver loading error:", error);
    }
}

loadDrivers();


// ==================================
// PAANILINK - HYDRANT MANAGEMENT
// ==================================

const hydrantForm = document.getElementById("hydrantForm");

if (hydrantForm) {
    hydrantForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const hydrantName = document.getElementById("hydrantName").value;
        const hydrantLocation = document.getElementById("hydrantLocation").value;

        const hydrant = {
            name: hydrantName,
            location: hydrantLocation,
            status: "Available"
        };

        try {
            const response = await fetch("http://localhost:3000/hydrants", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(hydrant)
            });

            if (!response.ok) {
                throw new Error("Unable to add hydrant");
            }

            alert("Hydrant added successfully!");

            hydrantForm.reset();
            loadHydrants();

        } catch (error) {
            console.error("Hydrant Error:", error);
            alert("Unable to add hydrant. Check your server.");
        }
    });
}

async function loadHydrants() {
    const tableBody = document.getElementById("hydrantTableBody");

    if (!tableBody) return;

    try {
        const response = await fetch("http://localhost:3000/hydrants");

        if (!response.ok) {
            throw new Error("Unable to load hydrants");
        }

        const hydrants = await response.json();

        tableBody.innerHTML = "";

        hydrants.forEach(function(hydrant) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${hydrant.id}</td>
                <td>${hydrant.name}</td>
                <td>${hydrant.location}</td>
                <td>${hydrant.status}</td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Hydrant loading error:", error);
    }
}

loadHydrants();

// ==================================
// PAANILINK - SUBSIDY MANAGEMENT
// ==================================

async function loadSubsidies() {
    const tableBody = document.getElementById("subsidyTableBody");

    if (!tableBody) return;

    try {
        const response = await fetch("http://localhost:3000/subsidies");

        if (!response.ok) {
            throw new Error("Unable to load subsidies");
        }

        const subsidies = await response.json();

        tableBody.innerHTML = "";

        subsidies.forEach(function(subsidy) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${subsidy.id}</td>
                <td>${subsidy.customerName || "Not provided"}</td>
                <td>${subsidy.address || "Not provided"}</td>
                <td>${subsidy.status || "Pending"}</td>
            `;

            const actionCell = document.createElement("td");

            const approveButton = document.createElement("button");
            approveButton.textContent = "Approve";

            approveButton.addEventListener("click", function() {
                updateSubsidyStatus(subsidy.id, "Approved");
            });

            const rejectButton = document.createElement("button");
            rejectButton.textContent = "Reject";

            rejectButton.addEventListener("click", function() {
                updateSubsidyStatus(subsidy.id, "Rejected");
            });

            actionCell.appendChild(approveButton);
            actionCell.appendChild(rejectButton);

            row.appendChild(actionCell);
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Subsidy loading error:", error);
    }
}

async function updateSubsidyStatus(id, status) {
    try {
        const response = await fetch(
            `http://localhost:3000/subsidies/${encodeURIComponent(id)}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: status })
            }
        );

        if (!response.ok) {
            throw new Error("Could not update subsidy");
        }

        alert("Subsidy status updated to " + status);
        loadSubsidies();

    } catch (error) {
        console.error("Subsidy update error:", error);
        alert("Unable to update subsidy status.");
    }
}

loadSubsidies();

// ==================================
// CUSTOMER SUBSIDY APPLICATION
// ==================================

const subsidyForm = document.getElementById("subsidyForm");

if (subsidyForm) {
    subsidyForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const customerName = document.getElementById("subsidyCustomerName").value;
        const address = document.getElementById("subsidyAddress").value;

        const subsidy = {
            customerName: customerName,
            address: address,
            status: "Pending"
        };

        try {
            const response = await fetch("http://localhost:3000/subsidies", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(subsidy)
            });

            if (!response.ok) {
                throw new Error("Unable to submit subsidy application");
            }

            alert("Subsidy application submitted successfully!");

            subsidyForm.reset();

        } catch (error) {
            console.error("Subsidy application error:", error);
            alert("Unable to submit application. Please check your server.");
        }
    });
}

// ==================================
// PAANILINK - BILLING MANAGEMENT
// ==================================

async function loadBills() {
    const tableBody = document.getElementById("billTableBody");

    if (!tableBody) return;

    try {
        const response = await fetch("http://localhost:3000/bills");

        if (!response.ok) {
            throw new Error("Unable to load bills");
        }

        const bills = await response.json();

        tableBody.innerHTML = "";

        bills.forEach(function(bill) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${bill.id}</td>
                <td>${bill.customerName}</td>
                <td>${bill.bookingId}</td>
                <td>PKR ${bill.amount}</td>
                <td>${bill.paymentStatus}</td>
            `;

            const actionCell = document.createElement("td");

            const button = document.createElement("button");
            button.textContent =
                bill.paymentStatus === "Paid" ? "Mark Unpaid" : "Mark Paid";

            button.addEventListener("click", function() {
                const newStatus =
                    bill.paymentStatus === "Paid" ? "Unpaid" : "Paid";

                updateBillStatus(bill.id, newStatus);
            });

            actionCell.appendChild(button);
            row.appendChild(actionCell);

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Bill loading error:", error);
    }
}

async function updateBillStatus(id, status) {
    try {
        const response = await fetch(
            `http://localhost:3000/bills/${encodeURIComponent(id)}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ paymentStatus: status })
            }
        );

        if (!response.ok) {
            throw new Error("Could not update bill");
        }

        alert("Payment status updated to " + status);
        loadBills();

    } catch (error) {
        console.error("Bill update error:", error);
        alert("Unable to update payment status.");
    }
}

loadBills();

// ==================================
// PAANILINK - CUSTOMER BILL HISTORY
// ==================================

async function loadCustomerBills() {
    const tableBody = document.getElementById("customerBillTableBody");

    if (!tableBody) return;

    try {
        const response = await fetch("http://localhost:3000/bills");

        if (!response.ok) {
            throw new Error("Unable to load customer bills");
        }

        const bills = await response.json();

        tableBody.innerHTML = "";

        bills.forEach(function(bill) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${bill.id}</td>
                <td>${bill.bookingId}</td>
                <td>PKR ${bill.amount}</td>
                <td>${bill.paymentStatus}</td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Customer bill loading error:", error);
    }
}

loadCustomerBills();

// ==================================
// PAANILINK - CUSTOMER REGISTRATION
// ==================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const cnic = document.getElementById("cnic").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const address = document.getElementById("address").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Check passwords
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            // Check whether CNIC is already registered
            const checkResponse = await fetch(
                "http://localhost:3000/customers?cnic=" + encodeURIComponent(cnic)
            );

            if (!checkResponse.ok) {
                throw new Error("Could not check customer records");
            }

            const existingCustomers = await checkResponse.json();

            if (existingCustomers.length > 0) {
                alert("This CNIC is already registered!");
                return;
            }

            // Create customer record
            const customer = {
                fullName: fullName,
                cnic: cnic,
                phone: phone,
                email: email,
                address: address,
                password: password
            };

            // Save customer to JSON Server
            const response = await fetch("http://localhost:3000/customers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(customer)
            });

            if (!response.ok) {
                throw new Error("Registration failed");
            }

            alert("Account created successfully! You can now log in.");

            registerForm.reset();
            window.location.href = "login.html";

        } catch (error) {
            console.error("Registration error:", error);
            alert("Unable to register. Please check your server.");
        }
    });
}
// ==================================
// PAANILINK - CUSTOMER AND OFFICER LOGIN
// ==================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        try {

            // CUSTOMER LOGIN
            if (role === "customer") {

                const response = await fetch(
                    "http://localhost:3000/customers?email=" +
                    encodeURIComponent(email)
                );

                if (!response.ok) {
                    throw new Error("Unable to check customer account");
                }

                const customers = await response.json();

                const customer = customers.find(function(item) {
                    return item.password === password;
                });

                if (!customer) {
                    alert("Incorrect email or password!");
                    return;
                }

                localStorage.setItem("loggedInCustomer", JSON.stringify({
                    id: customer.id,
                    fullName: customer.fullName,
                    email: customer.email,
                    role: "customer"
                }));

                alert("Login successful! Welcome " + customer.fullName);

                window.location.href = "customer.html";
            }

            // ZONE OFFICER LOGIN
            else if (role === "officer") {

                const response = await fetch(
                    "http://localhost:3000/officers?email=" +
                    encodeURIComponent(email)
                );

                if (!response.ok) {
                    throw new Error("Unable to check officer account");
                }

                const officers = await response.json();

                const officer = officers.find(function(item) {
                    return item.password === password;
                });

                if (!officer) {
                    alert("Incorrect officer email or password!");
                    return;
                }

                localStorage.setItem("loggedInOfficer", JSON.stringify({
                    id: officer.id,
                    name: officer.name,
                    email: officer.email,
                    zone: officer.zone,
                    role: "officer"
                }));

                alert("Officer login successful! Welcome " + officer.name);

                window.location.href = "officer.html";
            }

             else if (role === "operator") {

    const response = await fetch(
        "http://localhost:3000/operators?email=" +
        encodeURIComponent(email)
    );

    if (!response.ok) {
        throw new Error("Unable to check operator account");
    }

    const operators = await response.json();

    const operator = operators.find(function(item) {
        return item.password === password;
    });

    if (!operator) {
        alert("Incorrect operator email or password!");
        return;
    }

    localStorage.setItem("loggedInOperator", JSON.stringify({
        id: operator.id,
        name: operator.name,
        email: operator.email,
        hydrantId: operator.hydrantId,
        role: "operator"
    }));

    alert("Operator login successful! Welcome " + operator.name);

    window.location.href = "operator.html";
}
// DRIVER LOGIN
else if (role === "driver") {

    const response = await fetch(
        "http://localhost:3000/drivers?email=" +
        encodeURIComponent(email)
    );

    if (!response.ok) {
        throw new Error("Unable to check driver account");
    }

    const drivers = await response.json();

    const driver = drivers.find(function(item) {
        return item.password === password;
    });

    if (!driver) {
        alert("Incorrect driver email or password!");
        return;
    }

    localStorage.setItem("loggedInDriver", JSON.stringify({
        id: driver.id,
        name: driver.name,
        email: driver.email,
        role: "driver"
    }));

    alert("Driver login successful! Welcome " + driver.name);

    window.location.href = "driver.html";
}
else {
    alert("This role is not configured yet.");
}
        } catch (error) {
            console.error("Login error:", error);
            alert("Unable to login. Please check your server.");
        }
    });
}

// ==================================
// PAANILINK - ZONE OFFICER DASHBOARD
// ==================================

async function loadOfficerDashboard() {
    const bookingTable = document.getElementById("officerBookingTable");

    // Run only on the Officer Dashboard
    if (!bookingTable) return;

    const officerData = localStorage.getItem("loggedInOfficer");

    if (!officerData) {
        alert("Please log in as a Zone Officer.");
        window.location.href = "login.html";
        return;
    }

    const officer = JSON.parse(officerData);

    document.getElementById("officerInfo").innerHTML =
    officer.name + "<br>Assigned Zone: " + officer.zone;

    try {
        // Load bookings
        const bookingResponse = await fetch("http://localhost:3000/bookings");

        if (!bookingResponse.ok) {
            throw new Error("Unable to load bookings");
        }

        const bookings = await bookingResponse.json();

        const bookingBody = bookingTable.querySelector("tbody");
        bookingBody.innerHTML = "";

        // Display only bookings in this officer's zone
        const zoneBookings = bookings.filter(function(booking) {
            return booking.zone === officer.zone;
        });

        zoneBookings.forEach(function(booking) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${booking.id}</td>
                <td>${booking.capacity} Gallons</td>
                <td>${booking.bookingType}</td>
                <td>${booking.deliveryAddress}</td>
                <td>${booking.zone}</td>
                <td>${booking.deliveryDate}</td>
                <td>${booking.status}</td>
            `;

            bookingBody.appendChild(row);
        });

        // Load subsidy applications
        const subsidyResponse = await fetch("http://localhost:3000/subsidies");

        if (!subsidyResponse.ok) {
            throw new Error("Unable to load subsidy applications");
        }

        const subsidies = await subsidyResponse.json();

        const subsidyTable = document.getElementById("officerSubsidyTable");
        const subsidyBody = subsidyTable.querySelector("tbody");

        subsidyBody.innerHTML = "";

        // Match applications to the officer's zone
        const zoneSubsidies = subsidies.filter(function(application) {
            return application.address.toLowerCase().includes(
                officer.zone.toLowerCase()
            );
        });

        zoneSubsidies.forEach(function(application) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${application.id}</td>
                <td>${application.customerName}</td>
                <td>${application.address}</td>
                <td>${application.status}</td>
                <td></td>
            `;

            const actionCell = row.querySelector("td:last-child");

            if (application.status === "Pending") {
                const approveButton = document.createElement("button");
                approveButton.textContent = "Approve";
                approveButton.onclick = function() {
                    updateOfficerSubsidy(application.id, "Approved");
                };

                const rejectButton = document.createElement("button");
                rejectButton.textContent = "Reject";
                rejectButton.onclick = function() {
                    updateOfficerSubsidy(application.id, "Rejected");
                };

                actionCell.appendChild(approveButton);
                actionCell.appendChild(rejectButton);
            }

            subsidyBody.appendChild(row);
        });

        

    } catch (error) {
        console.error("Officer dashboard error:", error);
        alert("Unable to load officer dashboard data.");
    }
}

// Approve or reject subsidy applications
async function updateOfficerSubsidy(id, status) {
    try {
        const response = await fetch(
            "http://localhost:3000/subsidies/" + encodeURIComponent(id),
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: status })
            }
        );

        if (!response.ok) {
            throw new Error("Could not update subsidy application");
        }

        alert("Subsidy application " + status + "!");
        loadOfficerDashboard();

    } catch (error) {
        console.error("Subsidy update error:", error);
        alert("Unable to update subsidy application.");
    }
}

// Officer logout
function logoutOfficer() {
    localStorage.removeItem("loggedInOfficer");
    window.location.href = "login.html";
}

// Load only on Officer Dashboard
loadOfficerDashboard();

// ==================================
// PAANILINK - HYDRANT OPERATOR DASHBOARD
// ==================================

async function loadOperatorDashboard() {

    const hydrantTable = document.getElementById("operatorHydrantTable");

    // Run only on the Operator Dashboard
    if (!hydrantTable) return;

    const operatorData = localStorage.getItem("loggedInOperator");

    if (!operatorData) {
        alert("Please log in as a Hydrant Operator.");
        window.location.href = "login.html";
        return;
    }

    const operator = JSON.parse(operatorData);

    document.getElementById("operatorInfo").textContent =
        operator.name + " | Assigned Hydrant: " + operator.hydrantId;

    try {

        // LOAD ASSIGNED HYDRANT
        const hydrantResponse = await fetch(
            "http://localhost:3000/hydrants/" +
            encodeURIComponent(operator.hydrantId)
        );

        if (!hydrantResponse.ok) {
            throw new Error("Unable to load assigned hydrant");
        }

        const hydrant = await hydrantResponse.json();

        const hydrantBody = hydrantTable.querySelector("tbody");
        hydrantBody.innerHTML = "";

        const hydrantRow = document.createElement("tr");

        hydrantRow.innerHTML = `
            <td>${hydrant.id}</td>
            <td>${hydrant.name}</td>
            <td>${hydrant.location}</td>
            <td>${hydrant.status}</td>
            <td></td>
        `;

        const actionCell = hydrantRow.querySelector("td:last-child");
        const statusButton = document.createElement("button");

        statusButton.textContent =
            hydrant.status === "Available"
                ? "Mark Unavailable"
                : "Mark Available";

        statusButton.onclick = function() {
            updateHydrantStatus(
                hydrant.id,
                hydrant.status === "Available"
                    ? "Unavailable"
                    : "Available"
            );
        };

        actionCell.appendChild(statusButton);
        hydrantBody.appendChild(hydrantRow);

        
        // LOAD TANKERS AND DRIVERS
        const [bookingResponse, tankerResponse, driverResponse] =
            await Promise.all([
                fetch("http://localhost:3000/bookings"),
                fetch("http://localhost:3000/tankers"),
                fetch("http://localhost:3000/drivers")
            ]);

        if (!bookingResponse.ok || !tankerResponse.ok || !driverResponse.ok) {
            throw new Error("Unable to load bookings, tankers or drivers");
        }

        const bookings = await bookingResponse.json();
        const tankers = await tankerResponse.json();
        const drivers = await driverResponse.json();

        const bookingBody = document.querySelector(
            "#operatorBookingTable tbody"
        );

        bookingBody.innerHTML = "";

        const hydrantZone = hydrant.location.trim().toLowerCase();

        const approvedBookings = bookings.filter(function(booking) {
            return booking.status === "Approved" &&
                booking.zone.trim().toLowerCase() === hydrantZone;
        });

        approvedBookings.forEach(function(booking) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${booking.id}</td>
                <td>${booking.capacity} Gallons</td>
                <td>${booking.deliveryAddress}</td>
                <td>${booking.zone}</td>
                <td>${booking.deliveryDate}</td>
                <td>${booking.status}</td>
            `;

            const tankerCell = document.createElement("td");
            const driverCell = document.createElement("td");
            const actionCell = document.createElement("td");
            const fillingCell = document.createElement("td");
            const departureCell = document.createElement("td");

            const tankerSelect = document.createElement("select");
            const driverSelect = document.createElement("select");
            const assignButton = document.createElement("button");

            tankerSelect.innerHTML =
                '<option value="">Select Tanker</option>';

            tankers.filter(function(tanker) {
                return tanker.status === "Available" &&
                    Number(tanker.capacity) >= Number(booking.capacity);
            }).forEach(function(tanker) {
                const option = document.createElement("option");
                option.value = tanker.id;
                option.textContent =
                    tanker.id + " - " + tanker.capacity + " Gallons";
                tankerSelect.appendChild(option);
            });

            driverSelect.innerHTML =
                '<option value="">Select Driver</option>';

            drivers.filter(function(driver) {
                return driver.status === "Available";
            }).forEach(function(driver) {
                const option = document.createElement("option");
                option.value = driver.id;
                option.textContent = driver.name;
                driverSelect.appendChild(option);
            });

            assignButton.textContent = "Assign";

            if (booking.tankerId && booking.driverId) {
                tankerSelect.disabled = true;
                driverSelect.disabled = true;
                assignButton.disabled = true;
                assignButton.textContent = "Already Assigned";

                tankerSelect.innerHTML =
                    `<option>${booking.tankerId}</option>`;

                driverSelect.innerHTML =
                    `<option>${booking.driverName || booking.driverId}</option>`;
            }

            assignButton.addEventListener("click", function() {
                assignTankerAndDriver(
                    booking.id,
                    tankerSelect.value,
                    driverSelect.value
                );
            });

            tankerCell.appendChild(tankerSelect);
            driverCell.appendChild(driverSelect);
            actionCell.appendChild(assignButton);
            // Filling button
const fillingButton = document.createElement("button");
fillingButton.textContent =
    booking.fillingStatus === "Filled" ? "Filled" : "Record Filling";

fillingButton.disabled = !booking.tankerId ||
    booking.fillingStatus === "Filled";

fillingButton.onclick = function() {
    updateBookingProgress(booking.id, "fillingStatus", "Filled");
};

// Departure button
const departureButton = document.createElement("button");
departureButton.textContent =
    booking.departureStatus === "Departed" ? "Departed" : "Record Departure";

departureButton.disabled = booking.fillingStatus !== "Filled" ||
    booking.departureStatus === "Departed";

departureButton.onclick = function() {
    updateBookingProgress(booking.id, "departureStatus", "Departed");
};

fillingCell.appendChild(fillingButton);
departureCell.appendChild(departureButton);

            row.appendChild(tankerCell);
            row.appendChild(driverCell);
            row.appendChild(actionCell);
            row.appendChild(fillingCell);
            row.appendChild(departureCell);

            bookingBody.appendChild(row);
        });

        // LOAD ALL TANKERS
        const tankerBody = document.querySelector(
            "#operatorTankerTable tbody"
        );

        tankerBody.innerHTML = "";

        tankers.forEach(function(tanker) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${tanker.id}</td>
                <td>${tanker.capacity} Gallons</td>
                <td>${tanker.status}</td>
            `;

            tankerBody.appendChild(row);
        });


    } catch (error) {
        console.error("Operator dashboard error:", error);
        alert("Unable to load operator dashboard data.");
    }
}


// ASSIGN TANKER AND DRIVER TO BOOKING
async function assignTankerAndDriver(bookingId, tankerId, driverId) {

    if (!tankerId || !driverId) {
        alert("Please select both a tanker and a driver.");
        return;
    }

    try {

        const bookingResponse = await fetch(
            "http://localhost:3000/bookings/" +
            encodeURIComponent(bookingId)
        );

        const tankerResponse = await fetch(
            "http://localhost:3000/tankers/" +
            encodeURIComponent(tankerId)
        );

        const driverResponse = await fetch(
            "http://localhost:3000/drivers/" +
            encodeURIComponent(driverId)
        );

        if (!bookingResponse.ok ||
            !tankerResponse.ok ||
            !driverResponse.ok) {
            throw new Error("Unable to verify selected records");
        }

        const booking = await bookingResponse.json();
        const tanker = await tankerResponse.json();
        const driver = await driverResponse.json();

        if (booking.status !== "Approved" ||
            booking.tankerId ||
            tanker.status !== "Available" ||
            driver.status !== "Available" ||
            Number(tanker.capacity) < Number(booking.capacity)) {
            alert("This booking, tanker or driver is no longer available.");
            loadOperatorDashboard();
            return;
        }

        const results = await Promise.all([
            fetch("http://localhost:3000/bookings/" +
                encodeURIComponent(bookingId), {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tankerId: tanker.id,
                        driverId: driver.id,
                        driverName: driver.name,
                        dispatchStatus: "Assigned"
                    })
                }),

            fetch("http://localhost:3000/tankers/" +
                encodeURIComponent(tankerId), {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "Assigned" })
                }),

            fetch("http://localhost:3000/drivers/" +
                encodeURIComponent(driverId), {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "Assigned" })
                })
        ]);

        if (results.some(function(response) {
            return !response.ok;
        })) {
            throw new Error("One or more assignments could not be saved");
        }

        alert("Tanker and driver assigned successfully!");

        loadOperatorDashboard();

    } catch (error) {
        console.error("Assignment error:", error);
        alert("Unable to complete assignment. Please check the server.");
    }
}
// UPDATE BOOKING FILLING AND DEPARTURE STATUS
async function updateBookingProgress(bookingId, field, status) {
    try {
        const response = await fetch(
            "http://localhost:3000/bookings/" +
            encodeURIComponent(bookingId),
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    [field]: status
                })
            }
        );

        if (!response.ok) {
            throw new Error("Unable to update booking progress");
        }

        alert("Booking updated successfully: " + status);

        loadOperatorDashboard();

    } catch (error) {
        console.error("Booking progress error:", error);
        alert("Unable to update filling or departure status.");
    }
}
// UPDATE HYDRANT AVAILABILITY
async function updateHydrantStatus(id, status) {

    try {

        const response = await fetch(
            "http://localhost:3000/hydrants/" + encodeURIComponent(id),
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: status })
            }
        );

        if (!response.ok) {
            throw new Error("Could not update hydrant");
        }

        alert("Hydrant status updated to " + status);

        loadOperatorDashboard();

    } catch (error) {
        console.error("Hydrant update error:", error);
        alert("Unable to update hydrant status.");
    }
}


// OPERATOR LOGOUT
function logoutOperator() {
    localStorage.removeItem("loggedInOperator");
    window.location.href = "login.html";
}


// LOAD OPERATOR DASHBOARD
loadOperatorDashboard();
// ==================================
// PAANILINK - DRIVER DASHBOARD
// ==================================

async function loadDriverDashboard() {

    const bookingTable = document.getElementById("driverBookingTable");

    // Run only on Driver Dashboard
    if (!bookingTable) return;

    const driverData = localStorage.getItem("loggedInDriver");

    if (!driverData) {
        alert("Please log in as a Driver.");
        window.location.href = "login.html";
        return;
    }

    const driver = JSON.parse(driverData);

    document.getElementById("driverInfo").textContent =
        driver.name + " | Driver Dashboard";

    try {

        const response = await fetch("http://localhost:3000/bookings");

        if (!response.ok) {
            throw new Error("Unable to load assigned trips");
        }

        const bookings = await response.json();

        const tableBody = bookingTable.querySelector("tbody");
        tableBody.innerHTML = "";

        // Show only trips assigned to this driver
        const myTrips = bookings.filter(function(booking) {
            return String(booking.driverId) === String(driver.id);
        });

        myTrips.forEach(function(booking) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${booking.id}</td>
                <td>${booking.capacity} Gallons</td>
                <td>${booking.deliveryAddress}</td>
                <td>${booking.zone}</td>
                <td>${booking.deliveryDate}</td>
                <td>${booking.tripStatus || "Assigned"}</td>
                <td></td>
            `;
// Get the Action column
const actionCell = row.querySelector("td:last-child");

// Arrived button
const arrivedButton = document.createElement("button");
arrivedButton.textContent = "Arrived";

arrivedButton.onclick = function() {
    updateDriverTripStatus(booking.id, "Arrived");
};

// Delivered button
const deliveredButton = document.createElement("button");
deliveredButton.textContent = "Delivered";

deliveredButton.onclick = function() {
    updateDriverTripStatus(booking.id, "Delivered");
};

// Failed button
const failedButton = document.createElement("button");
failedButton.textContent = "Failed";

failedButton.onclick = function() {
    const reason = prompt("Enter reason for failed delivery:");

    if (reason && reason.trim() !== "") {
        updateDriverTripStatus(
            booking.id,
            "Failed",
            reason.trim()
        );
    }
};

// Add buttons to Action column
actionCell.appendChild(arrivedButton);
actionCell.appendChild(deliveredButton);
actionCell.appendChild(failedButton);
            tableBody.appendChild(row);
        });

        if (myTrips.length === 0) {
            tableBody.innerHTML =
                '<tr><td colspan="7">No trips assigned to you yet.</td></tr>';
        }

    } catch (error) {
        console.error("Driver dashboard error:", error);
        alert("Unable to load driver dashboard.");
    }
}


// DRIVER LOGOUT
function logoutDriver() {
    localStorage.removeItem("loggedInDriver");
    window.location.href = "login.html";
}


// LOAD DRIVER DASHBOARD
// UPDATE DRIVER TRIP STATUS
async function updateDriverTripStatus(bookingId, status, reason = "") {

    try {
        const response = await fetch(
            "http://localhost:3000/bookings/" +
            encodeURIComponent(bookingId),
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tripStatus: status,
                    failureReason: status === "Failed" ? reason : ""
                })
            }
        );

        if (!response.ok) {
            throw new Error("Unable to update trip status");
        }

        alert("Trip status updated to " + status);

        loadDriverDashboard();

    } catch (error) {
        console.error("Driver trip update error:", error);
        alert("Unable to update trip status.");
    }
}
loadDriverDashboard();

async function cancelCustomerBooking(bookingId) {
    const loggedInCustomer = JSON.parse(
        localStorage.getItem("loggedInCustomer") || "null"
    );

    if (!loggedInCustomer) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return;
    }

    const confirmCancel = confirm(
        "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
        // Get the selected booking
        const response = await fetch(
            `http://localhost:3000/bookings/${bookingId}`
        );

        if (!response.ok) {
            throw new Error("Booking not found.");
        }

        const booking = await response.json();

        // Check booking ownership and cancellation eligibility
        if (String(booking.customerId) !== String(loggedInCustomer.id)) {
            alert("You cannot cancel another customer's booking.");
            return;
        }

        if (booking.status !== "Pending" || booking.tankerId) {
            alert("This booking can no longer be cancelled.");
            return;
        }

        // Update booking status
        const updateResponse = await fetch(
            `http://localhost:3000/bookings/${bookingId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: "Cancelled"
                })
            }
        );

        if (!updateResponse.ok) {
            throw new Error("Unable to cancel booking.");
        }

        alert("Your booking has been cancelled successfully!");

        // Refresh booking history
        loadBookingHistory();

    } catch (error) {
        console.error("Cancellation error:", error);
        alert("Something went wrong while cancelling the booking.");
    }
}

async function resolveOfficerDispute(bookingId) {
    const officerData = localStorage.getItem("loggedInOfficer");

    if (!officerData) {
        alert("Please log in as a Zone Officer.");
        window.location.href = "login.html";
        return;
    }

    const officer = JSON.parse(officerData);

    const confirmResolve = confirm(
        "Are you sure you want to resolve this customer dispute?"
    );

    if (!confirmResolve) return;

    try {
        const response = await fetch(
            `http://localhost:3000/bookings/${bookingId}`
        );

        if (!response.ok) {
            throw new Error("Booking not found.");
        }

        const booking = await response.json();

        if (booking.zone !== officer.zone) {
            alert("You cannot resolve disputes outside your zone.");
            return;
        }

        if (booking.disputeStatus !== "Reported") {
            alert("This dispute is no longer pending.");
            return;
        }

        const updateResponse = await fetch(
            `http://localhost:3000/bookings/${bookingId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    disputeStatus: "Resolved",
                    resolvedBy: officer.name
                })
            }
        );

        if (!updateResponse.ok) {
            throw new Error("Unable to resolve dispute.");
        }

        alert("Customer dispute resolved successfully!");

        loadOfficerDashboard();

    } catch (error) {
        console.error("Dispute resolution error:", error);
        alert("Unable to resolve customer dispute.");
    }
}
