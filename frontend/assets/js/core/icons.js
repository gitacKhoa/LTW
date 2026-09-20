/**
 * icons.js — tiny hand-built line-icon set (24x24, stroke-based).
 * Kept dependency-free on purpose: the project should run offline
 * with nothing but these three files + Google Fonts.
 */
(function (global) {
  const base = (inner) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

  const ICONS = {
    home: base('<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9"/>'),
    users: base('<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="8.5" r="2.5"/><path d="M16 14.2c2.6.5 4.5 2.5 4.5 5.3"/>'),
    upload: base('<path d="M12 15V4"/><path d="M7.5 8.5 12 4l4.5 4.5"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>'),
    'upload-cloud': base('<path d="M7 18a4.5 4.5 0 0 1-.6-8.96A5.5 5.5 0 0 1 17.4 8.5 4 4 0 0 1 17 18H7Z"/><path d="M12 10v7"/><path d="M9 13l3-3 3 3"/>'),
    list: base('<circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/><path d="M9 6h11M9 12h11M9 18h11"/>'),
    'bar-chart': base('<path d="M4 20V10"/><path d="M11 20V4"/><path d="M18 20v-7"/><path d="M2.5 20.5h19"/>'),
    trophy: base('<path d="M8 4h8v4.2A4 4 0 0 1 12 12a4 4 0 0 1-4-3.8V4Z"/><path d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5C4 8.5 5.5 10 8 10"/><path d="M16 5h2.5A1.5 1.5 0 0 1 20 6.5c0 2-1.5 3.5-4 3.5"/><path d="M12 12v3"/><path d="M8.5 19.5h7"/><path d="M9.5 15.2 8.5 19.5"/><path d="M14.5 15.2l1 4.3"/>'),
    search: base('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/>'),
    settings: base('<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'),
    bell: base('<path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"/><path d="M10 19a2 2 0 0 0 4 0"/>'),
    moon: base('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>'),
    sun: base('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>'),
    menu: base('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    x: base('<path d="M6 6l12 12M18 6 6 18"/>'),
    'log-out': base('<path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"/><path d="M20 12H9"/><path d="m16 8 4 4-4 4"/>'),
    'chevron-down': base('<path d="m6 9 6 6 6-6"/>'),
    'graduation-cap': base('<path d="M2 9.5 12 5l10 4.5-10 4.5-10-4.5Z"/><path d="M6 11.8V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.2"/><path d="M22 9.5v5"/>'),
    star: base('<path d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.4l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3.5Z"/>'),
    'check-circle': base('<circle cx="12" cy="12" r="9"/><path d="m8.2 12.3 2.5 2.5 5-5.2"/>'),
    'x-circle': base('<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>'),
    'alert-circle': base('<circle cx="12" cy="12" r="9"/><path d="M12 8v4.5"/><circle cx="12" cy="16.2" r="0.2" fill="currentColor" stroke="none"/>'),
    'file-spreadsheet': base('<path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 16.5h6M9 13v6.2M12 13v6.2M15 13v6.2"/>'),
    edit: base('<path d="M4 20h4.2L19 9.2a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0L4 15.8V20Z"/><path d="m14 6 4 4"/>'),
    plus: base('<path d="M12 5v14M5 12h14"/>'),
    filter: base('<path d="M4 5h16l-6 7.5V19l-4 2v-8.5L4 5Z"/>'),
    'arrow-up-right': base('<path d="M7 17 17 7"/><path d="M9 7h8v8"/>'),
    'arrow-right': base('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
    lock: base('<rect x="5" y="10.5" width="14" height="9" rx="1.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
    mail: base('<rect x="3.5" y="5.5" width="17" height="13" rx="1.6"/><path d="m4.5 6.5 7.5 6 7.5-6"/>'),
    user: base('<circle cx="12" cy="8.3" r="3.3"/><path d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2"/>'),
    inbox: base('<path d="M4 12h4l1.8 2.6h4.4L16 12h4"/><path d="M5.2 6h13.6L21 12v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6L5.2 6Z"/>'),
    calendar: base('<rect x="3.5" y="5" width="17" height="15" rx="1.6"/><path d="M8 3v4M16 3v4M3.5 10h17"/>'),
    'refresh-cw': base('<path d="M20 11A8 8 0 0 0 6.3 6.3L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M4 13a8 8 0 0 0 13.7 4.7L20 15.5"/><path d="M20 20v-4.5h-4.5"/>'),
    download: base('<path d="M12 4v11"/><path d="m7.5 11 4.5 4.5 4.5-4.5"/><path d="M4 19h16"/>'),
    robot: base('<rect x="5" y="8.5" width="14" height="10" rx="2.4"/><path d="M12 8.5v-3"/><circle cx="12" cy="4" r="1.1"/><circle cx="9" cy="13.2" r="1"/><circle cx="15" cy="13.2" r="1"/><path d="M9 16.5h6"/><path d="M3 12v3M21 12v3"/>'),
    'more-horizontal': base('<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>'),
    trash: base('<path d="M5 7h14"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M7 7l1 12.5A1.5 1.5 0 0 0 9.5 21h5a1.5 1.5 0 0 0 1.5-1.5L17 7"/>'),
    keyboard: base('<rect x="3" y="6.5" width="18" height="11" rx="1.6"/><path d="M6.5 10h.01M9.5 10h.01M12.5 10h.01M15.5 10h.01M17.5 10h.01M6.5 13.5h11"/>'),
  };

  function icon(name, cls) {
    const svg = ICONS[name] || ICONS['alert-circle'];
    if (!cls) return svg;
    return svg.replace('<svg ', `<svg class="${cls}" `);
  }

  global.Icons = { icon, raw: ICONS };
})(window);
