import { api } from "../../api";

export interface QuizBankQualificationGuard {
  id: string;
  title: string;
  qualification_code: string;
  total_units: number;
  is_cpd: boolean;
}

export interface QuizBankUnitCard {
  id: string;
  title: string;
  unit_code: string;
  description: string;
  order: number;
  question_count: number;
  quiz_config_exists: boolean;
  quiz_enabled: boolean;
  assignment_config_exists: boolean;
  assignment_enabled: boolean;
  portfolio_config_exists: boolean;
  portfolio_enabled: boolean;
}

export interface QuizConfig {
  id: string;
  unit: string;
  quiz_enabled: boolean;
  questions_per_quiz: number;
  time_limit_minutes: number;
  pass_score: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  max_attempts: number;
  strict_mode: boolean;
  show_results: boolean;
  show_correct_answers: boolean;
  show_explanations: boolean;
  cooldown_hours: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Question {
  id: string;
  unit: string;
  question_text: string;
  question_type: "single" | "multiple";
  options: string[];
  correct_answers: number[];
  explanation: string;
  is_active: boolean;
  created_by: {
    id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface WrittenAssignmentConfig {
  id: string;
  unit: string;
  title: string;
  instructions: string;
  min_words: number;
  max_words: number;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface LearnerQuestion {
  id: string;
  question_text: string;
  question_type: "single" | "multiple";
  options: string[];
}

export interface QuizAttempt {
  id: string;
  unit: string;
  learner: string;
  questions: LearnerQuestion[];
  attempt_number?: number;
  started_at: string;
  submitted_at: string | null;
  time_taken_seconds: number | null;
  time_taken_display?: string;
  score_percent: number | null;
  score_summary_text?: string;
  correct_count?: number;
  total_questions?: number;
  passed: boolean | null;
  pass_mark_snapshot?: number;
  violations_count: number;
  violation_count?: number;
  auto_submitted?: boolean;
  can_retake?: boolean;
  remaining_attempts?: number;
  status: "in_progress" | "submitted" | "expired";
}

export interface QuizAttemptReview extends QuizAttempt {
  review_questions: {
    question_id: string;
    question_text: string;
    question_type: "single" | "multiple";
    options: string[];
    learner_answers: number[];
    correct_answers: number[];
    is_correct: boolean;
    explanation: string;
  }[];
}

export interface QuizSubmission {
  answers: Record<string, number[]>;
  violations_count: number;
}

export interface UnitAttemptsData {
  attempts: QuizAttempt[];
  remaining_attempts: number;
  max_attempts: number;
  best_score: number | null;
}

export interface CPDFinalAssessmentAttemptQuestion {
  id: string;
  display_order: number;
  question_text_snapshot: string;
  options_snapshot: string[];
  learner_answers: number[];
  is_correct: boolean;
  is_flagged_for_review: boolean;
}

export interface CPDFinalAssessmentAttempt {
  id: string;
  qualification_title: string;
  attempt_number: number;
  status: "in_progress" | "submitted" | "auto_submitted" | "abandoned";
  started_at: string;
  submitted_at: string | null;
  score_percent: number | null;
  correct_count: number;
  total_questions: number;
  pass_mark: number;
  passed: boolean;
  time_limit_minutes: number;
  time_taken_seconds: number;
  auto_submitted: boolean;
  questions: CPDFinalAssessmentAttemptQuestion[];
}

export interface CPDFinalAssessmentStartResponse extends CPDFinalAssessmentAttempt {
  is_new_attempt: boolean;
}

export interface CPDFinalAssessmentSummary {
  id: string | null;
  qualification_id: string;
  qualification_title: string;
  qualification_code: string;
  question_pool_count: number;
  questions_per_assessment: number | null;
  time_limit_minutes: number | null;
  pass_mark: number | null;
  status: "configured" | "not_configured";
  assessment_status: "draft" | "published" | "archived" | null;
  is_active: boolean;
}

export interface CPDFinalAssessment {
  id: string;
  qualification?: string;
  qualification_id: string;
  qualification_title: string;
  qualification_code: string;
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
  status_display?: string;
  pass_mark: number;
  time_limit_minutes: number;
  max_attempts: number;
  questions_per_assessment: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_results_immediately: boolean;
  show_correct_answers_after: boolean;
  show_explanations_after: boolean;
  cooldown_hours_between_attempts: number;
  is_active: boolean;
  question_pool_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface CPDFinalAssessmentQuestion {
  id: string;
  assessment: string;
  question_text: string;
  question_type: "single" | "multiple";
  options: string[];
  correct_answers: number[];
  explanation: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CPDFinalAssessmentStats {
  assessment_id: string;
  qualification_title: string;
  total_questions: number;
  active_questions: number;
  single_choice_questions: number;
  multiple_choice_questions: number;
  questions_per_assessment: number;
  is_ready: boolean;
  shortfall: number;
}

export interface QuizResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedQuizList<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const asQuizList = <T>(payload: T[] | PaginatedQuizList<T> | null | undefined): T[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.results)) {
    return payload.results;
  }

  return [];
};

const quizApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getQuestionBankQualificationGuard: builder.query<QuizBankQualificationGuard, string>({
      query: (qualificationId) => ({
        url: `/api/quizzes/qualifications/${qualificationId}/`,
        method: "GET",
      }),
      transformResponse: (response: QuizResponse<QuizBankQualificationGuard>) => response.data,
      providesTags: (result, _error, id) => [{ type: "Quizzes", id }],
    }),

    getQuestionBankUnits: builder.query<QuizBankUnitCard[], string>({
      query: (qualificationId) => ({
        url: `/api/quizzes/qualifications/${qualificationId}/units/`,
        method: "GET",
      }),
      transformResponse: (response: QuizResponse<QuizBankUnitCard[] | PaginatedQuizList<QuizBankUnitCard>>) => asQuizList(response.data),
      providesTags: (result, _error, qualificationId) => [
        { type: "Quizzes", id: `UNITS_${qualificationId}` },
        ...asQuizList(result).map((u) => ({ type: "Quizzes" as const, id: u.id })),
      ],
    }),

    getQuizConfig: builder.query<QuizConfig, string>({
      query: (unitId) => ({
        url: `/api/quizzes/units/${unitId}/quiz-config/`,
        method: "GET",
      }),
      transformResponse: (response: QuizResponse<QuizConfig>) => response.data,
      providesTags: (result, _error, unitId) => [{ type: "Quizzes", id: `CONFIG_${unitId}` }],
    }),

    updateQuizConfig: builder.mutation<QuizResponse<QuizConfig>, { unitId: string; data: Partial<QuizConfig> }>({
      query: ({ unitId, data }) => ({
        url: `/api/quizzes/units/${unitId}/quiz-config/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, _error, { unitId }) => [
        { type: "Quizzes", id: `CONFIG_${unitId}` },
        { type: "QualificationUnits", id: `LIST` },
      ],
    }),
    updatePortfolioConfig: builder.mutation<any, { unitId: string; payload: any }>({
      query: ({ unitId, payload }) => ({
        url: `/api/quizzes/units/${unitId}/portfolio-config/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { unitId }) => [{ type: "QualificationUnits", id: unitId }],
    }),

    getQuestions: builder.query<Question[], string>({
      query: (unitId) => ({
        url: `/api/quizzes/units/${unitId}/questions/`,
        method: "GET",
      }),
      transformResponse: (response: QuizResponse<Question[] | PaginatedQuizList<Question>>) => asQuizList(response.data),
      providesTags: (result, _error, unitId) => [
        { type: "Quizzes", id: `QUESTIONS_${unitId}` },
        ...asQuizList(result).map((q) => ({ type: "Quizzes" as const, id: q.id })),
      ],
    }),

    createQuestion: builder.mutation<QuizResponse<Question>, { unitId: string; data: Partial<Question> }>({
      query: ({ unitId, data }) => ({
        url: `/api/quizzes/units/${unitId}/questions/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, _error, { unitId }) => [{ type: "Quizzes", id: `QUESTIONS_${unitId}` }],
    }),

    deleteQuestion: builder.mutation<QuizResponse<void>, string>({
      query: (questionId) => ({
        url: `/api/quizzes/questions/${questionId}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quizzes"],
    }),

    getWrittenAssignmentConfig: builder.query<WrittenAssignmentConfig, string>({
      query: (unitId) => ({
        url: `/api/quizzes/units/${unitId}/assignment-config/`,
        method: "GET",
      }),
      transformResponse: (response: QuizResponse<WrittenAssignmentConfig>) => response.data,
      providesTags: (result, _error, unitId) => [{ type: "Quizzes", id: `WA_${unitId}` }],
    }),

    createWrittenAssignmentConfig: builder.mutation<
      QuizResponse<WrittenAssignmentConfig>,
      { unitId: string; data: Partial<WrittenAssignmentConfig> }
    >({
      query: ({ unitId, data }) => ({
        url: `/api/quizzes/units/${unitId}/assignment-config/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, _error, { unitId }) => [
        { type: "Quizzes", id: `WA_${unitId}` },
        { type: "QualificationUnits", id: `LIST` },
      ],
    }),

    updateWrittenAssignmentConfig: builder.mutation<
      QuizResponse<WrittenAssignmentConfig>,
      { unitId: string; data: Partial<WrittenAssignmentConfig> }
    >({
      query: ({ unitId, data }) => ({
        url: `/api/quizzes/units/${unitId}/assignment-config/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, _error, { unitId }) => [
        { type: "Quizzes", id: `WA_${unitId}` },
        { type: "QualificationUnits", id: `LIST` },
      ],
    }),

    // Learner Quiz Flow
    startQuiz: builder.mutation<QuizResponse<QuizAttempt>, string>({
      query: (unitId) => ({
        url: `/api/quizzes/units/${unitId}/start/`,
        method: "POST",
      }),
      invalidatesTags: ["Quizzes"],
    }),

    submitQuiz: builder.mutation<QuizResponse<QuizAttempt>, { attemptId: string; data: QuizSubmission }>({
      query: ({ attemptId, data }) => ({
        url: `/api/quizzes/attempts/${attemptId}/submit/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, _error, { attemptId }) => [{ type: "Quizzes", id: `ATTEMPT_${attemptId}` }, "Quizzes"],
    }),

    getQuizAttempt: builder.query<QuizResponse<QuizAttempt>, string>({
      query: (attemptId) => ({
        url: `/api/quizzes/attempts/${attemptId}/`,
        method: "GET",
      }),
      providesTags: (result, _error, attemptId) => [{ type: "Quizzes", id: `ATTEMPT_${attemptId}` }],
    }),

    getUnitAttempts: builder.query<QuizResponse<UnitAttemptsData>, { unitId: string; learnerId?: string }>({
      query: ({ unitId, learnerId }) => ({
        url: `/api/quizzes/units/${unitId}/attempts/`,
        method: "GET",
        params: learnerId ? { learner_id: learnerId } : {},
      }),
      providesTags: (result, _error, { unitId, learnerId }) => [
        { type: "Quizzes", id: `ATTEMPTS_UNIT_${unitId}` },
        ...(learnerId ? [{ type: "Quizzes" as const, id: `ATTEMPTS_UNIT_${unitId}_LEARNER_${learnerId}` }] : []),
      ],
    }),

    getQuizAttemptReview: builder.query<QuizResponse<QuizAttemptReview>, string>({
      query: (attemptId) => ({
        url: `/api/quizzes/attempts/${attemptId}/review/`,
        method: "GET",
      }),
      providesTags: (result, _error, attemptId) => [{ type: "Quizzes", id: `REVIEW_${attemptId}` }],
    }),

    getAssignmentSubmission: builder.query<QuizResponse<any>, { unitId: string; learnerId: string }>({
      query: ({ unitId, learnerId }) => ({
        url: `/api/quizzes/units/${unitId}/assignment-submission/`,
        method: "GET",
        params: { learner_id: learnerId },
      }),
      providesTags: (result, _error, { unitId, learnerId }) => [{ type: "Quizzes", id: `SUBMISSION_${unitId}_${learnerId}` }],
    }),

    gradeAssignment: builder.mutation<QuizResponse<any>, { submissionId: string; payload: { grade: string; feedback: string } }>({
      query: ({ submissionId, payload }) => ({
        url: `/api/quizzes/submissions/${submissionId}/grade/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, _error, { submissionId }) => ["Quizzes"],
    }),

    // Qualification Final Quiz Flow
    startFinalQuiz: builder.mutation<QuizResponse<QuizAttempt>, string>({
      query: (qualificationId) => ({
        url: `/api/quizzes/qualifications/${qualificationId}/start/`,
        method: "POST",
      }),
      invalidatesTags: ["Quizzes"],
    }),

    getFinalQuizAttempts: builder.query<QuizResponse<QuizAttempt[]>, { qualificationId: string; learnerId?: string }>({
      query: ({ qualificationId, learnerId }) => ({
        url: `/api/quizzes/qualifications/${qualificationId}/attempts/`,
        method: "GET",
        params: learnerId ? { learner_id: learnerId } : {},
      }),
      providesTags: (result, _error, { qualificationId }) => [{ type: "Quizzes", id: `ATTEMPTS_QUAL_${qualificationId}` }],
    }),

    // CPD Final Assessment (Qualification Level)
    startCPDFinalAssessment: builder.mutation<CPDFinalAssessmentStartResponse, string>({
      query: (qualificationId) => ({
        url: `/api/quizzes/qualifications/${qualificationId}/final-assessment/attempt/`,
        method: "POST",
      }),
      invalidatesTags: ["Quizzes"],
    }),

    submitCPDFinalAssessment: builder.mutation<CPDFinalAssessmentAttempt, { attemptId: string; answers: Record<string, number[]> }>({
      query: ({ attemptId, answers }) => ({
        url: `/api/quizzes/attempts/${attemptId}/cpd-submit/`,
        method: "POST",
        body: { answers },
      }),
      invalidatesTags: (result, _error, { attemptId }) => [{ type: "Quizzes", id: `CPD_ATTEMPT_${attemptId}` }, "Quizzes"],
    }),
    saveCPDFinalAssessmentProgress: builder.mutation<{ status: string; attempt_id: string }, { attemptId: string; answers: Record<string, number[]> }>({
      query: ({ attemptId, answers }) => ({
        url: `/api/quizzes/attempts/${attemptId}/cpd-progress/`,
        method: "PATCH",
        body: { answers },
      }),
    }),

    // Admin CPD Final Assessment Management
    getCPDFinalAssessment1: builder.query<QuizResponse<CPDFinalAssessmentSummary[]>, string>({
      query: (qualificationId) => ({
        url: `/api/qualification/admin/cpd-final-assessments/?qualification=${qualificationId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, qualificationId) => [
        { type: "Quizzes", id: `CPD_CONFIG_${qualificationId}` }
      ],
    }),
    getCPDFinalAssessment: builder.query<QuizResponse<CPDFinalAssessmentSummary>, string>({
      query: (qualificationId) => ({
        url: `/api/qualification/admin/${qualificationId}/cpd-final-assessment/`,
        method: "GET",
      }),
      providesTags: (_result, _error, qualificationId) => [
        { type: "Quizzes", id: `CPD_CONFIG_${qualificationId}` }
      ],
    }),

    getCPDFinalAssessmentDetail: builder.query<QuizResponse<CPDFinalAssessment>, string>({
      query: (assessmentId) => ({
        url: `/api/qualification/admin/cpd-final-assessments/${assessmentId}/`,
        method: "GET",
      }),
      providesTags: (_result, _error, assessmentId) => [
        { type: "Quizzes", id: `CPD_DETAIL_${assessmentId}` }
      ],
    }),

    createCPDFinalAssessment: builder.mutation<QuizResponse<CPDFinalAssessment>, Partial<CPDFinalAssessment>>({
      query: (data) => ({
        url: `/api/qualification/admin/cpd-final-assessments/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, _error, data) => [
        { type: "Quizzes", id: `CPD_CONFIG_${data.qualification}` }
      ],
    }),

    updateCPDFinalAssessment: builder.mutation<QuizResponse<CPDFinalAssessment>, { id: string; qualificationId: string; data: Partial<CPDFinalAssessment> }>({
      query: ({ id, data }) => ({
        url: `/api/qualification/admin/cpd-final-assessments/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id, qualificationId }) => [
        { type: "Quizzes", id: `CPD_CONFIG_${qualificationId}` },
        { type: "Quizzes", id: `CPD_DETAIL_${id}` },
        { type: "Quizzes", id: `CPD_STATS_${id}` },
      ],
    }),

    getCPDFinalAssessmentQuestions: builder.query<QuizResponse<CPDFinalAssessmentQuestion[]>, string>({
      query: (assessmentId) => ({
        url: `/api/qualification/admin/cpd-final-assessments/${assessmentId}/questions/`,
        method: "GET",
      }),
      providesTags: (result, _error, assessmentId) => {
        const dataArr = Array.isArray(result?.data) ? result.data : ((result?.data as any)?.results || []);
        return [
          { type: "Quizzes", id: `CPD_QUESTIONS_${assessmentId}` },
          ...dataArr.map((q: any) => ({ type: "Quizzes" as const, id: q.id })),
        ];
      },
    }),

    createCPDFinalAssessmentQuestion: builder.mutation<QuizResponse<CPDFinalAssessmentQuestion>, { assessmentId: string; data: Partial<CPDFinalAssessmentQuestion> }>({
      query: ({ assessmentId, data }) => ({
        url: `/api/qualification/admin/cpd-final-assessments/${assessmentId}/questions/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, _error, { assessmentId }) => [
        { type: "Quizzes", id: `CPD_QUESTIONS_${assessmentId}` },
        { type: "Quizzes", id: `CPD_STATS_${assessmentId}` }
      ],
    }),

    deleteCPDFinalAssessmentQuestion: builder.mutation<QuizResponse<void>, string>({
      query: (questionId) => ({
        url: `/api/qualification/admin/cpd-final-assessments/questions/${questionId}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quizzes"],
    }),

    getCPDFinalAssessmentStats: builder.query<QuizResponse<CPDFinalAssessmentStats>, string>({
      query: (assessmentId) => ({
        url: `/api/qualification/admin/cpd-final-assessments/${assessmentId}/stats/`,
        method: "GET",
      }),
      providesTags: (result, _error, assessmentId) => [{ type: "Quizzes", id: `CPD_STATS_${assessmentId}` }],
    }),
  }),
});

export const {
  useGetQuestionBankQualificationGuardQuery,
  useGetQuestionBankUnitsQuery,
  useGetQuizConfigQuery,
  useUpdateQuizConfigMutation,
  useUpdatePortfolioConfigMutation,
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useGetWrittenAssignmentConfigQuery,
  useCreateWrittenAssignmentConfigMutation,
  useUpdateWrittenAssignmentConfigMutation,
  useStartQuizMutation,
  useSubmitQuizMutation,
  useGetQuizAttemptQuery,
  useGetUnitAttemptsQuery,
  useGetFinalQuizAttemptsQuery,
  useStartFinalQuizMutation,
  useStartCPDFinalAssessmentMutation,
  useSubmitCPDFinalAssessmentMutation,
  useSaveCPDFinalAssessmentProgressMutation,
  useGetCPDFinalAssessmentQuery,
  useGetCPDFinalAssessmentDetailQuery,
  useCreateCPDFinalAssessmentMutation,
  useUpdateCPDFinalAssessmentMutation,
  useGetCPDFinalAssessmentQuestionsQuery,
  useCreateCPDFinalAssessmentQuestionMutation,
  useDeleteCPDFinalAssessmentQuestionMutation,
  useGetCPDFinalAssessmentStatsQuery,
  useGetQuizAttemptReviewQuery,
  useGetAssignmentSubmissionQuery,
  useGradeAssignmentMutation,
} = quizApi;
