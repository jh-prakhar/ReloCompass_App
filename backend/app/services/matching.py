"""Job matching service — skills + location + preferences scoring.

Signals (weights):
  - skills overlap between the job text and the user's skills/profile text (40%)
  - location match: user's target city/country vs job location (25%)
  - preferences: visa sponsorship requirement (20%)
  - recency: newer jobs score higher (15%)

Returns 0–100 match scores with per-signal breakdowns for explainability.
"""
from __future__ import annotations

import math
import re
from datetime import datetime, timezone

# ── Skill dictionary: canonical skill → regex variants ──────────────────────
SKILL_PATTERNS = {
    "react": r"\breact(?:\.?js| native)?\b",
    "vue": r"\bvue(?:\.?js)?\b",
    "angular": r"\bangular(?:\.?js)?\b",
    "node": r"\bnode(?:\.?js)?\b",
    "python": r"\bpython\b",
    "django": r"\bdjango\b",
    "flask": r"\bflask\b",
    "fastapi": r"\bfastapi\b",
    "java": r"\bjava\b(?!script)",
    "javascript": r"\bjavascript\b|\bjs\b",
    "typescript": r"\btypescript\b|\bts\b",
    "php": r"\bphp\b",
    "laravel": r"\blaravel\b",
    "sql": r"\bsql\b|\bmysql\b|\bpostgres(?:ql)?\b",
    "nosql": r"\bmongodb\b|\bdynamodb\b|\bcassandra\b|\bredis\b",
    "aws": r"\baws\b|\bamazon web services\b",
    "gcp": r"\bgcp\b|\bgoogle cloud\b",
    "docker": r"\bdocker\b",
    "kubernetes": r"\bkubernetes\b|\bk8s\b",
    "git": r"\bgit\b|\bgithub\b",
    "rest": r"\brest(?:ful)?\s*api\b|\bapi development\b",
    "graphql": r"\bgraphql\b",
    "ml": r"\bmachine learning\b|\bml\b|\bdeep learning\b|\btensorflow\b|\bpytorch\b",
    "data analysis": r"\bdata analysis\b|\banalytics\b|\bpandas\b|\bnumpy\b|\bexcel\b",
    "marketing": r"\bmarketing\b|\bseo\b|\bsocial media\b|\bdigital marketing\b",
    "sales": r"\bsales\b|\bbusiness development\b",
    "customer service": r"\bcustomer service\b|\bcustomer support\b|\bclient service\b",
    "cooking": r"\bcook(?:ing)?\b|\bchef\b|\bkitchen\b|\bcuisine\b",
    "hospitality": r"\bhospitality\b|\bhotel\b|\brestaurant\b|\bcatering\b",
    "driving": r"\bdriver\b|\bdriving\b|\bdelivery driver\b",
    "warehouse": r"\bwarehouse\b|\blogistics\b|\bfulfil?lment\b|\bstocker\b",
    "retail": r"\bretail\b|\bcashier\b|\bstore associate\b|\bshop assistant\b",
    "nursing": r"\bnurse\b|\bnursing\b|\bhealthcare assistant\b|\bcaregiver\b",
    "teaching": r"\bteach(?:er|ing)?\b|\btutor\b|\binstructor\b",
    "accounting": r"\baccount(?:ant|ing)?\b|\bbookkeeping\b|\bquickbooks\b",
    "design": r"\bgraphic design\b|\bui\b|\bux\b|\bfigma\b|\bweb design\b",
    "communication": r"\bcommunication\b|\binterpersonal\b",
    "english": r"\benglish (?:proficiency|skills|language)\b|\bfluent english\b",
    "hindi": r"\bhindi\b",
    "nepali": r"\bnepali\b",
}

STOP_CITIES = {
    "remote", "anywhere", "hybrid", "various", "multiple", "worldwide",
}


def _extract_skills(text: str) -> set[str]:
    """Extract canonical skills mentioned in arbitrary text."""
    if not text:
        return set()
    lower = text.lower()
    found = set()
    for skill, pattern in SKILL_PATTERNS.items():
        try:
            if re.search(pattern, lower):
                found.add(skill)
        except re.error:
            continue
    return found


def _normalize_location(loc: str) -> str:
    return re.sub(r"\s+", " ", (loc or "").strip().lower())


def _location_score(job_location: str, user_city: str, user_country: str) -> tuple[int, str]:
    """0–100 location compatibility + a short reason."""
    jl = _normalize_location(job_location)
    if not jl or jl in STOP_CITIES:
        return 70, "Location open / remote-friendly"
    uc = _normalize_location(user_city)
    ucountry = _normalize_location(user_country)
    if not uc and not ucountry:
        return 50, "No location preference on file"
    if uc and (uc in jl or jl.startswith(uc)):
        return 100, f"Matches your city ({user_city})"
    # City in job location but different country check
    if ucountry and ucountry in jl:
        return 90, f"Same country as your preference ({user_country})"
    # Different city/country entirely
    if uc:
        return 30, "Different city than your preference"
    return 40, "Different region than your preference"


def _recency_score(created_at: datetime | None) -> int:
    """100 = brand new, decays to ~10 after 60 days."""
    if created_at is None:
        return 30
    now = datetime.now(timezone.utc)
    created = created_at if created_at.tzinfo else created_at.replace(tzinfo=timezone.utc)
    days = max((now - created).days, 0)
    return max(10, int(100 * math.exp(-days / 20)))


WEIGHTS = {"skills": 0.40, "location": 0.25, "visa": 0.20, "recency": 0.15}


def score_job(
    job,
    *,
    user_skills_text: str,
    user_city: str | None,
    user_country: str | None,
    needs_visa: bool,
) -> dict:
    """Score one job for one user. Returns {score, reasons, skills_matched}."""
    job_text = " ".join(
        filter(None, [job.title, job.description, getattr(job, "requirements", None) or ""])
    )
    job_skills = _extract_skills(job_text)
    user_skills = _extract_skills(user_skills_text or "")
    overlap = job_skills & user_skills

    if job_skills:
        skill_score = min(100, int(60 + 40 * len(overlap) / max(len(job_skills), 1)))
        # No overlap → base 40 (skills are 40% weight so this matters)
        if not overlap:
            skill_score = 35
    else:
        # Job without recognizable skills: neutral
        skill_score = 55

    loc_score, loc_reason = _location_score(job.location, user_city, user_country)

    if needs_visa:
        visa_score = 100 if job.visa_sponsorship else 25
        visa_reason = (
            "Offers visa sponsorship" if job.visa_sponsorship else "No visa sponsorship listed"
        )
    else:
        visa_score = 70 if job.visa_sponsorship else 60
        visa_reason = "Visa not a factor for you"

    rec_score = _recency_score(job.created_at)

    total = (
        skill_score * WEIGHTS["skills"]
        + loc_score * WEIGHTS["location"]
        + visa_score * WEIGHTS["visa"]
        + rec_score * WEIGHTS["recency"]
    )

    reasons = []
    if overlap:
        reasons.append("Matches your skills: " + ", ".join(sorted(overlap)[:5]))
    else:
        reasons.append("No direct skill overlap detected")
    reasons.append(loc_reason)
    reasons.append(visa_reason)

    return {
        "score": int(round(total)),
        "reasons": reasons,
        "skills_matched": sorted(overlap),
    }
