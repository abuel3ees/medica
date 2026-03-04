import { Form, Head, Link, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Activity, ArrowRight, Copy, Eye, EyeOff, Sparkles, Users } from 'lucide-react';
import { useCallback, useState } from 'react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    demoMode?: boolean;
};

const DEMO_ACCOUNTS = [
    { role: 'Admin', email: 'admin@medica.test', icon: '🛡️', desc: 'Dev console & full access' },
    { role: 'Manager', email: 'manager@medica.test', icon: '👔', desc: 'Full territory overview' },
    { role: 'Rep (Sam)', email: 'sam@medica.test', icon: '💊', desc: 'Field representative' },
    { role: 'Rep (Julia)', email: 'julia@medica.test', icon: '💊', desc: 'Field representative' },
    { role: 'Rep (Priya)', email: 'priya@medica.test', icon: '💊', desc: 'Field representative' },
];

export default function Login({
    status,
    canResetPassword,
    canRegister,
    demoMode = true,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const companyName = (usePage().props.companyName as string) || 'Medica';

    const autofill = useCallback((email: string) => {
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const passInput = document.getElementById('password') as HTMLInputElement;
        if (emailInput) {
            emailInput.value = email;
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (passInput) {
            passInput.value = 'password';
            passInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, []);

    const copyEmail = useCallback((email: string) => {
        navigator.clipboard.writeText(email);
        setCopied(email);
        setTimeout(() => setCopied(null), 1500);
    }, []);

    return (
        <>
            <Head title="Log in" />
            <div className="flex min-h-svh">
                {/* Left panel — branding + demo accounts */}
                <div className="relative hidden w-[480px] flex-col justify-between overflow-hidden bg-primary p-10 text-white lg:flex">
                    {/* Decorative elements */}
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
                    <div className="pointer-events-none absolute -left-10 bottom-40 h-48 w-48 rounded-full bg-white/5" />
                    <div
                        className="pointer-events-none absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                            backgroundSize: '32px 32px',
                        }}
                    />

                    {/* Logo */}
                    <div className="relative">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <span className="text-lg font-bold tracking-tight">{companyName}</span>
                                <p className="text-[10px] font-medium uppercase tracking-widest text-white/60">Visit Intelligence</p>
                            </div>
                        </Link>
                    </div>

                    {/* Hero text */}
                    <div className="relative space-y-6">
                        {demoMode && (
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                                <Sparkles className="h-3 w-3" />
                                Demo Mode — Try any account
                            </div>
                        )}
                        <h2 className="text-2xl font-bold leading-snug">
                            Track every doctor visit.
                            <br />
                            <span className="text-white/70">Score every interaction.</span>
                        </h2>
                        <p className="max-w-sm text-sm leading-relaxed text-white/60">
                            {companyName} scores reps by outcome, difficulty, and time.
                            Our AI coach turns data into actionable strategies.
                        </p>

                        {/* Demo accounts */}
                        {demoMode && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Quick Login</p>
                            {DEMO_ACCOUNTS.map((account) => (
                                <button
                                    key={account.email}
                                    type="button"
                                    onClick={() => autofill(account.email)}
                                    className="group flex w-full items-center gap-3 rounded-xl bg-white/[0.07] px-4 py-3 text-left transition-all hover:bg-white/[0.14] active:scale-[0.98]"
                                >
                                    <span className="text-lg">{account.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{account.role}</p>
                                        <p className="truncate text-[11px] text-white/50">{account.email}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyEmail(account.email);
                                            }}
                                            className="rounded-md p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white/70"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </button>
                                        <ArrowRight className="h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70" />
                                    </div>
                                    {copied === account.email && (
                                        <span className="absolute right-14 rounded bg-white/20 px-2 py-0.5 text-[10px] backdrop-blur-sm">
                                            Copied!
                                        </span>
                                    )}
                                </button>
                            ))}
                            <p className="text-center text-[10px] text-white/30">
                                Password for all accounts: <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono">password</code>
                            </p>
                        </div>
                        )}
                    </div>

                    {/* Bottom stats */}
                    <div className="relative flex items-center gap-6 text-[11px] text-white/40">
                        <div className="flex items-center gap-1.5">
                            <Users className="h-3 w-3" />
                            4 demo users
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Activity className="h-3 w-3" />
                            47 seeded visits
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3" />
                            AI coaching active
                        </div>
                    </div>
                </div>

                {/* Right panel — login form */}
                <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-[400px]">
                        {/* Mobile logo */}
                        <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
                            <Link href="/" className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-md">
                                    <Activity className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-bold tracking-tight text-foreground">{companyName}</span>
                            </Link>
                        </div>

                        <div className="mb-8 space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
                            <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
                        </div>

                        {status && (
                            <div className="mb-6 rounded-lg bg-accent/10 px-4 py-3 text-center text-sm font-medium text-accent">
                                {status}
                            </div>
                        )}

                        {/* Mobile demo banner */}
                        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 lg:hidden">
                            <p className="mb-2 text-xs font-semibold text-primary">🧪 Demo Mode</p>
                            <div className="space-y-1.5">
                                {DEMO_ACCOUNTS.slice(0, 2).map((a) => (
                                    <button
                                        key={a.email}
                                        type="button"
                                        onClick={() => autofill(a.email)}
                                        className="flex w-full items-center justify-between rounded-lg bg-card px-3 py-2 text-left text-xs transition-colors hover:bg-muted"
                                    >
                                        <span><span className="mr-1.5">{a.icon}</span>{a.role}</span>
                                        <span className="text-muted-foreground">{a.email}</span>
                                    </button>
                                ))}
                            </div>
                            <p className="mt-2 text-center text-[10px] text-muted-foreground">
                                Password: <code className="font-mono">password</code>
                            </p>
                        </div>

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="flex flex-col gap-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-xs font-medium">Email address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="you@company.com"
                                                className="h-11"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="text-xs"
                                                        tabIndex={5}
                                                    >
                                                        Forgot password?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    placeholder="Enter your password"
                                                    className="h-11 pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="flex items-center space-x-2.5">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                            />
                                            <Label htmlFor="remember" className="text-xs text-muted-foreground">Remember me</Label>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-11 w-full gap-2 bg-primary text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing ? <Spinner /> : <ArrowRight className="h-4 w-4" />}
                                        {processing ? 'Signing in...' : 'Sign in'}
                                    </Button>

                                    {canRegister && (
                                        <p className="text-center text-sm text-muted-foreground">
                                            Don't have an account?{' '}
                                            <TextLink href="/register" tabIndex={5}>
                                                Create one
                                            </TextLink>
                                        </p>
                                    )}
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}
