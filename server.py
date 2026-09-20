#!/usr/bin/env python3
"""
BharatSahayata - Backend Server & AI Scheme Comparison Assistant
Integrates Google Gemini 2.5 Flash for factual, objective scheme comparisons.
"""

import os
import json
import re
import requests
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "bharat-sahayata")

app = Flask(__name__, static_folder=FRONTEND_DIR)

# Configure Gemini models
GEMINI_PRIMARY_MODEL = "gemini-2.5-flash"
GEMINI_FALLBACK_MODEL = "gemini-1.5-flash"

SYSTEM_INSTRUCTION = """You are the BharatSahayata AI Scheme Comparison Assistant.

Your purpose is to help users understand and compare Indian government schemes.
The user has selected two government schemes.
Your job is to explain factual similarities and differences between these schemes.

You MUST:
1. Compare the provided schemes objectively.
2. Explain differences in simple language.
3. Use only the scheme information provided by the application or verified sources.
4. Never invent government scheme information.
5. Never invent eligibility requirements.
6. Never invent loan amounts, subsidies, benefits, documents, deadlines or application procedures.
7. Never claim that a user is definitely eligible.
8. Never tell the user which scheme is better.
9. Never recommend one scheme over another.
10. Never make the final decision for the user.
11. If information is missing, clearly state that it is unavailable.
12. Clearly explain similarities and differences.
13. Prefer official government sources when sources are available.
14. Mention that users should verify current information through the official government source before applying.

The assistant is an informational comparison tool, not a financial, legal, or government decision-maker."""


def format_scheme_for_prompt(scheme):
    """Format a scheme record into a clean, factual summary for the AI."""
    if not isinstance(scheme, dict):
        return "Unknown Scheme"
    
    name = scheme.get("name", "Unknown Scheme")
    category = scheme.get("category", "General")
    desc = scheme.get("description", "N/A")
    purposes = ", ".join(scheme.get("purposes", [])) or "N/A"
    occupations = ", ".join(scheme.get("occupations", [])) or "N/A"
    states = ", ".join(scheme.get("states", [])) or "All India"
    min_age = scheme.get("minAge", "N/A")
    max_age = scheme.get("maxAge", "N/A")
    income_limit = scheme.get("incomeLimit", "N/A")
    assistance = scheme.get("assistance", "N/A")
    benefit = scheme.get("whoMayBenefit", "N/A")
    eligibility = scheme.get("basicEligibility", "N/A")
    docs = ", ".join(scheme.get("documents", [])) or "Standard KYC"
    source = scheme.get("officialSource", "Official Government Portal")

    return f"""### Scheme: {name}
- Category: {category}
- Overview: {desc}
- Eligible Purposes: {purposes}
- Eligible Occupations: {occupations}
- Geographic Scope: {states}
- Age Eligibility: {min_age} to {max_age} years
- Income Limits: {income_limit}
- Financial Assistance / Benefits: {assistance}
- Target Beneficiaries: {benefit}
- Basic Eligibility Criteria: {eligibility}
- Required Documents: {docs}
- Official Source Portal: {source}"""


def generate_local_factual_comparison(scheme1, scheme2, question=""):
    """
    Deterministic fallback comparison based strictly on official dataset attributes.
    Used if GEMINI_API_KEY is not configured or in case of network/rate-limit interruptions.
    """
    s1_name = scheme1.get("name", "Scheme 1")
    s2_name = scheme2.get("name", "Scheme 2")
    
    categories = [
        {
            "category": "Purpose & Objectives",
            "scheme1": f"Supports {', '.join(scheme1.get('purposes', [])) or scheme1.get('description', 'N/A')}.",
            "scheme2": f"Supports {', '.join(scheme2.get('purposes', [])) or scheme2.get('description', 'N/A')}."
        },
        {
            "category": "Target Occupations & Beneficiaries",
            "scheme1": f"Focuses on: {', '.join(scheme1.get('occupations', []))}. Specifically: {scheme1.get('whoMayBenefit', 'Eligible applicants')}.",
            "scheme2": f"Focuses on: {', '.join(scheme2.get('occupations', []))}. Specifically: {scheme2.get('whoMayBenefit', 'Eligible applicants')}."
        },
        {
            "category": "Financial Assistance & Benefits",
            "scheme1": scheme1.get("assistance", "Financial assistance as per official scheme guidelines."),
            "scheme2": scheme2.get("assistance", "Financial assistance as per official scheme guidelines.")
        },
        {
            "category": "Eligibility Criteria (Age & Income)",
            "scheme1": f"Age: {scheme1.get('minAge', '18')}–{scheme1.get('maxAge', '65')} years. Income: {scheme1.get('incomeLimit', 'Standard guidelines apply')}. Criteria: {scheme1.get('basicEligibility', 'N/A')}",
            "scheme2": f"Age: {scheme2.get('minAge', '18')}–{scheme2.get('maxAge', '65')} years. Income: {scheme2.get('incomeLimit', 'Standard guidelines apply')}. Criteria: {scheme2.get('basicEligibility', 'N/A')}"
        },
        {
            "category": "Required Application Documents",
            "scheme1": ", ".join(scheme1.get("documents", [])) or "Standard identity & address proof.",
            "scheme2": ", ".join(scheme2.get("documents", [])) or "Standard identity & address proof."
        }
    ]

    sources = []
    if scheme1.get("officialSource"):
        sources.append({"name": s1_name, "url": scheme1["officialSource"]})
    if scheme2.get("officialSource"):
        sources.append({"name": s2_name, "url": scheme2["officialSource"]})

    summary = (
        f"Both {s1_name} and {s2_name} are verified government welfare initiatives designed to support Indian citizens. "
        f"{s1_name} primarily serves {', '.join(scheme1.get('occupations', [])[:3])}, whereas {s2_name} is designated for "
        f"{', '.join(scheme2.get('occupations', [])[:3])}. Their benefit structures and qualifying parameters are outlined below."
    )

    return {
        "summary": summary,
        "comparison": categories,
        "important_note": "Government scheme guidelines, subsidy percentages, and lending terms are subject to periodic ministry revisions. Always verify the latest official guidelines on the designated portal before applying.",
        "sources": sources,
        "is_ai": False,
        "notice": "Factual comparison compiled directly from verified government scheme data."
    }


