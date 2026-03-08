import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
    en: {
        translation: {
            "app": {
                "title": "TouristDZ",
                "tagline": "Discover Biskra",
                "login": "Login",
                "signup": "Sign Up",
                "logout": "Logout",
                "email": "Email",
                "password": "Password",
                "forgotPassword": "Forgot Password?",
                "dontHaveAccount": "Don't have an account?",
                "alreadyHaveAccount": "Already have an account?",
                "createAccount": "Create Account",
            },
            "nav": {
                "home": "Home",
                "explore": "Explore",
                "events": "Events",
                "gallery": "Gallery",
                "profile": "Profile"
            },
            "home": {
                "searchPlaceholder": "Search destinations...",
                "viewAll": "See All",
                "featuredPlaces": "Featured Places",
                "upcomingEvents": "Upcoming Events",
                "discoverBiskra": "Discover Biskra",
                "heroSubtitle": "Explore the Queen of the Ziban"
            },
            "details": {
                "about": "About",
                "gallery": "Gallery",
                "reviews": "Visitor Reviews",
                "leaveReview": "Leave a Review",
                "location": "Location",
                "accessibility": "Accessibility",
                "rating": "Rating",
                "getDirections": "Get Directions",
                "noReviews": "No reviews yet.",
                "viewDetails": "View Details",
                "description": "Description"
            },
            "categories": {
                "all": "All",
                "historical": "Historical",
                "natural": "Natural",
                "cultural": "Cultural",
                "thermal": "Thermal/Spa",
                "accommodation": "Accommodation"
            },
            "features": {
                "audioGuide": "Audio Guide",
                "audioGuideTitle": "Interactive Audio Guide",
                "audioGuideDesc": "Listen to the history and secrets narrated by our local guides.",
                "listenNow": "Listen Now",
                "play": "Play",
                "qrTitle": "Smart Audio QR",
                "qrDesc": "Scan the QR code at the entrance for a multi-lingual tour.",
                "availableIn": "Available in"
            },
            "accessibility": {
                "accessible": "Wheelchair Accessible",
                "limited": "Limited Access"
            },
            "scanner": {
                "title": "QR Code Scanner",
                "permissionRequired": "Camera Permission Required",
                "permissionText": "We need access to your camera to scan QR codes at tourist sites.",
                "grantPermission": "Grant Permission",
                "pointCamera": "Point your camera at a QR code",
                "siteHint": "Available at monuments and sites across Biskra",
                "scanned": "QR Code Scanned"
            },
            "auth": {
                "loginRequired": "Login Required",
                "fillAllFields": "Please fill in all fields",
                "invalidEmail": "Please enter a valid email address",
                "passwordMinLength": "Password must be at least 6 characters",
                "loginFailed": "Login Failed",
                "signupFailed": "Signup Failed",
                "signupSuccess": "Account created! Please check your email for verification.",
                "resetPassword": "Reset Password",
                "resetPrompt": "Enter your email address above first, then tap Forgot Password.",
                "resetConfirm": "A reset link will be sent to {{email}}",
                "emailSent": "Email Sent",
                "resetEmailSent": "Check your inbox for the password reset link.",
                "send": "Send"
            },
            "common": {
                "error": "Error",
                "cancel": "Cancel",
                "submit": "Submit",
                "submitting": "Submitting...",
                "success": "Success",
                "goBack": "Go Back",
                "unknownError": "An unknown error occurred.",
                "notSpecified": "Not specified"
            },
            "events": {
                "seats": "seats",
                "date": "Date",
                "location": "Location",
                "capacity": "Capacity",
                "unlimited": "Unlimited",
                "notFound": "Event not found",
                "joinEvent": "Join this Event",
                "alreadyRegistered": "Already Registered",
                "registeredSuccess": "You are now registered for this event!",
                "registrationError": "Registration Error",
                "types": {
                    "tour": "Tours",
                    "camp": "Camps",
                    "competition": "Competitions",
                    "volunteer": "Volunteer"
                }
            },
            "gallery": {
                "loginToUpload": "You need to be logged in to upload photos.",
                "permissionRequired": "Media Library Permission Required",
                "permissionText": "We need access to your photo library to upload images.",
                "uploadFailed": "Failed to upload the photo. Please try again.",
                "competition": "Competition",
                "noPhotos": "No photos yet. Be the first to share!"
            },
            "review": {
                "title": "Leave a Review",
                "placeholder": "Share your experience...",
                "loginRequired": "Please log in to leave a review.",
                "submitError": "Failed to submit review. Please try again.",
                "success": "Review submitted!"
            },
            "solidarity": {
                "title": "Solidarity Tourism",
                "subtitle": "Apply for subsidised visits for those in need",
                "fullName": "Full Name",
                "phone": "Phone Number",
                "fillNamePhone": "Please fill in your full name and phone number.",
                "category": "Category",
                "disability": "Person with Disability",
                "patient": "Patient",
                "lowIncome": "Low Income",
                "specialNeeds": "Special Needs (optional)",
                "preferredTrips": "Preferred Trip Types",
                "selectTripType": "Please select at least one trip type.",
                "tripTypes": {
                    "oasis_walk": "Oasis Walk",
                    "museum_visit": "Museum Visit",
                    "thermal_bath": "Thermal Bath",
                    "city_tour": "City Tour",
                    "desert_excursion": "Desert Excursion"
                },
                "submit": "Submit Application",
                "success": "Application submitted successfully!",
                "error": "Failed to submit application. Please try again.",
                "loginRequired": "Please log in to apply."
            },
            "app": {
                "joinCommunity": "Join the TouristDZ community",
                "fullName": "Full Name"
            },
            "profile": {
                "welcome": "Welcome to",
                "guestSubtitle": "Join us to save your favorite places and register for unique events in Biskra.",
                "generalSettings": "General Settings",
                "aboutProject": "About the Project",
                "aboutProjectDesc": "Smart tourism platform for Biskra, Algeria.",
                "comingSoon": "Coming soon",
                "language": "Language",
                "myActivity": "My Activity",
                "myFavorites": "My Favorites",
                "myEvents": "My Registered Events",
                "myReviews": "My Reviews",
                "accountSettings": "Account Settings",
                "personalInfo": "Personal Info",
                "privacySecurity": "Privacy & Security",
                "favorites": "Favorites",
                "events": "Events",
                "reviews": "Reviews"
            },
            "accommodationTypes": {
                "hotel": "Hotel",
                "guesthouse": "Guesthouse",
                "hostel": "Hostel",
                "restaurant": "Restaurant",
                "cafe": "Café",
                "riad": "Riad",
                "apartment": "Apartment",
                "camping": "Camping"
            }
        }
    },
    fr: {
        translation: {
            "app": {
                "title": "TouristDZ",
                "tagline": "Découvrez Biskra",
                "login": "Connexion",
                "signup": "S'inscrire",
                "logout": "Déconnexion",
                "email": "E-mail",
                "password": "Mot de passe",
                "forgotPassword": "Mot de passe oublié ?",
                "dontHaveAccount": "Vous n'avez pas de compte ?",
                "alreadyHaveAccount": "Vous avez déjà un compte ?",
                "createAccount": "Créer un compte",
            },
            "nav": {
                "home": "Accueil",
                "explore": "Explorer",
                "events": "Événements",
                "gallery": "Galerie",
                "profile": "Profil"
            },
            "home": {
                "searchPlaceholder": "Rechercher des destinations...",
                "viewAll": "Voir tout",
                "featuredPlaces": "Lieux incontournables",
                "upcomingEvents": "Événements à venir",
                "discoverBiskra": "Découvrir Biskra",
                "heroSubtitle": "Explorez la Reine des Ziban"
            },
            "details": {
                "about": "À propos",
                "gallery": "Galerie",
                "reviews": "Avis des visiteurs",
                "leaveReview": "Laisser un avis",
                "location": "Emplacement",
                "accessibility": "Accessibilité",
                "rating": "Note",
                "getDirections": "Obtenir l'itinéraire",
                "noReviews": "Aucun avis pour le moment.",
                "viewDetails": "Voir les détails",
                "description": "Description"
            },
            "categories": {
                "all": "Tout",
                "historical": "Historique",
                "natural": "Naturel",
                "cultural": "Culturel",
                "thermal": "Thermal/Spa",
                "accommodation": "Hébergement"
            },
            "features": {
                "audioGuide": "Guide Audio",
                "audioGuideTitle": "Guide Audio Interactif",
                "audioGuideDesc": "Écoutez l'histoire et les secrets racontés par nos guides locaux.",
                "listenNow": "Écouter maintenant",
                "play": "Lire",
                "qrTitle": "Code QR Intelligent",
                "qrDesc": "Scannez le code QR à l'entrée pour une visite multilingue.",
                "availableIn": "Disponible en"
            },
            "accessibility": {
                "accessible": "Accessible aux fauteuils",
                "limited": "Accès limité"
            },
            "scanner": {
                "title": "Scanner QR",
                "permissionRequired": "Permission de caméra requise",
                "permissionText": "Nous avons besoin d'accès à votre caméra pour scanner les codes QR.",
                "grantPermission": "Autoriser",
                "pointCamera": "Pointez votre caméra vers un code QR",
                "siteHint": "Disponible aux monuments et sites de Biskra",
                "scanned": "Code QR Scanné"
            },
            "auth": {
                "loginRequired": "Connexion requise",
                "fillAllFields": "Veuillez remplir tous les champs",
                "invalidEmail": "Veuillez entrer une adresse e-mail valide",
                "passwordMinLength": "Le mot de passe doit contenir au moins 6 caractères",
                "loginFailed": "Échec de connexion",
                "signupFailed": "Échec de l'inscription",
                "signupSuccess": "Compte créé ! Veuillez vérifier votre e-mail.",
                "resetPassword": "Réinitialiser le mot de passe",
                "resetPrompt": "Entrez votre adresse e-mail ci-dessus, puis appuyez sur Mot de passe oublié.",
                "resetConfirm": "Un lien de réinitialisation sera envoyé à {{email}}",
                "emailSent": "E-mail envoyé",
                "resetEmailSent": "Consultez votre boîte de réception pour le lien de réinitialisation.",
                "send": "Envoyer"
            },
            "common": {
                "error": "Erreur",
                "cancel": "Annuler",
                "submit": "Envoyer",
                "submitting": "Envoi en cours...",
                "success": "Succès",
                "goBack": "Retour",
                "unknownError": "Une erreur inconnue est survenue.",
                "notSpecified": "Non spécifié"
            },
            "events": {
                "seats": "places",
                "date": "Date",
                "location": "Lieu",
                "capacity": "Capacité",
                "unlimited": "Illimité",
                "notFound": "Événement non trouvé",
                "joinEvent": "Rejoindre cet événement",
                "alreadyRegistered": "Déjà inscrit",
                "registeredSuccess": "Vous êtes maintenant inscrit à cet événement !",
                "registrationError": "Erreur d'inscription",
                "types": {
                    "tour": "Excursions",
                    "camp": "Camps",
                    "competition": "Compétitions",
                    "volunteer": "Bénévolat"
                }
            },
            "gallery": {
                "loginToUpload": "Vous devez être connecté pour télécharger des photos.",
                "permissionRequired": "Permission de bibliothèque requise",
                "permissionText": "Nous avons besoin d'accéder à votre photothèque.",
                "uploadFailed": "Échec du téléchargement. Veuillez réessayer.",
                "competition": "Compétition",
                "noPhotos": "Pas encore de photos. Soyez le premier à partager !"
            },
            "review": {
                "title": "Laisser un avis",
                "placeholder": "Partagez votre expérience...",
                "loginRequired": "Connectez-vous pour laisser un avis.",
                "submitError": "Échec de l'envoi. Veuillez réessayer.",
                "success": "Avis soumis !"
            },
            "solidarity": {
                "title": "Tourisme solidaire",
                "subtitle": "Demandez des visites subventionnées pour les personnes dans le besoin",
                "fullName": "Nom complet",
                "phone": "Numéro de téléphone",
                "fillNamePhone": "Veuillez remplir votre nom complet et numéro de téléphone.",
                "category": "Catégorie",
                "disability": "Personne handicapée",
                "patient": "Patient",
                "lowIncome": "Faible revenu",
                "specialNeeds": "Besoins spéciaux (facultatif)",
                "preferredTrips": "Types de voyages préférés",
                "selectTripType": "Veuillez sélectionner au moins un type de voyage.",
                "tripTypes": {
                    "oasis_walk": "Balade dans l'oasis",
                    "museum_visit": "Visite de musée",
                    "thermal_bath": "Bain thermal",
                    "city_tour": "Tour de ville",
                    "desert_excursion": "Excursion au désert"
                },
                "submit": "Soumettre la demande",
                "success": "Demande soumise avec succès !",
                "error": "Échec de la soumission. Veuillez réessayer.",
                "loginRequired": "Connectez-vous pour postuler."
            },
            "app": {
                "joinCommunity": "Rejoignez la communauté TouristDZ",
                "fullName": "Nom complet"
            },
            "profile": {
                "welcome": "Bienvenue sur",
                "guestSubtitle": "Rejoignez-nous pour sauvegarder vos lieux préférés et vous inscrire à des événements uniques à Biskra.",
                "generalSettings": "Paramètres généraux",
                "aboutProject": "À propos du projet",
                "aboutProjectDesc": "Plateforme touristique intelligente pour Biskra, Algérie.",
                "comingSoon": "Bientôt disponible",
                "language": "Langue",
                "myActivity": "Mon activité",
                "myFavorites": "Mes favoris",
                "myEvents": "Mes événements inscrits",
                "myReviews": "Mes avis",
                "accountSettings": "Paramètres du compte",
                "personalInfo": "Informations personnelles",
                "privacySecurity": "Confidentialité et sécurité",
                "favorites": "Favoris",
                "events": "Événements",
                "reviews": "Avis"
            },
            "accommodationTypes": {
                "hotel": "Hôtel",
                "guesthouse": "Maison d'hôtes",
                "hostel": "Auberge",
                "restaurant": "Restaurant",
                "cafe": "Café",
                "riad": "Riad",
                "apartment": "Appartement",
                "camping": "Camping"
            }
        }
    },
    ar: {
        translation: {
            "app": {
                "title": "TouristDZ",
                "tagline": "اكتشف بسكرة",
                "login": "تسجيل الدخول",
                "signup": "إنشاء حساب",
                "logout": "تسجيل الخروج",
                "email": "البريد الإلكتروني",
                "password": "كلمة المرور",
                "forgotPassword": "هل نسيت كلمة المرور؟",
                "dontHaveAccount": "ليس لديك حساب؟",
                "alreadyHaveAccount": "لديك حساب بالفعل؟",
                "createAccount": "إنشاء حساب",
            },
            "nav": {
                "home": "الرئيسية",
                "explore": "استكشف",
                "events": "الفعاليات",
                "gallery": "المعرض",
                "profile": "حسابي"
            },
            "home": {
                "searchPlaceholder": "بحث عن الوجهات...",
                "viewAll": "عرض الكل",
                "featuredPlaces": "أماكن مميزة",
                "upcomingEvents": "فعاليات قادمة",
                "discoverBiskra": "اكتشف بسكرة",
                "heroSubtitle": "استكشف عروس الزيبان"
            },
            "details": {
                "about": "حول",
                "gallery": "المعرض",
                "reviews": "آراء الزوار",
                "leaveReview": "اترك تقييمًا",
                "location": "الموقع",
                "accessibility": "سهولة الوصول",
                "rating": "التقييم",
                "getDirections": "الحصول على الاتجاهات",
                "noReviews": "لا توجد مراجعات بعد.",
                "viewDetails": "عرض التفاصيل",
                "description": "الوصف"
            },
            "categories": {
                "all": "الكل",
                "historical": "تاريخي",
                "natural": "طبيعي",
                "cultural": "ثقافي",
                "thermal": "حموي",
                "accommodation": "إقامة"
            },
            "features": {
                "audioGuide": "دليل صوتي",
                "audioGuideTitle": "دليل صوتي تفاعلي",
                "audioGuideDesc": "استمع إلى التاريخ والأسرار التي يرويها مرشدونا المحليون.",
                "listenNow": "استمع الآن",
                "play": "تشغيل",
                "qrTitle": "رمز QR الذكي",
                "qrDesc": "امسح رمز QR عند المدخل للحصول على جولة بعدة لغات.",
                "availableIn": "متاح بـ"
            },
            "accessibility": {
                "accessible": "مناسب للكراسي المتحركة",
                "limited": "وصول محدود"
            },
            "scanner": {
                "title": "قارئ رمز QR",
                "permissionRequired": "مطلوب إذن الكاميرا",
                "permissionText": "نحتاج إلى الوصول إلى كاميرتك لمسح رموز QR في المواقع السياحية.",
                "grantPermission": "منح الإذن",
                "pointCamera": "وجّه كاميرتك نحو رمز QR",
                "siteHint": "متاح في المعالم والمواقع في بسكرة",
                "scanned": "تم مسح الرمز"
            },
            "auth": {
                "loginRequired": "تسجيل الدخول مطلوب",
                "fillAllFields": "يرجى ملء جميع الحقول",
                "invalidEmail": "يرجى إدخال عنوان بريد إلكتروني صالح",
                "passwordMinLength": "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
                "loginFailed": "فشل تسجيل الدخول",
                "signupFailed": "فشل إنشاء الحساب",
                "signupSuccess": "تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني.",
                "resetPassword": "إعادة تعيين كلمة المرور",
                "resetPrompt": "أدخل بريدك الإلكتروني أعلاه، ثم اضغط على نسيت كلمة المرور.",
                "resetConfirm": "سيتم إرسال رابط إعادة التعيين إلى {{email}}",
                "emailSent": "تم إرسال البريد",
                "resetEmailSent": "تحقق من صندوق الوارد لرابط إعادة التعيين.",
                "send": "إرسال"
            },
            "common": {
                "error": "خطأ",
                "cancel": "إلغاء",
                "submit": "إرسال",
                "submitting": "جارٍ الإرسال...",
                "success": "نجاح",
                "goBack": "رجوع",
                "unknownError": "حدث خطأ غير معروف.",
                "notSpecified": "غير محدد"
            },
            "events": {
                "seats": "مقاعد",
                "date": "التاريخ",
                "location": "الموقع",
                "capacity": "السعة",
                "unlimited": "غير محدود",
                "notFound": "الفعالية غير موجودة",
                "joinEvent": "انضم لهذه الفعالية",
                "alreadyRegistered": "مسجل بالفعل",
                "registeredSuccess": "تم تسجيلك في هذه الفعالية بنجاح!",
                "registrationError": "خطأ في التسجيل",
                "types": {
                    "tour": "جولات",
                    "camp": "مخيمات",
                    "competition": "مسابقات",
                    "volunteer": "تطوع"
                }
            },
            "gallery": {
                "loginToUpload": "يجب تسجيل الدخول لتحميل الصور.",
                "permissionRequired": "مطلوب إذن مكتبة الصور",
                "permissionText": "نحتاج للوصول إلى مكتبة صورك لتحميل الصور.",
                "uploadFailed": "فشل تحميل الصورة. يرجى المحاولة مرة أخرى.",
                "competition": "مسابقة",
                "noPhotos": "لا توجد صور بعد. كن أول من يشارك!"
            },
            "review": {
                "title": "اترك تقييمًا",
                "placeholder": "شارك تجربتك...",
                "loginRequired": "سجّل الدخول لترك تقييم.",
                "submitError": "فشل إرسال التقييم. يرجى المحاولة مرة أخرى.",
                "success": "تم إرسال التقييم!"
            },
            "solidarity": {
                "title": "السياحة التضامنية",
                "subtitle": "تقدم بطلب لزيارات مدعومة للمحتاجين",
                "fullName": "الاسم الكامل",
                "phone": "رقم الهاتف",
                "fillNamePhone": "يرجى ملء الاسم الكامل ورقم الهاتف.",
                "category": "الفئة",
                "disability": "شخص ذو إعاقة",
                "patient": "مريض",
                "lowIncome": "ذو دخل منخفض",
                "specialNeeds": "احتياجات خاصة (اختياري)",
                "preferredTrips": "أنواع الرحلات المفضلة",
                "selectTripType": "يرجى اختيار نوع رحلة واحد على الأقل.",
                "tripTypes": {
                    "oasis_walk": "نزهة في الواحة",
                    "museum_visit": "زيارة متحف",
                    "thermal_bath": "حمام حراري",
                    "city_tour": "جولة في المدينة",
                    "desert_excursion": "رحلة صحراوية"
                },
                "submit": "تقديم الطلب",
                "success": "تم تقديم الطلب بنجاح!",
                "error": "فشل تقديم الطلب. يرجى المحاولة مرة أخرى.",
                "loginRequired": "سجّل الدخول للتقديم."
            },
            "app": {
                "joinCommunity": "انضم إلى مجتمع TouristDZ",
                "fullName": "الاسم الكامل"
            },
            "profile": {
                "welcome": "مرحبًا بك في",
                "guestSubtitle": "انضم إلينا لحفظ أماكنك المفضلة والتسجيل في فعاليات فريدة في بسكرة.",
                "generalSettings": "الإعدادات العامة",
                "aboutProject": "حول المشروع",
                "aboutProjectDesc": "منصة سياحية ذكية لبسكرة، الجزائر.",
                "comingSoon": "قريبًا",
                "language": "اللغة",
                "myActivity": "نشاطي",
                "myFavorites": "مفضلاتي",
                "myEvents": "فعالياتي المسجلة",
                "myReviews": "تقييماتي",
                "accountSettings": "إعدادات الحساب",
                "personalInfo": "المعلومات الشخصية",
                "privacySecurity": "الخصوصية والأمان",
                "favorites": "المفضلات",
                "events": "الفعاليات",
                "reviews": "التقييمات"
            },
            "accommodationTypes": {
                "hotel": "فندق",
                "guesthouse": "دار ضيافة",
                "hostel": "نزل",
                "restaurant": "مطعم",
                "cafe": "مقهى",
                "riad": "رياض",
                "apartment": "شقة",
                "camping": "تخييم"
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: Localization.getLocales()[0].languageCode ?? 'fr',
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
