import { NextRequest, NextResponse } from "next/server";
import { handleDatabaseError } from "@/lib/apiUtils";
import { QueryResult } from "@/lib/types";
import pool from "@/lib/db";

function getRetailerId(params: { params: { id: string } }): number {
  return parseInt(params.params.id, 10);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const retailerId = getRetailerId({ params });

    if (isNaN(retailerId)) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Invalid Retailer ID",
        },
        { status: 400 }
      );
    }

    

    try {
      const rows = await pool.query(
        `
        SELECT "Retailer".*, "User".usr_username, "User".usr_email, "User".usr_fname, "User".usr_lname
        FROM "Retailer"
        INNER JOIN "User" ON "Retailer".usr_id = "User".usr_id
        WHERE "Retailer".usr_id = ?
      `,
        [retailerId]
      );

      if (!rows || (Array.isArray(rows) && rows.length === 0)) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error: "Retailer not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: rows[0],
      });
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
    const retailerId = getRetailerId({ params });

    if (isNaN(retailerId)) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Invalid Retailer ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const { usr_id, ...updates } = body;

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
      const retailerExists = await pool.query(
        `SELECT usr_id FROM "Retailer" WHERE usr_id = ?`,
        [retailerId]
      );

      if (
        !retailerExists ||
        (Array.isArray(retailerExists) && retailerExists.length === 0)
      ) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error: "Retailer not found",
          },
          { status: 404 }
        );
      }

      const setClause = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ");

      const values = [...Object.values(updates), retailerId];

      await pool.query(
        `UPDATE "Retailer" SET ${setClause} WHERE usr_id = ?`,
        values
      );

      const updatedData = await pool.query(
        `SELECT * FROM "Retailer" WHERE usr_id = ?`,
        [retailerId]
      );

      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: updatedData[0],
      });
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
    const retailerId = getRetailerId({ params });

    if (isNaN(retailerId)) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Invalid Retailer ID",
        },
        { status: 400 }
      );
    }

    

    try {
      const retailerExists = await pool.query(
        `SELECT usr_id FROM "Retailer" WHERE usr_id = ?`,
        [retailerId]
      );

      if (
        !retailerExists ||
        (Array.isArray(retailerExists) && retailerExists.length === 0)
      ) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error:"Retailer not found",
          },
          { status: 404 }
        );
      }

      const shipmentData = await pool.query(
        `SELECT usr_id FROM "Shipment" WHERE usr_id = ?`,
        [retailerId]
      );

      if (
        shipmentData &&
        Array.isArray(shipmentData) &&
        shipmentData.length > 0
      ) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error: "Cannot delete Retailer with associated shipments",
          },
          { status: 409 }
        );
      }

      await pool.query(`DELETE FROM "Retailer" WHERE usr_id = ?`, [
        retailerId,
      ]);

      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: { deleted: true, id: retailerId },
      });
    } finally {
       
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}
