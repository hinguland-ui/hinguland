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

// ─── Performance Indexes ─────────────────────────────────────────────────────
// Home page query: Project.find({ is_on_home: true }) — ab instant hoga
projectSchema.index({ is_on_home: 1 });
// Category filter + sort: Project.find({ category }).sort({ createdAt: -1 }) — ab instant hoga
projectSchema.index({ category: 1, createdAt: -1 });
// Public projects default sort
projectSchema.index({ createdAt: -1 });

transformSchema(projectSchema);
const Project = mongoose.model('Project', projectSchema);

export default Project;
