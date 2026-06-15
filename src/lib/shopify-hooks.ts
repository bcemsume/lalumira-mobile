import * as SecureStore from 'expo-secure-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_COLLECTIONS_QUERY,
  GET_COLLECTION_BY_HANDLE_QUERY,
  GET_CART_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from './shopify-queries';
import { shopifyClient, type ShopifyProduct, type ShopifyCollection, type ShopifyCart, formatPrice } from './shopify';

const CART_ID_KEY = 'lalumira.cartId';

function normalizeErrors(result: { errors?: unknown; data?: unknown }) {
  const hasData = result.data !== undefined && result.data !== null;
  if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
    const messages = result.errors.map((e: unknown) => {
      if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string') {
        return e.message;
      }
      return String(e);
    });
    if (!hasData) {
      throw new Error(messages.filter(Boolean).join(', '));
    }
  }
  return result.data;
}

async function getCartId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(CART_ID_KEY);
  } catch {
    return null;
  }
}

async function setCartId(cartId: string) {
  await SecureStore.setItemAsync(CART_ID_KEY, cartId);
}

export { formatPrice };

export function useProducts(first = 20, query?: string) {
  return useQuery<{ products: { nodes: ShopifyProduct[] } }>({
    queryKey: ['products', first, query],
    queryFn: async () => {
      const result = await shopifyClient.request(GET_PRODUCTS_QUERY, {
        first,
        query: query || undefined,
      });
      return normalizeErrors(result) as { products: { nodes: ShopifyProduct[] } };
    },
  });
}

export function useProduct(handle: string) {
  return useQuery<{ product: ShopifyProduct | null }>({
    queryKey: ['product', handle],
    queryFn: async () => {
      const result = await shopifyClient.request(GET_PRODUCT_BY_HANDLE_QUERY, { handle });
      return normalizeErrors(result) as { product: ShopifyProduct | null };
    },
    enabled: Boolean(handle),
  });
}

export function useCollections(first = 20) {
  return useQuery<{ collections: { nodes: ShopifyCollection[] } }>({
    queryKey: ['collections', first],
    queryFn: async () => {
      const result = await shopifyClient.request(GET_COLLECTIONS_QUERY, { first });
      return normalizeErrors(result) as { collections: { nodes: ShopifyCollection[] } };
    },
  });
}

export function useCollection(handle: string, first = 50) {
  return useQuery<{ collection: ShopifyCollection & { products: { nodes: ShopifyProduct[] } } | null }>({
    queryKey: ['collection', handle, first],
    queryFn: async () => {
      const result = await shopifyClient.request(GET_COLLECTION_BY_HANDLE_QUERY, { handle, first });
      return normalizeErrors(result) as { collection: ShopifyCollection & { products: { nodes: ShopifyProduct[] } } | null };
    },
    enabled: Boolean(handle),
  });
}

export function useCart() {
  const queryClient = useQueryClient();

  const cartQuery = useQuery<{ cart: ShopifyCart | null }>({
    queryKey: ['cart'],
    queryFn: async () => {
      const cartId = await getCartId();
      if (!cartId) return { cart: null };
      try {
        const result = await shopifyClient.request(GET_CART_QUERY, { cartId });
        return normalizeErrors(result) as { cart: ShopifyCart | null };
      } catch {
        return { cart: null };
      }
    },
    retry: false,
  });

  const createCartMutation = useMutation({
    mutationFn: async ({ variantId, quantity }: { variantId: string; quantity: number }) => {
      const result = await shopifyClient.request(CART_CREATE_MUTATION, {
        input: {
          lines: [{ merchandiseId: variantId, quantity }],
        },
      });
      const data = normalizeErrors(result) as { cartCreate: { cart: ShopifyCart; userErrors: { field: string[]; message: string }[] } };
      if (data.cartCreate.userErrors.length > 0) {
        throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(', '));
      }
      return data.cartCreate.cart;
    },
    onSuccess: (cart) => {
      setCartId(cart.id);
      queryClient.setQueryData(['cart'], { cart });
    },
  });

  const addLineMutation = useMutation({
    mutationFn: async ({ cartId, variantId, quantity }: { cartId: string; variantId: string; quantity: number }) => {
      const result = await shopifyClient.request(CART_LINES_ADD_MUTATION, {
        cartId,
        lines: [{ merchandiseId: variantId, quantity }],
      });
      const data = normalizeErrors(result) as { cartLinesAdd: { cart: ShopifyCart; userErrors: { field: string[]; message: string }[] } };
      if (data.cartLinesAdd.userErrors.length > 0) {
        throw new Error(data.cartLinesAdd.userErrors.map((e) => e.message).join(', '));
      }
      return data.cartLinesAdd.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], { cart });
    },
  });

  const updateLineMutation = useMutation({
    mutationFn: async ({ cartId, lineId, quantity }: { cartId: string; lineId: string; quantity: number }) => {
      const result = await shopifyClient.request(CART_LINES_UPDATE_MUTATION, {
        cartId,
        lines: [{ id: lineId, quantity }],
      });
      const data = normalizeErrors(result) as { cartLinesUpdate: { cart: ShopifyCart; userErrors: { field: string[]; message: string }[] } };
      if (data.cartLinesUpdate.userErrors.length > 0) {
        throw new Error(data.cartLinesUpdate.userErrors.map((e) => e.message).join(', '));
      }
      return data.cartLinesUpdate.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], { cart });
    },
  });

  const removeLineMutation = useMutation({
    mutationFn: async ({ cartId, lineId }: { cartId: string; lineId: string }) => {
      const result = await shopifyClient.request(CART_LINES_REMOVE_MUTATION, {
        cartId,
        lineIds: [lineId],
      });
      const data = normalizeErrors(result) as { cartLinesRemove: { cart: ShopifyCart; userErrors: { field: string[]; message: string }[] } };
      if (data.cartLinesRemove.userErrors.length > 0) {
        throw new Error(data.cartLinesRemove.userErrors.map((e) => e.message).join(', '));
      }
      return data.cartLinesRemove.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], { cart });
    },
  });

  async function addToCart(variantId: string, quantity = 1) {
    const cartId = await getCartId();
    if (cartId && cartQuery.data?.cart) {
      await addLineMutation.mutateAsync({ cartId, variantId, quantity });
    } else {
      await createCartMutation.mutateAsync({ variantId, quantity });
    }
  }

  async function updateLine(lineId: string, quantity: number) {
    const cartId = await getCartId();
    if (!cartId || !cartQuery.data?.cart) return;
    if (quantity <= 0) {
      await removeLineMutation.mutateAsync({ cartId, lineId });
    } else {
      await updateLineMutation.mutateAsync({ cartId, lineId, quantity });
    }
  }

  async function removeLine(lineId: string) {
    const cartId = await getCartId();
    if (!cartId || !cartQuery.data?.cart) return;
    await removeLineMutation.mutateAsync({ cartId, lineId });
  }

  return {
    cart: cartQuery.data?.cart ?? null,
    isLoading: cartQuery.isLoading,
    isPendingAdd: createCartMutation.isPending || addLineMutation.isPending,
    isPendingUpdate: updateLineMutation.isPending,
    isPendingRemove: removeLineMutation.isPending,
    error: cartQuery.error || createCartMutation.error || addLineMutation.error || updateLineMutation.error || removeLineMutation.error,
    addToCart,
    updateLine,
    removeLine,
    refetch: cartQuery.refetch,
  };
}
