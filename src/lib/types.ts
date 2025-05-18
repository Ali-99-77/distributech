
export interface User {
  usr_id: number;
  usr_username: string;
  usr_email: string;
  usr_fname: string;
  usr_lname: string;
  usr_role: 'ADMIN' | 'RETAILER' | 'DISTRIBUTOR';
}

export interface Distributor {
  usr_id: number;
  dst_distribution_area: string;
  dst_plate_num: string;
}

export interface Retailer {
  usr_id: number;
  rtl_store_name: string;
  rtl_business_number: string;
}

export interface Warehouse {
  whs_id: number;
  usr_id: number;
  whs_name: string;
  whs_location: string;
  whs_contact_num: string;
}

export interface Product {
  prd_id: number;
  prd_name: string;
  prd_category: string;
  prd_description: string;
  prd_unit_price: number;
}

export interface Inventory {
  inv_id: number;
  whs_id: number;
  prd_id: number;
  inv_quantity_on_hand: number;
  inv_quantity_required: number;
  inv_updated_at: Date;
}

export interface Payment {
  pay_id: number;
  usr_id: number;
  pay_method: string;
}

export interface Shipment {
  shp_id: number;
  usr_id: number;
  pay_id: number;
  shp_request_date: Date;
  shp_status: string;
  shp_location: string;
  shp_comment: string;
}

export interface ShipmentItem {
  shp_item_id: number;
  shp_id: number;
  prd_id: number;
  whs_id: number;
  shp_item_quantity: number;
  shp_unit_price: number;
}

export interface Delivery {
  shp_id: number;
  dst_id: number;
  del_status: string;
  del_date: Date;
  del_fee: number;
}

export interface Notification {
  ntf_id: number;
  usr_id: number;
  ntf_description: string;
}

export interface QueryResult<T> {
  success: boolean;
  data?: T | T[];
  error?: string;
  count?: number;
}

export type WhereClause = Record<string, any>;
export type SetClause = Record<string, any>;

export type TableName = 
  | 'User' 
  | 'distributor' 
  | 'retailer' 
  | 'warehouse' 
  | 'Product' 
  | 'inventory' 
  | 'payment' 
  | 'shipment' 
  | 'shipmentitem'
  | 'delivery'
  | 'notification';
