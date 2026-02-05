'use client';

import { useState } from 'react';
import { addPasskey } from '../lib/auth/auth-client';

export const AddPasskey = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddPasskey = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data, error: passkeyError } = await addPasskey();

      if (passkeyError) {
        setError(passkeyError.message || 'Failed to add passkey');
      } else if (data) {
        setSuccessMessage('Passkey added successfully!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleAddPasskey} disabled={isLoading}>
        {isLoading ? 'Adding Passkey...' : 'Add Passkey'}
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {successMessage && <p className="text-green-500 text-sm mt-1">{successMessage}</p>}
    </div>
  );
};
