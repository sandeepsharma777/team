import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { BookmarksProvider } from './context/BookmarksContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CreateTeamModal } from './components/CreateTeamModal';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { MyTeamsPage } from './pages/MyTeamsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { Shield } from 'lucide-react';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function AdminRoute() {
  const { currentProfile, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#22e873] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">Verifying organizer credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated || currentProfile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <AdminPage />;
}

function ProfileRoute() {
  const { currentProfile, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#22e873] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">Loading profile...</p>
      </div>
    );
  }

  if (!isAuthenticated || !currentProfile) {
    return <Navigate to="/" replace />;
  }

  return <ProfilePage profileId={currentProfile.id} />;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [createTeamInitialOppId, setCreateTeamInitialOppId] = useState<string | undefined>();

  const handleOpenCreateTeam = (initialOppId?: string) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setCreateTeamInitialOppId(initialOppId);
    setIsCreateTeamModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans antialiased selection:bg-[#22e873] selection:text-black relative overflow-x-hidden">
      <ScrollToTop />

      {/* AMBIENT BACKGROUND GLOW MATCHING UPLOADED SCREENSHOT */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Neon Green Ambient Orb */}
        <div
          className="absolute -top-[10%] right-[10%] w-[650px] h-[650px] rounded-full opacity-35 blur-[130px]"
          style={{
            background: 'radial-gradient(circle, #22e873 0%, rgba(34, 232, 115, 0.4) 40%, transparent 70%)',
          }}
        />
        {/* Ocean Blue / Cyan Ambient Orb */}
        <div
          className="absolute top-[5%] right-[-5%] w-[550px] h-[550px] rounded-full opacity-30 blur-[140px]"
          style={{
            background: 'radial-gradient(circle, #0077ff 0%, #00d2ff 45%, transparent 75%)',
          }}
        />
        {/* Subtle Bottom Glow */}
        <div
          className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full opacity-15 blur-[160px]"
          style={{
            background: 'radial-gradient(circle, #22e873 0%, transparent 70%)',
          }}
        />
      </div>

      {/* NAVBAR */}
      <Navbar
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenCreateTeam={() => handleOpenCreateTeam()}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onOpenCreateTeam={() => handleOpenCreateTeam()}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/discover"
            element={
              <DiscoverPage
                onOpenCreateTeam={() => handleOpenCreateTeam()}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/opportunities"
            element={
              <OpportunitiesPage
                onOpenCreateTeam={handleOpenCreateTeam}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/opportunities/:opportunityId"
            element={
              <OpportunityDetailPage
                onOpenCreateTeam={(oppId) => handleOpenCreateTeam(oppId)}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/teams/:teamId"
            element={<TeamDetailPage onOpenAuth={() => setIsAuthModalOpen(true)} />}
          />
          <Route
            path="/my-teams"
            element={
              <MyTeamsPage
                onOpenCreateTeam={() => handleOpenCreateTeam()}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            }
          />
          <Route path="/profile" element={<ProfileRoute />} />
          <Route
            path="/profile/:profileId"
            element={<ProfilePage onOpenAuth={() => setIsAuthModalOpen(true)} />}
          />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <Footer />

      {/* GLOBAL MODALS */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <CreateTeamModal
        isOpen={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        initialOpportunityId={createTeamInitialOppId}
        onTeamCreated={(team) => {
          setIsCreateTeamModalOpen(false);
          navigate(`/teams/${team.id}`);
        }}
      />
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <BookmarksProvider>
            <AppContent />
          </BookmarksProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
