import { TableName, WhereClause, SetClause } from './types';

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

export function buildWhereClause(whereObj: WhereClause): string {
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

export function buildSetClause(setObj: SetClause): string {
  if (!setObj || Object.keys(setObj).length === 0) {
    throw new Error('Update requires fields to set');
  }
  
  const setters = Object.entries(setObj).map(([key, value]) => {
    return `${key} = ${escapeValue(value)}`;
  }).join(', ');
  
  return `SET ${setters}`;
}

export function generateSelectQuery(
  table: TableName, 
  fields: string[] = ['*'], 
  where: WhereClause = {}, 
  orderBy: string = '', 
  limit: number = 0, 
  offset: number = 0
): string {
  const fieldsStr = fields.join(', ');
  const whereClause = buildWhereClause(where);
  const orderByClause = orderBy ? `ORDER BY ${orderBy}` : '';
  const limitClause = limit > 0 ? `LIMIT ${limit}` : '';
  const offsetClause = offset > 0 ? `OFFSET ${offset}` : '';
  
  return `
    SELECT ${fieldsStr} 
    FROM ${table} 
    ${whereClause}
    ${orderByClause}
    ${limitClause}
    ${offsetClause}
  `.trim().replace(/\s+/g, ' ');
}

export function generateInsertQuery(table: TableName, data: Record<string, any> | Record<string, any>[]): string {
  if (!data || (Array.isArray(data) && data.length === 0) || Object.keys(data).length === 0) {
    throw new Error('Insert requires data');
  }
  
  if (Array.isArray(data)) {
    const fields = Object.keys(data[0]);
    const values = data.map(item => {
      const rowValues = fields.map(field => escapeValue(item[field])).join(', ');
      return `(${rowValues})`;
    }).join(', ');
    
    return `INSERT INTO ${table} (${fields.join(', ')}) VALUES ${values}`;
  }
  
  const fields = Object.keys(data);
  const values = fields.map(field => escapeValue(data[field])).join(', ');
  
  return `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${values})`;
}

export function generateUpdateQuery(table: TableName, set: SetClause, where: WhereClause): string {
  if (Object.keys(where).length === 0) {
    throw new Error('Update requires WHERE clause for safety');
  }
  
  const setClause = buildSetClause(set);
  const whereClause = buildWhereClause(where);
  
  return `UPDATE ${table} ${setClause} ${whereClause}`;
}

export function generateDeleteQuery(table: TableName, where: WhereClause): string {
  if (Object.keys(where).length === 0) {
    throw new Error('Delete requires WHERE clause for safety');
  }
  
  const whereClause = buildWhereClause(where);
  
  return `DELETE FROM ${table} ${whereClause}`;
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

export function generateCountQuery(table: TableName, where: WhereClause = {}): string {
  const whereClause = buildWhereClause(where);
  return `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;
}

export function generateJoinQuery(
  mainTable: TableName,
  joins: Array<{
    table: TableName,
    on: string,
    type?: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
  }>,
  fields: string[] = ['*'],
  where: WhereClause = {},
  orderBy: string = '',
  limit: number = 0,
  offset: number = 0
): string {
  const fieldsStr = fields.join(', ');
  const whereClause = buildWhereClause(where);
  const orderByClause = orderBy ? `ORDER BY ${orderBy}` : '';
  const limitClause = limit > 0 ? `LIMIT ${limit}` : '';
  const offsetClause = offset > 0 ? `OFFSET ${offset}` : '';
  
  const joinClauses = joins.map(join => {
    const joinType = join.type || 'INNER';
    return `${joinType} JOIN ${join.table} ON ${join.on}`;
  }).join(' ');
  
  return `
    SELECT ${fieldsStr}
    FROM ${mainTable}
    ${joinClauses}
    ${whereClause}
    ${orderByClause}
    ${limitClause}
    ${offsetClause}
  `.trim().replace(/\s+/g, ' ');
}
