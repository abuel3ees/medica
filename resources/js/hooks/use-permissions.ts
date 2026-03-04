import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { userPermissions = [], userRoles = [] } = usePage().props;

    return {
        /** Check if user has a specific permission */
        can: (permission: string) => userPermissions.includes(permission),

        /** Check if user lacks a specific permission */
        cannot: (permission: string) => !userPermissions.includes(permission),

        /** Check if user has ALL of the given permissions */
        canAll: (permissions: string[]) => permissions.every((p) => userPermissions.includes(p)),

        /** Check if user has ANY of the given permissions */
        canAny: (permissions: string[]) => permissions.some((p) => userPermissions.includes(p)),

        /** Check if user has a specific role */
        hasRole: (role: string) => userRoles.includes(role),

        /** Check if user has ANY of the given roles */
        hasAnyRole: (roles: string[]) => roles.some((r) => userRoles.includes(r)),

        /** Raw arrays */
        permissions: userPermissions,
        roles: userRoles,
    };
}
