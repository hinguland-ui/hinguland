import { transformSchema } from '../utils/schemaHelper.js';
import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  short_description: { type: String },
  icon: { type: String },
  image: { type: String },
}, { timestamps: true });

transformSchema(serviceSchema);
const Service = mongoose.model('Service', serviceSchema);

export default Service;
