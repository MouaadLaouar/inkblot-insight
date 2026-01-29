# Landing Page Specification - Inkblot Insight

> **Document:** Landing Page Design & Implementation Spec
> **Version:** 1.0
> **Date:** January 2026
> **Target Market:** Algeria (Psychologists, Students, Institutions)

---

## Overview

### Product Name
**Inkblot Insight** (or placeholder `[App Name]`)

### Tagline Options
- "La cotation Rorschach simplifiée" (Rorschach scoring made simple)
- "L'outil professionnel de cotation psychologique" (Professional psychological scoring tool)
- "Cotez, analysez, soignez" (Score, analyze, heal)

### Target Audience
1. **Psychology Students** - Learning Rorschach scoring
2. **Independent Practitioners** - Private practice psychologists
3. **Institutions** - Hospitals, clinics, universities in Algeria

### Key Value Propositions
1. **Speed** - Score tests 5x faster than manual methods
2. **Accuracy** - Automatic calculations, no math errors
3. **Professional** - Generate PDF reports with your logo
4. **Affordable** - Plans starting from FREE (students)
5. **Local** - Made for Algerian professionals, prices in DZD

---

## Page Structure

### Navigation Bar
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Inkblot Insight    Fonctionnalités | Tarifs | FAQ    [Connexion] [Essayer Gratuit] │
└─────────────────────────────────────────────────────────────────────┘
```

**Navigation Items:**
- Logo (links to top)
- Fonctionnalités (Features) - scroll anchor
- Tarifs (Pricing) - scroll anchor
- FAQ - scroll anchor
- Connexion (Login) - link to /login
- Essayer Gratuit (Try Free) - CTA button, link to /signup

**Sticky on scroll:** Yes

---

## Section 1: Hero

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│    La cotation Rorschach                    [Hero Image/Animation] │
│    simplifiée pour les                      - Psychogram preview   │
│    professionnels                           - Dashboard mockup     │
│                                                                     │
│    Cotez vos tests en quelques clics,                              │
│    générez des psychogrammes précis,                               │
│    et concentrez-vous sur vos patients.                            │
│                                                                     │
│    [Commencer Gratuitement]  [Voir la Démo]                        │
│                                                                     │
│    ✓ Gratuit pour les étudiants  ✓ Sans carte bancaire             │
└─────────────────────────────────────────────────────────────────────┘
```

### Content
**Headline (H1):**
```
La cotation Rorschach simplifiée pour les professionnels
```

**Subheadline:**
```
Cotez vos tests en quelques clics, générez des psychogrammes précis,
et concentrez-vous sur vos patients.
```

**Primary CTA:** "Commencer Gratuitement" → /signup
**Secondary CTA:** "Voir la Démo" → opens demo video modal

**Trust Badges:**
- ✓ Gratuit pour les étudiants
- ✓ Sans carte bancaire requise
- ✓ Export PDF professionnel

### Hero Visual
Option A: Animated psychogram being filled
Option B: Dashboard screenshot with blur/gradient overlay
Option C: Rorschach inkblot with data visualization overlay

---

