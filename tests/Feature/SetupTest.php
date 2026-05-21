<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SetupTest extends TestCase
{
    use RefreshDatabase;

    public function test_setup_page_is_shown_when_no_users_exist(): void
    {
        $response = $this->get('/setup');

        $response->assertStatus(200);
    }

    public function test_setup_redirects_to_login_when_user_already_exists(): void
    {
        User::factory()->create();

        $response = $this->get('/setup');

        $response->assertRedirect(route('login'));
    }

    public function test_setup_creates_user_and_redirects_to_notes(): void
    {
        $response = $this->post('/setup', [
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('notes.index'));
        $this->assertDatabaseHas('users', ['email' => 'admin@example.com']);
    }

    public function test_setup_rejects_registration_if_user_already_exists(): void
    {
        User::factory()->create();

        $response = $this->post('/setup', [
            'name' => 'Another',
            'email' => 'another@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseCount('users', 1);
    }
}
