<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVisitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'doctor_profile_id' => ['required', 'exists:doctor_profiles,id'],
            'visit_type'        => ['required', 'in:in_person,call,event,follow_up'],
            'visit_date'        => ['required', 'date', 'before_or_equal:today'],

            // Objectives (1-3 required)
            'objectives'                => ['required', 'array', 'min:1', 'max:3'],
            'objectives.*.objective_id' => ['required', 'exists:objectives,id'],
            'objectives.*.outcome'      => ['required', 'in:met,partially_met,not_met'],

            // Optional signals
            'engagement_quality'  => ['nullable', 'in:low,medium,high'],
            'access_difficulty'   => ['nullable', 'in:A,B,C'],
            'time_spent_minutes'  => ['nullable', 'integer', 'min:1', 'max:480'],
            'confidence'          => ['nullable', 'integer', 'min:0', 'max:100'],

            // Stance tracking
            'stance_before' => ['nullable', 'in:supportive,neutral,resistant'],
            'stance_after'  => ['nullable', 'in:supportive,neutral,resistant'],

            // Notes
            'notes' => ['nullable', 'string', 'max:2000'],

            // Objection tags
            'objection_tag_ids'   => ['nullable', 'array'],
            'objection_tag_ids.*' => ['exists:objection_tags,id'],

            // Next step
            'next_step'             => ['nullable', 'array'],
            'next_step.description' => ['required_with:next_step', 'string', 'max:500'],
            'next_step.type'        => ['nullable', 'string', 'max:100'],
            'next_step.due_date'    => ['nullable', 'date', 'after_or_equal:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'objectives.required' => 'Please select at least one objective.',
            'objectives.min'      => 'Please select at least one objective.',
            'objectives.max'      => 'You can select at most 3 objectives.',
        ];
    }
}
