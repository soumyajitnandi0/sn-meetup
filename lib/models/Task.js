import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: {
      values: ['todo', 'in-progress', 'review', 'done'],
      message: '{VALUE} is not a valid status',
    },
    default: 'todo',
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: '{VALUE} is not a valid priority',
    },
    default: 'medium',
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Task must belong to a project'],
    index: true,
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  dueDate: {
    type: Date,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must have a creator'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for efficient querying
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1 });

// Update the updatedAt timestamp before saving
taskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Remove __v from JSON output
taskSchema.set('toJSON', {
  transform: function (_, ret) {
    delete ret.__v;
    return ret;
  },
});

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;

