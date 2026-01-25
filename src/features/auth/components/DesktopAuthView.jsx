import React from 'react';
import { Mail, Lock } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { InputWithIcon } from './AuthInput';
import { PrimaryButton, GoogleButton, GradientButton } from './AuthButtons';

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
}) {
    return (
        <div className="relative overflow-hidden backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-4xl min-h-[600px] hidden sm:grid grid-cols-2 bg-zinc-900/50 border border-zinc-800 shadow-emerald-500/10 shimmer-border">
            {/* Sign In Form Panel */}
            <div className={`form-panel flex flex-col items-center justify-center p-8 text-center absolute top-0 left-0 h-full w-1/2 ${rightPanelActive ? 'inactive z-0' : 'active z-20'}`}>
                <h1 className="text-4xl font-extrabold mb-6 text-white">Sign In</h1>
                <GoogleButton type="button" onClick={handleGoogleSignIn}>
                    <FaGoogle /> Sign in with Google
                </GoogleButton>
                <div className="relative my-4 w-full max-w-xs">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-zinc-900/50 text-zinc-400">or use your account</span>
                    </div>
                </div>
                <form onSubmit={handleLogin} className="w-full max-w-sm" noValidate>
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
                    {error && !rightPanelActive && <p className="text-sm mb-4 text-red-400">{error}</p>}
                    <PrimaryButton type="submit">Sign In</PrimaryButton>
                </form>
            </div>

            {/* Sign Up Form Panel */}
            <div className={`form-panel flex flex-col items-center justify-center p-8 text-center absolute top-0 right-0 h-full w-1/2 ${rightPanelActive ? 'active z-20' : 'inactive z-0'}`}>
                <h1 className="text-4xl font-extrabold mb-6 text-white">Create Account</h1>
                <GoogleButton type="button" onClick={handleGoogleSignIn}>
                    <FaGoogle /> Sign up with Google
                </GoogleButton>
                <div className="relative my-4 w-full max-w-xs">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-zinc-900/50 text-zinc-400">or use your email</span>
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
                    {error && rightPanelActive && <p className="text-sm mb-4 text-red-400">{error}</p>}
                    <PrimaryButton type="submit">Sign Up</PrimaryButton>
                </form>
            </div>

            {/* Overlay Panel - slides between left and right */}
            <div className={`overlay-container absolute top-0 h-full w-1/2 z-30 overflow-hidden ${rightPanelActive ? 'left-0' : 'right-0'}`}>
                {/* Already have account Panel */}
                <div className={`overlay-panel absolute inset-0 bg-gradient-to-br from-emerald-900/50 via-teal-900/40 to-cyan-900/30 backdrop-blur-md h-full flex flex-col items-center justify-center p-8 text-center ${rightPanelActive ? 'panel-active' : 'panel-inactive'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>
                    <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
                        Wait... You're Back?
                    </h1>
                    <p className="text-lg text-emerald-300/80 mb-2 font-medium">
                        Couldn't stay away, huh?
                    </p>
                    <p className="text-zinc-400 mb-8 max-w-sm text-sm">
                        We knew you'd come crawling back. Don't worry, your AI bestie missed roasting you too.
                    </p>
                    <GradientButton onClick={() => setRightPanelActive(false)}>
                        Fine, Let Me In
                    </GradientButton>
                </div>

                {/* New here Panel */}
                <div className={`overlay-panel absolute inset-0 bg-gradient-to-br from-emerald-900/50 via-teal-900/40 to-cyan-900/30 backdrop-blur-md h-full flex flex-col items-center justify-center p-8 text-center ${rightPanelActive ? 'panel-inactive' : 'panel-active'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>
                    <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
                        No Account Yet?
                    </h1>
                    <p className="text-lg text-emerald-300/80 mb-2 font-medium">
                        Living under a rock, are we?
                    </p>
                    <p className="text-zinc-400 mb-8 max-w-sm text-sm">
                        Everyone's already here having fun with AI. What's your excuse? Sign up before we judge you harder.
                    </p>
                    <GradientButton onClick={() => setRightPanelActive(true)}>
                        Okay, I'll Join
                    </GradientButton>
                </div>
            </div>
        </div>
    );
}

export default DesktopAuthView;
