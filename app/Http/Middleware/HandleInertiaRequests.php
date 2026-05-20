<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $notes = [];
        if ($request->user()) {
            $notes = $request->user()
                ->notes()
                ->select(['id', 'title', 'emoji', 'is_pinned', 'parent_id', 'updated_at'])
                ->get()
                ->toArray();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'notes' => $notes,
        ];
    }
}
