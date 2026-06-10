<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
        $table->foreignId('kasir_session_id')
              ->nullable()
              ->constrained('kasir_sessions')
              ->onDelete('set null')
              ->after('user_id');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
       Schema::table('transactions', function (Blueprint $table) {
        $table->dropForeign(['kasir_session_id']);
        $table->dropColumn('kasir_session_id');
    });
    }
};
