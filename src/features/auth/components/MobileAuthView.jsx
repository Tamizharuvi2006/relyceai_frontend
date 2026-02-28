import React from 'react';
import { Mail, Lock } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { InputWithIcon } from './AuthInput';
import { PrimaryButton, GoogleButton } from './AuthButtons';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { LockoutCountdown } from './LockoutCountdown';

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
    // Security props
    isLocked,
    lockoutSeconds,
    isSubmitting,
    onLockoutExpire,
}) {
    return (
        <div className="sm:hidden w-full max-w-md mx-auto p-4">
            <div className="text-center mb-12 mt-8 animate-fade-in-down">
                <h1 className="text-xl font-medium tracking-[0.2em] uppercase text-white">RELYCE ALGORITHM</h1>
                <div className="w-12 h-px bg-white/20 mx-auto mt-6"></div>
            </div>

            <div className="bg-[#0a0d14] border border-white/5 p-6 shadow-2xl relative">
                {/* Minimalist Tab Switcher */}
                <div className="flex mb-8 border-b border-white/5 relative">
                    <div className={`absolute bottom-[-1px] h-[1px] bg-white transition-all duration-300 w-1/2 ${isMobileSignUp ? 'left-1/2' : 'left-0'}`}></div>
                    <button
                        onClick={() => setIsMobileSignUp(false)}
                        className={`flex-1 pb-4 text-[10px] font-mono tracking-[0.2em] uppercase transition-colors ${!isMobileSignUp ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsMobileSignUp(true)}
                        className={`flex-1 pb-4 text-[10px] font-mono tracking-[0.2em] uppercase transition-colors ${isMobileSignUp ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
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
                            autoComplete="username"
                            name="email"
                            disabled={isSubmitting}
                        />
                        <InputWithIcon
                            icon={<Lock size={18} className="text-zinc-400" />}
                            type="password"
                            placeholder="Password"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            name="password"
                            disabled={isSubmitting}
                        />
                        {/* Password Strength Indicator */}
                        <PasswordStrengthIndicator password={signUpPassword} />

                        <InputWithIcon
                            icon={<Lock size={18} className="text-zinc-400" />}
                            type="password"
                            placeholder="Confirm Password"
                            value={signUpConfirm}
                            onChange={(e) => setSignUpConfirm(e.target.value)}
                            required
                            autoComplete="new-password"
                            name="confirm-password"
                            disabled={isSubmitting}
                        />
                        {error && <p className="text-sm mb-4 text-red-400">{error}</p>}
                        <PrimaryButton type="submit" className="mb-4" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                        </PrimaryButton>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-[#0a0d14] text-[10px] font-mono tracking-widest text-zinc-600 uppercase">or</span>
                            </div>
                        </div>
                        <GoogleButton type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                            <FaGoogle /> Sign up with Google
                        </GoogleButton>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="w-full mobile-form-enter" key="login-form" noValidate>
                        {/* Lockout Warning */}
                        {isLocked && lockoutSeconds > 0 && (
                            <LockoutCountdown 
                                waitSeconds={lockoutSeconds} 
                                onExpire={onLockoutExpire}
                                email={loginEmail}
                            />
                        )}

                        <InputWithIcon
                            icon={<Mail size={18} className="text-zinc-400" />}
                            type="email"
                            placeholder="Email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            autoComplete="username"
                            name="email"
                            disabled={isSubmitting}
                        />
                        <InputWithIcon
                            icon={<Lock size={18} className="text-zinc-400" />}
                            type="password"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            name="password"
                            disabled={isSubmitting || isLocked}
                        />
                        {error && <p className="text-sm mb-4 text-red-400">{error}</p>}
                        <PrimaryButton type="submit" className="mb-4" disabled={isSubmitting || isLocked}>
                            {isSubmitting ? 'Signing In...' : isLocked ? 'Locked' : 'Sign In'}
                        </PrimaryButton>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-[#0a0d14] text-[10px] font-mono tracking-widest text-zinc-600 uppercase">or</span>
                            </div>
                        </div>
                        <GoogleButton type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                            <FaGoogle /> Sign in with Google
                        </GoogleButton>
                    </form>
                )}
            </div>
        </div>
    );
}

export default MobileAuthView;
