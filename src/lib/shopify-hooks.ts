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
  CUSTOMER_CREATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
  CUSTOMER_QUERY,
  GET_HERO_METAOBJECT_QUERY,
} from './shopify-queries';
import { shopifyClient, type ShopifyProduct, type ShopifyCollection, type ShopifyCart, type ShopifyHeroMetaobject, formatPrice } from './shopify';

const CART_ID_KEY = 'lalumira.cartId';
const CUSTOMER_TOKEN_KEY = 'lalumira.customerToken';

type ShopifyCustomer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  acceptsMarketing: boolean;
  defaultAddress: {
    id: string;
    address1: string;
    address2: string | null;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone: string | null;
  } | null;
  orders: {
    nodes: {
      id: string;
      name: string;
      orderNumber: number;
      processedAt: string;
      financialStatus: string;
      fulfillmentStatus: string;
      totalPrice: {
        amount: string;
        currencyCode: string;
      };
    }[];
  };
};

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

async function getCustomerToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(CUSTOMER_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function setCustomerToken(token: string) {
  await SecureStore.setItemAsync(CUSTOMER_TOKEN_KEY, token);
}

async function deleteCustomerToken() {
  await SecureStore.deleteItemAsync(CUSTOMER_TOKEN_KEY);
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

export function useHeroMetaobject() {
  return useQuery<{ metaobjects: { nodes: ShopifyHeroMetaobject[] } }>({
    queryKey: ['hero'],
    queryFn: async () => {
      const result = await shopifyClient.request(GET_HERO_METAOBJECT_QUERY);
      return normalizeErrors(result) as { metaobjects: { nodes: ShopifyHeroMetaobject[] } };
    },
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

export type AuthResult = {
  success: boolean;
  error?: string;
};

export function useAuth() {
  const queryClient = useQueryClient();

  const customerQuery = useQuery<{ customer: ShopifyCustomer | null }>({
    queryKey: ['customer'],
    queryFn: async () => {
      const token = await getCustomerToken();
      if (!token) return { customer: null };
      try {
        const result = await shopifyClient.request(CUSTOMER_QUERY, { customerAccessToken: token });
        return normalizeErrors(result) as { customer: ShopifyCustomer | null };
      } catch {
        await deleteCustomerToken();
        return { customer: null };
      }
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await shopifyClient.request(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, {
        input: { email, password },
      });
      const data = normalizeErrors(result) as {
        customerAccessTokenCreate: {
          customerAccessToken: { accessToken: string; expiresAt: string } | null;
          customerUserErrors: { field: string[]; message: string }[];
        };
      };
      if (data.customerAccessTokenCreate.customerUserErrors.length > 0) {
        throw new Error(data.customerAccessTokenCreate.customerUserErrors.map((e) => e.message).join(', '));
      }
      const token = data.customerAccessTokenCreate.customerAccessToken?.accessToken;
      if (!token) throw new Error('Login failed');
      return token;
    },
    onSuccess: (token) => {
      setCustomerToken(token);
      queryClient.invalidateQueries({ queryKey: ['customer'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (input: { email: string; password: string; firstName: string; lastName: string }) => {
      const createResult = await shopifyClient.request(CUSTOMER_CREATE_MUTATION, { input });
      const createData = normalizeErrors(createResult) as {
        customerCreate: {
          customer: ShopifyCustomer | null;
          customerUserErrors: { field: string[]; message: string }[];
        };
      };
      if (createData.customerCreate.customerUserErrors.length > 0) {
        throw new Error(createData.customerCreate.customerUserErrors.map((e) => e.message).join(', '));
      }
      const loginResult = await shopifyClient.request(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, {
        input: { email: input.email, password: input.password },
      });
      const loginData = normalizeErrors(loginResult) as {
        customerAccessTokenCreate: {
          customerAccessToken: { accessToken: string; expiresAt: string } | null;
          customerUserErrors: { field: string[]; message: string }[];
        };
      };
      if (loginData.customerAccessTokenCreate.customerUserErrors.length > 0) {
        throw new Error(loginData.customerAccessTokenCreate.customerUserErrors.map((e) => e.message).join(', '));
      }
      const token = loginData.customerAccessTokenCreate.customerAccessToken?.accessToken;
      if (!token) throw new Error('Registration failed');
      return token;
    },
    onSuccess: (token) => {
      setCustomerToken(token);
      queryClient.invalidateQueries({ queryKey: ['customer'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = await getCustomerToken();
      if (token) {
        await shopifyClient.request(CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION, { customerAccessToken: token });
      }
      await deleteCustomerToken();
    },
    onSuccess: () => {
      queryClient.setQueryData(['customer'], { customer: null });
    },
  });

  async function login(email: string, password: string): Promise<AuthResult> {
    try {
      await loginMutation.mutateAsync({ email, password });
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
    }
  }

  async function register(input: { email: string; password: string; firstName: string; lastName: string }): Promise<AuthResult> {
    try {
      await registerMutation.mutateAsync(input);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Registration failed' };
    }
  }

  async function logout() {
    await logoutMutation.mutateAsync();
  }

  return {
    customer: customerQuery.data?.customer ?? null,
    isLoading: customerQuery.isLoading,
    isPendingLogin: loginMutation.isPending,
    isPendingRegister: registerMutation.isPending,
    isPendingLogout: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    login,
    register,
    logout,
    refetch: customerQuery.refetch,
  };
}
