import React, { createContext, useContext, useState } from 'react';
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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const signIn = async (credentials) => {
        setLoading(true);
        try {
            if (credentials.email && credentials.password) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: credentials.email,
                    password: credentials.password,
                })

                if (error) {
                    Alert.alert('Error', error.message);
                }

                if (data.user) {
                    const userData = {
                        id: Date.now(),
                        email: credentials.email,
                        name: 'Test User',
                    };
                    setUser(userData);
                    setLoading(false);
                }
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            console.error('SignIn Error:', error);
            setLoading(false);
            throw error;
        }
    };

    const signUp = async (userData) => {
        setLoading(true);
        try {
            if (userData.email && userData.password) {
                const { data: { session }, error } = await supabase.auth.signUp({
                    email: userData.email,
                    password: userData.password,
                })

                if (error) {
                    setLoading(false);
                    Alert.alert('Error', error.message);
                }
                console.log(session);
                if (!session) {
                    Alert.alert('Please check your email to confirm your account.')
                }
                setLoading(false);
            }
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