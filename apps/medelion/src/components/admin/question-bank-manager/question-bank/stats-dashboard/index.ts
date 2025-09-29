/**
 * Stats Dashboard Components Index
 * Central exports for all analytics and dashboard components
 */

// Main dashboard component
export { StatsDashboard } from './components/stats-dashboard';

// Individual analytics components
export { MetricsOverview } from './components/metrics-overview';
export { DifficultyAnalytics } from './components/difficulty-analytics';
export { TypeDistribution } from './components/type-distribution';
export { HierarchyDistribution } from './components/hierarchy-distribution';
export { ApprovalStatusAnalytics } from './components/approval-status-analytics';
export { TimeBasedAnalytics } from './components/time-based-analytics';
export { StaffContributionAnalytics } from './components/staff-contribution-analytics';
export { ComprehensiveOverview } from './components/comprehensive-overview';

// Types
export type { QuestionBankStats, Difficulty, QuestionType } from '../types';