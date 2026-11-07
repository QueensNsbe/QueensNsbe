// React "island": Astro renders this to HTML on the server, then React takes
// over in the browser (see the client:idle directive where it's used) to handle
// typing, submitting and showing the result without a page reload.
import { useState, type FormEvent } from 'react';
import { actions, isInputError } from 'astro:actions';

type Props = { variant?: 'page' | 'banner' };
type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

const SUCCESS_MESSAGES = {
  subscribed: "You're on the list. Watch your inbox for chapter news.",
  'already-subscribed': "You're already on the list. See you at the next event!",
  resubscribed: 'Welcome back! You’re subscribed again.',
} as const;

export default function SignupForm({ variant = 'page' }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus({ kind: 'sending' });

    const { data, error } = await actions.subscribe(new FormData(form));

    if (error) {
      const message = isInputError(error)
        ? Object.values(error.fields).flat()[0] ?? 'Please check your details.'
        : error.message || 'Something went wrong. Please try again.';
      setStatus({ kind: 'error', message });
      return;
    }

    setStatus({ kind: 'success', message: SUCCESS_MESSAGES[data.status] });
    form.reset();
    // The popup in BaseLayout listens for this to slide itself away.
    document.dispatchEvent(new CustomEvent('nsbe:signup-success', { detail: { variant } }));
  }

  const statusClass =
    status.kind === 'success' ? 'signup-status is-success'
    : status.kind === 'error' ? 'signup-status is-error'
    : 'signup-status';
  const statusText =
    status.kind === 'sending' ? 'Signing you up…'
    : status.kind === 'success' || status.kind === 'error' ? status.message
    : '';

  return (
    <form className={`signup-form signup-form--${variant}`} method="post" onSubmit={onSubmit} noValidate={false}>
      <input type="hidden" name="source" value={variant} />
      {/* Honeypot. Deliberately not called "company"/"website" etc., which Safari
          and password managers autofill even when hidden. */}
      <div className="signup-hp" aria-hidden="true">
        <input type="text" name="nsbe_hp_x7" tabIndex={-1} autoComplete="new-password" defaultValue="" />
      </div>
      <div className="signup-fields">
        <label className="signup-field">
          <span>Name</span>
          <input type="text" name="firstName" autoComplete="name" placeholder="Your name" required maxLength={80} />
        </label>
        <label className="signup-field">
          <span>Email</span>
          <input type="email" name="email" autoComplete="email" placeholder="you@queensu.ca" required />
        </label>
      </div>
      <button type="submit" className="btn btn-light signup-submit" disabled={status.kind === 'sending'}>
        Subscribe
      </button>
      <p className={statusClass} role="status" aria-live="polite">{statusText}</p>
    </form>
  );
}
