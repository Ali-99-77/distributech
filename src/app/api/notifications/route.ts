import { NextRequest, NextResponse } from "next/server";
import { handleDatabaseError } from "@/lib/apiUtils";
import { QueryResult } from "@/lib/types";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fields = searchParams.get("fields")?.split(",") || ["*"];
    const where = searchParams.get("where") || "";
    const orderBy = searchParams.get("orderBy") || "ntf_id DESC";
    const limit = parseInt(searchParams.get("limit") || "0");
    const offset = parseInt(searchParams.get("offset") || "0");
    const withUserDetails = searchParams.get("withUserDetails") === "true";
    
    const whereClause = where ? `WHERE ${where}` : "";
    const orderByClause = `ORDER BY ${orderBy}`;
    const limitClause = limit > 0 ? `LIMIT ${limit}` : "";
    const offsetClause = offset > 0 ? `OFFSET ${offset}` : "";
    
    
    
    try {
      let sql;
      if (withUserDetails) {
        const fieldsStr = fields.includes("*") ? 
          `Notification.*, "User".usr_username, "User".usr_email` : 
          fields.join(", ");
        
        sql = `
          SELECT ${fieldsStr} 
          FROM "Notification" 
          INNER JOIN "User" ON "Notification".usr_id = "User".usr_id
          ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}
        `;
      } else {
        const fieldsStr = fields.join(", ");
        sql = `
          SELECT ${fieldsStr} 
          FROM "Notification" 
          ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}
        `;
      }
      
      const data= await pool.query(sql);
      
      return NextResponse.json<QueryResult<any>>({
        success: true,
        data,
        count: (data as any).length
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
    
    if (!body.usr_id || !body.ntf_description) {
      return NextResponse.json<QueryResult<any>>({
        success: false,
        error: ""User" ID and description are required"
      }, { status: 400 });
    }
    
    
    
    try {
      const [userData] = await pool.query(
        "SELECT usr_id FROM "User" WHERE usr_id = ?", 
        [body.usr_id]
      );
      
      if ((userData as any).length === 0) {
        return NextResponse.json<QueryResult<any>>({
          success: false,
          error: ""User" not found"
        }, { status: 404 });
      }
      
      const fields = Object.keys(body);
      const placeholders = Array(fields.length).fill("?").join(", ");
      const values = fields.map(field => body[field]);
      
      const sql = `INSERT INTO "Notification" (${fields.join(", ")}) VALUES (${placeholders})`;
      
      const result = await pool.query(sql, values);
      
      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: {
          ntf_id: (result as any).insertId,
          ...body
        }
      }, { status: 201 });
    } finally {
       
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userIdStr = searchParams.get("userId");
    const all = searchParams.get("all") === "true";
    
    if (!userIdStr && !all) {
      return NextResponse.json<QueryResult<any>>({
        success: false,
        error: "Must specify userId or all=true"
      }, { status: 400 });
    }
    
    
    
    try {
      let sql;
      let values: any[] = [];
      
      if (all) {
        sql = "DELETE FROM "Notification"";
      } else {
        const userId = parseInt(userIdStr!, 10);
        
        if (isNaN(userId)) {
          return NextResponse.json<QueryResult<any>>({
            success: false,
            error: "Invalid "User" ID"
          }, { status: 400 });
        }
        
        sql = "DELETE FROM "Notification" WHERE usr_id = ?";
        values = [userId];
      }
      
      const result = await pool.query(sql, values);
      
      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: { 
          deleted: true,
          affectedRows: (result as any).affectedRows
        }
      });
    } finally {
       
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}
