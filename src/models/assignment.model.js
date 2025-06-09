import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  day: {
    type: Date,
    required: true, 
  },
  employee: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true }, // ID nhân viên
    name: { type: String, required: true }, 
    position: { type: String, required: true }, 
  },
  workSchedule: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'workschedules', required: true },
    key: { type: Number, required: true },
    workSchedule: { type: String, required: true },
    timeStart: { type: String, required: true },
    timeEnd : {type : String , required: true}
  },
  position: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Chờ duyệt', 'Đã duyệt', 'Hủy'], 
    default: 'Chờ duyệt',
  },

}, {
  timestamps: true, 
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;