## Section 2: Social Proof (Optional)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  Utilisé par des psychologues dans plus de X établissements        │
│                                                                     │
│  [CHU Logo]  [Clinique Logo]  [University Logo]  [Hospital Logo]   │
└─────────────────────────────────────────────────────────────────────┘
```

**Note:** If no real logos yet, skip this section or use:
```
"Rejoignez les psychologues qui modernisent leur pratique"
```

---

## Section 3: Features (Fonctionnalités)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                     Tout ce dont vous avez besoin                   │
│           pour une cotation rapide et professionnelle               │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ 🎯           │  │ 📊          │  │ 📄          │              │
│  │ Cotation     │  │ Psychogramme│  │ Export PDF  │              │
│  │ Intuitive    │  │ Automatique │  │ Professionnel│             │
│  │              │  │             │  │              │              │
│  │ Sélectionnez │  │ Tous les    │  │ Rapports     │              │
│  │ localisation,│  │ indices     │  │ personnalisés│              │
│  │ déterminants │  │ calculés    │  │ avec votre   │              │
│  │ et contenus  │  │ en temps    │  │ logo         │              │
│  │ en un clic   │  │ réel        │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ 👥           │  │ 🔒          │  │ 📱          │              │
│  │ Gestion      │  │ Sécurité    │  │ Multi-      │              │
│  │ Patients     │  │ Maximale    │  │ Plateforme  │              │
│  │              │  │             │  │              │              │
│  │ Dossiers     │  │ Chiffrement │  │ Accédez     │              │
│  │ complets,    │  │ des données,│  │ depuis PC,  │              │
│  │ historique,  │  │ HTTPS,      │  │ tablette ou │              │
│  │ notes        │  │ sauvegardes │  │ smartphone  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

### Feature Cards Data

| Icon | Title | Description |
|------|-------|-------------|
| 🎯 | Cotation Intuitive | Sélectionnez localisation, déterminants et contenus en quelques clics. Interface conçue par des psychologues. |
| 📊 | Psychogramme Automatique | Tous les indices Rorschach calculés instantanément : R, TRI, F%, RC%, G%, D%, contenus et plus. |
| 📄 | Export PDF Professionnel | Générez des rapports complets personnalisables avec votre logo et en-tête de cabinet. |
| 👥 | Gestion Patients | Dossiers patients complets avec historique des tests, notes cliniques et fichiers joints. |
| 🔒 | Sécurité Maximale | Chiffrement HTTPS, données au repos chiffrées, sauvegardes quotidiennes automatiques. |
| 📱 | Multi-Plateforme | Accédez à vos dossiers depuis n'importe quel appareil : ordinateur, tablette ou smartphone. |

---

## Section 4: How It Works (Comment ça marche)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Comment ça marche ?                              │
│                                                                     │
│    ①                    ②                    ③                     │
│  Créez votre         Cotez les           Analysez les             │
│  patient             réponses            résultats                 │
│                                                                     │
│  [Screenshot 1]      [Screenshot 2]      [Screenshot 3]            │
│                                                                     │
│  Ajoutez les         Pour chaque         Le psychogramme          │
│  informations        réponse,            complet est généré       │
│  du patient en       sélectionnez        automatiquement.         │
│  quelques            localisation,       Exportez en PDF.         │
│  secondes.           déterminants        │
│                      et contenus.                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Steps Data

| Step | Title | Description |
|------|-------|-------------|
| 1 | Créez votre patient | Ajoutez les informations du patient en quelques secondes. Numéro de dossier, date de naissance, notes. |
| 2 | Cotez les réponses | Pour chaque planche (1-10), enregistrez les réponses. Sélectionnez localisation, déterminants et contenus en un clic. |
| 3 | Analysez les résultats | Le psychogramme complet est généré automatiquement avec tous les indices. Exportez le rapport en PDF. |

---

## Section 5: Tests Disponibles

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Tests Psychologiques Disponibles                 │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🖼️ TEST DE RORSCHACH                          ✅ Disponible │   │
│  │ Test projectif des 10 planches d'encre                      │   │
│  │ Cotation complète · Psychogramme · Indices TRI, F%, RC%     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌───────────────────────┐  ┌───────────────────────┐              │
│  │ 📋 BDI-II             │  │ 📋 BAI                │              │
│  │ Beck Depression       │  │ Beck Anxiety         │              │
│  │ ✅ Disponible        │  │ ✅ Disponible        │              │
│  └───────────────────────┘  └───────────────────────┘              │
│                                                                     │
│  ┌───────────────────────┐  ┌───────────────────────┐              │
│  │ 📋 Hamilton           │  │ 🖼️ TAT               │              │
│  │ Depression Scale      │  │ Test d'Aperception   │              │
│  │ ✅ Disponible        │  │ 🔜 Bientôt           │              │
│  └───────────────────────┘  └───────────────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Section 6: Pricing (Tarifs)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                         Tarifs Simples                              │
│             Un plan adapté à chaque pratique                        │
│                                                                     │
│  [Mensuel ○] [Annuel ● -17%]                                       │
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │   ÉTUDIANT   │ │  PRATICIEN   │ │ PRATICIEN+   │ │ INSTITUTION│ │
│  │              │ │   ⭐ Populaire│ │              │ │            │ │
│  │   GRATUIT    │ │  2,500 DZD   │ │  4,500 DZD   │ │  Dès       │ │
│  │              │ │    /mois     │ │    /mois     │ │ 110,000 DZD│ │
│  │   Pour       │ │              │ │              │ │    /an     │ │
│  │   toujours   │ │  25,000 DZD  │ │  45,000 DZD  │ │            │ │
│  │              │ │    /an       │ │    /an       │ │  5+ users  │ │
│  │              │ │              │ │              │ │            │ │
│  │ ✓ 3 patients │ │ ✓ Illimité  │ │ ✓ Tout de   │ │ ✓ Base     │ │
│  │ ✓ 5 tests/   │ │ ✓ Export PDF│ │   Praticien  │ │   partagée │ │
│  │   mois       │ │ ✓ Notes     │ │ ✓ Calendrier │ │ ✓ Admin    │ │
│  │ ✓ Psychogram │ │ ✓ Support   │ │ ✓ Facturati° │ │ ✓ Formation│ │
│  │   basique    │ │   WhatsApp  │ │ ✓ RDV en     │ │ ✓ Support  │ │
│  │              │ │              │ │   ligne      │ │   dédié    │ │
│  │              │ │              │ │ ✓ 20 GB     │ │            │ │
│  │              │ │              │ │              │ │            │ │
│  │ [S'inscrire] │ │[Commencer]  │ │ [Commencer]  │ │[Nous       │ │
│  │              │ │              │ │              │ │ Contacter] │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Pricing Cards Data

#### Plan: Étudiant (Student)
```json
{
  "name": "Étudiant",
  "price": "GRATUIT",
  "period": "Pour toujours",
  "description": "Pour les étudiants en psychologie",
  "badge": null,
  "features": [
    "3 patients maximum",
    "5 tests Rorschach/mois",
    "5 tests dépistage/mois",
    "Psychogramme basique",
    "Support email"
  ],
  "limitations": [
    "Pas d'export PDF",
    "Historique 30 jours",
    "Filigrane sur résultats"
  ],
  "cta": "S'inscrire Gratuitement",
  "ctaVariant": "outline",
  "eligibility": "Email .edu.dz ou certificat de scolarité requis"
}
```

#### Plan: Praticien (Practitioner)
```json
{
  "name": "Praticien",
  "price": {
    "monthly": "2,500 DZD",
    "yearly": "25,000 DZD"
  },
  "period": "/mois",
  "yearlyNote": "2 mois gratuits",
  "description": "Pour les psychologues indépendants",
  "badge": "Populaire",
  "features": [
    "Patients illimités",
    "Tests illimités",
    "Psychogramme complet",
    "Export PDF professionnel",
    "Notes & fichiers patients",
    "Historique illimité",
    "Support WhatsApp",
    "5 GB stockage"
  ],
  "cta": "Commencer",
  "ctaVariant": "default"
}
```

#### Plan: Praticien+ (Premium)
```json
{
  "name": "Praticien+",
  "price": {
    "monthly": "4,500 DZD",
    "yearly": "45,000 DZD"
  },
  "period": "/mois",
  "yearlyNote": "2 mois gratuits",
  "description": "Praticien + Gestion de cabinet",
  "badge": null,
  "features": [
    "Tout de Praticien, plus :",
    "Calendrier intégré",
    "Prise de RDV en ligne",
    "Rappels patients automatiques",
    "Facturation",
    "Suivi des paiements",
    "Notes de séance SOAP",
    "20 GB stockage",
    "Support prioritaire (< 4h)"
  ],
  "cta": "Commencer",
  "ctaVariant": "default"
}
```

#### Plan: Institution
```json
{
  "name": "Institution",
  "price": "Dès 110,000 DZD",
  "period": "/an",
  "description": "Pour les équipes et établissements",
  "badge": null,
  "subPlans": [
    { "users": 5, "price": "110,000 DZD/an", "perUser": "1,833 DZD/mois" },
    { "users": 10, "price": "180,000 DZD/an", "perUser": "1,500 DZD/mois", "popular": true },
    { "users": 20, "price": "300,000 DZD/an", "perUser": "1,250 DZD/mois" },
    { "users": 50, "price": "600,000 DZD/an", "perUser": "1,000 DZD/mois" }
  ],
  "features": [
    "Base patients partagée",
    "Rôles utilisateurs (Admin/User)",
    "Dashboard administrateur",
    "Logo sur rapports PDF",
    "Formation sur site incluse",
    "Support dédié",
    "Facture officielle"
  ],
  "cta": "Demander un Devis",
  "ctaVariant": "outline"
}
```

### Pricing Toggle
- **Monthly/Yearly toggle** that switches displayed prices
- Yearly shows badge: "2 mois GRATUITS" or "-17%"

---

## Section 7: Institution Plans Detail

### Layout (Expandable or separate section)
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Plans Institution                                │
│         Plus vous êtes nombreux, plus vous économisez              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  5 utilisateurs     │  110,000 DZD/an  │ 1,833 DZD/user/mois│   │
│  │  Petits cabinets                       │ -27% vs individuel │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  10 utilisateurs ⭐ │  180,000 DZD/an  │ 1,500 DZD/user/mois│   │
│  │  Cliniques moyennes │ PLUS POPULAIRE   │ -40% vs individuel │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  20 utilisateurs    │  300,000 DZD/an  │ 1,250 DZD/user/mois│   │
│  │  Hôpitaux                              │ -50% vs individuel │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  50 utilisateurs    │  600,000 DZD/an  │ 1,000 DZD/user/mois│   │
│  │  Grands établissements                 │ -60% vs individuel │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Plus de 50 utilisateurs ? [Contactez-nous pour un devis]          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Section 8: Comparison Table (Tableau Comparatif)

### Collapsible/Expandable Section
```
┌─────────────────────────────────────────────────────────────────────┐
│              [Voir le tableau comparatif complet ▼]                 │
│                                                                     │
│ (Expanded)                                                          │
│ ┌───────────────────┬──────────┬──────────┬──────────┬───────────┐ │
│ │                   │ Étudiant │ Praticien│Praticien+│Institution│ │
│ ├───────────────────┼──────────┼──────────┼──────────┼───────────┤ │
│ │ Patients          │ 3        │ Illimité │ Illimité │ Illimité  │ │
│ │ Tests/mois        │ 5        │ Illimité │ Illimité │ Illimité  │ │
│ │ Psychogramme      │ Basique  │ Complet  │ Complet  │ Complet   │ │
│ │ Export PDF        │ ❌       │ ✅       │ ✅       │ ✅ + Logo │ │
│ │ Notes patient     │ ❌       │ ✅       │ ✅       │ ✅        │ │
│ │ Calendrier/RDV    │ ❌       │ ❌       │ ✅       │ Option    │ │
│ │ Facturation       │ ❌       │ ❌       │ ✅       │ Option    │ │
│ │ Multi-utilisateur │ ❌       │ ❌       │ ❌       │ ✅        │ │
│ │ Support           │ Email    │ WhatsApp │ Priorité │ Dédié     │ │
│ └───────────────────┴──────────┴──────────┴──────────┴───────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Section 9: Testimonials (Témoignages)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                Ce qu'en disent nos utilisateurs                     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ "Inkblot Insight m'a fait gagner un temps précieux.         │   │
│  │  La cotation qui me prenait 30 minutes se fait              │   │
│  │  maintenant en 5 minutes."                                   │   │
│  │                                                              │   │
│  │  — Dr. Amina B., Psychologue clinicienne, Alger             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ "En tant qu'étudiant, avoir accès gratuitement à un         │   │
│  │  outil professionnel comme celui-ci est inestimable."       │   │
│  │                                                              │   │
│  │  — Karim M., Master 2 Psychologie, Université d'Oran        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ "Nous avons équipé tout notre service avec le plan          │   │
│  │  Institution. La base partagée nous permet un suivi         │   │
│  │  optimal des patients."                                      │   │
│  │                                                              │   │
│  │  — Service Psychiatrie, CHU Mustapha Pacha                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**Note:** Use real testimonials when available. These are placeholder examples.

