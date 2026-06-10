import { transformSchema } from '../utils/schemaHelper.js';
import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read', 'replied', 'active', 'completed', 'closed'], default: 'unread' },
}, { timestamps: true });

const Inquiry = mongoose.model('Inquiry', inquirySchema);
transformSchema(inquirySchema);

export default Inquiry;

