import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { authenticate } from '@/lib/middleware/auth';
import { emitNotificationRead } from '@/lib/socket/handlers/notificationHandlers';

// GET /api/notifications - Get user notifications with pagination
export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Build query
    const query = { user: auth.userId };
    if (unreadOnly) {
      query.read = false;
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate('relatedTask', 'title status')
        .populate('relatedProject', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
    ]);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      user: auth.userId,
      read: false,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          notifications,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
          unreadCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      // Mark all notifications as read for the user
      await Notification.updateMany(
        { user: auth.userId, read: false },
        { read: true }
      );

      // Emit real-time update
      emitNotificationRead(auth.userId, 'all');

      return NextResponse.json(
        {
          success: true,
          message: 'All notifications marked as read',
        },
        { status: 200 }
      );
    }

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Notification IDs are required' },
        { status: 400 }
      );
    }

    // Mark specific notifications as read (only if they belong to the user)
    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        user: auth.userId,
      },
      { read: true }
    );

    // Emit real-time update
    emitNotificationRead(auth.userId, notificationIds);

    return NextResponse.json(
      {
        success: true,
        message: `${result.modifiedCount} notification(s) marked as read`,
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
