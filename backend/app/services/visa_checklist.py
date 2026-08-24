"""Visa & immigration document checklist generator.

Rule-based: destination country × visa type × traveller situation →
an ordered checklist with phases, notes, and official-source reminders.

Deliberately NOT legal advice: every checklist carries a disclaimer and
links to official government sources for verification.
"""
from __future__ import annotations

# ── Base documents almost every application needs ───────────────────────────
BASE_DOCUMENTS = [
    {"id": "passport", "label": "Valid passport", "phase": "prepare", "note": "6+ months validity beyond travel date; 2 blank pages"},
    {"id": "photo", "label": "Passport-size photographs", "phase": "prepare", "note": "Per embassy spec (usually 35×45mm, white background)"},
    {"id": "funds", "label": "Proof of funds / bank statements", "phase": "prepare", "note": "Typically 3–6 months of statements"},
    {"id": "health", "label": "Health/medical exam (if requested)", "phase": "prepare", "note": "Panel-physician only; embassy-approved list"},
]

DESTINATIONS = {
    "canada": {
        "label": "Canada",
        "official_sources": ["https://www.canada.ca/en/immigration-refugees-citizenship.html"],
        "visa_types": {
            "study_permit": {
                "label": "Study permit",
                "documents": [
                    {"id": "loi", "label": "Letter of Acceptance (LOA)", "phase": "prepare", "note": "From a Designated Learning Institution (DLI)"},
                    {"id": "gic", "label": "Guaranteed Investment Certificate (GIC)", "phase": "prepare", "note": "C$10,000+ through a Canadian bank (SDS route)"},
                    {"id": "tuition", "label": "Tuition payment receipt", "phase": "prepare", "note": "First-year fee proof"},
                    {"id": "caq", "label": "CAQ (Québec only)", "phase": "prepare", "note": "Québec Acceptance Certificate if studying in Québec"},
                ],
            },
            "work_permit": {
                "label": "Work permit",
                "documents": [
                    {"id": "lmia", "label": "LMIA-backed job offer / employment contract", "phase": "prepare", "note": "Employer may need LMIA unless exempt"},
                    {"id": "edu_creds", "label": "Education credentials + ECA", "phase": "prepare", "note": "Educational Credential Assessment if requested"},
                ],
            },
            "visitor": {
                "label": "Visitor visa",
                "documents": [
                    {"id": "itinerary", "label": "Travel itinerary", "phase": "prepare", "note": "Flight reservation (don't pay yet)"},
                    {"id": "ties", "label": "Proof of ties to home country", "phase": "prepare", "note": "Employment letter, property, family"},
                ],
            },
        },
    },
    "germany": {
        "label": "Germany",
        "official_sources": ["https://www.auswaertiges-amt.de/en/visa-service", "https://www.make-it-in-germany.com/"],
        "visa_types": {
            "student": {
                "label": "Student visa",
                "documents": [
                    {"id": "admission", "label": "University admission letter", "phase": "prepare", "note": "Zulassungsbescheid"},
                    {"id": "blocked", "label": "Blocked account (Sperrkonto)", "phase": "prepare", "note": "≈ €11,904/year (2025 figure) — verify current amount"},
                    {"id": "insurance", "label": "Health insurance coverage", "phase": "prepare", "note": "From arrival; travel insurance until then"},
                    {"id": "language", "label": "Language certificate", "phase": "prepare", "note": "German B1–C1 or English-taught program proof"},
                ],
            },
            "job_seeker": {
                "label": "Job seeker visa",
                "documents": [
                    {"id": "degree", "label": "Recognized degree / diploma", "phase": "prepare", "note": "Recognition via anabin database"},
                    {"id": "funds_js", "label": "Proof of livelihood funds", "phase": "prepare", "note": "Blocked account or sponsorship for the 6-month stay"},
                    {"id": "cv", "label": "CV + motivation letter", "phase": "prepare", "note": "Detailed professional CV"},
                ],
            },
            "work": {
                "label": "Employment (Blue Card)",
                "documents": [
                    {"id": "contract", "label": "Job contract / binding offer", "phase": "prepare", "note": "Salary must meet Blue Card threshold"},
                    {"id": "degree_bc", "label": "Degree recognition", "phase": "prepare", "note": "Statement of comparability (ZAB)"},
                ],
            },
        },
    },
    "australia": {
        "label": "Australia",
        "official_sources": ["https://immi.homeaffairs.gov.au/"],
        "visa_types": {
            "student": {
                "label": "Student visa (subclass 500)",
                "documents": [
                    {"id": "coe", "label": "Confirmation of Enrolment (CoE)", "phase": "prepare", "note": "From your education provider"},
                    {"id": "oshc", "label": "OSHC health insurance", "phase": "prepare", "note": "Overseas Student Health Cover policy"},
                    {"id": "gte", "label": "GTE statement", "phase": "prepare", "note": "Genuine Temporary Entrant statement"},
                    {"id": "ielts", "label": "English test results", "phase": "prepare", "note": "IELTS/PTE as required"},
                ],
            },
            "work_holiday": {
                "label": "Working holiday (subclass 462/417)",
                "documents": [
                    {"id": "funds_au", "label": "Proof of ~AUD 5,000 funds", "phase": "prepare", "note": "Plus return airfare"},
                    {"id": "edu_whv", "label": "Education evidence (462)", "phase": "prepare", "note": "Tertiary qualification or 2 years undergrad"},
                ],
            },
            "skilled": {
                "label": "Skilled work",
                "documents": [
                    {"id": "skills", "label": "Skills assessment", "phase": "prepare", "note": "From the relevant assessing authority"},
                    {"id": "eoi", "label": "EOI (SkillSelect)", "phase": "prepare", "note": "Expression of Interest submitted"},
                ],
            },
        },
    },
    "usa": {
        "label": "United States",
        "official_sources": ["https://travel.state.gov/content/travel/en/us-visas.html"],
        "visa_types": {
            "student_f1": {
                "label": "Student (F-1)",
                "documents": [
                    {"id": "i20", "label": "Form I-20", "phase": "prepare", "note": "Issued by the SEVP-certified school"},
                    {"id": "sevis", "label": "SEVIS fee receipt", "phase": "prepare", "note": "Pay before the interview"},
                    {"id": "ds160", "label": "DS-160 confirmation", "phase": "apply", "note": "Online nonimmigrant visa application"},
                    {"id": "financial", "label": "Financial support evidence", "phase": "prepare", "note": "Sponsor letters, bank statements"},
                ],
            },
            "work_h1b": {
                "label": "Work (H-1B)",
                "documents": [
                    {"id": "petition", "label": "Approved I-129 petition", "phase": "prepare", "note": "Employer files this"},
                    {"id": "lac", "label": "LCA copy", "phase": "prepare", "note": "Labor Condition Application"},
                    {"id": "creds", "label": "Degree + license documents", "phase": "prepare", "note": "Credentials evaluation if foreign degree"},
                ],
            },
            "visitor_b": {
                "label": "Visitor (B-1/B-2)",
                "documents": [
                    {"id": "ds160_b", "label": "DS-160 confirmation", "phase": "apply", "note": "Online application"},
                    {"id": "ties_us", "label": "Ties to home country", "phase": "interview", "note": "Employment, family, assets"},
                ],
            },
        },
    },
    "uk": {
        "label": "United Kingdom",
        "official_sources": ["https://www.gov.uk/browse/visas-immigration"],
        "visa_types": {
            "student": {
                "label": "Student visa",
                "documents": [
                    {"id": "cas", "label": "CAS letter", "phase": "prepare", "note": "Confirmation of Acceptance for Studies"},
                    {"id": "iat", "label": "IELTS for UKVI / SELT", "phase": "prepare", "note": "Approved Secure English Language Test"},
                    {"id": "funds_uk", "label": "Financial evidence (28 days)", "phase": "prepare", "note": "Funds held 28 consecutive days; dated within 31 days of application"},
                    {"id": "at", "label": "ATAS clearance (some courses)", "phase": "prepare", "note": "For research/STEM at postgrad level"},
                ],
            },
            "skilled_worker": {
                "label": "Skilled Worker",
                "documents": [
                    {"id": "cos", "label": "Certificate of Sponsorship", "phase": "prepare", "note": "Employer-issued reference number"},
                    {"id": "salary", "label": "Salary evidence", "phase": "prepare", "note": "Contract / payslips"},
                ],
            },
        },
    },
}

