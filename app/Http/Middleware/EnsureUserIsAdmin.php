<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->hasPermissionTo('access admin panel')) {
            abort(403, 'Unauthorized. Admin or Manager access required.');
        }

        return $next($request);
    }
}