def call_gemini_api(api_key, model_name, payload):
    """Call Gemini REST API generateContent endpoint."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, headers=headers, json=payload, timeout=25)
    return response


@app.route("/")
def index():
    """Serve the BharatSahayata home page."""
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/bharat-sahayata/<path:path>")
def static_bharat_sahayata(path):
    """Serve assets, css, and js from bharat-sahayata directory."""
    return send_from_directory(FRONTEND_DIR, path)


@app.route("/css/<path:path>")
def static_css(path):
    return send_from_directory(os.path.join(FRONTEND_DIR, "css"), path)


@app.route("/js/<path:path>")
def static_js(path):
    return send_from_directory(os.path.join(FRONTEND_DIR, "js"), path)


@app.route("/assets/<path:path>")
def static_assets(path):
    return send_from_directory(os.path.join(FRONTEND_DIR, "assets"), path)


@app.route("/api/compare-schemes", methods=["POST"])
def compare_schemes():
    """
    POST /api/compare-schemes
    Body:
    {
        "scheme1": {...},
        "scheme2": {...},
        "question": "What is the difference between these schemes?",
        "history": [ {"role": "user"|"assistant", "content": "..."} ]
    }
    """
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "Invalid request. Please provide scheme1, scheme2, and a question."
            }), 400

        scheme1 = data.get("scheme1")
        scheme2 = data.get("scheme2")
        question = (data.get("question") or "").strip()
        history = data.get("history") or []

        if not scheme1 or not scheme2:
            return jsonify({
                "success": False,
                "error": "Please select two schemes to compare."
            }), 400

        s1_id = scheme1.get("id", "")
        s2_id = scheme2.get("id", "")
        if s1_id and s2_id and s1_id == s2_id:
            return jsonify({
                "success": False,
                "error": "Please select two different schemes to compare."
            }), 400

        if not question:
            question = "What is the difference between these schemes?"

        # Retrieve API key
        api_key = os.environ.get("GEMINI_API_KEY", "").strip()

        # Build official sources list from dataset
        sources = []
        if scheme1.get("officialSource"):
            sources.append({"name": scheme1.get("name", "Scheme 1"), "url": scheme1["officialSource"]})
        if scheme2.get("officialSource"):
            sources.append({"name": scheme2.get("name", "Scheme 2"), "url": scheme2["officialSource"]})

        # If API key is missing, return clean factual comparison from dataset
        if not api_key or api_key == "your_gemini_api_key_here":
            comparison_data = generate_local_factual_comparison(scheme1, scheme2, question)
            return jsonify({
                "success": True,
                "type": "structured",
                "data": comparison_data
            })

        # Construct prompt for Gemini
        scheme_context = f"""=== SCHEME 1 ===
{format_scheme_for_prompt(scheme1)}

=== SCHEME 2 ===
{format_scheme_for_prompt(scheme2)}"""

        # Determine whether this is an initial structured comparison or a conversational follow-up
        is_follow_up = len(history) > 0 and question.lower() not in [
            "what is the difference between these schemes?",
            "compare these schemes",
            "compare schemes"
        ]

        if not is_follow_up:
            user_prompt = f"""Compare the following two government schemes factually and objectively.

{scheme_context}

