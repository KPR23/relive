import { addPasskey } from '../lib/auth/auth-client';

export const AddPasskey = () => {
  return (
    <div>
      <button onClick={addPasskey}>Add Passkey</button>
    </div>
  );
};
