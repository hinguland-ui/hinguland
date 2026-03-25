import { transformSchema } from '../utils/schemaHelper.js';
import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const Faq = mongoose.model('Faq', faqSchema);
transformSchema(faqSchema);

export default Faq;


