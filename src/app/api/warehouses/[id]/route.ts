import { NextRequest, NextResponse } from "next/server";
import { handleDatabaseError } from "@/lib/apiUtils";
import { QueryResult } from "@/lib/types";
import pool from "@/lib/db"; // Import the database pool

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const warehouseId = parseInt(params.id, 10);
    if (isNaN(warehouseId)) {
      return NextResponse.json(
        { success: false, error: "Invalid Warehouse ID" },
        { status: 400 }
      );
    }
    
    try {
      const sql = `SELECT * FROM "Warehouse" WHERE whs_id = ?`;
      const results = await pool.query(sql, [warehouseId]);
      const data = results as any;
      if (!data.length) {
        return NextResponse.json(
          { success: false, error: "Warehouse not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: data[0] });
    } finally {
       
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
    const warehouseId = parseInt(params.id, 10);
    if (isNaN(warehouseId)) {
      return NextResponse.json(
        { success: false, error: "Invalid Warehouse ID" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { whs_id, ...updates } = body;
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
      const values = [...setValues, warehouseId];
      const updateSql = `UPDATE "Warehouse" SET ${setClause} WHERE whs_id = ?`;
      const result = await pool.query(updateSql, values);

      if ((result as any).affectedRows === 0) {
        return NextResponse.json(
          { success: false, error: "Warehouse not found" },
          { status: 404 }
        );
      }

      const selectSql = `SELECT * FROM "Warehouse" WHERE whs_id = ?`;
      const data= await pool.query(selectSql, [warehouseId]);
      return NextResponse.json({ success: true, data: (data as any)[0] });
    } finally {
       
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
    const warehouseId = parseInt(params.id, 10);
    if (isNaN(warehouseId)) {
      return NextResponse.json(
        { success: false, error: "Invalid Warehouse ID" },
        { status: 400 }
      );
    }
    
    try {
      const checkSql = `SELECT whs_id FROM "Warehouse" WHERE whs_id = ?`;
      const checkResult = await pool.query(checkSql, [warehouseId]);
      if (!(checkResult as any).length) {
        return NextResponse.json(
          { success: false, error: "Warehouse not found" },
          { status: 404 }
        );
      }
      const deleteSql = `DELETE FROM "Warehouse" WHERE whs_id = ?`;
      await pool.query(deleteSql, [warehouseId]);
      return NextResponse.json({
        success: true,
        data: { deleted: true, id: warehouseId },
      });
    } finally {
       
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}
