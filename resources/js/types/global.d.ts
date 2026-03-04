import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            userPermissions: string[];
            userRoles: string[];
            unreadNotifications: number;
            featureFlags: Record<string, boolean>;
            [key: string]: unknown;
        };
    }
}
