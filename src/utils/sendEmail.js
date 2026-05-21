import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send order confirmation email
 */
export const sendOrderConfirmation = async (order) => {
    const itemsList = order.items
        .map(
            (item) =>
                `• ${item.name} (${item.size}) × ${item.quantity} — ₹${item.price * item.quantity}`
        )
        .join("\n");

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: order.shipping.email,
        subject: `🎉 Order Confirmed — ${order.orderNumber} | Printala`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #E10F80, #5FAAC6); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">PRINTALA</h1>
          <p style="color: rgba(255,255,255,0.8); margin-top: 8px;">Order Confirmed! 🎉</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;">
          <h2 style="color: #2F3542;">Hey ${order.shipping.fullName}! 👋</h2>
          <p style="color: #5A6275;">
            Tumhara order place ho gaya hai! Hum jaldi se jaldi ship karenge. 🚀
          </p>

          <div style="background: #F2F2F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #2F3542;">
              Order Number: ${order.orderNumber}
            </p>
            <p style="margin: 5px 0 0; color: #5A6275;">
              Payment: ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}
            </p>
          </div>

          <h3 style="color: #2F3542;">Items Ordered:</h3>
          <pre style="background: #F2F2F2; padding: 15px; border-radius: 8px; font-size: 14px; color: #2F3542;">${itemsList}</pre>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #5A6275; margin: 4px 0;">Subtotal: ₹${order.subtotal}</p>
            <p style="color: #5A6275; margin: 4px 0;">Shipping: ${order.shippingCost === 0 ? "FREE 🎉" : `₹${order.shippingCost}`}</p>
            <p style="font-size: 20px; font-weight: bold; color: #E10F80; margin: 8px 0;">
              Total: ₹${order.total}
            </p>
          </div>

          <h3 style="color: #2F3542;">Shipping Address:</h3>
          <p style="color: #5A6275;">
            ${order.shipping.fullName}<br>
            ${order.shipping.address}<br>
            ${order.shipping.city}, ${order.shipping.state} — ${order.shipping.pincode}<br>
            📞 ${order.shipping.phone}
          </p>
        </div>

        <div style="background: #2F3542; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 13px;">
            Questions? Reply to this email or WhatsApp us at +91 98765 43210
          </p>
          <p style="color: rgba(255,255,255,0.4); margin: 8px 0 0; font-size: 11px;">
            © ${new Date().getFullYear()} Printala. Made with ❤️ in India.
          </p>
        </div>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Order confirmation sent to ${order.shipping.email}`);
    } catch (error) {
        console.error("📧 Email failed:", error.message);
        // Don't throw — order should still succeed even if email fails
    }
};

/**
 * Send contact form notification to admin
 */
export const sendContactNotification = async (contact) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_USER, // Send to yourself
        subject: `📩 New Contact: ${contact.subject} — Printala`,
        html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Subject:</strong> ${contact.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${contact.message}</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("📧 Contact notification email failed:", error.message);
    }
};