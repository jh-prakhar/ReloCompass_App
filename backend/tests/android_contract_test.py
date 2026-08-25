#!/usr/bin/env python3
"""
Live API contract test for the ReloCompass Android app.

Verifies every endpoint + exact path shape the Kotlin Retrofit interfaces call
(ReloApi.kt, ChatApi.kt) against a running backend. The FastAPI app mounts a
static frontend at "/", so route matching is EXACT: collection routes declared
with "/" in the backend router must be called WITH the trailing slash.

Usage:
    python tests/android_contract_test.py [base_url]
    python tests/android_contract_test.py https://<your-deployment-host>

Exits non-zero on any failure. Read-only against existing data; creates and
deletes its own QA job.
"""
import json
import os
import sys
import urllib.parse
import urllib.request
import urllib.error
import uuid

# Target API base: arg 1, else the RELO_API_BASE env var, else localhost.
# (Run against the live deployment with: python3 tests/android_contract_test.py https://<host>)
BASE = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get("RELO_API_BASE", "http://localhost:8000")).rstrip("/")

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

    # ── Phase 4 endpoints (Android v2) ─────────────────────────────────────────
    # Job matching (ReloApi.jobMatches)
    r = check("jobs match", "GET", "/api/jobs/match?limit=6", 200, stok)
    assert isinstance(r.get("matches"), list) and isinstance(r.get("total_scored"), int), "match response shape wrong"
    if r["matches"]:
        m = r["matches"][0]
        assert {"job", "score", "reasons", "skills_matched"} <= set(m.keys()), "match item shape wrong"
        assert {"id", "title", "company", "location", "job_type", "visa_sponsorship"} <= set(m["job"].keys()), "match.job shape wrong"

    # Visa catalogue + checklist (ReloApi.visaDestinations / visaChecklist)
    r = check("visa destinations", "GET", "/api/visa/destinations", 200)
    dests = r.get("destinations", [])
    assert dests and {"id", "label", "visa_types", "official_sources"} <= set(dests[0].keys()), "destination shape wrong"
    r = check("visa checklist", "GET", "/api/visa/checklist?destination=canada&visa_type=study_permit", 200)
    assert {"checklist", "total_items", "official_sources"} <= set(r.keys()), "checklist shape wrong"
    phase0 = r["checklist"][0]
    assert {"phase", "label", "items"} <= set(phase0.keys()), "checklist phase shape wrong"
    assert {"id", "label", "phase", "note"} <= set(phase0["items"][0].keys()), "checklist item shape wrong"
    check("visa checklist unknown dest", "GET", "/api/visa/checklist?destination=narnia&visa_type=study_permit", 404)
    check("visa checklist unknown situation", "GET", "/api/visa/checklist?destination=canada&visa_type=study_permit&situation=nonsense", 404)

    # Community (ReloApi.communityRooms / communityHistory; WsEvent shapes)
    r = check("community rooms", "GET", "/api/community/rooms", 200)
    rooms = r.get("rooms", [])
    assert rooms and {"id", "name"} <= set(rooms[0].keys()), "room shape wrong"
    r = check("community history", "GET", f"/api/community/history/{rooms[0]['id']}", 200, stok)
    assert "messages" in r, "history shape wrong"
    check("community history unknown room", "GET", "/api/community/history/nonsense", 404, stok)

    # Housing (ReloApi.housingProviders / housingAvailability)
    r = check("housing providers", "GET", "/api/housing/providers", 200)
    providers = r.get("providers", [])
    assert providers and {"id", "label", "universities"} <= set(providers[0].keys()), "provider shape wrong"
    uni = providers[0]["universities"][0]
    r = check("housing availability", "GET", f"/api/housing/availability?university={urllib.parse.quote(uni)}", 200)
    assert {"university", "provider", "options", "count"} <= set(r.keys()), "availability shape wrong"
    if r["options"]:
        assert {"kind", "title", "monthly_cost", "currency"} <= set(r["options"][0].keys()), "option shape wrong"

    # Password reset request (ReloApi.requestPasswordReset) — always 200, no enumeration
    check("password reset request", "POST", "/api/auth/password-reset", 200, None, {"email": f"nobody_{stamp}@qacontract.dev"})

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