---

## Section 10: FAQ

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Questions Fréquentes                             │
│                                                                     │
│  ▸ Comment fonctionne le plan Étudiant gratuit ?                   │
│    Le plan Étudiant est entièrement gratuit et le restera          │
│    toujours. Vous devez simplement prouver votre statut            │
│    d'étudiant avec un email .edu.dz ou un certificat.              │
│                                                                     │
│  ▸ Mes données sont-elles sécurisées ?                             │
│    Oui. Chiffrement HTTPS, données chiffrées au repos,             │
│    sauvegardes quotidiennes, conformité aux normes médicales.      │
│                                                                     │
│  ▸ Puis-je exporter mes données si je quitte ?                     │
│    Oui. Exportez toutes vos données en CSV à tout moment.          │
│                                                                     │
│  ▸ Quels moyens de paiement acceptez-vous ?                        │
│    CIB, EDAHABIA, BaridiMob, virement bancaire (annuel).           │
│                                                                     │
│  ▸ Puis-je changer de plan ?                                       │
│    Oui. Upgrade à tout moment (prorata). Downgrade en fin          │
│    de période.                                                      │
│                                                                     │
│  ▸ Proposez-vous des formations ?                                  │
│    Oui, incluses dans les plans Institution.                       │
│                                                                     │
│  [Voir toutes les questions →]                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### FAQ Data

