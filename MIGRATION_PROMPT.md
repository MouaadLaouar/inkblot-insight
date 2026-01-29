# Migration Prompt: Execute React/Vite/Supabase to Next.js/PostgreSQL/Prisma Migration

Use this prompt to instruct Claude (or another AI assistant) to perform the actual migration work.

---

## MAIN MIGRATION PROMPT

```
You are tasked with migrating a clinical Rorschach test scoring application from React + Vite + Supabase to Next.js 14 (App Router) + PostgreSQL + Prisma + NextAuth.js.

## CURRENT STACK
- React 18.3.1 + TypeScript
- Vite 5.4.19 as build tool
- Supabase for database and authentication
- Tailwind CSS 3.4.17 with ShadCN UI components
- React Router v6 for routing
- React Query for server state

## TARGET STACK
- Next.js 14 with App Router
- PostgreSQL database
- Prisma ORM
- NextAuth.js v5 (Auth.js) for authentication
- Keep: Tailwind CSS, ShadCN UI, React Query

## PROJECT CONTEXT
This is "Inkblot Insight" - a clinical-grade Rorschach test scoring application used by psychologists. It manages:
- User accounts (psychologists)
- Patients with medical records
- Rorschach tests with 10 inkblot cards
- Individual responses with scoring (location, determinants, content, timing)
- Complex statistical calculations and visualizations

## DATABASE SCHEMA (4 Tables)

### users (from Supabase profiles)
- id, email, password (hashed), full_name, role, created_at, updated_at

### patients
- id, first_name, last_name, medical_record_number (unique per user), date_of_birth, gender, notes, created_by (FK users), timestamps

### rorschach_tests
- id, patient_id (FK), created_by (FK), test_date, status ("in_progress"|"completed"), total_responses, notes, timestamps

### test_responses
- id, test_id (FK), card_number (1-10), response_number, response_text, location (G/D/Dd/Dbl/Ddbl/Do), determinants, content_categories, ban (boolean), obs, intense_time, response_time, form_quality, c_value, timestamps

## ROUTES TO MIGRATE

| Current Path | New Path | Type |
|--------------|----------|------|
| /auth | /login, /signup | Public |
| /dashboard | /dashboard | Protected |
| /test/:patientId | /test/[patientId] | Protected |
| /scoring/:testId | /scoring/[testId] | Protected |
| /results/:testId | /results/[testId] | Protected |

## FILES TO KEEP UNCHANGED (Copy as-is)
- All files in src/components/ui/* (ShadCN components)
- src/lib/RorschachCalculator.ts
- src/lib/rorschachConstants.ts
- src/lib/rangeSets.ts
- src/lib/utils.ts (update import paths only)
- src/components/PercentageWithLines.tsx
- src/components/TRINote.tsx
- src/components/SelectionModal.tsx

## MIGRATION TASKS

### Task 1: Project Setup
1. Initialize Next.js 14 with App Router, TypeScript, Tailwind
2. Install dependencies:
   - prisma, @prisma/client
   - next-auth@beta, @auth/prisma-adapter
   - @tanstack/react-query
   - bcryptjs, @types/bcryptjs
   - zod, react-hook-form, @hookform/resolvers
   - lucide-react, sonner, date-fns
3. Set up folder structure as per target architecture
4. Copy ShadCN components to components/ui/
5. Copy utility files to lib/
6. Configure tailwind.config.ts (copy existing config)
7. Copy global CSS from src/index.css to app/globals.css

### Task 2: Database Setup with Prisma
1. Create prisma/schema.prisma with all 4 models:
   - User, Patient, RorschachTest, TestResponse
   - Include proper relations and constraints
   - Use @map() for snake_case column names
2. Create lib/prisma.ts for Prisma client singleton
3. Run: npx prisma generate
4. Run: npx prisma db push (or migrate dev)

### Task 3: Authentication with NextAuth.js
1. Create lib/auth.ts with:
   - Credentials provider (email/password)
   - PrismaAdapter
   - JWT session strategy
   - Custom callbacks for user ID in session
2. Create app/api/auth/[...nextauth]/route.ts
3. Create app/api/auth/signup/route.ts for registration
4. Create components/providers/auth-provider.tsx (SessionProvider)
5. Create middleware.ts for route protection

### Task 4: API Routes
Create these API routes in app/api/:

**Patients:**
- GET/POST /api/patients (list/create)
- GET/PUT/DELETE /api/patients/[id] (single operations)

**Tests:**
- GET/POST /api/tests (list/create)
- GET/PUT/DELETE /api/tests/[id]
- GET /api/tests/patient/[patientId] (tests for patient)

**Responses:**
- GET/POST /api/responses (list/create)
- GET/PUT/DELETE /api/responses/[id]
- GET /api/responses/test/[testId] (responses for test)

Each route must:
- Check authentication via auth()
- Validate request body with Zod
- Return appropriate status codes
- Handle errors gracefully

### Task 5: Page Migrations

**Login Page (app/(auth)/login/page.tsx):**
- Form with email/password
- Use signIn("credentials", {...})
- Redirect to /dashboard on success
- Show error messages

**Signup Page (app/(auth)/signup/page.tsx):**
- Form with email, password, full name
- Call /api/auth/signup
- Auto-login after signup
- Redirect to /dashboard

**Dashboard (app/(protected)/dashboard/page.tsx):**
- Server component that checks auth
- Client component for interactive parts
- Fetch patients via API
- Stats cards showing counts
- PatientList component
- PatientDialog for add/edit

**Test Page (app/(protected)/test/[patientId]/page.tsx):**
- Display patient info
- List all tests for patient
- Create new test button
- Delete test with confirmation
- Navigate to scoring

**Scoring Page (app/(protected)/scoring/[testId]/page.tsx):**
- Card-by-card response entry (cards 1-10)
- Form fields: response_text, location, determinants, content, timing, observations
- Use SelectionModal for multi-select fields
- Auto-save responses
- Calculate total_responses

**Results Page (app/(protected)/results/[testId]/page.tsx):**
- Fetch all responses for test
- Run RorschachCalculator.calculateRorschachStats()
- Display tabs: Overview, Location, Determinants, Content, Timing
- Use existing visualization components

### Task 6: Shared Components & Providers

**components/providers/query-provider.tsx:**
- QueryClientProvider wrapper

**app/layout.tsx:**
- Import globals.css
- Wrap with AuthProvider and QueryProvider
- Add Toaster component

**app/(protected)/layout.tsx:**
- Check auth, redirect if not authenticated
- Common layout for protected pages

### Task 7: Data Fetching Hooks
Create custom hooks in hooks/ folder:

```typescript
// hooks/use-patients.ts
export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: () => fetch("/api/patients").then(r => r.json())
  })
}

