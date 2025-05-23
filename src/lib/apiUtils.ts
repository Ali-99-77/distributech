import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { 
  generateSelectQuery, 
  generateInsertQuery, 
  generateUpdateQuery, 
  generateDeleteQuery, 
  generateJoinQuery,
  generateCountQuery,
  validateTableName 
} from '@/lib/queryBuilder';
import { QueryResult, TableName, WhereClause, SetClause } from '@/lib/types';

export function handleDatabaseError(error: unknown): NextResponse<QueryResult<any>> {
  console.error('Database error:', error);
  return NextResponse.json<QueryResult<any>>({
    success: false,
    error: error instanceof Error ? error.message : 'Unknown database error occurred'
  }, { status: 500 });
}

export async function executeSelectQuery(
  table: TableName,
  fields: string[] = ['*'],
  where: WhereClause = {},
  orderBy: string = '',
  limit: number = 0,
  offset: number = 0,
  includeCount: boolean = false
): Promise<{
  data: any[];
  count?: number;
}> {
  
  try {
    const query = generateSelectQuery(
      table,
      fields,
      where,
      orderBy,
      limit,
      offset
    );
    
    const [results] = await pool.query(query);
    
    let count;
    if (includeCount) {
      const countQuery = generateCountQuery(table, where);
      const [countResult] = await pool.query(countQuery);
      count = countResult[0].count;
    }
    
    return {
      data: results as any[],
      count
    };
  } finally {
  }
}

export async function executeJoinQuery(
  mainTable: TableName,
  joins: Array<{
    table: TableName;
    on: string;
    type?: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  }>,
  fields: string[] = ['*'],
  where: WhereClause = {},
  orderBy: string = '',
  limit: number = 0,
  offset: number = 0
): Promise<any[]> {
  
  try {
    const query = generateJoinQuery(
      mainTable,
      joins,
      fields,
      where,
      orderBy,
      limit,
      offset
    );
    
    const [results] = await pool.query(query);
    return results as any[];
  } 
}

export async function executeInsertQuery(
  table: TableName,
  data: Record<string, any> | Record<string, any>[]
): Promise<{
  insertId?: number;
  affectedRows: number;
}> {
  
  try {
    const query = generateInsertQuery(table, data);
    const [result] = await pool.query(query);
    
    return {
      insertId: (result as any).insertId,
      affectedRows: (result as any).affectedRows
    };
  } 
}

export async function executeUpdateQuery(
  table: TableName,
  set: SetClause,
  where: WhereClause
): Promise<{
  affectedRows: number;
  changedRows: number;
}> {
  
  try {
    const query = generateUpdateQuery(table, set, where);
    const [result] = await pool.query(query);
    
    return {
      affectedRows: (result as any).affectedRows,
      changedRows: (result as any).changedRows
    };
  } 
}

export async function executeDeleteQuery(
  table: TableName,
  where: WhereClause
): Promise<{
  affectedRows: number;
}> {
  
  try {
    const query = generateDeleteQuery(table, where);
    const [result] = await pool.query(query);
    
    return {
      affectedRows: (result as any).affectedRows
    };
  }
  
}

export function extractQueryParams(request: NextRequest): {
  fields: string[];
  where: WhereClause;
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
