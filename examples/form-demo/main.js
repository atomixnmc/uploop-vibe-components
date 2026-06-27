// ─── Form Demo — Inputs, selects, checkboxes, validation ─────

import { component, html } from '@uploop/html'
import { Input, Textarea, Select, Checkbox, Button, Card, Stack } from '@uploop-vibe/vibe'

export const FormDemo = component('FormDemo', {
  state: {
    name: '',
    email: '',
    role: '',
    bio: '',
    agree: false,
    submitted: false,
    errors: {},
  },

  update: {
    setName: (s, name) => ({ ...s, name }),
    setEmail: (s, email) => ({ ...s, email }),
    setRole: (s, role) => ({ ...s, role }),
    setBio: (s, bio) => ({ ...s, bio }),
    toggleAgree: (s) => ({ ...s, agree: !s.agree }),
    submit: (s) => {
      const errors = {}
      if (!s.name.trim()) errors.name = 'Name is required'
      if (!s.email.trim()) errors.email = 'Email is required'
      else if (!s.email.includes('@')) errors.email = 'Invalid email'
      if (!s.agree) errors.agree = 'You must agree to terms'
      if (Object.keys(errors).length > 0) return { ...s, errors }
      return { ...s, errors: {}, submitted: true }
    },
    reset: () => ({
      name: '', email: '', role: '', bio: '', agree: false, submitted: false, errors: {}
    }),
  },

  view: (state, { send }) => {
    if (state.submitted) {
      return html`<div style="padding:2rem;text-align:center;">
        <div style="font-size:3rem;">✅</div>
        <h3 style="margin:0.5rem 0;">Submitted!</h3>
        <p style="color:#666;margin:0 0 1rem;">Name: ${state.name}<br/>Email: ${state.email}<br/>Role: ${state.role || '-'}</p>
        <button @click=${() => send('reset')} style="
          padding:0.5rem 1.25rem;background:var(--vibe-color-primary600);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:500;
        ">Start Over</button>
      </div>`
    }

    return html`<div style="padding:1.5rem;max-width:32rem;margin:0 auto;">
      <h3 style="margin:0 0 1.25rem;font-size:1.1rem;font-weight:600;">Contact Form</h3>

      ${Input.view({ ...state, label: 'Full Name', placeholder: 'Enter your name', error: state.errors.name, value: state.name, required: true }, { send: (e, v) => send('setName', v), html })}
      <div style="height:0.75rem;"></div>

      ${Input.view({ ...state, label: 'Email', type: 'email', placeholder: 'you@example.com', error: state.errors.email, value: state.email, required: true }, { send: (e, v) => send('setEmail', v), html })}
      <div style="height:0.75rem;"></div>

      ${Select.view({ ...state, label: 'Role', value: state.role, options: [
        { value: 'dev', label: 'Developer' },
        { value: 'design', label: 'Designer' },
        { value: 'pm', label: 'Product Manager' },
        { value: 'other', label: 'Other' },
      ], placeholder: 'Select role...' }, { send: (e, v) => send('setRole', v), html })}
      <div style="height:0.75rem;"></div>

      ${Textarea.view({ ...state, label: 'Bio', placeholder: 'Tell us about yourself...', value: state.bio, rows: 3 }, { send: (e, v) => send('setBio', v), html })}
      <div style="height:0.75rem;"></div>

      ${Checkbox.view({ ...state, label: 'I agree to the terms and conditions', checked: state.agree }, { send: (e) => send('toggleAgree'), html })}
      ${state.errors.agree ? `<p style="color:var(--vibe-color-error);font-size:0.75rem;margin:0.25rem 0 0;">${state.errors.agree}</p>` : ''}
      <div style="height:1rem;"></div>

      <div style="display:flex;gap:0.75rem;">
        <button @click=${() => send('submit')} style="
          padding:0.6rem 1.5rem;background:var(--vibe-color-primary600);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:500;
        ">Submit</button>
        <button @click=${() => send('reset')} style="
          padding:0.6rem 1.5rem;background:transparent;color:#666;border:1px solid #ddd;border-radius:8px;cursor:pointer;
        ">Reset</button>
      </div>
    </div>`
  }
})
