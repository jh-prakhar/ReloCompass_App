"""Email service — SMTP when configured, dev outbox otherwise.

Every email first becomes an `email_outbox` row (audit + dev inspection), then
is delivered via SMTP if settings.SMTP_HOST is set. In development (no SMTP),
the row stays `dev_logged` and the body is printed to the server log so the
flow is fully testable without an external mail server.
"""

from __future__ import annotations

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from html import escape as _html_escape

from sqlalchemy.orm import Session

from app.config import settings
from app.models import EmailOutbox

logger = logging.getLogger("relocompass.email")

RESET_EMAIL_SUBJECT = "ReloCompass — reset your password"
STATUS_EMAIL_SUBJECT = "ReloCompass — update on your application"


def _frontend_url() -> str:
    url = (settings.FRONTEND_URL or "").rstrip("/")
    if not url:
        # No public URL configured — link text degrades to a path the user
        # can't click; the email body explains how to proceed.
        logger.warning("FRONTEND_URL is not set — reset links will be path-only")
        return ""
    return url


def send_email(
    db: Session,
    *,
    to_email: str,
    subject: str,
    body_text: str,
    body_html: str | None = None,
    kind: str = "generic",
) -> EmailOutbox:
    """Record + attempt delivery. Never raises — email failures are logged, not fatal."""
    row = EmailOutbox(
        to_email=to_email,
        subject=subject,
        body_text=body_text,
        body_html=body_html,
        kind=kind,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    if not settings.SMTP_HOST:
        row.status = "dev_logged"
        db.commit()
        logger.info(
            "DEV EMAIL → %s | %s\n%s\n---",
            to_email,
            subject,
            body_text,
        )
        return row

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM or settings.SMTP_USER or "noreply@relocompass.org"
        msg["To"] = to_email
        msg.attach(MIMEText(body_text, "plain", "utf-8"))
        if body_html:
            msg.attach(MIMEText(body_html, "html", "utf-8"))

        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
        try:
            if settings.SMTP_PORT != 465:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(msg["From"], [to_email], msg.as_string())
        finally:
            server.quit()

        row.status = "sent"
        db.commit()
        logger.info("Email sent to %s (%s)", to_email, kind)
    except Exception as e:  # noqa: BLE001 — delivery failures must not break flows
        row.status = "failed"
        row.error = str(e)[:2000]
        db.commit()
        logger.error("Email delivery failed for %s: %s", to_email, e)
    return row


def send_password_reset_email(db: Session, *, to_email: str, reset_token: str, user_name: str) -> EmailOutbox:
    safe_name = _html_escape(user_name, quote=True)
    base = _frontend_url()
    if base:
        url = f"{base}/reset-password.html?token={reset_token}"
    else:
        url = None
    link_note = (
        f"Open this link to choose a new password (valid for 30 minutes, single use):\n{url}"
        if url
        else (
            "To choose a new password, open the ReloCompass login page, choose "
            '"Forgot password?", and use this one-time reset token '
            f"(valid for 30 minutes):\n{reset_token}"
        )
    )
    text = (
        f"Hi {user_name},\n\n"
        "We received a request to reset your ReloCompass password.\n\n"
        f"{link_note}\n\n"
        "If you didn't request this, you can safely ignore this email — "
        "your password stays unchanged.\n\n"
        "— The ReloCompass team"
    )
    if url:
        button_or_token = (
            f'<a href="{url}" style="background:#3B82F6;color:#fff;padding:12px 24px;border-radius:8px;'
            'text-decoration:none;font-weight:600;display:inline-block">Choose a new password</a>'
        )
    else:
        button_or_token = (
            '<span style="font-family:monospace;background:#F1F5F9;padding:10px 14px;border-radius:8px;'
            f'display:inline-block;word-break:break-all">{reset_token}</span>'
        )
    html = f"""\
<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0F172A">
  <h2 style="color:#0F172A">Password reset</h2>
  <p>Hi {safe_name},</p>
  <p>We received a request to reset your ReloCompass password.</p>
  <p style="margin:28px 0">
    {button_or_token}
  </p>
  <p style="color:#475569;font-size:13px">This link is valid for 30 minutes and can be used once.</p>
  <p style="color:#475569;font-size:13px">If you didn't request this, ignore this email — your password stays unchanged.</p>
  <p style="color:#94A3B8;font-size:12px;margin-top:32px">— The ReloCompass team</p>
</div>"""
    return send_email(
        db,
        to_email=to_email,
        subject=RESET_EMAIL_SUBJECT,
        body_text=text,
        body_html=html,
        kind="password_reset",
    )


def send_application_status_email(
    db: Session,
    *,
    to_email: str,
    user_name: str,
    job_title: str,
    company: str,
    new_status: str,
) -> EmailOutbox:
    safe_name = _html_escape(user_name, quote=True)
    safe_title = _html_escape(job_title, quote=True)
    safe_company = _html_escape(company, quote=True)
    safe_status = _html_escape(new_status, quote=True)
    base = _frontend_url()
    url = f"{base}/jobs.html#my-applications-section" if base else "(log in to ReloCompass and open Jobs → My Applications)"
    text = (
        f"Hi {user_name},\n\n"
        f"Your application for \"{job_title}\" at {company} is now marked: {new_status.upper()}.\n\n"
        f"View details: {url}\n\n— The ReloCompass team"
    )
    html = f"""\
<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0F172A">
  <h2 style="color:#0F172A">Application update</h2>
  <p>Hi {safe_name},</p>
  <p>Your application for <strong>{safe_title}</strong> at {safe_company} is now marked:</p>
  <p><span style="display:inline-block;padding:4px 12px;border-radius:999px;background:#DBEAFE;
     color:#1E3A8A;font-weight:600;text-transform:uppercase">{safe_status}</span></p>
  <p style="margin:28px 0">
    <a href="{url}" style="background:#3B82F6;color:#fff;padding:12px 24px;border-radius:8px;
       text-decoration:none;font-weight:600;display:inline-block">View your applications</a>
  </p>
  <p style="color:#94A3B8;font-size:12px;margin-top:32px">— The ReloCompass team</p>
</div>"""
    return send_email(
        db,
        to_email=to_email,
        subject=f"{STATUS_EMAIL_SUBJECT} — {job_title}",
        body_text=text,
        body_html=html,
        kind="application_update",
    )