// hooks/use-patient-mutations.ts
export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => fetch("/api/patients", {
      method: "POST",
      body: JSON.stringify(data)
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries(["patients"])
  })
}
```

Create similar hooks for tests and responses.

## IMPORTANT CONSIDERATIONS

1. **No breaking changes to UX** - The app should look and feel identical
2. **Maintain data integrity** - All scoring calculations must remain accurate
3. **Type safety** - Use Prisma-generated types throughout
4. **Error handling** - Show user-friendly error messages
5. **Loading states** - Show spinners during data fetching
6. **Optimistic updates** - Update UI immediately, sync in background

## ENVIRONMENT VARIABLES NEEDED

```env
DATABASE_URL="postgresql://user:pass@host:5432/inkblot_insight"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-secret"
```

## TESTING CHECKLIST AFTER MIGRATION

1. [ ] Can create new account
2. [ ] Can log in with existing account
3. [ ] Can log out
4. [ ] Dashboard shows patient list
5. [ ] Can add new patient
6. [ ] Can edit patient
7. [ ] Can delete patient
8. [ ] Can create new test for patient
9. [ ] Can add responses to test (all 10 cards)
10. [ ] Location selection works
11. [ ] Determinant selection works
12. [ ] Content selection works
13. [ ] Timing fields work
14. [ ] Results page shows correct statistics
15. [ ] All percentage calculations match original

## START THE MIGRATION

Begin with Task 1 (Project Setup), then proceed sequentially through each task. After each task, verify it works before moving to the next.

Do not skip any steps. Ask clarifying questions if anything is unclear.
```

---

## ALTERNATIVE: STEP-BY-STEP PROMPTS

If you prefer to run the migration in smaller chunks, use these individual prompts:

