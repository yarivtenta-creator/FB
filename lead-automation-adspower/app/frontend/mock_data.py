"""Realistic mock data for frontend demo."""
from datetime import datetime, timedelta
import random

LEADS = [
    {"id": 1, "business_name": "Golden Hour Films", "contact_name": "Sarah Mitchell",
     "niche": "wedding_video", "country": "USA", "city": "Austin", "language": "en",
     "website_url": "goldenhourfilms.com", "instagram_url": "@goldenhourfilms",
     "email": "sarah@goldenhourfilms.com", "phone": "+1 512 555 0192",
     "status": "Interested", "lead_score": 87, "best_channel": "email",
     "notes": "Active on Instagram, 12k followers. Strong cinematic portfolio. Has inquired about pricing packages before.",
     "source": "manual", "created_at": "2026-05-15 09:14:00"},

    {"id": 2, "business_name": "Luminara Studio", "contact_name": "Marco Rossi",
     "niche": "photography", "country": "Italy", "city": "Milan", "language": "it",
     "website_url": "luminarastudio.it", "instagram_url": "@luminarastudio",
     "facebook_url": "fb.com/luminarastudio", "email": "marco@luminarastudio.it",
     "status": "Reviewed", "lead_score": 72, "best_channel": "dm",
     "notes": "Wedding and portrait photography. 8k followers. Very active Stories.",
     "source": "manual", "created_at": "2026-05-18 11:30:00"},

    {"id": 3, "business_name": "Frame & Story Co.", "contact_name": "Emma Clarke",
     "niche": "content_creator", "country": "UK", "city": "London", "language": "en",
     "website_url": "frameandstory.co.uk", "instagram_url": "@frameandstory",
     "email": "emma@frameandstory.co.uk",
     "status": "Approved", "lead_score": 91, "best_channel": "email",
     "notes": "Brand content and social video. Highly responsive. Uses same-day edits.",
     "source": "manual", "created_at": "2026-05-20 14:22:00"},

    {"id": 4, "business_name": "Cielo Visuals", "contact_name": "Ana García",
     "niche": "wedding_video", "country": "Spain", "city": "Barcelona", "language": "es",
     "instagram_url": "@cielovisuals", "vimeo_url": "vimeo.com/cielovisuals",
     "status": "New", "lead_score": 63, "best_channel": "dm",
     "source": "csv", "created_at": "2026-05-22 08:05:00"},

    {"id": 5, "business_name": "Bloom Photography", "contact_name": "Jessica Wong",
     "niche": "photography", "country": "Australia", "city": "Sydney", "language": "en",
     "website_url": "bloomphotography.com.au", "email": "jessica@bloomphotography.com.au",
     "status": "Contacted", "lead_score": 74, "best_channel": "email",
     "source": "csv", "created_at": "2026-05-23 16:44:00"},

    {"id": 6, "business_name": "Luce Eterna Films", "contact_name": "Giulia Ferraro",
     "niche": "wedding_video", "country": "Italy", "city": "Rome", "language": "it",
     "website_url": "luceeterna.it", "instagram_url": "@luceeternafilms",
     "email": "giulia@luceeterna.it",
     "status": "Replied", "lead_score": 83, "best_channel": "email",
     "source": "manual", "created_at": "2026-05-25 10:11:00"},

    {"id": 7, "business_name": "Nuit Blanche Studio", "contact_name": "Pierre Dumont",
     "niche": "studio", "country": "France", "city": "Paris", "language": "fr",
     "website_url": "nuitblanche.fr", "instagram_url": "@nuitblanche_paris",
     "email": "pierre@nuitblanche.fr",
     "status": "New", "lead_score": 55, "best_channel": "dm",
     "source": "csv", "created_at": "2026-05-26 09:00:00"},

    {"id": 8, "business_name": "Waldlicht Fotografie", "contact_name": "Klaus Weber",
     "niche": "photography", "country": "Germany", "city": "Munich", "language": "de",
     "website_url": "waldlicht.de", "email": "k.weber@waldlicht.de",
     "status": "Call Booked", "lead_score": 95, "best_channel": "email",
     "source": "manual", "created_at": "2026-05-27 13:20:00"},

    {"id": 9, "business_name": "Horizon Creative", "contact_name": "Olivia Chen",
     "niche": "content_creator", "country": "Canada", "city": "Toronto", "language": "en",
     "website_url": "horizoncreative.ca", "instagram_url": "@horizoncreative",
     "status": "New", "lead_score": 48, "best_channel": "comment",
     "source": "csv", "created_at": "2026-05-28 07:55:00"},

    {"id": 10, "business_name": "Eternal Moments", "contact_name": "Luca Bianchi",
     "niche": "wedding_video", "country": "Italy", "city": "Florence", "language": "it",
     "instagram_url": "@eternalmoments_fi", "vimeo_url": "vimeo.com/eternalmoments",
     "status": "Reviewed", "lead_score": 68, "best_channel": "dm",
     "source": "manual", "created_at": "2026-05-29 15:33:00"},

    {"id": 11, "business_name": "Studio Miroir", "contact_name": "Camille Bernard",
     "niche": "studio", "country": "France", "city": "Lyon", "language": "fr",
     "website_url": "studiomiroir.fr", "email": "camille@studiomiroir.fr",
     "status": "Not Relevant", "lead_score": 22, "best_channel": "email",
     "source": "csv", "created_at": "2026-05-30 11:10:00"},

    {"id": 12, "business_name": "Velvet Lens", "contact_name": "Sophie Turner",
     "niche": "photography", "country": "UK", "city": "Manchester", "language": "en",
     "website_url": "velvetlens.co.uk", "instagram_url": "@velvetlens",
     "email": "sophie@velvetlens.co.uk",
     "status": "Approved", "lead_score": 79, "best_channel": "email",
     "source": "manual", "created_at": "2026-06-01 09:40:00"},
]

