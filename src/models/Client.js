import { transformSchema } from '../utils/schemaHelper.js';
import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String },
  logo: { type: String },
  website: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

transformSchema(clientSchema);
const Client = mongoose.model('Client', clientSchema);

export default Client;
