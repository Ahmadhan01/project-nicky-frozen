<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Inertia\Inertia;

class AuditController extends Controller
{
    public function index()
    {
        $logs = AuditLog::with('user')
            ->latest()
            ->get();

        return Inertia::render('Admin/Audit', [
            'logs' => $logs,
        ]);
    }
}