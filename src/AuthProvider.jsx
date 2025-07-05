import React, { useState, useEffect, createContext } from 'react';
import { QueryClient } from '@tanstack/react-query';
import pb from './pocketbase';

const queryClient = new QueryClient();
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = pb.authStore.onChange(() => {
            setUser(pb.authStore.model);
            setToken(pb.authStore.token);
            setIsLoading(false);
        }, true);
        if (pb.authStore.isValid && pb.authStore.token && pb.authStore.model) {
            setUser(pb.authStore.model);
            setToken(pb.authStore.token);
            setIsLoading(false);
        } else {
            pb.authStore.clear();
            setUser(null);
            setToken(null);
            setIsLoading(false);
        }
        return () => {
            unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        const authData = await pb.collection('users').authWithPassword(email, password);
        queryClient.invalidateQueries();
        return authData.record;
    };

    const register = async (email, password) => {
        const userRecord = await pb.collection('users').create({
            email,
            password,
            passwordConfirm: password,
            username: email.split('@')[0],
        });
        await pb.collection('users').authWithPassword(email, password);
        return userRecord;
    };

    const logout = () => {
        pb.authStore.clear();
        queryClient.clear();
        window.location.reload();
    };

    const requestPasswordReset = async (email) => {
        await pb.collection('users').requestPasswordReset(email);
        return true;
    };

    const requestEmailVerification = async (email) => {
        await pb.collection('users').requestVerification(email);
        return true;
    };

    const loginWithGoogle = async () => {
        const redirectUrl = window.location.origin + "/auth/callback";
        window.location.href = `${import.meta.env.VITE_POCKETBASE_URL.replace(/\/$/, '')}/api/oauth2/auth/google?redirect_url=${encodeURIComponent(redirectUrl)}`;
    };

    const authContextValue = {
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        requestPasswordReset,
        requestEmailVerification,
        loginWithGoogle,
        pb
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <p className="text-xl">Loading authentication...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };
