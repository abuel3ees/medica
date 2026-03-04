<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    /**
     * Show the company settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/company', [
            'companyName' => AppSetting::companyName(),
        ]);
    }

    /**
     * Update the company name.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'company_name' => ['required', 'string', 'max:60'],
        ]);

        AppSetting::setValue('company_name', $request->input('company_name'));

        return back()->with('status', 'Company name updated.');
    }
}
