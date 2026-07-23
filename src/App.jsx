import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import LoadingPage from "./components/LoadingPage";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import VerificationCompleted from "./components/VerificationCompleted";
import VerificationFailed from "./components/VerificationFailed";
import CheckYourEmail from "./components/CheckYourEmail";
import Dashboard from "./components/Dashboard";
import Campaign from "./components/Campaign";
import AllCampaigns from "./components/AllCampaigns";
import BrandSettings from "./components/BrandSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsAndConditions from "./components/TermsAndConditions";
import RefundPolicy from "./components/RefundPolicy";
import Scheduler from "./components/Scheduler";

// Thin wrapper so the /campaign route has somewhere to send onBack.
// Campaign.jsx now owns its own internal steps (form -> preview -> success)
// and calls generateCampaign()/submitCampaignRating() itself, so this
// wrapper doesn't need to touch campaignService at all. onBack only fires
// from the form step's Back button and the hidden success page's Back
// button — both just return to Dashboard.
function CampaignPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard");
  };

  return <Campaign onBack={handleBack} />;
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verification-completed" element={<VerificationCompleted />} />
      <Route path="/verification-failed" element={<VerificationFailed />} />
      <Route path="/check-your-email" element={<CheckYourEmail />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/scheduler" element={<Scheduler />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/campaign"
        element={
          <ProtectedRoute>
            <CampaignPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/campaigns"
        element={
          <ProtectedRoute>
            <AllCampaigns />
          </ProtectedRoute>
        }
      />

      <Route
        path="/brand-settings"
        element={
          <ProtectedRoute>
            <BrandSettings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;