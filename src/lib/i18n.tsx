import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const tr = {
  home: {
    newArrivals: 'Yeni Gelenler',
    curatedPieces: 'Özenle Seçilmiş Parçalar',
    viewAll: 'Tümünü Gör',
    shopByCategory: 'Kategoriye Göre Alışveriş',
    explore: 'Keşfet',
    heroTitleFallback: 'Luminous Koleksiyonu',
    heroSubtitleFallback: 'Fırçalanmış şampanya altınında, el işçiliğiyle oluşturulmuş mahrem parçalar.',
    fineJewelry: 'İnce Takı',
  },
  categories: {
    searchPlaceholder: 'Lalumira\'da Ara...',
    allJewelry: 'Tüm Takılar',
    items: 'Ürün',
    curatedCollection: 'Özenle Seçilmiş Koleksiyon',
    allCollectionSubtitle: 'Seçili yüzüklerde %15 indirim',
    fineJewelry: 'İnce Takı',
  },
  product: {
    available: 'Mevcut & 3 günde kargoda',
    outOfStock: 'Stokta yok',
    select: 'Seç',
    description: 'Açıklama',
    materials: 'Materyaller',
    pairsWellWith: 'Birlikte İyi Gider',
    addToBag: 'Sepete Ekle',
    adding: 'Ekleniyor...',
    notFound: 'Ürün bulunamadı',
    goBack: 'Geri Dön',
  },
  cart: {
    title: 'Alışveriş Çantası',
    empty: 'Çantanız boş.',
    continueShopping: 'Alışverişe Devam Et',
    subtotal: 'Ara Toplam',
    checkout: 'Ödeme Yap',
  },
  profile: {
    welcomeBack: 'Tekrar Hoş Geldiniz',
    createAccount: 'Hesap Oluştur',
    loginSubtitle: 'Siparişlerinize, favorilerinize ve hesap ayarlarınıza erişmek için giriş yapın.',
    registerSubtitle: 'Özel koleksiyonlara ve siparişlere erişmek için La Lumira\'ya katılın.',
    firstName: 'Ad',
    lastName: 'Soyad',
    email: 'E-posta',
    password: 'Şifre',
    signIn: 'Giriş Yap',
    createAccountButton: 'Hesap Oluştur',
    alreadyHaveAccount: 'Zaten hesabınız var mı?',
    noAccount: 'Hesabınız yok mu?',
    myOrders: 'Siparişlerim',
    wishlist: 'Favorilerim',
    shippingAddresses: 'Teslimat Adresleri',
    accountSettings: 'Hesap Ayarları',
    customerSupport: 'Müşteri Desteği',
    logout: 'Çıkış Yap',
    guestUser: 'Misafir Kullanıcı',
    memberSince: '2025\'den beri üye',
    version: 'Sürüm 1.0.4',
    privacyPolicy: 'Gizlilik Politikası',
    termsOfService: 'Kullanım Koşulları',
    pleaseWait: 'Lütfen bekleyin...',
  },
  tabBar: {
    home: 'Ana Sayfa',
    categories: 'Kategoriler',
    cart: 'Çanta',
    profile: 'Profil',
  },
};

const en = {
  home: {
    newArrivals: 'New Arrivals',
    curatedPieces: 'Curated pieces',
    viewAll: 'View All',
    shopByCategory: 'Shop by Category',
    explore: 'Explore',
    heroTitleFallback: 'The Luminous Collection',
    heroSubtitleFallback: 'Handcrafted intimacy cast in brushed champagne gold.',
    fineJewelry: 'Fine Jewelry',
  },
  categories: {
    searchPlaceholder: 'Search Lalumira...',
    allJewelry: 'All Jewelry',
    items: 'Items',
    curatedCollection: 'Curated Collection',
    allCollectionSubtitle: 'Selected Rings - 15% Off',
    fineJewelry: 'Fine Jewelry',
  },
  product: {
    available: 'Available & Ships in 3 days',
    outOfStock: 'Out of stock',
    select: 'Select',
    description: 'Description',
    materials: 'Materials',
    pairsWellWith: 'Pairs Well With',
    addToBag: 'Add to Bag',
    adding: 'Adding...',
    notFound: 'Product not found',
    goBack: 'Go Back',
  },
  cart: {
    title: 'Shopping Bag',
    empty: 'Your bag is empty.',
    continueShopping: 'Continue Shopping',
    subtotal: 'Subtotal',
    checkout: 'Checkout',
  },
  profile: {
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    loginSubtitle: 'Sign in to access your orders, wishlist, and account settings.',
    registerSubtitle: 'Join La Lumira for exclusive access to collections and orders.',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    createAccountButton: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    myOrders: 'My Orders',
    wishlist: 'Wishlist',
    shippingAddresses: 'Shipping Addresses',
    accountSettings: 'Account Settings',
    customerSupport: 'Customer Support',
    logout: 'Logout',
    guestUser: 'Guest User',
    memberSince: 'Member since 2025',
    version: 'Version 1.0.4',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    pleaseWait: 'Please wait...',
  },
  tabBar: {
    home: 'Home',
    categories: 'Categories',
    cart: 'Cart',
    profile: 'Profile',
  },
};

const i18n = new I18n({ tr, en });
i18n.defaultLocale = 'tr';
i18n.locale = Localization.getLocales()[0]?.languageCode || 'tr';

export type Locale = 'tr' | 'en';

type TranslateFunction = (key: string, options?: Record<string, unknown>) => string;

type LocaleContextType = {
  locale: Locale;
  t: TranslateFunction;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleContextType>({
  locale: i18n.locale as Locale,
  t: ((key: string) => key) as TranslateFunction,
  setLocale: () => {},
  toggleLocale: () => {},
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(i18n.locale as Locale);
  const [, forceRender] = useState(0);

  const setLocale = useCallback((newLocale: Locale) => {
    i18n.locale = newLocale;
    setLocaleState(newLocale);
    forceRender((n) => n + 1);
  }, []);

  const toggleLocale = useCallback(() => {
    const newLocale = i18n.locale === 'tr' ? 'en' : 'tr';
    i18n.locale = newLocale;
    setLocaleState(newLocale);
    forceRender((n) => n + 1);
  }, []);

  const t = useCallback(
    (key: string, options?: Record<string, unknown>) => i18n.t(key, options),
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext).locale;
}

export function useTranslation(): { t: TranslateFunction; locale: Locale } {
  const ctx = useContext(LocaleContext);
  return { t: ctx.t, locale: ctx.locale };
}

export function useSetLocale() {
  return useContext(LocaleContext).setLocale;
}

export function useToggleLocale() {
  return useContext(LocaleContext).toggleLocale;
}

export function getLocale(): Locale {
  return i18n.locale as Locale;
}

export default i18n;
