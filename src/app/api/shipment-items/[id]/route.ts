import { NextRequest, NextResponse } from 'next/server';
import { handleDatabaseError } from '@/lib/apiUtils';
import { QueryResult } from '@/lib/types';
import pool from '@/lib/db';

function getShipmentItemId(params: { params: { id: string } }): number {
  return parseInt(params.params.id, 10);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shipmentItemId = getShipmentItemId({ params });
    if (isNaN(shipmentItemId)) {
      return NextResponse.json<QueryResult<any>>({
        success: false,
        error: 'Invalid "Shipment" item ID'
      }, { status: 400 });
    }
    
    try {
      const sql = `SELECT * FROM "ShipmentItem" WHERE shp_item_id = ?`;
      const data= await pool.query(sql, [shipmentItemId]);
      if (!(data as any).length) {
        return NextResponse.json<QueryResult<any>>({
          success: false,
          error: '"Shipment" item not found'
        }, { status: 404 });
      }
      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: (data as any)[0]
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
    const shipmentItemId = getShipmentItemId({ params });
    if (isNaN(shipmentItemId)) {
      return NextResponse.json<QueryResult<any>>({
        success: false,
        error: 'Invalid "Shipment" item ID'
      }, { status: 400 });
    }
    const body = await request.json();
    const { shp_item_id, ...updates } = body;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json<QueryResult<any>>({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }
    
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(shipmentItemId);
      const updateSql = `UPDATE "ShipmentItem" SET ${setClause} WHERE shp_item_id = ?`;
      const result = await pool.query(updateSql, values);
      if ((result as any).affectedRows === 0) {
        return NextResponse.json<QueryResult<any>>({
          success: false,
          error: '"Shipment" item not found'
        }, { status: 404 });
      }
      const selectSql = `SELECT * FROM "ShipmentItem" WHERE shp_item_id = ?`;
      const data= await pool.query(selectSql, [shipmentItemId]);
      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: (data as any)[0]
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
    const shipmentItemId = getShipmentItemId({ params });
    if (isNaN(shipmentItemId)) {
      return NextResponse.json<QueryResult<any>>({
        success: false,
        error: 'Invalid "Shipment" item ID'
      }, { status: 400 });
    }
    
    try {
      const checkSql = `SELECT shp_item_id FROM "ShipmentItem" WHERE shp_item_id = ?`;
      const checkResult = await pool.query(checkSql, [shipmentItemId]);
      if (!(checkResult as any).length) {
        return NextResponse.json<QueryResult<any>>({
          success: false,
          error: '"Shipment" item not found'
        }, { status: 404 });
      }
      const deleteSql = `DELETE FROM "ShipmentItem" WHERE shp_item_id = ?`;
      const deleteResult = await pool.query(deleteSql, [shipmentItemId]);
      return NextResponse.json<QueryResult<any>>({
        success: true,
        data: { deleted: true, id: shipmentItemId }
      });
    } finally {
       
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}
