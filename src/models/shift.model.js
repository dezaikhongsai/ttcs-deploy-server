import mongoose from 'mongoose';
const shiftSchema = new mongoose.Schema({
  day: {
    type: Date,
    required: true
  },
  shifts: [{
    workSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkSchedule',
      required: true
    },
    employees: [
      {
        employee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee',
          required: true
        },
        roleInShift: {
          type: String,
          required: true
        }
      }
    ]
  }]
}, {
  timestamps: true
});

shiftSchema.index({ day: 1 });

const Shift = mongoose.model('Shift', shiftSchema);
export default Shift;
