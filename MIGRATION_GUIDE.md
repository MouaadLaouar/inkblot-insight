# Migration Guide: React + Vite + Supabase → Next.js + PostgreSQL + Prisma

## Table of Contents

1. [Project Overview](#project-overview)
2. [Current Architecture](#current-architecture)
3. [Target Architecture](#target-architecture)
4. [Migration Strategy](#migration-strategy)
5. [Step-by-Step Migration Plan](#step-by-step-migration-plan)
6. [Database Schema Migration](#database-schema-migration)
7. [Authentication Migration](#authentication-migration)
8. [Component Migration](#component-migration)
9. [API Routes Creation](#api-routes-creation)
10. [Environment Variables](#environment-variables)
11. [Testing Checklist](#testing-checklist)
12. [Rollback Plan](#rollback-plan)

---

## Project Overview

**Application Name:** Inkblot Insight
**Purpose:** Clinical Rorschach Test Scoring Application
**Current Stack:** React 18 + Vite + Supabase + TypeScript
**Target Stack:** Next.js 14 (App Router) + PostgreSQL + Prisma + TypeScript

### Key Features to Migrate
- User authentication (email/password)
- Patient management (CRUD)
- Rorschach test management
- Response scoring with complex calculations
- Results visualization with statistics

---

## Current Architecture

### Tech Stack
| Layer | Current Technology |
|-------|-------------------|
| Framework | React 18.3.1 |
| Build Tool | Vite 5.4.19 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| ORM | Supabase JS Client |
| Styling | Tailwind CSS 3.4.17 |
| UI Components | ShadCN UI (Radix) |
| State Management | React Context + React Query |
| Routing | React Router v6 |

### Current File Structure
```
src/
├── pages/                    # Page components
│   ├── Auth.tsx             # Login/Signup
│   ├── Dashboard.tsx        # Main dashboard
│   ├── TestPage.tsx         # Patient tests
│   ├── ScoringPage.tsx      # Response scoring
│   ├── ResultsPage.tsx      # Results display
│   └── NotFound.tsx         # 404 page
├── components/
│   ├── PatientDialog.tsx    # Patient form modal
│   ├── PatientList.tsx      # Patient table
│   ├── ProtectedRoute.tsx   # Auth wrapper
│   ├── SelectionModal.tsx   # Selection modal
│   ├── PercentageWithLines.tsx
│   ├── TRINote.tsx
│   └── ui/                  # ShadCN components (50+)
├── lib/
│   ├── auth.tsx             # Auth context
│   ├── RorschachCalculator.ts
│   ├── rorschachConstants.ts
│   ├── rangeSets.ts
│   └── utils.ts
├── hooks/
│   ├── use-toast.ts
│   └── use-mobile.tsx
├── integrations/supabase/
│   ├── client.ts            # Supabase client
│   └── types.ts             # Generated types
├── App.tsx
├── main.tsx
└── index.css
```

### Current Routes
| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | Redirect to `/dashboard` | No |
| `/auth` | Auth.tsx | No |
| `/dashboard` | Dashboard.tsx | Yes |
| `/test/:patientId` | TestPage.tsx | Yes |
| `/scoring/:testId` | ScoringPage.tsx | Yes |
| `/results/:testId` | ResultsPage.tsx | Yes |
| `*` | NotFound.tsx | No |

### Current Database Schema (Supabase)
```
profiles
├── id (UUID, PK)
├── full_name (string)
├── role (string?)
├── created_at, updated_at

patients
├── id (UUID, PK)
├── first_name, last_name (string)
├── medical_record_number (string, unique per user)
├── date_of_birth (string)
├── gender (string?)
├── notes (string?)
├── created_by (FK → profiles.id)
├── created_at, updated_at

rorschach_tests
├── id (UUID, PK)
├── patient_id (FK → patients.id)
├── created_by (FK → profiles.id)
├── test_date (string)
├── status ("in_progress" | "completed")
├── total_responses (number)
├── notes (string?)
├── created_at, updated_at

test_responses
├── id (UUID, PK)
├── test_id (FK → rorschach_tests.id)
├── card_number (1-10)
├── response_number (number)
├── response_text (string)
├── location (enum)
├── determinants (string)
├── content_categories (string)
├── ban (boolean)
├── obs (string?)
├── intense_time (number?)
├── response_time (number?)
├── form_quality (string?)
├── c_value (string?)
├── created_at, updated_at
```

---

## Target Architecture

### Tech Stack
| Layer | Target Technology |
|-------|-------------------|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL (self-hosted or cloud) |
| ORM | Prisma |
| Auth | NextAuth.js v5 (Auth.js) |
| Styling | Tailwind CSS 3.4 |
| UI Components | ShadCN UI (keep existing) |
| State Management | React Context + TanStack Query |
| Routing | Next.js App Router |

### Target File Structure
```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (protected)/
│   ├── layout.tsx           # Auth check wrapper
│   ├── dashboard/page.tsx
│   ├── test/[patientId]/page.tsx
│   ├── scoring/[testId]/page.tsx
│   └── results/[testId]/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── patients/
│   │   ├── route.ts         # GET all, POST create
│   │   └── [id]/route.ts    # GET one, PUT, DELETE
│   ├── tests/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── responses/
│       ├── route.ts
│       └── [id]/route.ts
├── layout.tsx               # Root layout
├── page.tsx                 # Home redirect
└── not-found.tsx

components/
├── patients/
│   ├── patient-dialog.tsx
│   └── patient-list.tsx
├── scoring/
│   ├── selection-modal.tsx
│   ├── percentage-with-lines.tsx
│   └── tri-note.tsx
├── providers/
│   ├── auth-provider.tsx
│   └── query-provider.tsx
└── ui/                      # ShadCN (unchanged)

lib/
├── auth.ts                  # NextAuth config
├── prisma.ts                # Prisma client
├── rorschach-calculator.ts
├── rorschach-constants.ts
├── range-sets.ts
└── utils.ts

prisma/
├── schema.prisma
├── migrations/
└── seed.ts

types/
└── index.ts                 # Shared types
```

---

## Migration Strategy

### Approach: Parallel Development + Incremental Switch

**Phase 1: Infrastructure Setup**
- Set up Next.js project structure
- Configure Prisma with PostgreSQL
- Set up NextAuth.js
- Create API routes

**Phase 2: Database Migration**
- Define Prisma schema matching Supabase
- Create migrations
- Migrate existing data from Supabase

**Phase 3: Component Migration**
- Move ShadCN components (copy as-is)
- Convert pages to Next.js pages/routes
- Update imports and paths

**Phase 4: Business Logic Migration**
- Replace Supabase client calls with API calls
- Update auth context to use NextAuth
- Keep calculation utilities unchanged

**Phase 5: Testing & Deployment**
- Test all functionality
- Performance optimization
- Deploy to Vercel/other platform

---

## Step-by-Step Migration Plan

### Step 1: Initialize Next.js Project

```bash
# Create new Next.js app in a temporary directory
npx create-next-app@latest inkblot-insight-next --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

# Or upgrade in place (more complex)
```

**Required packages:**
```bash
npm install prisma @prisma/client
npm install next-auth@beta @auth/prisma-adapter
npm install @tanstack/react-query
npm install zod react-hook-form @hookform/resolvers
npm install lucide-react
npm install sonner
npm install date-fns
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

### Step 2: Configure Prisma

**prisma/schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  fullName      String?   @map("full_name")
  role          String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  patients      Patient[]
  tests         RorschachTest[]

  @@map("users")
}

model Patient {
  id                   String   @id @default(cuid())
  firstName            String   @map("first_name")
  lastName             String   @map("last_name")
  medicalRecordNumber  String   @map("medical_record_number")
  dateOfBirth          String   @map("date_of_birth")
  gender               String?
  notes                String?
  createdBy            String   @map("created_by")
  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  user                 User     @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  tests                RorschachTest[]

  @@unique([createdBy, medicalRecordNumber])
  @@map("patients")
}

model RorschachTest {
  id             String   @id @default(cuid())
  patientId      String   @map("patient_id")
  createdBy      String   @map("created_by")
  testDate       String   @map("test_date")
  status         String   @default("in_progress")
  totalResponses Int      @default(0) @map("total_responses")
  notes          String?
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  patient        Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  user           User     @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  responses      TestResponse[]

  @@map("rorschach_tests")
}

model TestResponse {
  id                String   @id @default(cuid())
  testId            String   @map("test_id")
  cardNumber        Int      @map("card_number")
  responseNumber    Int      @map("response_number")
  responseText      String   @map("response_text")
  location          String
  determinants      String
  contentCategories String   @map("content_categories")
  ban               Boolean  @default(false)
  obs               String?
  intenseTime       Int?     @map("intense_time")
  responseTime      Int?     @map("response_time")
  formQuality       String?  @map("form_quality")
  cValue            String?  @map("c_value")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  test              RorschachTest @relation(fields: [testId], references: [id], onDelete: Cascade)

  @@map("test_responses")
}
```

### Step 3: Configure NextAuth.js

**lib/auth.ts:**
```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.fullName
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
})
```

### Step 4: Create API Routes

**Example: app/api/patients/route.ts**
```typescript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const patients = await prisma.patient.findMany({
    where: { createdBy: session.user.id },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(patients)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const patient = await prisma.patient.create({
    data: {
      ...body,
      createdBy: session.user.id
    }
  })

  return NextResponse.json(patient, { status: 201 })
}
```

### Step 5: Convert Pages to Next.js App Router

**Example: app/(protected)/dashboard/page.tsx**
```typescript
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return <DashboardClient userId={session.user.id} />
}
```

---

## Database Schema Migration

### Migration Script (Supabase → PostgreSQL)

```typescript
// scripts/migrate-data.ts
import { createClient } from "@supabase/supabase-js"
import { PrismaClient } from "@prisma/client"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const prisma = new PrismaClient()

async function migrateData() {
  // 1. Migrate users (profiles)
  const { data: profiles } = await supabase.from("profiles").select("*")
  for (const profile of profiles || []) {
    await prisma.user.create({
      data: {
        id: profile.id,
        email: `${profile.id}@migrated.local`, // Need to get from auth
        password: "NEEDS_RESET",
        fullName: profile.full_name,
        role: profile.role,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at)
      }
    })
  }

  // 2. Migrate patients
  const { data: patients } = await supabase.from("patients").select("*")
  for (const patient of patients || []) {
    await prisma.patient.create({
      data: {
        id: patient.id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        medicalRecordNumber: patient.medical_record_number,
        dateOfBirth: patient.date_of_birth,
        gender: patient.gender,
        notes: patient.notes,
        createdBy: patient.created_by,
        createdAt: new Date(patient.created_at),
        updatedAt: new Date(patient.updated_at)
      }
    })
  }

  // 3. Migrate tests
  const { data: tests } = await supabase.from("rorschach_tests").select("*")
  for (const test of tests || []) {
    await prisma.rorschachTest.create({
      data: {
        id: test.id,
        patientId: test.patient_id,
        createdBy: test.created_by,
        testDate: test.test_date,
        status: test.status,
        totalResponses: test.total_responses || 0,
        notes: test.notes,
        createdAt: new Date(test.created_at),
        updatedAt: new Date(test.updated_at)
      }
    })
  }

  // 4. Migrate responses
  const { data: responses } = await supabase.from("test_responses").select("*")
  for (const response of responses || []) {
    await prisma.testResponse.create({
      data: {
        id: response.id,
        testId: response.test_id,
        cardNumber: response.card_number,
        responseNumber: response.response_number,
        responseText: response.response_text,
        location: response.location,
        determinants: response.determinants,
        contentCategories: response.content_categories,
        ban: response.ban || false,
        obs: response.obs,
        intenseTime: response.intense_time,
        responseTime: response.response_time,
        formQuality: response.form_quality,
        cValue: response.c_value,
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.updated_at)
      }
    })
  }

  console.log("Migration complete!")
}

migrateData()
```

---

## Authentication Migration

### Before (Supabase Auth)
```typescript
// Current: src/lib/auth.tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

### After (NextAuth.js)
```typescript
// New: Using server action or API route
import { signIn } from "next-auth/react"

await signIn("credentials", {
  email,
  password,
  redirect: false
})
```

### Auth Context Migration

**Before:**
```typescript
export function useAuth() {
  const context = useContext(AuthContext)
  // Returns: user, session, loading, signOut
}
```

**After:**
```typescript
import { useSession, signOut } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()
  return {
    user: session?.user,
    loading: status === "loading",
    signOut
  }
}
```

---

## Component Migration

### Files That Need No Changes
- All `components/ui/*` (ShadCN components)
- `lib/RorschachCalculator.ts`
- `lib/rorschachConstants.ts`
- `lib/rangeSets.ts`
- `lib/utils.ts` (except maybe cn import path)

### Files That Need Modifications

| File | Changes Required |
|------|------------------|
| `Auth.tsx` | Convert to login/signup pages, use NextAuth |
| `Dashboard.tsx` | Convert to server/client components, use API routes |
| `TestPage.tsx` | Update data fetching to use API |
| `ScoringPage.tsx` | Update data fetching to use API |
| `ResultsPage.tsx` | Update data fetching to use API |
| `PatientDialog.tsx` | Update to call API instead of Supabase |
| `PatientList.tsx` | Update to call API instead of Supabase |
| `ProtectedRoute.tsx` | Replace with Next.js middleware |

### Import Path Changes
```typescript
// Before
import { supabase } from "@/integrations/supabase/client"

// After
// Use fetch() to call API routes, or server actions
const response = await fetch("/api/patients")
const patients = await response.json()
```

---

## Environment Variables

### Current (.env)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### New (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: Keep Supabase for migration
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
```

---

## Testing Checklist

### Authentication
- [ ] User can sign up with email/password
- [ ] User can log in
- [ ] User can log out
- [ ] Protected routes redirect to login
- [ ] Session persists across page refreshes

### Patients
- [ ] List all patients for current user
- [ ] Create new patient
- [ ] Edit existing patient
- [ ] Delete patient
- [ ] Patient search/filter works

### Tests
- [ ] List tests for a patient
- [ ] Create new test
- [ ] Delete test
- [ ] Test status updates correctly

### Scoring
- [ ] Add response to test
- [ ] Edit response
- [ ] Delete response
- [ ] All location options work
- [ ] All determinant options work
- [ ] All content options work
- [ ] Timing fields work

### Results
- [ ] Statistics calculate correctly
- [ ] Charts render properly
- [ ] All tabs display data
- [ ] Export functionality (if any)

### Performance
- [ ] Page load times acceptable
- [ ] No excessive API calls
- [ ] Images/assets optimized

---

## Rollback Plan

If migration fails:

1. **Keep Supabase running** during migration period
2. **DNS/Deployment switch**: Deploy new version to staging first
3. **Database backup**: Export PostgreSQL data before any changes
4. **Feature flag**: Use environment variable to switch between backends

```typescript
const USE_NEW_BACKEND = process.env.NEXT_PUBLIC_USE_NEW_BACKEND === "true"

if (USE_NEW_BACKEND) {
  // Use Prisma/PostgreSQL
} else {
  // Use Supabase
}
```

---

## Timeline Estimate

| Phase | Tasks | Complexity |
|-------|-------|-----------|
| Phase 1 | Next.js + Prisma + NextAuth setup | Medium |
| Phase 2 | API routes creation | Medium |
| Phase 3 | Page migrations | Medium-High |
| Phase 4 | Data migration script | Medium |
| Phase 5 | Testing & bug fixes | High |
| Phase 6 | Deployment | Low |

---

## Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://authjs.dev)
- [ShadCN UI](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)

---

*Document Version: 1.0*
*Last Updated: 2026-01-29*
