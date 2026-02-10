import React from 'react';
import { Check, X } from 'lucide-react';
import { validatePassword, getPasswordStrength } from '../../../utils/passwordValidation';

/**
 * Visual password strength indicator with requirement checklist
 */
export function PasswordStrengthIndicator({ password }) {
    const { checks } = validatePassword(password);
    const strength = getPasswordStrength(password);

    const strengthColors = {
        weak: 'bg-red-500',
        medium: 'bg-yellow-500',
        strong: 'bg-emerald-500'
    };

    const strengthWidths = {
        weak: 'w-1/3',
        medium: 'w-2/3',
        strong: 'w-full'
    };

    const strengthLabels = {
        weak: 'Weak',
        medium: 'Medium',
        strong: 'Strong'
    };

    if (!password) return null;

    return (
        <div className="mb-4 px-1">
            {/* Strength Bar */}
            <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${strengthColors[strength]} ${strengthWidths[strength]}`}
                    />
                </div>
                <span className={`text-xs font-medium ${strength === 'strong' ? 'text-emerald-400' : strength === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {strengthLabels[strength]}
                </span>
            </div>

            {/* Requirements Checklist */}
            <div className="grid grid-cols-2 gap-1 text-xs">
                <RequirementItem met={checks.minLength} text="8+ characters" />
                <RequirementItem met={checks.hasUppercase} text="Uppercase" />
                <RequirementItem met={checks.hasLowercase} text="Lowercase" />
                <RequirementItem met={checks.hasNumber} text="Number" />
                <RequirementItem met={checks.hasSpecial} text="Special char" />
            </div>
        </div>
    );
}

function RequirementItem({ met, text }) {
    return (
        <div className={`flex items-center gap-1.5 ${met ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {met ? (
                <Check size={12} className="flex-shrink-0" />
            ) : (
                <X size={12} className="flex-shrink-0" />
            )}
            <span>{text}</span>
        </div>
    );
}

export default PasswordStrengthIndicator;
