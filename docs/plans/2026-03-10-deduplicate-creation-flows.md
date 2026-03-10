# Deduplicate Character Creation & Sheet Flows

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate ~7,000+ lines of duplicated code between the standalone character creation/sheet flow (`app/create/`, `app/character/`) and the campaign-scoped flow (`app/campaigns/[id]/character/create/`, `app/campaigns/[id]/character/sheet.tsx`) by introducing a shared hook + thin route wrappers.

**Architecture:** Extract all business logic (draft loading, navigation, character creation) from route screens into a custom hook `useCreationStep(campaignId?)` and a `useCharacterSheet(campaignId?)` hook. Route files become thin wrappers (~5-15 lines) that extract params and delegate to a shared component. The `handleGoToStep` / navigation logic is parameterized by a route builder function.

**Tech Stack:** React Native / Expo Router 6, TypeScript, Zustand, existing `WizardStepLayout` component

---

## Analysis Summary

### Files to deduplicate

**Creation steps (11 pairs):**

| Step         | Standalone                   | Campaign                                              | Lines (S/C) | Dup % |
| ------------ | ---------------------------- | ----------------------------------------------------- | ----------- | ----- |
| \_layout     | `app/create/_layout.tsx`     | `app/campaigns/[id]/character/create/_layout.tsx`     | 51/51       | 100%  |
| index (name) | `app/create/index.tsx`       | `app/campaigns/[id]/character/create/index.tsx`       | 339/276     | ~70%  |
| race         | `app/create/race.tsx`        | `app/campaigns/[id]/character/create/race.tsx`        | 1092/1095   | ~98%  |
| class        | `app/create/class.tsx`       | `app/campaigns/[id]/character/create/class.tsx`       | 620/623     | ~98%  |
| abilities    | `app/create/abilities.tsx`   | `app/campaigns/[id]/character/create/abilities.tsx`   | 1303/1485   | ~95%  |
| background   | `app/create/background.tsx`  | `app/campaigns/[id]/character/create/background.tsx`  | 328/330     | ~98%  |
| skills       | `app/create/skills.tsx`      | `app/campaigns/[id]/character/create/skills.tsx`      | 449/452     | ~98%  |
| spells       | `app/create/spells.tsx`      | `app/campaigns/[id]/character/create/spells.tsx`      | 708/572     | ~90%  |
| equipment    | `app/create/equipment.tsx`   | `app/campaigns/[id]/character/create/equipment.tsx`   | 337/340     | ~98%  |
| personality  | `app/create/personality.tsx` | `app/campaigns/[id]/character/create/personality.tsx` | 605/608     | ~98%  |
| appearance   | `app/create/appearance.tsx`  | `app/campaigns/[id]/character/create/appearance.tsx`  | 404/407     | ~98%  |
| summary      | `app/create/summary.tsx`     | `app/campaigns/[id]/character/create/summary.tsx`     | 1077/1043   | ~90%  |

**Character sheet (1 pair):**

| Screen | Standalone               | Campaign                                 | Lines (S/C) | Dup % |
| ------ | ------------------------ | ---------------------------------------- | ----------- | ----- |
| sheet  | `app/character/[id].tsx` | `app/campaigns/[id]/character/sheet.tsx` | 1369/1232   | ~55%  |

### Difference patterns

**For 9 of 11 creation steps** (all except `index` and `summary`), the differences are mechanical:

1. `import { useLocalSearchParams }` + extract `campaignId`
2. `loadDraft()` → `loadDraft(campaignId)` with `if (!campaignId) return;` guard
3. `useFocusEffect` deps: `[]` → `[campaignId]`
4. Navigation: `/create/X` → `{ pathname: '/campaigns/[id]/character/create/X', params: { id: campaignId } }`

**For `index`:** Additional difference: standalone has entrance animations (Animated.View, staggered springs); campaign uses plain Views.

**For `summary`:** Different post-creation logic:

- Standalone: `addCharacter()` + `buildStartingInventory()` + navigate to `/character/${id}`
- Campaign: `linkCharacter(campaignId, id)` + `createDefaultInventory()` + navigate to `/campaigns/${id}/character/sheet`
- Different `handleGoToStep` route building

**For character sheet:** Significantly different headers (hero image vs compact), standalone has swipe/PanResponder, `HeaderScrollProvider`, `AvatarPreviewModal`. Shared: tab definitions, tab components, HP helpers, stat badges.

---

## Refactoring Strategy

### Phase 1: Creation Steps Hook + Shared Components (high impact, low risk)

Create a hook `useCreationNavigation(campaignId?: string)` that provides:

- `loadDraftForStep()` — calls `loadDraft(campaignId)` with proper guard
- `navigateToStep(stepRoute: string)` — builds the correct path
- `goBack()` — calls `router.back()`
- `focusEffectDeps` — `[campaignId]` or `[]`

Then for each creation step, extract the full screen body into a shared component in `src/components/creation/steps/`, and make the route files thin wrappers.

### Phase 2: Summary Step (medium risk)

Create `useCreationFinalize(campaignId?: string)` that encapsulates the divergent post-creation logic behind a strategy pattern:

