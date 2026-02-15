import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, role, owner_name, business_name, phone, address, gst, assigned_salesman_id } = body;

        if (!email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!['super_admin', 'salesman', 'retailer'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        if (role === 'retailer' && !assigned_salesman_id) {
            return NextResponse.json({ error: 'Retailer must have an assigned salesman' }, { status: 400 });
        }

        // Use email prefix as fallback name for salesman/admin
        const finalOwnerName = owner_name?.trim() || email.split('@')[0];

        const supabase = await createServiceRoleClient();

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // Insert profile row
        const { error: profileError } = await supabase.from('users').insert({
            id: authData.user.id,
            email,
            role,
            owner_name: finalOwnerName,
            business_name: business_name || null,
            phone: phone || null,
            address: address || null,
            gst: gst || null,
            assigned_salesman_id: role === 'retailer' ? assigned_salesman_id : null,
        });

        if (profileError) {
            // Rollback auth user if profile insert fails
            await supabase.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json({ error: profileError.message }, { status: 400 });
        }

        return NextResponse.json({ user: authData.user }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