```json
[
  {
    "question": "Comment fonctionne le plan Étudiant gratuit ?",
    "answer": "Le plan Étudiant est entièrement gratuit et le restera toujours. Vous devez simplement prouver votre statut d'étudiant avec un email universitaire (.edu.dz) ou un certificat de scolarité. La vérification prend 24-48h."
  },
  {
    "question": "Mes données sont-elles sécurisées ?",
    "answer": "Absolument. Nous utilisons le chiffrement HTTPS pour les transferts, le chiffrement au repos pour les données stockées, et effectuons des sauvegardes quotidiennes automatiques. Nous respectons les normes de confidentialité des données médicales."
  },
  {
    "question": "Puis-je exporter mes données si je quitte ?",
    "answer": "Oui. Vous pouvez exporter toutes vos données (patients, tests, résultats) en format CSV à tout moment depuis les paramètres de votre compte."
  },
  {
    "question": "Quels moyens de paiement acceptez-vous ?",
    "answer": "Nous acceptons les cartes CIB, EDAHABIA, BaridiMob pour tous les paiements. Le virement bancaire est disponible pour les paiements annuels et tous les plans Institution."
  },
  {
    "question": "Puis-je changer de plan ?",
    "answer": "Oui. Vous pouvez upgrader à tout moment - la différence est calculée au prorata. Pour un downgrade, le changement prend effet à la fin de votre période payée actuelle."
  },
  {
    "question": "Proposez-vous des formations ?",
    "answer": "Oui. Des sessions de formation sont incluses dans tous les plans Institution (1 à 5 sessions selon le plan). Pour les autres plans, des tutoriels vidéo sont disponibles."
  },
  {
    "question": "Que se passe-t-il si je ne renouvelle pas ?",
    "answer": "Votre compte passe en lecture seule. Vos données sont conservées pendant 90 jours, vous laissant le temps d'exporter. Après 90 jours, les données sont supprimées."
  },
  {
    "question": "Comment obtenir un devis Institution ?",
    "answer": "Envoyez un email à contact@inkblot-insight.com avec le nom de votre établissement, le nombre d'utilisateurs souhaité, et vos coordonnées. Nous vous répondons sous 48h avec un devis officiel."
  }
]
```

