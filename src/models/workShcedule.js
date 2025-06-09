import mongoose from 'mongoose';

const workScheduleSchema = new mongoose.Schema({
  key: {
    type: Number,
    required: true,
    unique: true,
  },
  workSchedule: {
    type: String,
    required: true,
  },
  timeStart: {
    type: String, 
    required: true,
  },
  timeEnd: {
    type: String, 
    required: true,
  },
}, {
  timestamps: true,  
});

const WorkSchedule = mongoose.model('WorkSchedule', workScheduleSchema);

export default WorkSchedule;