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

export const getTrafficData = async (req, res) => {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    
    // Fallback mock data if GA is not configured yet
    if (!propertyId || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return res.json({
        success: true,
        data: {
          activeUsers: 142, // Mock real-time users
          trafficTrends: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            views: Math.floor(Math.random() * 500) + 100,
            users: Math.floor(Math.random() * 300) + 50
          })),
          topPages: [
            { page: '/', views: 1245 },
            { page: '/services', views: 843 },
            { page: '/about', views: 532 },
            { page: '/contact', views: 321 },
          ],
          trafficSources: [
            { source: 'google', users: 1543 },
            { source: 'direct', users: 843 },
            { source: 'facebook.com', users: 432 },
          ],
          isMock: true,
          message: "Google Analytics is not fully configured yet. Showing mock data. Please configure GA_PROPERTY_ID and GOOGLE_APPLICATION_CREDENTIALS."
        }
      });
    }

    // Dynamic import for beta package to avoid missing dependencies breaking the app if not installed
    const { BetaAnalyticsDataClient } = await import('@google-analytics/data');
    const analyticsDataClient = new BetaAnalyticsDataClient();
    
    // 1. Real-time active users
    const [realtimeResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
    });
    
    const activeUsers = realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || 0;

    // 2. Traffic over last 30 days
    const [trendResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }]
    });

    const trafficTrends = trendResponse.rows?.map(row => {
      const dateStr = row.dimensionValues[0].value;
      const formattedDate = new Date(`${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: formattedDate,
        views: parseInt(row.metricValues[0].value, 10),
        users: parseInt(row.metricValues[1].value, 10)
      };
    }) || [];

    // 3. Top Pages
    const [pagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 5,
    });

    const topPages = pagesResponse.rows?.map(row => ({
      page: row.dimensionValues[0].value,
      views: parseInt(row.metricValues[0].value, 10)
    })) || [];

    // 4. Traffic Sources
    const [sourcesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 5,
    });

    const trafficSources = sourcesResponse.rows?.map(row => ({
      source: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value, 10)
    })) || [];

    res.json({
      success: true,
      data: {
        activeUsers,
        trafficTrends,
        topPages,
        trafficSources,
        isMock: false
      }
    });

  } catch (error) {
    console.error('GA4 Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics data', error: error.message });
  }
};

export const testAnalyticsCredentials = async (req, res) => {
  try {
    const { propertyId, credentialsJson } = req.body;
    
    if (!propertyId || !credentialsJson) {
      return res.status(400).json({ success: false, message: 'Property ID and Credentials JSON are required' });
    }

    let parsedCredentials;
    try {
      parsedCredentials = typeof credentialsJson === 'string' ? JSON.parse(credentialsJson) : credentialsJson;
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid JSON format for credentials' });
    }

    const { BetaAnalyticsDataClient } = await import('@google-analytics/data');
    
    // Initialize client directly with the credentials object instead of a file path
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: parsedCredentials.client_email,
        private_key: parsedCredentials.private_key,
      },
      projectId: parsedCredentials.project_id
    });
    
    // Attempt a simple request to verify access
    const [realtimeResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
    });
    
    res.json({ success: true, message: 'Credentials verified successfully! Access granted.' });
  } catch (error) {
    console.error('GA4 Test Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify credentials. Please check if the Property ID is correct, the JSON key is valid, and the Service Account email has been added to your Google Analytics Property as a Viewer.',
      error: error.message 
    });
  }
};
