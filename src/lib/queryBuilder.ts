import { TableName, WhereClause, SetClause } from './types';

// Escape and sanitize input values to prevent SQL injection
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
  
  // Escape string values
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Build WHERE clause from an object
export function buildWhereClause(whereObj: WhereClause): string {
  if (!whereObj || Object.keys(whereObj).length === 0) {
    return '';
  }
  
  const conditions = Object.entries(whereObj).map(([key, value]) => {
    if (value === null) {
      return `${key} IS NULL`;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return '1=0'; // Empty array, no match
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

// Build SET clause for UPDATE queries
export function buildSetClause(setObj: SetClause): string {
  if (!setObj || Object.keys(setObj).length === 0) {
    throw new Error('Update requires fields to set');
  }
  
  const setters = Object.entries(setObj).map(([key, value]) => {
    return `${key} = ${escapeValue(value)}`;
  }).join(', ');
  
  return `SET ${setters}`;
}

// Generate SELECT query
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

// Generate INSERT query
export function generateInsertQuery(table: TableName, data: Record<string, any> | Record<string, any>[]): string {
  if (!data || (Array.isArray(data) && data.length === 0) || Object.keys(data).length === 0) {
    throw new Error('Insert requires data');
  }
  
  // Handle batch insert
  if (Array.isArray(data)) {
    const fields = Object.keys(data[0]);
    const values = data.map(item => {
      const rowValues = fields.map(field => escapeValue(item[field])).join(', ');
      return `(${rowValues})`;
    }).join(', ');
    
    return `INSERT INTO ${table} (${fields.join(', ')}) VALUES ${values}`;
  }
  
  // Handle single insert
  const fields = Object.keys(data);
  const values = fields.map(field => escapeValue(data[field])).join(', ');
  
  return `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${values})`;
}

// Generate UPDATE query
export function generateUpdateQuery(table: TableName, set: SetClause, where: WhereClause): string {
  if (Object.keys(where).length === 0) {
    throw new Error('Update requires WHERE clause for safety');
  }
  
  const setClause = buildSetClause(set);
  const whereClause = buildWhereClause(where);
  
  return `UPDATE ${table} ${setClause} ${whereClause}`;
}

// Generate DELETE query
export function generateDeleteQuery(table: TableName, where: WhereClause): string {
  if (Object.keys(where).length === 0) {
    throw new Error('Delete requires WHERE clause for safety');
  }
  
  const whereClause = buildWhereClause(where);
  
  return `DELETE FROM ${table} ${whereClause}`;
}

// Validate table name against allowed tables
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

// Generate COUNT query
export function generateCountQuery(table: TableName, where: WhereClause = {}): string {
  const whereClause = buildWhereClause(where);
  return `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;
}

// Generate JOIN query
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
