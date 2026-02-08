import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../auth';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    email: string | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Function to ensure user exists in MongoDB and has default tags
        const syncUserWithBackend = async (userEmail: string) => {
            try {
                await fetch('http://localhost:8000/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userEmail })
                });
                console.log('User synced with backend successfully');
            } catch (error) {
                console.error('Failed to sync user with backend:', error);
            }
        };

        // Get initial session
        const initializeAuth = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                setSession(initialSession);
                setUser(initialSession?.user ?? null);
                const userEmail = initialSession?.user?.email ?? null;
                setEmail(userEmail);

                if (userEmail) {
                    await syncUserWithBackend(userEmail);
                }
            } catch (error) {
                console.error('Error fetching session:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, currentSession: Session | null) => {
                console.log('Auth state changed:', event);
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                const userEmail = currentSession?.user?.email ?? null;
                setEmail(userEmail);
                setLoading(false);

                if (event === 'SIGNED_IN' && userEmail) {
                    await syncUserWithBackend(userEmail);
                }

                // Redirect to login after sign out
                if (event === 'SIGNED_OUT') {
                    window.location.href = '/login';
                }
            }
        );

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const value: AuthContextType = {
        session,
        user,
        email,
        loading,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
