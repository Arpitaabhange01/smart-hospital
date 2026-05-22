import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/#about' },
  { label: 'Departments', to: '/#departments' },
  { label: 'Doctors', to: '/#doctors' },
  { label: 'Services', to: '/#services' },
  { label: 'Contact', to: '/#contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (to) => {
    setOpen(false);
    if (to.includes('#')) {
      const id = to.split('#')[1];
      if (location.pathname !== '/') { navigate('/'); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 300); }
      else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getDashboardPath = () => {
    const paths = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard', receptionist: '/receptionist/dashboard' };
    return paths[user?.role] || '/';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-card' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-hero-gradient rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className={`font-display font-bold text-lg ${scrolled ? 'text-primary-900' : 'text-white'}`}>
              Smart<span className="text-accent">Hospital</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button key={link.label} onClick={() => handleNavClick(link.to)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary-50 hover:text-primary-700 ${scrolled ? 'text-gray-600' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>
                {link.label}
              </button>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to={getDashboardPath()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors">
                  <User className="w-4 h-4" />
                  {user.name.split(' ')[0]}
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login"
                  className={`px-5 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${scrolled ? 'border-primary-200 text-primary-700 hover:bg-primary-50' : 'border-white/30 text-white hover:bg-white/10'}`}>
                  Login
                </Link>
                <Link to="/register"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-dark transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)}
            className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-gray-600' : 'text-white'}`}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <button key={link.label} onClick={() => handleNavClick(link.to)}
                className="w-full text-left px-4 py-3 rounded-lg text-gray-600 font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors">
                {link.label}
              </button>
            ))}
            <div className="pt-3 border-t border-gray-100 flex gap-3">
              {user ? (
                <>
                  <Link to={getDashboardPath()} onClick={() => setOpen(false)}
                    className="flex-1 text-center px-4 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm font-medium">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="flex-1 text-center px-4 py-2 rounded-xl bg-red-50 text-red-500 text-sm font-medium">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}
                    className="flex-1 text-center px-4 py-2 rounded-xl border border-primary-200 text-primary-700 text-sm font-medium">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)}
                    className="flex-1 text-center px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
