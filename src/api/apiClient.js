import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

/**
 * Creates a generic API Client wrapper around Firebase Callable Functions.
 * 
 * Features:
 * - Automatically injects Auth state via Firebase SDK.
 * - Standardizes error mapping and throws structured errors.
 * - Provides a unified choke point for global loading states or toast triggers.
 */
class ApiClient {
  constructor() {
    this.functions = getFunctions(getApp());
    this.auth = getAuth(getApp());
  }

  /**
   * Internal executor with standardized error catching
   */
  async _execute(functionName, payload = {}) {
    try {
      const callable = httpsCallable(this.functions, functionName);
      const result = await callable(payload);
      return result.data;
    } catch (error) {
      this._handleError(functionName, error);
    }
  }

  /**
   * Centralized error mapping
   */
  _handleError(functionName, error) {
    console.error(`[ApiClient Error] ${functionName}:`, error);

    const mappedError = {
      code: error.code || 'unknown',
      message: error.message || 'An unexpected error occurred.',
      originalError: error
    };

    // In a real application, we might dispatch this to a global Toast Store here.
    // e.g., if (mappedError.code === 'unauthenticated') useAppStore.getState().showToast('Please log in again');

    throw mappedError;
  }

  // HTTP-like wrappers for conceptual consistency, though under the hood it's all RPC
  
  async post(functionName, payload) {
    return await this._execute(functionName, payload);
  }

  async get(functionName, payload) {
    return await this._execute(functionName, payload);
  }
}

export const apiClient = new ApiClient();
