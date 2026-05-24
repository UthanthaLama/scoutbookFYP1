import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Landing from './components/Landing';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Login from './components/Login';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import AuthCallback from './components/AuthCallback';
import RoleSelection from './components/RoleSelection';
import ForgotPassword from './components/ForgotPassword';
import ProfileEdit from './components/ProfileEdit';
import ProfileView from './components/ProfileView';
import PostOpportunity from './components/PostOpportunity';
import EditOpportunity from './components/EditOpportunity';
import SearchPlayers from './components/SearchPlayers';
import SearchScouts from './components/SearchScouts';
import Leaderboard from './components/Leaderboard';
import Opportunities from './components/Opportunities';
import OpportunityDetail from './components/OpportunityDetail';
import ManageOpportunities from './components/ManageOpportunities';
import Tournaments from './components/Tournaments';
import CreateTournament from './components/CreateTournament';
import TournamentDetail from './components/TournamentDetail';
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import AdminOpportunities from './components/AdminOpportunities';
import AdminTournaments from './components/AdminTournaments';
import Messages from './components/Messages';
import ConversationView from './components/ConversationView';
import PaymentCallback from './components/PaymentCallback';
import VerifyEmail from './components/VerifyEmail';
import { authAPI } from './services/api';
import './styles/global.css';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLandingPage = location.pathname === '/' && !user;
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const token = localStorage.getItem('sb_token');
    const userData = localStorage.getItem('sb_user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('sb_token');
        localStorage.removeItem('sb_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('sb_token');
      localStorage.removeItem('sb_user');
      setUser(null);
      navigate('/');
    }
  };

  const updateUserData = (profileData) => {
    const updatedUser = {
      ...user,
      name: profileData.full_name || user.name,
      profile_picture: profileData.profile_picture || user.profile_picture
    };
    setUser(updatedUser);
    localStorage.setItem('sb_user', JSON.stringify(updatedUser));
  };

  const getDisplayPicture = () => {
    return user?.profile_picture;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      {user && !isAdminPage && (
        <header className="site-header">
          <div className="header-inner">
            <Link to="/dashboard" className="brand">
              <span className="material-icons brand-icon">sports_cricket</span>
              <span className="brand-name">ScoutBook</span>
            </Link>
            
            <nav className="main-nav">
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                <span className="material-icons nav-icon">dashboard</span>
                Home
              </Link>
              {user.role === 'scout' && (
                <>
                  <Link to="/search-players" className={`nav-link ${location.pathname === '/search-players' ? 'active' : ''}`}>
                    <span className="material-icons nav-icon">search</span>
                    Players
                  </Link>
                  <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
                    <span className="material-icons nav-icon">person</span>
                    Profile
                  </Link>
                  <Link to="/opportunities/manage" className={`nav-link ${location.pathname === '/opportunities/manage' ? 'active' : ''}`}>
                    <span className="material-icons nav-icon">work</span>
                    My Posts
                  </Link>
                </>
              )}
              {user.role === 'player' && (
                <>
                  <Link to="/opportunities" className={`nav-link ${location.pathname === '/opportunities' ? 'active' : ''}`}>
                    <span className="material-icons nav-icon">work</span>
                    Opportunities
                  </Link>
                  <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
                    <span className="material-icons nav-icon">person</span>
                    Profile
                  </Link>
                </>
              )}
              <Link to="/tournaments" className={`nav-link ${location.pathname === '/tournaments' ? 'active' : ''}`}>
                <span className="material-icons nav-icon">emoji_events</span>
                Tournaments
              </Link>
              <Link to="/messages" className={`nav-link ${location.pathname.startsWith('/messages') ? 'active' : ''}`}>
                <span className="material-icons nav-icon">message</span>
                Messages
              </Link>
            </nav>
            
            <div className="header-actions">
              <div className="user-profile-box">
                {getDisplayPicture() ? (
                  <img src={getDisplayPicture()} alt={user.name} className="user-avatar" />
                ) : (
                  <div className="user-avatar-placeholder">
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                )}
                <div className="user-details">
                  <div className="user-name">{user.name || user.email.split('@')[0]}</div>
                  <div className="user-role">{user.role}</div>
                </div>
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                <span className="material-icons logout-icon">logout</span>
                Logout
              </button>
            </div>
          </div>
        </header>
      )}
      
      {!user && !isLandingPage && (
        <header className="site-header">
          <div className="header-inner">
            <Link to="/" className="brand">
              <span className="material-icons brand-icon">sports_cricket</span>
              <span className="brand-name">ScoutBook</span>
            </Link>
            <div className="header-actions">
              <Link to="/login" className="btn-header-secondary">Login</Link>
              <Link to="/signin" className="btn-header-primary">Sign Up</Link>
            </div>
          </div>
        </header>
      )}

      <main className={user ? 'main-content-no-header' : 'main-content'}>
        <Routes>
          <Route path="/" element={user ? (user.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />) : <Landing />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={user ? (user.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />) : <Login onLogin={setUser} />} />
          <Route path="/signin" element={user ? (user.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />) : <SignIn onSignup={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail onLogin={setUser} />} />
          <Route path="/auth/callback" element={<AuthCallback onLogin={setUser} />} />
          <Route path="/role-selection" element={<RoleSelection onLogin={setUser} />} />
          <Route 
            path="/dashboard" 
            element={user ? (user.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Dashboard user={user} />) : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <ProfileView user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile/:userId" 
            element={user ? <ProfileView user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile/edit" 
            element={user ? <ProfileEdit user={user} onProfileUpdate={updateUserData} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile/complete" 
            element={user ? <ProfileEdit user={user} onProfileUpdate={updateUserData} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/opportunities" 
            element={user ? <Opportunities user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/opportunities/create" 
            element={user?.role === 'scout' ? <PostOpportunity user={user} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/opportunities/:id/edit" 
            element={user?.role === 'scout' ? <EditOpportunity user={user} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/opportunities/manage" 
            element={user?.role === 'scout' ? <ManageOpportunities user={user} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/opportunities/:id" 
            element={user ? <OpportunityDetail user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/search-players" 
            element={user?.role === 'scout' ? <SearchPlayers user={user} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/search-scouts" 
            element={user?.role === 'player' ? <SearchScouts user={user} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/leaderboard" 
            element={user ? <Leaderboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/tournaments" 
            element={user ? <Tournaments user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/tournaments/create" 
            element={user ? <CreateTournament user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/tournaments/:id" 
            element={user ? <TournamentDetail user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/dashboard" 
            element={user?.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/admin/users" 
            element={user?.role === 'admin' ? <AdminUsers user={user} onLogout={handleLogout} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/admin/opportunities" 
            element={user?.role === 'admin' ? <AdminOpportunities user={user} onLogout={handleLogout} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/admin/tournaments" 
            element={user?.role === 'admin' ? <AdminTournaments user={user} onLogout={handleLogout} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/messages" 
            element={user ? <Messages user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/messages/:id" 
            element={user ? <ConversationView user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/payment/khalti/callback" 
            element={user ? <PaymentCallback /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/payment/esewa/success" 
            element={user ? <PaymentCallback /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/payment/esewa/failure" 
            element={user ? <PaymentCallback /> : <Navigate to="/login" />} 
          />
        </Routes>
      </main>
    </div>
  );
}