- `finalizeCharacter(character)` — saves to storage, creates inventory, registers (addCharacter vs linkCharacter)
- `getSuccessRoute(characterId)` — returns the navigation target
- `cleanupAfterCreate()` — discards draft, reloads list/campaigns

### Phase 3: Character Sheet (lower priority, higher risk)

Extract shared utilities (tab definitions, HP helpers, stat badges, tab bar) into shared components. Keep the two route files but significantly reduce duplication.

---

## Task 1: Create `useCreationNavigation` hook

**Files:**

- Create: `src/hooks/useCreationNavigation.ts`
- Modify: `src/hooks/index.ts` (add re-export)

**Step 1: Create the hook**

```typescript
// src/hooks/useCreationNavigation.ts
import { useCallback } from "react";
import { useRouter } from "expo-router";
import { useCreationStore } from "@/stores/creationStore";

interface CreationNavigation {
  /** Load draft for this context, with campaignId guard */
  loadDraftForStep: () => Promise<boolean>;
  /** Navigate to a sibling creation step by route name */
  navigateToStep: (stepRoute: string) => void;
  /** Go back */
  goBack: () => void;
  /** The campaignId (undefined for standalone) */
  campaignId: string | undefined;
}

export function useCreationNavigation(campaignId?: string): CreationNavigation {
  const router = useRouter();
  const { loadDraft } = useCreationStore();

  const loadDraftForStep = useCallback(async () => {
    if (campaignId !== undefined && !campaignId) return false;
    return await loadDraft(campaignId);
  }, [campaignId, loadDraft]);

  const navigateToStep = useCallback(
    (stepRoute: string) => {
      if (campaignId) {
        router.push({
          pathname: `/campaigns/[id]/character/create/${stepRoute}` as any,
          params: { id: campaignId },
        });
      } else {
        router.push(`/create/${stepRoute}` as any);
      }
    },
    [campaignId, router],
  );

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return { loadDraftForStep, navigateToStep, goBack, campaignId };
}
```

**Step 2: Add re-export to hooks/index.ts**

Add `export { useCreationNavigation } from "./useCreationNavigation";` to `src/hooks/index.ts`.

**Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No new errors

**Step 4: Commit**

```
git add src/hooks/useCreationNavigation.ts src/hooks/index.ts
git commit -m "feat: add useCreationNavigation hook for shared creation step logic"
```

---

## Task 2: Refactor `background.tsx` (simplest step, proof of concept)

**Why this step first:** At 328/330 lines with ~98% duplication and simple logic, it's the safest to validate the pattern.

**Files:**

- Create: `src/components/creation/steps/BackgroundStep.tsx`
- Modify: `src/components/creation/index.ts` (add re-export)
- Modify: `app/create/background.tsx` (thin wrapper)
- Modify: `app/campaigns/[id]/character/create/background.tsx` (thin wrapper)

**Step 1: Extract shared component**

Move the entire body of `app/create/background.tsx` into `src/components/creation/steps/BackgroundStep.tsx`, parameterized by `campaignId?: string`. Replace:

- The `useFocusEffect` block with `useCreationNavigation(campaignId).loadDraftForStep`
- The navigation calls with `useCreationNavigation(campaignId).navigateToStep`
- The `useFocusEffect` deps with `[campaignId]` (harmless when undefined)

The component signature: `export default function BackgroundStep({ campaignId }: { campaignId?: string })`

**Step 2: Make standalone wrapper thin**

```typescript
// app/create/background.tsx
import BackgroundStep from "@/components/creation/steps/BackgroundStep";
export default function BackgroundRoute() {
  return <BackgroundStep />;
}
```

**Step 3: Make campaign wrapper thin**

```typescript
// app/campaigns/[id]/character/create/background.tsx
import { useLocalSearchParams } from "expo-router";
import BackgroundStep from "@/components/creation/steps/BackgroundStep";
export default function CampaignBackgroundRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BackgroundStep campaignId={id} />;
}
```

**Step 4: Verify build + manual test**

Run: `npx tsc --noEmit`
Test: Navigate to background step in both standalone and campaign flows.

**Step 5: Commit**

```
git add -A
git commit -m "refactor: extract BackgroundStep shared component, deduplicate background.tsx"
```

---

## Task 3: Refactor remaining simple steps (same pattern as Task 2)

Apply the identical pattern from Task 2 to these steps, one at a time. Each follows the exact same extraction:

### 3a: `equipment.tsx` (337/340 lines)

- Create: `src/components/creation/steps/EquipmentStep.tsx`
- Thin wrappers in both route files

### 3b: `skills.tsx` (449/452 lines)

- Create: `src/components/creation/steps/SkillsStep.tsx`

### 3c: `personality.tsx` (605/608 lines)

- Create: `src/components/creation/steps/PersonalityStep.tsx`

### 3d: `appearance.tsx` (404/407 lines)

- Create: `src/components/creation/steps/AppearanceStep.tsx`

### 3e: `class.tsx` (620/623 lines)

- Create: `src/components/creation/steps/ClassStep.tsx`

