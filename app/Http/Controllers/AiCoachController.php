<?php

namespace App\Http\Controllers;

use App\Models\DoctorProfile;
use App\Models\Medication;
use App\Models\NextStep;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitObjective;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AiCoachController extends Controller
{
    /**
     * Show the AI coaching page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isManager = $user->hasPermissionTo('view team dashboard');

        return Inertia::render('dashboard/ai-coach/page', [
            'insights' => $this->generateInsights($user, $isManager),
            'quickActions' => $this->getQuickActions($user, $isManager),
            'chatHistory' => [],
        ]);
    }

    /**
     * Handle an AI coaching "question" (server-side generated responses).
     */
    public function ask(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate(['message' => 'required|string|max:500']);

        $user = $request->user();
        $isManager = $user->hasPermissionTo('view team dashboard');
        $message = strtolower($request->input('message'));

        $response = $this->generateResponse($message, $user, $isManager);

        return response()->json([
            'reply' => $response['reply'],
            'actions' => $response['actions'] ?? [],
        ]);
    }

    // -----------------------------------------------------------------
    //  Insight generation (rule-based AI — no external API needed)
    // -----------------------------------------------------------------

    private function generateInsights($user, bool $isManager): array
    {
        $insights = [];

        if ($isManager) {
            $insights = array_merge(
                $insights,
                $this->managerInsights(),
            );
        } else {
            $insights = array_merge(
                $insights,
                $this->repInsights($user),
            );
        }

        return $insights;
    }

    private function managerInsights(): array
    {
        $insights = [];

        // Reps with declining scores
        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            $recent = 'date("now", "-14 days")';
            $older = 'date("now", "-28 days")';
        } else {
            $recent = 'DATE_SUB(NOW(), INTERVAL 14 DAY)';
            $older = 'DATE_SUB(NOW(), INTERVAL 28 DAY)';
        }

        $decliningReps = DB::table('visits')
            ->select('rep_id')
            ->selectRaw("AVG(CASE WHEN visit_date >= {$recent} THEN efficiency_score END) as recent_avg")
            ->selectRaw("AVG(CASE WHEN visit_date < {$recent} AND visit_date >= {$older} THEN efficiency_score END) as older_avg")
            ->whereNotNull('efficiency_score')
            ->groupBy('rep_id')
            ->havingRaw('recent_avg < older_avg * 0.85')
            ->get();

        if ($decliningReps->count() > 0) {
            $insights[] = [
                'type' => 'warning',
                'icon' => 'alert',
                'title' => 'Performance Decline Detected',
                'message' => $decliningReps->count().' rep(s) show declining efficiency scores over the past 2 weeks. Consider scheduling one-on-one coaching sessions.',
                'priority' => 'high',
            ];
        }

        // Open loops overdue
        $overdueLoops = NextStep::where('is_completed', false)
            ->where('due_date', '<', now())
            ->count();

        if ($overdueLoops > 0) {
            $insights[] = [
                'type' => 'action',
                'icon' => 'clock',
                'title' => $overdueLoops.' Overdue Follow-ups',
                'message' => 'There are open next-steps that have passed their due dates. Prompt your team to close these loops to maintain doctor relationships.',
                'priority' => 'high',
            ];
        }

        // Resistant doctors that haven't been visited
        $neglectedResistant = DoctorProfile::where('stance', 'resistant')
            ->whereDoesntHave('visits', fn ($q) => $q->where('visit_date', '>=', now()->subDays(21)))
            ->count();

        if ($neglectedResistant > 0) {
            $insights[] = [
                'type' => 'strategy',
                'icon' => 'target',
                'title' => 'Resistant Doctors Need Attention',
                'message' => $neglectedResistant.' resistant-stance doctors haven\'t been visited in 3+ weeks. Assign experienced reps with objection-handling objectives.',
                'priority' => 'medium',
            ];
        }

        // Top performing pattern
        $topVisits = Visit::whereNotNull('efficiency_score')
            ->where('efficiency_score', '>=', 0.8)
            ->where('visit_date', '>=', now()->subDays(30))
            ->count();

        $totalVisits = Visit::where('visit_date', '>=', now()->subDays(30))->count();

        if ($totalVisits > 0) {
            $rate = round(($topVisits / $totalVisits) * 100);
            $insights[] = [
                'type' => 'success',
                'icon' => 'trending-up',
                'title' => 'High-Performance Rate: '.$rate.'%',
                'message' => $topVisits.' of '.$totalVisits.' visits scored above 0.80 efficiency. '.($rate >= 50 ? 'Excellent performance!' : 'Aim for 50%+ high-performance visits.'),
                'priority' => 'low',
            ];
        }

        return $insights;
    }

    private function repInsights($user): array
    {
        $insights = [];

        $recentVisits = Visit::forRep($user->id)
            ->whereNotNull('efficiency_score')
            ->orderByDesc('visit_date')
            ->limit(10)
            ->get();

        if ($recentVisits->isEmpty()) {
            $insights[] = [
                'type' => 'action',
                'icon' => 'plus',
                'title' => 'Get Started',
                'message' => 'Log your first doctor visit to start receiving personalized coaching insights.',
                'priority' => 'high',
            ];

            return $insights;
        }

        // Average score trend
        $avgScore = $recentVisits->avg('efficiency_score');
        if ($avgScore < 0.5) {
            $insights[] = [
                'type' => 'coaching',
                'icon' => 'brain',
                'title' => 'Score Improvement Tips',
                'message' => 'Your average efficiency is '.round($avgScore, 2).'. Focus on: (1) choosing high-importance objectives, (2) keeping visits under 20 minutes, (3) booking follow-up next steps.',
                'priority' => 'high',
            ];
        } elseif ($avgScore >= 0.75) {
            $insights[] = [
                'type' => 'success',
                'icon' => 'trophy',
                'title' => 'Top Performer!',
                'message' => 'Your efficiency average of '.round($avgScore, 2).' puts you in the top tier. Keep leveraging high-value objectives and efficient time management.',
                'priority' => 'low',
            ];
        }

        // Overdue next steps for this rep
        $myOverdue = NextStep::whereHas('visit', fn ($q) => $q->where('rep_id', $user->id))
            ->where('is_completed', false)
            ->where('due_date', '<', now())
            ->count();

        if ($myOverdue > 0) {
            $insights[] = [
                'type' => 'warning',
                'icon' => 'alert',
                'title' => $myOverdue.' Overdue Follow-up'.($myOverdue > 1 ? 's' : ''),
                'message' => 'Complete these to boost your continuity scores and maintain doctor relationships.',
                'priority' => 'high',
            ];
        }

        // Objective outcome analysis
        $metRate = VisitObjective::whereHas('visit', fn ($q) => $q->where('rep_id', $user->id)->where('visit_date', '>=', now()->subDays(30)))
            ->where('outcome', 'met')
            ->count();

        $totalObjectives = VisitObjective::whereHas('visit', fn ($q) => $q->where('rep_id', $user->id)->where('visit_date', '>=', now()->subDays(30)))
            ->count();

        if ($totalObjectives > 0) {
            $objRate = round(($metRate / $totalObjectives) * 100);
            $insights[] = [
                'type' => $objRate >= 60 ? 'success' : 'coaching',
                'icon' => 'target',
                'title' => 'Objective Met Rate: '.$objRate.'%',
                'message' => $objRate >= 60
                    ? 'Strong objective completion. '.$metRate.'/'.$totalObjectives.' objectives fully met.'
                    : 'Try preparing specific talking points before visits. Focus on 1-2 high-weight objectives per visit.',
                'priority' => 'medium',
            ];
        }

        return $insights;
    }

    // -----------------------------------------------------------------
    //  Chat response generation (rule-based)
    // -----------------------------------------------------------------

    private function generateResponse(string $message, $user, bool $isManager): array
    {
        // Medication queries — most specific, check first
        if ($this->matchesIntent($message, [
            'medication', 'drug', 'medicine', 'pill', 'tablet', 'capsule',
            'side effect', 'dosage', 'dose', 'interaction', 'contraindication',
            'prescri', 'pharma', 'therapeutic', 'indication',
            'statin', 'metformin', 'omeprazole', 'amlodipine', 'sertraline',
            'lipitor', 'glucophage', 'norvasc', 'prilosec', 'zoloft', 'atorvastatin',
        ])) {
            return $this->medicationHelp($message);
        }

        // Score / efficiency help
        if ($this->matchesIntent($message, [
            'score', 'efficiency', 'improve', 'better', 'boost', 'increase',
            'higher', 'raise', 'low score', 'bad score', 'poor', 'rating',
            'metric', 'kpi', 'formula', 'calculation', 'how is.*calculated',
            'what affects', 'why.*low', 'tips', 'advice', 'help me',
        ])) {
            return $this->scoreHelp($user);
        }

        // Doctor advice
        if ($this->matchesIntent($message, [
            'doctor', 'physician', 'resistant', 'difficult', 'hard to reach',
            'stance', 'neutral', 'advocate', 'champion', 'access',
            'specialist', 'territory', 'hcp', 'healthcare provider',
            'convince', 'persuade', 'approach', 'strategy.*doctor',
        ])) {
            return $this->doctorAdvice($user);
        }

        // Objective help
        if ($this->matchesIntent($message, [
            'objective', 'goal', 'target', 'plan', 'prepare', 'prep',
            'which.*focus', 'what.*focus', 'prioriti', 'weight',
            'clinical data', 'objection handling', 'formulary',
            'product introduction', 'sample delivery',
        ])) {
            return $this->objectiveHelp($user);
        }

        // Time management
        if ($this->matchesIntent($message, [
            'time', 'minutes', 'duration', 'long', 'short', 'quick',
            'fast', 'speed', 'how long', 'too long', 'visit length',
            'schedule', 'calendar', 'busy', 'efficient.*time',
        ])) {
            return $this->timeHelp($user);
        }

        // Next steps / follow up
        if ($this->matchesIntent($message, [
            'follow', 'next step', 'loop', 'overdue', 'pending',
            'due', 'reminder', 'callback', 'revisit', 'check back',
            'open loop', 'close.*loop', 'task', 'to-?do',
        ])) {
            return $this->followUpHelp($user);
        }

        // Performance overview
        if ($this->matchesIntent($message, [
            'performance', 'how am i', 'overview', 'stats', 'summary',
            'dashboard', 'report', 'progress', 'how.*doing', 'my.*number',
            'analytics', 'result', 'track', 'history', 'tell me about me',
        ])) {
            return $this->performanceOverview($user);
        }

        // Visit logging help
        if ($this->matchesIntent($message, [
            'how.*log', 'how.*record', 'new visit', 'log.*visit', 'check.?in',
            'record.*visit', 'create.*visit', 'add.*visit', 'submit.*visit',
            'how.*use', 'how.*start', 'getting started', 'tutorial',
        ])) {
            return $this->visitLoggingHelp();
        }

        // Competitive / battle card info
        if ($this->matchesIntent($message, [
            'competi', 'battle card', 'vs', 'versus', 'differenti',
            'advantage', 'unique selling', 'usp', 'compare', 'comparison',
            'why.*better', 'switch', 'alternative',
        ])) {
            return $this->competitiveHelp();
        }

        // Rapport / relationship building
        if ($this->matchesIntent($message, [
            'rapport', 'relationship', 'trust', 'connect', 'bond',
            'small talk', 'conversation', 'engage', 'empathy',
            'build.*relationship', 'first.*impression', 'ice.*break',
        ])) {
            return $this->rapportHelp();
        }

        // Objection handling tips
        if ($this->matchesIntent($message, [
            'objection', 'pushback', 'refuse', 'reject', 'no interest',
            'not interested', 'handle.*objection', 'overcome', 'rebut',
            'counter.*argument', 'skeptic',
        ])) {
            return $this->objectionHandlingHelp();
        }

        // Segmentation / territory
        if ($this->matchesIntent($message, [
            'segment', 'tier', 'a-tier', 'b-tier', 'c-tier', 'territory',
            'prioriti.*doctor', 'high.*value', 'key.*account', 'abc',
        ])) {
            return $this->segmentationHelp($user);
        }

        // What can you do / capabilities
        if ($this->matchesIntent($message, [
            'what can you', 'what do you', 'your capabilities', 'features',
            'how can you help', 'what.*you.*do', 'menu', 'options',
            'commands', 'abilities',
        ])) {
            return $this->capabilitiesHelp();
        }

        // Greeting / small talk — give a friendly reply instead of showing a menu
        if ($this->matchesIntent($message, [
            'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
            'sup', 'what\'s up', 'yo', 'howdy', 'greetings',
        ])) {
            $greetings = [
                'Hey there! 👋 How can I help you today?',
                'Hello! 🙌 Ready to help you crush your targets.',
                'Hi! 👋 What can I assist you with?',
                'Hey! 😊 Got a question about your visits, scores, or medications?',
            ];

            return [
                'reply' => $greetings[array_rand($greetings)]."\n\n".
                    'You can ask me about your **scores**, **doctors**, **objectives**, **follow-ups**, **medications**, or just say "How am I doing?" for a quick overview.',
                'actions' => [],
            ];
        }

        // Thank you
        if ($this->matchesIntent($message, ['thank', 'thanks', 'thx', 'cheers', 'appreciate'])) {
            $replies = [
                "You're welcome! 🙌 Let me know if you need anything else.",
                'Happy to help! 😊 Good luck out there.',
                'Anytime! Feel free to ask me anything else.',
                'No problem! 👍 Keep up the great work.',
            ];

            return [
                'reply' => $replies[array_rand($replies)],
                'actions' => [],
            ];
        }

        // Goodbye
        if ($this->matchesIntent($message, ['bye', 'goodbye', 'see you', 'later', 'gotta go', 'cya', 'take care'])) {
            return [
                'reply' => "See you later! 👋 Good luck with your visits today. Remember, I'm always here if you need a quick tip.",
                'actions' => [],
            ];
        }

        // Fun / personality
        if ($this->matchesIntent($message, ['joke', 'funny', 'laugh', 'humor', 'entertain'])) {
            $jokes = [
                "Why did the medical rep bring a ladder to the clinic? Because the doctor's expectations were always high! 😄",
                "What's a rep's favorite exercise? Follow-ups! 🏃",
                "Why don't reps ever get lost? Because they always have a next step! 🗺️",
            ];

            return [
                'reply' => $jokes[array_rand($jokes)]."\n\nNow, anything work-related I can help with? 😊",
                'actions' => [],
            ];
        }

        // Default — better guidance with more options
        return [
            'reply' => "I'm not sure I understood that. Here's everything I can help with:\n\n".
                "📊 **\"How can I improve my scores?\"** — Personalized efficiency tips\n".
                "🩺 **\"Doctor strategies\"** — Handling resistant doctors\n".
                "🎯 **\"Objective planning\"** — Which objectives to focus on\n".
                "⏱️ **\"Time management\"** — Optimal visit duration\n".
                "🔄 **\"My follow-ups\"** — Open loops & next steps\n".
                "📈 **\"How am I doing?\"** — 30-day performance overview\n".
                "💊 **\"Tell me about [medication]\"** — Drug information\n".
                "🤝 **\"Rapport tips\"** — Building doctor relationships\n".
                "🛡️ **\"Objection handling\"** — Overcoming pushback\n".
                "📝 **\"How to log a visit\"** — Step-by-step guide\n".
                "⚔️ **\"Competitive advantage\"** — Differentiation tips\n\n".
                'Try rephrasing, or tap one of the quick actions below!',
            'actions' => [],
        ];
    }

    /**
     * Help with logging visits.
     */
    private function visitLoggingHelp(): array
    {
        return [
            'reply' => "📝 **How to Log a Visit:**\n\n".
                "1. Go to **Check-in** from the sidebar or dashboard\n".
                "2. **Select a doctor** — this loads their context (stance, difficulty, history)\n".
                "3. **Choose objectives** — pick 1-3 objectives to discuss. High-weight ones (Clinical Data, Objection Handling) score higher\n".
                "4. **Set outcomes** — for each objective, mark if it was Fully Met, Partially Met, or Not Met\n".
                "5. **Record details** — time spent, engagement quality, confidence level\n".
                "6. **Doctor stance** — note any shift (resistant → neutral = +0.10 bonus!)\n".
                "7. **Next step** — always book a follow-up for +0.10 progress bonus\n".
                "8. **Submit** — your efficiency score calculates automatically!\n\n".
                '💡 **Pro tip:** Log visits right after they happen while details are fresh.',
            'actions' => [
                ['label' => 'Log a Visit Now', 'href' => '/visits/create'],
            ],
        ];
    }

    /**
     * Competitive differentiation tips.
     */
    private function competitiveHelp(): array
    {
        return [
            'reply' => "⚔️ **Competitive Differentiation Tips:**\n\n".
                "**When a doctor uses a competitor's product:**\n".
                "1. Don't bash the competition — acknowledge their product's role\n".
                "2. Focus on **unmet needs** — what does the competitor NOT address?\n".
                "3. Use **clinical data** as your differentiator — objective evidence beats opinions\n".
                "4. Ask \"What would you change?\" — let the doctor identify gaps themselves\n".
                "5. Position your product as **complementary**, not just replacement\n\n".
                "**Battle card framework:**\n".
                "• **Know:** Their product's strengths and weaknesses\n".
                "• **Lead:** With YOUR unique clinical advantage\n".
                "• **Evidence:** Have 2-3 studies ready to reference\n".
                "• **Bridge:** \"Many doctors in [specialty] have found…\"\n\n".
                '*Use the Competitive Differentiation objective when you plan to discuss these points.*',
            'actions' => [
                ['label' => 'Log a Visit', 'href' => '/visits/create'],
            ],
        ];
    }

    /**
     * Rapport building tips.
     */
    private function rapportHelp(): array
    {
        return [
            'reply' => "🤝 **Building Doctor Relationships:**\n\n".
                "**First visits:**\n".
                "• Research the doctor's publications and interests beforehand\n".
                "• Lead with a genuine question, not a pitch\n".
                "• Respect their time — keep it under 10 minutes\n".
                "• Leave something valuable (relevant study, not just samples)\n\n".
                "**Building trust over time:**\n".
                "1. **Consistency** — show up when you say you will\n".
                "2. **Follow through** — always complete your next steps\n".
                "3. **Listen more than talk** — note their concerns and address them next visit\n".
                "4. **Add value** — share relevant CME opportunities, patient resources\n".
                "5. **Be honest** — if you don't know, say so and follow up\n\n".
                "**Shifting stance (resistant → neutral → supportive):**\n".
                "• It takes 3-5 consistent, value-adding visits\n".
                "• Each shift earns you +0.10 on your efficiency score\n".
                "• Focus on their patients' outcomes, not product features",
            'actions' => [
                ['label' => 'View Doctors', 'href' => '/doctors'],
            ],
        ];
    }

    /**
     * Objection handling tips.
     */
    private function objectionHandlingHelp(): array
    {
        return [
            'reply' => "🛡️ **Objection Handling Framework:**\n\n".
                "Use the **LAER** method:\n\n".
                "**L — Listen:** Let the doctor finish without interrupting. Repeat back what they said.\n\n".
                "**A — Acknowledge:** \"I understand your concern about…\" Validate their perspective.\n\n".
                "**E — Explore:** \"Can you tell me more about…?\" Dig deeper to find the real objection.\n\n".
                "**R — Respond:** Address with evidence. Use clinical data, not marketing claims.\n\n".
                "**Common objections & responses:**\n\n".
                "| Objection | Response Strategy |\n".
                "|-----------|------------------|\n".
                "| \"I'm happy with current treatment\" | Ask about unmet patient needs |\n".
                "| \"Too expensive\" | Discuss value + patient outcomes |\n".
                "| \"Not enough evidence\" | Share recent clinical studies |\n".
                "| \"Side effect concerns\" | Compare safety profiles with data |\n".
                "| \"No time to discuss\" | Request brief follow-up slot |\n\n".
                '*Tag objections in your visit log — this helps track patterns across doctors.*',
            'actions' => [
                ['label' => 'Log a Visit', 'href' => '/visits/create'],
            ],
        ];
    }

    /**
     * Doctor segmentation help.
     */
    private function segmentationHelp($user): array
    {
        $segments = DoctorProfile::selectRaw('segment, COUNT(*) as count')
            ->groupBy('segment')
            ->pluck('count', 'segment')
            ->toArray();

        $segA = $segments['A'] ?? 0;
        $segB = $segments['B'] ?? 0;
        $segC = $segments['C'] ?? 0;

        return [
            'reply' => "📊 **Doctor Segmentation Guide:**\n\n".
                "| Segment | Priority | Visit Frequency | Current Count |\n".
                "|---------|----------|-----------------|---------------|\n".
                "| **A (High)** | 🔴 Top priority | 2-3x/month | {$segA} doctors |\n".
                "| **B (Medium)** | 🟡 Regular | 1-2x/month | {$segB} doctors |\n".
                "| **C (Low)** | 🟢 Maintenance | 1x/month or less | {$segC} doctors |\n\n".
                "**Segmentation strategy:**\n".
                "• Spend **60%** of your time on Segment A doctors\n".
                "• Spend **30%** on Segment B — these are your growth opportunities\n".
                "• Spend **10%** on Segment C — maintain relationships\n\n".
                "**Moving doctors up:**\n".
                "• Track prescription volume and advocacy\n".
                "• A neutral-to-supportive shift often correlates with segment upgrade\n".
                '• Use the difficulty multiplier — hard-access A-tier doctors boost your score by 1.15×',
            'actions' => [
                ['label' => 'View Doctors', 'href' => '/doctors'],
            ],
        ];
    }

    /**
     * What the AI can do.
     */
    private function capabilitiesHelp(): array
    {
        return [
            'reply' => "🤖 **Here's everything I can help you with:**\n\n".
                "📊 **Efficiency Scores** — Tips to improve, formula explained, personalized advice\n".
                "🩺 **Doctor Strategies** — Handling resistant docs, access tips, stance-shifting\n".
                "🎯 **Objectives** — Which to focus on, weight explained, planning visits\n".
                "⏱️ **Time Management** — Optimal visit length, scheduling tips\n".
                "🔄 **Follow-ups** — Your open loops, overdue items, completion tips\n".
                "📈 **Performance** — 30-day overview, trends, comparative stats\n".
                "💊 **Medications** — Drug info, dosage, side effects, interactions\n".
                "🤝 **Rapport Building** — Relationship tips, trust building, first impressions\n".
                "🛡️ **Objection Handling** — LAER method, common objections, responses\n".
                "⚔️ **Competitive Intel** — Differentiation tips, battle card framework\n".
                "📊 **Segmentation** — A/B/C tiers, visit frequency, territory planning\n".
                "📝 **Visit Logging** — Step-by-step guide to check-in\n\n".
                "Just ask naturally — I'll figure out what you need! 💡",
            'actions' => [],
        ];
    }

    /**
     * Check if the message matches any of the given keywords/patterns.
     */
    private function matchesIntent(string $message, array $patterns): bool
    {
        foreach ($patterns as $pattern) {
            if (str_contains($pattern, '.*')) {
                // Regex pattern
                if (preg_match('/'.$pattern.'/i', $message)) {
                    return true;
                }
            } else {
                if (str_contains($message, $pattern)) {
                    return true;
                }
            }
        }

        return false;
    }

    private function medicationHelp(string $message): array
    {
        // Try to find a specific medication
        $medications = Medication::all();

        // Check if the query is about a specific medication
        $matchedMed = null;
        foreach ($medications as $med) {
            $searchTerms = [
                strtolower($med->name),
                strtolower($med->generic_name ?? ''),
            ];
            foreach ($searchTerms as $term) {
                if ($term && (str_contains($message, $term) || str_contains($term, $message))) {
                    $matchedMed = $med;
                    break 2;
                }
            }
            // Also match partial brand names in parentheses
            if (preg_match('/\((.+?)\)/', $med->name, $matches)) {
                if (str_contains($message, strtolower($matches[1]))) {
                    $matchedMed = $med;
                    break;
                }
            }
        }

        if ($matchedMed) {
            $sections = [];
            $sections[] = "💊 **{$matchedMed->name}**";
            if ($matchedMed->generic_name) {
                $sections[] = "**Generic:** {$matchedMed->generic_name}";
            }
            $sections[] = "\n{$matchedMed->description}";

            if ($matchedMed->indications) {
                $sections[] = "\n**Indications:**\n{$matchedMed->indications}";
            }
            if ($matchedMed->dosage) {
                $sections[] = "\n**Dosage:**\n{$matchedMed->dosage}";
            }
            if ($matchedMed->side_effects) {
                $sections[] = "\n⚠️ **Side Effects:**\n{$matchedMed->side_effects}";
            }
            if ($matchedMed->contraindications) {
                $sections[] = "\n🔗 **Contraindications / Interactions:**\n{$matchedMed->contraindications}";
            }

            return [
                'reply' => implode("\n", $sections),
                'actions' => [
                    ['label' => 'View All Medications', 'href' => '/medications'],
                ],
            ];
        }

        // Check if the user asked about a SPECIFIC medication that we don't have
        // Extract the medication name from the query
        $askedMedName = $this->extractMedicationName($message);

        if ($askedMedName && $medications->isNotEmpty()) {
            // User asked about a specific med we don't have — notify admins
            $this->notifyAdminsUnknownMedication($askedMedName, auth()->user());

            return [
                'reply' => "💊 I don't have information about **\"{$askedMedName}\"** in our database.\n\n".
                    "I've flagged this for the admin team so they can add it. In the meantime, you can check the medications page for what's currently available.\n\n".
                    "**Currently in the database ({$medications->count()}):**\n".
                    $medications->take(5)->map(fn ($m) => "• {$m->name}")->implode("\n").
                    ($medications->count() > 5 ? "\n• ...and ".($medications->count() - 5).' more' : ''),
                'actions' => [
                    ['label' => 'View Medications', 'href' => '/medications'],
                ],
            ];
        }

        // General medication list
        if ($medications->isEmpty()) {
            return [
                'reply' => '💊 No medications have been added to the database yet. A manager or admin can import medication PDFs from the Medications page.',
                'actions' => [
                    ['label' => 'Medications Page', 'href' => '/medications'],
                ],
            ];
        }

        $medList = $medications->map(fn ($m) => "• **{$m->name}** — ".($m->generic_name ?? 'N/A'))->implode("\n");

        return [
            'reply' => "💊 **Available Medications ({$medications->count()}):**\n\n{$medList}\n\n".
                "Ask about a specific medication for detailed information including indications, dosage, side effects, and contraindications.\n\n".
                '*Example: "Tell me about Atorvastatin" or "What are the side effects of Metformin?"*',
            'actions' => [
                ['label' => 'View Medications', 'href' => '/medications'],
            ],
        ];
    }

    private function scoreHelp($user): array
    {
        $recentVisits = Visit::forRep($user->id)
            ->whereNotNull('efficiency_score')
            ->orderByDesc('visit_date')
            ->limit(5)
            ->get();

        $avg = $recentVisits->avg('efficiency_score') ?? 0;

        $tips = [];
        if ($avg < 0.5) {
            $tips = [
                'Choose **high-importance** objectives (Clinical Data, Objection Handling) — they carry 1.3× weight',
                'Keep visits **under 20 minutes** — the time factor penalizes long visits',
                'Always book a **follow-up next step** for +0.10 progress bonus',
                'Set your confidence slider honestly — but aim for 70%+ through better preparation',
            ];
        } else {
            $tips = [
                'Target **hard-to-access** doctors — they give a 1.15× difficulty multiplier',
                'Try to shift doctor stance (resistant → neutral = +0.10 bonus)',
                'Close open loops from previous visits (+0.10 continuity bonus)',
                'Maintain visit efficiency by keeping meetings focused and under 15 minutes',
            ];
        }

        return [
            'reply' => '📊 **Your Recent Efficiency: '.round($avg, 2)."**\n\n".
                ($avg < 0.5 ? "Let's work on improving that! Here are targeted tips:\n\n" : "Good score! Here's how to push even higher:\n\n").
                implode("\n", array_map(fn ($t, $i) => ($i + 1).'. '.$t, $tips, array_keys($tips))).
                "\n\n*The efficiency formula rewards objective completion, brevity, and continuity.*",
            'actions' => [
                ['label' => 'Log a Visit', 'href' => '/visits/create'],
                ['label' => 'View My Visits', 'href' => '/visits'],
            ],
        ];
    }

    private function doctorAdvice($user): array
    {
        $resistantDocs = DoctorProfile::where('stance', 'resistant')
            ->with('user:id,name')
            ->limit(5)
            ->get();

        $docList = $resistantDocs->map(fn ($d) => '• **'.$d->display_name.'** ('.$d->specialty.') — '.$d->access_difficulty.' access')->implode("\n");

        return [
            'reply' => "🩺 **Strategies for Difficult Doctors:**\n\n".
                "**For resistant-stance doctors:**\n".
                "1. Lead with **clinical data** — they respond to evidence, not sales pitches\n".
                "2. Use the **Objection Handling** objective to directly address their concerns\n".
                "3. Keep visits short (10-15 min) — respect their time to build trust\n".
                "4. Book a **follow-up** to show commitment\n\n".
                ($docList ? "**Current resistant doctors in your territory:**\n".$docList : 'No resistant doctors found in the database.').
                "\n\n*Shifting a doctor from resistant → neutral adds +0.10 to your efficiency score!*",
            'actions' => [
                ['label' => 'View Doctors', 'href' => '/doctors'],
            ],
        ];
    }

    private function objectiveHelp($user): array
    {
        return [
            'reply' => "🎯 **Objective Strategy Guide:**\n\n".
                "**High-weight objectives (1.3×):**\n".
                "• Clinical Data Presentation\n".
                "• Objection Handling\n".
                "• Formulary Request\n".
                "• Safety/Compliance Update\n\n".
                "**Standard objectives (1.0×):**\n".
                "• Product Introduction\n".
                "• Follow-up Discussion\n".
                "• Patient Case Review\n".
                "• Competitive Differentiation\n\n".
                "**Low-weight objectives (0.7×):**\n".
                "• Sample Delivery\n".
                "• Relationship Building\n\n".
                '**Pro tip:** Always include at least one high-weight objective per visit. Fully meeting a 1.3× objective significantly boosts your efficiency score.',
            'actions' => [
                ['label' => 'Log a Visit', 'href' => '/visits/create'],
            ],
        ];
    }

    private function timeHelp($user): array
    {
        $avgTime = Visit::forRep($user->id)
            ->whereNotNull('time_spent_minutes')
            ->where('visit_date', '>=', now()->subDays(30))
            ->avg('time_spent_minutes');

        $avgStr = $avgTime ? round($avgTime).' minutes' : 'unknown (log more visits)';

        return [
            'reply' => "⏱️ **Time Management:**\n\n".
                'Your average visit time: **'.$avgStr."**\n\n".
                "The scoring formula uses `sqrt(minutes / 15)` as a time penalty:\n".
                "• **15 min or less** → no penalty (factor = 1.0)\n".
                "• **30 min** → factor = 1.41 (29% reduction)\n".
                "• **60 min** → factor = 2.0 (50% reduction)\n\n".
                "**Tips for shorter, effective visits:**\n".
                "1. Prepare 2-3 key talking points before arriving\n".
                "2. Lead with the most important objective first\n".
                "3. Use a \"one thing\" close — ask for one specific action\n".
                '4. Schedule follow-ups instead of extending the current visit',
            'actions' => [
                ['label' => 'View My Visits', 'href' => '/visits'],
            ],
        ];
    }

    private function followUpHelp($user): array
    {
        $openLoops = NextStep::whereHas('visit', fn ($q) => $q->where('rep_id', $user->id))
            ->where('is_completed', false)
            ->orderBy('due_date')
            ->limit(5)
            ->get();

        $loopList = $openLoops->map(fn ($ns) => '• '.$ns->description.' — Due: '.($ns->due_date?->format('M d') ?? 'No date').($ns->due_date?->isPast() ? ' ⚠️ **OVERDUE**' : ''))->implode("\n");

        return [
            'reply' => "🔄 **Follow-up & Next Steps:**\n\n".
                ($openLoops->count() > 0
                    ? '**Your open loops ('.$openLoops->count()."):**\n".$loopList."\n\n"
                    : "✅ No open loops — you're all caught up!\n\n").
                "**Why follow-ups matter:**\n".
                "• Booking a next step adds **+0.10** to your efficiency score\n".
                "• Completing a loop from a previous visit adds another **+0.10**\n".
                "• Consistent follow-through builds doctor trust and shifts stance\n\n".
                '**Pro tip:** Use specific next-step types like "Send materials" or "Schedule meeting" — concrete actions are easier to complete.',
            'actions' => [
                ['label' => 'Log a Visit', 'href' => '/visits/create'],
            ],
        ];
    }

    private function performanceOverview($user): array
    {
        $visits = Visit::forRep($user->id)
            ->where('visit_date', '>=', now()->subDays(30))
            ->get();

        $totalVisits = $visits->count();
        $avgScore = $visits->whereNotNull('efficiency_score')->avg('efficiency_score') ?? 0;
        $topVisits = $visits->where('efficiency_score', '>=', 0.8)->count();

        $openLoops = NextStep::whereHas('visit', fn ($q) => $q->where('rep_id', $user->id))
            ->where('is_completed', false)
            ->count();

        return [
            'reply' => "📈 **Your 30-Day Performance Overview:**\n\n".
                "| Metric | Value |\n".
                "|--------|-------|\n".
                '| Total visits | **'.$totalVisits."** |\n".
                '| Avg efficiency | **'.round($avgScore, 2)."** |\n".
                '| High-score visits (≥0.80) | **'.$topVisits."** |\n".
                '| Open follow-ups | **'.$openLoops."** |\n\n".
                ($avgScore >= 0.7 ? "🌟 You're performing above average! " : ($avgScore >= 0.5 ? '💪 Room for improvement — focus on high-weight objectives. ' : "📚 Let's build a strategy — try asking \"How can I improve my scores?\" ")).
                'Keep up the consistent effort!',
            'actions' => [
                ['label' => 'Dashboard', 'href' => '/dashboard'],
                ['label' => 'Log a Visit', 'href' => '/visits/create'],
            ],
        ];
    }

    /**
     * Extract a medication name from the user's message.
     */
    private function extractMedicationName(string $message): ?string
    {
        // Common patterns: "tell me about X", "what is X", "info on X", "about X drug", etc.
        $patterns = [
            '/(?:tell me about|info(?:rmation)? (?:on|about)|what (?:is|are)(?: the)?|details (?:on|about|for)|side effects (?:of|for)|dosage (?:of|for)|how (?:does|do)|about)\s+([a-zA-Z][a-zA-Z0-9\-]+(?:\s+[a-zA-Z][a-zA-Z0-9\-]+)?)/i',
            '/^([a-zA-Z][a-zA-Z0-9\-]{2,}(?:\s+[a-zA-Z0-9\-]+)?)(?:\s+(?:drug|med(?:icine|ication)?|tablet|pill|capsule|dosage|side effects|info))?$/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $message, $matches)) {
                $name = trim($matches[1]);
                // Filter out common words that aren't medication names
                $stopWords = ['the', 'this', 'that', 'my', 'your', 'our', 'how', 'what', 'can', 'medication', 'medicine', 'drug', 'med', 'meds', 'medications', 'score', 'doctor', 'visit', 'objective', 'follow', 'time', 'help', 'improve', 'all', 'some', 'any', 'give', 'show', 'list'];
                if (in_array(strtolower($name), $stopWords)) {
                    continue;
                }
                if (strlen($name) >= 3) {
                    return ucfirst($name);
                }
            }
        }

        return null;
    }

    /**
     * Notify all admins about a medication the AI couldn't find.
     */
    private function notifyAdminsUnknownMedication(string $medicationName, $user): void
    {
        $admins = User::role('admin')->get();

        foreach ($admins as $admin) {
            NotificationController::notify(
                $admin->id,
                'medication_request',
                'Unknown Medication Requested',
                "Rep {$user->name} asked about \"{$medicationName}\" but it's not in the database. Consider adding it to the medications list.",
                [
                    'medication_name' => $medicationName,
                    'requested_by' => $user->id,
                    'requested_by_name' => $user->name,
                ],
                'pill',
                'normal'
            );
        }
    }

    // -----------------------------------------------------------------
    //  Quick actions
    // -----------------------------------------------------------------

    private function getQuickActions($user, bool $isManager): array
    {
        $actions = [
            ['label' => 'How can I improve my scores?', 'icon' => 'trending-up'],
            ['label' => 'How to handle resistant doctors?', 'icon' => 'shield'],
            ['label' => 'Which objectives should I focus on?', 'icon' => 'target'],
            ['label' => 'How am I doing overall?', 'icon' => 'bar-chart'],
            ['label' => 'What are my open follow-ups?', 'icon' => 'clock'],
            ['label' => 'Time management tips', 'icon' => 'timer'],
        ];

        return $actions;
    }
}