User question: {question}

Respond ONLY with valid JSON matching this exact structure:
{{
    "summary": "Objective 2-3 sentence overview explaining what each scheme addresses and key differences without favoring either.",
    "comparison": [
        {{
            "category": "Purpose",
            "scheme1": "Factual purpose of Scheme 1",
            "scheme2": "Factual purpose of Scheme 2"
        }},
        {{
            "category": "Eligibility",
            "scheme1": "Age, occupation, and criteria for Scheme 1",
            "scheme2": "Age, occupation, and criteria for Scheme 2"
        }},
        {{
            "category": "Financial Assistance",
            "scheme1": "Loan amount, subsidy, or benefit for Scheme 1",
            "scheme2": "Loan amount, subsidy, or benefit for Scheme 2"
        }},
        {{
            "category": "Documents Required",
            "scheme1": "Required documentation for Scheme 1",
            "scheme2": "Required documentation for Scheme 2"
        }},
        {{
            "category": "Application & Target",
            "scheme1": "Beneficiaries and application portal for Scheme 1",
            "scheme2": "Beneficiaries and application portal for Scheme 2"
        }}
    ],
    "important_note": "Government scheme rules, loan subventions, and eligibility parameters are subject to official revision. Citizens must verify latest requirements on official portals before applying.",
    "sources": [
        {{"name": "{scheme1.get('name', 'Scheme 1')}", "url": "{scheme1.get('officialSource', '')}"}},
        {{"name": "{scheme2.get('name', 'Scheme 2')}", "url": "{scheme2.get('officialSource', '')}"}}
    ]
}}"""
        else:
            # Format history for conversational context
            history_text = "\n".join([
                f"{'User' if h.get('role') == 'user' else 'Assistant'}: {h.get('content', '')}"
                for h in history[-4:]
            ])
            user_prompt = f"""You are continuing a comparison session between two Indian government schemes:

{scheme_context}

Previous Conversation:
{history_text}

User Follow-Up Question: {question}

Explain the factual difference or similarity clearly and objectively in simple language.
Follow all system instructions:
- Do not recommend one scheme over another.
- Do not claim the user is eligible.
- Use only factual data.
- Mention that details should be verified on official portals."""

        gemini_payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_prompt}]
                }
            ],
            "systemInstruction": {
                "role": "system",
                "parts": [{"text": SYSTEM_INSTRUCTION}]
            },
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1500
            }
        }

        # Attempt with primary model, then fallback
        model_to_use = GEMINI_PRIMARY_MODEL
        resp = call_gemini_api(api_key, model_to_use, gemini_payload)

        if resp.status_code != 200:
            # Try fallback model
            model_to_use = GEMINI_FALLBACK_MODEL
            resp = call_gemini_api(api_key, model_to_use, gemini_payload)

        if resp.status_code != 200:
            # Fall back to dataset-based factual comparison
            comparison_data = generate_local_factual_comparison(scheme1, scheme2, question)
            return jsonify({
                "success": True,
                "type": "structured",
                "data": comparison_data
            })

        resp_json = resp.json()
        candidates = resp_json.get("candidates", [])
        if not candidates:
            comparison_data = generate_local_factual_comparison(scheme1, scheme2, question)
            return jsonify({
                "success": True,
                "type": "structured",
                "data": comparison_data
            })

        reply_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()

        if not is_follow_up:
            # Try parsing structured JSON
            clean_json_str = reply_text
            # Strip markdown code fences if present
            if clean_json_str.startswith("```"):
                clean_json_str = re.sub(r"^```(?:json)?\n?", "", clean_json_str)
                clean_json_str = re.sub(r"\n?```$", "", clean_json_str)

            try:
                parsed_data = json.loads(clean_json_str)
                # Ensure sources from dataset are included if missing
                if not parsed_data.get("sources"):
                    parsed_data["sources"] = sources
                parsed_data["is_ai"] = True
                return jsonify({
                    "success": True,
                    "type": "structured",
                    "data": parsed_data
                })
            except Exception:
                # If AI returned non-JSON text, wrap it cleanly
                return jsonify({
                    "success": True,
                    "type": "text",
                    "answer": reply_text,
                    "sources": sources
                })
        else:
            return jsonify({
                "success": True,
                "type": "text",
                "answer": reply_text,
                "sources": sources
            })

    except Exception as exc:
        # Safe error logging without exposing secrets
        print(f"[Error in /api/compare-schemes]: {type(exc).__name__}")
        return jsonify({
            "success": False,
            "error": "Sorry, I couldn't compare these schemes right now. Please try again."
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 BharatSahayata Server starting on http://localhost:{port}")
    print("   Serving static frontend and API at /api/compare-schemes")
    app.run(host="0.0.0.0", port=port, debug=False)