ACTIVITIES = [
    {"id": 1, "lead_id": 1, "business_name": "Golden Hour Films",
     "action": "draft_approved", "details": '{"channel": "email", "tone": "professional"}',
     "created_at": "2026-06-10 08:15:00"},
    {"id": 2, "lead_id": 8, "business_name": "Waldlicht Fotografie",
     "action": "call_booked", "details": '{"note": "Scheduled 30-min discovery call"}',
     "created_at": "2026-06-10 07:50:00"},
    {"id": 3, "lead_id": 6, "business_name": "Luce Eterna Films",
     "action": "lead_replied", "details": '{"channel": "email"}',
     "created_at": "2026-06-09 16:22:00"},
    {"id": 4, "lead_id": 3, "business_name": "Frame & Story Co.",
     "action": "draft_approved", "details": '{"channel": "dm", "tone": "soft"}',
     "created_at": "2026-06-09 14:05:00"},
    {"id": 5, "lead_id": 5, "business_name": "Bloom Photography",
     "action": "outreach_sent", "details": '{"channel": "email"}',
     "created_at": "2026-06-09 11:30:00"},
    {"id": 6, "lead_id": 12, "business_name": "Velvet Lens",
     "action": "lead_approved", "details": '{}',
     "created_at": "2026-06-08 15:44:00"},
    {"id": 7, "lead_id": 2, "business_name": "Luminara Studio",
     "action": "ai_analysis_run", "details": '{"score": 72}',
     "created_at": "2026-06-08 10:20:00"},
    {"id": 8, "lead_id": 9, "business_name": "Horizon Creative",
     "action": "lead_created", "details": '{"source": "csv"}',
     "created_at": "2026-06-07 09:05:00"},
    {"id": 9, "lead_id": 4, "business_name": "Cielo Visuals",
     "action": "lead_created", "details": '{"source": "csv"}',
     "created_at": "2026-06-06 14:18:00"},
    {"id": 10, "lead_id": 7, "business_name": "Nuit Blanche Studio",
     "action": "lead_created", "details": '{"source": "csv"}',
     "created_at": "2026-06-05 08:55:00"},
]

