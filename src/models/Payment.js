import { transformSchema } from '../utils/schemaHelper.js';
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  clientName: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['paid', 'pending', 'failed'], default: 'pending' },
  paymentMethod: { type: String },
  description: { type: String },
  transactionId: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
transformSchema(paymentSchema);

export default Payment;


