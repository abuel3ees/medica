<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeatureFlag extends Model
{
    protected $fillable = [
        'key',
        'name',
        'description',
        'enabled',
        'metadata',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Check if a feature flag is enabled.
     */
    public static function isEnabled(string $key): bool
    {
        $flag = static::where('key', $key)->first();
        return $flag ? $flag->enabled : false;
    }

    /**
     * Toggle a feature flag.
     */
    public static function toggle(string $key): bool
    {
        $flag = static::where('key', $key)->first();
        if ($flag) {
            $flag->update(['enabled' => !$flag->enabled]);
            return $flag->enabled;
        }
        return false;
    }
}
