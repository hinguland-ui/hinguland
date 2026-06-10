import Inquiry from '../models/Inquiry.js';
import { sendEmail } from '../utils/emailService.js';

export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInquiry = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const inquiry = new Inquiry({ name, email, subject, message });
    const createdInquiry = await inquiry.save();

    // Send notification email asynchronously
    sendEmail({
        subject: `New Business Inquiry from ${name}: ${subject || 'General Info'}`,
        html: `
            <h3>You have a new inquiry from Hinguland website</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <hr />
            <p>This inquiry has been saved to your Admin Dashboard.</p>
        `
    }).catch(err => console.error('Background email failed:', err));

    res.status(201).json({ success: true, data: createdInquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    await Inquiry.deleteOne({ _id: req.params.id });
    res.json({ success: true, data: { message: 'Inquiry removed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    
    inquiry.status = req.body.status || inquiry.status;
    const updatedInquiry = await inquiry.save();
    
    res.json({ success: true, data: updatedInquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
