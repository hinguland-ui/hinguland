import { transformSchema } from '../utils/schemaHelper.js';
import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed }, // Can be string, object, or array
  group: { type: String, default: 'general' },
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);
transformSchema(settingSchema);

export default Setting;


