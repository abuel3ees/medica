<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Medication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MedicationController extends Controller
{
    public function index()
    {
        $medications = Medication::with('uploader')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Medication $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'generic_name' => $m->generic_name,
                'description' => $m->description,
                'indications' => $m->indications,
                'dosage' => $m->dosage,
                'side_effects' => $m->side_effects,
                'contraindications' => $m->contraindications,
                'has_pdf' => (bool) $m->pdf_path,
                'uploaded_by' => $m->uploader?->name,
                'created_at' => $m->created_at->format('M d, Y'),
            ]);

        return Inertia::render('dashboard/medications/page', [
            'medications' => $medications,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'indications' => 'nullable|string',
            'dosage' => 'nullable|string',
            'side_effects' => 'nullable|string',
            'contraindications' => 'nullable|string',
            'pdf' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $pdfPath = null;
        $extractedText = null;

        if ($request->hasFile('pdf')) {
            $pdfPath = $request->file('pdf')->store('medications', 'public');
            $extractedText = $this->extractTextFromPdf($request->file('pdf')->getRealPath());
        }

        $medication = Medication::create([
            'name' => $validated['name'],
            'generic_name' => $validated['generic_name'] ?? null,
            'description' => $validated['description'] ?? null,
            'indications' => $validated['indications'] ?? null,
            'dosage' => $validated['dosage'] ?? null,
            'side_effects' => $validated['side_effects'] ?? null,
            'contraindications' => $validated['contraindications'] ?? null,
            'pdf_path' => $pdfPath,
            'extracted_text' => $extractedText,
            'uploaded_by' => $request->user()->id,
        ]);

        ActivityLog::log('medication_created', $medication, [
            'name' => $medication->name,
        ]);

        // Notify all reps about the new medication
        $reps = User::role('rep')->get();
        foreach ($reps as $rep) {
            NotificationController::notify(
                $rep->id,
                'medication_added',
                'New Medication Available',
                "💊 {$medication->name}" . ($medication->generic_name ? " ({$medication->generic_name})" : "") . " has been added to the database. Ask the AI coach for details!",
                ['medication_id' => $medication->id, 'name' => $medication->name],
                'pill',
                'normal'
            );
        }

        return redirect()->route('medications.index')->with('success', 'Medication added successfully.');
    }

    public function update(Request $request, Medication $medication)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'indications' => 'nullable|string',
            'dosage' => 'nullable|string',
            'side_effects' => 'nullable|string',
            'contraindications' => 'nullable|string',
            'pdf' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        if ($request->hasFile('pdf')) {
            // Delete old PDF
            if ($medication->pdf_path) {
                Storage::disk('public')->delete($medication->pdf_path);
            }
            $medication->pdf_path = $request->file('pdf')->store('medications', 'public');
            $medication->extracted_text = $this->extractTextFromPdf($request->file('pdf')->getRealPath());
        }

        $medication->update([
            'name' => $validated['name'],
            'generic_name' => $validated['generic_name'] ?? $medication->generic_name,
            'description' => $validated['description'] ?? $medication->description,
            'indications' => $validated['indications'] ?? $medication->indications,
            'dosage' => $validated['dosage'] ?? $medication->dosage,
            'side_effects' => $validated['side_effects'] ?? $medication->side_effects,
            'contraindications' => $validated['contraindications'] ?? $medication->contraindications,
            'pdf_path' => $medication->pdf_path,
            'extracted_text' => $medication->extracted_text,
        ]);

        ActivityLog::log('medication_updated', $medication);

        return redirect()->route('medications.index')->with('success', 'Medication updated.');
    }

    public function destroy(Medication $medication)
    {
        if ($medication->pdf_path) {
            Storage::disk('public')->delete($medication->pdf_path);
        }

        ActivityLog::log('medication_deleted', $medication, [
            'name' => $medication->name,
        ]);

        $medName = $medication->name;
        $medication->delete();

        // Notify admins about medication removal
        $admins = User::role('admin')->where('id', '!=', auth()->id())->get();
        foreach ($admins as $admin) {
            NotificationController::notify(
                $admin->id,
                'medication_deleted',
                'Medication Removed',
                "💊 {$medName} has been removed from the database by " . auth()->user()->name . ".",
                ['name' => $medName],
                'trash',
                'normal'
            );
        }

        return redirect()->route('medications.index')->with('success', 'Medication deleted.');
    }

    /**
     * Basic text extraction from PDF.
     * Uses php's built-in capabilities. For production, consider smalot/pdfparser.
     */
    private function extractTextFromPdf(string $path): string
    {
        // Simple extraction approach — read raw text from PDF
        $content = file_get_contents($path);

        // Extract text between stream/endstream markers (basic PDF text extraction)
        $text = '';
        preg_match_all('/stream\s*(.*?)\s*endstream/s', $content, $matches);

        foreach ($matches[1] as $stream) {
            // Try to decompress if gzip'd
            $decoded = @gzuncompress($stream);
            if ($decoded !== false) {
                // Extract text operators (Tj, TJ, ')
                preg_match_all('/\((.*?)\)/s', $decoded, $textMatches);
                foreach ($textMatches[1] as $t) {
                    $text .= $t . ' ';
                }
            } else {
                // Try without decompression
                preg_match_all('/\((.*?)\)/s', $stream, $textMatches);
                foreach ($textMatches[1] as $t) {
                    $text .= $t . ' ';
                }
            }
        }

        // Clean up
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);

        return $text ?: 'PDF text extraction not available. Please fill in fields manually.';
    }
}
