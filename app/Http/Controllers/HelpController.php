<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class HelpController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/help/page', [
            'sections' => $this->buildSections(),
        ]);
    }

    protected function buildSections(): array
    {
        return [
            [
                'id' => 'getting-started',
                'title' => 'Getting Started',
                'icon' => 'rocket',
                'description' => 'Learn the basics of MedPulse and start tracking visits in minutes.',
                'articles' => [
                    [
                        'title' => 'Welcome to MedPulse',
                        'content' => 'MedPulse is an AI-powered medical rep visit tracking platform. It helps pharmaceutical representatives log doctor visits, track objectives, measure efficiency scores, and receive AI coaching to improve performance.',
                    ],
                    [
                        'title' => 'Quick Start Guide',
                        'content' => "1. **Log in** with your credentials (manager or rep account).\n2. Navigate to **Log Visit** in the sidebar to record a new doctor visit.\n3. Select the doctor, set your objectives, and fill in the visit details.\n4. After submission, your **efficiency score** is calculated automatically.\n5. Visit the **Dashboard** to see your performance overview.\n6. Use **AI Coach** for personalized improvement suggestions.",
                    ],
                    [
                        'title' => 'Demo Accounts',
                        'content' => "This demo comes pre-seeded with accounts you can use:\n\n| Role | Email | Password |\n|------|-------|----------|\n| Manager | manager@medpulse.test | password |\n| Rep | sam@medpulse.test | password |\n| Rep | julia@medpulse.test | password |\n| Rep | priya@medpulse.test | password |\n\nManagers see the full territory overview. Reps see only their own data.",
                    ],
                ],
            ],
            [
                'id' => 'efficiency-score',
                'title' => 'Efficiency Score',
                'icon' => 'zap',
                'description' => 'Understand how the proprietary scoring algorithm rates every visit.',
                'articles' => [
                    [
                        'title' => 'The Formula',
                        'content' => "Each visit receives an efficiency score calculated as:\n\n**Score = (Weighted Outcome + Progress Bonus) × Difficulty Multiplier ÷ Time Factor × Confidence Adjustment**\n\nThis multi-factor formula ensures that every aspect of a visit—from meeting objectives to managing challenging doctors—is reflected in your performance score.",
                    ],
                    [
                        'title' => 'Weighted Outcome',
                        'content' => "Each objective you set for a visit has a **weight** (importance). Outcomes are scored:\n\n- **Met** → 1.0 points\n- **Partially Met** → 0.5 points\n- **Not Met** → 0.0 points\n\nThe weighted outcome = Σ(Outcome Score × Objective Weight) ÷ Σ(Objective Weight)\n\nHigher-weight objectives have more impact on your score.",
                    ],
                    [
                        'title' => 'Progress Bonus',
                        'content' => "You earn bonus points for:\n\n| Action | Bonus |\n|--------|-------|\n| Resistant → Neutral stance shift | +0.10 |\n| Neutral → Supportive stance shift | +0.15 |\n| Resistant → Supportive (big jump) | +0.25 |\n| Booked a concrete next step | +0.10 |\n| Closed a loop from prior visit | +0.10 |\n\nThese bonuses reward relationship-building and follow-through.",
                    ],
                    [
                        'title' => 'Difficulty Multiplier',
                        'content' => "Visiting harder-to-access doctors is rewarded:\n\n- **Easy** access → 0.90× multiplier\n- **Moderate** access → 1.00× multiplier\n- **Hard** access → 1.15× multiplier\n\nThis means successfully visiting difficult doctors gives you a 15% score boost.",
                    ],
                    [
                        'title' => 'Time Factor',
                        'content' => "Efficiency means achieving results in reasonable time. The time factor = √(minutes ÷ 15).\n\n- Visits ≤ 15 min: factor = 1.0 (no penalty)\n- 30 min visit: factor = 1.41\n- 60 min visit: factor = 2.0\n\nLonger visits are penalized, but via square root so it's gradual.",
                    ],
                    [
                        'title' => 'Confidence Adjustment',
                        'content' => "If you self-report your confidence level (0–100%):\n\n- 100% confidence → 1.0× (no adjustment)\n- 50% confidence → 0.925×\n- 0% confidence → 0.85×\n\nThis linearly scales from 0.85 to 1.0. Honest self-assessment is encouraged.",
                    ],
                ],
            ],
            [
                'id' => 'visit-workflow',
                'title' => 'Visit Workflow',
                'icon' => 'clipboard',
                'description' => 'Step-by-step guide to logging and managing doctor visits.',
                'articles' => [
                    [
                        'title' => 'Logging a Visit',
                        'content' => "Navigate to **Log Visit** from the sidebar. The form includes:\n\n1. **Doctor Selection** — Choose from your assigned doctor list\n2. **Visit Date & Time** — When the visit occurred\n3. **Time Spent** — Duration in minutes\n4. **Objectives** — Select the goals for this visit and rate outcomes (Met / Partially Met / Not Met)\n5. **Stance Tracking** — Record the doctor's stance before and after (Resistant / Neutral / Supportive)\n6. **Objection Tags** — Tag any objections encountered\n7. **Notes** — Free-form visit notes\n8. **Next Steps** — Plan concrete follow-up actions\n9. **Confidence** — Your self-assessed confidence (0–100%)",
                    ],
                    [
                        'title' => 'Visit Objectives',
                        'content' => "Objectives are predefined goals like *Product Presentation*, *Sample Drop*, *Clinical Data Sharing*, etc. Each has:\n\n- **Category**: Clinical, Commercial, Relationship\n- **Importance**: High, Standard, Low\n- **Weight**: Numerical impact on score (1.0–3.0)\n\nPick the objectives relevant to each visit and rate how well you achieved them.",
                    ],
                    [
                        'title' => 'Next Steps & Follow-ups',
                        'content' => "After each visit, create concrete next steps:\n\n- **Description**: What needs to happen\n- **Due Date**: When it should be completed\n- **Priority**: High, Medium, Low\n\nCompleting next steps before the due date earns you a **progress bonus** on future visits. Overdue next steps appear as warnings in your dashboard.",
                    ],
                ],
            ],
            [
                'id' => 'dashboard',
                'title' => 'Dashboard & Analytics',
                'icon' => 'layout',
                'description' => 'Navigate the dashboard and understand your analytics.',
                'articles' => [
                    [
                        'title' => 'Stats Overview',
                        'content' => "The top stats bar shows four key metrics:\n\n- **Total Visits**: Number of visits in the current period, with trend vs. prior period\n- **Active Reps**: (Managers) How many reps are actively logging visits\n- **Avg Efficiency**: Mean efficiency score across all visits, color-coded by performance\n- **Avg Visit Time**: Average duration, helps identify time management patterns\n\nEach stat shows a trend arrow (↑ or ↓) and percentage change.",
                    ],
                    [
                        'title' => 'Trend Charts',
                        'content' => "Two chart views available:\n\n- **Efficiency Trend**: Line chart showing average efficiency score over time (daily/weekly). Look for upward trends.\n- **Visit Volume**: Bar chart showing number of visits per period. Helps identify consistency patterns.\n\nUse these to track progress over weeks and months.",
                    ],
                    [
                        'title' => 'Doctor Heatmap',
                        'content' => "The heatmap shows visit distribution by day of week, helping you identify:\n\n- Which days have the most/fewest visits\n- Top doctors by visit frequency\n- Patterns in scheduling\n\nThe bar widths and colors indicate relative activity levels.",
                    ],
                    [
                        'title' => 'Rep Leaderboard',
                        'content' => "Visible to managers, the leaderboard ranks reps by efficiency score:\n\n- 🥇 **Gold crown**: #1 performer\n- 🥈 **Silver badge**: #2\n- 🥉 **Bronze badge**: #3\n\nScores are color-coded: Green (85+), Blue (70–84), Amber (55–69), Red (below 55). Trend arrows show improvement or decline.",
                    ],
                ],
            ],
            [
                'id' => 'ai-coach',
                'title' => 'AI Coach',
                'icon' => 'bot',
                'description' => 'Get AI-powered coaching insights and performance advice.',
                'articles' => [
                    [
                        'title' => 'How AI Coach Works',
                        'content' => "The AI Coach analyzes your visit data to generate personalized insights. It uses a **rule-based coaching engine** that evaluates:\n\n- Your efficiency scores and trends\n- Doctor relationship progress\n- Objective completion rates\n- Time management patterns\n- Follow-up completion rates\n\nInsights appear automatically on your dashboard and in the dedicated AI Coach chat.",
                    ],
                    [
                        'title' => 'Chat Interface',
                        'content' => "In the AI Coach page, you can ask questions like:\n\n- *\"How can I improve my score?\"*\n- *\"Which doctors need attention?\"*\n- *\"What objectives should I focus on?\"*\n- *\"How am I managing my time?\"*\n- *\"Show my follow-up status\"*\n- *\"Give me a performance summary\"*\n\nThe coach responds with data-driven advice specific to your visit history.",
                    ],
                    [
                        'title' => 'Quick Actions',
                        'content' => "The AI Coach sidebar shows quick action chips you can click:\n\n- **Improve Score** — Tips based on your weakest areas\n- **Doctor Tips** — Strategies for specific doctors\n- **Time Management** — Optimize visit durations\n- **Follow-ups** — Track pending and overdue next steps\n\nInsights are refreshed each time you visit the page.",
                    ],
                ],
            ],
            [
                'id' => 'roles',
                'title' => 'Roles & Permissions',
                'icon' => 'shield',
                'description' => 'Understand the different user roles and what they can access.',
                'articles' => [
                    [
                        'title' => 'Manager Role',
                        'content' => "Managers have full territory oversight:\n\n- View **all reps'** visits, scores, and analytics\n- See the **Rep Leaderboard** with rankings\n- Access **territory-wide** coaching insights\n- View aggregated stats across all reps\n- Monitor doctor relationships across the team\n\nManagers can identify underperforming reps and allocate coaching resources.",
                    ],
                    [
                        'title' => 'Rep Role',
                        'content' => "Reps see their own performance data:\n\n- Personal visit history and efficiency scores\n- Individual dashboard analytics\n- Personal AI coaching insights\n- Their own doctor relationships\n- Their own next steps and follow-ups\n\nReps can focus on self-improvement without distraction from others' data.",
                    ],
                ],
            ],
            [
                'id' => 'doctors',
                'title' => 'Doctor Management',
                'icon' => 'stethoscope',
                'description' => 'Manage doctor profiles, segments, and track relationships.',
                'articles' => [
                    [
                        'title' => 'Doctor Profiles',
                        'content' => "Each doctor has a detailed profile with:\n\n- **Name & Specialty**: Basic identification\n- **Institution & Location**: Where they practice\n- **Segment** (A/B/C): Priority tier (A = highest priority)\n- **Stance**: Current relationship status (Supportive / Neutral / Resistant)\n- **Access Difficulty**: How hard it is to get a meeting (Easy / Moderate / Hard)\n\nThese attributes influence your efficiency score calculations.",
                    ],
                    [
                        'title' => 'Segments Explained',
                        'content' => "Doctors are segmented by business priority:\n\n| Segment | Priority | Score Weight | Description |\n|---------|----------|-------------|-------------|\n| **A** | Highest | 1.5× | Key opinion leaders, high prescribers |\n| **B** | Medium | 1.0× | Regular prescribers |\n| **C** | Lower | 0.7× | Low-volume or new relationships |\n\nVisiting Segment A doctors contributes 1.5× more to your rep efficiency score.",
                    ],
                    [
                        'title' => 'Stance Tracking',
                        'content' => "Track how each doctor's attitude evolves:\n\n- **Resistant**: Skeptical or opposed to your products\n- **Neutral**: Open but uncommitted\n- **Supportive**: Actively prescribing or recommending\n\nStance improvements during visits earn **progress bonuses** on your efficiency score. The AI Coach monitors stance trends and suggests strategies.",
                    ],
                ],
            ],
        ];
    }
}
