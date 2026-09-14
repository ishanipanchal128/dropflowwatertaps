/* ===================================================================
   Drop Flow — Product Inquiry widget
   Self-contained: injects its own styles, floating button, and modal.
   Does not touch any existing markup, styles, or scripts on the page.
   Hooks itself onto:
     - the floating "Inquiry" button it creates (always visible)
     - any element with class "btn-quote"  (header "Get Quote")
     - the "Get Quote" button on the product detail page
   =================================================================== */
(function () {
  'use strict';

  var CATEGORIES = [
    { slug: 'ptmt-crystal', group: 'PTMT Series', name: 'PTMT Crystal Series' },
    { slug: 'ptmt-fusion', group: 'PTMT Series', name: 'PTMT Fusion Series' },
    { slug: 'ptmt-royal', group: 'PTMT Series', name: 'PTMT Royal Series' },
    { slug: 'ptmt-standard', group: 'PTMT Series', name: 'PTMT Standard Series' },
    { slug: 'pprc-m-series', group: 'PPRC Series', name: 'PPRC M Series' },
    { slug: 'pprc-m-series-crystal', group: 'PPRC Series', name: 'PPRC M Series Crystal' },
    { slug: 'pprc-standard', group: 'PPRC Series', name: 'PPRC Standard Series' },
    { slug: 'pprc-royal', group: 'PPRC Series', name: 'PPRC Royal Series' },
    { slug: 'pprc-fusion', group: 'PPRC Series', name: 'PPRC Fusion Series' },
    { slug: 'pprc-delux', group: 'PPRC Series', name: 'PPRC Delux Series' },
    { slug: 'pprc-hex', group: 'PPRC Series', name: 'PPRC Hex Series' },
    { slug: 'ptmt-health-faucet', group: 'Accessories', name: 'PTMT Health Faucet' },
    { slug: 'other-bath-accessories', group: 'Accessories', name: 'Other Bath Accessories' }
  ];

  /* ---------------- styles (scoped under .dfq-) ---------------- */
  var css = ''
    + '.dfq-fab{position:fixed;right:22px;bottom:22px;z-index:9998;display:flex;align-items:center;gap:10px;'
    + 'background:var(--navy,#032b3c);color:#fff;border:none;padding:14px 20px 14px 16px;border-radius:999px;'
    + 'box-shadow:0 10px 24px rgba(3,43,60,.35);cursor:pointer;font-family:"Poppins",sans-serif;font-size:.95rem;'
    + 'font-weight:500;transition:transform .2s ease,background .2s ease;animation:dfqPop .5s ease .3s both;}'
    + '.dfq-fab:hover{background:var(--teal,#1e8a9e);transform:translateY(-3px);}'
    + '.dfq-fab svg{width:20px;height:20px;flex-shrink:0;}'
    + '@keyframes dfqPop{0%{transform:scale(.4) translateY(20px);opacity:0;}70%{transform:scale(1.08) translateY(0);opacity:1;}100%{transform:scale(1);}}'
    + '.dfq-overlay{position:fixed;inset:0;background:rgba(3,43,60,.55);z-index:9999;display:none;'
    + 'align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .2s ease;}'
    + '.dfq-overlay.dfq-open{display:flex;opacity:1;}'
    + '.dfq-modal{background:#fff;width:100%;max-width:460px;border-radius:14px;padding:28px 26px 24px;'
    + 'max-height:90vh;overflow-y:auto;font-family:"Poppins",sans-serif;color:var(--navy,#032b3c);'
    + 'transform:scale(.92) translateY(10px);opacity:0;transition:transform .25s ease,opacity .25s ease;position:relative;}'
    + '.dfq-overlay.dfq-open .dfq-modal{transform:scale(1) translateY(0);opacity:1;}'
    + '.dfq-close{position:absolute;top:14px;right:14px;background:none;border:none;font-size:22px;line-height:1;'
    + 'color:#8a99a1;cursor:pointer;padding:4px;}'
    + '.dfq-close:hover{color:var(--navy,#032b3c);}'
    + '.dfq-modal h3{margin:0 0 4px;font-size:1.3rem;font-weight:600;}'
    + '.dfq-modal p.dfq-sub{margin:0 0 18px;font-size:.88rem;color:#5c6b73;}'
    + '.dfq-context{background:#eef6f8;border:1px solid #d8ecf0;border-radius:8px;padding:8px 12px;'
    + 'font-size:.82rem;color:#1e8a9e;margin-bottom:16px;}'
    + '.dfq-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}'
    + '.dfq-field{margin-bottom:14px;}'
    + '.dfq-field label{display:block;font-size:.8rem;font-weight:600;margin-bottom:6px;color:var(--navy,#032b3c);}'
    + '.dfq-field input,.dfq-field select,.dfq-field textarea{width:100%;border:1px solid #d7dde0;border-radius:8px;'
    + 'padding:10px 12px;font-size:.9rem;font-family:inherit;color:var(--navy,#032b3c);background:#fbfcfc;}'
    + '.dfq-field textarea{min-height:80px;resize:vertical;}'
    + '.dfq-field input:focus,.dfq-field select:focus,.dfq-field textarea:focus{outline:none;border-color:var(--teal,#1e8a9e);}'
    + '.dfq-field.dfq-error input,.dfq-field.dfq-error select,.dfq-field.dfq-error textarea{border-color:#c24e4e;}'
    + '.dfq-err-msg{display:none;color:#c24e4e;font-size:.76rem;margin-top:5px;}'
    + '.dfq-field.dfq-error .dfq-err-msg{display:block;}'
    + '.dfq-purpose{display:flex;gap:18px;margin-bottom:16px;flex-wrap:wrap;}'
    + '.dfq-purpose label{display:flex;align-items:center;gap:7px;font-size:.85rem;cursor:pointer;font-weight:400;}'
    + '.dfq-purpose input{accent-color:var(--teal,#1e8a9e);width:15px;height:15px;}'
    + '.dfq-qty{max-height:0;overflow:hidden;opacity:0;transition:max-height .3s ease,opacity .25s ease,margin .3s ease;}'
    + '.dfq-qty.dfq-show{max-height:110px;opacity:1;margin-bottom:14px;}'
    + '.dfq-top-error{display:none;background:#fbeded;border:1px solid #eccac7;color:#c24e4e;padding:9px 12px;'
    + 'border-radius:8px;font-size:.82rem;margin-bottom:14px;}'
    + '.dfq-top-error.dfq-show{display:block;}'
    + '.dfq-submit{width:100%;background:var(--navy,#032b3c);color:#fff;border:none;padding:12px 20px;'
    + 'border-radius:999px;font-size:.95rem;font-weight:600;cursor:pointer;font-family:inherit;'
    + 'transition:background .2s ease;}'
    + '.dfq-submit:hover{background:var(--teal,#1e8a9e);}'
    + '.dfq-submit[disabled]{opacity:.65;cursor:default;}'
    + '.dfq-success{display:none;text-align:center;padding:10px 0 4px;}'
    + '.dfq-success.dfq-show{display:block;}'
    + '.dfq-success svg{width:44px;height:44px;margin-bottom:10px;}'
    + '.dfq-success h3{margin-bottom:6px;}'
    + '.dfq-success p{font-size:.88rem;color:#5c6b73;}'
    + '.dfq-again{margin-top:16px;background:#fff;border:1px solid #d7dde0;color:var(--navy,#032b3c);'
    + 'padding:9px 18px;border-radius:999px;font-size:.85rem;cursor:pointer;font-family:inherit;}'
    + '@media (max-width:480px){.dfq-row{grid-template-columns:1fr;}}'
    + '@media (prefers-reduced-motion: reduce){.dfq-fab{animation:none;}.dfq-overlay,.dfq-modal{transition:none;}}';

  var styleTag = document.createElement('style');
  styleTag.id = 'dfq-styles';
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  /* ---------------- markup ---------------- */
  var categoryOptionsHtml = (function () {
    var groups = {};
    CATEGORIES.forEach(function (c) {
      groups[c.group] = groups[c.group] || [];
      groups[c.group].push(c);
    });
    var html = '<option value="">Select a product / series</option>';
    Object.keys(groups).forEach(function (g) {
      html += '<optgroup label="' + g + '">';
      groups[g].forEach(function (c) {
        html += '<option value="' + c.slug + '">' + c.name + '</option>';
      });
      html += '</optgroup>';
    });
    html += '<option value="not-sure">Not sure yet</option>';
    return html;
  })();

  var fab = document.createElement('button');
  fab.className = 'dfq-fab';
  fab.type = 'button';
  fab.setAttribute('aria-haspopup', 'dialog');
  fab.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" ' +
    'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '<span>Product Inquiry</span>';
  document.body.appendChild(fab);

  var overlay = document.createElement('div');
  overlay.className = 'dfq-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML =
    '<div class="dfq-modal">' +
      '<button type="button" class="dfq-close" aria-label="Close">&times;</button>' +
      '<div id="dfqFormView">' +
        '<h3 id="dfqTitle">Send a Product Inquiry</h3>' +
        '<p class="dfq-sub" id="dfqSub">Tell us what you need and our team will get back to you shortly.</p>' +
        '<div class="dfq-context" id="dfqContext" style="display:none;"></div>' +
        '<div class="dfq-top-error" id="dfqTopError">Please fill in the required fields below.</div>' +
        '<form id="dfqForm" novalidate>' +
          '<div class="dfq-row">' +
            '<div class="dfq-field" id="dfqFieldName">' +
              '<label for="dfqName">Full Name</label>' +
              '<input type="text" id="dfqName" autocomplete="name">' +
              '<div class="dfq-err-msg">Please enter your name.</div>' +
            '</div>' +
            '<div class="dfq-field" id="dfqFieldPhone">' +
              '<label for="dfqPhone">Phone Number</label>' +
              '<input type="tel" id="dfqPhone" autocomplete="tel">' +
              '<div class="dfq-err-msg">Please enter your phone number.</div>' +
            '</div>' +
          '</div>' +
          '<div class="dfq-field" id="dfqFieldEmail">' +
            '<label for="dfqEmail">Email Address</label>' +
            '<input type="email" id="dfqEmail" autocomplete="email">' +
            '<div class="dfq-err-msg">Please enter a valid email address.</div>' +
          '</div>' +
          '<div class="dfq-field" id="dfqFieldProduct">' +
            '<label for="dfqProduct">Which product are you interested in?</label>' +
            '<select id="dfqProduct">' + categoryOptionsHtml + '</select>' +
          '</div>' +
          '<div class="dfq-purpose">' +
            '<label><input type="radio" name="dfqPurpose" value="inquiry" checked> General inquiry</label>' +
            '<label><input type="radio" name="dfqPurpose" value="quote"> Get a quote</label>' +
          '</div>' +
          '<div class="dfq-qty" id="dfqQtyWrap">' +
            '<div class="dfq-field" style="margin-bottom:0;">' +
              '<label for="dfqQty">Estimated Quantity <span style="font-weight:400;color:#8a99a1;">(optional)</span></label>' +
              '<input type="text" id="dfqQty" placeholder="e.g. 50 pieces">' +
            '</div>' +
          '</div>' +
          '<div class="dfq-field" id="dfqFieldMessage">' +
            '<label for="dfqMessage">Message</label>' +
            '<textarea id="dfqMessage" placeholder="Tell us more about what you need..."></textarea>' +
            '<div class="dfq-err-msg">Please add a short message.</div>' +
          '</div>' +
          '<button type="submit" class="dfq-submit" id="dfqSubmitBtn">Send Inquiry</button>' +
        '</form>' +
      '</div>' +
      '<div class="dfq-success" id="dfqSuccess">' +
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="12" cy="12" r="11" fill="#eaf5ee"/>' +
        '<path d="M7 12.5L10.5 16L17 8.5" stroke="#3f8a5b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
        '<h3 id="dfqSuccessTitle">Inquiry Sent</h3>' +
        '<p id="dfqSuccessBody">Thanks — we will get back to you shortly.</p>' +
        '<button type="button" class="dfq-again" id="dfqAgainBtn">Send another inquiry</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  /* ---------------- behaviour ---------------- */
  var formView = document.getElementById('dfqFormView');
  var form = document.getElementById('dfqForm');
  var successView = document.getElementById('dfqSuccess');
  var topError = document.getElementById('dfqTopError');
  var submitBtn = document.getElementById('dfqSubmitBtn');
  var qtyWrap = document.getElementById('dfqQtyWrap');
  var contextBox = document.getElementById('dfqContext');
  var titleEl = document.getElementById('dfqTitle');
  var subEl = document.getElementById('dfqSub');
  var successTitle = document.getElementById('dfqSuccessTitle');
  var successBody = document.getElementById('dfqSuccessBody');
  var purposeRadios = form.querySelectorAll('input[name="dfqPurpose"]');
  var lastFocused = null;
  var currentContext = { productName: '', categorySlug: '' };

  function setPurposeUI(value) {
    var isQuote = value === 'quote';
    qtyWrap.classList.toggle('dfq-show', isQuote);
    titleEl.textContent = isQuote ? 'Request a Quote' : 'Send a Product Inquiry';
    subEl.textContent = isQuote
      ? "Tell us what you need and we'll send you pricing."
      : 'Tell us what you need and our team will get back to you shortly.';
    submitBtn.textContent = isQuote ? 'Request Quote' : 'Send Inquiry';
  }
  purposeRadios.forEach(function (r) {
    r.addEventListener('change', function () { setPurposeUI(r.value); });
  });

  function openModal(opts) {
    opts = opts || {};
    lastFocused = document.activeElement;
    form.reset();
    clearErrors();
    successView.classList.remove('dfq-show');
    formView.style.display = 'block';

    currentContext = { productName: opts.productName || '', categorySlug: opts.categorySlug || '' };
    if (currentContext.productName) {
      contextBox.style.display = 'block';
      contextBox.textContent = 'Regarding: ' + currentContext.productName;
    } else {
      contextBox.style.display = 'none';
      contextBox.textContent = '';
    }

    if (currentContext.categorySlug) {
      var sel = document.getElementById('dfqProduct');
      var match = Array.prototype.slice.call(sel.options).some(function (o) { return o.value === currentContext.categorySlug; });
      sel.value = match ? currentContext.categorySlug : '';
    }

    var purposeValue = opts.purpose === 'quote' ? 'quote' : 'inquiry';
    form.querySelector('input[name="dfqPurpose"][value="' + purposeValue + '"]').checked = true;
    setPurposeUI(purposeValue);

    overlay.classList.add('dfq-open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { document.getElementById('dfqName').focus(); }, 150);
  }

  function closeModal() {
    overlay.classList.remove('dfq-open');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  overlay.querySelector('.dfq-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('dfq-open')) closeModal();
  });

  fab.addEventListener('click', function () { openModal({ purpose: 'inquiry' }); });

  function clearErrors() {
    form.querySelectorAll('.dfq-field.dfq-error').forEach(function (f) { f.classList.remove('dfq-error'); });
    topError.classList.remove('dfq-show');
  }
  function markError(id) { document.getElementById(id).classList.add('dfq-error'); }
  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();

    var name = document.getElementById('dfqName').value.trim();
    var phone = document.getElementById('dfqPhone').value.trim();
    var email = document.getElementById('dfqEmail').value.trim();
    var message = document.getElementById('dfqMessage').value.trim();
    var hasError = false;

    if (!name) { markError('dfqFieldName'); hasError = true; }
    if (!phone) { markError('dfqFieldPhone'); hasError = true; }
    if (!email || !isValidEmail(email)) { markError('dfqFieldEmail'); hasError = true; }
    if (!message) { markError('dfqFieldMessage'); hasError = true; }

    if (hasError) {
      topError.classList.add('dfq-show');
      var firstErr = form.querySelector('.dfq-field.dfq-error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    var purpose = form.querySelector('input[name="dfqPurpose"]:checked').value;
    var productSel = document.getElementById('dfqProduct');
    var productLabel = productSel.options[productSel.selectedIndex].text;
    var qty = document.getElementById('dfqQty').value.trim();

    var fullMessage = 'Inquiry type: ' + (purpose === 'quote' ? 'Get a quote' : 'General inquiry') + '\n' +
      'Product interest: ' + productLabel + (currentContext.productName ? ' (' + currentContext.productName + ')' : '') + '\n' +
      (purpose === 'quote' && qty ? 'Estimated quantity: ' + qty + '\n' : '') +
      '\n' + message;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, phone: phone, email: email, message: fullMessage })
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (result) {
        showSuccess(purpose, email, result.ok ? (result.data && result.data.message) : null);
      })
      .catch(function () {
        // No backend running (e.g. static file preview) - degrade gracefully, same as the contact page.
        showSuccess(purpose, email, null);
      });
  });

  function showSuccess(purpose, email, serverMessage) {
    successTitle.textContent = purpose === 'quote' ? 'Quote Request Sent' : 'Inquiry Sent';
    successBody.textContent = serverMessage
      ? serverMessage
      : (purpose === 'quote'
          ? 'Thanks — your quote request has been noted. Our team will send pricing to ' + email + ' shortly.'
          : 'Thanks — your inquiry has been noted. Our team will get back to you at ' + email + ' shortly.');
    formView.style.display = 'none';
    successView.classList.add('dfq-show');
    submitBtn.disabled = false;
  }

  document.getElementById('dfqAgainBtn').addEventListener('click', function () {
    successView.classList.remove('dfq-show');
    formView.style.display = 'block';
    form.reset();
    clearErrors();
    setPurposeUI('inquiry');
  });

  /* ---------------- hook into existing "Get Quote" buttons ---------------- */
  function attachQuoteIntercept() {
    var quoteButtons = document.querySelectorAll('.btn-quote');
    quoteButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal({ purpose: 'quote' });
      });
    });

    // Product detail page: the primary "Get Quote" button next to the product info
    var detailInfo = document.querySelector('.detail-info');
    if (detailInfo) {
      var detailQuoteBtn = detailInfo.querySelector('a.btn-primary');
      if (detailQuoteBtn) {
        detailQuoteBtn.addEventListener('click', function (e) {
          e.preventDefault();
          var nameEl = document.getElementById('detail-name');
          var name = nameEl ? nameEl.textContent.trim() : '';
          openModal({ purpose: 'quote', productName: name, categorySlug: '' });
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachQuoteIntercept);
  } else {
    attachQuoteIntercept();
  }
})();
