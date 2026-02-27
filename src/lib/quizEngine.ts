/**
 * Quiz Engine — generates randomised quiz instances from the Question Bank
 * based on trainer configuration.
 */
import {
  sampleBankQuestions,
  defaultQuizConfig,
  qualificationBanks,
  type BankQuestion,
  type QuizConfig,
} from "@/data/questionBankData";

export interface QuizInstance {
  quizId: string;
  unitCode: string;
  qualificationId: string;
  questions: QuizInstanceQuestion[];
  config: QuizConfig;
  startedAt: number;
}

export interface QuizInstanceQuestion {
  id: string;
  originalId: string;
  question: string;
  type: "single" | "multiple";
  options: string[];
  /** Maps shuffled option index → original option index */
  optionMap: number[];
  correctShuffledIndices: number[];
}

export interface QuizResult {
  quizId: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  passed: boolean;
  passScore: number;
  timeTakenSeconds: number;
  answers: Record<string, number[]>;
  violations: number;
  submittedAt: number;
}

/* ── Fisher-Yates shuffle ── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Look up the question bank for a given unit.
 * For now we only have sample questions for VTCT301;
 * other units get a generated subset.
 */
function getQuestionsForUnit(qualificationId: string, unitCode: string): BankQuestion[] {
  // In a real system this would be a DB call
  if (unitCode === "VTCT301") return sampleBankQuestions;

  // For other units that have questionCount > 0, generate from the sample pool
  const bank = qualificationBanks.find((q) => q.id === qualificationId);
  const unit = bank?.units.find((u) => u.code === unitCode);
  if (!unit || unit.questionCount === 0) return [];

  // Re-use sample questions with modified IDs to simulate unique pools
  return sampleBankQuestions.slice(0, Math.min(unit.questionCount, sampleBankQuestions.length)).map((q, i) => ({
    ...q,
    id: `${unitCode}-${q.id}`,
  }));
}

function getQuizConfig(_qualificationId: string, _unitCode: string): QuizConfig {
  // In a real system, each unit would have its own config
  return { ...defaultQuizConfig };
}

/**
 * Generate a randomised quiz instance for a learner.
 */
export function generateQuiz(qualificationId: string, unitCode: string): QuizInstance | null {
  const allQuestions = getQuestionsForUnit(qualificationId, unitCode);
  const config = getQuizConfig(qualificationId, unitCode);

  if (allQuestions.length === 0) return null;

  // Select random subset
  let selected: BankQuestion[];
  if (config.shuffleQuestions) {
    selected = shuffle(allQuestions).slice(0, Math.min(config.questionsPerQuiz, allQuestions.length));
  } else {
    selected = allQuestions.slice(0, Math.min(config.questionsPerQuiz, allQuestions.length));
  }

  // Build quiz instance with option shuffling
  const questions: QuizInstanceQuestion[] = selected.map((q, idx) => {
    const originalIndices = q.options.map((_, i) => i);
    const shuffledIndices = config.shuffleOptions ? shuffle(originalIndices) : originalIndices;
    const shuffledOptions = shuffledIndices.map((i) => q.options[i]);

    // Map correct answers to shuffled positions
    const correctShuffledIndices = q.correctAnswers
      .map((origIdx) => shuffledIndices.indexOf(origIdx))
      .filter((i) => i !== -1);

    return {
      id: `qi-${idx}`,
      originalId: q.id,
      question: q.question,
      type: q.type,
      options: shuffledOptions,
      optionMap: shuffledIndices,
      correctShuffledIndices,
    };
  });

  return {
    quizId: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    unitCode,
    qualificationId,
    questions,
    config,
    startedAt: Date.now(),
  };
}

/**
 * Score a completed quiz.
 */
export function scoreQuiz(
  quiz: QuizInstance,
  answers: Record<string, number[]>,
  violations: number
): QuizResult {
  let correctCount = 0;

  for (const q of quiz.questions) {
    const learnerAnswers = (answers[q.id] || []).sort();
    const correctAnswers = q.correctShuffledIndices.sort();

    if (
      learnerAnswers.length === correctAnswers.length &&
      learnerAnswers.every((v, i) => v === correctAnswers[i])
    ) {
      correctCount++;
    }
  }

  const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);

  return {
    quizId: quiz.quizId,
    totalQuestions: quiz.questions.length,
    correctCount,
    scorePercent,
    passed: scorePercent >= quiz.config.passScore,
    passScore: quiz.config.passScore,
    timeTakenSeconds: Math.round((Date.now() - quiz.startedAt) / 1000),
    answers,
    violations,
    submittedAt: Date.now(),
  };
}

/* ── Attempt tracking (in-memory for mock) ── */
const attemptStore: Record<string, QuizResult[]> = {};

function attemptKey(qualificationId: string, unitCode: string): string {
  return `${qualificationId}::${unitCode}`;
}

export function getAttempts(qualificationId: string, unitCode: string): QuizResult[] {
  return attemptStore[attemptKey(qualificationId, unitCode)] || [];
}

export function recordAttempt(qualificationId: string, unitCode: string, result: QuizResult): void {
  const key = attemptKey(qualificationId, unitCode);
  if (!attemptStore[key]) attemptStore[key] = [];
  attemptStore[key].push(result);
}

export function canAttempt(qualificationId: string, unitCode: string): boolean {
  const config = getQuizConfig(qualificationId, unitCode);
  if (config.maxAttempts === 0) return true; // unlimited
  return getAttempts(qualificationId, unitCode).length < config.maxAttempts;
}
