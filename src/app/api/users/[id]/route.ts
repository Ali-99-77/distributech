import { NextRequest, NextResponse } from "next/server";
import { handleDatabaseError } from "@/lib/apiUtils";
import pool from "@/lib/db";

function getUserId(params: { params: { id: string } }): number {
  return parseInt(params.params.id, 10);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid User ID" },
        { status: 400 }
      );
    }
    
    try {
      const sql = `SELECT * FROM "User" WHERE usr_id = ?`;
      const results = await pool.query(sql, [userId]);
      const data = results as any;
      if (!data.length) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: data[0] });
    } finally {
      // connection.release();
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid User ID" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { usr_id, ...updates } = body;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }
    

    try {
      const setEntries = Object.entries(updates);
      const setClause = setEntries.map(([key, _]) => `${key} = ?`).join(", ");
      const setValues = setEntries.map(([_, value]) => value);
      const values = [...setValues, userId];
      const updateSql = `UPDATE "User" SET ${setClause} WHERE usr_id = ?`;
      const result = await pool.query(updateSql, values);
      if ((result as any).affectedRows === 0) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }
      const selectSql = `SELECT * FROM "User" WHERE usr_id = ?`;
      const data= await pool.query(selectSql, [userId]);
      return NextResponse.json({ success: true, data: (data as any)[0] });
    } finally {
      // connection.release();
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid User ID" },
        { status: 400 }
      );
    }
    
    try {
      const checkSql = `SELECT usr_id FROM "User" WHERE usr_id = ?`;
      const checkResult = await pool.query(checkSql, [userId]);
      if (!(checkResult as any).length) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }
      const deleteSql = `DELETE FROM "User" WHERE usr_id = ?`;
      await pool.query(deleteSql, [userId]);
      return NextResponse.json({
        success: true,
        data: { deleted: true, id: userId },
      });
    } finally {
      // connection.release();
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}
