import { transformSchema } from '../utils/schemaHelper.js';
import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: [{ type: String }],
  ogTitle: { type: String },
  ogDescription: { type: String },
  ogImage: { type: String },
  canonical: { type: String },
  robots: { type: String, default: 'index, follow' },
  status: { type: String, enum: ['published', 'draft'], default: 'published' },
}, { timestamps: true });

const Page = mongoose.model('Page', pageSchema);
transformSchema(pageSchema);

export default Page;


