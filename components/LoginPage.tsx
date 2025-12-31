
import React, { useState } from 'react';
import { User, Role } from '../types';

interface LoginPageProps {
    onLogin: (user: User) => void;
}

// Mock User Database - Based on Email now
const ALLOWED_USERS: Record<string, { role: Role, name: string }> = {
    'pitsu94@gmail.com': { role: 'admin', name: 'מנהל מערכת' },
    'sales@wadi.com': { role: 'sales', name: 'צוות מכירות' },
    'ops@wadi.com': { role: 'operations', name: 'צוות תפעול' }
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [isSignUp, setIsSignUp] = useState(false); // Toggle for Sign Up view
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate Google Auth Network Delay
        setTimeout(() => {
            const normalizedEmail = email.toLowerCase().trim();
            
            // In a real app, Google handles auth. 
            // Here we check if the Google Email exists in our allowed list for RBAC.
            const user = ALLOWED_USERS[normalizedEmail];
            
            if (user) {
                onLogin({
                    username: normalizedEmail,
                    name: user.name,
                    role: user.role
                });
            } else {
                // If it's sign up mode, we could theoretically register them here
                if (isSignUp) {
                     setError('הרשמה למערכת דורשת אישור מנהל. אנא פנה למנהל המערכת.');
                } else {
                     setError('כתובת המייל אינה מורשית במערכת. נסה להתחבר עם חשבון אחר.');
                }
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] relative overflow-hidden font-sans">
            
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-200/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-stone-300/50 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-indigo-100/40 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="w-full max-w-md z-10 p-4">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 p-8 md:p-12 flex flex-col items-center animate-fade-in-up">
                    
                    {/* Logo Section - Larger & Cleaner */}
                    <div className="mb-8 w-full flex justify-center">
                         <img src="https://static.wixstatic.com/media/e87984_d30b09d55a744b22b13a5720ba722b7f~mv2.png/v1/fill/w_766,h_504,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/%D7%9C%D7%95%D7%92%D7%95%20%D7%9E%D7%90%D7%A1%D7%98%D7%A7%D7%A1%D7%98%20%2B%20%D7%98%D7%A7%D7%A1%D7%98%20%D7%A9%D7%A7%D7%95%D7%A3%20.png" 
                            alt="Wadi Logo" 
                            className="w-64 h-auto object-contain drop-shadow-sm hover:scale-105 transition duration-700"
                         />
                    </div>

                    <div className="text-center mb-8 w-full">
                        <h1 className="text-2xl font-black text-stone-800 tracking-tight">
                            {isSignUp ? 'יצירת חשבון חדש' : 'כניסה למערכת'}
                        </h1>
                        <p className="text-stone-500 text-sm mt-2 font-medium">
                            ברוכים הבאים לואדי - אוכל מקומי
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleGoogleLogin} className="w-full flex flex-col gap-5">
                        
                        <div className="group">
                            <label className="block text-xs font-bold text-stone-500 mb-2 mr-1 transition group-focus-within:text-teal-600">
                                הזדהות באמצעות גוגל
                            </label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-4 pl-12 text-base font-bold text-black focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder-stone-300 shadow-sm"
                                    placeholder="name@company.com"
                                    dir="ltr"
                                    autoFocus
                                />
                                {/* Mail Icon */}
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                                        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-xs font-bold bg-red-50 p-3 rounded-xl text-center animate-pulse border border-red-100 flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full bg-stone-900 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-black transition-all transform active:scale-[0.98] flex justify-center items-center gap-3 relative overflow-hidden group
                                ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {/* Subtle shine effect */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                            
                            {loading ? (
                                <span className="text-sm">מתחבר...</span>
                            ) : (
                                <>
                                    <div className="bg-white p-1 rounded-full">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                fill="#4285F4"
                                            />
                                            <path
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                fill="#34A853"
                                            />
                                            <path
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                fill="#FBBC05"
                                            />
                                            <path
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                fill="#EA4335"
                                            />
                                        </svg>
                                    </div>
                                    <span className="tracking-wide text-sm">{isSignUp ? 'המשך עם חשבון Google' : 'כניסה עם חשבון Google'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center w-full">
                        <button 
                            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                            className="text-stone-500 text-sm font-bold hover:text-teal-700 transition flex items-center justify-center gap-1 w-full"
                        >
                            {isSignUp ? 'כבר רשום? התחבר' : 'עדיין אין לך חשבון? הירשם עכשיו'}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                    </div>

                    {/* Hint for Demo - Styled Cleaner */}
                    <div className="mt-10 pt-6 border-t border-stone-200/60 text-center w-full">
                        <p className="text-[10px] text-stone-400 mb-3 uppercase tracking-widest font-bold">משתמשים לכניסה מהירה (Demo)</p>
                        <div className="flex flex-wrap justify-center gap-2 text-[10px] font-mono">
                            <span 
                                className="bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-teal-50 hover:text-teal-700 hover:shadow-sm transition border border-transparent hover:border-teal-100" 
                                onClick={() => setEmail('pitsu94@gmail.com')}
                            >
                                Admin
                            </span>
                            <span 
                                className="bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-teal-50 hover:text-teal-700 hover:shadow-sm transition border border-transparent hover:border-teal-100" 
                                onClick={() => setEmail('sales@wadi.com')}
                            >
                                Sales
                            </span>
                            <span 
                                className="bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-teal-50 hover:text-teal-700 hover:shadow-sm transition border border-transparent hover:border-teal-100" 
                                onClick={() => setEmail('ops@wadi.com')}
                            >
                                Ops
                            </span>
                        </div>
                    </div>
                </div>
                
                <p className="text-center text-[10px] text-stone-400 mt-6 font-medium opacity-60">
                    © 2025 Wadi Local Food System
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
