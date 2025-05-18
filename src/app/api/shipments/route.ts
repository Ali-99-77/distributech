import { NextRequest, NextResponse } from "next/server";
import { handleDatabaseError } from "@/lib/apiUtils";
import { QueryResult } from "@/lib/types";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fields = searchParams.get("fields")?.split(",") || ["*"];
    const where = searchParams.get("where") || "";
    const orderBy = searchParams.get("orderBy") || "";
    const limit = parseInt(searchParams.get("limit") || "0");
    const offset = parseInt(searchParams.get("offset") || "0");
    const withDetails = searchParams.get("withDetails") === "true";

    const fieldsStr = fields.join(", ");
    const whereClause = where ? `WHERE ${where}` : "";
    const orderByClause = orderBy ? `ORDER BY ${orderBy}` : "";
    const limitClause = limit > 0 ? `LIMIT ${limit}` : "";
    const offsetClause = offset > 0 ? `OFFSET ${offset}` : "";

    try {

      const shipmentsSql = `
          SELECT 
            "Shipment".*,
            "User".usr_username, 
            "User".usr_email
          FROM "Shipment"
          INNER JOIN "User" ON "Shipment".usr_id = "User".usr_id
          ${whereClause}
          ${orderByClause} ${limitClause} ${offsetClause}
        `;

      const shipmentsResult = await pool.query(shipmentsSql);

      const shipments = await Promise.all(
        shipmentsResult.rows.map(async (shipment) => {
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

          const itemsResult = await pool.query(itemsSql, [shipment.shp_id]);

          return {
            ...shipment,
            items: itemsResult.rows.map((row) => ({
              shp_item_id: row.shp_item_id,
              shp_item_quantity: row.shp_item_quantity,
              shp_unit_price: row.shp_unit_price,
              product: {
                prd_id: row.prd_id,
                prd_name: row.prd_name,
                prd_description: row.prd_description,
                prd_unit_price: row.prd_unit_price,
              },
            })),
          };
        })
      );

   
      return NextResponse.json({
        success: true,
        data: shipments,
        count: shipmentsResult.rowCount,
      });
    } finally {
       
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.usr_id) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: '"User" ID is required',
        },
        { status: 400 }
      );
    }

    if (!body.shp_request_date) {
      body.shp_request_date = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    }

    if (!body.products) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Products are required",
        },
        { status: 400 }
      );
    }

    if (!body.shp_status) {
      body.shp_status = "PENDING";
    }

    let insertedId: string;

    try {
      const { products, ..._fields } = body;
      const fields = Object.keys(_fields);
      const quotedFields = fields.map((field) => `"${field}"`);
      const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");
      const values = fields.map((field) => body[field]);
      const sql = `INSERT INTO "Shipment" (${quotedFields.join(
        ", "
      )}) VALUES (${placeholders}) RETURNING shp_id`;

      const result = await pool.query(sql, values);
      insertedId = result.rows[0].shp_id;
      if (!insertedId) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error: "Failed to insert shipment",
          },
          { status: 500 }
        );
      }
    } catch (error) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Failed to insert shipment: " + error,
        },
        { status: 500 }
      );
    }

    try {
      const productIds = body.products.map((product: any) => product.prd_id);
      const quantities = body.products.map((product: any) => product.quantity);

      const insertPromises = productIds.map(
        async (prd_id: number, index: number) => {
          const productPriceResult = await pool.query(
            `SELECT prd_unit_price FROM "Product" WHERE prd_id = $1`,
            [prd_id]
          );

          const productPrice = productPriceResult.rows[0]?.prd_unit_price;

          const shipmentItemSql = `
          INSERT INTO "ShipmentItem" ("shp_id", "prd_id", "shp_item_quantity", "shp_unit_price")
          VALUES ($1, $2, $3, $4)
        `;
          return pool.query(shipmentItemSql, [
            insertedId,
            prd_id,
            quantities[index],
            productPrice,
          ]);
        }
      );

      await Promise.all(insertPromises);
    } catch (error) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Failed to insert shipment products: " + error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<QueryResult<any>>(
      {
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function PUT(request: NextRequest) {
  return NextResponse.json<QueryResult<any>>(
    {
      success: false,
      error: "Bulk updates not allowed. Use PATCH with specific IDs instead.",
    },
    { status: 405 }
  );
}
