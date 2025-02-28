"use client";

import { useState, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { format, subDays } from "date-fns";

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState("last7days");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/analytics?period=${period}`);
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnalytics();
  }, [period]);
  
  // Mock data for initial render
  const mockDailyStats = Array.from({ length: 7 }, (_, i) => ({
    date: format(subDays(new Date(), 6 - i), "yyyy-MM-dd"),
    pageViews: Math.floor(Math.random() * 100) + 20,
    uniqueVisitors: Math.floor(Math.random() * 50) + 10,
    newUsers: Math.floor(Math.random() * 5),
    applications: Math.floor(Math.random() * 8),
  }));
  
  const mockDevices = {
    desktop: 65,
    mobile: 30,
    tablet: 5,
  };
  
  const data = analyticsData || {
    dailyStats: mockDailyStats,
    devices: mockDevices,
    overview: {
      pageViews: mockDailyStats.reduce((sum, day) => sum + day.pageViews, 0),
      uniqueVisitors: mockDailyStats.reduce((sum, day) => sum + day.uniqueVisitors, 0),
      newUsers: mockDailyStats.reduce((sum, day) => sum + day.newUsers, 0),
      applications: mockDailyStats.reduce((sum, day) => sum + day.applications, 0),
    }
  };
  
  // Format data for charts
  const dailyStats = data.dailyStats.map((day: any) => ({
    ...day,
    date: typeof day.date === 'string' ? day.date : format(new Date(day.date), "MMM d"),
  }));
  
  const deviceData = Object.entries(data.devices || {}).map(([name, value]) => ({
    name,
    value,
  }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  return (
    <div>
      {/* Period Selector */}
      <div className="flex justify-end mb-4">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="input py-1 px-2 text-sm"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
        </select>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Page Views</h3>
          <p className="text-2xl font-semibold text-gray-900">{data.overview.pageViews}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Unique Visitors</h3>
          <p className="text-2xl font-semibold text-gray-900">{data.overview.uniqueVisitors}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">New Users</h3>
          <p className="text-2xl font-semibold text-gray-900">{data.overview.newUsers}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Applications</h3>
          <p className="text-2xl font-semibold text-gray-900">{data.overview.applications}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Page Views & Visitors</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart
                data={dailyStats}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pageViews"
                  stroke="#8884d8"
                  name="Page Views"
                />
                <Line
                  type="monotone"
                  dataKey="uniqueVisitors"
                  stroke="#82ca9d"
                  name="Unique Visitors"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* User Activity Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">User Activity</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart
                data={dailyStats}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="newUsers" name="New Users" fill="#8884d8" />
                <Bar dataKey="applications" name="Applications" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Device Distribution */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Device Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} views`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}