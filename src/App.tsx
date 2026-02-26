import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useState, useEffect } from "react";
import TopBar from "./components/TopBar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import About from "./pages/About";
import Qualifications from "./pages/Qualifications";
import QualificationDetail from "./pages/QualificationDetail";
import Recruitment from "./pages/Recruitment";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Checkout from "./pages/Checkout";
import EnrollmentConfirmation from "./pages/EnrollmentConfirmation";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import LoadingSpinner from "./components/LoadingSpinner";
import LearnerLayout from "./components/learner/LearnerLayout";
import Dashboard from "./pages/learner/Dashboard";
import QualificationView from "./pages/learner/QualificationView";
import MyQualifications from "./pages/learner/MyQualifications";
import UnitDetail from "./pages/learner/UnitDetail";
import Profile from "./pages/learner/Profile";
import ChangePassword from "./pages/learner/ChangePassword";

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <AuthProvider>
            {showLoading && <LoadingSpinner />}
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/enrollment-confirmation" element={<EnrollmentConfirmation />} />
                <Route path="/learner" element={<LearnerLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="qualifications" element={<MyQualifications />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="change-password" element={<ChangePassword />} />
                  <Route path="qualification/:id" element={<QualificationView />} />
                  <Route path="qualification/:qualificationId/unit/:unitId" element={<UnitDetail />} />
                </Route>
                <Route path="*" element={
                  <>
                    <TopBar />
                    <Header />
                    <main className="min-h-screen" style={{ marginTop: 108 }}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/qualifications" element={<Qualifications />} />
                        <Route path="/qualifications/:slug" element={<QualificationDetail />} />
                        <Route path="/recruitment" element={<Recruitment />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                } />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
