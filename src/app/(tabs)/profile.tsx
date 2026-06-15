import { useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, Platform } from 'react-native';
import { Image } from 'expo-image';
import {
  Camera,
  Package,
  Heart,
  MapPin,
  Gear,
  ChatCircleDots,
  CaretRight,
  User,
  EnvelopeSimple,
  LockKey,
} from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/lib/i18n';

function useMenuItems(t: (key: string) => string) {
  return [
    { icon: Package, label: t('profile.myOrders') },
    { icon: Heart, label: t('profile.wishlist'), badge: '12' },
    { icon: MapPin, label: t('profile.shippingAddresses') },
    { icon: Gear, label: t('profile.accountSettings') },
    { icon: ChatCircleDots, label: t('profile.customerSupport') },
  ];
}

function AuthForm({ onLogin }: { onLogin: () => void }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    // TODO: integrate Shopify customerAccessTokenCreate / customerCreate
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 800);
  }

  const isRegister = mode === 'register';

  return (
    <View style={{ paddingTop: insets.top + 24 }}>
      <View className="px-6 py-8">
        <Text
          className="text-3xl text-center mb-2 text-foreground"
          style={{ fontFamily: 'CormorantGaramond_500Medium' }}
        >
          {isRegister ? t('profile.createAccount') : t('profile.welcomeBack')}
        </Text>
        <Text
          className="text-sm text-center text-muted-foreground mb-8"
          style={{ fontFamily: 'Inter_300Light' }}
        >
          {isRegister
            ? t('profile.registerSubtitle')
            : t('profile.loginSubtitle')}
        </Text>

        {isRegister ? (
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {t('profile.firstName')}
              </Text>
              <View className="flex-row items-center bg-muted/50 rounded-xl px-4 py-3 border border-border">
                <User size={18} color="#78716c" weight="light" />
                <TextInput
                  className="flex-1 ml-3 text-sm text-foreground"
                  placeholder="Jane"
                  placeholderTextColor="rgba(120, 113, 108, 0.6)"
                  style={{ fontFamily: 'Inter_400Regular' }}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
            </View>
            <View className="flex-1">
              <Text
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {t('profile.lastName')}
              </Text>
              <View className="flex-row items-center bg-muted/50 rounded-xl px-4 py-3 border border-border">
                <User size={18} color="#78716c" weight="light" />
                <TextInput
                  className="flex-1 ml-3 text-sm text-foreground"
                  placeholder="Doe"
                  placeholderTextColor="rgba(120, 113, 108, 0.6)"
                  style={{ fontFamily: 'Inter_400Regular' }}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>
        ) : null}

        <Text
          className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {t('profile.email')}
        </Text>
        <View className="flex-row items-center bg-muted/50 rounded-xl px-4 py-3 border border-border mb-4">
          <EnvelopeSimple size={18} color="#78716c" weight="light" />
          <TextInput
            className="flex-1 ml-3 text-sm text-foreground"
            placeholder="hello@lalumira.com"
            placeholderTextColor="rgba(120, 113, 108, 0.6)"
            style={{ fontFamily: 'Inter_400Regular' }}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text
          className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {t('profile.password')}
        </Text>
        <View className="flex-row items-center bg-muted/50 rounded-xl px-4 py-3 border border-border mb-6">
          <LockKey size={18} color="#78716c" weight="light" />
          <TextInput
            className="flex-1 ml-3 text-sm text-foreground"
            placeholder="••••••••"
            placeholderTextColor="rgba(120, 113, 108, 0.6)"
            style={{ fontFamily: 'Inter_400Regular' }}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className="bg-foreground py-4 rounded-full items-center mb-6"
        >
          <Text
            className="text-xs uppercase tracking-[0.2em] text-background"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            {loading ? t('profile.pleaseWait') : isRegister ? t('profile.createAccountButton') : t('profile.signIn')}
          </Text>
        </Pressable>

        <View className="flex-row justify-center items-center">
          <Text
            className="text-sm text-muted-foreground"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {isRegister ? t('profile.alreadyHaveAccount') : t('profile.noAccount')}
          </Text>
          <Pressable onPress={() => setMode(isRegister ? 'login' : 'register')} className="ml-1">
            <Text
              className="text-sm text-foreground underline"
              style={{ fontFamily: 'Inter_700Bold' }}
            >
              {isRegister ? t('profile.signIn') : t('profile.createAccountButton')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function ProfileContent({ onLogout }: { onLogout: () => void }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const menuItems = useMenuItems(t);

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile header */}
      <View className="px-6 py-12 items-center border-b border-border/50">
        <View className="relative mb-4">
          <View
            className="rounded-full border-2 border-primary p-1"
            style={{
              shadowColor: '#c5a880',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/a/ACg8ocKa4GAxKVC_o9688VVpux6uS0yLZR2lvWQR_THw8E33dWUD4PY=s96-c',
              }}
              style={{ width: 88, height: 88, borderRadius: 44 }}
              contentFit="cover"
            />
          </View>
          <View
            className="absolute bottom-0 right-0 bg-background border border-border rounded-full p-1.5"
            style={Platform.select({
              ios: {
                shadowColor: '#231f20',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
              },
              android: { elevation: 2 },
            })}
          >
            <Camera size={14} color="#231f20" weight="light" />
          </View>
        </View>
        <Text
          className="text-2xl mb-1 text-foreground"
          style={{ fontFamily: 'CormorantGaramond_500Medium' }}
        >
          {t('profile.guestUser')}
        </Text>
        <Text
          className="text-xs text-muted-foreground tracking-widest uppercase"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {t('profile.memberSince')}
        </Text>
      </View>

      {/* Menu */}
      <View className="px-6 py-8">
        <View>
          {menuItems.map((item, index) => (
            <View key={item.label}>
              <Pressable className="flex-row items-center justify-between py-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                    <item.icon size={20} color="#231f20" weight="light" />
                  </View>
                  <Text
                    className="text-sm tracking-wide text-foreground ml-4"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    {item.label}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  {item.badge ? (
                    <View className="bg-accent px-2 py-0.5 rounded-full mr-2">
                      <Text
                        className="text-[10px] text-foreground"
                        style={{ fontFamily: 'Inter_400Regular' }}
                      >
                        {item.badge}
                      </Text>
                    </View>
                  ) : null}
                  <CaretRight size={16} color="#78716c" weight="light" />
                </View>
              </Pressable>
              {index < menuItems.length - 1 ? (
                <View className="h-px bg-border/30 w-full ml-14" />
              ) : null}
            </View>
          ))}
        </View>

        <Pressable
          onPress={onLogout}
          className="w-full border border-destructive/20 py-4 rounded-full mt-12 items-center"
        >
          <Text
            className="text-xs uppercase tracking-widest text-destructive"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            {t('profile.logout')}
          </Text>
        </Pressable>

        <View className="mt-12 items-center">
          <Text
            className="text-[10px] text-muted-foreground tracking-widest uppercase mb-2"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {t('profile.version')}
          </Text>
          <View className="flex-row">
            <Pressable>
              <Text
                className="text-[10px] text-muted-foreground underline"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {t('profile.privacyPolicy')}
              </Text>
            </Pressable>
            <Pressable className="ml-4">
              <Text
                className="text-[10px] text-muted-foreground underline"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {t('profile.termsOfService')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default function ProfileScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <View className="flex-1 bg-background">
      {isLoggedIn ? (
        <ProfileContent onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          <AuthForm onLogin={() => setIsLoggedIn(true)} />
        </ScrollView>
      )}
    </View>
  );
}
