<?php

namespace Database\Seeders;

use App\Models\DoctorProfile;
use App\Models\FeatureFlag;
use App\Models\Medication;
use App\Models\NextStep;
use App\Models\Notification;
use App\Models\ObjectionTag;
use App\Models\Objective;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitObjective;
use App\Services\EfficiencyScoreService;
use Illuminate\Database\Seeder;

class MedicaSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Feature Flags ──────────────────────────────────────
        // Note: The migration already seeds default flags, but we truncate and re-seed
        // to ensure consistent state during fresh seeding.
        \DB::table('feature_flags')->truncate();

        $flags = [
            ['key' => 'demo_mode',          'name' => 'Demo Mode',          'description' => 'Show sample login credentials on the login page',  'enabled' => true],
            ['key' => 'ai_coaching',        'name' => 'AI Coaching',        'description' => 'Enable AI Coach chatbot and insights',              'enabled' => true],
            ['key' => 'pdf_import',         'name' => 'PDF Import',         'description' => 'Allow importing medication PDFs',                   'enabled' => true],
            ['key' => 'notifications',      'name' => 'Notifications',      'description' => 'Enable the notification system',                    'enabled' => true],
            ['key' => 'onboarding',         'name' => 'Onboarding Tour',    'description' => 'Show guided onboarding tutorial for new users',     'enabled' => true],
            ['key' => 'splash_animation',   'name' => 'Splash Animation',   'description' => 'Show the Medica splash screen on app load',         'enabled' => true],
            ['key' => 'command_palette',    'name' => 'Command Palette',    'description' => 'Enable ⌘K command palette shortcut',               'enabled' => true],
            ['key' => 'dark_mode',          'name' => 'Dark Mode',          'description' => 'Allow users to switch to dark theme',               'enabled' => true],
            ['key' => 'maintenance',        'name' => 'Maintenance Mode',   'description' => 'Put the application in maintenance mode',           'enabled' => false],
        ];

        foreach ($flags as $flag) {
            FeatureFlag::create($flag);
        }

        // ─── Objectives ─────────────────────────────────────────
        $objectives = collect([
            ['name' => 'Product Introduction', 'category' => 'Sales', 'importance' => 'standard', 'weight' => 1.0],
            ['name' => 'Clinical Data Presentation', 'category' => 'Education', 'importance' => 'high', 'weight' => 1.3],
            ['name' => 'Objection Handling', 'category' => 'Sales', 'importance' => 'high', 'weight' => 1.3],
            ['name' => 'Sample Delivery', 'category' => 'Support', 'importance' => 'low', 'weight' => 0.7],
            ['name' => 'Follow-up Discussion', 'category' => 'Relationship', 'importance' => 'standard', 'weight' => 1.0],
            ['name' => 'Formulary Request', 'category' => 'Sales', 'importance' => 'high', 'weight' => 1.3],
            ['name' => 'Patient Case Review', 'category' => 'Education', 'importance' => 'standard', 'weight' => 1.0],
            ['name' => 'Competitive Differentiation', 'category' => 'Sales', 'importance' => 'standard', 'weight' => 1.0],
            ['name' => 'Safety/Compliance Update', 'category' => 'Compliance', 'importance' => 'high', 'weight' => 1.3],
            ['name' => 'Relationship Building', 'category' => 'Relationship', 'importance' => 'low', 'weight' => 0.7],
        ])->map(fn ($o) => Objective::create(array_merge($o, ['is_active' => true])));

        // ─── Objection Tags ─────────────────────────────────────
        $tags = collect([
            'Price concern',
            'Efficacy doubt',
            'Side effect worry',
            'Prefers competitor',
            'Not enough data',
            'Insurance coverage',
            'Patient suitability',
            'No time to discuss',
        ])->map(fn ($name) => ObjectionTag::create(['name' => $name]));

        // ─── Admin User ─────────────────────────────────────────
        $admin = User::factory()->create([
            'name' => 'Dev Admin',
            'email' => 'admin@medica.test',
            'role' => 'admin',
            'onboarding_completed' => true,
        ]);
        $admin->assignRole('admin');

        // ─── Manager User ───────────────────────────────────────
        $manager = User::factory()->create([
            'name' => 'Sarah Manager',
            'email' => 'manager@medica.test',
            'role' => 'manager',
            'onboarding_completed' => true,
        ]);
        $manager->assignRole('manager');

        // ─── Rep Users ──────────────────────────────────────────
        $reps = collect([
            ['name' => 'Sam Mitchell', 'email' => 'sam@medica.test'],
            ['name' => 'Julia Ortega', 'email' => 'julia@medica.test'],
            ['name' => 'Priya Sharma', 'email' => 'priya@medica.test'],
        ])->map(function ($r) {
            $user = User::factory()->create(array_merge($r, ['role' => 'rep']));
            $user->assignRole('rep');

            return $user;
        });

        // ─── Sample Medications ─────────────────────────────────
        $medications = [
            [
                'name' => 'Atorvastatin (Lipitor)',
                'generic_name' => 'Atorvastatin Calcium',
                'description' => 'HMG-CoA reductase inhibitor (statin) used to lower cholesterol and reduce the risk of cardiovascular disease.',
                'indications' => 'Primary hyperlipidemia, mixed dyslipidemia, prevention of cardiovascular disease in high-risk patients.',
                'dosage' => 'Tablets: 10mg, 20mg, 40mg, 80mg. Taken once daily with or without food.',
                'side_effects' => 'Common: myalgia, arthralgia, nasopharyngitis, diarrhea. Rare: rhabdomyolysis, hepatotoxicity.',
                'contraindications' => 'CYP3A4 inhibitors (clarithromycin, itraconazole), gemfibrozil, niacin, cyclosporine. Avoid grapefruit juice in large amounts.',
                'uploaded_by' => $admin->id,
            ],
            [
                'name' => 'Metformin (Glucophage)',
                'generic_name' => 'Metformin Hydrochloride',
                'description' => 'Biguanide antidiabetic agent used as first-line therapy for type 2 diabetes mellitus.',
                'indications' => 'Type 2 diabetes mellitus as monotherapy or in combination with other antidiabetic agents, including insulin.',
                'dosage' => 'Tablets: 500mg, 850mg, 1000mg. Extended-release: 500mg, 750mg, 1000mg. Taken with meals.',
                'side_effects' => 'Common: nausea, vomiting, diarrhea, flatulence, abdominal discomfort. Rare: lactic acidosis, vitamin B12 deficiency.',
                'contraindications' => 'Iodinated contrast agents, alcohol, carbonic anhydrase inhibitors, cimetidine. Monitor renal function.',
                'uploaded_by' => $admin->id,
            ],
            [
                'name' => 'Amlodipine (Norvasc)',
                'generic_name' => 'Amlodipine Besylate',
                'description' => 'Calcium channel blocker used to treat high blood pressure and angina.',
                'indications' => 'Hypertension, chronic stable angina, confirmed or suspected vasospastic angina.',
                'dosage' => 'Tablets: 2.5mg, 5mg, 10mg. Taken once daily.',
                'side_effects' => 'Common: peripheral edema, dizziness, flushing, palpitations. Rare: hypotension, hepatitis.',
                'contraindications' => 'CYP3A4 inhibitors/inducers, simvastatin (limit dose), cyclosporine, tacrolimus.',
                'uploaded_by' => $admin->id,
            ],
            [
                'name' => 'Omeprazole (Prilosec)',
                'generic_name' => 'Omeprazole',
                'description' => 'Proton pump inhibitor (PPI) used to reduce gastric acid production.',
                'indications' => 'GERD, erosive esophagitis, duodenal ulcers, H. pylori eradication (with antibiotics), Zollinger-Ellison syndrome.',
                'dosage' => 'Capsules: 10mg, 20mg, 40mg. Taken before meals, preferably in the morning.',
                'side_effects' => 'Common: headache, abdominal pain, nausea, diarrhea, flatulence. Long-term: B12 deficiency, bone fractures, C. diff risk.',
                'contraindications' => 'Clopidogrel (reduced efficacy), methotrexate, tacrolimus, CYP2C19 substrates.',
                'uploaded_by' => $admin->id,
            ],
            [
                'name' => 'Sertraline (Zoloft)',
                'generic_name' => 'Sertraline Hydrochloride',
                'description' => 'Selective serotonin reuptake inhibitor (SSRI) used to treat depression, anxiety disorders, and PTSD.',
                'indications' => 'Major depressive disorder, panic disorder, PTSD, social anxiety disorder, OCD, premenstrual dysphoric disorder.',
                'dosage' => 'Tablets: 25mg, 50mg, 100mg. Oral concentrate: 20mg/mL.',
                'side_effects' => 'Common: nausea, diarrhea, insomnia, dizziness, fatigue, dry mouth. Rare: serotonin syndrome, suicidality in young adults.',
                'contraindications' => 'MAOIs (contraindicated), pimozide, CNS depressants, warfarin, NSAIDs. Taper when discontinuing.',
                'uploaded_by' => $admin->id,
            ],
        ];

        foreach ($medications as $med) {
            Medication::create($med);
        }

        // ─── Doctors (with user accounts) ───────────────────────
        $doctorData = [
            ['name' => 'Dr. Marcus Reeves', 'specialty' => 'Cardiology', 'institution' => 'Metro General Hospital', 'location' => 'Downtown', 'segment' => 'A', 'stance' => 'neutral', 'access_difficulty' => 'hard'],
            ['name' => 'Dr. Yuki Nakata', 'specialty' => 'Oncology', 'institution' => 'City Cancer Center', 'location' => 'Midtown', 'segment' => 'A', 'stance' => 'supportive', 'access_difficulty' => 'moderate'],
            ['name' => 'Dr. Ahmed Osman', 'specialty' => 'Neurology', 'institution' => 'University Medical Center', 'location' => 'Uptown', 'segment' => 'B', 'stance' => 'resistant', 'access_difficulty' => 'hard'],
            ['name' => 'Dr. Lisa Chen', 'specialty' => 'Endocrinology', 'institution' => 'Riverside Clinic', 'location' => 'East Side', 'segment' => 'B', 'stance' => 'neutral', 'access_difficulty' => 'easy'],
            ['name' => 'Dr. Carlos Mendes', 'specialty' => 'Dermatology', 'institution' => 'Skin Health Associates', 'location' => 'West End', 'segment' => 'C', 'stance' => 'supportive', 'access_difficulty' => 'moderate'],
            ['name' => 'Dr. Ji-Yeon Park', 'specialty' => 'Psychiatry', 'institution' => 'Mental Health Center', 'location' => 'North Shore', 'segment' => 'B', 'stance' => 'neutral', 'access_difficulty' => 'moderate'],
            ['name' => 'Dr. Elena Alvarez', 'specialty' => 'Pulmonology', 'institution' => 'Respiratory Care Group', 'location' => 'South Bay', 'segment' => 'C', 'stance' => 'resistant', 'access_difficulty' => 'easy'],
        ];

        $doctors = collect($doctorData)->map(function ($doc) {
            $user = User::factory()->create([
                'name' => $doc['name'],
                'email' => strtolower(str_replace(['Dr. ', ' '], ['', '.'], $doc['name'])).'@hospital.test',
                'role' => 'rep',
            ]);

            return DoctorProfile::create([
                'user_id' => $user->id,
                'specialty' => $doc['specialty'],
                'institution' => $doc['institution'],
                'location' => $doc['location'],
                'segment' => $doc['segment'],
                'stance' => $doc['stance'],
                'access_difficulty' => $doc['access_difficulty'],
            ]);
        });

        // ─── Visits (seed realistic data) ───────────────────────
        $visitTypes = ['in_person', 'call', 'event', 'follow_up'];
        $outcomes = ['met', 'partially_met', 'not_met'];
        $stances = ['supportive', 'neutral', 'resistant'];
        $engagementLevels = ['low', 'medium', 'high'];
        $difficulties = ['easy', 'moderate', 'hard'];
        $nextStepTypes = ['Follow-up call', 'Schedule meeting', 'Send materials', 'Share case study', 'Arrange meeting'];

        $scorer = new EfficiencyScoreService;

        foreach ($doctors as $doctor) {
            $visitCount = rand(4, 8);

            for ($i = 0; $i < $visitCount; $i++) {
                $rep = $reps->random();
                $daysAgo = rand(1, 90);
                $stanceBefore = $stances[array_rand($stances)];
                $stanceAfter = $stanceBefore;

                if (rand(1, 4) === 1) {
                    $stanceIndex = array_search($stanceBefore, $stances);
                    $stanceAfter = $stances[max(0, $stanceIndex - 1)] ?? $stanceBefore;
                }

                $visit = Visit::create([
                    'rep_id' => $rep->id,
                    'doctor_profile_id' => $doctor->id,
                    'visit_type' => $visitTypes[array_rand($visitTypes)],
                    'visit_date' => now()->subDays($daysAgo),
                    'notes' => fake()->optional(0.6)->sentence(10),
                    'engagement_quality' => $engagementLevels[array_rand($engagementLevels)],
                    'access_difficulty' => $difficulties[array_rand($difficulties)],
                    'time_spent_minutes' => rand(5, 60),
                    'confidence' => rand(40, 100),
                    'stance_before' => $stanceBefore,
                    'stance_after' => $stanceAfter,
                ]);

                $numObjectives = rand(1, 3);
                $selectedObjectives = $objectives->random($numObjectives);

                foreach ($selectedObjectives as $obj) {
                    $outcomeWeights = $doctor->stance === 'supportive'
                        ? [0 => 0.6, 1 => 0.3, 2 => 0.1]
                        : ($doctor->stance === 'resistant'
                            ? [0 => 0.2, 1 => 0.4, 2 => 0.4]
                            : [0 => 0.4, 1 => 0.4, 2 => 0.2]);

                    $rand = mt_rand(1, 100) / 100;
                    $outcome = $rand <= $outcomeWeights[0] ? 'met' :
                        ($rand <= $outcomeWeights[0] + $outcomeWeights[1] ? 'partially_met' : 'not_met');

                    VisitObjective::create([
                        'visit_id' => $visit->id,
                        'objective_id' => $obj->id,
                        'outcome' => $outcome,
                        'outcome_score' => match ($outcome) {
                            'met' => 1.0,
                            'partially_met' => 0.5,
                            default => 0.0,
                        },
                    ]);
                }

                if (rand(1, 100) <= 30) {
                    $visit->objectionTags()->attach(
                        $tags->random(rand(1, 3))->pluck('id')->toArray()
                    );
                }

                if (rand(1, 100) <= 50) {
                    $isCompleted = rand(1, 100) <= 40;

                    NextStep::create([
                        'visit_id' => $visit->id,
                        'description' => fake()->sentence(6),
                        'type' => $nextStepTypes[array_rand($nextStepTypes)],
                        'due_date' => now()->subDays($daysAgo)->addDays(rand(3, 14)),
                        'is_completed' => $isCompleted,
                        'completed_at' => $isCompleted ? now()->subDays(rand(0, $daysAgo)) : null,
                    ]);
                }

                $scorer->calculateVisitScore($visit);
            }
        }

        // ─── Sample Notifications ───────────────────────────────
        $allUsers = collect([$admin, $manager])->merge($reps);

        foreach ($allUsers as $u) {
            Notification::create([
                'user_id' => $u->id,
                'type' => 'info',
                'title' => 'Welcome to Medica!',
                'body' => 'Your account has been set up. Explore the dashboard and start tracking your visits.',
                'priority' => 'normal',
            ]);
        }

        // Manager-specific notifications
        Notification::create([
            'user_id' => $manager->id,
            'type' => 'ai_insight',
            'title' => 'Weekly Performance Summary',
            'body' => 'Your team completed '.Visit::count().' visits this period. Average efficiency is trending up — great work!',
            'priority' => 'normal',
        ]);

        Notification::create([
            'user_id' => $manager->id,
            'type' => 'warning',
            'title' => 'Follow-up Reminder',
            'body' => 'There are overdue next-steps that need attention. Check the dashboard for details.',
            'priority' => 'high',
        ]);

        // Rep notifications
        foreach ($reps as $rep) {
            Notification::create([
                'user_id' => $rep->id,
                'type' => 'ai_insight',
                'title' => 'Coaching Tip',
                'body' => 'Try focusing on high-weight objectives like Clinical Data Presentation for better efficiency scores.',
                'priority' => 'normal',
            ]);

            Notification::create([
                'user_id' => $rep->id,
                'type' => 'success',
                'title' => 'Achievement Unlocked',
                'body' => 'You completed your first batch of visits! Keep up the momentum.',
                'priority' => 'low',
            ]);
        }

        // Admin notification
        Notification::create([
            'user_id' => $admin->id,
            'type' => 'alert',
            'title' => 'System Ready',
            'body' => 'All modules are operational. Feature flags, notifications, and medication database are active.',
            'priority' => 'high',
        ]);

        $this->command->info('✅ Seeded: '.Objective::count().' objectives, '
            .ObjectionTag::count().' tags, '
            .DoctorProfile::count().' doctors, '
            .$reps->count().' reps, '
            .Visit::count().' visits, '
            .FeatureFlag::count().' feature flags, '
            .Medication::count().' medications, '
            .Notification::count().' notifications');
    }
}
