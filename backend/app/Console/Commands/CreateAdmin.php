<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class CreateAdmin extends Command
{
    protected $signature = 'admin:create {email : Az admin e-mail címe} {--name=Admin : Megjelenített név}';

    protected $description = 'Admin felhasználó létrehozása vagy jelszavának megváltoztatása';

    public function handle(): int
    {
        $email = $this->argument('email');
        $password = $this->secret('Jelszó (legalább 10 karakter)');
        $confirm = $this->secret('Jelszó újra');

        $validator = Validator::make(
            ['email' => $email, 'password' => $password, 'password_confirmation' => $confirm],
            ['email' => ['required', 'email'], 'password' => ['required', 'string', 'min:10', 'confirmed']],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            ['name' => $this->option('name'), 'password' => $password],
        );

        // Jelszócsere után a régi bejelentkezések érvénytelenek.
        $user->tokens()->delete();

        $this->info($user->wasRecentlyCreated ? "Admin létrehozva: {$email}" : "Jelszó frissítve: {$email}");

        return self::SUCCESS;
    }
}
