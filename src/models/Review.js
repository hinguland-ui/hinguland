import { transformSchema } from '../utils/schemaHelper.js';
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  company: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  image: {
    url: { type: String },
    public_id: { type: String }
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
transformSchema(reviewSchema);

export default Review;


