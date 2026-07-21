import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


def send_otp_email(to_email: str, otp_code: str, user_name: str) -> bool:
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user)

    subject = "Kode OTP Reset Password Rumah Jahit Yan"
    body_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Halo {user_name},</h2>
        <p>Kami menerima permintaan reset password untuk akun Anda.</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 6px; background: #f3f4f6; padding: 12px; text-align: center; border-radius: 8px;">
            {otp_code}
        </p>
        <p>Kode OTP ini berlaku selama <strong>5 menit</strong>.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <hr>
        <small>Rumah Jahit Yan — Sistem Manajemen Produksi</small>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email
    msg.attach(MIMEText(body_html, "html"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        return True
    except Exception as e:
        logger.error("Gagal mengirim ke %s: %s", to_email, e)
        return False
