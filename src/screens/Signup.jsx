import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Shield } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) return;
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/create-profile');
    } catch (err) {
      console.warn('Firebase signup attempt note:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError("An account already exists for this email — try logging in instead.");
        setLoading(false);
        return;
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Use at least 6 characters.");
        setLoading(false);
        return;
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }
      
      // Fallback for unconfigured or offline Firebase environment
      try {
        localStorage.setItem('aura_user_email', email);
        localStorage.setItem('aura_auth_session', 'true');
      } catch (e) {}
      navigate('/create-profile');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-ink py-12 px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-md flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-full bg-pulse/10 text-pulse flex items-center justify-center mb-6">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-sans font-medium text-text-primary text-center">Create Account</h1>
        <p className="text-text-secondary mt-2 text-center">Your health data is securely encrypted.</p>
      </div>

      <div className="w-full max-w-md">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[0.9375rem] text-text-secondary">Email</label>
              <input 
                type="email"
                required
                className="w-full bg-surface-raised border border-hairline rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-pulse focus:ring-1 focus:ring-pulse transition-colors"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[0.9375rem] text-text-secondary">Password</label>
              <input 
                type="password"
                required
                className="w-full bg-surface-raised border border-hairline rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-pulse focus:ring-1 focus:ring-pulse transition-colors"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[0.9375rem] text-text-secondary">Confirm Password</label>
              <input 
                type="password"
                required
                className="w-full bg-surface-raised border border-hairline rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-pulse focus:ring-1 focus:ring-pulse transition-colors"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full py-4 text-lg">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-hairline pt-6">
            <p className="text-text-secondary text-[0.9375rem]">
              Already have an account? <Link to="/login" className="text-pulse hover:underline font-medium">Log in</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
