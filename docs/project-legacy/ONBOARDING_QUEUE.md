# OnboardingQueue™ — Platform Build Spec #010

Centralized onboarding orchestrator for SquareBoards. **No onboarding logic outside the queue.**

## Architecture

```
Signup → account_created (implicit)
       → OnboardingQueueEngine
            ├── QueueRegistry (module registration)
            ├── EligibilityResolver (conditional steps)
            ├── QueueExecutor (one popup at a time)
            ├── CompletionTracker (completed/skipped/unavailable)
            ├── InterruptionRecovery (resume from DB)
            └── SquarePass reward backends (MysterySquarePassService, etc.)
       → OnboardingQueueProvider (single popup manager)
```

## Mandatory order

1. Account Successfully Created (implicit)
2. Welcome to SquareBoards™
3. Mystery SquarePass™
4. Welcome Reward Reveal™
5. Founding Competitor™ (if eligible)
6. Birthday Reward™ (if birthday)
7. Flash Event™ (if active)
8. Season Event™ (if active)
9. Profile Personalization™
10. Beginner Missions™
11. Competitor Score™ Explanation
12. Choose Your Journey™
13. Navigate to Dashboard

Post-onboarding engagement: `daily_bonus`, `surprise`.

## Engine location

`lib/platform/engines/onboardingQueue/`

## Database

- `onboarding_queue_state` — per-competitor progress
- `onboarding_queue_config` — admin module toggles, order override, delay, eligibility JSON

Migration: `supabase/migrations/057_onboarding_queue.sql`

Legacy `square_pass_automation_state` remains for reward timestamps; synced on module complete.

## API

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/onboarding-queue/queue` | GET | Current state + next module |
| `/api/onboarding-queue/complete` | POST | Mark complete, advance |
| `/api/onboarding-queue/skip` | POST | Skip (if allowed) |
| `/api/admin/onboarding-queue/config` | GET/PATCH | Module CRUD |
| `/api/admin/onboarding-queue/reset` | POST | Reset competitor onboarding |
| `/api/admin/onboarding-queue/replay` | POST | Replay from welcome |
| `/api/admin/onboarding-queue/debug` | GET | Inspect queue for email |

## UI

- Provider: `components/onboarding-queue/OnboardingQueueProvider.tsx`
- Reuses modals from `components/square-pass/automation/`
- New: ChooseJourney, CompetitorScore, Birthday, Season, NavigateDashboard

## Debug

- Env: `ONBOARDING_QUEUE_DEBUG=true`
- Admin: `/admin/onboarding-queue`

## Adding a module

1. Create `lib/platform/engines/onboardingQueue/modules/yourModule.ts`
2. Register with `Queue.add()` on init
3. Import in `modules/index.ts`
4. Wire modal in `OnboardingQueueProvider`
5. Seed `onboarding_queue_config` row in migration

## Deprecated

- `ExperienceQueue.buildExperienceQueue` → delegates to `OnboardingQueueEngine`
- `SquarePassAutomationProvider` → re-exports `OnboardingQueueProvider`
