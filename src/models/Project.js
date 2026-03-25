import { transformSchema } from '../utils/schemaHelper.js';
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String },
  status: { type: String, enum: ['planning', 'in_progress', 'completed', 'on_hold'], default: 'completed' },
  main_image: { type: String },
  gallery_images: [{ type: String }],
  technologies: [{ type: String }],
  tags: [{ type: String }],
  live_url: { type: String },
  is_on_home: { type: Boolean, default: false },
  client: { type: String },
  duration: { type: String },
  date: { type: String },
}, { timestamps: true });

transformSchema(projectSchema);
const Project = mongoose.model('Project', projectSchema);

export default Project;