---

## Section 11: CTA Section

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│     Prêt à moderniser votre pratique ?                             │
│                                                                     │
│     Rejoignez les psychologues qui gagnent du temps                │
│     et améliorent la qualité de leurs évaluations.                 │
│                                                                     │
│     [Commencer Gratuitement]                                       │
│                                                                     │
│     Pas de carte bancaire requise • Configuration en 2 minutes     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Gradient Background
Use brand gradient (blue → teal) from design system

---

## Section 12: Footer

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] Inkblot Insight                                            │
│                                                                     │
│  Produit              Support              Légal                   │
│  ─────────            ─────────            ─────────               │
│  Fonctionnalités      Contact              Conditions d'utilisation│
│  Tarifs               FAQ                  Politique de            │
│  Démo                 Documentation        confidentialité         │
│                       Formation                                     │
│                                                                     │
│  Contact                                                            │
│  ─────────                                                          │
│  contact@inkblot-insight.com                                       │
│  WhatsApp: +213 XX XX XX XX                                        │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  © 2026 Inkblot Insight - Tous droits réservés                     │
│  Conçu avec ♥ en Algérie                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Design Specifications

### Colors (from existing design system)

```css
:root {
  /* Primary - Clinical Blue */
  --primary: 217 91% 60%;
  --primary-foreground: 0 0% 100%;

  /* Secondary - Clinical Teal */
  --secondary: 174 72% 56%;
  --secondary-foreground: 0 0% 100%;

  /* Background */
  --background: 0 0% 100%;
  --foreground: 215 25% 27%;

  /* Muted */
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;

  /* Accents */
  --accent: 210 40% 96%;
  --destructive: 0 84% 60%;
}
```

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 (Hero) | Inter/System | 48-64px | 700 |
| H2 (Section) | Inter/System | 32-40px | 600 |
| H3 (Card Title) | Inter/System | 20-24px | 600 |
| Body | Inter/System | 16-18px | 400 |
| Small | Inter/System | 14px | 400 |

