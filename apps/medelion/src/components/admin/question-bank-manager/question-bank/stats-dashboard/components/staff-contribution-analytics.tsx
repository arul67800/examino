/**
 * Staff Contribution Analytics Component
 * Shows staff contributions and question authorship analytics
 * with detailed insights on individual and team performance
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from '@/theme';
import { QuestionBankStats } from '../../types';

interface StaffContribution {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'contributor' | 'reviewer';
  avatar?: string;
  questionsCreated: number;
  questionsApproved: number;
  questionsRejected: number;
  reviewsCompleted: number;
  avgProcessingTime: number; // hours
  qualityScore: number; // 0-100
  joinDate: string;
  lastActive: string;
  totalPoints: number;
  specializations: string[];
}

interface StaffContributionAnalyticsProps {
  stats?: QuestionBankStats;
  className?: string;
}

// Mock staff data - replace with actual API data
const mockStaffData: StaffContribution[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@examino.com',
    role: 'admin',
    questionsCreated: 342,
    questionsApproved: 298,
    questionsRejected: 44,
    reviewsCompleted: 156,
    avgProcessingTime: 2.3,
    qualityScore: 94,
    joinDate: '2024-01-15',
    lastActive: '2025-09-28T09:30:00Z',
    totalPoints: 4280,
    specializations: ['Mathematics', 'Physics', 'Chemistry']
  },
  {
    id: '2',
    name: 'Prof. Michael Chen',
    email: 'michael.chen@examino.com',
    role: 'moderator',
    questionsCreated: 287,
    questionsApproved: 251,
    questionsRejected: 36,
    reviewsCompleted: 203,
    avgProcessingTime: 1.8,
    qualityScore: 91,
    joinDate: '2024-02-20',
    lastActive: '2025-09-28T08:15:00Z',
    totalPoints: 3890,
    specializations: ['Computer Science', 'Mathematics']
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@examino.com',
    role: 'contributor',
    questionsCreated: 198,
    questionsApproved: 184,
    questionsRejected: 14,
    reviewsCompleted: 89,
    avgProcessingTime: 3.2,
    qualityScore: 96,
    joinDate: '2024-03-10',
    lastActive: '2025-09-27T16:45:00Z',
    totalPoints: 2940,
    specializations: ['Biology', 'Chemistry']
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james.wilson@examino.com',
    role: 'reviewer',
    questionsCreated: 145,
    questionsApproved: 128,
    questionsRejected: 17,
    reviewsCompleted: 234,
    avgProcessingTime: 1.5,
    qualityScore: 88,
    joinDate: '2024-04-05',
    lastActive: '2025-09-28T11:20:00Z',
    totalPoints: 2156,
    specializations: ['English', 'History']
  },
  {
    id: '5',
    name: 'Dr. Lisa Park',
    email: 'lisa.park@examino.com',
    role: 'contributor',
    questionsCreated: 234,
    questionsApproved: 205,
    questionsRejected: 29,
    reviewsCompleted: 67,
    avgProcessingTime: 2.8,
    qualityScore: 89,
    joinDate: '2024-05-18',
    lastActive: '2025-09-28T07:30:00Z',
    totalPoints: 3120,
    specializations: ['Physics', 'Engineering']
  }
];

export const StaffContributionAnalytics: React.FC<StaffContributionAnalyticsProps> = ({
  stats,
  className = ''
}) => {
  const { theme } = useTheme();
  const [sortBy, setSortBy] = useState<'questionsCreated' | 'qualityScore' | 'reviewsCompleted' | 'totalPoints'>('questionsCreated');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'moderator' | 'contributor' | 'reviewer'>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Filter and sort staff data
  const processedStaff = useMemo(() => {
    let filtered = mockStaffData;
    
    if (filterRole !== 'all') {
      filtered = filtered.filter(staff => staff.role === filterRole);
    }
    
    return filtered.sort((a, b) => b[sortBy] - a[sortBy]);
  }, [sortBy, filterRole]);

  // Calculate team analytics
  const teamAnalytics = useMemo(() => {
    const total = processedStaff.length;
    const totalQuestionsCreated = processedStaff.reduce((sum, staff) => sum + staff.questionsCreated, 0);
    const totalQuestionsApproved = processedStaff.reduce((sum, staff) => sum + staff.questionsApproved, 0);
    const totalReviewsCompleted = processedStaff.reduce((sum, staff) => sum + staff.reviewsCompleted, 0);
    const avgQualityScore = processedStaff.reduce((sum, staff) => sum + staff.qualityScore, 0) / total;
    const avgProcessingTime = processedStaff.reduce((sum, staff) => sum + staff.avgProcessingTime, 0) / total;
    
    // Role distribution
    const roleDistribution = mockStaffData.reduce((acc, staff) => {
      acc[staff.role] = (acc[staff.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      totalQuestionsCreated,
      totalQuestionsApproved,
      totalReviewsCompleted,
      avgQualityScore: Math.round(avgQualityScore),
      avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
      approvalRate: totalQuestionsCreated > 0 ? Math.round((totalQuestionsApproved / totalQuestionsCreated) * 100) : 0,
      roleDistribution
    };
  }, [processedStaff]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#8B5CF6'; // Purple
      case 'moderator': return theme.colors.semantic.action.primary;
      case 'contributor': return '#10B981'; // Green
      case 'reviewer': return '#F59E0B'; // Amber
      default: return theme.colors.semantic.text.secondary;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'moderator': return '⚡';
      case 'contributor': return '✍️';
      case 'reviewer': return '🔍';
      default: return '👤';
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      className={`rounded-xl p-6 ${className}`}
      style={{ backgroundColor: theme.colors.semantic.surface.primary }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 
            className="text-lg font-semibold mb-1"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Staff Contribution Analytics
          </h3>
          <p 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Individual and team performance insights
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-3 py-1 rounded border text-sm"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.secondary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="moderator">Moderators</option>
            <option value="contributor">Contributors</option>
            <option value="reviewer">Reviewers</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 rounded border text-sm"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.secondary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <option value="questionsCreated">Questions Created</option>
            <option value="qualityScore">Quality Score</option>
            <option value="reviewsCompleted">Reviews Completed</option>
            <option value="totalPoints">Total Points</option>
          </select>
        </div>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary,
            borderLeft: `4px solid ${theme.colors.semantic.action.primary}`
          }}
        >
          <span 
            className="text-sm font-medium block mb-2"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Active Staff
          </span>
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {teamAnalytics.total}
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary,
            borderLeft: '4px solid #10B981'
          }}
        >
          <span 
            className="text-sm font-medium block mb-2"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Questions Created
          </span>
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {teamAnalytics.totalQuestionsCreated.toLocaleString()}
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary,
            borderLeft: '4px solid #F59E0B'
          }}
        >
          <span 
            className="text-sm font-medium block mb-2"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Avg Quality Score
          </span>
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {teamAnalytics.avgQualityScore}%
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary,
            borderLeft: '4px solid #8B5CF6'
          }}
        >
          <span 
            className="text-sm font-medium block mb-2"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Reviews Completed
          </span>
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {teamAnalytics.totalReviewsCompleted.toLocaleString()}
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary,
            borderLeft: `4px solid ${theme.colors.semantic.action.secondary}`
          }}
        >
          <span 
            className="text-sm font-medium block mb-2"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Avg Processing Time
          </span>
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {teamAnalytics.avgProcessingTime}h
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="mb-6">
        <h4 
          className="text-md font-semibold mb-3"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          Team Composition
        </h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(teamAnalytics.roleDistribution).map(([role, count]) => (
            <div
              key={role}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.secondary
              }}
            >
              <span className="text-lg">{getRoleBadge(role)}</span>
              <span 
                className="font-medium capitalize"
                style={{ color: getRoleColor(role) }}
              >
                {role}s
              </span>
              <span 
                className="text-sm px-2 py-1 rounded-full"
                style={{
                  backgroundColor: getRoleColor(role) + '15',
                  color: getRoleColor(role)
                }}
              >
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Staff List */}
      <div
        className="rounded-lg border"
        style={{
          backgroundColor: theme.colors.semantic.surface.secondary,
          borderColor: theme.colors.semantic.border.secondary
        }}
      >
        <div className="p-4 border-b" style={{ borderColor: theme.colors.semantic.border.secondary }}>
          <h4 
            className="text-md font-semibold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Individual Performance
          </h4>
        </div>

        <div 
          className="divide-y" 
          style={{ '--tw-divide-opacity': 1, '--tw-divide-color': theme.colors.semantic.border.secondary } as React.CSSProperties}
        >
          {processedStaff.map((staff, index) => (
            <div key={staff.id} className="p-4 hover:bg-opacity-50 transition-colors">
              <div className="flex items-center justify-between">
                {/* Staff Info */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: getRoleColor(staff.role) }}
                    >
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="absolute -bottom-1 -right-1 text-lg">
                      {getRoleBadge(staff.role)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h5 
                        className="font-semibold"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        {staff.name}
                      </h5>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                        style={{
                          backgroundColor: getRoleColor(staff.role) + '15',
                          color: getRoleColor(staff.role)
                        }}
                      >
                        {staff.role}
                      </span>
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      {staff.specializations.join(', ')}
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      Last active: {formatLastActive(staff.lastActive)}
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <div 
                      className="text-lg font-bold"
                      style={{ color: theme.colors.semantic.text.primary }}
                    >
                      {staff.questionsCreated}
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      Created
                    </div>
                  </div>

                  <div>
                    <div 
                      className="text-lg font-bold"
                      style={{ color: '#10B981' }}
                    >
                      {staff.qualityScore}%
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      Quality
                    </div>
                  </div>

                  <div>
                    <div 
                      className="text-lg font-bold"
                      style={{ color: theme.colors.semantic.action.primary }}
                    >
                      {staff.reviewsCompleted}
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      Reviews
                    </div>
                  </div>

                  <div>
                    <div 
                      className="text-lg font-bold"
                      style={{ color: theme.colors.semantic.action.secondary }}
                    >
                      {staff.totalPoints.toLocaleString()}
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      Points
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mt-3 flex items-center space-x-4">
                <span 
                  className="text-xs w-20"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Approval Rate
                </span>
                <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}>
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: '#10B981',
                      width: `${staff.questionsCreated > 0 ? (staff.questionsApproved / staff.questionsCreated) * 100 : 0}%`
                    }}
                  />
                </div>
                <span 
                  className="text-xs w-12 text-right"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  {staff.questionsCreated > 0 ? Math.round((staff.questionsApproved / staff.questionsCreated) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary
          }}
        >
          <h5 
            className="font-semibold mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            🏆 Top Performers
          </h5>
          <ul 
            className="text-sm space-y-1"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            <li>• Highest Quality: {processedStaff.sort((a, b) => b.qualityScore - a.qualityScore)[0]?.name} ({processedStaff[0]?.qualityScore}%)</li>
            <li>• Most Productive: {processedStaff.sort((a, b) => b.questionsCreated - a.questionsCreated)[0]?.name} ({processedStaff.sort((a, b) => b.questionsCreated - a.questionsCreated)[0]?.questionsCreated} questions)</li>
            <li>• Fastest Reviewer: {processedStaff.sort((a, b) => a.avgProcessingTime - b.avgProcessingTime)[0]?.name} ({processedStaff.sort((a, b) => a.avgProcessingTime - b.avgProcessingTime)[0]?.avgProcessingTime}h avg)</li>
          </ul>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary
          }}
        >
          <h5 
            className="font-semibold mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            📊 Team Health
          </h5>
          <ul 
            className="text-sm space-y-1"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            <li>• Team approval rate: {teamAnalytics.approvalRate}% (Excellent)</li>
            <li>• Average quality score: {teamAnalytics.avgQualityScore}% (High standard)</li>
            <li>• Processing efficiency: {teamAnalytics.avgProcessingTime}h average</li>
          </ul>
        </div>
      </div>
    </div>
  );
};