import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useState, useEffect, Suspense, lazy } from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";

// shared
import TopBar from "./components/TopBar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import LoadingSpinner from "./components/LoadingSpinner";

// layouts
import TrainerLayout from "./components/trainer/TrainerLayout";
import LearnerLayout from "./components/learner/LearnerLayout";
import IQALayout from "./components/iqa/IQALayout";
import AdminLayout from "./components/admin/AdminLayout";

// public pages
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Qualifications = lazy(() => import("./pages/Qualifications"));
const QualificationDetail = lazy(() => import("./pages/QualificationDetail"));
const Recruitment = lazy(() => import("./pages/Recruitment"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Checkout = lazy(() => import("./pages/Checkout"));
const EnrollmentConfirmation = lazy(
  () => import("./pages/EnrollmentConfirmation"),
);
const NotFound = lazy(() => import("./pages/NotFound"));
const StaffLogin = lazy(() => import("./pages/StaffLogin"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));

// learner dashboard
const Dashboard = lazy(() => import("./pages/learner/Dashboard"));
const QualificationView = lazy(
  () => import("./pages/learner/QualificationView"),
);
const MyQualifications = lazy(() => import("./pages/learner/MyQualifications"));
const UnitDetail = lazy(() => import("./pages/learner/UnitDetail"));
const Profile = lazy(() => import("./pages/learner/Profile"));
const ChangePassword = lazy(() => import("./pages/learner/ChangePassword"));

// trainer dashboard
const TrainerDashboard = lazy(() => import("./pages/trainer/Dashboard"));
const AssessmentReview = lazy(() => import("./pages/trainer/AssessmentReview"));
const AssignedLearners = lazy(() => import("./pages/trainer/AssignedLearners"));
const AssessmentHistory = lazy(
  () => import("./pages/trainer/AssessmentHistory"),
);
const AssessmentRecord = lazy(() => import("./pages/trainer/AssessmentRecord"));
const LearnerDetail = lazy(() => import("./pages/trainer/LearnerDetail"));
const UnitManagement = lazy(() => import("./pages/trainer/UnitManagement"));
const QuestionBank = lazy(() => import("./pages/trainer/QuestionBank"));
const QuestionBankEditor = lazy(
  () => import("./pages/trainer/QuestionBankEditor"),
);

// admin dashboard
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const QualificationManagement = lazy(
  () => import("./pages/admin/QualificationManagement"),
);
const LearnerManagement = lazy(() => import("./pages/admin/LearnerManagement"));
const TrainerManagement = lazy(() => import("./pages/admin/TrainerManagement"));
const ProgressMonitoring = lazy(
  () => import("./pages/admin/ProgressMonitoring"),
);
const Reports = lazy(() => import("./pages/admin/Reports"));
const PageManagement = lazy(() => import("./pages/admin/PageManagement"));
const PageEditor = lazy(() => import("./pages/admin/PageEditor"));
const AdminQuestionBank = lazy(() => import("./pages/admin/AdminQuestionBank"));
const AdminQuestionBankEditor = lazy(
  () => import("./pages/admin/AdminQuestionBankEditor"),
);
const FinalAssessments = lazy(() => import("./pages/admin/FinalAssessments"));
const EQAExport = lazy(() => import("./pages/admin/EQAExport"));
const AdminQualificationDetail = lazy(
  () => import("./pages/admin/QualificationDetail"),
);
const IQAManagement = lazy(() => import("./pages/admin/IQAManagement"));
const ChecklistBuilder = lazy(() => import("./pages/admin/ChecklistBuilder"));

// iqa dashboard
const IQADashboard = lazy(() => import("./pages/iqa/Dashboard"));
const SamplingQueue = lazy(() => import("./pages/iqa/SamplingQueue"));
const IQAAssessmentReview = lazy(() => import("./pages/iqa/AssessmentReview"));
const TrainerPerformance = lazy(() => import("./pages/iqa/TrainerPerformance"));
const IQAReports = lazy(() => import("./pages/iqa/Reports"));
const SamplingSettings = lazy(() => import("./pages/iqa/SamplingSettings"));
const VerificationChecklists = lazy(
  () => import("./pages/iqa/VerificationChecklists"),
);
const QualificationTreeView = lazy(
  () => import("./pages/iqa/QualificationTreeView"),
);

const queryClient = new QueryClient();

const App = () => {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const minTimer = new Promise((res) => setTimeout(res, 2000));
    const contentLoaded = new Promise((res) => {
      if (document.readyState === "complete") return res(true);
      window.addEventListener("load", () => res(true), { once: true });
    });

    Promise.all([minTimer, contentLoaded]).then(() => setShowLoading(false));
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <CartProvider>
            <BrowserRouter>
              <AuthProvider>
                {showLoading && <LoadingSpinner />}
                <Toaster />
                <Sonner />
                <ScrollToTop />
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/staff-login" element={<StaffLogin />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route
                      path="/enrollment-confirmation"
                      element={<EnrollmentConfirmation />}
                    />
                    <Route path="/learner" element={<LearnerLayout />}>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route
                        path="qualifications"
                        element={<MyQualifications />}
                      />
                      <Route path="profile" element={<Profile />} />
                      <Route
                        path="change-password"
                        element={<ChangePassword />}
                      />
                      <Route
                        path="qualification/:id"
                        element={<QualificationView />}
                      />
                      <Route
                        path="qualification/:qualificationId/unit/:unitId"
                        element={<UnitDetail />}
                      />
                    </Route>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route
                        path="qualifications"
                        element={<QualificationManagement />}
                      />
                      <Route
                        path="qualifications/:qualificationId"
                        element={<AdminQualificationDetail />}
                      />
                      <Route path="learners" element={<LearnerManagement />} />
                      <Route path="trainers" element={<TrainerManagement />} />
                      <Route path="progress" element={<ProgressMonitoring />} />
                      <Route path="reports" element={<Reports />} />
                      <Route
                        path="question-bank"
                        element={<AdminQuestionBank />}
                      />
                      <Route
                        path="question-bank/:qualificationId/:unitCode"
                        element={<AdminQuestionBankEditor />}
                      />
                      <Route
                        path="final-assessments"
                        element={<FinalAssessments />}
                      />
                      <Route path="eqa-export" element={<EQAExport />} />
                      <Route path="iqa" element={<IQAManagement />} />
                      <Route path="checklists" element={<ChecklistBuilder />} />
                      <Route path="pages" element={<PageManagement />} />
                      <Route path="pages/:pageId" element={<PageEditor />} />
                    </Route>
                    <Route path="/iqa" element={<IQALayout />}>
                      <Route path="dashboard" element={<IQADashboard />} />
                      <Route
                        path="qualifications"
                        element={<QualificationTreeView />}
                      />
                      <Route path="sampling" element={<SamplingQueue />} />
                      <Route
                        path="review/:id"
                        element={<IQAAssessmentReview />}
                      />
                      <Route path="trainers" element={<TrainerPerformance />} />
                      <Route path="reports" element={<IQAReports />} />
                      <Route path="settings" element={<SamplingSettings />} />
                      <Route
                        path="checklists"
                        element={<VerificationChecklists />}
                      />
                    </Route>
                    <Route path="/trainer" element={<TrainerLayout />}>
                      <Route path="dashboard" element={<TrainerDashboard />} />
                      <Route path="learners" element={<AssignedLearners />} />
                      <Route path="learner/:id" element={<LearnerDetail />} />
                      <Route path="history" element={<AssessmentHistory />} />
                      <Route path="review/:id" element={<AssessmentReview />} />
                      <Route path="record/:id" element={<AssessmentRecord />} />
                      <Route
                        path="learner/:learnerId/unit/:unitCode"
                        element={<UnitManagement />}
                      />
                      <Route path="question-bank" element={<QuestionBank />} />
                      <Route
                        path="question-bank/:qualificationId/:unitCode"
                        element={<QuestionBankEditor />}
                      />
                    </Route>
                    <Route
                      path="*"
                      element={
                        <>
                          <TopBar />
                          <Header />
                          <main
                            className="min-h-screen"
                            style={{ marginTop: 108 }}
                          >
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/about" element={<About />} />
                              <Route
                                path="/qualifications"
                                element={<Qualifications />}
                              />
                              <Route
                                path="/qualifications/:slug"
                                element={<QualificationDetail />}
                              />
                              <Route
                                path="/recruitment"
                                element={<Recruitment />}
                              />
                              <Route path="/blog" element={<Blog />} />
                              <Route path="/blog/:id" element={<BlogDetail />} />
                              <Route path="/contact" element={<Contact />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </main>
                          <Footer />
                        </>
                      }
                    />
                  </Routes>
                </Suspense>
              </AuthProvider>
            </BrowserRouter>
          </CartProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
