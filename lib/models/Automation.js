import mongoose from 'mongoose';

const automationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an automation name'],
    trim: true,
    maxlength: [100, 'Automation name cannot exceed 100 characters'],
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Automation must belong to a project'],
    index: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  trigger: {
    type: {
      type: String,
      enum: {
        values: ['status_change', 'assignment', 'priority_change'],
        message: '{VALUE} is not a valid trigger type',
      },
      required: [true, 'Trigger type is required'],
    },
    condition: {
      field: {
        type: String,
      },
      operator: {
        type: String,
        enum: {
          values: ['equals', 'not_equals', 'contains'],
          message: '{VALUE} is not a valid operator',
        },
      },
      value: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
  },
  actions: [{
    type: {
      type: String,
      enum: {
        values: ['update_status', 'assign_user', 'send_notification'],
        message: '{VALUE} is not a valid action type',
      },
      required: [true, 'Action type is required'],
    },
    params: {
      type: mongoose.Schema.Types.Mixed,
    },
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Automation must have a creator'],
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
automationSchema.index({ project: 1, enabled: 1 });

// Update the updatedAt timestamp before saving
automationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Remove __v from JSON output
automationSchema.set('toJSON', {
  transform: function (_, ret) {
    delete ret.__v;
    return ret;
  },
});

const Automation = mongoose.models.Automation || mongoose.model('Automation', automationSchema);

export default Automation;

