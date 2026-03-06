import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    color = 'blue',
    subtext
}) => {
    // Map colors to Tailwind classes safely
    const colorVariants = {
        blue: 'text-blue-500 bg-blue-500/10 ring-blue-500/20',
        emerald: 'text-emerald-500 bg-emerald-500/10 ring-emerald-500/20',
        yellow: 'text-amber-500 bg-amber-500/10 ring-amber-500/20',
        purple: 'text-violet-500 bg-violet-500/10 ring-violet-500/20',
        red: 'text-red-500 bg-red-500/10 ring-red-500/20',
        gray: 'text-zinc-500 bg-zinc-500/10 ring-zinc-500/20',
    };

    const activeColor = colorVariants[color] || colorVariants.blue;

    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2 }}
            className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#030508]/40 backdrop-blur-3xl p-6 transition-all duration-300 hover:border-emerald-500/20 hover:bg-white/5 group shadow-xl"
        >
            {/* Ambient background glow */}
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-[40px] opacity-20 transition-all group-hover:opacity-40 bg-${color}-500/50 pointer-events-none`} />

            <div className="relative flex justify-between items-start z-10">
                <div>
                    <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">{title}</p>
                    <h3 className="mt-4 text-3xl font-light text-white tracking-tight font-mono">{value}</h3>

                    {(change != null || subtext) && (
                        <div className="mt-2 flex items-center text-[10px] font-mono tracking-widest uppercase">
                            {change != null && (
                                <span className={`flex items-center font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {change >= 0 ? <ArrowUpRight size={14} className="mr-0.5" strokeWidth={2} /> : <ArrowDownRight size={14} className="mr-0.5" strokeWidth={2} />}
                                    {Math.abs(change)}%
                                </span>
                            )}
                            {subtext && (
                                <span className="text-zinc-500 ml-2">{subtext}</span>
                            )}
                        </div>
                    )}
                </div>

                <div className={`p-3 rounded-xl ring-1 ring-inset ${activeColor}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard;
