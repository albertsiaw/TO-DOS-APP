import React, { useContext, useState } from 'react';
import { z } from 'zod';
import { AuthContext } from '../App';
import Button from './Button';
import Label from './Label';
import Input from './Input';
import DialogHeader from './DialogHeader';
import DialogTitle from './DialogTitle';
import DialogDescription from './DialogDescription';
import DialogContent from './DialogContent';
import DialogFooter from './DialogFooter';

const RegisterFormContent = ({ onRegisterSuccess, onCancel }) => {
    const { register, requestEmailVerification } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [emailForVerification, setEmailForVerification] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordConfirmError, setPasswordConfirmError] = useState('');

    const validateRegister = () => {
        let isValid = true;
        setEmailError('');
        setPasswordError('');
        setPasswordConfirmError('');

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

        if (password !== passwordConfirm) {
            setPasswordConfirmError("Passwords don't match");
            isValid = false;
        } else {
            try {
                z.string().min(6, 'Password must be at least 6 characters').parse(passwordConfirm);
            } catch (e) {
                setPasswordConfirmError(e.issues[0].message);
                isValid = false;
            }
        }
        return isValid;
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setRegisterError('');
        setRegisterSuccess(false);

        if (!validateRegister()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const userRecord = await register(email, password);
            setEmailForVerification(email);
            setRegisterSuccess(true);
            if (onRegisterSuccess) {
                onRegisterSuccess(email, password);
            }
        } catch (err) {
            setRegisterError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        try {
            await requestEmailVerification(emailForVerification);
            console.log('Verification email re-sent! Check your inbox.');
        } catch (error) {
            console.error('Failed to resend verification email.');
        }
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Register</DialogTitle>
                <DialogDescription>Create a new account.</DialogDescription>
            </DialogHeader>
            <DialogContent>
                {registerSuccess ? (
                    <div className="text-center">
                        <p className="text-green-600 mb-4">Registration successful!</p>
                        <p className="mb-2">A verification email has been sent to your inbox. Please verify your email to activate your account.</p>
                        <Button onClick={handleResendVerification} variant="outline" className="w-full">Resend Verification Email</Button>
                        <Button onClick={onCancel} className="mt-4 w-full">Close</Button>
                    </div>
                ) : (
                    <form onSubmit={handleRegisterSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="register-email">Email</Label>
                            <Input
                                id="register-email"
                                type="email"
                                placeholder="m@example.com"
                                value={email || ''}
                                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                            />
                            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="register-password">Password</Label>
                            <Input
                                id="register-password"
                                type="password"
                                placeholder="******"
                                value={password || ''}
                                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                            />
                            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="register-password-confirm">Confirm Password</Label>
                            <Input
                                id="register-password-confirm"
                                type="password"
                                placeholder="******"
                                value={passwordConfirm || ''}
                                onChange={(e) => { setPasswordConfirm(e.target.value); setPasswordConfirmError(''); }}
                            />
                            {passwordConfirmError && <p className="text-red-500 text-sm">{passwordConfirmError}</p>}
                        </div>
                        {registerError && <p className="text-red-500 text-sm">{registerError}</p>}
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Registering...' : 'Register'}
                        </Button>
                    </form>
                )}
            </DialogContent>
            {!registerSuccess && (
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                </DialogFooter>
            )}
        </>
    );
};

export default RegisterFormContent;
