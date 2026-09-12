import React, { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../../state/SimulationContext';
import { Bell, User, LogOut, HeartPulse, Moon, Wind, Flame, AlertOctagon, Pill, CheckCircle2, Activity, ShieldAlert } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, limit, doc, updateDoc } from 'firebase/firestore';

export function TopBar() {
  const { userProfile, disasterMode, uid } = useSimulation();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notifRef = useRef();
  const profileRef = useRef();

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'users', uid, 'notifications'), orderBy('timestamp', 'desc'), limit(20));
    const unsub = onSnapshot(q, snap => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });
    return unsub;
  }, [uid]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const markAllRead = async () => {
    if (!uid) return;
    notifications.filter(n => !n.read).forEach(n => {
      updateDoc(doc(db, 'users', uid, 'notifications', n.id), { read: true }).catch(console.error);
    });
  };

  const handleNotifClick = async (n) => {
    if (!n.read && uid) {
      await updateDoc(doc(db, 'users', uid, 'notifications', n.id), { read: true });
    }
    setShowNotifs(false);
    if (n.linkTo) navigate(n.linkTo);
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'medication': return <Pill className="w-4 h-4 text-pulse" />;
      case 'early_prediction': return <Activity className="w-4 h-4 text-caution" />;
      case 'risk': return <AlertOctagon className="w-4 h-4 text-danger" />;
      case 'emergency': return <ShieldAlert className="w-4 h-4 text-danger" />;
      default: return <Bell className="w-4 h-4 text-text-secondary" />;
    }
  };

  const modeConfig = {
    normal: { label: '🟢 Normal', color: 'bg-safe/20 text-safe' },
    heatwave: { label: '☀️ Heatwave', color: 'bg-danger/20 text-danger' },
    pollution: { label: '🌫️ Pollution', color: 'bg-caution/20 text-caution' },
    flood: { label: '🌊 Flood', color: 'bg-pulse/20 text-pulse' },
    cyclone: { label: '🌀 Cyclone', color: 'bg-pulse/20 text-pulse' }
  };

  const activeMode = modeConfig[disasterMode] || modeConfig.normal;

  return (
    <div className="h-14 flex items-center justify-between px-4 border-b border-hairline bg-surface shrink-0 relative z-30">
      <div className="flex items-center">
        <h1 className="text-[1.125rem] font-sans font-medium text-text-primary">
          AURA-X
        </h1>
      </div>
      
      <div className="flex items-center gap-2 relative">
        <Link to="/context" className={`px-3 py-1 mr-1 rounded-[999px] text-[0.6875rem] font-bold tracking-wide transition-colors ${activeMode.color}`}>
          {activeMode.label}
        </Link>
        
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className={`p-1.5 transition-colors relative rounded-full ${showNotifs ? 'bg-surface-raised text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pulse rounded-full"></span>
            )}
          </button>
          
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-surface border border-hairline rounded-xl shadow-2xl z-50 flex flex-col">
              <div className="p-3 border-b border-hairline flex justify-between items-center sticky top-0 bg-surface z-10">
                <span className="font-medium text-text-primary">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-pulse hover:underline">Mark all as read</button>
                )}
              </div>
              <div className="flex-1">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-text-secondary text-sm">You're all caught up</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotifClick(n)}
                      className={`p-3 border-b border-hairline last:border-b-0 cursor-pointer hover:bg-surface-raised transition-colors flex gap-3 items-start ${!n.read ? 'bg-pulse/5' : ''}`}
                    >
                      <div className="mt-0.5 shrink-0 bg-surface-raised p-1.5 rounded-full">{getNotifIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm ${!n.read ? 'font-medium text-text-primary' : 'text-text-primary'}`}>{n.title}</div>
                        <div className={`text-xs truncate ${!n.read ? 'text-text-primary' : 'text-text-secondary'}`}>{n.body}</div>
                        <div className="text-[0.65rem] text-text-secondary mt-1">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-pulse shrink-0 mt-1.5"></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${showProfile || location.pathname === '/profile' ? 'bg-pulse/20 text-pulse border border-pulse/30' : 'text-text-secondary hover:text-text-primary bg-surface-raised border border-hairline'}`}
          >
            <User className="w-5 h-5" />
          </button>
          
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-hairline rounded-xl shadow-2xl z-50 py-2">
              <div className="px-4 py-2 border-b border-hairline mb-2">
                <div className="text-sm font-medium text-text-primary truncate">{userProfile?.name || 'User'}</div>
                <div className="text-xs text-text-secondary truncate">{auth.currentUser?.email}</div>
              </div>
              <Link to="/profile" onClick={() => setShowProfile(false)} className="px-4 py-2 text-sm text-text-primary hover:bg-surface-raised flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" /> Profile Settings
              </Link>
              <div onClick={handleLogout} className="px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2 cursor-pointer transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Waveform border effect */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-hairline via-pulse/30 to-hairline"></div>
    </div>
  );
}
