import Swal from 'sweetalert2';

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[char] || char;
  });

const getCssVar = (name, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const variantConfig = {
  success: {
    accent: '#22c55e',
    glyph: 'OK',
    chip: 'Action Completed',
    confirmButtonText: 'Done',
  },
  error: {
    accent: '#ef4444',
    glyph: '!',
    chip: 'System Alert',
    confirmButtonText: 'Close',
  },
  warning: {
    accent: '#f59e0b',
    glyph: '?',
    chip: 'Review Needed',
    confirmButtonText: 'Understood',
  },
  info: {
    accent: '#60a5fa',
    glyph: 'i',
    chip: 'AI Assistant',
    confirmButtonText: 'Continue',
  },
};

const buildMessageMarkup = ({ chip, text, html }) => {
  const bodyMarkup = html && html.trim() ? html : text ? `<p>${escapeHtml(text)}</p>` : '';

  return `
    <div class="ai-alert-copy">
      <span class="ai-alert-chip">${escapeHtml(chip)}</span>
      <div class="ai-alert-message">${bodyMarkup}</div>
    </div>
  `;
};

export const showAiAlert = ({
  variant = 'info',
  title = 'Notice',
  text = '',
  html = '',
  confirmButtonText,
  cancelButtonText = 'Cancel',
  showCancelButton = false,
  showConfirmButton = true,
  timer,
  allowOutsideClick,
  allowEscapeKey = true,
  reverseButtons = false,
}) => {
  const palette = variantConfig[variant] || variantConfig.info;
  const accent = variant === 'info' ? getCssVar('--accent', palette.accent) : palette.accent;

  return Swal.fire({
    title,
    html: buildMessageMarkup({ chip: palette.chip, text, html }),
    iconHtml: `<span class="ai-alert-icon__glyph">${escapeHtml(palette.glyph)}</span>`,
    width: 'min(92vw, 460px)',
    padding: '1.5rem',
    background: getCssVar('--bg-glass', '#252830'),
    color: getCssVar('--text-main', '#f8f9fa'),
    backdrop: 'rgba(5, 10, 25, 0.72)',
    confirmButtonText: confirmButtonText || palette.confirmButtonText,
    cancelButtonText,
    showCancelButton,
    showConfirmButton,
    reverseButtons,
    timer,
    timerProgressBar: Boolean(timer),
    allowOutsideClick: typeof allowOutsideClick === 'boolean' ? allowOutsideClick : !showCancelButton,
    allowEscapeKey,
    buttonsStyling: false,
    customClass: {
      container: 'ai-alert-container',
      popup: 'ai-alert-popup',
      icon: 'ai-alert-icon',
      title: 'ai-alert-title',
      htmlContainer: 'ai-alert-body',
      actions: 'ai-alert-actions',
      confirmButton: 'ai-alert-confirm',
      cancelButton: 'ai-alert-cancel',
      timerProgressBar: 'ai-alert-progress',
    },
    didOpen: (popup) => {
      popup.style.setProperty('--ai-alert-accent', accent);
    },
  });
};

export const showAiSuccess = (options = {}) => showAiAlert({ variant: 'success', ...options });
export const showAiError = (options = {}) => showAiAlert({ variant: 'error', ...options });
export const showAiWarning = (options = {}) => showAiAlert({ variant: 'warning', ...options });
export const showAiInfo = (options = {}) => showAiAlert({ variant: 'info', ...options });

