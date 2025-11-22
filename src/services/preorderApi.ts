// src/services/preorderApi.ts
import UseAxiosSecure from '@/axios/UseAxiosSecure';

export interface Preorder {
  _id: string;
  bookId?: {
    _id: string | null;
    title: string;
    author: string;
    imageUrl: string;
    price: number;
    ISBN?: string;
    Location?: string;
    Condition?: string;
    Exchange?: string;
    Language?: string;
    category: string;
    description: string;
  } | null;
  bookDetails?: {
    title?: string;
    author?: string;
    isbn?: string;
    genre?: string;
    language?: string;
    description?: string;
  };
  userId: string;
  userEmail: string;
  userName: string;
  identification?: {
    type?: 'nid' | 'passport' | 'driving_license' | 'other';
    number?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'fulfilled';
  contactInfo?: {
    phone?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePreorderRequest {
  bookId?: string;
  bookDetails?: {
    title: string;
    author: string;
    isbn?: string;
    genre?: string;
    language?: string;
    description?: string;
  };
  userId: string;
  userEmail: string;
  userName: string;
  identification?: {
    type: 'nid' | 'passport' | 'driving_license' | 'other';
    number: string;
  };
  address?: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
  contactInfo?: {
    phone?: string;
  };
  notes?: string;
}

export interface PreorderResponse {
  message: string;
  preorder: Preorder;
}

class PreorderApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const axiosSecure = UseAxiosSecure();
    const method = options.method || 'GET';
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const url = `/api${endpoint}`;

    const res = await axiosSecure.request<T>({
      url,
      method,
      headers,
      data: options.body,
    });

    return res.data as T;
  }

  /**
   * Create a new preorder
   */
  async createPreorder(data: CreatePreorderRequest): Promise<Preorder> {
    try {
      const response = await this.makeRequest<PreorderResponse>('/preorders', {
        method: 'POST',
        body: data,
      });
      return response.preorder;
    } catch (error: any) {
      console.error('Error creating preorder:', error);
      throw new Error(
        error?.response?.data?.message || 'Failed to create preorder'
      );
    }
  }

  /**
   * Get all preorders for a user
   */
  async getUserPreorders(userId: string): Promise<Preorder[]> {
    try {
      const response = await this.makeRequest<Preorder[]>(
        `/preorders/user/${userId}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching user preorders:', error);
      return [];
    }
  }

  /**
   * Get all preorders for a book
   */
  async getBookPreorders(bookId: string): Promise<Preorder[]> {
    try {
      const response = await this.makeRequest<Preorder[]>(
        `/preorders/book/${bookId}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching book preorders:', error);
      return [];
    }
  }

  /**
   * Get a single preorder by ID
   */
  async getPreorderById(id: string): Promise<Preorder | null> {
    try {
      const response = await this.makeRequest<Preorder>(`/preorders/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching preorder:', error);
      return null;
    }
  }

  /**
   * Update preorder status
   */
  async updatePreorderStatus(
    id: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'fulfilled'
  ): Promise<Preorder> {
    try {
      const response = await this.makeRequest<PreorderResponse>(
        `/preorders/${id}/status`,
        {
          method: 'PUT',
          body: { status },
        }
      );
      return response.preorder;
    } catch (error: any) {
      console.error('Error updating preorder status:', error);
      throw new Error(
        error?.response?.data?.message || 'Failed to update preorder status'
      );
    }
  }

  /**
   * Delete/Cancel a preorder
   */
  async deletePreorder(id: string, userId?: string): Promise<boolean> {
    try {
      await this.makeRequest<{ message: string }>(`/preorders/${id}`, {
        method: 'DELETE',
        body: userId ? { userId } : {},
      });
      return true;
    } catch (error) {
      console.error('Error deleting preorder:', error);
      return false;
    }
  }
}

export const preorderApi = new PreorderApiService();

