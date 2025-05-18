import { NextRequest, NextResponse } from "next/server";
import { handleDatabaseError } from "@/lib/apiUtils";
import { QueryResult } from "@/lib/types";
import pool from "@/lib/db";

function getInventoryId(params: { params: { id: string } }): string {
  return params.params.id;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventoryId = getInventoryId({ params });

    try {
      const sql = `SELECT * FROM "Inventory" WHERE inv_id = ?`;
      const data = await pool.query(sql, [inventoryId]);
      if (!(data as any).length) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error: '"Inventory" item not found',
          },
          { status: 404 }
        );
      }
      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: (data as any)[0],
      });
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
  const inventoryId = getInventoryId({ params });
  if (!inventoryId) {
    return NextResponse.json<QueryResult<any>>(
      {
        success: false,
        error: 'Invalid "Inventory" ID',
      },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { inv_id, ...updates } = body;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json<QueryResult<any>>(
      {
        success: false,
        error: "No fields to update",
      },
      { status: 400 }
    );
  }
  updates.inv_updated_at = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  try {
    const keys = Object.keys(updates);
    const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
    const values = Object.values(updates);
    values.push(inventoryId);

    const updateSql = `UPDATE "Inventory" SET ${setClause} WHERE inv_id = $${values.length}`;
    const result = await pool.query(updateSql, values);

    if (result.rowCount === 0) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: '"Inventory" item not found',
        },
        { status: 404 }
      );
    }

    const selectSql = `SELECT * FROM "Inventory" WHERE inv_id = $1`;
    const data = await pool.query(selectSql, [inventoryId]);

    return NextResponse.json<QueryResult<any>>({
      success: true,
      data: data.rows[0],
    });
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventoryId = getInventoryId({ params });

    if (!inventoryId) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: 'Invalid "Inventory" ID',
        },
        { status: 400 }
      );
    }

    try {
      const checkSql = `SELECT inv_id FROM "Inventory" WHERE inv_id = $1`;
      const checkResult = await pool.query(checkSql, [inventoryId]);
      if (!checkResult ) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error: '"Inventory" item not found',
          },
          { status: 404 }
        );
      }
      const deleteSql = `DELETE FROM "Inventory" WHERE inv_id = $1`;
      const deleteResult = await pool.query(deleteSql, [inventoryId]);
      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: { deleted: true, id: inventoryId },
      });
    } finally {
      // connection.release();
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}
