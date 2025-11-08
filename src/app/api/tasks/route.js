import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/lib/models/Task';
import Project from '@/lib/models/Project';
import { authenticate } from '@/lib/middleware/auth';
import mongoose from 'mongoose';
import { createTaskAssignmentNotification } from '@/lib/services/automationService';
import { emitTaskCreated } from '@/lib/socket/handlers/taskHandlers';

// POST /api/tasks - Create new task
export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const body = await request.json();
    const { title, description, status, priority, project, assignee, dueDate, order } = body;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Task title is required' },
        { status: 400 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Validate project ObjectId
    if (!mongoose.Types.ObjectId.isValid(project)) {
      return NextResponse.json(
        { success: false, message: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Check if project exists and user has access
    const projectDoc = await Project.findById(project);
    
    if (!projectDoc) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    const isOwner = projectDoc.owner.toString() === auth.userId;
    const isMember = projectDoc.members.some(member => member.toString() === auth.userId);

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { success: false, message: 'Access denied to this project' },
        { status: 403 }
      );
    }

    // Validate assignee if provided
    if (assignee && !mongoose.Types.ObjectId.isValid(assignee)) {
      return NextResponse.json(
        { success: false, message: 'Invalid assignee ID' },
        { status: 400 }
      );
    }

    // Create task
    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      status: status || 'todo',
      priority: priority || 'medium',
      project,
      assignee: assignee || null,
      dueDate: dueDate || null,
      order: order || 0,
      createdBy: auth.userId,
    });

    // Populate references
    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name');

    // Create notification if task has assignee
    if (assignee) {
      await createTaskAssignmentNotification(task, assignee);
    }

    // Emit real-time update to project room
    emitTaskCreated(task);

    return NextResponse.json(
      {
        success: true,
        data: task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create task error:', error);
    
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
