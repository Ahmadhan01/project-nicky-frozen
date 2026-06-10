import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <>
            <Head title="Dashboard Admin" />
            <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4">❄️</div>
                    <h1 className="text-2xl font-bold">Dashboard Admin</h1>
                    <p className="text-gray-400 mt-2">Selamat datang, {auth.user.name}</p>
                </div>
            </div>
        </>
    );
}