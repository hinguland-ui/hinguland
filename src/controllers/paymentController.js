import Payment from '../models/Payment.js';

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({});
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments({});
    const totalRevenue = await Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
    res.json({ success: true, data: { totalPayments, revenue: totalRevenue[0]?.total || 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    const createdPayment = await payment.save();
    res.status(201).json({ success: true, data: createdPayment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    await Payment.deleteOne({ _id: req.params.id });
    res.json({ success: true, data: { message: 'Payment removed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


