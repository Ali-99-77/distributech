import { NextRequest, NextResponse } from 'next/server';
import { 
  executeSelectQuery, 
  executeUpdateQuery, 
  executeDeleteQuery,
  handleDatabaseError 
} from '@/lib/apiUtils';
import { QueryResult } from '@/lib/types';

function getNotificationId(params: { params: { id: string } }): number {
  return parseInt(params.params.id, 10);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = getNotificationId({ params });
    
    if (isNaN(notificationId)) {
      return NextResponse.json<QueryResult<any>>({
        success: false,
        error: 'Invalid "Notification" ID'
      }, { status: 400 });
    }
    
    const { data } = await executeSelectQuery(
      '"Notification"',
      ['*'],
      { ntf_id: notificationId }
    );
    
    if (!data.length) {
      return NextResponse.json<QueryResult<any>>({
        success: false,
        error: '"Notification" not found'
      }, { status: 404 });
    }
    
    return NextResponse.json<QueryResult<any>>({
      success: true,
      data: data[0]
    });
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = getNotificationId({ params });
    
    if (isNaN(notificationId)) {
      return NextResponse.json<QueryResult<any>>({
        success: false,
        error: 'Invalid "Notification" ID'
      }, { status: 400 });
    }
    
    const body = await request.json();
    
    const { ntf_id, ...updates } = body;
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json<QueryResult<any>>({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }
    
    const { data } = await executeSelectQuery(
      '"Notification"',
      ['ntf_id'],
      { ntf_id: notificationId }
    );
    
    if (!data.length) {
      return NextResponse.json<QueryResult<any>>({
        success: false,
        error: '"Notification" not found'
      }, { status: 404 });
    }
    
    const result = await executeUpdateQuery(
      '"Notification"',
      updates,
      { ntf_id: notificationId }
    );
    
    const { data: updatedData } = await executeSelectQuery(
      '"Notification"',
      ['*'],
      { ntf_id: notificationId }
    );
    
    return NextResponse.json<QueryResult<any>>({
      success: true,
      data: updatedData[0]
    });
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = getNotificationId({ params });
    
    if (isNaN(notificationId)) {
      return NextResponse.json<QueryResult<any>>({
        success: false,
        error: 'Invalid "Notification" ID'
      }, { status: 400 });
    }
    
    const { data } = await executeSelectQuery(
      '"Notification"',
      ['ntf_id'],
      { ntf_id: notificationId }
    );
    
    if (!data.length) {
      return NextResponse.json<QueryResult<any>>({
        success: false,
        error: '"Notification" not found'
      }, { status: 404 });
    }
    
    const result = await executeDeleteQuery(
      '"Notification"',
      { ntf_id: notificationId }
    );
    
    return NextResponse.json<QueryResult<any>>({
      success: true,
      data: { deleted: true, id: notificationId }
    });
  } catch (error) {
    return handleDatabaseError(error);
  }
}