DRAFTS = [
    {"id": 1, "lead_id": 1, "business_name": "Golden Hour Films", "contact_name": "Sarah Mitchell",
     "channel": "email", "tone": "professional", "language_code": "en",
     "content": """Subject: Helping Golden Hour Films Book More Dream Clients

Hi Sarah,

I came across Golden Hour Films and was genuinely moved by your cinematic storytelling — the way you capture emotion in your work sets you apart.

I work with wedding videographers like you to help attract and convert more of their ideal clients through strategic outreach.

Would you be open to a 20-minute call this week to explore if there's a fit?

Best,
[Your Name]""",
     "status": "approved", "created_at": "2026-06-09 14:00:00"},

    {"id": 2, "lead_id": 1, "business_name": "Golden Hour Films", "contact_name": "Sarah Mitchell",
     "channel": "dm", "tone": "soft", "language_code": "en",
     "content": "Hi Sarah! Just discovered Golden Hour Films and honestly, your work is stunning 😍 The emotion you capture is rare. Would love to share something that might help you reach even more couples like the ones in your portfolio — mind if I send a quick note?",
     "status": "pending", "created_at": "2026-06-09 14:02:00"},

    {"id": 3, "lead_id": 3, "business_name": "Frame & Story Co.", "contact_name": "Emma Clarke",
     "channel": "email", "tone": "direct", "language_code": "en",
     "content": """Subject: Booking More Brand Clients for Frame & Story

Hi Emma,

Frame & Story's work is exactly what brands are searching for. I help content studios like yours consistently fill their pipeline with premium brand clients.

Here's the offer: a proven outreach system that fits your style, no cold pitching required.

Ready to see if it works for you? 15 minutes is all it takes.

[Your Name]""",
     "status": "approved", "created_at": "2026-06-08 11:00:00"},

    {"id": 4, "lead_id": 2, "business_name": "Luminara Studio", "contact_name": "Marco Rossi",
     "channel": "dm", "tone": "soft", "language_code": "it",
     "content": "Ciao Marco! Ho scoperto Luminara Studio e il tuo stile fotografico è davvero unico — quella luce naturale che riesci a catturare è straordinaria. Ti scrivo perché lavoro con fotografi come te per aiutarli a raggiungere più clienti ideali. Posso condividere qualcosa di utile?",
     "status": "pending", "created_at": "2026-06-10 09:00:00"},

    {"id": 5, "lead_id": 6, "business_name": "Luce Eterna Films", "contact_name": "Giulia Ferraro",
     "channel": "email", "tone": "professional", "language_code": "it",
     "content": """Oggetto: Collaborazione per Luce Eterna Films

Gentile Giulia,

Ho avuto il piacere di visionare il portfolio di Luce Eterna Films e la qualità cinematografica del vostro lavoro è davvero notevole.

Lavoro con videografi matrimoniali italiani per aiutarli ad aumentare le prenotazioni attraverso strategie di outreach personalizzate.

Sarebbe disponibile per una breve chiamata questa settimana?

Cordiali saluti,
[Il Tuo Nome]""",
     "status": "approved", "created_at": "2026-06-07 15:30:00"},
]

PROFILES = {
    1: {
        "summary": "Golden Hour Films is a premium wedding videography studio based in Austin, TX. Sarah Mitchell has built a strong brand around cinematic, emotion-driven storytelling. The studio targets couples who value film-quality production over standard videography.",
        "service_type": "Wedding Videography",
        "opportunities": [
            "Highlight reel upsell package ($800–1,200 add-on)",
            "Social media teaser clips for engaged couples",
            "Referral partnership with Austin-area wedding photographers",
            "Same-day edit offering for premium packages",
            "Destination wedding expansion (5+ inquiries/year potential)"
        ],
        "pain_points": [
            "Inconsistent inquiry flow during off-peak months",
            "Underpriced vs. Austin market average ($2,800 vs. $3,500 avg)",
            "No automated follow-up system for inquiries"
        ],
        "score": 87,
        "recommended_channel": "email",
    },
    8: {
        "summary": "Waldlicht Fotografie is a high-end wedding photography studio in Munich. Klaus Weber specializes in timeless, film-inspired photography with a loyal client base and strong word-of-mouth referrals.",
        "service_type": "Wedding Photography",
        "opportunities": [
            "International destination wedding packages",
            "Printed album upsells (€400–800 margin)",
            "Engagement session add-ons",
            "Corporate portrait day-rate packages"
        ],
        "pain_points": [
            "Seasonal booking gaps (Jan–Feb)",
            "No active social media content strategy"
        ],
        "score": 95,
        "recommended_channel": "email",
    },
}

