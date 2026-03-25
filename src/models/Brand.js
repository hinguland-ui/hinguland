import { transformSchema } from '../utils/schemaHelper.js';
import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

transformSchema(brandSchema);
const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
