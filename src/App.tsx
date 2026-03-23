import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import RequireAdmin from "@/components/RequireAdmin";
import Index from "./pages/Index.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Account from "./pages/Account.tsx";
import Pricing from "./pages/Pricing.tsx";
import Support from "./pages/Support.tsx";
import Admin from "./pages/Admin.tsx";
import Settings from "./pages/Settings.tsx";
import Sales from "./pages/Sales.tsx";
import ContactSales from "./pages/ContactSales.tsx";
import Finance from "./pages/Finance.tsx";
import SearchHistory from "./pages/SearchHistory.tsx";
import Explore from "./pages/Explore.tsx";
import Saved from "./pages/Saved.tsx";
import TripPlanner from "./pages/TripPlanner.tsx";
import Chat from "./pages/Chat.tsx";
import Profile from "./pages/Profile.tsx";
import EditProfile from "./pages/EditProfile.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          {/* Skip link for keyboard a11y */}
          <a href="#main-content" className="skip-link">Skip to content</a>
          <Navbar />
          <main id="main-content">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/account" element={<Account />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/support" element={<Support />} />
              <Route path="/contact-sales" element={<ContactSales />} />
              <Route path="/search-history" element={<SearchHistory />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/trips" element={<TripPlanner />} />
              <Route path="/chat" element={<Chat />} />
              {/* Admin-only routes */}
              <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
              <Route path="/settings" element={<RequireAdmin><Settings /></RequireAdmin>} />
              <Route path="/sales" element={<RequireAdmin><Sales /></RequireAdmin>} />
              <Route path="/finance" element={<RequireAdmin><Finance /></RequireAdmin>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
