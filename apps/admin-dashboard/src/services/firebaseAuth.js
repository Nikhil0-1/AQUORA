/**
 * AQUORA Firebase Authentication Service
 * Implements Google Identity Toolkit REST Client for Firebase Web Authentication.
 * Zero heavy dependencies, fast, persistent, and secure.
 */
const STORAGE_KEY = 'aquora_admin_auth';
class FirebaseAuthService {
    apiKey;
    authDomain;
    projectId;
    currentUser = null;
    listeners = [];
    constructor() {
        this.apiKey = import.meta.env?.VITE_FIREBASE_API_KEY || 'AIzaSyC7JLagW2qQM8ORNrJ3R6cYWoV7SfoUP04';
        this.authDomain = import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || 'aquora-e7eb0.firebaseapp.com';
        this.projectId = import.meta.env?.VITE_FIREBASE_PROJECT_ID || 'aquora-e7eb0';
        // Restore cached session from localStorage if valid
        this.restoreSession();
    }
    isConfigured() {
        return Boolean(this.apiKey &&
            !this.apiKey.startsWith('YOUR_') &&
            !this.apiKey.startsWith('AIzaSy_placeholder'));
    }
    restoreSession() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.currentUser = JSON.parse(stored);
            }
        }
        catch (e) {
            console.warn('Failed to restore auth session:', e);
            localStorage.removeItem(STORAGE_KEY);
        }
    }
    notify() {
        for (const listener of this.listeners) {
            listener(this.currentUser);
        }
    }
    onAuthStateChanged(callback) {
        this.listeners.push(callback);
        callback(this.currentUser);
        return () => {
            this.listeners = this.listeners.filter((cb) => cb !== callback);
        };
    }
    getCurrentUser() {
        return this.currentUser;
    }
    /**
     * Sign In with Firebase Email & Password
     */
    async signIn(email, password) {
        if (!this.isConfigured()) {
            // Graceful local admin login when Firebase keys are pending configuration
            const fallbackUser = {
                uid: `dev-admin-${Date.now()}`,
                email,
                displayName: email.split('@')[0],
                idToken: `mock-token-${Date.now()}`,
                role: email.includes('super') ? 'SUPER_ADMIN' : 'ADMIN',
            };
            this.currentUser = fallbackUser;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
            this.notify();
            return fallbackUser;
        }
        const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                returnSecureToken: true,
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            const msg = data.error?.message || 'Authentication failed';
            throw new Error(this.friendlyErrorMessage(msg));
        }
        // Role mapping
        const role = email.includes('super') || email.includes('nikhil')
            ? 'SUPER_ADMIN'
            : email.includes('operator')
                ? 'OPERATOR'
                : email.includes('tech')
                    ? 'TECHNICIAN'
                    : 'ADMIN';
        const user = {
            uid: data.localId,
            email: data.email,
            displayName: data.displayName || data.email.split('@')[0],
            idToken: data.idToken,
            refreshToken: data.refreshToken,
            role,
        };
        this.currentUser = user;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.notify();
        return user;
    }
    async signOut() {
        this.currentUser = null;
        localStorage.removeItem(STORAGE_KEY);
        this.notify();
    }
    friendlyErrorMessage(code) {
        switch (code) {
            case 'EMAIL_NOT_FOUND':
                return 'No admin account found with this email address.';
            case 'INVALID_PASSWORD':
                return 'Invalid password entered.';
            case 'USER_DISABLED':
                return 'This admin account has been disabled.';
            case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                return 'Access to this account has been temporarily disabled due to many failed login attempts.';
            default:
                return code.replace(/_/g, ' ');
        }
    }
}
export const firebaseAuth = new FirebaseAuthService();
