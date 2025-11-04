<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PokokDurian;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin',
            'email' => 'admin@durian.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create Pekerja Users
        User::create([
            'name' => 'Ahmad bin Ali',
            'email' => 'ahmad@durian.com',
            'password' => Hash::make('password'),
            'role' => 'pekerja',
        ]);

        User::create([
            'name' => 'Siti binti Hassan',
            'email' => 'siti@durian.com',
            'password' => Hash::make('password'),
            'role' => 'pekerja',
        ]);

        // Create sample Pokok Durian
        PokokDurian::create([
            'tag_no' => 'D001',
            'varieti' => 'Musang King',
            'umur' => 5,
            'lokasi' => 'Blok A',
            'tarikh_tanam' => '2019-01-15',
            'status_kesihatan' => 'sihat',
            'catatan' => 'Pokok yang sihat dan produktif',
        ]);

        PokokDurian::create([
            'tag_no' => 'D002',
            'varieti' => 'D24',
            'umur' => 7,
            'lokasi' => 'Blok A',
            'tarikh_tanam' => '2017-03-20',
            'status_kesihatan' => 'sihat',
            'catatan' => 'Penghasilan tinggi',
        ]);

        PokokDurian::create([
            'tag_no' => 'D003',
            'varieti' => 'Black Thorn',
            'umur' => 4,
            'lokasi' => 'Blok B',
            'tarikh_tanam' => '2020-06-10',
            'status_kesihatan' => 'sederhana',
            'catatan' => 'Perlu perhatian tambahan',
        ]);

        PokokDurian::create([
            'tag_no' => 'D004',
            'varieti' => 'Musang King',
            'umur' => 8,
            'lokasi' => 'Blok B',
            'tarikh_tanam' => '2016-02-28',
            'status_kesihatan' => 'sihat',
        ]);

        PokokDurian::create([
            'tag_no' => 'D005',
            'varieti' => 'Red Prawn',
            'umur' => 3,
            'lokasi' => 'Blok C',
            'tarikh_tanam' => '2021-04-15',
            'status_kesihatan' => 'kurang sihat',
            'catatan' => 'Dijangkiti hama',
        ]);
    }
}