# Situation modifiers — added regardless of destination
SITUATIONS = {
    "student": [],
    "job_seeker": [
        {"id": "cv_generic", "label": "CV / résumé (translated if needed)", "phase": "prepare", "note": "Country-format CV"},
    ],
    "family": [
        {"id": "marriage", "label": "Marriage/birth certificates (apostilled)", "phase": "prepare", "note": "Legalized + translated copies"},
        {"id": "family_funds", "label": "Extra funds proof for dependents", "phase": "prepare", "note": "Per-dependent amount"},
    ],
    "with_kids": [
        {"id": "school_records", "label": "Children's school records", "phase": "prepare", "note": "For enrollment"},
    ],
}

PHASE_ORDER = ["prepare", "apply", "interview", "after_arrival"]
PHASE_LABELS = {
    "prepare": "1 · Prepare documents",
    "apply": "2 · Application & filing",
    "interview": "3 · Interview / biometrics",
    "after_arrival": "4 · After arrival",
}

DISCLAIMER = (
    "This checklist is a general guide, not legal advice. Requirements change — "
    "always verify with the official government source before filing."
)

COMMON_POST_APPROVAL = [
    {"id": "visa_print", "label": "Visa vignette / eTA printed copy", "phase": "after_arrival", "note": "Carry with passport when travelling"},
    {"id": "copies", "label": "Notarized copies of key documents", "phase": "after_arrival", "note": "Keep originals safe, carry copies"},
]


