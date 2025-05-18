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
    const withUserDetails = searchParams.get("withUserDetails") === "true";

    const fieldsStr = fields.join(", ");
    const orderByClause = orderBy ? `ORDER BY ${orderBy}` : "";
    const limitClause = limit > 0 ? `LIMIT ${limit}` : "";
    const offsetClause = offset > 0 ? `OFFSET ${offset}` : "";

    

    try {
      let sql;

      if (withUserDetails) {
        sql = fields.includes("*")
          ? `SELECT "Distributor".*, "User".usr_username, "User".usr_email, "User".usr_fname, "User".usr_lname 
             FROM "Distributor" 
             INNER JOIN "User" ON "Distributor".usr_id = "User".usr_id 
             ${orderByClause} ${limitClause} ${offsetClause}`
          : `SELECT ${fieldsStr} 
             FROM "Distributor" 
             INNER JOIN "User" ON "Distributor".usr_id = "User".usr_id 
             ${orderByClause} ${limitClause} ${offsetClause}`;
      } else {
        sql = `SELECT ${fieldsStr} FROM "Distributor" ${orderByClause} ${limitClause} ${offsetClause}`;
      }

      const data= await pool.query(sql);

      return NextResponse.json({
        success: true,
        data,
        count: (data as any).length,
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

    const requiredUserFields = [
      "usr_username",
      "usr_email",
      "usr_fname",
      "usr_lname",
    ];

    const missingFields = requiredUserFields.filter((field) => !body[field]);

    if (missingFields.length) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    

    try {

      const existingUser = await pool.query(
        'SELECT usr_id FROM "User" WHERE usr_username = $1 OR usr_email = $2',
        [body.usr_username, body.usr_email]
      );

      if ((existingUser as any).length > 0) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error: "Username or email already exists",
          },
          { status: 409 }
        );
      }

      const userFields = {
        usr_username: body.usr_username,
        usr_email: body.usr_email,
        usr_fname: body.usr_fname,
        usr_lname: body.usr_lname,
        usr_role: "DISTRIBUTOR",
      };

      const userResult = await pool.query('INSERT INTO "User" SET $1', [
        userFields,
      ]);

      const userId = (userResult as any).insertId;

      const distributorData = { ...body, usr_id: userId };
      requiredUserFields
        .concat(["usr_role"])
        .forEach((field) => delete distributorData[field]);

      const distributorFields = Object.keys(distributorData);
      const placeholders = Array(distributorFields.length).fill("?").join(", ");
      const values = distributorFields.map((field) => distributorData[field]);

      const sql = `INSERT INTO "Distributor" (${distributorFields.join(
        ", "
      )}) VALUES (${placeholders})`;
      await pool.query(sql, values);

      return NextResponse.json<QueryResult<any>>(
        {
          success: true,
          data: {
            ...userFields,
            ...distributorData,
            usr_id: userId,
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
