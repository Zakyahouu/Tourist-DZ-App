import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
    en: {
        translation: {
            "app": {
                "title": "ToursticDZ",
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
                "viewDetails": "View Details"
            },
            "categories": {
                "all": "All",
                "historical": "Historical",
                "natural": "Natural",
                "cultural": "Cultural",
                "thermal": "Thermal/Spa"
            },
            "features": {
                "audioGuide": "Audio Guide",
                "audioGuideTitle": "Interactive Audio Guide",
                "audioGuideDesc": "Listen to the history and secrets narrated by our local guides.",
                "listenNow": "Listen Now",
                "qrTitle": "Smart Audio QR",
                "qrDesc": "Scan the QR code at the entrance for a multi-lingual tour.",
                "availableIn": "Available in"
            },
            "accessibility": {
                "accessible": "Wheelchair Accessible",
                "limited": "Limited Access"
            }
        }
    },
    fr: {
        translation: {
            "app": {
                "title": "ToursticDZ",
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
                "viewDetails": "Voir les détails"
            },
            "categories": {
                "all": "Tout",
                "historical": "Historique",
                "natural": "Naturel",
                "cultural": "Culturel",
                "thermal": "Thermal/Spa"
            },
            "features": {
                "audioGuide": "Guide Audio",
                "audioGuideTitle": "Guide Audio Interactif",
                "audioGuideDesc": "Écoutez l'histoire et les secrets racontés par nos guides locaux.",
                "listenNow": "Écouter maintenant",
                "qrTitle": "Code QR Intelligent",
                "qrDesc": "Scannez le code QR à l'entrée pour une visite multilingue.",
                "availableIn": "Disponible en"
            },
            "accessibility": {
                "accessible": "Accessible aux fauteuils",
                "limited": "Accès limité"
            }
        }
    },
    ar: {
        translation: {
            "app": {
                "title": "ToursticDZ",
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
                "viewDetails": "عرض التفاصيل"
            },
            "categories": {
                "all": "الكل",
                "historical": "تاريخي",
                "natural": "طبيعي",
                "cultural": "ثقافي",
                "thermal": "حموي"
            },
            "features": {
                "audioGuide": "دليل صوتي",
                "audioGuideTitle": "دليل صوتي تفاعلي",
                "audioGuideDesc": "استمع إلى التاريخ والأسرار التي يرويها مرشدونا المحليون.",
                "listenNow": "استمع الآن",
                "qrTitle": "رمز QR الذكي",
                "qrDesc": "امسح رمز QR عند المدخل للحصول على جولة بعدة لغات.",
                "availableIn": "متاح بـ"
            },
            "accessibility": {
                "accessible": "مناسب للكراسي المتحركة",
                "limited": "وصول محدود"
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
