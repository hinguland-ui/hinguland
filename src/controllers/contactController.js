import Inquiry from '../models/Inquiry.js';
import Setting from '../models/Setting.js';
import { sendEmail } from '../utils/emailService.js';
import { verifyRecaptchaToken } from '../utils/recaptchaService.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, service, message, recaptchaToken } = req.body;
    
    // Verify reCAPTCHA if enabled
    const recaptchaSettings = await Setting.findOne({ key: 'recaptcha_config' });
    if (recaptchaSettings?.value?.enabled) {
      const secretKey = recaptchaSettings.value.secretKey;
      const minScore = recaptchaSettings.value.minScore || 0.5;
      
      if (!recaptchaToken) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please complete the security verification.' 
        });
      }
      
      const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, secretKey, minScore);
      if (!recaptchaResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: recaptchaResult.error || 'Security verification failed. Please try again.' 
        });
      }
    }
    
    // Save to database
    const inquiry = new Inquiry({ 
        name, 
        email, 
        subject: service || 'General Contact', 
        message: `Phone: ${phone}\n\n${message}` 
    });
    await inquiry.save();

    // Send notification email
    sendEmail({
        subject: `New Contact Form Submission from ${name}`,
        html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Interested In:</strong> ${service || 'General'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <hr />
            <p>This inquiry has been saved to your Admin Dashboard.</p>
        `
    }).catch(err => console.error('Background email failed:', err));

    res.status(201).json({ success: true, message: 'Your message has been received. Our team will contact you soon.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


