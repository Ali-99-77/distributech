CREATE OR REPLACE FUNCTION create_shipment_status_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.shp_status <> OLD.shp_status THEN
        INSERT INTO notification (usr_id, ntf_description)
        VALUES (
            NEW.usr_id,
            'Your shipment #' || NEW.shp_id || ' status has changed to: ' || NEW.shp_status
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shipment_status_change_trigger
AFTER UPDATE ON shipment
FOR EACH ROW
EXECUTE FUNCTION create_shipment_status_notification();

-- #######

CREATE OR REPLACE FUNCTION adjust_inventory_on_shipment_transit()
RETURNS TRIGGER AS $$
DECLARE
    item_record RECORD;
BEGIN
    IF NEW.shp_status = 'IN_TRANSIT' AND (OLD.shp_status IS NULL OR OLD.shp_status <> 'IN_TRANSIT') THEN
        
        FOR item_record IN 
            SELECT shp_item_id, prd_id, whs_id, shp_item_quantity 
            FROM shipmentitem 
            WHERE shp_id = NEW.shp_id
        LOOP
            UPDATE inventory
            SET inv_quantity_on_hand = inv_quantity_on_hand - item_record.shp_item_quantity,
                inv_updated_at = NOW()
            WHERE whs_id = item_record.whs_id 
              AND prd_id = item_record.prd_id;

        END LOOP;
        
        INSERT INTO notification (usr_id, ntf_description)
        VALUES (
            NEW.usr_id,
            'Inventory adjusted for shipment #' || NEW.shp_id || ' now IN_TRANSIT'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_adjustment_on_transit_trigger
AFTER UPDATE ON shipment
FOR EACH ROW
EXECUTE FUNCTION adjust_inventory_on_shipment_transit();


CREATE OR REPLACE FUNCTION check_unique_product_per_warehouse()
RETURNS TRIGGER AS $$
DECLARE
    existing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO existing_count
    FROM inventory
    WHERE whs_id = NEW.whs_id
      AND prd_id = NEW.prd_id;
    
    IF existing_count > 0 THEN
        RAISE EXCEPTION 
            'Product ID % already has inventory in warehouse ID %. Each warehouse can only have one inventory record per product.',
            NEW.prd_id, NEW.whs_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_unique_product_per_warehouse
BEFORE INSERT ON inventory
FOR EACH ROW
EXECUTE FUNCTION check_unique_product_per_warehouse();
