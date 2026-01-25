import React from "react";
import { Upload, Shield, Eye, Lock, AlertTriangle } from "lucide-react";

const UploadDisclaimer = ({ onAccept, isLoading, fileRef }) => {
    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            onAccept(e.target.files[0]);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="max-w-lg">
                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-emerald-500/30">
                    <Shield className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-white mb-3">Data Visualization</h2>
                <p className="text-gray-400 mb-8">
                    Upload your Excel or CSV file to create beautiful charts and gain insights from your data
                </p>

                {/* Privacy & Accuracy Info */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 mb-6 text-left">
                    <h3 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
                        <Lock size={16} /> Privacy & Data Policy
                    </h3>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-emerald-500/20 rounded-lg mt-0.5">
                                <Eye size={14} className="text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-300 font-medium">100% Client-Side Processing</p>
                                <p className="text-xs text-gray-500">Your data is processed entirely in your browser. No data is ever sent to our servers.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-emerald-500/20 rounded-lg mt-0.5">
                                <Shield size={14} className="text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-300 font-medium">Complete Privacy</p>
                                <p className="text-xs text-gray-500">Your files stay on your device. Nothing is stored, logged, or transmitted.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-amber-500/20 rounded-lg mt-0.5">
                                <AlertTriangle size={14} className="text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-300 font-medium">~98% Parsing Accuracy</p>
                                <p className="text-xs text-gray-500">Complex Excel formats may have minor parsing variations. Verify critical data manually.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Button */}
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={isLoading}
                    className="px-8 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50"
                >
                    <Upload size={20} />
                    {isLoading ? 'Processing...' : 'Upload Data File'}
                </button>

                <input
                    type="file"
                    ref={fileRef}
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                />

                <p className="text-xs text-gray-600 mt-4">Supports .csv, .xlsx, .xls files</p>
            </div>
        </div>
    );
};

export default UploadDisclaimer;
