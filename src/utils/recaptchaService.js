import axios from 'axios';

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Verify reCAPTCHA v3 token with Google
 * @param {string} token - The reCAPTCHA token from frontend
 * @param {string} secretKey - The reCAPTCHA secret key
 * @param {number} minScore - Minimum score threshold (0.0 to 1.0)
 * @returns {Promise<{success: boolean, score?: number, action?: string, error?: string}>}
 */
export const verifyRecaptchaToken = async (token, secretKey, minScore = 0.5) => {
    try {
        if (!token || !secretKey) {
            return { success: false, error: 'Missing token or secret key' };
        }

        const response = await axios.post(
            RECAPTCHA_VERIFY_URL,
            null,
            {
                params: {
                    secret: secretKey,
                    response: token
                }
            }
        );

        const { success, score, action, 'error-codes': errorCodes } = response.data;

        if (!success) {
            return { 
                success: false, 
                error: errorCodes?.join(', ') || 'reCAPTCHA verification failed' 
            };
        }

        // Check score threshold for v3
        if (score !== undefined && score < minScore) {
            return { 
                success: false, 
                score,
                error: `Low reCAPTCHA score: ${score}. Minimum required: ${minScore}` 
            };
        }

        return { 
            success: true, 
            score, 
            action 
        };
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return { 
            success: false, 
            error: error.message || 'Failed to verify reCAPTCHA' 
        };
    }
};

/**
 * Middleware to verify reCAPTCHA token from request body
 * @param {string} tokenField - Field name in req.body containing the token (default: 'recaptchaToken')
 * @param {number} minScore - Minimum score threshold
 */
export const recaptchaMiddleware = (tokenField = 'recaptchaToken', minScore = 0.5) => {
    return async (req, res, next) => {
        try {
            // Get secret key from environment or settings
            const secretKey = process.env.RECAPTCHA_SECRET_KEY;
            
            if (!secretKey) {
                console.warn('RECAPTCHA_SECRET_KEY not configured, skipping verification');
                return next();
            }

            const token = req.body[tokenField];
            
            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'reCAPTCHA token is required'
                });
            }

            const result = await verifyRecaptchaToken(token, secretKey, minScore);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.error || 'reCAPTCHA verification failed'
                });
            }

            // Attach recaptcha data to request for later use
            req.recaptcha = result;
            next();
        } catch (error) {
            console.error('reCAPTCHA middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error verifying reCAPTCHA'
            });
        }
    };
};
