import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/lib/models/Task';
import Project from '@/lib/models/Project';
import { authenticate } from '@/lib/middleware/auth';
import mongoose from 'mongoose';
import { executeAutomations, createTaskAssignmentNotification } from '@/lib/services/automationService';
import { createStatusChangeNotification } from '@/lib/services/notificationService';
import { emitTaskUpdated, emitTaskDeleted } from '@/lib/socket/handlers/taskHandlers';

// Helper function to check if user has access to task
async function checkTaskAccess(taskId, userId) {
  const task = await Task.findById(taskId).populate('project');
  
  if (!task) {
    return { error: 'Task not found', status: 404 };
  }

  const project = task.project;
  const isOwner = project.owner.toString() === userId;
  const isMember = project.members.some(member => member.toString() === userId);

  if (!isOwner && !isMember) {
    return { error: 'Access denied', status: 403 };
  }

  const isCreator = task.createdBy.toString() === userId;
  const isAssignee = task.assignee && task.assignee.toString() === userId;

  return { task, isOwner, isMember, isCreator, isAssignee };
}

// GET /api/tasks/[id] - Get task details
export async function GET(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const access = await checkTaskAccess(id, auth.userId);
    if (access.error) {
      return NextResponse.json(
        { success: false, message: access.error },
        { status: access.status }
      );
    }

    // Populate references
    await access.task.populate('assignee', 'name email avatar');
    await access.task.populate('createdBy', 'name email');
    await access.task.populate('project', 'name status');

    return NextResponse.json(
      {
        success: true,
        data: access.task,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update task
export async function PATCH(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const access = await checkTaskAccess(id, auth.userId);
    if (access.error) {
      return NextResponse.json(
        { success: false, message: access.error },
        { status: access.status }
      );
    }

    const body = await request.json();
    const { title, description, status, priority, assignee, dueDate, order } = body;

    // Store old task state for automation comparison
    const oldTask = { ...access.task.toObject() };

    // Build updates object
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assignee !== undefined) {
      if (assignee && !mongoose.Types.ObjectId.isValid(assignee)) {
        return NextResponse.json(
          { success: false, message: 'Invalid assignee ID' },
          { status: 400 }
        );
      }
      updates.assignee = assignee;
    }
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (order !== undefined) updates.order = order;
    updates.updatedAt = Date.now();

    const task = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'name status');

    // Execute automations based on task changes
    await executeAutomations(oldTask, task, auth.userId);

    // Create notification if assignee changed
    if (assignee !== undefined && assignee !== oldTask.assignee?.toString()) {
      await createTaskAssignmentNotification(task, assignee);
    }

    // Create notification if status changed
    if (status !== undefined && status !== oldTask.status) {
      await createStatusChangeNotification(task, oldTask.status, status);
    }

    // Emit real-time update to project room
    emitTaskUpdated(task);

    return NextResponse.json(
      {
        success: true,
        data: task,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update task error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation error', errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const access = await checkTaskAccess(id, auth.userId);
    if (access.error) {
      return NextResponse.json(
        { success: false, message: access.error },
        { status: access.status }
      );
    }

    // Allow deletion by creator, assignee, or project owner
    if (!access.isCreator && !access.isAssignee && !access.isOwner) {
      return NextResponse.json(
        { success: false, message: 'Only task creator, assignee, or project owner can delete task' },
        { status: 403 }
      );
    }

    const projectId = access.task.project._id;
    await Task.findByIdAndDelete(id);

    // Emit real-time update to project room
    emitTaskDeleted(id, projectId);

    return NextResponse.json(
      {
        success: true,
        message: 'Task deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
