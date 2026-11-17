
flowchart TB
    System["PAANILINK WATER TANKER MANAGEMENT SYSTEM"]

    Customer["Customer"]
    Officer["Zone Officer"]
    Operator["Hydrant Operator"]
    Driver["Driver"]
    Admin["Administrator"]

    subgraph CustomerFunctions["Customer Functions"]
        C1["Register Account"]
        C2["Login"]
        C3["Book Water Tanker"]
        C4["View Booking History"]
        C5["Cancel Pending Booking"]
        C6["Confirm Delivery"]
        C7["Report Delivery Dispute"]
        C8["Apply for Subsidy"]
        C9["View Bills"]
    end

    subgraph OfficerFunctions["Zone Officer Functions"]
        O1["Login"]
        O2["View Zone Bookings"]
        O3["Approve or Reject Subsidy"]
        O4["Review and Resolve Disputes"]
    end

    subgraph OperatorFunctions["Hydrant Operator Functions"]
        H1["Login"]
        H2["View Assigned Hydrant"]
        H3["Manage Hydrant Availability"]
        H4["View Approved Bookings"]
        H5["Assign Tanker and Driver"]
        H6["Record Filling"]
        H7["Record Departure"]
    end

    subgraph DriverFunctions["Driver Functions"]
        D1["Login"]
        D2["View Assigned Trips"]
        D3["Update Trip Status"]
        D4["Record Failed Delivery Reason"]
    end

    subgraph AdminFunctions["Administrator Functions"]
        A1["Manage Bookings"]
        A2["Manage Tankers"]
        A3["Manage Drivers"]
        A4["Manage Hydrants"]
        A5["Manage Subsidies"]
        A6["Manage Bills"]
    end

    Customer --> C1
    Customer --> C2
    Customer --> C3
    Customer --> C4
    Customer --> C5
    Customer --> C6
    Customer --> C7
    Customer --> C8
    Customer --> C9

    Officer --> O1
    Officer --> O2
    Officer --> O3
    Officer --> O4

    Operator --> H1
    Operator --> H2
    Operator --> H3
    Operator --> H4
    Operator --> H5
    Operator --> H6
    Operator --> H7

    Driver --> D1
    Driver --> D2
    Driver --> D3
    Driver --> D4

    Admin --> A1
    Admin --> A2
    Admin --> A3
    Admin --> A4
    Admin --> A5
    Admin --> A6

    System --- CustomerFunctions
    System --- OfficerFunctions
    System --- OperatorFunctions
    System --- DriverFunctions
    System --- AdminFunctions