APPROVALS = [
    {"id": 1, "draft_id": 1, "lead_id": 1, "business_name": "Golden Hour Films",
     "channel": "email", "tone": "professional", "decision": "approved",
     "next_action": "Send via email by end of day",
     "opt_out": 0, "do_not_contact": 0,
     "lawful_basis_note": "Legitimate interest — public business contact",
     "first_contact_notice_status": "pending",
     "decided_at": "2026-06-09 14:05:00"},
    {"id": 2, "draft_id": 3, "lead_id": 3, "business_name": "Frame & Story Co.",
     "channel": "email", "tone": "direct", "decision": "approved",
     "next_action": "Schedule follow-up if no reply in 5 days",
     "opt_out": 0, "do_not_contact": 0,
     "lawful_basis_note": "Legitimate interest",
     "first_contact_notice_status": "sent",
     "decided_at": "2026-06-08 11:10:00"},
    {"id": 3, "draft_id": 5, "lead_id": 6, "business_name": "Luce Eterna Films",
     "channel": "email", "tone": "professional", "decision": "approved",
     "next_action": "Await reply — follow up after 4 days",
     "opt_out": 0, "do_not_contact": 0,
     "lawful_basis_note": "Legitimate interest",
     "first_contact_notice_status": "sent",
     "decided_at": "2026-06-07 15:35:00"},
]

CONTENT_ITEMS = [
    {"id": 1, "lead_id": 1, "content_type": "website",
     "raw_content": "Golden Hour Films — Austin Wedding Videography. We believe every love story deserves to be told beautifully. Our cinematic films capture the raw emotion, laughter, and tears of your wedding day...",
     "analysis": {
         "key_themes": ["Cinematic storytelling", "Emotion", "Romance", "Premium quality"],
         "tone": "Warm, poetic, aspirational",
         "opportunities": ["Strong brand voice — personalization is key", "Pricing page hidden — fear of sticker shock"],
         "pain_points": ["No testimonials section", "Contact form only — no direct booking"],
         "quality_signals": ["Professional site design", "Video reel on homepage", "Clear niche focus"],
     },
     "created_at": "2026-06-08 09:00:00"},
    {"id": 2, "lead_id": 1, "content_type": "instagram",
     "raw_content": "📍 Austin, TX | Cinematic Wedding Films | Booking 2026 & 2027 | DM for availability | Link in bio",
     "analysis": {
         "key_themes": ["Availability focus", "Location-based", "Forward booking"],
         "tone": "Casual, approachable",
         "opportunities": ["Actively booking = high intent", "DM preferred = use DM channel"],
         "pain_points": ["Bio doesn't mention price range", "No unique value prop"],
         "quality_signals": ["Consistent posting schedule", "12k followers", "High engagement rate"],
     },
     "created_at": "2026-06-08 09:15:00"},
]

TRELLO_BOARDS = [
    {"id": "b001", "name": "SDR Pipeline — Edit Value", "status": "connected",
     "cards": 12, "lists": 9, "last_sync": "2026-06-10 07:00:00"},
]

TRELLO_CARDS = [
    {"lead": "Golden Hour Films", "list": "Interested", "due": "2026-06-12", "score": 87},
    {"lead": "Waldlicht Fotografie", "list": "Call Booked", "due": "2026-06-11", "score": 95},
    {"lead": "Luce Eterna Films", "list": "Replied", "due": "2026-06-13", "score": 83},
    {"lead": "Frame & Story Co.", "list": "Approved", "due": "2026-06-11", "score": 91},
    {"lead": "Bloom Photography", "list": "Contacted", "due": "2026-06-14", "score": 74},
]

ADSPOWER_PROFILES = [
    {"user_id": "ap_001", "name": "Profile — Golden Hour (Sarah)", "status": "closed",
     "linked_lead": "Golden Hour Films", "last_used": "2026-06-09 16:00:00"},
    {"user_id": "ap_002", "name": "Profile — Luminara (Marco)", "status": "closed",
     "linked_lead": "Luminara Studio", "last_used": "2026-06-08 14:30:00"},
    {"user_id": "ap_003", "name": "Profile — Frame & Story (Emma)", "status": "open",
     "linked_lead": "Frame & Story Co.", "last_used": "2026-06-10 08:45:00"},
    {"user_id": "ap_004", "name": "Research Profile 1", "status": "closed",
     "linked_lead": None, "last_used": "2026-06-07 11:00:00"},
]

