import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { handleDatabaseError, extractQueryParams } from "@/lib/apiUtils";
import { QueryResult } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { fields, orderBy, limit, offset, includeCount } =
      extractQueryParams(request);
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    const withDetails = searchParams.get("withDetails") === "true";

    try {
      let data;
      let count = 0;
      const whereClause = productId ? `WHERE "Inventory".prd_id = ?` : "";
      const orderByClause = orderBy ? `ORDER BY ${orderBy}` : "";
      const limitClause = limit > 0 ? `LIMIT ${limit}` : "";
      const offsetClause = offset > 0 ? `OFFSET ${offset}` : "";
      const params = productId ? [productId] : [];

      if (withDetails) {
        const sql = `SELECT "Inventory".*, "Product".prd_name, "Product".prd_category, "Product".prd_unit_price, "Warehouse".whs_name, "Warehouse".whs_location 
          FROM "Inventory"
          INNER JOIN "Product" ON "Inventory".prd_id = "Product".prd_id
          INNER JOIN "Warehouse" ON "Inventory".whs_id = "Warehouse".whs_id
          ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}`;
        data = await pool.query(sql, params);
      } else {
        const fieldsStr = fields.join(", ");
        const sql = `SELECT ${fieldsStr} FROM "Inventory" ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}`;
        data = await pool.query(sql, params);
      }

      if (includeCount) {
        const countSql = `SELECT COUNT(*) as count FROM "Inventory" ${whereClause}`;
        const countResult = await pool.query(countSql, params);
        count = (countResult as any)[0].count;
      } else {
        count = 0;
      }

      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: data.rows,
        count,
      });
    } finally {
      // connection.release();
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.whs_id || !body.prd_id) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Warehouse ID and Product ID are required",
        },
        { status: 400 }
      );
    }

    if (body.inv_quantity_on_hand === undefined) {
      body.inv_quantity_on_hand = 0;
    }
    if (body.inv_quantity_required === undefined) {
      body.inv_quantity_required = 0;
    }

    try {
      const fields = Object.keys(body);
      const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");
      const values = fields.map((f) => body[f]);
      const sql = `INSERT INTO "Inventory" (${fields.join(
        ", "
      )}) VALUES (${placeholders})`;
      const result = await pool.query(sql, values);
      return NextResponse.json<QueryResult<any>>(
        {
          success: true,
          data: {
            id: result,
            ...body,
          },
        },
        { status: 201 }
      );
    } finally {
      // connection.release();
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}
