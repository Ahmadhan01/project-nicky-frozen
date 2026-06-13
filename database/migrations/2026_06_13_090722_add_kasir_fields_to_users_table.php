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
    Schema::table('users', function (Blueprint $table) {
        $table->string('username')->nullable()->unique()->after('email');
        $table->foreignId('default_kios_id')->nullable()->constrained('kios')->onDelete('set null')->after('role');
        $table->foreignId('default_shift_id')->nullable()->constrained('shifts')->onDelete('set null')->after('default_kios_id');
        $table->string('avatar_color')->default('#22d3ee')->after('default_shift_id');
        $table->text('notes')->nullable()->after('avatar_color');
        $table->timestamp('last_active_at')->nullable()->after('notes');
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropForeign(['default_kios_id']);
        $table->dropForeign(['default_shift_id']);
        $table->dropColumn(['username', 'default_kios_id', 'default_shift_id', 'avatar_color', 'notes', 'last_active_at']);
    });
}
};