SCRIPTO_LOCALES = {
    "en": {
        "label": "🇬🇧 English",
        "example_soft": "Hi [Name], I just came across your work and I'm genuinely impressed by your storytelling style. I'd love to share something that could help you reach more of your ideal clients — would you be open to a quick message?",
        "example_direct": "Hi [Name], I help wedding videographers like you consistently book premium clients. Here's a system that works for your market — 15 minutes to see if it fits?",
        "example_professional": "Dear [Name], I came across your portfolio and was impressed by the quality of your work. I specialize in helping creative studios like yours grow their client pipeline. I'd welcome the opportunity to discuss this further.",
        "notes": "Direct and value-first. CTAs are clear. Email preferred for professional outreach.",
    },
    "it": {
        "label": "🇮🇹 Italian",
        "example_soft": "Ciao [Nome], ho scoperto il tuo lavoro per caso e sono rimasto colpito dal tuo stile narrativo. Ti contatto perché credo di poter aiutarti a raggiungere ancora più clienti ideali. Ti va se ti mando qualcosa di utile?",
        "example_direct": "Ciao [Nome], lavoro con videografi come te per aiutarli a riempire il calendario con clienti premium. Ho un sistema specifico per il mercato italiano. 15 minuti per esplorare insieme?",
        "example_professional": "Gentile [Nome], ho avuto il piacere di visionare il vostro portfolio e la qualità del vostro lavoro è davvero notevole. Collaboro con studi creativi italiani per sviluppare strategie di acquisizione clienti. Sarebbe disponibile per una breve chiamata?",
        "notes": "Relationship-first culture. Use 'tu' for DMs, 'lei' for formal email. Avoid being too transactional upfront.",
    },
    "fr": {
        "label": "🇫🇷 French",
        "example_soft": "Bonjour [Prénom], je suis tombé sur votre travail et j'ai été sincèrement touché par votre façon de raconter les histoires. Je serais ravi de partager quelque chose qui pourrait vous aider à attirer encore plus de clients idéaux.",
        "example_direct": "Bonjour [Prénom], j'aide les vidéastes de mariage à remplir leur agenda avec des clients premium. J'ai une approche adaptée au marché français — 15 minutes pour voir si ça vous correspond?",
        "example_professional": "Madame, Monsieur, j'ai eu l'occasion de découvrir votre portfolio et j'ai été particulièrement impressionné par la qualité de votre travail. Je collabore avec des studios créatifs pour développer leur portefeuille clients. Seriez-vous disponible pour un échange?",
        "notes": "Formal register preferred, especially for first contact. Use 'vous' always. Avoid informal abbreviations.",
    },
    "de": {
        "label": "🇩🇪 German",
        "example_soft": "Hallo [Name], ich bin zufällig auf Ihre Arbeit gestoßen und war wirklich beeindruckt von Ihrem Stil. Ich würde gerne etwas teilen, das Ihnen helfen könnte, noch mehr Ihrer Wunschkunden zu erreichen.",
        "example_direct": "Hallo [Name], ich helfe Hochzeitsvideografen dabei, ihren Kalender mit Premium-Kunden zu füllen. Ich habe ein System, das speziell für den deutschen Markt funktioniert — 15 Minuten, um zu prüfen, ob es passt?",
        "example_professional": "Sehr geehrte/r [Name], ich habe Ihr Portfolio entdeckt und bin von der Qualität Ihrer Arbeit sehr beeindruckt. Ich arbeite mit kreativen Studios zusammen, um deren Kundengewinnung zu optimieren. Hätten Sie Zeit für ein kurzes Gespräch?",
        "notes": "Precise and formal. Always use 'Sie'. Value professionalism and specificity. Avoid superlatives.",
    },
}


def get_pipeline_stats():
    status_counts = {}
    for lead in LEADS:
        s = lead["status"]
        status_counts[s] = status_counts.get(s, 0) + 1

    total = len(LEADS)
    contacted = sum(1 for l in LEADS if l["status"] in ["Contacted", "Replied", "Interested", "Call Booked"])
    conversion_rate = round(contacted / total * 100) if total > 0 else 0

    return {
        "total": total,
        "new": status_counts.get("New", 0),
        "approved": status_counts.get("Approved", 0),
        "contacted": status_counts.get("Contacted", 0),
        "replied": status_counts.get("Replied", 0),
        "interested": status_counts.get("Interested", 0),
        "call_booked": status_counts.get("Call Booked", 0),
        "pending_drafts": sum(1 for d in DRAFTS if d["status"] == "pending"),
        "conversion_rate": conversion_rate,
        "by_status": status_counts,
    }


def get_lead_growth_data():
    """Monthly lead growth for chart."""
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    values = [3, 7, 12, 18, 28, 12]
    cumulative = [3, 10, 22, 40, 68, 80]
    return months, values, cumulative


def get_language_distribution():
    lang_count = {}
    for lead in LEADS:
        l = lead.get("language", "en")
        lang_count[l] = lang_count.get(l, 0) + 1
    return lang_count
