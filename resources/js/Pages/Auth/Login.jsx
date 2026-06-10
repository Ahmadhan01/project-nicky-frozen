import { Head, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title="Login - Nicky Frozen" />
            <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
                <div className="bg-[#161b22] rounded-2xl p-10 w-full max-w-md shadow-2xl">

                    {/* Icon & Title */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="text-5xl mb-4">❄️</div>
                        <h1 className="text-white text-3xl font-bold">Welcome Back</h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-4">

                        {/* Email */}
                        <div className="flex items-center bg-[#0d1117] rounded-lg px-4 py-3 gap-3">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <input
                                type="email"
                                placeholder="Username"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="bg-transparent text-white placeholder-gray-500 outline-none w-full text-sm"
                                required
                            />
                        </div>
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}

                        {/* Password */}
                        <div className="flex items-center bg-[#0d1117] rounded-lg px-4 py-3 gap-3">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <input
                                type="password"
                                placeholder="Password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="bg-transparent text-white placeholder-gray-500 outline-none w-full text-sm"
                                required
                            />
                        </div>
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-cyan-400 hover:bg-cyan-500 text-white font-semibold py-3 rounded-lg transition duration-200 mt-2 disabled:opacity-50"
                        >
                            {processing ? 'Loading...' : 'Login'}
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
}