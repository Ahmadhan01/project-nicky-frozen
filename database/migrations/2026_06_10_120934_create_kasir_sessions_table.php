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
         Schema::create('kasir_sessions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('kios_id')->constrained('kios')->onDelete('cascade');
        $table->foreignId('shift_id')->constrained()->onDelete('cascade');
        $table->dateTime('started_at');
        $table->dateTime('ended_at')->nullable();
        $table->enum('status', ['active', 'closed'])->default('active');
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kasir_sessions');
    }
};
