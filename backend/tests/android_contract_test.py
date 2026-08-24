#!/usr/bin/env python3
"""
Live API contract test for the ReloCompass Android app.

Verifies every endpoint + exact path shape the Kotlin Retrofit interfaces call
(ReloApi.kt, ChatApi.kt) against a running backend. The FastAPI app mounts a
static frontend at "/", so route matching is EXACT: collection routes declared
with "/" in the backend router must be called WITH the trailing slash.

Usage:
    python tests/android_contract_test.py [base_url]
    python tests/android_contract_test.py https://relocompass-tpfpaa.drytis.dev

Exits non-zero on any failure. Read-only against existing data; creates and
deletes its own QA job.
"""
import json
import sys
import urllib.request
import urllib.error
import uuid

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://relocompass-tpfpaa.drytis.dev").rstrip("/")

passed, failed = 0, 0


def call(method: str, path: str, token: str | None = None, body: dict | None = None):
    req = urllib.request.Request(BASE + path, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    data = json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(req, data=data) as resp:
            return resp.status, json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "{}")


def check(name: str, method: str, path: str, expected: int, token: str | None = None, body: dict | None = None):
    global passed, failed
    code, payload = call(method, path, token, body)
    if code == expected:
        passed += 1
        print(f"PASS {method} {path} -> {code}")
        return payload
    failed += 1
    print(f"FAIL {method} {path} -> {code} (want {expected}): {json.dumps(payload)[:120]}")
    return payload


def main() -> int:
    stamp = uuid.uuid4().hex[:8]
    # NOTE: use a registrable domain — email-validator rejects reserved TLDs
    # like .test/.example, so the backend 422s them.
    employer = {"email": f"employer_{stamp}@qacontract.dev", "password": "TestPass123!", "name": "Contract Employer", "role": "employer"}
    student = {"email": f"student_{stamp}@qacontract.dev", "password": "TestPass123!", "name": "Contract Student", "role": "student"}

    # Auth (ReloApi: register/login/me/logout)
    r = check("register employer", "POST", "/api/auth/register", 201, body=employer)
    etok = r.get("access_token")
    assert etok and r["user"]["role"] == "employer", "register response shape wrong"
    r = check("register student", "POST", "/api/auth/register", 201, body=student)
    stok = r.get("access_token")
    check("me", "GET", "/api/auth/me", 200, etok)
    check("users/me PUT", "PUT", "/api/users/me", 200, etok, {"city": "Toronto", "bio": "contract test"})

    # Jobs (ReloApi — note trailing slashes on collection routes)
    check("jobs list + filters", "GET", "/api/jobs/?q=a&location=&visa_only=false&limit=50&skip=0", 200)
    check("jobs visa_only", "GET", "/api/jobs/?visa_only=true", 200)
    check("jobs mine", "GET", "/api/jobs/mine", 200, etok)
    r = check("create job", "POST", "/api/jobs/", 201, etok, {
        "title": f"Contract QA {stamp}", "company": "Contract Inc", "location": "Remote",
        "job_type": "contract", "visa_sponsorship": True, "experience_years": "0-1",
        "description": "contract test job"})
    jid = r["id"]
    r = check("apply", "POST", f"/api/jobs/{jid}/apply", 201, stok, {"cover_letter": "contract apply"})
    aid = r["id"]
    check("apply duplicate 409", "POST", f"/api/jobs/{jid}/apply", 409, stok, {"cover_letter": None})
    check("employer apply 403", "POST", f"/api/jobs/{jid}/apply", 403, etok, {"cover_letter": None})
    check("applications me", "GET", "/api/jobs/applications/me", 200, stok)
    r = check("job applicants", "GET", f"/api/jobs/{jid}/applications", 200, etok)
    assert r and r[0]["applicant"]["email"] == student["email"], "applicant shape wrong"
    check("status update", "PATCH", f"/api/jobs/applications/{aid}", 200, etok, {"status": "shortlisted"})
    check("status invalid 422", "PATCH", f"/api/jobs/applications/{aid}", 422, etok, {"status": "nope"})
    check("delete job", "DELETE", f"/api/jobs/{jid}", 200, etok)

    # Chat (ChatApi)
    r = check("chat", "POST", "/api/chat/", 200, stok, {"message": "Reply with the single word OK", "session_id": None, "user_context": None})
    sid = r.get("session_id")
    assert sid and "reply" in r and isinstance(r.get("sources"), list), "chat response shape wrong"
    check("chat history", "GET", f"/api/chat/history/{sid}", 200, stok)
    check("chat clear", "DELETE", f"/api/chat/history/{sid}", 200, stok)

    # Error envelope shapes the Kotlin Errors.parse() expects
    code, payload = call("POST", "/api/auth/register", None, {"name": "A", "email": "bad", "password": "123", "role": "student"})
    assert code == 422 and isinstance(payload["detail"], list) and payload["detail"][0]["loc"][-1] == "name", "422 envelope shape wrong"
    print("PASS 422 envelope shape (list with loc/msg)")
    global passed
    passed += 1

    check("logout", "POST", "/api/auth/logout", 200, stok)
    print(f"\n{passed} passed, {failed} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
