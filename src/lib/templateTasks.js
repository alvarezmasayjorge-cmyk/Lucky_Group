export const TEMPLATE_SECTIONS = [
  // ── Meta Ads ──
  { name: 'Onboarding Process', area: 'meta_ads' },
  { name: 'Facebook Ads Setup', area: 'meta_ads' },
  { name: 'Meta Business Setup', area: 'meta_ads' },
  { name: 'Pixel and Tracking', area: 'meta_ads' },
  { name: 'Video Ad Materials', area: 'meta_ads' },
  { name: 'Video Ad Creation', area: 'meta_ads' },
  // ── Google Ads ──
  { name: 'Google Ads', area: 'google_ads' },
  // ── SEO / AEO ──
  { name: 'Website SEO/AEO Set Up', area: 'seo' },
  // ── Go High Level ──
  { name: 'Funnels', area: 'ghl' },
  { name: 'AI Receptionist', area: 'ghl' },
];

export const TEMPLATE_TASKS = [
  // ── Onboarding Process ──
  { sectionName: 'Onboarding Process', title: 'Onboarding Form | GHL Creation & Access | AI Marketing Content Requirements emails', role: 'Project Manager' },
  { sectionName: 'Onboarding Process', title: 'Onboarding call', role: 'Project Manager' },
  { sectionName: 'Onboarding Process', title: 'Website Access', role: 'Project Manager' },
  { sectionName: 'Onboarding Process', title: 'Domain Access', role: 'Project Manager' },
  { sectionName: 'Onboarding Process', title: 'Offer Details', role: 'Project Manager' },
  { sectionName: 'Onboarding Process', title: 'A2P Registration', role: 'Project Manager' },

  // ── Facebook Ads Setup ──
  { sectionName: 'Facebook Ads Setup', title: 'Meta access (Business Manager, Ad Account, Page, IG)', role: 'Project Manager' },
  { sectionName: 'Facebook Ads Setup', title: 'Website access (pixel + domain verification)', role: 'Project Manager' },
  { sectionName: 'Facebook Ads Setup', title: 'Brand kit (logo, colors, fonts)', role: 'Project Manager' },
  { sectionName: 'Facebook Ads Setup', title: 'Target audience info', role: 'Project Manager' },
  { sectionName: 'Facebook Ads Setup', title: 'Budget & campaign goals', role: 'Project Manager' },

  // ── Meta Business Setup ──
  { sectionName: 'Meta Business Setup', title: 'Domain verification (Meta Business Manager)', role: 'Video Editor/Meta Specialist' },
  { sectionName: 'Meta Business Setup', title: 'Ad account setup (create/connect + payments)', role: 'Video Editor/Meta Specialist' },
  { sectionName: 'Meta Business Setup', title: 'Connect Facebook Page & Instagram', role: 'Video Editor/Meta Specialist' },
  { sectionName: 'Meta Business Setup', title: 'Assign team roles & permissions', role: 'Video Editor/Meta Specialist' },

  // ── Pixel and Tracking ──
  { sectionName: 'Pixel and Tracking', title: 'Create Facebook Pixel', role: 'Video Editor/Meta Specialist' },
  { sectionName: 'Pixel and Tracking', title: 'Install pixel on website (header code or via GTM)', role: 'GoHighLevel Specialist' },
  { sectionName: 'Pixel and Tracking', title: 'Set up standard events (PageView, Lead, Purchase, complete registration)', role: 'GoHighLevel Specialist' },
  { sectionName: 'Pixel and Tracking', title: 'Verify Pixel is firing correctly (Meta Pixel Helper)', role: 'GoHighLevel Specialist' },
  { sectionName: 'Pixel and Tracking', title: 'Set up conversions API (server side tracking)', role: 'GoHighLevel Specialist' },
  { sectionName: 'Pixel and Tracking', title: 'Define & configure UTM parameters for all URLs', role: 'Video Editor/Meta Specialist' },
  { sectionName: 'Pixel and Tracking', title: 'Test all events in Meta Events Manager', role: 'Video Editor/Meta Specialist' },

  // ── Video Ad Materials ──
  { sectionName: 'Video Ad Materials', title: 'Raw photo and video files', role: 'Project Manager' },
  { sectionName: 'Video Ad Materials', title: 'Voice Recording', role: 'Project Manager' },
  { sectionName: 'Video Ad Materials', title: 'Multi-angle portrait photos of the client', role: 'Project Manager' },

  // ── Video Ad Creation ── (kept for new client seeding)
  { sectionName: 'Video Ad Creation', title: 'Video Edits - Long Versions', role: 'Video Editor/Meta Specialist' },
  { sectionName: 'Video Ad Creation', title: 'Video Edits - Short Versions', role: 'Video Editor/Meta Specialist' },
  { sectionName: 'Video Ad Creation', title: 'Image ads creation', role: 'Video Editor/Meta Specialist' },

  // ── Google Ads ──
  { sectionName: 'Google Ads', title: 'Adv. Verification', role: 'Project Manager' },
  { sectionName: 'Google Ads', title: 'Connect Search Console to Google Ads', role: 'Project Manager' },
  { sectionName: 'Google Ads', title: 'Connect SiteKit (Google Tag)', role: 'GoHighLevel Specialist' },
  { sectionName: 'Google Ads', title: 'Google Tag Installation', role: 'Project Manager' },
  { sectionName: 'Google Ads', title: 'Install GHL # Script', role: 'GoHighLevel Specialist' },
  { sectionName: 'Google Ads', title: 'Map GHL Conv. > Google Ads', role: 'GoHighLevel Specialist' },
  { sectionName: 'Google Ads', title: 'Create Conv. Actions', role: 'Google Specialist' },
  { sectionName: 'Google Ads', title: 'Create Campaigns', role: 'Google Specialist' },
  { sectionName: 'Google Ads', title: 'Connect GMB to Google ads', role: 'Project Manager' },
  { sectionName: 'Google Ads', title: 'Create Assets', role: 'Google Specialist' },
  { sectionName: 'Google Ads', title: 'GA4 Connection (add Jens and LCG as Admins)', role: 'Project Manager' },
  { sectionName: 'Google Ads', title: 'GSC Connection (add Jens and LCG as Admins)', role: 'Project Manager' },
  { sectionName: 'Google Ads', title: 'Get LSA Approved', role: 'Project Manager' },
  { sectionName: 'Google Ads', title: 'Launch Campaigns', role: 'Google Specialist' },
  { sectionName: 'Google Ads', title: 'Launch Campaigns (LSA)', role: 'Project Manager' },

  // ── Website SEO/AEO Set Up ──
  { sectionName: 'Website SEO/AEO Set Up', title: 'Add luckyconsultinggroup@gmail.com & Jens as manager for GBP', role: 'Project Manager' },
  { sectionName: 'Website SEO/AEO Set Up', title: 'Geoscribe connection to WP site', role: 'Project Manager' },
  { sectionName: 'Website SEO/AEO Set Up', title: 'set up GBP automation', role: 'GoHighLevel Specialist' },
  { sectionName: 'Website SEO/AEO Set Up', title: 'set up SEO/AEO automation', role: 'GoHighLevel Specialist' },
  { sectionName: 'Website SEO/AEO Set Up', title: 'Create WP site if client doesn\'t have one', role: 'Project Manager' },

  // ── Funnels ──
  { sectionName: 'Funnels', title: 'Build funnel according to strategy', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'Client Assets', role: 'Project Manager' },
  { sectionName: 'Funnels', title: 'Purchase Lookalike Domain', role: 'Project Manager' },
  { sectionName: 'Funnels', title: 'Client Offer', role: 'Project Manager' },
  { sectionName: 'Funnels', title: 'Tracking code installation', role: 'GoHighLevel Specialist' },

  // ── Workflow Automation ──
  { sectionName: 'Funnels', title: 'CAPI Conversion', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'Google Number Pool Conversion', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'New Lead Optin - Did not schedule', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'Booked Appointment Reminder', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'No Show/Cancelled Appointment Win-back', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'Pipeline Changed To No Show/Cancelled', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'Lead to AI Outbound Call', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'Get and Place Call: Outbound + Inbound', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'Reactivation Call: Stale Customer', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'Lead Type Updater & Aging', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'Inbound Message Internal Notification', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'Missed Call Text Back', role: 'GoHighLevel Specialist' },

  // ── Tracking/Setup (GHL) ──
  { sectionName: 'Funnels', title: 'Integration', role: 'Project Manager' },
  { sectionName: 'Funnels', title: 'Integration (Meta)', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'Integrate Domain', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'Set and Validate Dedicated Sending Domain', role: 'GoHighLevel Specialist' },
  { sectionName: 'Funnels', title: 'A2P Application', role: 'Project Manager' },
  { sectionName: 'Funnels', title: 'Google Lead Event Creation', role: 'Google Specialist' },

  // ── AI Receptionist ──
  { sectionName: 'AI Receptionist', title: 'Prompt', role: 'GoHighLevel Specialist' },
  { sectionName: 'AI Receptionist', title: 'AI Receptionist Objective', role: 'GoHighLevel Specialist' },
  { sectionName: 'AI Receptionist', title: 'Retell Workspace', role: 'Project Manager' },
  { sectionName: 'AI Receptionist', title: 'Add Client Payment Method', role: 'Project Manager' },
  { sectionName: 'AI Receptionist', title: 'Purchase Number', role: 'GoHighLevel Specialist' },
];
