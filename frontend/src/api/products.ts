import {api} from './client';

export interface ProductInfo {
  uniqueCode: string;
  productCode: string;
  productName: string;
  productImageUrl?: string;
  createdAt: string;
}

export async function getProductByUniqueCode(uniqueCode: string): Promise<ProductInfo | null> {
  try {
    const {data} = await api.get<ProductInfo>(`/products/${uniqueCode}`);
    return data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getAllProducts(): Promise<ProductInfo[]> {
  const {data} = await api.get<{items: ProductInfo[]}>('/products');
  return data.items;
}

export async function createProduct(
  uniqueCode: string,
  productCode: string,
  productName: string,
  productImage?: File
): Promise<ProductInfo> {
  const formData = new FormData();
  formData.append('uniqueCode', uniqueCode);
  formData.append('productCode', productCode);
  formData.append('productName', productName);
  if (productImage) {
    formData.append('productImage', productImage);
  }

  const {data} = await api.post<ProductInfo>('/products', formData, {
    headers: {'Content-Type': 'multipart/form-data'}
  });
  return data;
}

