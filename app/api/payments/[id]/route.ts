import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import { getSessionFromRequest } from "@/lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

interface Player {
  name: string;
  email: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!["pending", "confirmed", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({ status })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const players: Player[] = Array.isArray(payment.players) && payment.players.length > 0
    ? payment.players
    : [{ name: "", email: payment.email }];

  const payLink = `${req.nextUrl.origin}/pay`;

  if (status === "confirmed") {
    for (const player of players) {
      try {
        await resend.emails.send({
          from: "Mainstream Basketball Club <hello@mainstreambasketball.com>",
          to: player.email,
          subject: "Registration complete — Mainstream Basketball Club",
          text: `Hi ${player.name || ""},\n\nYour payment has been confirmed and your registration is now complete. We'll be in touch with next steps. \n\n*Do not reply this mail.* If you have any enquires reach out to us on info@mainstreambasketball.com. \n\nWelcome to Mainstream Championship 2026.`,
        });
      } catch (err) {
        console.error("Resend error for", player.email, err);
      }
    }
  }

  if (status === "rejected") {
    // Notify the contact email (whoever submitted) with a link to resubmit —
    // usually a rejected receipt was unclear, wrong, or unmatched, so they
    // need to try again rather than being left with no explanation.
    try {
      await resend.emails.send({
        from: "Mainstream Basketball Club <hello@mainstreambasketball.com>",
        to: payment.email,
        subject: "Payment could not be confirmed — please resubmit",
        text: `Hi,\n\nWe couldn't confirm the payment receipt you submitted. This can happen if the receipt was unclear, incomplete, or we couldn't match it to the right name.\n\nPlease resubmit your payment here:\n${payLink}\n\nMake sure the transaction remarks include the player's name (or all names, if paying for more than one), and that the receipt image is clear.\n\nIf you believe this was a mistake, *Do not reply this mail.* Send an email to info@mainstreambasketball.com to let us know.`,
      });
    } catch (err) {
      console.error("Resend error:", err);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}