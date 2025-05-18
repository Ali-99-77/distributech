import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { QueryResult } from '@/lib/types';

export function handleDatabaseError(error: unknown): NextResponse<QueryResult<any>> {
  console.error('Database error:', error);
  return NextResponse.json<QueryResult<any>>({
    success: false,
    error: error instanceof Error ? error.message : 'Unknown database error occurred'
  }, { status: 500 });
}

export function validateTableName(tableName: string): boolean {
  const validTables = [
    'User',
    'distributor',
    'retailer',
    'warehouse',
    'Product',
    'inventory',
    'payment',
    'shipment',
    'shipmentitem',
    'delivery',
    'notification'
  ];
  return validTables.includes(tableName.toLowerCase());
}

export function escapeValue(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (value instanceof Date) {
    return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
  }
  
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function extractQueryParams(request: NextRequest): {
  fields: string[];
  where: Record<string, any>;
  orderBy: string;
  limit: number;
  offset: number;
  includeCount: boolean;
} {
  const searchParams = request.nextUrl.searchParams;
  
  const fields = searchParams.get('fields')?.split(',') || ['*'];
  
  let where = {};
  const whereJson = searchParams.get('where');
  if (whereJson) {
    try {
      where = JSON.parse(whereJson);
    } catch (err) {
      console.warn('Invalid WHERE clause format:', whereJson);
    }
  }
  
  const orderBy = searchParams.get('orderBy') || '';
  const limit = parseInt(searchParams.get('limit') || '0');
  const offset = parseInt(searchParams.get('offset') || '0');
  const includeCount = searchParams.get('count') === 'true';
  
  return {
    fields,
    where,
    orderBy,
    limit,
    offset,
    includeCount
  };
}

export function buildWhereClause(whereObj: Record<string, any>): string {
  if (!whereObj || Object.keys(whereObj).length === 0) {
    return '';
  }
  
  const conditions = Object.entries(whereObj).map(([key, value]) => {
    if (value === null) {
      return `${key} IS NULL`;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return '1=0'; 
      const escapedValues = value.map(v => escapeValue(v)).join(',');
      return `${key} IN (${escapedValues})`;
    }
    
    if (typeof value === 'object' && value !== null) {
      const operators: Record<string, string> = {
        gt: '>',
        gte: '>=',
        lt: '<',
        lte: '<=',
        ne: '!=',
        like: 'LIKE'
      };
      
      const entries = Object.entries(value);
      if (entries.length === 0) return `${key} = ${escapeValue(value)}`;
      
      return entries.map(([op, val]) => {
        const operator = operators[op] || '=';
        return `${key} ${operator} ${escapeValue(val)}`;
      }).join(' AND ');
    }
    
    return `${key} = ${escapeValue(value)}`;
  }).join(' AND ');
  
  return conditions ? `WHERE ${conditions}` : '';
}

export function buildSetClause(setObj: Record<string, any>): string {
  if (!setObj || Object.keys(setObj).length === 0) {
    throw new Error('Update requires fields to set');
  }
  
  const setters = Object.entries(setObj).map(([key, value]) => {
    return `${key} = ${escapeValue(value)}`;
  }).join(', ');
  
  return setters;
}

export async function executeRawQuery(sql: string, params?: any[]): Promise<any> {
  
  try {
    const [results] = params 
      ? await pool.query(sql, params)
      : await pool.query(sql);
    return results;
  } 
}
