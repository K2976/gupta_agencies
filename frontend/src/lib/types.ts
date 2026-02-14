export type UserRole = 'super_admin' | 'salesman' | 'retailer';

export interface UserProfile {
    id: string;
    email: string;
    role: UserRole;
    business_name: string | null;
    owner_name: string;
    phone: string | null;
    address: string | null;
    gst: string | null;
    assigned_salesman_id: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Brand {
    id: string;
    name: string;
    logo_url: string | null;
    pdf_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Product = grouping level (e.g., "Standard Epoxy Adhesive")
export interface Product {
    id: string;
    brand_id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Joined fields
    brand?: Brand;
    skus?: SKU[];
    sku_count?: number;
    min_price?: number;
    max_price?: number;
}

// SKU = variant level (e.g., "5g", "1.08kg")
export interface SKU {
    id: string;
    product_id: string;
    sku_code: string;
    variant_label: string;
    case_size: string | null;
    mrp: number;
    dealer_price: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Joined fields
    product?: Product;
}

export interface SKUWithDetails extends SKU {
    product_name?: string;
    brand_id?: string;
    brand_name?: string;
}

export interface Order {
    id: string;
    retailer_id: string;
    salesman_id: string | null;
    status: 'pending' | 'accepted' | 'rejected' | 'delivered';
    total_amount: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    retailer?: UserProfile;
    order_items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    sku_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
    sku?: SKU & { product?: { name: string; brand_id: string } };
}

export interface CartItem {
    sku: SKU;
    product_name: string;
    brand_name: string;
    quantity: number;
}

export interface DashboardStats {
    total_orders_today?: number;
    orders_this_month?: number;
    pending_orders?: number;
    total_retailers?: number;
    total_salesmen?: number;
    total_brands?: number;
    total_orders?: number;
    orders_by_status?: Record<string, number>;
    recent_orders?: Array<{
        id: string;
        total_amount: number;
        status: string;
        created_at: string;
        retailer_name?: string;
    }>;
}
