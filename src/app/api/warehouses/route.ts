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
      const sql = `SELECT ${fieldsStr} FROM "Warehouse" ${orderByClause} ${limitClause} ${offsetClause}`;
      const data= await pool.query(sql);
      return NextResponse.json({ success: true, data: data.rows});
    } finally {
       
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.usr_id || !body.whs_name || !body.whs_location) {
      return NextResponse.json(
        {
          success: false,
          error: '"User" ID, "Warehouse" name, and location are required',
        },
        { status: 400 }
      );
    }
    
    try {
      const fields = Object.keys(body);
      const placeholders = Array(fields.length).fill("?").join(", ");
      const values = fields.map((field) => body[field]);
      const sql = `INSERT INTO "Warehouse" (${fields.join(
        ", "
      )}) VALUES (${placeholders})`;
      const result = await pool.query(sql, values);
      return NextResponse.json(
        { success: true, data: { id: (result as any).insertId, ...body } },
        { status: 201 }
      );
    } finally {
       
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}
