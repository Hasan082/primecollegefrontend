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
        responseHandler: (response) => response.blob(),
      }),
    }),
    
    // Enrolment Summary Report
    exportEnrolmentSummaryReport: builder.query<Blob, ReportExportParams>({
      query: (params) => ({
        url: "/api/enrolments/reports/enrolment-summary/export/",
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),
    
    // Assessment Activity Report
    exportAssessmentActivityReport: builder.query<Blob, ReportExportParams>({
      query: (params) => ({
        url: "/api/enrolments/reports/assessment-activity/export/",
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),
    
    // Qualification Statistics Report
    exportQualificationStatisticsReport: builder.query<Blob, ReportExportParams>({
      query: (params) => ({
        url: "/api/enrolments/reports/qualification-statistics/export/",
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),
    
    // Trainer Workload Report
    exportTrainerWorkloadReport: builder.query<Blob, ReportExportParams>({
      query: (params) => ({
        url: "/api/enrolments/reports/trainer-workload/export/",
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),
    
    // Evidence Submission Log Report
    exportEvidenceSubmissionLogReport: builder.query<Blob, ReportExportParams>({
      query: (params) => ({
        url: "/api/enrolments/reports/evidence-submission-log/export/",
        params,
        responseHandler: (response) => response.blob(),
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
