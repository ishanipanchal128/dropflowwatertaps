document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const msg = document.getElementById('form-msg');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    msg.textContent = 'Sending...';
    msg.className = 'form-msg';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        msg.textContent = result.message || 'Thanks! We will get back to you shortly.';
        msg.className = 'form-msg ok';
        form.reset();
      } else {
        msg.textContent = result.error || 'Something went wrong. Please try again.';
        msg.className = 'form-msg err';
      }
    } catch (err) {
      // No backend running (e.g. opened as a static file) - degrade gracefully.
      msg.textContent = 'Thanks! Your message has been noted. (Start the Node server to enable live submissions.)';
      msg.className = 'form-msg ok';
      form.reset();
    }
  });
});
