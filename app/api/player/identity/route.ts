import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { updateEcosystemProfile } from "@/lib/platform/ecosystem/account";
import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface PlayerIdentity {
  firstName: string | null;
  lastName: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
}

function mapIdentity(row: Record<string, unknown> | null): PlayerIdentity {
  return {
    firstName: (row?.first_name as string | null) ?? null,
    lastName: (row?.last_name as string | null) ?? null,
    addressLine1: (row?.address_line1 as string | null) ?? null,
    addressLine2: (row?.address_line2 as string | null) ?? null,
    city: (row?.city as string | null) ?? null,
    state: (row?.state as string | null) ?? null,
    postalCode: (row?.postal_code as string | null) ?? null,
  };
}

export async function GET() {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const email = normalizeEmail(user.email);
  const { data, error } = await admin
    .from(TABLES.playerProfiles)
    .select("first_name, last_name, address_line1, address_line2, city, state, postal_code")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: safeApiErrorMessage(error, "save") }, { status: 500 });
  }

  return NextResponse.json(mapIdentity(data as Record<string, unknown> | null));
}

export async function PATCH(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<{
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
  }>;

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();

  if (firstName !== undefined && firstName.length < 2) {
    return NextResponse.json({ error: "First name must be at least 2 characters." }, { status: 400 });
  }
  if (lastName !== undefined && lastName.length < 2) {
    return NextResponse.json({ error: "Last name must be at least 2 characters." }, { status: 400 });
  }

  const patch: Record<string, string | null> = {};
  if (firstName !== undefined) patch.first_name = firstName;
  if (lastName !== undefined) patch.last_name = lastName;
  if (body.addressLine1 !== undefined) patch.address_line1 = body.addressLine1.trim() || null;
  if (body.addressLine2 !== undefined) patch.address_line2 = body.addressLine2.trim() || null;
  if (body.city !== undefined) patch.city = body.city.trim() || null;
  if (body.state !== undefined) patch.state = body.state.trim() || null;
  if (body.postalCode !== undefined) patch.postal_code = body.postalCode.trim() || null;

  if (firstName && lastName) {
    patch.display_name = `${firstName} ${lastName}`.trim();
  }

  const email = normalizeEmail(user.email);
  await updateEcosystemProfile(email, patch);

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from(TABLES.playerProfiles)
    .select("first_name, last_name, address_line1, address_line2, city, state, postal_code")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: safeApiErrorMessage(error, "save") }, { status: 500 });
  }

  return NextResponse.json(mapIdentity(data as Record<string, unknown> | null));
}
