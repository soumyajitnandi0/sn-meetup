import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Automation from '@/lib/models/Automation';
import Project from '@/lib/models/Project';
import { authenticate } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

// GET /api/automations?projectId=[id] - List automations for a project
export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Check if project exists and user has access
    const project = await Project.findById(projectId);
    
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    const isOwner = project.owner.toString() === auth.userId;
    const isMember = project.members.some(member => member.toString() === auth.userId);

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Get all automations for the project
    const automations = await Automation.find({ project: projectId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: automations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get automations error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/automations - Create automation rule
export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const body = await request.json();
    const { name, project, enabled, trigger, actions } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Automation name is required' },
        { status: 400 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!trigger || !trigger.type) {
      return NextResponse.json(
        { success: false, message: 'Trigger configuration is required' },
        { status: 400 }
      );
    }

    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one action is required' },
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

    // Check if project exists and user is owner
    const projectDoc = await Project.findById(project);
    
    if (!projectDoc) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    const isOwner = projectDoc.owner.toString() === auth.userId;

    if (!isOwner) {
      return NextResponse.json(
        { success: false, message: 'Only project owner can create automations' },
        { status: 403 }
      );
    }

    // Create automation
    const automation = await Automation.create({
      name: name.trim(),
      project,
      enabled: enabled !== undefined ? enabled : true,
      trigger,
      actions,
      createdBy: auth.userId,
    });

    // Populate createdBy
    await automation.populate('createdBy', 'name email');

    return NextResponse.json(
      {
        success: true,
        data: automation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create automation error:', error);
    
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
