import Review from '../models/Review.js';

export const getReviews = async (req, res) => {
  try {
    const filter = {};
    // If it's a public request (checked by path or query), only show approved
    if (req.path.includes('public')) {
      filter.status = 'approved';
    }
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { clientName, company, rating, comment, status, image_url } = req.body;
    let image = {};
    
    if (req.file) {
      image = { url: req.file.path, public_id: req.file.filename };
    } else if (image_url) {
      image = { url: image_url, public_id: '' };
    }

    const review = new Review({ 
      clientName, 
      company, 
      rating, 
      comment, 
      status: status || 'approved', 
      image 
    });
    const createdReview = await review.save();
    res.status(201).json({ success: true, data: createdReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { clientName, company, rating, comment, status, image_url } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.clientName = clientName || review.clientName;
    review.company = company || review.company;
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.status = status || review.status;

    if (req.file) {
      review.image = { url: req.file.path, public_id: req.file.filename };
    } else if (image_url) {
      review.image = { url: image_url, public_id: '' };
    }

    const updatedReview = await review.save();
    res.json({ success: true, data: updatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await Review.deleteOne({ _id: req.params.id });
    res.json({ success: true, data: { message: 'Review removed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


