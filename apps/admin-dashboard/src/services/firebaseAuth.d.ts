/**
 * AQUORA Firebase Authentication Service
 * Implements Google Identity Toolkit REST Client for Firebase Web Authentication.
 * Zero heavy dependencies, fast, persistent, and secure.
 */
export interface FirebaseUser {
    uid: string;
    email: string;
    displayName?: string;
    idToken: string;
    refreshToken?: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'TECHNICIAN';
}
declare class FirebaseAuthService {
    private apiKey;
    private authDomain;
    private projectId;
    private currentUser;
    private listeners;
    constructor();
    isConfigured(): boolean;
    private restoreSession;
    private notify;
    onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void;
    getCurrentUser(): FirebaseUser | null;
    /**
     * Sign In with Firebase Email & Password
     */
    signIn(email: string, password: string): Promise<FirebaseUser>;
    signOut(): Promise<void>;
    private friendlyErrorMessage;
}
export declare const firebaseAuth: FirebaseAuthService;
export {};
