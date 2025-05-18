import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { handleDatabaseError } from "@/lib/sqlUtils";
import { QueryResult } from "@/lib/types";

function getProductId(params: { params: { id: string } }) {
  return params.params.id;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = getProductId({ params });

    if (!productId) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Invalid Product ID",
        },
        { status: 400 }
      );
    }

    try {
      console.log("Fetching product with ID:", productId);
      const sql = `SELECT * FROM "Product" WHERE prd_id = $1`;
      const results = await pool.query(sql, [productId]);
      const data = results as any;

      if (!data.rows.length) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error: "Product not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: data.rows[0],
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
  try {
    const productId = getProductId({ params });

    if (!productId) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Invalid Product ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const { prd_id, ...updates } = body;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "No fields to update",
        },
        { status: 400 }
      );
    }

    try {
      const setEntries = Object.entries(updates);
      const setClause = setEntries.map(([key, _]) => `${key} = ?`).join(", ");
      const setValues = setEntries.map(([_, value]) => value);

      const values = [...setValues, productId];

      const updateSql = `UPDATE "Product" SET ${setClause} WHERE prd_id = ?`;
      const result = await pool.query(updateSql, values);

      if ((result as any).affectedRows === 0) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error: "Product not found",
          },
          { status: 404 }
        );
      }

      const selectSql = `SELECT * FROM "Product" WHERE prd_id = ?`;
      const data = await pool.query(selectSql, [productId]);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = getProductId({ params });

    if (!productId) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Invalid Product ID",
        },
        { status: 400 }
      );
    }

    try {
      const checkSql = `SELECT prd_id FROM "Product" WHERE prd_id = $1`;
      const checkResult = await pool.query(checkSql, [productId]);

      if (!checkResult) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error: "Product not found",
          },
          { status: 404 }
        );
      }

      const deleteSql = `DELETE FROM "Product" WHERE prd_id = $1`;
      await pool.query(deleteSql, [productId]);
      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: { deleted: true, id: productId },
      });
    } finally {
      // connection.release();
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}
