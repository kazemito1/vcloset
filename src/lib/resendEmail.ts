// Envio de e-mail transacional via Resend (https://resend.com).
// Variáveis de ambiente esperadas:
//   RESEND_API_KEY — chave da API (obrigatória para enviar)
//   EMAIL_FROM     — remetente verificado (ex.: "V.CLOSET <no-reply@vcllosetstore.com.br>")

interface SendResult {
  sent: boolean;
  reason?: string;
}

const FROM = process.env.EMAIL_FROM || "V.CLOSET <no-reply@vcllosetstore.com.br>";

export async function sendConfirmationEmail(
  to: string,
  fullName: string
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY não configurada — e-mail de confirmação não enviado."
    );
    return { sent: false, reason: "not-configured" };
  }

  const firstName = fullName.trim().split(/\s+/)[0] || fullName;

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background-color:#141414;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="height:3px;background:linear-gradient(to right,transparent,#d4af37,transparent);font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td align="center" style="padding:40px 32px 8px;">
                <p style="margin:0;font-size:10px;letter-spacing:6px;text-transform:uppercase;color:#a3a3a3;">Checkout</p>
                <p style="margin:10px 0 0;font-size:30px;letter-spacing:5px;color:#f5f5f5;font-family:Georgia,serif;">
                  <span style="color:#d4af37;">V</span>CLOSET
                </p>
                <p style="margin:6px 0 0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#d4af37;opacity:0.75;">Joias e Acessórios</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="height:1px;width:60px;background-color:#2a2a2a;"></td>
                    <td style="width:12px;"></td>
                    <td style="width:6px;height:6px;transform:rotate(45deg);border:1px solid #d4af37;font-size:0;line-height:0;">&nbsp;</td>
                    <td style="width:12px;"></td>
                    <td style="height:1px;width:60px;background-color:#2a2a2a;"></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 40px;">
                <h1 style="margin:0 0 16px;font-size:20px;color:#f5f5f5;font-family:Georgia,serif;font-weight:normal;">
                  Olá, ${firstName}!
                </h1>
                <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#c8c8c8;font-family:Arial,Helvetica,sans-serif;">
                  Obrigado por comprar no nosso site. Estamos processando o seu
                  pagamento junto à operadora do cartão.
                </p>
                <p style="margin:0 0 28px;font-size:14px;line-height:1.7;color:#c8c8c8;font-family:Arial,Helvetica,sans-serif;">
                  Você receberá um e-mail quando o seu pagamento for confirmado.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1c1c1c;border:1px solid #2a2a2a;border-radius:8px;">
                  <tr>
                    <td style="padding:14px 18px;">
                      <p style="margin:0;font-size:11px;line-height:1.6;color:#a3a3a3;font-family:Arial,Helvetica,sans-serif;">
                        Este é um e-mail automático — não é necessário responder.
                        Se você não reconhece esta compra, ignore esta mensagem.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px;border-top:1px solid #2a2a2a;">
                <p style="margin:0;text-align:center;font-size:11px;color:#a3a3a3;font-family:Arial,Helvetica,sans-serif;">
                  Todos os direitos reservados VCLOSET STORE LTDA
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to,
        subject: "Recebemos o seu pedido — V.CLOSET",
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Resend retornou erro:", res.status, body);
      return { sent: false, reason: `resend-error-${res.status}` };
    }

    return { sent: true };
  } catch (err) {
    console.error("[email] falha ao enviar:", err);
    return { sent: false, reason: "network-error" };
  }
}
