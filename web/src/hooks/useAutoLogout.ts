import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;
const HEALTH_CHECK_INTERVAL = 60 * 1000;
const MAX_CONSECUTIVE_FAILURES = 3;

const LOGOUT_EVENTS = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart', 'click'];

const useAutoLogout = () => {
  const navigate = useNavigate();
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const healthCheckTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const consecutiveFailures = useRef(0);
  const isLoggingOut = useRef(false);

  const saveCurrentRoute = useCallback(() => {
    const path = window.location.pathname;
    if (path !== '/' && path !== '/login' && path !== '/register' && !path.startsWith('/admin')) {
      localStorage.setItem('saved_route', path);
    }
  }, []);

  const performLogout = useCallback(() => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    saveCurrentRoute();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login', { replace: true });
  }, [navigate, saveCurrentRoute]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(performLogout, INACTIVITY_TIMEOUT);
  }, [performLogout]);

  const checkServerHealth = useCallback(async () => {
    try {
      const response = await api.get('/cors-test');
      if (response.status === 200) {
        consecutiveFailures.current = 0;
      }
    } catch {
      consecutiveFailures.current++;
      if (consecutiveFailures.current >= MAX_CONSECUTIVE_FAILURES) {
        performLogout();
      }
    }
  }, [performLogout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const handleActivity = () => resetInactivityTimer();

    LOGOUT_EVENTS.forEach((event) => window.addEventListener(event, handleActivity));

    resetInactivityTimer();
    healthCheckTimer.current = setInterval(checkServerHealth, HEALTH_CHECK_INTERVAL);

    return () => {
      LOGOUT_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (healthCheckTimer.current) clearInterval(healthCheckTimer.current);
    };
  }, [resetInactivityTimer, checkServerHealth]);
};

export default useAutoLogout;
