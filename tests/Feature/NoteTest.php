<?php

namespace Tests\Feature;

use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NoteTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_is_redirected_from_notes(): void
    {
        $this->get('/notes')->assertRedirect('/login');
    }

    public function test_notes_index_redirects_to_first_note_when_notes_exist(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->get('/notes')
            ->assertRedirect(route('notes.show', $note));
    }

    public function test_notes_index_renders_empty_page_when_no_notes(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/notes')
            ->assertInertia(fn ($page) => $page->component('Notes/Empty'));
    }

    public function test_create_note_creates_and_redirects_to_show(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/notes/new');

        $response->assertRedirect();
        $this->assertDatabaseHas('notes', [
            'user_id' => $user->id,
            'title' => 'Untitled',
        ]);
    }

    public function test_user_can_view_their_own_note(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->get("/notes/{$note->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Notes/Show')
                ->has('note')
            );
    }

    public function test_user_cannot_view_another_users_note(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $note = Note::factory()->create(['user_id' => $other->id]);

        $this->actingAs($user)
            ->get("/notes/{$note->id}")
            ->assertForbidden();
    }

    public function test_user_can_update_their_note(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->patch("/notes/{$note->id}", ['title' => 'Updated Title'])
            ->assertRedirect();

        $this->assertDatabaseHas('notes', [
            'id' => $note->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_user_cannot_update_another_users_note(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $note = Note::factory()->create(['user_id' => $other->id]);

        $this->actingAs($user)
            ->patch("/notes/{$note->id}", ['title' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_user_can_delete_their_note(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->delete("/notes/{$note->id}")
            ->assertRedirect();

        $this->assertSoftDeleted('notes', ['id' => $note->id]);
    }

    public function test_delete_with_remaining_notes_redirects_to_next_note(): void
    {
        $user = User::factory()->create();
        $note1 = Note::factory()->create(['user_id' => $user->id]);
        $note2 = Note::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->delete("/notes/{$note1->id}")
            ->assertRedirect(route('notes.show', $note2));
    }

    public function test_delete_last_note_redirects_to_index(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->delete("/notes/{$note->id}")
            ->assertRedirect(route('notes.index'));
    }

    public function test_user_can_pin_a_note(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create(['user_id' => $user->id, 'is_pinned' => false]);

        $this->actingAs($user)
            ->patch("/notes/{$note->id}", ['is_pinned' => true])
            ->assertRedirect();

        $this->assertTrue($note->fresh()->is_pinned);
    }

    public function test_user_cannot_delete_another_users_note(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $note = Note::factory()->create(['user_id' => $other->id]);

        $this->actingAs($user)
            ->delete("/notes/{$note->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('notes', ['id' => $note->id]);
    }
}
