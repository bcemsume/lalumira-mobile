import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { House, SquaresFour, Tote, User } from 'phosphor-react-native';
import { useCart } from '@/lib/shopify-hooks';
import { useLocale, useTranslation } from '@/lib/i18n';

const ACTIVE_COLOR = '#c5a880';
const INACTIVE_COLOR = '#78716c';

function TabIcon({
  Icon,
  badge,
  focused,
}: {
  Icon: typeof House;
  badge?: number;
  focused: boolean;
}) {
  const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;
  return (
    <View className="relative">
      <Icon size={22} color={color} weight="light" />
      {badge ? (
        <View className="absolute -top-1 -right-1.5 bg-secondary rounded-full min-w-[12px] h-3 px-0.5 items-center justify-center">
          <Text className="text-[8px] text-white" style={{ fontFamily: 'Inter_700Bold' }}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function TabLabel({ labelKey, focused }: { labelKey: string; focused: boolean }) {
  const { t } = useTranslation();
  const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;
  return (
    <Text
      className="text-[8px] tracking-wider uppercase"
      style={{
        color,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        marginTop: 2,
        lineHeight: 12,
      }}
      numberOfLines={1}
      allowFontScaling={false}
    >
      {t(labelKey)}
    </Text>
  );
}

export default function TabLayout() {
  const { cart } = useCart();
  const cartCount = cart?.totalQuantity ?? 0;
  useLocale();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 76 : 56,
          paddingBottom: Platform.OS === 'ios' ? 12 : 0,
          borderTopWidth: 1,
          borderTopColor: '#e8dfd3',
          backgroundColor: 'rgba(252, 250, 248, 0.95)',
        },
        tabBarBackground: () => null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={House} focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel labelKey="tabBar.home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={SquaresFour} focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel labelKey="tabBar.categories" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={Tote} focused={focused} badge={cartCount} />,
          tabBarLabel: ({ focused }) => <TabLabel labelKey="tabBar.cart" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={User} focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel labelKey="tabBar.profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
