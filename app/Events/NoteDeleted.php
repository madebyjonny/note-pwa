<?php

namespace App\Events;

use App\Models\Note;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NoteDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Note $note)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notes.' . $this->note->user_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->note->id,
        ];
    }
}
