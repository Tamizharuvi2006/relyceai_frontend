import React from 'react';
import { Mail, Lock } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { InputWithIcon } from './AuthInput';
import { PrimaryButton, GoogleButton } from './AuthButtons';

/**
 * Mobile view with tab switching
 */
export function MobileAuthView({
    isMobileSignUp,
    setIsMobileSignUp,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    signUpEmail,
    setSignUpEmail,
    signUpPassword,
    setSignUpPassword,
    signUpConfirm,
    setSignUpConfirm,
    error,
    handleLogin,
    handleSignUp,
    handleGoogleSignIn,
}) {
    return (
        <div className="sm:hidden w-full max-w-md mx-auto">
            <div className="text-center mb-8 mt-4 animate-fade-in-down">
                <h1 className="text-3xl font-extrabold text-white">Relyce AI</h1>
                <p className="text-zinc-400 mt-2">Your AI-powered assistant</p>
            </div>

            <div className="mobile-card bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-lg shimmer-border">
                {/* Premium Tab Switcher */}
                <div className="mobile-tab-container flex mb-6">
                    <div className={`mobile-tab-indicator ${isMobileSignUp ? 'right' : ''}`}></div>
                    <button
                        onClick={() => setIsMobileSignUp(false)}
                        className={`mobile-tab-btn rounded-l-lg ${!isMobileSignUp ? 'active' : 'inactive'}`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsMobileSignUp(true)}
                        className={`mobile-tab-btn rounded-r-lg ${isMobileSignUp ? 'active' : 'inactive'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {isMobileSignUp ? (
                    <form onSubmit={handleSignUp} className="w-full mobile-form-enter" key="signup-form" noValidate>
                        <InputWithIcon
                            icon={<Mail size={18} className="text-zinc-400" />}
                            type="email"
                            placeholder="Email"
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            required
                        />
                        <InputWithIcon
                            icon={<Lock size={18} className="text-zinc-400" />}
                            type="password"
                            placeholder="Password"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            required
                        />
                        <InputWithIcon
                            icon={<Lock size={18} className="text-zinc-400" />}
                            type="password"
                            placeholder="Confirm Password"
                            value={signUpConfirm}
                            onChange={(e) => setSignUpConfirm(e.target.value)}
                            required
                        />
                        {error && <p className="text-sm mb-4 text-red-400">{error}</p>}
                        <PrimaryButton type="submit" className="mb-4">
                            Sign Up
                        </PrimaryButton>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-zinc-900/50 text-zinc-400">or</span>
                            </div>
                        </div>
                        <GoogleButton type="button" onClick={handleGoogleSignIn}>
                            <FaGoogle /> Sign up with Google
                        </GoogleButton>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="w-full mobile-form-enter" key="login-form" noValidate>
                        <InputWithIcon
                            icon={<Mail size={18} className="text-zinc-400" />}
                            type="email"
                            placeholder="Email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                        />
                        <InputWithIcon
                            icon={<Lock size={18} className="text-zinc-400" />}
                            type="password"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                        />
                        {error && <p className="text-sm mb-4 text-red-400">{error}</p>}
                        <PrimaryButton type="submit" className="mb-4">
                            Sign In
                        </PrimaryButton>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-zinc-900/50 text-zinc-400">or</span>
                            </div>
                        </div>
                        <GoogleButton type="button" onClick={handleGoogleSignIn}>
                            <FaGoogle /> Sign in with Google
                        </GoogleButton>
                    </form>
                )}
            </div>
        </div>
    );
}

export default MobileAuthView;
