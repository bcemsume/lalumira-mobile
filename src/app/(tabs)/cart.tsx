import { View, Text, Pressable, ScrollView, Image, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import * as Linking from 'expo-linking';
import { Minus, Plus, Trash } from 'phosphor-react-native';
import { useCart, formatPrice } from '@/lib/shopify-hooks';
import { useTranslation } from '@/lib/i18n';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { cart, isLoading, isPendingUpdate, isPendingRemove, updateLine, removeLine } = useCart();

  const lines = cart?.lines.nodes ?? [];
  const subtotal = cart?.cost.subtotalAmount;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top + 32 }}>
      <Text
        className="text-2xl mb-6 text-foreground px-6"
        style={{ fontFamily: 'CormorantGaramond_500Medium' }}
      >
        {t('cart.title')}
      </Text>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#231f20" />
        </View>
      ) : lines.length === 0 ? (
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ paddingBottom: insets.bottom + 80 }}
        >
          <Text
            className="text-sm text-muted-foreground text-center mb-8"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {t('cart.empty')}
          </Text>
          <Link href="/categories" asChild>
            <Pressable className="bg-foreground px-8 py-3 rounded-full">
              <Text
                className="text-xs uppercase tracking-[0.2em] text-background"
                style={{ fontFamily: 'Inter_700Bold' }}
              >
                {t('cart.continueShopping')}
              </Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingBottom: insets.bottom + 200 }}
            showsVerticalScrollIndicator={false}
          >
            {lines.map((line) => {
              const imageUrl = line.merchandise.product.featuredImage?.url;
              return (
                <View key={line.id} className="flex-row py-4 border-b border-border/30">
                  <View className="w-24 h-24 rounded-lg bg-muted border border-border overflow-hidden mr-4">
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
                    ) : null}
                  </View>
                  <View className="flex-1 justify-between">
                    <View>
                      <Text
                        className="text-base text-foreground"
                        style={{ fontFamily: 'CormorantGaramond_500Medium' }}
                      >
                        {line.merchandise.product.title}
                      </Text>
                      <Text
                        className="text-xs text-muted-foreground mt-1"
                        style={{ fontFamily: 'Inter_400Regular' }}
                      >
                        {line.merchandise.title}
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Pressable
                          onPress={() => updateLine(line.id, line.quantity - 1)}
                          disabled={isPendingUpdate}
                          className="w-8 h-8 rounded-full border border-border items-center justify-center"
                        >
                          <Minus size={14} color="#231f20" weight="light" />
                        </Pressable>
                        <Text
                          className="text-sm text-foreground mx-4"
                          style={{ fontFamily: 'Inter_400Regular' }}
                        >
                          {line.quantity}
                        </Text>
                        <Pressable
                          onPress={() => updateLine(line.id, line.quantity + 1)}
                          disabled={isPendingUpdate}
                          className="w-8 h-8 rounded-full border border-border items-center justify-center"
                        >
                          <Plus size={14} color="#231f20" weight="light" />
                        </Pressable>
                      </View>
                      <View className="flex-row items-center">
                        <Text
                          className="text-sm text-foreground mr-4"
                          style={{ fontFamily: 'Inter_400Regular' }}
                        >
                          {formatPrice(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                        </Text>
                        <Pressable
                          onPress={() => removeLine(line.id)}
                          disabled={isPendingRemove}
                        >
                          <Trash size={18} color="#78716c" weight="light" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View
            className="absolute left-0 right-0 px-6 py-6 border-t border-border bg-background"
            style={{ bottom: Platform.OS === 'ios' ? 76 : 56, paddingBottom: insets.bottom + 12 }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className="text-sm text-muted-foreground"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {t('cart.subtotal')}
              </Text>
              <Text
                className="text-lg text-foreground"
                style={{ fontFamily: 'CormorantGaramond_500Medium' }}
              >
                {subtotal ? formatPrice(subtotal.amount, subtotal.currencyCode) : '-'}
              </Text>
            </View>
            <Pressable
              onPress={async () => {
                if (cart?.checkoutUrl) {
                  await Linking.openURL(cart.checkoutUrl);
                }
              }}
              className="bg-foreground py-4 rounded-full items-center"
            >
              <Text
                className="text-xs uppercase tracking-[0.2em] text-background"
                style={{ fontFamily: 'Inter_700Bold' }}
              >
                {t('cart.checkout')}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
