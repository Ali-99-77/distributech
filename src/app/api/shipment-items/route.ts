import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { 
  handleDatabaseError,
  extractQueryParams
} from '@/lib/apiUtils';
import { QueryResult } from '@/lib/types';

function buildWhereClause(where: Record<string, any>): string {
  if (!where || Object.keys(where).length === 0) {
    return '';
  }
  const conditions = Object.keys(where).map(key => `${key} = ?`);
  return `WHERE ${conditions.join(' AND ')}`;
}

export async function GET(request: NextRequest) {
  try {
    const { fields, where, orderBy, limit, offset, includeCount } = extractQueryParams(request);
    const searchParams = request.nextUrl.searchParams;
    const withDetails = searchParams.get('withDetails') === 'true';
    
    try {
      if (withDetails) {
        const sql = `SELECT "ShipmentItem".*, "Product".prd_name, "Product".prd_category, "Warehouse".whs_name, "Warehouse".whs_location, "Shipment".shp_status, "Shipment".shp_request_date FROM "ShipmentItem"
          INNER JOIN "Product" ON "ShipmentItem".prd_id = "Product".prd_id
          INNER JOIN "Warehouse" ON "ShipmentItem".whs_id = "Warehouse".whs_id
          INNER JOIN "Shipment" ON "ShipmentItem".shp_id = "Shipment".shp_id`;
        const data= await pool.query(sql);
        return NextResponse.json<QueryResult<any>>({
          success: true,
          data,
          count: data.length
        });
      } else {
        const fieldsStr = fields.join(', ');
        const whereClause = buildWhereClause(where);
        const orderByClause = orderBy ? `ORDER BY ${orderBy}` : '';
        const limitClause = limit > 0 ? `LIMIT ${limit}` : '';
        const offsetClause = offset > 0 ? `OFFSET ${offset}` : '';
        const sql = `SELECT ${fieldsStr} FROM "ShipmentItem" ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}`;
        const data= await pool.query(sql);
        let count;
        if (includeCount) {
          const countSql = `SELECT COUNT(*) as count FROM "ShipmentItem" ${whereClause}`;
          const countResult = await pool.query(countSql);
          count = (countResult as any)[0].count;
        }
        return NextResponse.json({
          success: true,
          data,
          count: includeCount ? count : data.length
        });
      }
    } finally {
      // connection.release();
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.shp_id || !body.prd_id || !body.whs_id || body.shp_item_quantity === undefined) {
      return NextResponse.json<QueryResult<any>>({
        success: false,
        error: '"Shipment" ID, "Product" ID, "Warehouse" ID and quantity are required'
      }, { status: 400 });
    }
    
    try {
      if (Array.isArray(body)) {
        const fields = Object.keys(body[0]);
        const placeholders = body.map(() => `(${fields.map(() => '?').join(', ')})`).join(', ');
        const values = body.flatMap(item => fields.map(f => item[f]));
        const sql = `INSERT INTO "ShipmentItem" (${fields.join(', ')}) VALUES ${placeholders}`;
        const result = await pool.query(sql, values);
        return NextResponse.json<QueryResult<any>>({
          success: true,
          data: {
            insertId: (result as any).insertId,
            affectedRows: (result as any).affectedRows,
            items: body
          }
        }, { status: 201 });
      } else {
        const fields = Object.keys(body);
        const placeholders = fields.map(() => '?').join(', ');
        const values = fields.map(f => body[f]);
        const sql = `INSERT INTO "ShipmentItem" (${fields.join(', ')}) VALUES (${placeholders})`;
        const result = await pool.query(sql, values);
        return NextResponse.json<QueryResult<any>>({
          success: true,
          data: {
            insertId: (result as any).insertId,
            affectedRows: (result as any).affectedRows,
            ...body
          }
        }, { status: 201 });
      }
    } finally {
      // connection.release();
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function PUT(request: NextRequest) {
  return NextResponse.json<QueryResult<any>>({
    success: false,
    error: 'Bulk updates not allowed. Use PATCH with specific IDs instead.'
  }, { status: 405 });
}
