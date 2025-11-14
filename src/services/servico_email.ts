import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "notadez.noreply@gmail.com", 
    pass: "tanl qwvs hmtf txwo" 
  }
});

export async function enviarEmail(destinatario: string, assunto: string, mensagem: string) {
  try {
    const info = await transporter.sendMail({
      from: '"Sistema NotaDez" <notadez.noreply@gmail.com>',
      to: destinatario,
      subject: assunto,
      html: mensagem
    });

    console.log("Email enviado! ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return false;
  }
}