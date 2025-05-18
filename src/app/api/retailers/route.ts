import { NextRequest, NextResponse } from "next/server";
import {
  executeSelectQuery,
  executeInsertQuery,
  executeJoinQuery,
  handleDatabaseError,
  extractQueryParams,
} from "@/lib/apiUtils";
import { QueryResult } from "@/lib/types";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  const { fields, where, orderBy, limit, offset, includeCount } =
    extractQueryParams(request);
  const searchParams = request.nextUrl.searchParams;

  try {
    const whereClause = where
      ? `WHERE ${Object.entries(where)
          .map(([key, value], index) => `${key} = $${index + 1}`)
          .join(" AND ")}`
      : "";

    const orderByClause = orderBy ? `ORDER BY ${orderBy}` : "";
    const limitClause = limit > 0 ? `LIMIT ${limit}` : "";
    const offsetClause = offset > 0 ? `OFFSET ${offset}` : "";

    const sql = `
          SELECT *
          FROM "Retailer" r
          INNER JOIN "User" u ON r.usr_id = u.usr_id
          ${orderByClause} ${limitClause} ${offsetClause}
        `;

    const values = where ? Object.values(where) : [];
    const data = await pool.query(sql, values);

    return NextResponse.json({
      success: true,
      data: data.rows,
      count: data.rowCount,
    });
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userData = {}, retailerData = {} } = body;

    if (!userData.usr_email || !retailerData.rtl_store_name) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Email and store name are required",
        },
        { status: 400 }
      );
    }

    try {
      userData.usr_role = "RETAILER";

      const userFields = Object.keys(userData);
      const userPlaceholders = userFields.map((_, i) => `$${i + 1}`).join(", ");
      const userValues = userFields.map((field) => userData[field]);

      const userSql = `INSERT INTO "User" (${userFields.join(", ")}) 
                       VALUES (${userPlaceholders}) RETURNING usr_id`;

      const userResult = await pool.query(userSql, userValues);
      const userId = userResult.rows[0].usr_id;

      retailerData.usr_id = userId;

      const retailerFields = Object.keys(retailerData);
      const retailerPlaceholders = retailerFields
        .map((_, i) => `$${i + 1}`)
        .join(", ");
      const retailerValues = retailerFields.map((field) => retailerData[field]);

      const retailerSql = `INSERT INTO "Retailer" (${retailerFields.join(
        ", "
      )}) VALUES (${retailerPlaceholders})`;

      await pool.query(retailerSql, retailerValues);

      return NextResponse.json<QueryResult<any>>(
        {
          success: true,
          data: {
            user: { ...userData, usr_id: userId },
            retailer: retailerData,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      throw error;
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}