### Prompt 1: Initialize Project
```
Set up a new Next.js 14 project with App Router for the Inkblot Insight application. Include:
- TypeScript configuration
- Tailwind CSS with the existing design system (copy from src/index.css)
- All required dependencies (prisma, next-auth, react-query, etc.)
- Folder structure: app/, components/, lib/, hooks/, prisma/, types/
- Copy all ShadCN UI components from src/components/ui/
- Copy utility files: RorschachCalculator.ts, rorschachConstants.ts, rangeSets.ts, utils.ts
```

### Prompt 2: Set Up Prisma Schema
```
Create the Prisma schema for Inkblot Insight with these models:
- User (id, email, password, fullName, role, timestamps)
- Patient (id, firstName, lastName, medicalRecordNumber, dateOfBirth, gender, notes, createdBy, timestamps)
- RorschachTest (id, patientId, createdBy, testDate, status, totalResponses, notes, timestamps)
- TestResponse (id, testId, cardNumber, responseNumber, responseText, location, determinants, contentCategories, ban, obs, intenseTime, responseTime, formQuality, cValue, timestamps)

Include proper relations, unique constraints (medicalRecordNumber per user), and cascade deletes.
Create the Prisma client singleton in lib/prisma.ts.
```

### Prompt 3: Set Up NextAuth.js
```
Configure NextAuth.js v5 for Inkblot Insight with:
- Credentials provider (email/password)
- Prisma adapter
- JWT session strategy
- Password hashing with bcryptjs
- User ID available in session
- Custom login page at /login
- API route at app/api/auth/[...nextauth]/route.ts
- Signup API at app/api/auth/signup/route.ts
- SessionProvider wrapper component
- Middleware for protecting /dashboard, /test, /scoring, /results routes
```

### Prompt 4: Create Patient API Routes
```
Create API routes for patient management:
- GET /api/patients - List all patients for authenticated user
- POST /api/patients - Create new patient
- GET /api/patients/[id] - Get single patient
- PUT /api/patients/[id] - Update patient
- DELETE /api/patients/[id] - Delete patient

Include:
- Authentication checks
- Zod validation for request bodies
- Proper error handling and status codes
- Only allow access to user's own patients
```

### Prompt 5: Create Test API Routes
```
Create API routes for Rorschach test management:
- GET /api/tests - List all tests for authenticated user
- POST /api/tests - Create new test
- GET /api/tests/[id] - Get single test with responses
- PUT /api/tests/[id] - Update test (status, notes, totalResponses)
- DELETE /api/tests/[id] - Delete test
- GET /api/tests/patient/[patientId] - Get all tests for a patient

Include authentication, validation, and cascade delete for responses.
```

### Prompt 6: Create Response API Routes
```
Create API routes for test response management:
- GET /api/responses/test/[testId] - Get all responses for a test
- POST /api/responses - Create new response
- PUT /api/responses/[id] - Update response
- DELETE /api/responses/[id] - Delete response

Fields: cardNumber, responseNumber, responseText, location, determinants, contentCategories, ban, obs, intenseTime, responseTime, formQuality, cValue
```

### Prompt 7: Create Auth Pages
```
Create the authentication pages:

/app/(auth)/login/page.tsx:
- Email and password form
- Zod validation
- Call signIn("credentials", {...})
- Error message display
- Link to signup
- Redirect to /dashboard on success

/app/(auth)/signup/page.tsx:
- Email, password, confirm password, full name form
- Zod validation
- Call /api/auth/signup
- Auto-login after successful signup
- Link to login

Match the styling from the original Auth.tsx component.
```

### Prompt 8: Create Dashboard Page
```
Migrate the Dashboard page to Next.js:

/app/(protected)/dashboard/page.tsx:
- Server component that checks auth
- Fetch initial patient data

/app/(protected)/dashboard/dashboard-client.tsx:
- Client component with all interactive features
- Patient list table (from PatientList.tsx)
- Add patient dialog (from PatientDialog.tsx)
- Stats cards (total patients, total tests, in-progress tests)
- Search/filter functionality

Use React Query hooks for data fetching and mutations.
```