### 3f: `race.tsx` (1092/1095 lines)

- Create: `src/components/creation/steps/RaceStep.tsx`

### 3g: `spells.tsx` (708/572 lines)

- Create: `src/components/creation/steps/SpellsStep.tsx`
- NOTE: Spells has ~10% divergence — the campaign version may have a shorter implementation. Use the standalone version as the base and verify the campaign version doesn't have unique logic.

### 3h: `abilities.tsx` (1303/1485 lines)

- Create: `src/components/creation/steps/AbilitiesStep.tsx`
- NOTE: Campaign version is ~180 lines longer. Check `abilities.new.tsx` — it may be a WIP replacement. Use the correct version as the base.

**For each sub-task:**

1. Read both route files completely
2. Create shared component with `campaignId?` prop
3. Replace both route files with thin wrappers
4. Run `npx tsc --noEmit`
5. Commit

---

## Task 4: Refactor `index.tsx` (name step, ~70% dup)

**Files:**

- Create: `src/components/creation/steps/NameStep.tsx`
- Modify: `app/create/index.tsx` (thin wrapper)
- Modify: `app/campaigns/[id]/character/create/index.tsx` (thin wrapper)

**Key difference:** Standalone has entrance animations (Animated.View, staggered springs ~65 lines). Campaign uses plain Views.

**Strategy:** Include the animations in the shared component. The campaign version was likely a simplified copy — the animations should work in both contexts. If there's a reason the campaign version omits them, add a `disableAnimations?: boolean` prop.

---

## Task 5: Refactor `summary.tsx` (~90% dup, divergent post-creation)

**Files:**

- Create: `src/components/creation/steps/SummaryStep.tsx`
- Create: `src/hooks/useCreationFinalize.ts`
- Modify: `app/create/summary.tsx` (thin wrapper)
- Modify: `app/campaigns/[id]/character/create/summary.tsx` (thin wrapper)

**Step 1: Create `useCreationFinalize` hook**

This hook encapsulates the divergent post-creation logic:

```typescript
// src/hooks/useCreationFinalize.ts
interface CreationFinalizeConfig {
  campaignId?: string;
}

interface CreationFinalize {
  /** Save character + create inventory + register in list/campaign */
  finalizeCharacter: (character: Character) => Promise<void>;
  /** Route to navigate after successful creation */
  getSuccessRoute: (characterId: string) => string;
  /** Clean up draft and reload data */
  cleanup: () => Promise<void>;
}
```

When `campaignId` is provided:

- Uses `createDefaultInventory` for inventory
- Calls `linkCharacter(campaignId, characterId)`
- Returns `/campaigns/${campaignId}/character/sheet` as success route
- Calls `discardDraft(campaignId)` + `loadCampaigns()`

When standalone:

- Uses `buildStartingInventory` with full class/background equipment
- Calls `addCharacter(character)`
- Returns `/character/${characterId}` as success route
- Calls `discardDraft()` + `loadCharacters()`

**Step 2: Extract shared SummaryStep component**

Uses `useCreationFinalize(campaignId)` internally. The `handleGoToStep` uses `useCreationNavigation(campaignId).navigateToStep`.

**Step 3: Thin wrappers for both routes**

**Step 4: Verify + commit**

---

## Task 6: Refactor `_layout.tsx` (100% identical)

**Files:**

- Create: `src/components/creation/CreationLayout.tsx`
- Modify: `app/create/_layout.tsx` (re-export)
- Modify: `app/campaigns/[id]/character/create/_layout.tsx` (re-export)

Both files are identical. Extract to shared component and re-export from both route files.

---

## Task 7: Refactor Character Sheet (Phase 3)

**This is lower priority and higher risk.** The two sheets share ~55% code but have significantly different headers.

**Strategy:** Extract shared utilities rather than trying to unify the entire screen:

**Files:**

- Create: `src/components/character/sheet/TabBar.tsx` — shared bottom tab bar
- Create: `src/components/character/sheet/StatBadge.tsx` — shared stat badge component
- Create: `src/components/character/sheet/HPColorHelpers.ts` — shared HP color logic
- Create: `src/hooks/useCharacterSheet.ts` — shared character loading + tab state logic
- Modify: `app/character/[id].tsx` — import shared components
- Modify: `app/campaigns/[id]/character/sheet.tsx` — import shared components

This reduces duplication without forcing the two different header designs into one component.

---

## Expected Results

| Metric                         | Before            | After                        |
| ------------------------------ | ----------------- | ---------------------------- |
| Total lines (creation + sheet) | ~14,000           | ~8,500                       |
| Duplicated lines               | ~7,000+           | ~200 (thin wrappers)         |
| Route files (avg lines)        | ~600              | ~10                          |
| Shared components              | 0 step components | 11 step components + 2 hooks |

## Risk Mitigation

1. **Start with the simplest step** (background) to validate the pattern
2. **One step at a time** with build verification between each
3. **Keep both route files** — Expo Router requires files in `app/` for routing; we just make them thin
4. **No store changes** — all refactoring is in the presentation layer
5. **The creationStore already supports `campaignId?`** — no API changes needed
