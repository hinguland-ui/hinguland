import { transformSchema } from '../utils/schemaHelper.js';
import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'MediaFolder', default: null },
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  type: { type: String }, // image, video, document
  size: { type: Number },
  altText: { type: String },
  description: { type: String }
}, { timestamps: true });

const Media = mongoose.model('Media', mediaSchema);
transformSchema(mediaSchema);

export default Media;


