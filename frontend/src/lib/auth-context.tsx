'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchProfile = useCallback(async (userId: string) => {
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        setProfile(data);
    }, [supabase]);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) await fetchProfile(user.id);
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                if (currentUser) {
                    await fetchProfile(currentUser.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase, fetchProfile]);

    const signIn = async (email: string, password: string) => {
        const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        // Fetch profile and set role cookie for fast middleware
        if (authData.user) {
            const { data: prof } = await supabase.from('users').select('role').eq('id', authData.user.id).single();
            if (prof?.role) {
                document.cookie = `user_role=${prof.role};path=/;max-age=${60 * 60 * 24};samesite=lax`;
            }
        }
        return { error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        document.cookie = 'user_role=;path=/;max-age=0';
        setUser(null);
        setProfile(null);
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
