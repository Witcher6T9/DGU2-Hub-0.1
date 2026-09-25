/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Firebase integration is temporarily suspended for local development.
// All authentication and factory data operate in local-first mode (IndexedDB + localStorage).
// Ready to be re-connected before final production publish.

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: 'local-offline-usr',
      email: 'realmec85pro231@gmail.com',
      emailVerified: true,
      isAnonymous: false,
    },
    operationType,
    path
  };
  console.info('Local development mode: Firestore operation stubbed.', errInfo);
}

// Stub database object for type compatibility
export const db = {} as any;
export const auth = {
  currentUser: {
    uid: 'local-offline-user',
    email: 'realmec85pro231@gmail.com',
    displayName: 'IE Engineer (Local)'
  }
} as any;

/**
 * Health check probe: returns immediately in local mode with no network overhead.
 */
export async function testConnection(): Promise<void> {
  return Promise.resolve();
}

// In-memory token & profile store
let cachedAccessToken: string | null = 'local-auth-token-active';
type AuthCallback = (user: any, token: string) => void;
const authListeners: Set<AuthCallback> = new Set();

let currentLocalUser: any = (() => {
  try {
    const saved = localStorage.getItem('ie_user_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        uid: parsed.googleUid || 'local-usr-admin',
        displayName: parsed.name || 'Lead IE Engineer',
        email: parsed.email || 'realmec85pro231@gmail.com',
        photoURL: parsed.photoURL || undefined
      };
    }
  } catch {}
  return {
    uid: 'local-usr-admin',
    displayName: 'Lead IE Engineer',
    email: 'realmec85pro231@gmail.com',
    photoURL: undefined
  };
})();

/**
 * Subscribes to authentication state changes locally without Firebase network calls.
 */
export const initAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (currentLocalUser && onAuthSuccess) {
    onAuthSuccess(currentLocalUser, cachedAccessToken || 'local-auth-token-active');
  } else if (!currentLocalUser && onAuthFailure) {
    onAuthFailure();
  }

  if (onAuthSuccess) {
    authListeners.add(onAuthSuccess);
  }

  return () => {
    if (onAuthSuccess) {
      authListeners.delete(onAuthSuccess);
    }
  };
};

/**
 * Direct Google Profile Authentication for local development (no external OAuth pop-up needed).
 */
export const googleSignIn = async (userEmail?: string): Promise<{ user: any; accessToken: string; error?: string } | null> => {
  const emailToUse = userEmail || 'realmec85pro231@gmail.com';
  const simulatedUser = {
    uid: 'google-usr-' + (emailToUse.split('@')[0] || 'local'),
    displayName: emailToUse === 'realmec85pro231@gmail.com' ? 'Admin / Lead IE' : emailToUse.split('@')[0],
    email: emailToUse,
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
  };

  currentLocalUser = simulatedUser;
  cachedAccessToken = 'local-token-' + Date.now();

  authListeners.forEach(listener => {
    try {
      listener(simulatedUser, cachedAccessToken!);
    } catch {}
  });

  return { user: simulatedUser, accessToken: cachedAccessToken };
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken || 'local-auth-token';
};

export const googleSignOut = async () => {
  currentLocalUser = null;
  cachedAccessToken = null;
  authListeners.forEach(listener => {
    try {
      listener(null, '');
    } catch {}
  });
};
