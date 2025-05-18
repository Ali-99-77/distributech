CREATE OR REPLACE VIEW retailer_shipment_summary AS
SELECT
    shp.shp_id,
    u.usr_id AS retailer_id,
    u.usr_username AS retailer_username,
    u.usr_fname || ' ' || u.usr_lname AS retailer_name,
    rt.rt_store_name AS store_name,
    shp.shp_request_date,
    shp.shp_status,
    shp.shp_location,
    COUNT(si.shp_item_id) AS item_count,
    SUM(si.shp_item_quantity * p.prd_unit_price) AS total_value,
    d.del_status AS delivery_status,
    d.del_date AS estimated_delivery_date
FROM shipment shp
JOIN "User" u ON shp.usr_id = u.usr_id
JOIN retailer rt ON u.usr_id = rt.usr_id
LEFT JOIN shipmentitem si ON shp.shp_id = si.shp_id
LEFT JOIN product p ON si.prd_id = p.prd_id
LEFT JOIN delivery d ON shp.shp_id = d.shp_id
WHERE u.usr_role = 'RETAILER'
GROUP BY shp.shp_id, u.usr_id, rt.rt_store_name, d.del_status, d.del_date
ORDER BY shp.shp_request_date DESC;


CREATE OR REPLACE VIEW warehouse_inventory_status AS
SELECT
    w.whs_id,
    w.whs_name,
    w.whs_location,
    p.prd_id,
    p.prd_name,
    p.prd_category,
    i.inv_quantity_on_hand,
    i.inv_quantity_required,
    i.inv_updated_at,
    CASE 
        WHEN i.inv_quantity_on_hand < i.inv_quantity_required THEN 'LOW STOCK'
        WHEN i.inv_quantity_on_hand = 0 THEN 'OUT OF STOCK'
        ELSE 'IN STOCK'
    END AS stock_status,
    (i.inv_quantity_on_hand - i.inv_quantity_required) AS surplus_deficit
FROM warehouse w
JOIN inventory i ON w.whs_id = i.whs_id
JOIN product p ON i.prd_id = p.prd_id
ORDER BY w.whs_name, stock_status, p.prd_name;