import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM_EMAIL ?? "Blockera <noreply@blockera.space>";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendCouponEmail(params: { to: string; code: string; expiresAt: Date }) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY is not configured, skipping coupon email");
    return;
  }

  const formattedDate = params.expiresAt.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  });

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f0f1a">
      <h2>Спасибо за поддержку Blockera!</h2>
      <p>Дарим вам персональный промокод на скидку <strong>10%</strong> на любые товары.</p>
      <p style="font-size: 20px; font-weight: bold; letter-spacing: 0.1em;">${params.code}</p>
      <p>Срок действия: до ${formattedDate}. Промокод одноразовый.</p>
      <p>Используйте его в магазине доната на следующей покупке.</p>
      <p>— команда Blockera</p>
    </div>
  `;

  await resend.emails.send({
    from: resendFrom,
    to: params.to,
    subject: "Ваш промокод на 10% в магазине Blockera",
    html
  });
}
