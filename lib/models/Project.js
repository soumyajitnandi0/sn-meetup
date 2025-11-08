import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'archived', 'completed'],
      message: '{VALUE} is not a valid status',
    },
    default: 'active',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project must have an owner'],
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
projectSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Remove __v from JSON output
projectSchema.set('toJSON', {
  transform: function (_, ret) {
    delete ret.__v;
    return ret;
  },
});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;

