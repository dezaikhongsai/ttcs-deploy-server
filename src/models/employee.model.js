import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String , required: true },
  dob: { type: Date, required: true },
  position: { type: String, required: true },
  emailContact: { type: String, required: true },
  phoneContact: { type: String, required: true },
  salaryPerHour: { type: Number, required: true }
}, {
  timestamps: true,
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
