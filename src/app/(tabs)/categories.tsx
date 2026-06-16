import { useMemo, useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  TextInput,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { MagnifyingGlass, Heart, PlusCircle } from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams } from 'expo-router';
import { useProducts, useCollections, useCollection, useCart, useSliderHeroMetaobject, formatPrice } from '@/lib/shopify-hooks';
import type { ShopifyProduct } from '@/lib/shopify';
import { useTranslation } from '@/lib/i18n';

const screenWidth = Dimensions.get('window').width;

function getFirstImage(product: ShopifyProduct) {
  return product.featuredImage || product.images.nodes[0] || product.variants.nodes[0]?.image || null;
}

function getFirstVariant(product: ShopifyProduct) {
  return product.variants.nodes[0];
}

function getProductPrice(product: ShopifyProduct) {
  const variant = getFirstVariant(product);
  if (!variant) return null;
  return formatPrice(variant.price.amount, variant.price.currencyCode);
}

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ collection?: string }>();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeHandle, setActiveHandle] = useState('');
  const { data: collectionsData, isLoading: collectionsLoading } = useCollections(20);
  const { data: productsData, isLoading: productsLoading } = useProducts(50, search || undefined);
  const { data: sliderHeroData, isLoading: sliderHeroLoading } = useSliderHeroMetaobject();
  const filters = useMemo(() => {
    const list = collectionsData?.collections.nodes.map((c) => ({ title: c.title, handle: c.handle })) ?? [];
    return [{ title: t('categories.allJewelry'), handle: '' }, ...list];
  }, [collectionsData, t]);

  const activeCollection = useMemo(() => {
    return filters.find((f) => f.handle === activeHandle) ?? filters[0];
  }, [filters, activeHandle]);

  const { data: collectionData, isLoading: collectionLoading } = useCollection(
    activeCollection?.handle || params.collection || '',
    50
  );
  const { addToCart } = useCart();
  const collection = collectionData?.collection ?? null;

  const products = useMemo(() => {
    if (activeCollection?.handle && collection) {
      return collection.products.nodes;
    }
    if (params.collection && collection) {
      return collection.products.nodes;
    }
    return productsData?.products.nodes ?? [];
  }, [activeCollection, params.collection, collection, productsData]);

  const activeCollectionTitle = useMemo(() => {
    if (activeCollection?.handle) return activeCollection.title;
    if (params.collection && collection) return collection.title;
    return null;
  }, [activeCollection, params.collection, collection]);

  const isLoading = productsLoading || collectionsLoading || collectionLoading || sliderHeroLoading;

  const sliderMeta = sliderHeroData?.metaobjects.nodes[0] ?? null;
  const sliderFields = sliderMeta?.fields ?? [];
  const sliderImageField = sliderFields.find((f) => f.key === 'slider_image');
  const sliderTitleField = sliderFields.find((f) => f.key === 'slider_title');
  const sliderImageUrl = sliderImageField?.reference?.image?.url ||
    'https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/xP8Lx8iUwiq/components/s4DXXhFuVd1.png';
  const sliderTitle = sliderTitleField?.value || activeCollectionTitle || t('categories.allJewelry');

  const tabScrollRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});

  function handleSelectTab(handle: string) {
    setActiveHandle(handle);
    const layout = tabLayouts.current[handle];
    if (layout && tabScrollRef.current) {
      const centerOffset = layout.x + layout.width / 2 - screenWidth / 2;
      tabScrollRef.current.scrollTo({ x: Math.max(0, centerOffset), animated: true });
    }
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header with search */}
      <View
        className="absolute top-0 left-0 right-0 z-50 border-b border-border/50"
        style={{ paddingTop: insets.top + 8 }}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={64} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View className="absolute inset-0 bg-background/95" />
        )}
        <View className="px-6 py-4 relative z-10">
          <View className="flex-row items-center bg-muted/50 rounded-full px-4 py-2 border border-border">
            <MagnifyingGlass size={20} color="#78716c" weight="light" />
            <TextInput
              className="flex-1 ml-3 text-sm text-foreground"
              placeholder={t('categories.searchPlaceholder')}
              placeholderTextColor="rgba(120, 113, 108, 0.6)"
              style={{ fontFamily: 'Inter_400Regular' }}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 80, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View className="px-6 py-6">
          <View className="relative w-full aspect-[21/9] rounded-lg overflow-hidden border border-border bg-muted">
            {(() => {
              const bannerUrl = !activeCollection?.handle
                ? sliderImageUrl
                : collection?.image?.url || sliderImageUrl;
              return bannerUrl ? (
                <Image source={{ uri: bannerUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              ) : null;
            })()}
            <View className="absolute inset-0 bg-black/10 items-center justify-center">
              <View className="items-center px-4">
                <Text
                  className="text-xl text-white mb-1"
                  style={{ fontFamily: 'CormorantGaramond_500Medium' }}
                >
                  {activeCollectionTitle || sliderTitle}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Collection tabs */}
        <View className="border-b border-border/30">
          <ScrollView
            ref={tabScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            scrollEventThrottle={16}
          >
            <View className="flex-row items-center py-2" style={{ gap: 20 }}>
              {filters.map((filter) => {
                const active = filter.handle === activeHandle;
                return (
                  <Pressable
                    key={filter.handle}
                    onPress={() => handleSelectTab(filter.handle)}
                    onLayout={(e) => {
                      const { x, width } = e.nativeEvent.layout;
                      tabLayouts.current[filter.handle] = { x, width };
                    }}
                    className=""
                  >
                    <View
                      style={{
                        borderBottomWidth: active ? 2 : 0,
                        borderBottomColor: '#c5a880',
                        paddingBottom: 6,
                      }}
                    >
                      <Text
                        className={`text-xs uppercase tracking-widest whitespace-nowrap ${
                          active ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                        style={{ fontFamily: active ? 'Inter_700Bold' : 'Inter_400Regular' }}
                      >
                        {filter.title}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Toolbar */}
        <View className="px-6 my-6 flex-row justify-between items-center">
          <Text
            className="text-xs text-muted-foreground uppercase tracking-wider"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {products.length} {t('categories.items')}
          </Text>
        </View>

        {/* Product grid */}
        <View className="px-6 flex-row flex-wrap">
          {isLoading ? (
            <View className="w-full items-center py-12">
              <ActivityIndicator size="small" color="#231f20" />
            </View>
          ) : (
            products.map((product, index) => {
              const image = getFirstImage(product);
              const variant = getFirstVariant(product);
              return (
                <Link key={product.id} href={`/product/${product.handle}`} asChild>
                  <Pressable
                    className="w-[48%] mb-8"
                    style={{ marginRight: index % 2 === 0 ? '4%' : 0 }}
                  >
                    <View className="relative aspect-square rounded-lg bg-muted border border-border overflow-hidden mb-3">
                      {image ? (
                        <Image
                          source={{ uri: image.url }}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                        />
                      ) : null}
                      <Pressable className="absolute top-2 right-2 p-1">
                        <Heart size={20} color="#78716c" weight="light" />
                      </Pressable>
                    </View>
                    <Text
                      className="text-base mb-1 text-foreground"
                      style={{ fontFamily: 'CormorantGaramond_500Medium' }}
                    >
                      {product.title}
                    </Text>
                    <Text
                      className="text-xs text-muted-foreground mb-1"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      {product.productType || ''}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text
                        className="text-sm text-foreground"
                        style={{ fontFamily: 'Inter_400Regular' }}
                      >
                        {getProductPrice(product)}
                      </Text>
                      {variant ? (
                        <Pressable
                          onPress={async (e) => {
                            e.stopPropagation();
                            await addToCart(variant.id, 1);
                          }}
                        >
                          <PlusCircle size={20} color="#c5a880" weight="light" />
                        </Pressable>
                      ) : null}
                    </View>
                  </Pressable>
                </Link>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
