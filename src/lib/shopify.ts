export const SHOPIFY_STORE_DOMAIN = '0b8fa9-3.myshopify.com';
export const SHOPIFY_API_VERSION = '2025-04';
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'bf0b182d0aea247c57e5b29993e80153';

async function request(query: string, variables?: Record<string, unknown>) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  return json;
}

export const shopifyClient = { request };

export type ShopifySliderHeroMetaobject = {
  id: string;
  handle: string;
  fields: {
    key: string;
    value: string;
    type: string;
    reference: {
      __typename: string;
      image?: {
        url: string;
        altText: string | null;
      };
    } | null;
  }[];
};

export type ShopifyHeroMetaobject = {
  id: string;
  handle: string;
  fields: {
    key: string;
    value: string;
    type: string;
    reference: {
      __typename: string;
      image?: {
        url: string;
        altText: string | null;
      };
      id?: string;
      title?: string;
      handle?: string;
      description?: string;
      featuredImage?: {
        url: string;
        altText: string | null;
      };
    } | null;
  }[];
};

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  productType: string;
  tags: string[];
  options: {
    id: string;
    name: string;
    values: string[];
  }[];
  variants: {
    nodes: {
      id: string;
      title: string;
      availableForSale: boolean;
      price: {
        amount: string;
        currencyCode: string;
      };
      compareAtPrice: {
        amount: string;
        currencyCode: string;
      } | null;
      selectedOptions: {
        name: string;
        value: string;
      }[];
      image: {
        url: string;
        altText: string | null;
      } | null;
    }[];
  };
  images: {
    nodes: {
      url: string;
      altText: string | null;
    }[];
  };
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
};

export type ShopifyCollection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: {
    url: string;
    altText: string | null;
  } | null;
  products: {
    nodes: {
      id: string;
      featuredImage: {
        url: string;
        altText: string | null;
      } | null;
    }[];
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: {
    nodes: {
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        title: string;
        product: {
          id: string;
          title: string;
          handle: string;
          featuredImage: {
            url: string;
            altText: string | null;
          } | null;
        };
      };
      cost: {
        totalAmount: {
          amount: string;
          currencyCode: string;
        };
      };
    }[];
  };
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalTaxAmount: {
      amount: string;
      currencyCode: string;
    } | null;
  };
};

export function formatPrice(amount: string, currencyCode: string) {
  const value = parseFloat(amount);
  if (currencyCode === 'TRY') {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}
