import { NextResponse } from 'next/server';

import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';

export async function POST() {
  try {
    // Usar el cliente de Supabase que maneja cookies
    const supabase = getSupabaseRouteHandlerClient();

    // Cerrar sesión, esto limpiará automáticamente las cookies de autenticación
    await supabase.auth.signOut();

    return NextResponse.json({ message: 'Cookies cleared successfully' });
  } catch (error) {
    console.error('Error clearing cookies:', error);
    return NextResponse.json(
      { error: 'Failed to clear cookies' },
      { status: 500 },
    );
  }
}
