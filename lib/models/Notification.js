import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification must have a recipient'],
    index: true,
  },
  type: {
    type: String,
    enum: {
      values: ['task_assigned', 'task_updated', 'status_changed', 'automation'],
      message: '{VALUE} is not a valid notification type',
    },
    required: [true, 'Notification type is required'],
  },
  title: {
    type: String,
    required: [true, 'Notification must have a title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  message: {
    type: String,
    required: [true, 'Notification must have a message'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters'],
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Create compound indexes for efficient querying
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// Remove __v from JSON output
notificationSchema.set('toJSON', {
  transform: function (_, ret) {
    delete ret.__v;
    return ret;
  },
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;

