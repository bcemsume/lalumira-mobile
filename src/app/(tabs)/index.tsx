import { ScrollView, View, Text, Pressable, Platform, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MagnifyingGlass, Heart } from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useProducts, useCollections, useHeroMetaobject, formatPrice } from '@/lib/shopify-hooks';
import type { ShopifyProduct } from '@/lib/shopify';
import { useLocale, useToggleLocale, useTranslation } from '@/lib/i18n';

function SectionDivider({ opacity = 100 }: { opacity?: number }) {
  return (
    <View
      className="h-px w-full my-12"
      style={{ backgroundColor: `rgba(232, 223, 211, ${opacity / 100})` }}
    />
  );
}

function stripHtml(html: string) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\n\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}


const { height: screenHeight } = Dimensions.get('window');
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const locale = useLocale();
  const toggleLocale = useToggleLocale();
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);
  const { data: productsData, isLoading: productsLoading } = useProducts(8);
  const { data: collectionsData, isLoading: collectionsLoading } = useCollections(6);
  const { data: heroData, isLoading: heroLoading } = useHeroMetaobject();

  const products = productsData?.products.nodes ?? [];
  const collections = collectionsData?.collections.nodes ?? [];

  const heroMeta = heroData?.metaobjects.nodes[0] ?? null;
  const heroFields = heroMeta?.fields ?? [];
  const getField = (key: string) => heroFields.find((f) => f.key === key);

  const heroDescriptionField = getField('hero_description');
  const heroTitleField = getField('hero_title');
  const heroImageField = getField('hero_image');
  const heroProductRef = getField('hero_product')?.reference as { title?: string; handle?: string; description?: string; featuredImage?: { url: string; altText: string | null } } | null | undefined;

  const heroImageUrl = heroImageField?.reference?.image?.url || heroProductRef?.featuredImage?.url ||
    'https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/xP8Lx8iUwiq/components/FUIFp8WudIG.png';
  const heroTitle = heroTitleField?.value || heroProductRef?.title || t('home.heroTitleFallback');
  const heroSubtitle = heroDescriptionField?.value || heroProductRef?.description
    ? truncateText(stripHtml(heroProductRef?.description || heroDescriptionField?.value || ''), 90)
    : t('home.heroSubtitleFallback');
  const heroHandle = heroProductRef?.handle;

  const headerHeight = insets.top + 72;
  const heroHeight = screenHeight * 0.7;
  const parallaxOffset = scrollY * 0.35;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="absolute top-0 left-0 right-0 z-50 border-b border-border/50"
        style={{ paddingTop: insets.top + 8, height: headerHeight }}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={64} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View className="absolute inset-0 bg-background/95" />
        )}
        <View className="flex-row items-center justify-between px-6 h-16 relative z-10">
          <Text
            className="text-2xl uppercase text-foreground"
            style={{ fontFamily: 'CormorantGaramond_500Medium', letterSpacing: 4 }}
          >
            Lalumira
          </Text>
          <View className="flex-row items-center">
            <Pressable onPress={toggleLocale} className="mr-4 w-8 items-center justify-center">
              <Text
                className="text-xs uppercase tracking-[0.2em] text-foreground"
                style={{ fontFamily: 'Inter_700Bold' }}
              >
                {locale === 'tr' ? 'EN' : 'TR'}
              </Text>
            </Pressable>
            <Link href="/categories" asChild>
              <Pressable className="w-8 items-end">
                <MagnifyingGlass size={24} color="#231f20" weight="light" />
              </Pressable>
            </Link>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
      >
        {/* Hero */}
        <View
          className="relative w-full overflow-hidden bg-muted"
          style={{ height: heroHeight }}
        >
          {heroLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="small" color="#231f20" />
            </View>
          ) : (
            <>
              <Image
                source={{
                  uri: heroImageUrl,
                }}
                style={{
                  width: '100%',
                  height: heroHeight * 1.25,
                  transform: [{ translateY: parallaxOffset }],
                }}
                contentFit="cover"
                contentPosition="center"
              />
              <LinearGradient
                colors={['rgba(252, 250, 248, 0.6)', 'rgba(252, 250, 248, 0)']}
                locations={[0, 0.6]}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
              />
              <View className="absolute bottom-12 left-6 right-6 flex-col items-center">
                <Text
                  className="text-4xl text-foreground mb-4 text-center"
                  style={{ fontFamily: 'CormorantGaramond_500Medium' }}
                >
                  {heroTitle}
                </Text>
                <Text
                  className="text-sm text-foreground/80 mb-8 text-center max-w-[280px]"
                  style={{ fontFamily: 'Inter_300Light' }}
                >
                  {heroSubtitle}
                </Text>
                {heroHandle ? (
                  <Link href={`/product/${heroHandle}`} asChild>
                    <Pressable className="bg-foreground px-8 py-3 rounded-full">
                      <Text
                        className="text-xs uppercase tracking-[0.2em] text-background"
                        style={{ fontFamily: 'Inter_700Bold' }}
                      >
                        {t('home.explore')}
                      </Text>
                    </Pressable>
                  </Link>
                ) : (
                  <Link href="/categories" asChild>
                    <Pressable className="bg-foreground px-8 py-3 rounded-full">
                      <Text
                        className="text-xs uppercase tracking-[0.2em] text-background"
                        style={{ fontFamily: 'Inter_700Bold' }}
                      >
                        {t('home.explore')}
                      </Text>
                    </Pressable>
                  </Link>
                )}
              </View>
            </>
          )}
        </View>

        <SectionDivider />

        {/* New Arrivals */}
        <View className="px-6">
          <View className="flex-row justify-between items-end mb-8">
            <View>
              <Text
                className="text-2xl mb-1 text-foreground"
                style={{ fontFamily: 'CormorantGaramond_500Medium' }}
              >
                {t('home.newArrivals')}
              </Text>
              <Text
                className="text-xs text-muted-foreground uppercase tracking-wide"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {t('home.curatedPieces')}
              </Text>
            </View>
            <Link href="/categories" asChild>
              <Pressable>
                  <Text
                    className="text-xs tracking-wider uppercase text-foreground border-b border-foreground pb-1"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    {t('home.viewAll')}
                  </Text>
              </Pressable>
            </Link>
          </View>

          <View className="-mx-6 px-6">
            {productsLoading ? (
              <ActivityIndicator size="small" color="#231f20" className="py-6" />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
                {products.map((item) => {
                  const image = getFirstImage(item);
                  return (
                    <Link key={item.id} href={`/product/${item.handle}`} asChild>
                      <Pressable className="w-64 mr-4 last:mr-0">
                        <View className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden mb-4 border border-border">
                          {image ? (
                            <Image
                              source={{ uri: image.url }}
                              style={{ width: '100%', height: '100%' }}
                              contentFit="cover"
                            />
                          ) : null}
                          <Pressable className="absolute top-3 right-3">
                            <Heart size={20} color="#78716c" weight="light" />
                          </Pressable>
                        </View>
                        <Text
                          className="text-lg mb-1 text-foreground"
                          style={{ fontFamily: 'CormorantGaramond_500Medium' }}
                        >
                          {item.title}
                        </Text>
      {item.productType ? (
        <Text
          className="text-sm text-muted-foreground mb-2"
          style={{ fontFamily: 'Inter_300Light' }}
        >
          {item.productType.trim()}
        </Text>
      ) : null}
                        <Text
                          className="text-sm text-foreground"
                          style={{ fontFamily: 'Inter_400Regular' }}
                        >
                          {getProductPrice(item)}
                        </Text>
                      </Pressable>
                    </Link>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>

        <SectionDivider opacity={50} />

        {/* Shop by Category */}
        <View className="px-6">
          <Text
            className="text-2xl mb-8 text-center text-foreground"
            style={{ fontFamily: 'CormorantGaramond_500Medium' }}
          >
            {t('home.shopByCategory')}
          </Text>
          {collectionsLoading ? (
            <ActivityIndicator size="small" color="#231f20" className="py-6" />
          ) : (
            <View className="flex-row flex-wrap">
              {collections.map((cat, index) => {
                const imageUrl = cat.image?.url;
                const isEven = index % 2 === 0;
                return (
                  <Link key={cat.id} href={`/categories?collection=${cat.handle}`} asChild>
                    <Pressable
                      className="w-[48%] aspect-[3/4] rounded-lg overflow-hidden bg-muted border border-border mb-4"
                      style={{ marginRight: isEven ? '4%' : 0 }}
                    >
                      {imageUrl ? (
                        <Image
                          source={{ uri: imageUrl }}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                        />
                      ) : null}
                      <View className="absolute inset-0 bg-black/10" />
                      <View className="absolute bottom-6 left-0 right-0 items-center">
                        <View
                          className="px-6 py-2 rounded-full"
                          style={{ backgroundColor: 'rgba(252, 250, 248, 0.9)' }}
                        >
                          <Text
                            className="text-xs uppercase tracking-widest text-foreground"
                            style={{ fontFamily: 'Inter_400Regular' }}
                          >
                            {cat.title}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  </Link>
                );
              })}
            </View>
          )}
        </View>

        <SectionDivider opacity={50} />

        {/* Editorial removed */}
      </ScrollView>
    </View>
  );
}
