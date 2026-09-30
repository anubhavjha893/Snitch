import nodemailer from "nodemailer";
import { config } from "../config/config.js";

let transporter = null

const getTransporter = () => {
    if (!config.SMTP_HOST) return null

    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: config.SMTP_HOST,
            port: config.SMTP_PORT,
            secure: config.SMTP_PORT === 465,
            auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASS } : undefined
        })
    }

    return transporter
}

const layout = (title, body) => `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#171717">
  <h1 style="font-size:28px;letter-spacing:2px;margin:0 0 24px">SNITCH.</h1>
  <h2 style="font-size:18px;margin:0 0 12px">${title}</h2>
  ${body}
  <p style="color:#888;font-size:12px;margin-top:32px">Wear your own rules.</p>
</div>`

/**
 * Sends an email. Never throws — a mail failure must not break the request that triggered it.
 * Without SMTP settings the message is logged, which keeps local development easy.
 */
export async function sendMail({ to, subject, html, text }) {
    const transport = getTransporter()

    if (!transport) {
        console.log(`[mail:dev] To: ${to}\nSubject: ${subject}\n${text || ""}\n`)
        return false
    }

    try {
        await transport.sendMail({ from: config.MAIL_FROM, to, subject, html, text })
        return true
    } catch (error) {
        console.error("Failed to send email:", error.message)
        return false
    }
}

export const sendPasswordResetEmail = (user, resetUrl) => sendMail({
    to: user.email,
    subject: "Reset your SNITCH. password",
    text: `Hi ${user.fullname}, reset your password using this link (valid for 30 minutes): ${resetUrl}`,
    html: layout("Reset your password", `
      <p>Hi ${user.fullname}, we received a request to reset your password.</p>
      <p><a href="${resetUrl}" style="display:inline-block;background:#171717;color:#fff;padding:12px 20px;text-decoration:none">Reset password</a></p>
      <p style="color:#666;font-size:13px">This link is valid for 30 minutes. If you didn't ask for this, you can ignore this email.</p>`)
})

export const sendOrderConfirmationEmail = (user, payment) => {
    const rows = payment.orderItems.map(item =>
        `<tr><td style="padding:6px 0">${item.title} × ${item.quantity}</td><td style="text-align:right">₹${(item.price.amount * item.quantity).toLocaleString("en-IN")}</td></tr>`
    ).join("")

    const address = payment.shippingAddress || {}

    return sendMail({
        to: user.email,
        subject: `Order confirmed — #${payment.razorpay.orderId.slice(-8).toUpperCase()}`,
        text: `Thanks ${user.fullname}! Your SNITCH. order is confirmed. Total: ₹${payment.price.amount}.`,
        html: layout("Thanks — your order is confirmed", `
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
        <tr><td style="padding-top:12px;border-top:1px solid #ddd"><strong>Total</strong></td><td style="text-align:right;border-top:1px solid #ddd;padding-top:12px"><strong>₹${payment.price.amount.toLocaleString("en-IN")}</strong></td></tr>
      </table>
      <p style="font-size:13px;color:#555">Shipping to: ${address.name}, ${address.line1}, ${address.city}, ${address.state} ${address.pincode}</p>`)
    })
}

export const sendOrderStatusEmail = (user, payment) => sendMail({
    to: user.email,
    subject: `Your SNITCH. order is ${payment.orderStatus.replace("_", " ")}`,
    text: `Your order #${payment.razorpay.orderId.slice(-8).toUpperCase()} is now ${payment.orderStatus.replace("_", " ")}.`,
    html: layout("Order update", `<p>Your order <strong>#${payment.razorpay.orderId.slice(-8).toUpperCase()}</strong> is now <strong>${payment.orderStatus.replace("_", " ")}</strong>.</p>`)
})
