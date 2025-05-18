import { NextRequest, NextResponse } from "next/server";
import { handleDatabaseError } from "@/lib/apiUtils";
import { QueryResult } from "@/lib/types";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fields = searchParams.get("fields")?.split(",") || ["*"];
    const orderBy = searchParams.get("orderBy") || "";
    const limit = parseInt(searchParams.get("limit") || "0");
    const offset = parseInt(searchParams.get("offset") || "0");
    const fieldsStr = fields.join(", ");
    const orderByClause = orderBy ? `ORDER BY ${orderBy}` : "";
    const limitClause = limit > 0 ? `LIMIT ${limit}` : "";
    const offsetClause = offset > 0 ? `OFFSET ${offset}` : "";

    try {
      const sql = `SELECT ${fieldsStr} FROM "User" ${orderByClause} ${limitClause} ${offsetClause}`;
      const data= await pool.query(sql);
      return NextResponse.json({ success: true, data });
    } finally {
       
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.usr_username || !body.usr_email || !body.usr_role) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Username, email and role are required",
        },
        { status: 400 }
      );
    }

    const validRoles = ["ADMIN", "RETAILER", "DISTRIBUTOR"];
    if (!validRoles.includes(body.usr_role)) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        },
        { status: 400 }
      );
    }

    

    try {
      const fields = Object.keys(body);
      const placeholders = Array(fields.length).fill("?").join(", ");
      const values = fields.map((field) => body[field]);
      const sql = `INSERT INTO "User" (${fields.join(
        ", "
      )}) VALUES (${placeholders})`;

      const result = await pool.query(sql, values);

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
       
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}
