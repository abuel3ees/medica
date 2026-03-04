import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Company settings',
        href: '/settings/company',
    },
];

export default function Company() {
    const { companyName } = usePage<{ companyName: string }>().props;

    const { data, setData, patch, processing, recentlySuccessful, errors } = useForm({
        company_name: companyName,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/settings/company');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Company settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Company name"
                        description="Update your company name. This changes the branding across the app — splash screen, sidebar, headers, and more."
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="company_name">Company name</Label>
                            <Input
                                id="company_name"
                                className="max-w-md"
                                value={data.company_name}
                                onChange={(e) => setData('company_name', e.target.value)}
                                maxLength={60}
                                required
                                placeholder="e.g. Medica"
                            />
                            {errors.company_name && (
                                <p className="text-sm text-destructive">{errors.company_name}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving…' : 'Save'}
                            </Button>

                            {recentlySuccessful && (
                                <p className="text-sm text-muted-foreground">Saved.</p>
                            )}
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
