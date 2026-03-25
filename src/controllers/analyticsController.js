import Client from '../models/Client.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import Payment from '../models/Payment.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalClients = await Client.countDocuments({});
    const totalProjects = await Project.countDocuments({});
    const totalServices = await Service.countDocuments({});
    const totalPayments = await Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
    
    res.json({ success: true, data: {
      clients: totalClients,
      projects: totalProjects,
      services: totalServices,
      revenue: totalPayments[0]?.total || 0
    } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRevenueData = async (req, res) => {
  res.json({ success: true, data: { message: 'Revenue data not fully implemented' } });
};

export const getClientStats = async (req, res) => {
  res.json({ success: true, data: { message: 'Client stats not fully implemented' } });
};

export const getServiceStats = async (req, res) => {
  res.json({ success: true, data: { message: 'Service stats not fully implemented' } });
};

export const getRecentActivity = async (req, res) => {
  res.json({ success: true, data: [{ id: 1, action: "Logged in", time: "Just now" }] });
};


