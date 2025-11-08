import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/lib/models/Project';
import Task from '@/lib/models/Task';
import { authenticate } from '@/lib/middleware/auth';

export async function GET(request) {
  try {
    const authResult = await authenticate(request);
    if (authResult.error) {
      return authResult.error;
    }

    await dbConnect();

    const userId = authResult.userId;

    // Get all projects where user is owner or member
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    });

    const projectIds = projects.map(p => p._id);

    // Get all tasks for these projects
    const tasks = await Task.find({
      project: { $in: projectIds }
    });

    // Calculate statistics
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      archivedProjects: projects.filter(p => p.status === 'archived').length,
      
      totalTasks: tasks.length,
      todoTasks: tasks.filter(t => t.status === 'todo').length,
      inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
      reviewTasks: tasks.filter(t => t.status === 'review').length,
      doneTasks: tasks.filter(t => t.status === 'done').length,
      
      highPriorityTasks: tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length,
      assignedTasks: tasks.filter(t => t.assignee).length,
    };

    // Calculate percentages
    const projectPercentages = {
      active: projects.length > 0 ? Math.round((stats.activeProjects / projects.length) * 100) : 0,
      completed: projects.length > 0 ? Math.round((stats.completedProjects / projects.length) * 100) : 0,
      archived: projects.length > 0 ? Math.round((stats.archivedProjects / projects.length) * 100) : 0,
    };

    const taskPercentages = {
      done: tasks.length > 0 ? Math.round((stats.doneTasks / tasks.length) * 100) : 0,
      inProgress: tasks.length > 0 ? Math.round((stats.inProgressTasks / tasks.length) * 100) : 0,
      todo: tasks.length > 0 ? Math.round((stats.todoTasks / tasks.length) * 100) : 0,
      review: tasks.length > 0 ? Math.round((stats.reviewTasks / tasks.length) * 100) : 0,
    };

    // Get recent activity (last 10 tasks updated)
    const recentTasks = await Task.find({
      project: { $in: projectIds }
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('project', 'name')
      .select('title status updatedAt');

    const recentActivity = recentTasks.map(task => ({
      title: task.title,
      project: task.project?.name,
      status: task.status,
      timestamp: task.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats,
        projectPercentages,
        taskPercentages,
        recentActivity,
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
