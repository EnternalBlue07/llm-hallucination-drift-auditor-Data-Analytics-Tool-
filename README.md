TrustAI is an AI & Data Authenticity Governance platform designed to audit
both structured datasets and AI/LLM-generated outputs before they are trusted
in real-world decision-making.

The system detects:
- AI hallucinations and fabricated claims
- Data and feature drift using PSI and statistical analysis
- Domain violations (e.g. impossible values, invalid identifiers)
- Over-trust risks caused by naive score averaging

Unlike traditional monitoring tools, TrustAI uses a governance-first
architecture with veto gates, ensuring that critical safety failures
cannot be compensated by high performance in other metrics.

Key Features:
- Hallucination detection with grounding and contradiction analysis
- Data quality and drift analysis with explainable metrics
- Non-compensatory Trust Score with governance overrides
- Clear risk badges: SAFE, REVIEW, UNSAFE, INSUFFICIENT DATA
- Human-readable audit reports with recommended remediation actions
- Interactive dashboard with exportable audit reports

This project demonstrates production-oriented thinking around AI reliability,
risk governance, and responsible deployment of data-driven systems.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
