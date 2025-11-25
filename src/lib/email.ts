import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM_EMAIL ?? "Blockera <noreply@mail.blockera.space>";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendCouponEmail(params: { to: string; code: string; expiresAt: Date }): Promise<boolean> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY is not configured, skipping coupon email");
    return false;
  }

  const formattedDate = params.expiresAt.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  });

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f0f1a">
      <h2>�������?��+�? ���� ���?�?�?��?���? Blockera!</h2>
      <p>�"���?��? �?���? ����?�?�?�?���>�?�?�<�� ���?�?�?�?��?�? �?�� �?���?��? <strong>10%</strong> �?�� �>�?�+�<�� �'�?�?���?�<.</p>
      <p style="font-size: 20px; font-weight: bold; letter-spacing: 0.1em;">${params.code}</p>
      <p>���?�?�� �?����?�'�?��?: �?�? ${formattedDate}. �?�?�?�?�?��?�? �?�?�?�?�?�����?�?�<��.</p>
      <p>�?�?���?�>�?���?���'�� ��?�? �? �?���?������?�� �?�?�?���'�� �?�� �?�>��?�?�?�%��� ���?��?�����.</p>
      <p>�?" ��?�?���?�?�� Blockera</p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: resendFrom,
      to: params.to,
      subject: "�'���? ���?�?�?�?��?�? �?�� 10% �? �?���?������?�� Blockera",
      html
    });

    if (result.error) {
      console.error("[email] Resend rejected coupon email", result.error);
      return false;
    }

    console.info("[email] Coupon email queued", {
      to: params.to,
      code: params.code,
      messageId: result.data?.id
    });
    return true;
  } catch (error) {
    console.error("[email] Failed to send coupon email", error);
    return false;
  }
}
