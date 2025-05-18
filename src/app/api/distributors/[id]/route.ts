import { NextRequest, NextResponse } from "next/server";
import { handleDatabaseError } from "@/lib/apiUtils";
import { QueryResult } from "@/lib/types";
import pool from "@/lib/db";

function getDistributorId(params: { params: { id: string } }): number {
  return parseInt(params.params.id, 10);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const distributorId = getDistributorId({ params });

    if (isNaN(distributorId)) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Invalid Distributor ID",
        },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const withUserDetails = searchParams.get("withUserDetails") === "true";

    

    try {
      let sql, data;

      if (withUserDetails) {
        sql = `
          SELECT 
            "Distributor".*,
            "User".usr_username,
            "User".usr_email,
            "User".usr_fname,
            "User".usr_lname
          FROM "Distributor"
          INNER JOIN "User" ON "Distributor".usr_id = "User".usr_id
          WHERE "Distributor".usr_id = ?
        `;

        data= await pool.query(sql, [distributorId]);
      } else {
        sql = `SELECT * FROM "Distributor" WHERE usr_id = ?`;
        data= await pool.query(sql, [distributorId]);
      }

      if (!data) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error: "Distributor not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: data[0],
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
    const distributorId = getDistributorId({ params });

    if (isNaN(distributorId)) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Invalid Distributor ID",
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
      let sql = `SELECT usr_id FROM "Distributor" WHERE usr_id = ?`;
      let distributorData = await pool.query(sql, [distributorId]);

      if (!distributorData) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error: "Distributor not found",
          },
          { status: 404 }
        );
      }

      const fields = Object.keys(updates);
      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const values = [...fields.map((field) => updates[field]), distributorId];

      sql = `UPDATE "Distributor" SET ${setClause} WHERE usr_id = ?`;
      await pool.query(sql, values);

      sql = `SELECT * FROM "Distributor" WHERE usr_id = ?`;
      const updatedData = await pool.query(sql, [distributorId]);

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
    const distributorId = getDistributorId({ params });

    if (isNaN(distributorId)) {
      return NextResponse.json<QueryResult<any>>(
        {
          success: false,
          error: "Invalid Distributor ID",
        },
        { status: 400 }
      );
    }

    

    try {
      let sql = `SELECT usr_id FROM "Distributor" WHERE usr_id = ?`;
      let data= await pool.query(sql, [distributorId]);

      if (!data) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error: "Distributor not found",
          },
          { status: 404 }
        );
      }

      sql = `SELECT dst_id FROM "Delivery" WHERE dst_id = ?`;
      const deliveryData = await pool.query(sql, [distributorId]);

      if (deliveryData) {
        return NextResponse.json<QueryResult<any>>(
          {
            success: false,
            error: "Cannot delete Distributor with associated deliveries",
          },
          { status: 409 }
        );
      }

      sql = `DELETE FROM "Distributor" WHERE usr_id = ?`;
      await pool.query(sql, [distributorId]);

      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: { deleted: true, id: distributorId },
      });
    } finally {
       
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}
