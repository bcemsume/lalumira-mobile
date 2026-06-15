import { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, Platform, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { ArrowLeft, ShareNetwork, Plus } from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import * as Linking from 'expo-linking';
import RenderHtml from 'react-native-render-html';
import { useProduct, useProducts, useCart, formatPrice } from '@/lib/shopify-hooks';
import type { ShopifyProduct } from '@/lib/shopify';
import { useTranslation } from '@/lib/i18n';

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View>
      <Pressable onPress={() => setOpen(!open)} className="flex-row justify-between items-center py-2">
        <Text
          className="text-[10px] uppercase tracking-[0.2em] text-foreground"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {title}
        </Text>
        <View style={{ transform: [{ rotate: open ? '45deg' : '0deg' }] }}>
          <Plus size={16} color="#231f20" weight="light" />
        </View>
      </Pressable>
      {open ? <View className="mt-4">{children}</View> : null}
    </View>
  );
}

function getFirstImage(product: ShopifyProduct) {
  return product.featuredImage || product.images.nodes[0] || product.variants.nodes[0]?.image || null;
}

function getProductPrice(product: ShopifyProduct) {
  const variant = product.variants.nodes[0];
  if (!variant) return null;
  return formatPrice(variant.price.amount, variant.price.currencyCode);
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { data, isLoading } = useProduct(params.id || '');
  const { data: allProductsData } = useProducts(20);
  const { addToCart, isPendingAdd } = useCart();

  const product = data?.product ?? null;

  const productImages = useMemo(() => {
    if (!product) return [];
    const images = product.images.nodes.slice();
    if (product.featuredImage && !images.some((img) => img.url === product.featuredImage?.url)) {
      images.unshift(product.featuredImage);
    }
    return images;
  }, [product]);



  const selectedVariant = useMemo(() => {
    if (!product) return null;
    if (product.variants.nodes.length === 0) return null;
    if (Object.keys(selectedOptions).length === 0) return product.variants.nodes[0];
    return product.variants.nodes.find((variant) =>
      variant.selectedOptions.every(
        (opt) => selectedOptions[opt.name] === opt.value
      )
    );
  }, [product, selectedOptions]);

  const pairings = useMemo(() => {
    if (!product || !allProductsData) return [];
    return allProductsData.products.nodes
      .filter((p) => p.id !== product.id)
      .slice(0, 6);
  }, [product, allProductsData]);

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    await addToCart(selectedVariant.id, 1);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="small" color="#231f20" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-foreground text-center" style={{ fontFamily: 'CormorantGaramond_500Medium' }}>
          {t('product.notFound')}
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-sm text-primary" style={{ fontFamily: 'Inter_400Regular' }}>{t('product.goBack')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="absolute top-0 left-0 right-0 z-50"
        style={{ paddingTop: insets.top + 8 }}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={64} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View className="absolute inset-0 bg-background/95" />
        )}
        <View className="flex-row justify-between items-center px-6 h-16 relative z-10">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#231f20" weight="light" />
          </Pressable>
          <View className="flex-row">
            <Pressable
              onPress={async () => {
                const url = `https://www.lalumirajewelry.com/products/${product.handle}`;
                try {
                  await Linking.openURL(url);
                } catch {
                  // ignore
                }
              }}
            >
              <ShareNetwork size={24} color="#231f20" weight="light" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image carousel */}
        <View
          className="relative w-full bg-muted overflow-hidden"
          style={{
            marginTop: insets.top + 72,
            height: Dimensions.get('window').width,
          }}
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const width = e.nativeEvent.layoutMeasurement.width;
              setActiveImage(Math.round(x / width));
            }}
            scrollEventThrottle={16}
          >
            {productImages.map((img, index) => (
              <View
                key={`${img.url}-${index}`}
                style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').width }}
              >
                <Image source={{ uri: img.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              </View>
            ))}
          </ScrollView>
          {productImages.length > 1 ? (
            <View className="absolute bottom-5 left-0 right-0 flex-row justify-center items-center">
              {productImages.map((_, index) => (
                <View
                  key={index}
                  className="rounded-full mx-1"
                  style={{
                    width: index === activeImage ? 20 : 8,
                    height: 8,
                    backgroundColor: index === activeImage ? '#fcfaf8' : 'rgba(252, 250, 248, 0.5)',
                  }}
                />
              ))}
            </View>
          ) : null}
        </View>

        {/* Product info */}
        <View className="px-6 py-8">
          <View className="flex-row justify-between items-start mb-2">
            <Text
              className="text-3xl text-foreground flex-1 pr-4"
              style={{ fontFamily: 'CormorantGaramond_500Medium' }}
            >
              {product.title}
            </Text>
            <Text
              className="text-lg text-foreground"
              style={{ fontFamily: 'Inter_300Light' }}
            >
              {selectedVariant
                ? formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)
                : getProductPrice(product)}
            </Text>
          </View>
          <View className="gap-y-8">
            <View className="border-t border-border pt-6 gap-y-4">
              <Accordion title={t('product.description')} defaultOpen>
                <RenderHtml
                  contentWidth={Dimensions.get('window').width - 48}
                  source={{ html: product.descriptionHtml || `<p>${product.description}</p>` || '<p>No description available.</p>' }}
                  tagsStyles={{
                    p: {
                      fontFamily: 'Inter_300Light',
                      fontSize: 14,
                      lineHeight: 22,
                      color: '#78716c',
                      marginBottom: 12,
                    },
                    strong: {
                      fontFamily: 'Inter_500Medium',
                      color: '#231f20',
                    },
                    li: {
                      fontFamily: 'Inter_300Light',
                      fontSize: 14,
                      lineHeight: 22,
                      color: '#78716c',
                    },
                    ul: {
                      marginBottom: 12,
                    },
                  }}
                />
              </Accordion>
            </View>
          </View>
        </View>

        <View className="h-px bg-border w-full my-8 opacity-50" />

        {/* Pairings */}
        <View className="px-6 mb-12">
          <Text
            className="text-xl mb-8 text-foreground"
            style={{ fontFamily: 'CormorantGaramond_500Medium' }}
          >
            {t('product.pairsWellWith')}
          </Text>
          <View className="-mx-6 px-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
              {pairings.map((item) => {
                const image = getFirstImage(item);
                return (
                  <Link key={item.id} href={`/product/${item.handle}`} asChild>
                    <Pressable className="w-40 mr-4 last:mr-0">
                      <View className="aspect-square rounded-lg bg-muted border border-border overflow-hidden mb-3">
                        {image ? (
                          <Image
                            source={{ uri: image.url }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                          />
                        ) : null}
                      </View>
                      <Text
                        className="text-xs text-foreground"
                        style={{ fontFamily: 'CormorantGaramond_500Medium' }}
                      >
                        {item.title}
                      </Text>
                      <Text
                        className="text-[10px] text-muted-foreground"
                        style={{ fontFamily: 'Inter_400Regular' }}
                      >
                        {getProductPrice(item)}
                      </Text>
                    </Pressable>
                  </Link>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 p-6 border-t border-border"
        style={{
          paddingBottom: insets.bottom + 24,
          backgroundColor: 'rgba(252, 250, 248, 0.9)',
        }}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={64} tint="light" style={StyleSheet.absoluteFill} />
        ) : null}
        <Pressable
          onPress={handleAddToCart}
          disabled={!selectedVariant?.availableForSale || isPendingAdd}
          className="bg-foreground py-4 rounded-full items-center relative z-10 flex-row justify-center px-6"
          style={{
            opacity: selectedVariant?.availableForSale ? 1 : 0.5,
            shadowColor: '#231f20',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text
            className="text-xs uppercase tracking-[0.2em] text-background"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            {isPendingAdd ? t('product.adding') : selectedVariant?.availableForSale ? t('product.addToBag') : t('product.outOfStock')}
          </Text>
          <Text
            className="text-sm text-background ml-4"
            style={{ fontFamily: 'Inter_300Light' }}
          >
            {selectedVariant
              ? formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)
              : getProductPrice(product)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
