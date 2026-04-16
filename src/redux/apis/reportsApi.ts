import { api } from "../api";

export interface ReportExportParams {
  format: 'csv' | 'pdf';
  date_range?: 'all-time' | 'this-month' | 'last-3-months' | 'last-6-months' | 'this-year';
  qualification_id?: string;
  category?: string;
}

export const reportsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Learner Progress Report
    exportLearnerProgressReport: builder.query<Blob, ReportExportParams>({
      query: (params) => ({
        url: "/api/enrolments/reports/learner-progress/export/",
        params,
        responseType: 'blob',
      }),
    }),
    
    // Enrolment Summary Report
    exportEnrolmentSummaryReport: builder.query<Blob, ReportExportParams>({
      query: (params) => ({
        url: "/api/enrolments/reports/enrolment-summary/export/",
        params,
        responseType: 'blob',
      }),
    }),
    
    // Assessment Activity Report
    exportAssessmentActivityReport: builder.query<Blob, ReportExportParams>({
      query: (params) => ({
        url: "/api/enrolments/reports/assessment-activity/export/",
        params,
        responseType: 'blob',
      }),
    }),
    
    // Qualification Statistics Report
    exportQualificationStatisticsReport: builder.query<Blob, ReportExportParams>({
      query: (params) => ({
        url: "/api/enrolments/reports/qualification-statistics/export/",
        params,
        responseType: 'blob',
      }),
    }),
    
    // Trainer Workload Report
    exportTrainerWorkloadReport: builder.query<Blob, ReportExportParams>({
      query: (params) => ({
        url: "/api/enrolments/reports/trainer-workload/export/",
        params,
        responseType: 'blob',
      }),
    }),
    
    // Evidence Submission Log Report
    exportEvidenceSubmissionLogReport: builder.query<Blob, ReportExportParams>({
      query: (params) => ({
        url: "/api/enrolments/reports/evidence-submission-log/export/",
        params,
        responseType: 'blob',
      }),
    }),
  }),
});

export const {
  useLazyExportLearnerProgressReportQuery,
  useLazyExportEnrolmentSummaryReportQuery,
  useLazyExportAssessmentActivityReportQuery,
  useLazyExportQualificationStatisticsReportQuery,
  useLazyExportTrainerWorkloadReportQuery,
  useLazyExportEvidenceSubmissionLogReportQuery,
} = reportsApi;
