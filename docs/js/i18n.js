/* ReloCompass i18n — en (base), hi, ne, es, fr.
 * Usage: elements carry data-i18n="key" (textContent), data-i18n-placeholder="key"
 * (input placeholder), data-i18n-html="key" (innerHTML, translator-controlled),
 * data-i18n-aria-label="key". Language chosen from ?lang=, localStorage
 * 'relo_lang', then navigator.language, then 'en'.
 */
(function () {
  'use strict';

  var I18N = {
    en: {
      'nav.assistant': 'AI Assistant', 'nav.home': 'Home', 'nav.features': 'Features',
      'nav.students': 'Students', 'nav.destinations': 'Destinations', 'nav.employers': 'Employers',
      'nav.jobs': 'Jobs', 'nav.about': 'About', 'nav.contact': 'Contact',
      'nav.login': 'Login', 'nav.signup': 'Sign Up Free', 'nav.dashboard': 'Dashboard',
      'nav.community': 'Community',
      'reset.title': 'Choose a new password',
      'reset.subtitle': 'Enter a new password for your ReloCompass account.',
      'reset.newPassword': 'New password', 'reset.newPasswordPh': 'At least 6 characters',
      'reset.confirmPassword': 'Confirm new password', 'reset.confirmPasswordPh': 'Repeat your new password',
      'reset.submit': 'Update password', 'reset.backToLogin': '← Back to login',
      'reset.missingToken': 'This reset link is missing its token. Request a new reset email from the login page.',
      'reset.mismatch': 'Passwords do not match.',
      'reset.tooShort': 'Password must be at least 6 characters.',
      'reset.ok': 'Password updated — you can now log in.',
      'reset.fail': 'Could not update the password. The link may have expired.',
      'reset.network': 'Network error — please try again.',
      'forgot.link': 'Forgot password?',
      'forgot.sending': 'Sending…',
      'forgot.needEmail': 'Enter your email address above first.',
      'forgot.sent': 'If that email is registered, a reset link is on its way. Check your inbox (or the admin email log in development).',
      'forgot.fail': 'Could not send the reset email right now — please try again.',
      'forgot.network': 'Network error — please try again.',
      'saved.title': 'Saved Items', 'saved.subtitle': 'Jobs and accommodation you bookmarked.', 'saved.jobs': 'Saved Jobs', 'saved.accommodations': 'Saved Accommodation', 'saved.empty': 'Nothing saved yet. Browse jobs and accommodation and tap Save.', 'saved.removed': 'Removed.', 'nav.saved': 'Saved', 'nav.planner': 'Planner', 'nav.settings': 'Settings', 'nav.transport': 'Transport', 'nav.accommodation': 'Accommodation', 'notif.title': 'Notifications', 'notif.empty': 'No notifications yet.', 'notif.markAllRead': 'Mark all read', 'settings.title': 'Account Settings', 'settings.language': 'Interface language', 'settings.password': 'Change password', 'settings.currentPw': 'Current password', 'settings.newPw': 'New password', 'settings.changePw': 'Update password', 'settings.pwChanged': 'Password updated.', 'settings.langChanged': 'Language saved.', 'planner.title': 'Relocation Planner', 'planner.subtitle': 'Plan your move and track every step.', 'planner.country': 'Destination country', 'planner.city': 'Destination city', 'planner.moveDate': 'Target move date', 'planner.notes': 'Notes', 'planner.checklist': 'Checklist', 'planner.save': 'Save plan', 'planner.saved': 'Saved', 'transport.title': 'Transportation', 'transport.subtitle': 'Getting around your new city — official providers first.', 'lang.label': 'Language'
    },
    hi: {
      'nav.assistant': 'एआई सहायक', 'nav.home': 'होम', 'nav.features': 'विशेषताएँ',
      'nav.students': 'छात्र', 'nav.destinations': 'गंतव्य', 'nav.employers': 'नियोक्ता',
      'nav.jobs': 'नौकरियाँ', 'nav.about': 'परिचय', 'nav.contact': 'संपर्क',
      'nav.login': 'लॉग इन', 'nav.signup': 'मुफ़्त साइन अप करें', 'nav.dashboard': 'डैशबोर्ड',
      'nav.community': 'समुदाय',
      'reset.title': 'नया पासवर्ड चुनें',
      'reset.subtitle': 'अपने ReloCompass खाते के लिए नया पासवर्ड दर्ज करें।',
      'reset.newPassword': 'नया पासवर्ड', 'reset.newPasswordPh': 'कम से कम 6 अक्षर',
      'reset.confirmPassword': 'नए पासवर्ड की पुष्टि करें', 'reset.confirmPasswordPh': 'अपना नया पासवर्ड दोबारा लिखें',
      'reset.submit': 'पासवर्ड अपडेट करें', 'reset.backToLogin': '← लॉग इन पर वापस जाएँ',
      'reset.missingToken': 'इस रीसेट लिंक में टोकन नहीं है। लॉग इन पेज से नया रीसेट ईमेल अनुरोध करें।',
      'reset.mismatch': 'पासवर्ड मेल नहीं खाते।',
      'reset.tooShort': 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
      'reset.ok': 'पासवर्ड अपडेट हो गया — अब आप लॉग इन कर सकते हैं।',
      'reset.fail': 'पासवर्ड अपडेट नहीं हो सका। लिंक समाप्त हो गया होगा।',
      'reset.network': 'नेटवर्क त्रुटि — कृपया पुनः प्रयास करें।',
      'forgot.link': 'पासवर्ड भूल गए?',
      'forgot.sending': 'भेज रहे हैं…',
      'forgot.needEmail': 'पहले ऊपर अपना ईमेल पता दर्ज करें।',
      'forgot.sent': 'यदि यह ईमेल पंजीकृत है, तो रीसेट लिंक भेज दिया गया है। अपना इनबॉक्स देखें।',
      'forgot.fail': 'अभी रीसेट ईमेल नहीं भेजा जा सका — कृपया पुनः प्रयास करें।',
      'forgot.network': 'नेटवर्क त्रुटि — कृपया पुनः प्रयास करें।',
      'saved.title': 'सहेजे गए', 'saved.subtitle': 'आपके बुकमार्क किए गए कार्य और आवास।', 'saved.jobs': 'सहेजे गए कार्य', 'saved.accommodations': 'सहेजा आवास', 'saved.empty': 'अभी कुछ सहेजा नहीं गया। कार्य और आवास देखें और सहेजें पर टैप करें।', 'saved.removed': 'हटा दिया गया।', 'nav.saved': 'सहेजे गए', 'nav.planner': 'प्लानर', 'nav.settings': 'सेटिंग्स', 'nav.transport': 'परिवहन', 'nav.accommodation': 'आवास', 'notif.title': 'सूचनाएँ', 'notif.empty': 'अभी कोई सूचना नहीं।', 'notif.markAllRead': 'सभी पढ़ी हुई चिह्नित करें', 'settings.title': 'खाता सेटिंग्स', 'settings.language': 'इंटरफ़ेस भाषा', 'settings.password': 'पासवर्ड बदलें', 'settings.currentPw': 'वर्तमान पासवर्ड', 'settings.newPw': 'नया पासवर्ड', 'settings.changePw': 'पासवर्ड अपडेट करें', 'settings.pwChanged': 'पासवर्ड अपडेट हो गया।', 'settings.langChanged': 'भाषा सहेज दी गई।', 'planner.title': 'स्थानांतरण प्लानर', 'planner.subtitle': 'अपनी यात्रा की योजना बनाएँ और हर कदम ट्रैक करें।', 'planner.country': 'गंतव्य देश', 'planner.city': 'गंतव्य शहर', 'planner.moveDate': 'लक्षित तिथि', 'planner.notes': 'टिप्पणियाँ', 'planner.checklist': 'चेकलिस्ट', 'planner.save': 'योजना सहेजें', 'planner.saved': 'सहेजा गया', 'transport.title': 'परिवहन', 'transport.subtitle': 'अपने नए शहर में आवागमन — पहले आधिकारिक प्रदाता।', 'lang.label': 'भाषा'
    },
    ne: {
      'nav.assistant': 'एआई सहायक', 'nav.home': 'गृहपृष्ठ', 'nav.features': 'विशेषताहरू',
      'nav.students': 'विद्यार्थी', 'nav.destinations': 'गन्तव्य', 'nav.employers': 'रोजगारदाता',
      'nav.jobs': 'कामहरू', 'nav.about': 'हाम्रोबारे', 'nav.contact': 'सम्पर्क',
      'nav.login': 'लग इन', 'nav.signup': 'निःशुल्क साइन अप', 'nav.dashboard': 'ड्यासबोर्ड',
      'nav.community': 'समुदाय',
      'reset.title': 'नयाँ पासवर्ड छान्नुहोस्',
      'reset.subtitle': 'तपाईंको ReloCompass खाताको लागि नयाँ पासवर्ड राख्नुहोस्।',
      'reset.newPassword': 'नयाँ पासवर्ड', 'reset.newPasswordPh': 'कम्तीमा ६ क्यारेक्टर',
      'reset.confirmPassword': 'पासवर्ड पुष्टि गर्नुहोस्', 'reset.confirmPasswordPh': 'नयाँ पासवर्ड फेरि लेख्नुहोस्',
      'reset.submit': 'पासवर्ड अपडेट गर्नुहोस्', 'reset.backToLogin': '← लग इनमा फर्कनुहोस्',
      'reset.missingToken': 'यो रिसेट लिंकमा टोकन छैन। लग इन पेजबाट नयाँ रिसेट इमेल अनुरोध गर्नुहोस्।',
      'reset.mismatch': 'पासवर्डहरू मेल खाँदैनन्।',
      'reset.tooShort': 'पासवर्ड कम्तीमा ६ क्यारेक्टरको हुनुपर्छ।',
      'reset.ok': 'पासवर्ड अपडेट भयो — अब लग इन गर्न सक्नुहुन्छ।',
      'reset.fail': 'पासवर्ड अपडेट गर्न सकिएन। लिंक म्याद सकिएको हुन सक्छ।',
      'reset.network': 'नेटवर्क त्रुटि — कृपया फेरि प्रयास गर्नुहोस्।',
      'forgot.link': 'पासवर्ड बिर्सनुभयो?',
      'forgot.sending': 'पठाउँदै…',
      'forgot.needEmail': 'पहिले माथि आफ्नो इमेल ठेगाना राख्नुहोस्।',
      'forgot.sent': 'यदि यो इमेल दर्ता भएको छ भने, रिसेट लिंक पठाइएको छ। आफ्नो इनबक्स हेर्नुहोस्।',
      'forgot.fail': 'अहिले रिसेट इमेल पठाउन सकिएन — कृपया फेरि प्रयास गर्नुहोस्।',
      'forgot.network': 'नेटवर्क त्रुटि — कृपया फेरि प्रयास गर्नुहोस्।',
      'saved.title': 'सुरक्षित गरिएका', 'saved.subtitle': 'तपाईंले बुकमार्क गर्नुभएका काम र आवास।', 'saved.jobs': 'सुरक्षित कामहरू', 'saved.accommodations': 'सुरक्षित आवास', 'saved.empty': 'अभी केही सुरक्षित छैन। काम र आवास हेर्नुहोस् र सुरक्षित गर्नुहोस्।', 'saved.removed': 'हटाइयो।', 'nav.saved': 'सुरक्षित', 'nav.planner': 'योजनाकर्ता', 'nav.settings': 'सेटिङहरू', 'nav.transport': 'यातायात', 'nav.accommodation': 'आवास', 'notif.title': 'सूचनाहरू', 'notif.empty': 'अझै सूचना छैन।', 'notif.markAllRead': 'सबै पढिएको चिन्ह लगाउनुहोस्', 'settings.title': 'खाता सेटिङ', 'settings.language': 'इन्टरफेस भाषा', 'settings.password': 'पासवर्ड परिवर्तन', 'settings.currentPw': 'हालको पासवर्ड', 'settings.newPw': 'नयाँ पासवर्ड', 'settings.changePw': 'पासवर्ड अपडेट', 'settings.pwChanged': 'पासवर्ड अपडेट भयो।', 'settings.langChanged': 'भाषा सुरक्षित भयो।', 'planner.title': 'स्थानान्तरण योजना', 'planner.subtitle': 'आफ्नो सार्ने योजना बनाउनुहोस्।', 'planner.country': 'गन्तव्य देश', 'planner.city': 'गन्तव्य शहर', 'planner.moveDate': 'लक्षित मिति', 'planner.notes': 'टिप्पणी', 'planner.checklist': 'चेकलिस्ट', 'planner.save': 'योजना सुरक्षित', 'planner.saved': 'सुरक्षित भयो', 'transport.title': 'यातायात', 'transport.subtitle': 'नयाँ सहरमा यातायात — पहिले आधिकारिक प्रदाता।', 'lang.label': 'भाषा'
    },
    es: {
      'nav.assistant': 'Asistente IA', 'nav.home': 'Inicio', 'nav.features': 'Funciones',
      'nav.students': 'Estudiantes', 'nav.destinations': 'Destinos', 'nav.employers': 'Empleadores',
      'nav.jobs': 'Empleos', 'nav.about': 'Acerca de', 'nav.contact': 'Contacto',
      'nav.login': 'Iniciar sesión', 'nav.signup': 'Regístrate gratis', 'nav.dashboard': 'Panel',
      'nav.community': 'Comunidad',
      'reset.title': 'Elige una nueva contraseña',
      'reset.subtitle': 'Introduce una nueva contraseña para tu cuenta de ReloCompass.',
      'reset.newPassword': 'Nueva contraseña', 'reset.newPasswordPh': 'Al menos 6 caracteres',
      'reset.confirmPassword': 'Confirma la nueva contraseña', 'reset.confirmPasswordPh': 'Repite tu nueva contraseña',
      'reset.submit': 'Actualizar contraseña', 'reset.backToLogin': '← Volver al inicio de sesión',
      'reset.missingToken': 'A este enlace le falta el token. Solicita un nuevo correo desde la página de inicio de sesión.',
      'reset.mismatch': 'Las contraseñas no coinciden.',
      'reset.tooShort': 'La contraseña debe tener al menos 6 caracteres.',
      'reset.ok': 'Contraseña actualizada — ya puedes iniciar sesión.',
      'reset.fail': 'No se pudo actualizar la contraseña. El enlace puede haber caducado.',
      'reset.network': 'Error de red — inténtalo de nuevo.',
      'forgot.link': '¿Olvidaste tu contraseña?',
      'forgot.sending': 'Enviando…',
      'forgot.needEmail': 'Primero escribe tu correo electrónico arriba.',
      'forgot.sent': 'Si ese correo está registrado, el enlace de restablecimiento va en camino. Revisa tu bandeja de entrada.',
      'forgot.fail': 'No se pudo enviar el correo ahora — inténtalo de nuevo.',
      'forgot.network': 'Error de red — inténtalo de nuevo.',
      'saved.title': 'Guardados', 'saved.subtitle': 'Empleos y alojamiento que marcaste.', 'saved.jobs': 'Empleos guardados', 'saved.accommodations': 'Alojamiento guardado', 'saved.empty': 'Nada guardado aún. Explora empleos y alojamiento y toca Guardar.', 'saved.removed': 'Eliminado.', 'nav.saved': 'Guardados', 'nav.planner': 'Planificador', 'nav.settings': 'Ajustes', 'nav.transport': 'Transporte', 'nav.accommodation': 'Alojamiento', 'notif.title': 'Notificaciones', 'notif.empty': 'Aún no hay notificaciones.', 'notif.markAllRead': 'Marcar todo como leído', 'settings.title': 'Ajustes de cuenta', 'settings.language': 'Idioma de la interfaz', 'settings.password': 'Cambiar contraseña', 'settings.currentPw': 'Contraseña actual', 'settings.newPw': 'Nueva contraseña', 'settings.changePw': 'Actualizar contraseña', 'settings.pwChanged': 'Contraseña actualizada.', 'settings.langChanged': 'Idioma guardado.', 'planner.title': 'Planificador de mudanza', 'planner.subtitle': 'Planifica tu mudanza paso a paso.', 'planner.country': 'País de destino', 'planner.city': 'Ciudad de destino', 'planner.moveDate': 'Fecha objetivo', 'planner.notes': 'Notas', 'planner.checklist': 'Lista de tareas', 'planner.save': 'Guardar plan', 'planner.saved': 'Guardado', 'transport.title': 'Transporte', 'transport.subtitle': 'Moverte por tu nueva ciudad — proveedores oficiales primero.', 'lang.label': 'Idioma'
    },
    fr: {
      'nav.assistant': 'Assistant IA', 'nav.home': 'Accueil', 'nav.features': 'Fonctionnalités',
      'nav.students': 'Étudiants', 'nav.destinations': 'Destinations', 'nav.employers': 'Employeurs',
      'nav.jobs': 'Emplois', 'nav.about': 'À propos', 'nav.contact': 'Contact',
      'nav.login': 'Connexion', 'nav.signup': 'Inscrivez-vous', 'nav.dashboard': 'Tableau de bord',
      'nav.community': 'Communauté',
      'reset.title': 'Choisissez un nouveau mot de passe',
      'reset.subtitle': 'Saisissez un nouveau mot de passe pour votre compte ReloCompass.',
      'reset.newPassword': 'Nouveau mot de passe', 'reset.newPasswordPh': 'Au moins 6 caractères',
      'reset.confirmPassword': 'Confirmez le mot de passe', 'reset.confirmPasswordPh': 'Répétez votre nouveau mot de passe',
      'reset.submit': 'Mettre à jour', 'reset.backToLogin': '← Retour à la connexion',
      'reset.missingToken': 'Il manque le token dans ce lien. Demandez un nouvel e-mail depuis la page de connexion.',
      'reset.mismatch': 'Les mots de passe ne correspondent pas.',
      'reset.tooShort': 'Le mot de passe doit contenir au moins 6 caractères.',
      'reset.ok': 'Mot de passe mis à jour — vous pouvez vous connecter.',
      'reset.fail': 'Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré.',
      'reset.network': 'Erreur réseau — réessayez.',
      'forgot.link': 'Mot de passe oublié ?',
      'forgot.sending': 'Envoi…',
      'forgot.needEmail': 'Saisissez d’abord votre e-mail ci-dessus.',
      'forgot.sent': 'Si cet e-mail est enregistré, un lien de réinitialisation est en route. Vérifiez votre boîte de réception.',
      'forgot.fail': 'Impossible d’envoyer l’e-mail pour le moment — réessayez.',
      'forgot.network': 'Erreur réseau — réessayez.',
      'saved.title': 'Enregistrés', 'saved.subtitle': "Emplois et logements que vous avez mis de cœur.", 'saved.jobs': 'Emplois enregistrés', 'saved.accommodations': 'Logement enregistré', 'saved.empty': "Rien d'enregistré pour l'instant. Parcourez puis touchez Enregistrer.", 'saved.removed': 'Supprimé.', 'nav.saved': 'Enregistrés', 'nav.planner': 'Planificateur', 'nav.settings': 'Réglages', 'nav.transport': 'Transport', 'nav.accommodation': 'Logement', 'notif.title': 'Notifications', 'notif.empty': 'Pas encore de notifications.', 'notif.markAllRead': 'Tout marquer comme lu', 'settings.title': 'Réglages du compte', 'settings.language': "Langue de l'interface", 'settings.password': 'Changer le mot de passe', 'settings.currentPw': 'Mot de passe actuel', 'settings.newPw': 'Nouveau mot de passe', 'settings.changePw': 'Mettre à jour', 'settings.pwChanged': 'Mot de passe mis à jour.', 'settings.langChanged': 'Langue enregistrée.', 'planner.title': 'Planificateur de déménagement', 'planner.subtitle': 'Planifiez votre déménagement étape par étape.', 'planner.country': 'Pays de destination', 'planner.city': 'Ville de destination', 'planner.moveDate': 'Date cible', 'planner.notes': 'Notes', 'planner.checklist': 'Liste de contrôle', 'planner.save': 'Enregistrer le plan', 'planner.saved': 'Enregistré', 'transport.title': 'Transport', 'transport.subtitle': "Se déplacer dans votre nouvelle ville — opérateurs officiels d'abord.",
      'lang.label': 'Langue'
    }
  };

  var LANGS = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ne', label: 'नेपाली' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' }
  ];

  function detect() {
    var qs = new URLSearchParams(location.search).get('lang');
    if (qs && I18N[qs]) return qs;
    try {
      var saved = localStorage.getItem('relo_lang');
      if (saved && I18N[saved]) return saved;
    } catch (e) { /* private mode */ }
    var nav = (navigator.language || 'en').slice(0, 2);
    return I18N[nav] ? nav : 'en';
  }

  function t(key) {
    var lang = detect();
    var dict = I18N[lang] || {};
    return dict[key] !== undefined ? dict[key] : (I18N.en[key] !== undefined ? I18N.en[key] : key);
  }

  function apply() {
    var lang = detect();
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (val !== key) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var val = t(el.getAttribute('data-i18n-placeholder'));
      if (val) el.setAttribute('placeholder', val);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      var val = t(el.getAttribute('data-i18n-aria-label'));
      if (val) el.setAttribute('aria-label', val);
    });
    document.documentElement.setAttribute('lang', lang);
  }

  function setLang(code) {
    if (!I18N[code]) return;
    try { localStorage.setItem('relo_lang', code); } catch (e) { /* ignore */ }
    apply();
    document.dispatchEvent(new CustomEvent('relo:langchange', { detail: { lang: code } }));
  }

  // ---- language picker (injected into nav-actions / mobile menu if present) ----
  function buildPicker(container, compact) {
    var wrap = document.createElement('div');
    wrap.className = 'relo-lang-picker' + (compact ? ' compact' : '');
    wrap.style.cssText = compact
      ? 'display:flex;justify-content:center;padding:0.75rem 0;border-top:1px solid var(--border,rgba(15,23,42,.1))'
      : 'display:flex;align-items:center;gap:0.35rem';
    var label = document.createElement('span');
    label.textContent = '🌐';
    label.setAttribute('aria-hidden', 'true');
    label.style.fontSize = compact ? '1rem' : '0.95rem';
    wrap.appendChild(label);
    var sel = document.createElement('select');
    sel.setAttribute('aria-label', t('lang.label'));
    sel.style.cssText = 'background:transparent;border:1px solid var(--border,rgba(15,23,42,.18));border-radius:8px;padding:0.3rem 0.45rem;font-size:0.8rem;color:var(--text-body,#0F172A);cursor:pointer;font-family:inherit';
    LANGS.forEach(function (l) {
      var opt = document.createElement('option');
      opt.value = l.code;
      opt.textContent = l.label;
      opt.selected = l.code === detect();
      opt.style.color = '#0F172A';
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function () { setLang(sel.value); });
    wrap.appendChild(sel);
    container.appendChild(wrap);
    return wrap;
  }

  function mountPickers() {
    var navActions = document.querySelector('.nav-actions');
    var mobileMenu = document.getElementById('mobile-menu') || document.querySelector('.mobile-menu');
    if (navActions && !navActions.querySelector('.relo-lang-picker')) buildPicker(navActions, false);
    if (mobileMenu && !mobileMenu.querySelector('.relo-lang-picker')) buildPicker(mobileMenu, true);
  }

  // auth.js rewrites .nav-actions after login state resolves — re-mount our picker then
  document.addEventListener('relo:navupdated', function () { mountPickers(); });

  window.I18N_UTIL = { t: t, apply: apply, setLang: setLang, detect: detect, LANGS: LANGS };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { apply(); mountPickers(); });
  } else {
    apply(); mountPickers();
  }
})();