def build_checklist(destination: str, visa_type: str, situation: str | None = None) -> dict:
    """Build an ordered checklist. Raises KeyError on unknown destination/visa."""
    dest = DESTINATIONS.get(destination.lower())
    if not dest:
        raise KeyError(f"Unknown destination '{destination}'. Available: {', '.join(sorted(DESTINATIONS))}")
    vt = dest["visa_types"].get(visa_type.lower())
    if not vt:
        raise KeyError(
            f"Unknown visa type '{visa_type}' for {dest['label']}. "
            f"Available: {', '.join(sorted(dest['visa_types']))}"
        )

    documents: dict[str, dict] = {}

    def add(doc: dict):
        documents[doc["id"]] = dict(doc)

    for d in BASE_DOCUMENTS:
        add(d)
    for d in vt["documents"]:
        add(d)
    if situation and situation not in SITUATIONS:
        raise KeyError(
            f"Unknown situation '{situation}'. Available: {', '.join(sorted(SITUATIONS))}"
        )
    if situation and situation in SITUATIONS:
        for d in SITUATIONS[situation]:
            add(d)
    for d in COMMON_POST_APPROVAL:
        add(d)

    phases: dict[str, list[dict]] = {phase: [] for phase in PHASE_ORDER}
    for doc in documents.values():
        phases.setdefault(doc["phase"], []).append(doc)

    checklist = [
        {"phase": phase, "label": PHASE_LABELS.get(phase, phase), "items": items}
        for phase, items in phases.items()
        if items
    ]

    return {
        "destination": dest["label"],
        "visa_type": vt["label"],
        "situation": situation or "student",
        "checklist": checklist,
        "total_items": sum(len(p["items"]) for p in checklist),
        "official_sources": dest["official_sources"],
        "disclaimer": DISCLAIMER,
    }