### Prompt 9: Create Test Page
```
Migrate the TestPage to Next.js:

/app/(protected)/test/[patientId]/page.tsx:
- Server component for auth check and patient verification
- Fetch patient details and tests list

/app/(protected)/test/[patientId]/test-client.tsx:
- Display patient info header
- List all tests with date, status, response count
- Create new test button
- Delete test with confirmation dialog
- Navigate to /scoring/[testId] or /results/[testId]

Use React Query for data management.
```

### Prompt 10: Create Scoring Page
```
Migrate the ScoringPage to Next.js:

/app/(protected)/scoring/[testId]/page.tsx:
- Server component for auth check

/app/(protected)/scoring/[testId]/scoring-client.tsx:
- Card navigation (1-10)
- Response form with fields:
  - response_text (textarea)
  - location (SelectionModal with G, D, Dd, Dbl, Ddbl, Do)
  - determinants (SelectionModal with all 23 options)
  - content_categories (SelectionModal with all 17 options)
  - ban (checkbox)
  - intense_time, response_time (number inputs)
  - obs, form_quality, c_value (text inputs)
- Add response button
- List of existing responses for current card
- Edit/delete responses
- Auto-update total_responses on test

Use the existing SelectionModal component.
```

### Prompt 11: Create Results Page
```
Migrate the ResultsPage to Next.js:

/app/(protected)/results/[testId]/page.tsx:
- Server component for auth check

/app/(protected)/results/[testId]/results-client.tsx:
- Fetch all responses for test
- Call RorschachCalculator.calculateRorschachStats(responses)
- Display tabs:
  1. Overview - R, F%, RC%, TRI, F.compl, Ban%
  2. Location - G%, D%, Dd%, Dbl% with PercentageWithLines
  3. Determinants - All determinant counts and percentages
  4. Content - H%, A%, Anat%, etc.
  5. Timing - Average times, total time
- Use Progress component for visualizations
- Include TRINote component

Keep all calculation logic from RorschachCalculator.ts unchanged.
```

### Prompt 12: Final Integration
```
Complete the migration with final integration:

1. Create app/layout.tsx with:
   - AuthProvider
   - QueryClientProvider
   - Toaster
   - Global metadata

2. Create app/(protected)/layout.tsx with auth check

3. Create app/page.tsx that redirects to /dashboard

4. Create app/not-found.tsx (404 page)

5. Update all imports across the codebase

6. Create hooks/use-patients.ts, use-tests.ts, use-responses.ts with React Query

7. Test all functionality end-to-end

8. Clean up any unused files
```

---

## DATA MIGRATION PROMPT

After the code migration is complete, use this prompt to migrate existing data:

```
Create a data migration script to transfer data from Supabase to the new PostgreSQL database.

The script should:
1. Connect to Supabase using the service key
2. Connect to PostgreSQL using Prisma
3. Migrate in order (respecting foreign keys):
   - profiles → users (need to handle auth data separately)
   - patients
   - rorschach_tests
   - test_responses
4. Preserve original IDs for relation integrity
5. Handle date format conversions
6. Log progress and any errors
7. Support dry-run mode

Create the script at: scripts/migrate-data.ts
Include instructions for running it.
```

---

## VERIFICATION PROMPT

After migration, use this to verify everything works:

```
Perform a complete verification of the migrated Inkblot Insight application:

1. Authentication Flow:
   - Create a new user account
   - Log out and log back in
   - Verify session persists on refresh

2. Patient Management:
   - Create a new patient with all fields
   - Edit the patient
   - Verify unique medical record number constraint

3. Test Creation:
   - Create a new Rorschach test
   - Verify it appears in the test list
   - Check status is "in_progress"

4. Response Scoring:
   - Add responses for cards 1-10
   - Test all location options
   - Test all determinant options (multi-select)
   - Test all content options (multi-select)
   - Verify timing fields work
   - Edit a response
   - Delete a response

5. Results Calculation:
   - Navigate to results page
   - Verify all statistics are calculated
   - Check each tab displays correctly
   - Verify PercentageWithLines shows correct levels
   - Verify TRINote shows correct category

6. Edge Cases:
   - Test with 0 responses
   - Test with missing optional fields
   - Test concurrent updates

Report any issues found with steps to reproduce.
```

---

*Prompt Version: 1.0*
*Compatible with: Claude 3.5 Sonnet, Claude Opus, GPT-4*
