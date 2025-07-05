import React, { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { z } from 'zod';
import PocketBase from 'pocketbase'; // <-- IMPORTANT: Import PocketBase

// Import moved components
import Button from './components/Button';
import Input from './components/Input';
import Label from './components/Label';
import Card from './components/Card';
import CardHeader from './components/CardHeader';
import CardTitle from './components/CardTitle';
import CardDescription from './components/CardDescription';
import CardContent from './components/CardContent';
import CardFooter from './components/CardFooter';
import Checkbox from './components/Checkbox';
import Dialog from './components/Dialog';
import DialogHeader from './components/DialogHeader';
import DialogTitle from './components/DialogTitle';
import DialogDescription from './components/DialogDescription';
import DialogContent from './components/DialogContent';
import DialogFooter from './components/DialogFooter';
import AutoReloadSettings from './components/AutoReloadSettings';
import RegisterFormContent from './components/RegisterFormContent';
import LoginPage from './components/LoginPage';
import PrivateTodosPage from './components/PrivateTodosPage';
import PublicTodosPage from './components/PublicTodosPage';
import GroupTodosPage from './components/GroupTodosPage';

// Initialize QueryClient for Tanstack Query with default refetch intervals
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchInterval: 30000, // Auto-refetch every 30 seconds
            refetchIntervalInBackground: true, // Continue refetching when tab is not active
            refetchOnWindowFocus: true, // Refetch when window regains focus
            staleTime: 10000, // Data is considered stale after 10 seconds
        },
    },
});

// --- Auth Context ---
export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize the real PocketBase client here
    // Use your actual Pocketbase server URL
    const pb = new PocketBase('https://pocketbase-albert.temtem.africa'); // <-- YOUR POCKETBASE URL

    // --- Authentication State Management ---
    // Listen for auth store changes to keep React state in sync
    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = pb.authStore.onChange(() => {
            setUser(pb.authStore.model);
            setToken(pb.authStore.token);
            setIsLoading(false);
            console.log("Pocketbase auth state changed:", pb.authStore.model);
        }, true); // `true` to immediately trigger the callback on mount

        // Attempt to auto-login from stored token on initial load
        if (pb.authStore.isValid && pb.authStore.token && pb.authStore.model) {
            setUser(pb.authStore.model);
            setToken(pb.authStore.token);
            console.log("User found in Pocketbase authStore (valid token):", pb.authStore.model);
            setIsLoading(false);
        } else {
           
            pb.authStore.clear();
            setUser(null);
            setToken(null);
            setIsLoading(false);
            console.log("No valid user token in Pocketbase authStore.");
        }

        return () => {
            unsubscribe(); // Clean up subscription on unmount
        };
    }, []); // Empty dependency array means this runs once on mount

    const login = async (email, password) => {
        try {
            // Use the real PocketBase authWithPassword method
            const authData = await pb.collection('users').authWithPassword(email, password);
            // The `pb.authStore.onChange` listener will automatically update user/token state
            queryClient.invalidateQueries(); // Invalidate all queries to refetch data after login
            return authData.record;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const register = async (email, password) => {
        try {
            // Use the real PocketBase create method for users
            const userRecord = await pb.collection('users').create({
                email,
                password,
                passwordConfirm: password,
                username: email.split('@')[0], // Pocketbase might autogenerate if not provided
            });
            // After successful registration, you might want to immediately log them in
            // This will also trigger the authStore.onChange to update state
            await pb.collection('users').authWithPassword(email, password);
            return userRecord;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const logout = () => {
        pb.authStore.clear(); // Clear PocketBase's auth store
        queryClient.clear(); // Clear all Tanstack Query cache on logout
        // The pb.authStore.onChange listener will update the user/token state to null
        window.location.reload(); // Reload the page after logout
    };

    const requestPasswordReset = async (email) => {
        try {
            // Use the real PocketBase requestPasswordReset method
            await pb.collection('users').requestPasswordReset(email);
            return true;
        } catch (error) {
            console.error("Password reset request failed:", error);
            throw error;
        }
    };

    const requestEmailVerification = async (email) => {
        try {
            // Use the real PocketBase requestVerification method
            await pb.collection('users').requestVerification(email);
            return true;
        } catch (error) {
            console.error("Email verification request failed:", error);
            throw error;
        }
    };

    // Stub for Google login 
    const loginWithGoogle = async () => {
        const redirectUrl = "http://localhost:5173/auth/callback";
        window.location.href = `https://pocketbase-albert.temtem.africa/api/oauth2/auth/google?redirect_url=${encodeURIComponent(redirectUrl)}`;
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
        pb // Expose the PocketBase client for direct use in components
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





// --- Main App Component ---
const App = () => {
    const { user, logout } = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState('privateTodos');

    useEffect(() => {
        if (!user) {
            if (currentPage !== 'login') {
                setCurrentPage('login');
            }
        } else if (currentPage === 'login' || currentPage === 'register') {
            setCurrentPage('privateTodos');
        }
    }, [user, currentPage]);

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter p-0 m-0">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                `}
            </style>
            <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700 dark:text-blue-400">Todo App</h1>

            {user ? (
                <>
                    <div className="w-full max-w-4xl bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row items-center justify-between">
                        <p className="text-lg font-medium mb-2 sm:mb-0">Welcome, {user.username || user.email}!</p>
                        <div className="flex gap-2">
                            <Button
                                variant={currentPage === 'privateTodos' ? 'default' : 'outline'}
                                onClick={() => setCurrentPage('privateTodos')}
                            >
                                Private Todos
                            </Button>
                            <Button
                                variant={currentPage === 'publicTodos' ? 'default' : 'outline'}
                                onClick={() => setCurrentPage('publicTodos')}
                            >
                                Public Todos
                            </Button>
                            <Button
                                variant={currentPage === 'groupTodos' ? 'default' : 'outline'}
                                onClick={() => setCurrentPage('groupTodos')}
                            >
                                Group Todos
                            </Button>
                            <Button variant="secondary" onClick={logout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                    {currentPage === 'privateTodos' && <PrivateTodosPage />}
                    {currentPage === 'publicTodos' && <PublicTodosPage />}
                    {currentPage === 'groupTodos' && <GroupTodosPage />}
                </>
            ) : (
                <LoginPage setPage={setCurrentPage} />
            )}
        </div>
    );
};

export default function ProvidedApp() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <App />
            </AuthProvider>
        </QueryClientProvider>
    );
}

