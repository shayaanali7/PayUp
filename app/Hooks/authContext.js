import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Alert, AppState } from 'react-native';

const AuthContext = createContext();

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}   

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSession(session);
                checkHasCompletedProfile(session.user.id);
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session) {
                    setSession(session);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);
    const user = session?.user || null;
    const userMetadata = user?.user_metadata || {};

    const checkHasCompletedProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('profile_is_completed')
                .eq('id', userId)
                .single();
            if (data) {
                setHasCompletedProfile(data.profile_is_completed || false);
                return;
            }
        } catch (error) {
            console.error('Error checking profile completion:', error);
            setHasCompletedProfile(false);
        }
    }

    const completeProfile = async () => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ profile_is_completed: true })
                .eq('id', user.id);
            if (!error) {
                setHasCompletedProfile(true);
            }
        } catch (error) {
            console.error('Error completing profile:', error);
        }
    }

    const signIn = async (credentials) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password,
            })

            if (error) {
                Alert.alert('Error', error.message);
                setLoading(false);
                return { error };
            }

            return { data };
        } catch (error) {
            console.error('SignIn Error:', error);
            setLoading(false);
            throw error;
        }
    };

    const signUp = async (userData) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
            });

            if (error) {
                Alert.alert('Error', error.message);
                setLoading(false);
                return { error };
            }

            if (!data.session) {
                Alert.alert('Please check your email to confirm your account.');
            }

            setLoading(false);
            return { data };
        } catch (error) {
            console.error('SignUp Error:', error);
            setLoading(false);
            throw error;
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('SignOut Error:', error);
            }
            setSession(null);
        } catch (error) {
            console.error('SignOut Error:', error);
        } finally {
            setLoading(false);
        }
        };
    
    return (
        <AuthContext.Provider value={{
            user,
            userMetadata,
            session,
            loading,    
            signIn,
            signUp,
            signOut,
            isAuthenticated: !!user,
            hasCompletedProfile,
            completeProfile,
        }}>
            {children}
        </AuthContext.Provider>
    )
}


export default AuthContext;