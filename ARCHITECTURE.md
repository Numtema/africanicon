
# 🏗️ Architecture Backend : AfriIcon Studio SaaS

Cette architecture est conçue pour gérer des milliers d'utilisateurs, le stockage massif d'assets, et des workflows d'IA complexes (Agents).

## 🛰️ 1. Global Tech Stack
*   **API Framework :** FastAPI (Python) ou NestJS (Node.js). Python est recommandé pour une intégration plus poussée avec les bibliothèques d'IA.
*   **Database :** PostgreSQL (Relationnel) + Prisma ou SQLAlchemy (ORM).
*   **Cache :** Redis (Gestion des sessions, rate-limiting des appels API Gemini).
*   **Storage :** Google Cloud Storage ou AWS S3 (pour les fichiers PNG/SVG générés).
*   **Auth :** Clerk ou Supabase Auth (Multi-tenancy, gestion des organisations).
*   **Billing :** Stripe (Abonnements Pro, crédits de génération).

## 🗄️ 2. Schéma de Données (PostgreSQL)
Le cœur de la persistance pour un SaaS multi-utilisateurs.

```sql
-- Utilisateurs et Organisations
Table users {
  id uuid [pk]
  email varchar [unique]
  stripe_customer_id varchar
  subscription_tier enum('free', 'pro', 'enterprise')
  created_at timestamp
}

Table projects {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  name varchar
  original_content text -- Le texte du site analysé
  palette_id varchar
  style_id varchar
  created_at timestamp
}

-- Les icônes générées
Table generated_icons {
  id uuid [pk]
  project_id uuid [ref: > projects.id]
  storage_url varchar -- Lien vers S3/GCS
  name varchar
  category varchar
  prompt_used text
  settings jsonb -- Stocke colorIntensity, lineThickness, etc.
  is_refined boolean [default: false]
  parent_icon_id uuid -- Pour l'historique des modifications
}

-- Audit / Suggestions
Table audit_suggestions {
  id uuid [pk]
  project_id uuid [ref: > projects.id]
  icon_name varchar
  category enum
  styling_logic text
}
```

## 🧠 3. Structure des Agents (AI Workflow)
Pour passer d'un simple appel API à un système intelligent, on utilise une approche Agentique.

### A. L'Agent Auditeur (The Architect)
*   **Rôle :** Analyse le texte/URL de l'utilisateur.
*   **Action :** Décompose le besoin fonctionnel en une liste de 20+ tokens iconographiques.
*   **Output :** JSON structuré validé par le backend.

### B. L'Agent Designer (The Stylist)
*   **Rôle :** Traduit la palette et le style choisi en paramètres techniques Gemini.
*   **Action :** Applique les règles de design (ex: si style=Wood, injecter des prompts de texture fibreuse).
*   **Output :** Prompt final optimisé.

### C. L'Agent Critique (Quality Control)
*   **Rôle :** Lorsque l'utilisateur demande une "modification".
*   **Action :** Compare l'image précédente (Vision API) avec l'instruction de l'utilisateur pour générer le prompt de "différence" (Refinement).

## 🚀 4. Workflow SaaS (Processus complet)
1.  **Ingestion :** L'utilisateur poste une URL. Le backend valide les crédits (Stripe).
2.  **Audit :** L'Agent Auditeur tourne et stocke les suggestions dans audit_suggestions.
3.  **Génération :**
    *   Appel à Gemini 2.5 Flash pour l'image.
    *   Upload immédiat vers S3.
    *   Ecriture de l'URL et des settings dans generated_icons.
4.  **Optimisation :** Un worker asynchrone (Celery/RabbitMQ) peut vectoriser l'image (PNG → SVG) en arrière-plan.
5.  **Livraison :** Le frontend reçoit l'URL signée du storage.

## 🛡️ 5. Sécurité & Performance
*   **Rate Limiting :** Empêcher un utilisateur de vider votre quota Gemini en 1 minute.
*   **Webhooks Stripe :** Pour activer/désactiver les fonctionnalités Pro instantanément.
*   **Stateless API :** Pour pouvoir scaler horizontalement sur Docker/Kubernetes.
*   **Vector Database (Optionnel) :** Utiliser Pinecone pour permettre aux utilisateurs de chercher dans leurs propres icônes par "sens" (ex: "Trouve moi une icône qui parle de nature").

## 📈 6. Roadmap Évolutive (SaaS)
*   **V1 :** Génération simple (ce que nous avons).
*   **V2 :** Export SVG (Vectorisation côté serveur).
*   **V3 :** Plugins Figma / Adobe Express (API publique).
*   **V4 :** Fine-tuning (Entraîner un modèle spécifique sur des motifs Kente/Bogolan réels pour une précision culturelle imbattable).
