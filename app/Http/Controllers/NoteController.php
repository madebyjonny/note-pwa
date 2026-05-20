<?php

namespace App\Http\Controllers;

use App\Events\NoteDeleted;
use App\Events\NoteUpdated;
use App\Models\Note;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NoteController extends Controller
{
    public function index(): RedirectResponse
    {
        $note = auth()->user()->notes()
            ->orderByDesc('is_pinned')
            ->orderByDesc('updated_at')
            ->first();

        if ($note) {
            return redirect()->route('notes.show', $note);
        }

        return redirect()->route('notes.create');
    }

    public function create(): RedirectResponse
    {
        $note = auth()->user()->notes()->create([
            'title' => 'Untitled',
            'content' => null,
        ]);

        return redirect()->route('notes.show', $note);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'array'],
            'parent_id' => ['nullable', 'integer', 'exists:notes,id'],
            'emoji' => ['nullable', 'string', 'max:10'],
        ]);

        $note = auth()->user()->notes()->create($validated);

        return redirect()->route('notes.show', $note);
    }

    public function show(Note $note): Response
    {
        $this->authorize('view', $note);

        return Inertia::render('Notes/Show', [
            'note' => $note,
        ]);
    }

    public function update(Request $request, Note $note): RedirectResponse
    {
        $this->authorize('update', $note);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['nullable', 'array'],
            'emoji' => ['nullable', 'string', 'max:10'],
            'is_pinned' => ['sometimes', 'boolean'],
            'parent_id' => ['nullable', 'integer', 'exists:notes,id'],
        ]);

        $note->update($validated);

        broadcast(new NoteUpdated($note))->toOthers();

        return back();
    }

    public function destroy(Note $note): RedirectResponse
    {
        $this->authorize('delete', $note);

        $note->delete();

        broadcast(new NoteDeleted($note))->toOthers();

        $next = auth()->user()->notes()
            ->orderByDesc('updated_at')
            ->first();

        if ($next) {
            return redirect()->route('notes.show', $next);
        }

        return redirect()->route('notes.create');
    }
}
