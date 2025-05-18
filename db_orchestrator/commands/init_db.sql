CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('ADMIN', 'RETAILER', 'DISTRIBUTOR');

CREATE TABLE
    "User" (
        usr_id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        usr_username VARCHAR(50) NOT NULL UNIQUE,
        usr_email VARCHAR(100) NOT NULL UNIQUE,
        usr_fname VARCHAR(50) NOT NULL,
        usr_lname VARCHAR(50) NOT NULL,
        usr_role user_role NOT NULL
    );

CREATE TABLE
    "Retailer" (
        usr_id UUID PRIMARY KEY REFERENCES "User" (usr_id) ON DELETE CASCADE,
        rtl_store_name VARCHAR(100) NOT NULL,
        rtl_business_number VARCHAR(50) NOT NULL
    );

CREATE TABLE
    "Distributor" (
        usr_id UUID PRIMARY KEY REFERENCES "User" (usr_id) ON DELETE CASCADE,
        dst_distribution_area VARCHAR(100) NOT NULL,
        dst_plate_num VARCHAR(20) NOT NULL
    );

CREATE TABLE
    "Warehouse" (
        whs_id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        usr_id UUID NOT NULL REFERENCES "User" (usr_id) ON DELETE SET NULL,
        whs_name VARCHAR(100) NOT NULL,
        whs_location VARCHAR(200) NOT NULL,
        whs_contact_num VARCHAR(20) NOT NULL
    );

CREATE TABLE
    "Product" (
        prd_id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        prd_name VARCHAR(100) NOT NULL,
        prd_category VARCHAR(50) NOT NULL,
        prd_description TEXT,
        prd_unit_price NUMERIC(12, 2) NOT NULL CHECK (prd_unit_price >= 0)
    );

CREATE TABLE
    "Inventory" (
        inv_id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        whs_id UUID NOT NULL REFERENCES "Warehouse" (whs_id) ON DELETE CASCADE,
        prd_id UUID NOT NULL REFERENCES "Product" (prd_id) ON DELETE CASCADE,
        inv_quantity_on_hand INTEGER NOT NULL CHECK (inv_quantity_on_hand >= 0),
        inv_quantity_required INTEGER NOT NULL CHECK (inv_quantity_required >= 0),
        inv_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (whs_id, prd_id)
    );

CREATE TABLE
    "Payment" (
        pay_id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        usr_id UUID NOT NULL REFERENCES "User" (usr_id) ON DELETE SET NULL,
        pay_method VARCHAR(30) NOT NULL
    );

CREATE TABLE
    "Shipment" (
        shp_id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        usr_id UUID NOT NULL REFERENCES "User" (usr_id) ON DELETE SET NULL,
        shp_request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        shp_status VARCHAR(20) NOT NULL,
        shp_location VARCHAR(200),
        shp_comment TEXT,
        CONSTRAINT chk_shp_status CHECK (
            shp_status IN ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED')
        )
    );

CREATE TABLE
    "ShipmentItem" (
        shp_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        shp_id UUID NOT NULL REFERENCES "Shipment" (shp_id) ON DELETE CASCADE,
        prd_id UUID NOT NULL REFERENCES "Product" (prd_id) ON DELETE CASCADE,
        whs_id UUID REFERENCES "Warehouse" (whs_id) ON DELETE CASCADE,
        shp_item_quantity INTEGER NOT NULL CHECK (shp_item_quantity > 0),
        shp_unit_price NUMERIC(12, 2) NOT NULL CHECK (shp_unit_price >= 0)
    );

CREATE TABLE
    "Delivery" (
        shp_id UUID PRIMARY KEY REFERENCES "Shipment" (shp_id) ON DELETE CASCADE,
        dst_id UUID NOT NULL REFERENCES "Distributor" (usr_id) ON DELETE SET NULL,
        del_status VARCHAR(20) NOT NULL,
        del_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        del_fee NUMERIC(12, 2) NOT NULL CHECK (del_fee >= 0),
        CONSTRAINT chk_del_status CHECK (
            del_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')
        )
    );

CREATE TABLE
    "Notification" (
        ntf_id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        usr_id UUID NOT NULL REFERENCES "User" (usr_id) ON DELETE CASCADE,
        ntf_description TEXT NOT NULL
    );