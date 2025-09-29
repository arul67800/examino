'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/theme';
import {
  BarChart3,
  Eye,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Globe,
  Share2,
  Heart,
  MessageCircle,
  Bookmark,
  ArrowRight,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react';

interface AnalyticsData {
  views: {
    total: number;
    unique: number;
    trend: number; // percentage change
    dailyViews: { date: string; views: number }[];
  };
  engagement: {
    avgTimeOnPage: number; // in seconds
    bounceRate: number; // percentage
    shares: number;
    likes: number;
    comments: number;
    bookmarks: number;
  };
  traffic: {
    sources: {
      direct: number;
      search: number;
      social: number;
      referral: number;
      email: number;
    };
    topReferrers: { source: string; visits: number }[];
    countries: { country: string; visits: number }[];
  };
  performance: {
    loadTime: number; // in milliseconds
    coreWebVitals: {
      lcp: number; // Largest Contentful Paint
      fid: number; // First Input Delay
      cls: number; // Cumulative Layout Shift
    };
    seoScore: number;
    accessibilityScore: number;
  };
  conversions: {
    emailSignups: number;
    downloads: number;
    socialFollows: number;
    customGoals: { name: string; completions: number }[];
  };
}

interface ArticleAnalyticsProps {
  articleId: string;
  data: AnalyticsData;
  onDataRefresh: () => void;
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (range: { start: Date; end: Date }) => void;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ReactNode;
  description?: string;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  trend, 
  icon, 
  description, 
  color = 'blue' 
}) => {
  const { theme } = useTheme();
  
  const formatTrend = (trend: number) => {
    const isPositive = trend > 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        <TrendIcon className="w-3 h-3" />
        <span className="text-xs">{Math.abs(trend).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div 
      className="p-4 rounded-lg border"
      style={{ 
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.primary 
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`text-${color}-500`}>
              {icon}
            </div>
            <span 
              className="text-sm font-medium"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              {title}
            </span>
          </div>
          
          <div 
            className="text-2xl font-bold mb-1"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          {description && (
            <p 
              className="text-xs"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              {description}
            </p>
          )}
        </div>
        
        {trend !== undefined && (
          <div className="ml-2">
            {formatTrend(trend)}
          </div>
        )}
      </div>
    </div>
  );
};

const TrafficChart: React.FC<{ 
  dailyViews: { date: string; views: number }[] 
}> = ({ dailyViews }) => {
  const { theme } = useTheme();
  const maxViews = Math.max(...dailyViews.map(d => d.views));
  
  return (
    <div 
      className="p-4 rounded-lg border"
      style={{ 
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.primary 
      }}
    >
      <h4 
        className="font-medium mb-4"
        style={{ color: theme.colors.semantic.text.primary }}
      >
        Daily Views Trend
      </h4>
      
      <div className="h-32 flex items-end space-x-2">
        {dailyViews.map((day, index) => (
          <div key={day.date} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 min-h-[4px]"
              style={{ 
                height: `${(day.views / maxViews) * 100}%`,
                backgroundColor: theme.colors.semantic.action.primary
              }}
              title={`${day.views} views on ${day.date}`}
            />
            <span 
              className="text-xs mt-2 transform rotate-45 origin-left"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              {new Date(day.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TrafficSourcesChart: React.FC<{ 
  sources: { [key: string]: number } 
}> = ({ sources }) => {
  const { theme } = useTheme();
  const total = Object.values(sources).reduce((sum, value) => sum + value, 0);
  
  const sourceColors = {
    direct: '#3b82f6',
    search: '#10b981',
    social: '#f59e0b',
    referral: '#8b5cf6',
    email: '#ef4444'
  };

  return (
    <div 
      className="p-4 rounded-lg border"
      style={{ 
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.primary 
      }}
    >
      <h4 
        className="font-medium mb-4"
        style={{ color: theme.colors.semantic.text.primary }}
      >
        Traffic Sources
      </h4>
      
      <div className="space-y-3">
        {Object.entries(sources).map(([source, visits]) => {
          const percentage = total > 0 ? (visits / total) * 100 : 0;
          
          return (
            <div key={source} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sourceColors[source as keyof typeof sourceColors] }}
                  />
                  <span 
                    className="capitalize"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    {source}
                  </span>
                </div>
                <span style={{ color: theme.colors.semantic.text.secondary }}>
                  {visits} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div 
                className="w-full bg-gray-200 rounded-full h-2"
                style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
              >
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: sourceColors[source as keyof typeof sourceColors]
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PerformanceScore: React.FC<{ 
  score: number; 
  label: string;
  description: string;
}> = ({ score, label, description }) => {
  const { theme } = useTheme();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5" />;
    if (score >= 60) return <AlertCircle className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  return (
    <div 
      className="p-4 rounded-lg border"
      style={{ 
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.primary 
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 
          className="font-medium"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          {label}
        </h4>
        <div style={{ color: getScoreColor(score) }}>
          {getScoreIcon(score)}
        </div>
      </div>

      <div className="flex items-end space-x-3">
        <div 
          className="text-3xl font-bold"
          style={{ color: getScoreColor(score) }}
        >
          {score}
        </div>
        <div 
          className="text-sm pb-1"
          style={{ color: theme.colors.semantic.text.secondary }}
        >
          /100
        </div>
      </div>

      <div 
        className="w-full bg-gray-200 rounded-full h-2 mb-2"
        style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
      >
        <div 
          className="h-2 rounded-full transition-all duration-500"
          style={{ 
            width: `${score}%`,
            backgroundColor: getScoreColor(score)
          }}
        />
      </div>

      <p 
        className="text-xs"
        style={{ color: theme.colors.semantic.text.secondary }}
      >
        {description}
      </p>
    </div>
  );
};

export const ArticleAnalytics: React.FC<ArticleAnalyticsProps> = ({
  articleId,
  data,
  onDataRefresh,
  dateRange,
  onDateRangeChange
}) => {
  const { theme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'traffic' | 'performance'>('overview');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onDataRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 
            className="text-lg font-semibold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Article Analytics
          </h3>
          <p 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Performance insights and metrics for your article
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Date Range Picker */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" style={{ color: theme.colors.semantic.text.secondary }} />
            <select
              className="px-3 py-2 rounded-lg border focus:outline-none text-sm"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
              onChange={(e) => {
                const days = parseInt(e.target.value);
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - days);
                onDateRangeChange({ start, end });
              }}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-lg border transition-colors duration-200 flex items-center space-x-2"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.primary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Export Button */}
          <button
            className="px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            style={{
              backgroundColor: theme.colors.semantic.action.primary,
              color: theme.colors.semantic.text.inverse
            }}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'engagement', label: 'Engagement' },
          { id: 'traffic', label: 'Traffic' },
          { id: 'performance', label: 'Performance' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
              activeTab === tab.id ? 'bg-blue-500 text-white' : ''
            }`}
            style={{ 
              backgroundColor: activeTab === tab.id ? theme.colors.semantic.action.primary : theme.colors.semantic.surface.secondary,
              color: activeTab === tab.id ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Views"
              value={data.views.total}
              trend={data.views.trend}
              icon={<Eye className="w-5 h-5" />}
              description="All-time page views"
              color="blue"
            />
            <MetricCard
              title="Unique Visitors"
              value={data.views.unique}
              trend={(data.views.unique / data.views.total) * 100}
              icon={<Users className="w-5 h-5" />}
              description="Individual users"
              color="green"
            />
            <MetricCard
              title="Avg. Time on Page"
              value={formatDuration(data.engagement.avgTimeOnPage)}
              trend={-12.5}
              icon={<Clock className="w-5 h-5" />}
              description="User engagement time"
              color="purple"
            />
            <MetricCard
              title="Bounce Rate"
              value={`${data.engagement.bounceRate}%`}
              trend={data.engagement.bounceRate - 65}
              icon={<Target className="w-5 h-5" />}
              description="Single page sessions"
              color="orange"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrafficChart dailyViews={data.views.dailyViews} />
            <TrafficSourcesChart sources={data.traffic.sources} />
          </div>

          {/* Top Referrers */}
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.primary 
            }}
          >
            <h4 
              className="font-medium mb-4"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Top Referrers
            </h4>
            
            <div className="space-y-2">
              {data.traffic.topReferrers.map((referrer, index) => (
                <div key={referrer.source} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                      style={{ backgroundColor: theme.colors.semantic.action.primary }}
                    >
                      {index + 1}
                    </div>
                    <span 
                      className="font-medium"
                      style={{ color: theme.colors.semantic.text.primary }}
                    >
                      {referrer.source}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span style={{ color: theme.colors.semantic.text.secondary }}>
                      {referrer.visits} visits
                    </span>
                    <ArrowRight className="w-4 h-4" style={{ color: theme.colors.semantic.text.secondary }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Social Shares"
              value={data.engagement.shares}
              trend={23.1}
              icon={<Share2 className="w-5 h-5" />}
              description="Total social shares"
              color="blue"
            />
            <MetricCard
              title="Likes"
              value={data.engagement.likes}
              trend={15.8}
              icon={<Heart className="w-5 h-5" />}
              description="User likes"
              color="red"
            />
            <MetricCard
              title="Comments"
              value={data.engagement.comments}
              trend={-5.2}
              icon={<MessageCircle className="w-5 h-5" />}
              description="User comments"
              color="green"
            />
            <MetricCard
              title="Bookmarks"
              value={data.engagement.bookmarks}
              trend={31.4}
              icon={<Bookmark className="w-5 h-5" />}
              description="Saved articles"
              color="purple"
            />
          </div>

          {/* Conversion Goals */}
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.primary 
            }}
          >
            <h4 
              className="font-medium mb-4"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Conversion Goals
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span 
                    className="font-medium text-sm"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Email Signups
                  </span>
                </div>
                <div 
                  className="text-2xl font-bold"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {data.conversions.emailSignups}
                </div>
              </div>

              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Download className="w-4 h-4 text-green-500" />
                  <span 
                    className="font-medium text-sm"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Downloads
                  </span>
                </div>
                <div 
                  className="text-2xl font-bold"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {data.conversions.downloads}
                </div>
              </div>

              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span 
                    className="font-medium text-sm"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Social Follows
                  </span>
                </div>
                <div 
                  className="text-2xl font-bold"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {data.conversions.socialFollows}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Traffic Tab */}
      {activeTab === 'traffic' && (
        <div className="space-y-6">
          <TrafficSourcesChart sources={data.traffic.sources} />
          
          {/* Geographic Distribution */}
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.primary 
            }}
          >
            <h4 
              className="font-medium mb-4"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Top Countries
            </h4>
            
            <div className="space-y-3">
              {data.traffic.countries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-medium text-xs"
                      style={{ backgroundColor: theme.colors.semantic.action.primary }}
                    >
                      {index + 1}
                    </div>
                    <span style={{ color: theme.colors.semantic.text.primary }}>
                      {country.country}
                    </span>
                  </div>
                  <span style={{ color: theme.colors.semantic.text.secondary }}>
                    {country.visits} visits
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PerformanceScore
              score={data.performance.seoScore}
              label="SEO Score"
              description="Search engine optimization rating"
            />
            <PerformanceScore
              score={data.performance.accessibilityScore}
              label="Accessibility"
              description="Web accessibility compliance"
            />
            <MetricCard
              title="Load Time"
              value={`${data.performance.loadTime}ms`}
              trend={-8.3}
              icon={<Clock className="w-5 h-5" />}
              description="Page load speed"
              color="blue"
            />
            <MetricCard
              title="Core Web Vitals"
              value="Good"
              icon={<CheckCircle className="w-5 h-5" />}
              description="Overall performance rating"
              color="green"
            />
          </div>

          {/* Core Web Vitals Details */}
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.primary 
            }}
          >
            <h4 
              className="font-medium mb-4"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Core Web Vitals
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
              >
                <div 
                  className="text-sm font-medium mb-1"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Largest Contentful Paint (LCP)
                </div>
                <div 
                  className="text-xl font-bold"
                  style={{ color: data.performance.coreWebVitals.lcp <= 2500 ? '#10b981' : '#ef4444' }}
                >
                  {(data.performance.coreWebVitals.lcp / 1000).toFixed(1)}s
                </div>
              </div>

              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
              >
                <div 
                  className="text-sm font-medium mb-1"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  First Input Delay (FID)
                </div>
                <div 
                  className="text-xl font-bold"
                  style={{ color: data.performance.coreWebVitals.fid <= 100 ? '#10b981' : '#ef4444' }}
                >
                  {data.performance.coreWebVitals.fid}ms
                </div>
              </div>

              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
              >
                <div 
                  className="text-sm font-medium mb-1"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Cumulative Layout Shift (CLS)
                </div>
                <div 
                  className="text-xl font-bold"
                  style={{ color: data.performance.coreWebVitals.cls <= 0.1 ? '#10b981' : '#ef4444' }}
                >
                  {data.performance.coreWebVitals.cls.toFixed(3)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};