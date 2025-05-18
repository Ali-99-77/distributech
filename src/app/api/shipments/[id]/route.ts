import { NextRequest, NextResponse } from "next/server";
import { handleDatabaseError } from "@/lib/apiUtils";
import pool from "@/lib/db";

function getShipmentId(params: { params: { id: string } }): string {
  return params.params.id;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shipmentId = getShipmentId({ params });

    if (!shipmentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid "Shipment" ID',
        },
        { status: 400 }
      );
    }

    const shipmentSql = `
      SELECT 
        "Shipment".*,
        "User".usr_username, 
        "User".usr_email
      FROM "Shipment"
      INNER JOIN "User" ON "Shipment".usr_id = "User".usr_id
      WHERE "Shipment".shp_id = $1
    `;

    const shipmentResult = await pool.query(shipmentSql, [shipmentId]);

    if (shipmentResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Shipment not found",
        },
        { status: 404 }
      );
    }

    const itemsSql = `
      SELECT 
        si.shp_item_id,
        si.shp_item_quantity,
        si.shp_unit_price,
        p.prd_id,
        p.prd_name,
        p.prd_description,
        p.prd_unit_price
      FROM "ShipmentItem" si
      JOIN "Product" p ON si.prd_id = p.prd_id
      WHERE si.shp_id = $1
    `;

    const itemsResult = await pool.query(itemsSql, [shipmentId]);

    const shipment = {
      ...shipmentResult.rows[0],
      items: itemsResult.rows.map((item) => ({
        shp_item_id: item.shp_item_id,
        shp_item_quantity: item.shp_item_quantity,
        shp_unit_price: item.shp_unit_price,
        product: {
          prd_id: item.prd_id,
          prd_name: item.prd_name,
          prd_description: item.prd_description,
          prd_unit_price: item.prd_unit_price,
        },
      })),
    };

    return NextResponse.json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    return handleDatabaseError(error);
  }
}
