import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  handleDatabaseError,
  extractQueryParams,
  buildWhereClause,
} from "@/lib/sqlUtils";
import { QueryResult } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { fields, where, orderBy, limit, offset, includeCount } =
      extractQueryParams(request);
    

    try {
      const fieldsStr = fields.join(", ");
      const whereClause = buildWhereClause(where);
      const orderByClause = orderBy ? `ORDER BY ${orderBy}` : "";
      const limitClause = limit > 0 ? `LIMIT ${limit}` : "";
      const offsetClause = offset > 0 ? `OFFSET ${offset}` : "";

      let sql = `SELECT ${fieldsStr} FROM "Product" ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}`;

      const result = await pool.query(sql);
      const data = result.rows || result;

      let count;
      if (includeCount) {
        const countSql = `SELECT COUNT(*) as count FROM "Product" ${whereClause}`;
        const countResult = await pool.query(countSql);
        count = (countResult.rows?.[0] || countResult[0])?.count;
      }

      return NextResponse.json<QueryResult<any>>({
        success: true,
        data,
        count: includeCount ? count : (data as any).length,
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
    if (
      !body.prd_name ||
      !body.prd_category ||
      body.prd_unit_price === undefined
    ) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Product name, category, and unit price are required",
        },
        { status: 400 }
      );
    }

    

    try {
      const fields = Object.keys(body);
      const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(", ");
      const values = fields.map((field) => body[field]);

      const sql = `INSERT INTO "Product" (${fields.join(", ")}) VALUES (${placeholders}) RETURNING *`;
      const result = await pool.query(sql, values);
      const insertedRow = result.rows[0];

      return NextResponse.json<QueryResult<any>>(
        {
          success: true,
          data: {
            id: (result as any).insertId,
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