### Spacing

- Section padding: 80px vertical (desktop), 40px (mobile)
- Card padding: 24px
- Gap between cards: 24px
- Container max-width: 1200px

### Shadows

```css
.card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-hover:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### Responsive Breakpoints

| Breakpoint | Width | Columns |
|------------|-------|---------|
| Mobile | < 640px | 1 |
| Tablet | 640-1024px | 2 |
| Desktop | > 1024px | 3-4 |

---

## Components to Create

### New Components Needed

1. **`LandingNav`** - Sticky navigation with scroll detection
2. **`HeroSection`** - Hero with gradient background
3. **`FeatureCard`** - Reusable feature card component
4. **`PricingCard`** - Pricing tier card with badge support
5. **`PricingToggle`** - Monthly/Yearly switch
6. **`InstitutionTable`** - Institution plans comparison
7. **`TestimonialCard`** - Testimonial with quote and attribution
8. **`FAQAccordion`** - Expandable FAQ items
9. **`CTASection`** - Gradient CTA section
10. **`Footer`** - Multi-column footer

### Existing Components to Reuse

- Button (ShadCN)
- Badge (ShadCN)
- Card (ShadCN)
- Accordion (ShadCN)
- Tabs (ShadCN)
- Switch (ShadCN for pricing toggle)

---

## SEO & Meta Tags

```html
<title>Inkblot Insight - Cotation Rorschach Professionnelle | Psychologues Algérie</title>
<meta name="description" content="Outil professionnel de cotation du test de Rorschach pour psychologues. Psychogramme automatique, export PDF, gestion patients. Gratuit pour étudiants.">
<meta name="keywords" content="rorschach, cotation, psychogramme, psychologie, test projectif, algérie, psychologue">

<!-- Open Graph -->
<meta property="og:title" content="Inkblot Insight - Cotation Rorschach Professionnelle">
<meta property="og:description" content="Cotez vos tests Rorschach en quelques clics. Psychogramme automatique, export PDF professionnel.">
<meta property="og:image" content="/og-image.png">
<meta property="og:type" content="website">
```

---

## Animations

### Scroll Animations (using Framer Motion or CSS)

1. **Fade up** - Elements fade in and move up as they enter viewport
2. **Stagger** - Feature cards animate in sequence
3. **Number counter** - Stats animate counting up

### Micro-interactions

1. **Button hover** - Scale 1.02 + shadow increase
2. **Card hover** - Lift effect (translateY -4px)
3. **Pricing toggle** - Smooth price transition
4. **FAQ expand** - Smooth height animation

---

## Performance Considerations

1. **Images** - Use Next.js Image component with optimization
2. **Fonts** - Use next/font for optimal loading
3. **Lazy loading** - Load below-fold sections lazily
4. **Bundle size** - Keep landing page dependencies minimal

---

## File Structure for Landing Page

```
app/
├── (marketing)/
│   ├── layout.tsx           # Marketing layout (no auth)
│   └── page.tsx             # Landing page
├── components/
│   └── landing/
│       ├── nav.tsx
│       ├── hero.tsx
│       ├── features.tsx
│       ├── how-it-works.tsx
│       ├── tests-available.tsx
│       ├── pricing.tsx
│       ├── pricing-card.tsx
│       ├── pricing-toggle.tsx
│       ├── institution-plans.tsx
│       ├── testimonials.tsx
│       ├── faq.tsx
│       ├── cta-section.tsx
│       └── footer.tsx
└── lib/
    └── pricing-data.ts      # Pricing plans data
```

---

*Document Version: 1.0*
*Last Updated: January 2026*
