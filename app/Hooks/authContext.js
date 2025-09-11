import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

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
            if (credentials.email === '' && credentials.password === '') {
                const userData = {
                    id: Date.now(),
                    email: credentials.email,
                    name: 'Test User',
                };
                setUser(userData);
                setLoading(false);
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