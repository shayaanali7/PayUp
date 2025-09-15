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

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSession(session);
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

    const signOut = () => {
        setUser(null);
    }
    
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
        }}>
            {children}
        </AuthContext.Provider>
    )
}


export default AuthContext;