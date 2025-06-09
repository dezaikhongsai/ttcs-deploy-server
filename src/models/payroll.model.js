import mongoose from 'mongoose';
const payrollSchema = mongoose.Schema({
    employeeId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    term : {
        type: String,
        required: true
    },
    status : {
        type: String,
        default: "Đã thanh toán"
    }
} , {timestamps: true})

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;
