TRUNCATE TABLE delivery,
shipmentitem,
shipment,
notification,
inventory,
product,
distributor,
retailer,
user,
warehouse CASCADE;

-- Insert Warehouses
INSERT INTO
    warehouse (whs_id, whs_name, whs_location, whs_contact_num)
VALUES
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'Main Distribution Center',
        '123 Industrial Park, Anytown',
        '555-100-1000'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'North Regional Warehouse',
        '456 Commerce St, Northville',
        '555-200-2000'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'South Regional Warehouse',
        '789 Business Ave, Southburg',
        '555-300-3000'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'East Storage Facility',
        '321 Trade Blvd, Easton',
        '555-400-4000'
    );

-- Insert Users
INSERT INTO
    "User" (
        usr_id,
        usr_username,
        usr_email,
        usr_fname,
        usr_lname,
        usr_role
    )
VALUES
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'admin1',
        'admin1@distro.com',
        'John',
        'Smith',
        'ADMIN'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'admin2',
        'admin2@distro.com',
        'Sarah',
        'Johnson',
        'ADMIN'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'retailer1',
        'retailer1@store.com',
        'Mike',
        'Williams',
        'RETAILER'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'retailer2',
        'retailer2@store.com',
        'Emily',
        'Brown',
        'RETAILER'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        'retailer3',
        'retailer3@store.com',
        'David',
        'Jones',
        'RETAILER'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
        'distro1',
        'driver1@distro.com',
        'Robert',
        'Taylor',
        'DISTRIBUTOR'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
        'distro2',
        'driver2@distro.com',
        'Lisa',
        'Miller',
        'DISTRIBUTOR'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
        'distro3',
        'driver3@distro.com',
        'James',
        'Wilson',
        'DISTRIBUTOR'
    );

-- Insert Retailers
INSERT INTO
    retailer (usr_id, rt_store_name, rt_business_number)
VALUES
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'Fresh Market',
        'BUS12345678'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'Urban Grocers',
        'BUS87654321'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        'Corner Store',
        'BUS19283746'
    );

-- Insert Distributors
INSERT INTO
    distributor (usr_id, dst_distribution_area, dst_plate_num)
VALUES
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
        'North District',
        'ABC123'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
        'South District',
        'XYZ789'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
        'East District',
        'DEF456'
    );

-- Insert Products
INSERT INTO
    product (
        prd_id,
        prd_name,
        prd_category,
        prd_description,
        prd_unit_price
    )
VALUES
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'Organic Apples',
        'Produce',
        'Fresh organic apples, 1kg bag',
        3.99
    ),
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'Whole Grain Bread',
        'Bakery',
        'Whole grain loaf, 500g',
        2.49
    ),
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'Free Range Eggs',
        'Dairy',
        '12 free range eggs',
        4.29
    ),
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'Mineral Water',
        'Beverages',
        '1L bottle of mineral water',
        1.19
    ),
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        'Organic Milk',
        'Dairy',
        '1L organic milk',
        2.99
    ),
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
        'Dark Chocolate',
        'Snacks',
        '100g dark chocolate bar',
        3.49
    ),
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
        'Pasta',
        'Dry Goods',
        '500g pack of spaghetti',
        1.79
    ),
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
        'Tomato Sauce',
        'Canned Goods',
        '400g jar of tomato sauce',
        2.29
    ),
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
        'Olive Oil',
        'Condiments',
        '250ml extra virgin olive oil',
        5.99
    ),
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
        'Frozen Berries',
        'Frozen',
        '500g frozen mixed berries',
        4.49
    );

-- Insert Inventory
INSERT INTO
    inventory (
        whs_id,
        prd_id,
        inv_quantity_on_hand,
        inv_quantity_required,
        inv_updated_at
    )
VALUES
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        150,
        100,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        200,
        150,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        300,
        250,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        500,
        400,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        180,
        150,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        80,
        100,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        120,
        150,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
        50,
        75,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
        200,
        200,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
        90,
        100,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        100,
        120,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        300,
        350,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        70,
        100,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
        60,
        80,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
        90,
        120,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
        30,
        50,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
        150,
        200,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
        60,
        80,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
        40,
        60,
        NOW ()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
        50,
        80,
        NOW ()
    );

-- Insert Shipments
INSERT INTO
    shipment (
        shp_id,
        usr_id,
        shp_pay_method,
        shp_request_date,
        shp_status,
        shp_location
    )
VALUES
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'CREDIT_CARD',
        NOW () - INTERVAL '2 days',
        'PENDING',
        'Fresh Market, 123 Main St'
    ),
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'INVOICE',
        NOW () - INTERVAL '1 day',
        'PROCESSING',
        'Urban Grocers, 456 Oak Ave'
    ),
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        'CREDIT_CARD',
        NOW () - INTERVAL '3 days',
        'IN_TRANSIT',
        'Corner Store, 789 Elm St'
    ),
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'INVOICE',
        NOW () - INTERVAL '5 days',
        'DELIVERED',
        'Fresh Market, 123 Main St'
    );

-- Insert Shipment Items
INSERT INTO
    shipmentitem (
        shp_item_id,
        shp_id,
        prd_id,
        whs_id,
        shp_item_quantity,
        shp_unit_price
    )
VALUES
    (
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        20,
        3.99
    ),
    (
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        10,
        4.29
    ),
    (
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        15,
        2.99
    ),
    (
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        30,
        2.49
    ),
    (
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        20,
        3.49
    ),
    (
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        15,
        2.29
    ),
    (
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        50,
        1.19
    ),
    (
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        10,
        5.99
    ),
    (
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        20,
        4.49
    ),
    (
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        15,
        3.99
    ),
    (
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        20,
        2.49
    ),
    (
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        30,
        1.79
    );

-- Insert Deliveries
INSERT INTO
    delivery (shp_id, dst_id, del_status, del_date, del_fee)
VALUES
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
        'IN_TRANSIT',
        NOW () + INTERVAL '1 day',
        25.00
    ),
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
        'DELIVERED',
        NOW () - INTERVAL '2 days',
        30.00
    );

-- Insert Notifications
INSERT INTO
    notification (ntf_id, usr_id, ntf_description)
VALUES
    (
        'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'Shipment #d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11 created and pending processing'
    ),
    (
        'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'Shipment #d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12 is now being processed'
    ),
    (
        'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        'Shipment #d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13 is now IN_TRANSIT'
    ),
    (
        'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        'Delivery for shipment #d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13 is scheduled for tomorrow'
    ),
    (
        'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'Delivery for shipment #d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14 completed'
    ),
    (
        'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
        'Delivery completed for shipment #d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'
    ),
    (
        'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'Low inventory alert: Organic Apples at Main Distribution Center (Current: 80, Required: 100)'
    ),
    (
        'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'Low inventory alert: Free Range Eggs at South Regional Warehouse (Current: 100, Required: 120)'
    ),
    (
        'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'System maintenance scheduled for tonight at 2 AM'
    );