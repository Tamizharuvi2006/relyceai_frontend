import React from 'react';
import { Mail, Lock } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { InputWithIcon } from './AuthInput';
import { PrimaryButton, GoogleButton, GradientButton } from './AuthButtons';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { LockoutCountdown } from './LockoutCountdown';

/**
 * Desktop view with sliding overlay panels
 */
export function DesktopAuthView({
    rightPanelActive,
    setRightPanelActive,
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
        <div className="relative overflow-hidden w-full max-w-5xl min-h-[600px] hidden sm:grid grid-cols-2 bg-[#0a0d14] border border-white/5">
            {/* Sign In Form Panel */}
            <div className={`form-panel flex flex-col items-center justify-center p-8 text-center absolute top-0 left-0 h-full w-1/2 ${rightPanelActive ? 'inactive z-0' : 'active z-20'}`}>
                <h1 className="text-4xl font-extrabold mb-6 text-white">Sign In</h1>
                <GoogleButton type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                    <FaGoogle /> Sign in with Google
                </GoogleButton>
                <div className="relative my-4 w-full max-w-xs">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-[#0a0d14] text-zinc-600 text-[10px] tracking-widest uppercase bg-transparent px-4">OR</span>
                    </div>
                </div>

                {/* Lockout Warning */}
                {isLocked && lockoutSeconds > 0 && (
                    <LockoutCountdown 
                        waitSeconds={lockoutSeconds} 
                        onExpire={onLockoutExpire}
                        email={loginEmail}
                    />
                )}

                <form onSubmit={handleLogin} className="w-full max-w-sm" noValidate>
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
                    {error && !rightPanelActive && <p className="text-sm mb-4 text-red-400">{error}</p>}
                    <PrimaryButton type="submit" disabled={isSubmitting || isLocked}>
                        {isSubmitting ? 'Signing In...' : isLocked ? 'Locked' : 'Sign In'}
                    </PrimaryButton>
                </form>
            </div>

            {/* Sign Up Form Panel */}
            <div className={`form-panel flex flex-col items-center justify-center p-8 text-center absolute top-0 right-0 h-full w-1/2 ${rightPanelActive ? 'active z-20' : 'inactive z-0'}`}>
                <h1 className="text-4xl font-extrabold mb-6 text-white">Create Account</h1>
                <GoogleButton type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                    <FaGoogle /> Sign up with Google
                </GoogleButton>
                <div className="relative my-4 w-full max-w-xs">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-[#0a0d14] text-zinc-600 text-[10px] tracking-widest uppercase bg-transparent px-4">OR</span>
                    </div>
                </div>
                <form onSubmit={handleSignUp} className="w-full max-w-sm" noValidate>
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
                    {error && rightPanelActive && <p className="text-sm mb-4 text-red-400">{error}</p>}
                    <PrimaryButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                    </PrimaryButton>
                </form>
            </div>

            {/* Overlay Panel - slides between left and right */}
            <div className={`overlay-container absolute top-0 h-full w-1/2 z-30 overflow-hidden ${rightPanelActive ? 'left-0' : 'right-0'}`}>
                {/* Already have account Panel */}
                <div className={`overlay-panel absolute inset-0 bg-[#0a0d14] border-l border-r border-white/5 h-full flex flex-col items-center justify-center p-12 text-center transition-opacity duration-500 ${rightPanelActive ? 'panel-active' : 'panel-inactive'}`}>
                    <h1 className="text-3xl font-light mb-4 tracking-wide text-white">
                        Welcome Back
                    </h1>
                    <p className="text-zinc-500 mb-12 max-w-sm text-sm tracking-wide leading-relaxed font-light">
                        To keep connected with us please login with your personal info
                    </p>
                    <GradientButton onClick={() => setRightPanelActive(false)}>
                        Sign In
                    </GradientButton>
                </div>

                {/* New here Panel */}
                <div className={`overlay-panel absolute inset-0 bg-[#0a0d14] border-l border-r border-white/5 h-full flex flex-col items-center justify-center p-12 text-center transition-opacity duration-500 ${rightPanelActive ? 'panel-inactive' : 'panel-active'}`}>
                    <h1 className="text-3xl font-light mb-4 tracking-wide text-white">
                        Hello, Friend!
                    </h1>
                    <p className="text-zinc-500 mb-12 max-w-sm text-sm tracking-wide leading-relaxed font-light">
                        Enter your personal details and start your journey with us
                    </p>
                    <GradientButton onClick={() => setRightPanelActive(true)}>
                        Sign Up
                    </GradientButton>
                </div>
            </div>
        </div>
    );
}

export default DesktopAuthView;
