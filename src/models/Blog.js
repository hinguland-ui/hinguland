import mongoose from 'mongoose';
import { transformSchema } from '../utils/schemaHelper.js';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  summary: { type: String },
  content: { type: String, required: true }, // For Rich Text Editor
  thumbnail: { type: String },
  status: { type: String, enum: ['public', 'draft'], default: 'draft' },
  isBest: { type: Boolean, default: false },
  category: { type: String, default: 'Digital Marketing' },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: { type: String }
  },
  author: { type: String, default: 'Admin' }
}, { timestamps: true });

transformSchema(blogSchema);

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
