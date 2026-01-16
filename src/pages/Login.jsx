import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [isAdminMode, setIsAdminMode] = useState(false); // Toggle between student/admin login

    // Form State
    const [credentials, setCredentials] = useState({ id: "", password: "" });
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        setError("");

        if (isAdminMode) {
            // Mock Admin Validation
            if (credentials.id === "admin" && credentials.password === "admin123") {
                navigate('/admin');
            } else {
                setError("Invalid Staff Credentials (Try: admin / admin123)");
            }
        } else {
            // Student Login (Mock)
            // Save to localStorage for persistence
            const cleanId = credentials.id ? credentials.id.trim() : 'Guest';
            localStorage.setItem('studentId', cleanId);
            localStorage.setItem('studentName', cleanId.split('@')[0]);
            navigate('/student');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 w-full max-w-md text-center relative overflow-hidden"
            >
                {/* Background Glow */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${isAdminMode ? 'bg-secondary' : 'bg-primary'}`}></div>

                <div className="mb-8 relative z-10">
                    <h1 className={`text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2 transition-colors duration-500 ${isAdminMode ? 'from-secondary to-orange-400' : 'from-primary to-secondary'}`}>
                        {isAdminMode ? 'Staff Portal' : 'PrePlate'}
                    </h1>
                    <p className="text-gray-400">{isAdminMode ? 'Management Access' : 'Smart Ordering System'}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                    <div className="space-y-2 text-left">
                        <label className="text-sm font-medium text-gray-300 ml-1">
                            {isAdminMode ? 'Staff ID' : 'Student Email'}
                        </label>
                        <input
                            type={isAdminMode ? "text" : "email"}
                            placeholder={isAdminMode ? "admin" : "id@university.edu"}
                            value={credentials.id}
                            onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>

                    <div className="space-y-2 text-left">
                        <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                        />
                        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className={`w-full text-white font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition-all mt-6 bg-gradient-to-r ${isAdminMode ? 'from-secondary to-orange-500 shadow-secondary/20' : 'from-primary to-secondary shadow-primary/20'}`}
                    >
                        {isAdminMode ? 'Access Dashboard' : 'Sign In with ID'}
                    </button>

                    {!isAdminMode && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-transparent text-gray-500 bg-card">Or continue with</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                Google
                            </button>
                        </>
                    )}

                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsAdminMode(!isAdminMode);
                                setError("");
                                setCredentials({ id: "", password: "" });
                            }}
                            className="text-xs text-gray-500 hover:text-white transition-colors"
                        >
                            {isAdminMode ? '← Back to Student Login' : 'Are you a staff member? Login here'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
