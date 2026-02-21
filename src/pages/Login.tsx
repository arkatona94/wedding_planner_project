import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useWeddingStore } from '../store/weddingStore'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const setUser = useWeddingStore(state => state.setUser)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (loginError) throw loginError

            if (data.user) {
                setUser({
                    id: data.user.id,
                    email: data.user.email!,
                    name: data.user.user_metadata?.full_name || ''
                })
                navigate('/')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setLoading(true)
        setError(null)
        try {
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            })
            if (oauthError) throw oauthError
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat bg-fixed"
            style={{
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.85)), url('/images/landing-bg.png')`,
            }}
        >
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-serif text-gray-900">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                            Register here
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label className="sr-only">Email address</label>
                            <input
                                type="email"
                                required
                                className="input-field mb-4"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="sr-only">Password</label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link to="/forgot-password" title="forgot-password-link" className="font-medium text-primary-600 hover:text-primary-500">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-sm hover:shadow disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                        </button>
                    </div>

                    {import.meta.env.DEV && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={() => {
                                    setUser({
                                        id: 'dev-user-id',
                                        email: 'dev@test.com',
                                        name: 'Dev Tester'
                                    })
                                    navigate('/')
                                }}
                                className="w-full py-2 px-4 border-2 border-dashed border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="text-lg">🛠️</span>
                                DEV: Skip Login (Internal Bypass)
                            </button>
                            <p className="text-[10px] text-gray-400 text-center mt-2 italic">
                                * This bypass is for testing only and will be removed before production.
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
