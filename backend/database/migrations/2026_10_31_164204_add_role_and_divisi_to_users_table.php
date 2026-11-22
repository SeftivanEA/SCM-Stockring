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
            $table->string('username')->unique()->after('name');
            $table->string('email')->nullable()->change();
            $table->string('role')->default('pendataan')->after('password');
            $table->foreignId('divisi_id')->nullable()->after('role')->constrained('divisis')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['divisi_id']);
            $table->dropColumn(['username', 'role', 'divisi_id']);
            $table->string('email')->nullable(false)->change();
        });
    }
};
