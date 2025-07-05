import React, { useContext, useState } from 'react';
import { z } from 'zod';
import { AuthContext } from '../App';
import Button from './Button';
import Label from './Label';
import Input from './Input';
import Card from './Card';
import CardHeader from './CardHeader';
import CardTitle from './CardTitle';
import CardDescription from './CardDescription';
import CardContent from './CardContent';
import CardFooter from './CardFooter';
import Dialog from './Dialog';
import DialogHeader from './DialogHeader';
import DialogTitle from './DialogTitle';
import DialogDescription from './DialogDescription';
import DialogContent from './DialogContent';
import DialogFooter from './DialogFooter';
import RegisterFormContent from './RegisterFormContent';

const LoginPage = ({ setPage }) => {
    const { login, requestPasswordReset, loginWithGoogle } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const validateLogin = () => {
        let isValid = true;
        setEmailError('');
        setPasswordError('');

        try {
            z.string().email('Invalid email address').parse(email);
        } catch (e) {
            setEmailError(e.issues[0].message);
            isValid = false;
        }

        try {
            z.string().min(6, 'Password must be at least 6 characters').parse(password);
        } catch (e) {
            setPasswordError(e.issues[0].message);
            isValid = false;
        }
        return isValid;
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (!validateLogin()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await login(email, password);
            if (typeof setPage === 'function') {
                setPage('privateTodos');
            }
            window.location.reload(); // Reload the page after successful login and go to PrivateTodosPage
        } catch (err) {
            setLoginError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordReset = async () => {
        setResetMessage('');
        setIsResetting(true);
        try {
            await requestPasswordReset(resetEmail);
            setResetMessage('Password reset email sent! Check your inbox.');
            setResetDialogOpen(false);
        } catch (error) {
            setResetMessage(`Failed to send reset email: ${error.message}`);
        } finally {
            setIsResetting(false);
        }
    };

    const handleRegisterSuccess = (registeredEmail, registeredPassword) => {
        setRegisterDialogOpen(false);
        setEmail(registeredEmail);
        setPassword(registeredPassword);
        setLoginError('Registration successful! You can now log in.');
    };

    const handleGoogleLogin = async () => {
        setLoginError('');
        try {
            await loginWithGoogle();
        } catch (error) {
            setLoginError(error.message || 'Google login failed.');
        }
    };

    return (
        <Card className="w-[380px] p-4 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <CardHeader className="text-center">
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your email below to log in to your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLoginSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                        />
                        {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="******"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                        />
                        {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                    </div>
                    {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </Button>
                </form>
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
                        <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7  2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.445c-2.877 0-5.2 2.312-5.2 5.164 0 2.852 2.323 5.164 5.2 5.164a5.27 5.27 0 0 0 3.042-1.082l2.545 1.924a8.8 8.8 0 0 1-5.051 1.582Z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M8.842 3.134a8.8 8.8 0 0 1 8.65 8.947 8.841 8.841 0 0 1-8.8 8.653h-.153a8.464 8.464 0 0 1-5.7-2.257l2.193-2.038A5.27 5.27 0 0 0 9.09 14.555c2.877 0 5.2-2.312 5.2-5.164 0-2.852-2.323-5.164-5.2-5.164Z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M8.842 3.134a8.8 8.8 0 0 1 8.65 8.947 8.841 8.841 0 0 1-8.8 8.653h-.153a8.464 8.464 0 0 1-5.7-2.257l2.193-2.038A5.27 5.27 0 0 0 9.09 14.555c2.877 0 5.2-2.312 5.2-5.164 0-2.852-2.323-5.164-5.2-5.164Z" clipRule="evenodd" />
                    </svg>
                    Sign in with Google
                </Button>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button variant="link" onClick={() => setRegisterDialogOpen(true)} className="w-full">
                    Don't have an account? Register
                </Button>
                <Button variant="link" onClick={() => setResetDialogOpen(true)} className="w-full">
                    Forgot password?
                </Button>
            </CardFooter>

            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <DialogHeader>
                    <DialogTitle>Forgot Password</DialogTitle>
                    <DialogDescription>Enter your email to receive a password reset link.</DialogDescription>
                </DialogHeader>
                <DialogContent>
                    <Input
                        type="email"
                        placeholder="your@example.com"
                        value={resetEmail || ''}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="mb-4"
                    />
                    {resetMessage && <p className="text-sm text-center my-2">{resetMessage}</p>}
                </DialogContent>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setResetDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handlePasswordReset} disabled={isResetting}>
                        {isResetting ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </DialogFooter>
            </Dialog>

            <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
                <RegisterFormContent
                    onRegisterSuccess={handleRegisterSuccess}
                    onCancel={() => setRegisterDialogOpen(false)}
                />
            </Dialog>
        </Card>
    );
};

export default LoginPage;
