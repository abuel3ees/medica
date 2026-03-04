<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ObjectionTag extends Model
{
    protected $fillable = [
        'name',
    ];

    public function visits(): BelongsToMany
    {
        return $this->belongsToMany(Visit::class, 'visit_objection_tag');
    }
}
