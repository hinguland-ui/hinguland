import { transformSchema } from '../utils/schemaHelper.js';
import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  image: {
    url: { type: String },
    public_id: { type: String }
  },
  socialLinks: {
    linkedin: { type: String },
    twitter: { type: String },
    instagram: { type: String }
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
transformSchema(teamMemberSchema);

export default TeamMember;


