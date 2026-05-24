import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/admin-sidebar.css';

export default function AdminSidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      icon: 'dashboard',
      label: 'Dashboard',
      path: '/admin/dashboard'
    },
    {
      icon: 'group',
      label: 'Users',
      path: '/admin/users'
    },
    {
      icon: 'work',
      label: 'Opportunities',
      path: '/admin/opportunities'
    },
    {
      icon: 'emoji_events',
      label: 'Tournaments',
      path: '/admin/tournaments'
    }
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <span className="material-icons admin-sidebar-logo">admin_panel_settings</span>
        <h2>Admin Panel</h2>
      </div>
      
      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`admin-sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="material-icons admin-sidebar-icon">{item.icon}</span>
            <span className="admin-sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-user-info">
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt={user.name} className="admin-user-avatar" />
          ) : (
            <div className="admin-user-avatar-placeholder">
              {(user?.name || user?.email)?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="admin-user-details">
            <div className="admin-user-name">{user?.name || user?.email?.split('@')[0]}</div>
            <div className="admin-user-role">Administrator</div>
          </div>
        </div>
        <button className="admin-logout-btn" onClick={onLogout}>
          <span className="material-icons">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
