import { transformSchema } from '../utils/schemaHelper.js';
import mongoose from 'mongoose';

const mediaFolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'MediaFolder', default: null },
}, { timestamps: true });

const MediaFolder = mongoose.model('MediaFolder', mediaFolderSchema);
transformSchema(mediaFolderSchema);

export default MediaFolder;


