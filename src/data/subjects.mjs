// The five tools we write "alternatives" pages for (matches the tab bar in the brief).
// `alternatives` is the ranked list shown after ContentStudio (always #1).
// `reasons` is the tailored "why switch from <subject>" line for each tool.

export const SUBJECTS = {
  hootsuite: {
    tool: "hootsuite",
    intro:
      "Hootsuite helped define social media management, but price hikes, the end of its free plan and per-user costs have teams looking for something leaner. We tested the leading Hootsuite alternatives on publishing, engagement, analytics, collaboration and value, and ContentStudio came out on top for most teams.",
    painPoints: [
      { title: "Steep, rising prices", text: "Professional starts around $99/mo for a single user, and Team jumps to $249/mo. Adding seats or accounts quickly pushes teams into Enterprise quotes." },
      { title: "No free plan", text: "Hootsuite retired its free tier, so freelancers and small businesses now pay from day one." },
      { title: "Cluttered, dated interface", text: "The streams-based UI has grown crowded over the years, and new users often need training to be productive." },
      { title: "Key features locked to higher tiers", text: "Approval workflows, custom reports and extra users sit behind Team or Enterprise plans." },
    ],
    alternatives: ["sprout-social", "socialpilot", "agorapulse", "sendible", "vista-social", "buffer", "zoho-social", "eclincher", "later", "loomly", "metricool", "statusbrew"],
    reasons: {
      contentstudio: "Gives you Hootsuite-level publishing, inbox and reporting, plus a content discovery engine and AI writer Hootsuite lacks, at roughly a quarter of the price with unlimited workspaces on the agency plan.",
      "sprout-social": "Matches Hootsuite's enterprise depth with a cleaner UI and better reports, if per-seat pricing fits your budget.",
      socialpilot: "Covers the Hootsuite essentials (bulk scheduling, inbox, client reports) for a fraction of the cost.",
      agorapulse: "Delivers a far nicer inbox and ROI reporting than Hootsuite, with a usable free plan.",
      sendible: "Built for agencies with client workspaces, which Hootsuite only offers on expensive tiers.",
      "vista-social": "A modern UI with listening and review management bundled in at a lower price point.",
      buffer: "The simplest swap for solo users who found Hootsuite overwhelming.",
      "zoho-social": "Very low pricing with monitoring and CRM ties for Zoho customers.",
      eclincher: "Comparable breadth, including listening and reviews, with highly rated live support.",
      later: "A better fit if your strategy is Instagram- and TikTok-led.",
      loomly: "A gentler learning curve with clear approval flows for small teams.",
      metricool: "Stronger analytics and ads reporting per dollar than Hootsuite.",
      statusbrew: "Rule-based moderation for brands drowning in comments.",
    },
    verdict:
      "Choose ContentStudio if you want an all-in-one replacement that is easier to use and far cheaper. Stay with Hootsuite only if you depend on its enterprise listening add-ons or a specific integration from its app directory.",
    faqs: [
      { q: "What is the best alternative to Hootsuite?", a: "ContentStudio is the best Hootsuite alternative for most teams. It covers scheduling, the social inbox, approvals and white-label reports, and adds content discovery and AI writing, starting from $25/mo instead of $99/mo." },
      { q: "Is there a free alternative to Hootsuite?", a: "Buffer, Agorapulse, Zoho Social, Metricool, Vista Social and Publer all offer free plans with limits. ContentStudio offers a 14-day free trial with full features." },
      { q: "Why is Hootsuite so expensive?", a: "Hootsuite prices for enterprise buyers and charges heavily for additional users and accounts. Smaller teams effectively subsidise features they never use." },
      { q: "Can I migrate from Hootsuite easily?", a: "Yes. Most alternatives, including ContentStudio, let you reconnect profiles in minutes and bulk import scheduled posts via CSV." },
      { q: "Is ContentStudio cheaper than Hootsuite?", a: "Yes. ContentStudio's Agency Unlimited plan costs about the same as Hootsuite's single-user Professional plan while including unlimited workspaces and white-label reporting." },
    ],
  },

  "sprout-social": {
    tool: "sprout-social",
    intro:
      "Sprout Social is polished and powerful, but at $199 to $399 per seat per month, plus paid add-ons for listening and analytics, it is out of reach for most small teams and agencies. These Sprout Social alternatives deliver most of the value for far less, led by ContentStudio.",
    painPoints: [
      { title: "Per-seat pricing", text: "Every user costs $199 to $399 per month, so a five-person team can spend $12,000+ a year before add-ons." },
      { title: "Paid add-ons", text: "Listening, Premium Analytics and Employee Advocacy are sold separately on top of the seat price." },
      { title: "No content discovery", text: "Sprout helps you publish and report, but it will not help you find what to post." },
      { title: "Overkill for small teams", text: "Many features are designed for enterprise social care, which small teams pay for but rarely use." },
    ],
    alternatives: ["agorapulse", "hootsuite", "sendible", "vista-social", "socialpilot", "zoho-social", "statusbrew", "eclincher", "buffer", "napoleoncat", "metricool"],
    reasons: {
      contentstudio: "Replaces Sprout's publishing, inbox, approvals and branded reports with flat team pricing, then adds content discovery, an AI writer and unlimited workspaces that Sprout does not offer at any price.",
      agorapulse: "The closest feel to Sprout's inbox experience, with ROI reports at lower per-user prices.",
      hootsuite: "Similar enterprise breadth and listening, often cheaper for single users.",
      sendible: "Agency workspaces and client reports without per-seat sticker shock.",
      "vista-social": "Listening and review management included rather than sold as add-ons.",
      socialpilot: "Budget pick covering scheduling, inbox and white-label reports.",
      "zoho-social": "Low-cost publishing and monitoring with CRM integration.",
      statusbrew: "Rule-based engagement and SLA reporting comparable to Sprout's care tools.",
      eclincher: "Broad suite with reviews and listening at lower team pricing.",
      buffer: "Simple and inexpensive if you only need scheduling.",
      napoleoncat: "Social customer service and auto-moderation at a fraction of the price.",
      metricool: "Strong analytics and ad reporting with a free plan.",
    },
    verdict:
      "ContentStudio is the smartest Sprout Social alternative for teams that need serious features without per-seat pricing. Sprout still leads on enterprise social customer care at scale, if budget is no object.",
    faqs: [
      { q: "What is cheaper than Sprout Social?", a: "ContentStudio, SocialPilot, Zoho Social, Metricool and Buffer are all dramatically cheaper. ContentStudio offers the closest feature parity, starting at $25/mo for the whole plan rather than per seat." },
      { q: "Is there a Sprout Social alternative with listening?", a: "Hootsuite, Agorapulse, Vista Social and eClincher include listening features. ContentStudio offers keyword-based monitoring alongside its content discovery." },
      { q: "Does ContentStudio have reports like Sprout Social?", a: "Yes. ContentStudio offers cross-network and per-platform analytics, competitor analytics and scheduled white-label PDF reports." },
      { q: "Which Sprout Social alternative is best for agencies?", a: "ContentStudio, thanks to unlimited workspaces, client approval links and white-label reports on its Agency Unlimited plan." },
    ],
  },

  loomly: {
    tool: "loomly",
    intro:
      "Loomly is easy to learn, but tight user and account caps, basic analytics and generic post ideas mean many teams outgrow it. These Loomly alternatives give you more room to grow, with ContentStudio leading on content ideation and value.",
    painPoints: [
      { title: "User and account caps", text: "The Base plan allows only 2 users and 10 accounts, forcing early upgrades as your team grows." },
      { title: "Shallow analytics", text: "Reporting covers the basics but lacks competitor benchmarking and white-label client reports on lower tiers." },
      { title: "Generic post ideas", text: "Loomly's ideas are based on holidays and trends, not a searchable discovery engine for your niche." },
      { title: "Agency costs add up", text: "Premium plans climb past $275/mo once you need more brands and seats." },
    ],
    alternatives: ["planable", "buffer", "socialpilot", "sendible", "later", "socialbee", "agorapulse", "publer", "hootsuite", "zoho-social", "metricool"],
    reasons: {
      contentstudio: "Keeps the easy calendar and approvals you like in Loomly, then replaces generic post ideas with real content discovery and AI, and gives you far more accounts and workspaces per dollar.",
      planable: "Even stronger collaboration and approval UX, with a free plan to start.",
      buffer: "Simpler and cheaper for small teams with modest needs.",
      socialpilot: "More accounts per plan and white-label reports at similar prices.",
      sendible: "Agency-grade client management Loomly lacks.",
      later: "Better visual planning for Instagram- and TikTok-first brands.",
      socialbee: "Evergreen content categories that keep your calendar full automatically.",
      agorapulse: "A much stronger engagement inbox.",
      publer: "Budget scheduler with bulk tools and recycling.",
      hootsuite: "Enterprise depth if you need listening and integrations.",
      "zoho-social": "Lower price with monitoring and CRM ties.",
      metricool: "Far deeper analytics for the money.",
    },
    verdict:
      "Pick ContentStudio if you want Loomly's simplicity with real content ideation, an inbox and agency-scale workspaces. Loomly remains fine for very small teams that only need a shared calendar.",
    faqs: [
      { q: "What is the best Loomly alternative?", a: "ContentStudio. It matches Loomly's calendar and approvals and adds content discovery, an AI writer, automation and white-label reports." },
      { q: "Is there a free Loomly alternative?", a: "Planable, Buffer, Publer, Metricool and Zoho Social have free plans. ContentStudio has a 14-day free trial." },
      { q: "Is Loomly owned by Sprout Social?", a: "Yes. Sprout Social acquired Loomly in 2024. It continues to operate as a separate product." },
      { q: "Which Loomly alternative is best for agencies?", a: "ContentStudio and Sendible, both of which offer multi-client workspaces, client approvals and white-label reports." },
    ],
  },

  sendible: {
    tool: "sendible",
    intro:
      "Sendible is a capable agency tool, but its busy interface, white-label locked behind premium tiers and limited content curation push agencies to explore alternatives. Here are the best Sendible alternatives we tested, with ContentStudio as the strongest all-round pick.",
    painPoints: [
      { title: "White-label costs extra", text: "Custom branding and domains are only on White Label plans starting around $240/mo." },
      { title: "Cluttered interface", text: "Many users report a dated, busy UI with a learning curve for new team members." },
      { title: "Limited content curation", text: "Content suggestions are basic compared with a dedicated discovery engine." },
      { title: "Profile-based pricing", text: "Costs scale with every new client profile you add." },
    ],
    alternatives: ["socialpilot", "agorapulse", "vista-social", "hootsuite", "zoho-social", "loomly", "buffer", "metricool", "socialbee", "eclincher", "statusbrew"],
    reasons: {
      contentstudio: "Offers everything agencies use Sendible for (workspaces, approvals, inbox, white-label reports) plus content discovery and an AI writer, with unlimited workspaces at a lower price than Sendible's White Label tier.",
      socialpilot: "The closest budget-friendly swap, with white-label reports on lower tiers.",
      agorapulse: "A best-in-class inbox for community-heavy clients.",
      "vista-social": "Modern UI with listening and review management included.",
      hootsuite: "Enterprise-grade tooling for large clients.",
      "zoho-social": "Affordable agency plans with monitoring.",
      loomly: "Simpler interface with clean approval flows.",
      buffer: "Simplest option for small client rosters.",
      metricool: "Excellent analytics and ad reports per brand.",
      socialbee: "Evergreen category scheduling for retainer clients.",
      eclincher: "Similar agency breadth with excellent live support.",
      statusbrew: "Moderation and SLA tooling for high-volume clients.",
    },
    verdict:
      "ContentStudio is our top Sendible alternative for agencies: more features, cleaner UX and white-label reporting without the premium surcharge. Sendible still suits agencies already deeply invested in its client-connect workflow.",
    faqs: [
      { q: "What is the best Sendible alternative for agencies?", a: "ContentStudio, because its Agency Unlimited plan includes unlimited workspaces, client approval links and white-label reports for about $99/mo." },
      { q: "Is SocialPilot better than Sendible?", a: "SocialPilot is cheaper and simpler, with white-label reports on lower tiers, but it lacks content discovery and listening. ContentStudio covers both gaps." },
      { q: "Does ContentStudio support white-label?", a: "Yes. ContentStudio supports white-label reports and client-facing approvals for agencies." },
      { q: "Can I import my Sendible schedule?", a: "Export your queue to CSV and bulk import it into ContentStudio, SocialPilot or most other tools listed here." },
    ],
  },

  planable: {
    tool: "planable",
    intro:
      "Planable is fantastic for approvals, but without a social inbox, content discovery or strong analytics most teams end up paying for a second tool. These Planable alternatives cover collaboration and everything after it, with ContentStudio as our top choice.",
    painPoints: [
      { title: "No social inbox", text: "You cannot reply to comments or DMs from Planable, so engagement happens elsewhere." },
      { title: "Basic analytics", text: "Reporting is limited, making it hard to prove ROI to stakeholders or clients." },
      { title: "No content discovery", text: "Planable helps you approve content but not find or generate ideas at scale." },
      { title: "Per-workspace pricing", text: "Agencies pay for every client workspace, which adds up quickly." },
    ],
    alternatives: ["loomly", "buffer", "later", "publer", "pallyy", "socialpilot", "sendible", "agorapulse", "metricool", "socialbee", "vista-social"],
    reasons: {
      contentstudio: "Keeps the client approval experience you rely on in Planable, with external approval links and comments, while adding the inbox, content discovery, AI writer and white-label analytics Planable lacks, with unlimited workspaces on one plan.",
      loomly: "A similar calendar-and-approvals focus with an interactions inbox.",
      buffer: "Very simple scheduling with a free plan.",
      later: "Visual planning for Instagram- and TikTok-led content.",
      publer: "Affordable, with bulk tools and recycling.",
      pallyy: "Includes an inbox and client feedback links at a low price.",
      socialpilot: "Agency features and white-label reports on a budget.",
      sendible: "Agency client management with reporting.",
      agorapulse: "Top-tier inbox and ROI reporting.",
      metricool: "Deep analytics with a generous free plan.",
      socialbee: "Evergreen categories and an AI copilot.",
      "vista-social": "All-in-one with listening and reviews.",
    },
    verdict:
      "ContentStudio is the best Planable alternative if you want collaboration plus everything else in one subscription. Planable remains a great pick if approvals are truly the only thing you need.",
    faqs: [
      { q: "What is the best alternative to Planable?", a: "ContentStudio. It offers approval workflows and client approval links like Planable, plus a social inbox, content discovery, AI and analytics." },
      { q: "Is there a Planable alternative with a social inbox?", a: "ContentStudio, Agorapulse, Sendible, SocialPilot, Pallyy and Vista Social all include a unified inbox." },
      { q: "Is Planable free?", a: "Planable has a free plan capped at 50 total posts. Paid plans are priced per workspace." },
      { q: "Which Planable alternative is best for agencies?", a: "ContentStudio, with unlimited workspaces and white-label reports on its agency plan." },
    ],
  },
};

export const SUBJECT_ORDER = ["hootsuite", "sprout-social", "loomly", "sendible", "planable"];
