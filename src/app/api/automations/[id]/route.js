import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Automation from '@/lib/models/Automation';
import Project from '@/lib/models/Project';
import { authenticate } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

// Helper function to check if user has access to automation
async function checkAutomationAccess(automationId, userId) {
  const automation = await Automation.findById(automationId).populate('project');
  
  if (!automation) {
    return { error: 'Automation not found', status: 404 };
  }

  const project = automation.project;
  const isOwner = project.owner.toString() === userId;

  if (!isOwner) {
    return { error: 'Only project owner can manage automations', status: 403 };
  }

  return { automation, isOwner };
}

// GET /api/automations/[id] - Get automation details
export async function GET(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid automation ID' },
        { status: 400 }
      );
    }

    const access = await checkAutomationAccess(id, auth.userId);
    if (access.error) {
      return NextResponse.json(
        { success: false, message: access.error },
        { status: access.status }
      );
    }

    // Populate references
    await access.automation.populate('createdBy', 'name email');

    return NextResponse.json(
      {
        success: true,
        data: access.automation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get automation error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/automations/[id] - Update automation
export async function PATCH(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid automation ID' },
        { status: 400 }
      );
    }

    const access = await checkAutomationAccess(id, auth.userId);
    if (access.error) {
      return NextResponse.json(
        { success: false, message: access.error },
        { status: access.status }
      );
    }

    const body = await request.json();
    const { name, enabled, trigger, actions } = body;

    // Build updates object
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (enabled !== undefined) updates.enabled = enabled;
    if (trigger !== undefined) updates.trigger = trigger;
    if (actions !== undefined) updates.actions = actions;
    updates.updatedAt = Date.now();

    const automation = await Automation.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    return NextResponse.json(
      {
        success: true,
        data: automation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update automation error:', error);
    
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

// DELETE /api/automations/[id] - Delete automation
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid automation ID' },
        { status: 400 }
      );
    }

    const access = await checkAutomationAccess(id, auth.userId);
    if (access.error) {
      return NextResponse.json(
        { success: false, message: access.error },
        { status: access.status }
      );
    }

    await Automation.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Automation deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete automation error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
