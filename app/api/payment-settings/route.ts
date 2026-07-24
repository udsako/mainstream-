import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET() {
  const { data, error } = await supabase
    .from("payment_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    data || { account_name: "", account_number: "", bank_name: "", amount_note: "" }
  );
}

export async function PATCH(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { accountName, accountNumber, bankName, amountNote } = await req.json();

  const { error } = await supabase
    .from("payment_settings")
    .update({
      account_name: accountName ?? "",
      account_number: accountNumber ?? "",
      bank_name: bankName ?? "",
      amount_note: amountNote ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}