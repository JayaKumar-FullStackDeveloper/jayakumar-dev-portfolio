# Project management module — Firebase setup

Firebase project: `portfolio-f3161` (Spark plan). The site stays a Create React App
build on Netlify. Firebase Authentication handles the admin login. Cloud Firestore
stores projects, categories, the audit trail and, later, analytics.

## 1. Environment variables

This is a Create React App project, so only variables named `REACT_APP_*` reach the
browser. `VITE_*` names are ignored.

| Variable | Value |
|---|---|
| `REACT_APP_FIREBASE_API_KEY` | Firebase Console → Project settings → Your apps → Web app → `apiKey` |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `portfolio-f3161.firebaseapp.com` |
| `REACT_APP_FIREBASE_PROJECT_ID` | `portfolio-f3161` |
| `REACT_APP_FIREBASE_APP_ID` | Same screen → `appId` |

- **Local:** copy `.env.example` to `.env.local` (git-ignored), fill it in, then
  restart `npm start`.
- **Netlify:** go to Site configuration → Environment variables, add the four
  variables above, then use **Trigger deploy → Clear cache and deploy site**. The
  values are baked in at build time.
- **What happens without them:** the public Projects section falls back to its
  built-in project list, and `/admin` shows "Admin unavailable".

These values are public by design. Never put a service-account key or any other
secret in a `REACT_APP_*` variable.

## 2. Authentication and the admin record

1. Authentication → Sign-in method: enable **Email/Password**.
2. Authentication → Users: create the admin user (already done).
3. Firestore → Data: create the document `admins/<UID>` with these fields:
   - `role` (string) = `admin`
   - `active` (boolean) = `true`

The current admin UID is `s0YgfCpNZfNnQJmh1OGX2bVkLdp2`. The rules deny all client
writes to `admins`, so this record can only be created in the console.

To revoke access, set `active` to `false`.

## 3. Security rules

The rules live in `firestore.rules` in the repo. To deploy:

1. Open Firestore → Rules.
2. Replace everything with the contents of `firestore.rules`.
3. Click **Publish**.

What the rules enforce:

- Everything is denied by default.
- Visitors can read projects with `status == "published"` and categories with
  `active == true`. Public queries must filter on those fields; rules are not
  filters.
- Only an active admin can create, update or delete projects and categories, and
  every write is validated:
  - field allowlist, types and lengths
  - slug format
  - https-only cover and primary URLs
  - server timestamps and `updatedBy`
  - new projects must start as drafts
  - publishing requires a short description, a category and a cover image
  - projects can only be deleted permanently after a soft delete
- `auditEvents` is append-only and limited to admins.
- `analyticsEvents` takes public, validated, append-only events for published
  projects. It isn't used by the UI yet.
- `admins` is readable only by its own user and can't be written by any client.

### Rules checks (Rules Playground)

These checks have **not** been run. Java isn't installed on the development machine,
so the Firestore emulator couldn't run. Before relying on the rules, run the cases
below in Firestore → Rules → **Rules Playground**.

| # | Simulated request | Expected |
|---|---|---|
| R1 | Unauthenticated `get` on `/projects/<published id>` | Allow |
| R2 | Unauthenticated `get` on `/projects/<draft id>` | Deny |
| R3 | Unauthenticated `create` on `/projects/x` | Deny |
| R4 | Authenticated as a non-admin UID: `update` on `/projects/<id>` | Deny |
| R5 | Authenticated as the admin UID: `get` on `/admins/<admin uid>` | Allow |
| R6 | Authenticated as the admin UID: `update` on `/admins/<admin uid>` | Deny |
| R7 | Admin `delete` on a project whose `deletedAt` is null | Deny |
| R8 | Unauthenticated `get` on `/categories/<inactive id>` | Deny |
| R9 | Unauthenticated `create` on `/auditEvents/x` | Deny |
| R10 | Any request to an unlisted collection, e.g. `/secrets/x` | Deny |

After deploying, also check the live behaviour:

- **Signed out:** `/admin` redirects to the login page.
- **Signed in as admin:** create a draft, then confirm it does **not** appear on
  the public site.
- **Publish:** the project appears on the public site.
- **Unpublish, archive or delete:** the project disappears from the public site.

## 4. Using the admin

- **Address:** open `https://<your-site>/admin` (or `http://localhost:3000/admin`).
  It isn't linked from the public site and is marked `noindex`.
- **First run:**
  1. On the Categories page, click **Add default categories**.
  2. On the Projects page, click **Import original projects**. This copies the 4
     hard-coded projects into Firestore as published Development projects.
- **Project lifecycle:**

  | Action | Result |
  |---|---|
  | Save draft | Not public |
  | Save & publish | Live on the portfolio |
  | Unpublish | Back to draft |
  | Archive | Hidden from the portfolio |
  | Restore | Back to draft |
  | Delete | Moved to the trash |
  | Delete permanently | Only available from the trash |

- **Audit trail:** every change writes an `auditEvents` record.

## 5. Detail pages, video and analytics

- **Detail pages:** every published project has a page at `/projects/<slug>`. Cards
  open it; the page shows the cover or video, the full description, tags and links.
  Unpublished or unknown slugs show "Project not found".
- **Video:** paste a YouTube or Vimeo link in the editor's **Video link** field. Only
  the provider and a validated video ID are stored. The player URL is rebuilt from
  them (YouTube uses `youtube-nocookie.com`, Vimeo uses `dnt=1`), so no other site
  can be embedded.
- **Analytics** (`analyticsEvents` collection, Admin → Analytics):

  | Metric | When it's counted |
  |---|---|
  | View | A detail page opens. At most once per project per browser session every 30 minutes. |
  | Outbound click | A visitor clicks a project link on the detail page. |

- **Not counted:**
  - Browsers that have signed in to `/admin` (a flag in localStorage marks them)
  - Automated browsers
  - Anything that happens on the destination site
- **Data:** no visitor IDs, IP addresses or cookies are stored, so unique visitors
  aren't reported.
- **Trust:** events are written from the browser and can be faked; the rules only
  accept events for published projects, with an exact field list.
- **Cost:** the analytics screen reads up to 5,000 raw events per load. The Spark
  plan allows 50,000 reads a day, which is plenty for a portfolio. Move to daily
  totals if traffic grows.

## 6. Uploads (Cloudinary, signed)

Files go to Cloudinary. Firestore keeps metadata only, in the `media` collection.
Uploads are signed by the Netlify Function `netlify/functions/cloudinary.js`, which
has no extra dependencies. For every request the function:

1. checks the caller's Firebase ID token (signature, project, expiry);
2. reads `admins/<uid>` through the Firestore REST API using the caller's own
   token, so the security rules decide who is an admin;
3. only then signs an upload, checks an uploaded file, or deletes one.

Files are re-checked after upload, and a file that's too large or the wrong type
is deleted at once.

| Type | Allowed |
|---|---|
| Images | JPG, PNG, WebP, AVIF or GIF, up to 10 MB (no SVG) |
| Videos | MP4, WebM or MOV, up to 100 MB |

All files go into the `portfolio/` folder, and the function refuses to touch
anything outside it.

### Netlify environment variables (server-side only)

| Variable | Value |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard → Product environment → Cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Same screen. **Never** add a `REACT_APP_` prefix to this. |
| `CLOUDINARY_FOLDER` | Optional; defaults to `portfolio` |

The function reads the project ID from `REACT_APP_FIREBASE_PROJECT_ID`, which is
already set. Make sure all of these apply to Functions and to Deploy Previews.

Also re-publish `firestore.rules`: the `media` rules changed in this version.

### Using it

- **Project editor:** use **Upload image** / **Upload video** (with a progress
  bar), or **Choose from library**.
- **Admin → Media:** drag-and-drop uploads, a list of which projects use each
  file, alt text, copy URL, and delete.
- **Deleting:** blocked while any project still uses the file.
- **Replacing:** to replace a file, pick a new one in the project, then delete the
  old one from Media; it shows "Not used by any project" once it's free.

### Local development

`npm start` doesn't run Netlify Functions, so uploads only work on Netlify (deploy
previews included). To use them locally, run the site with the Netlify CLI
(`npx netlify-cli dev`) and put the Cloudinary variables in your Netlify site
settings or in `.env.local`.

### Tests

`npm run test:functions` checks the function. It covers:

- forged, expired and wrong-project tokens are rejected
- non-admins are refused
- the secret never appears in a response
- oversized uploads are deleted
- files outside `portfolio/` are refused

### Still pending

- **Admin pagination:** the admin list loads up to 500 projects.

## 6. Known limitations

- **Public field visibility:** Firestore returns whole documents. The public UI
  maps only the allowed fields, but anyone calling the Firestore API directly can
  read every field of a *published* project document, including `createdBy`,
  timestamps and the full description. Draft, archived and trashed projects stay
  unreadable. If that matters, a separate `publicProjects` collection can hold
  only public fields.
- **Slug uniqueness:** the admin UI checks it before saving, but the rules can't
  enforce it. That's fine with a single admin.
- **List size:** the admin list loads up to 500 projects and filters them in the
  browser. Cursor pagination isn't built yet.
- **Unsaved-change warning:** it covers closing or reloading the tab and the
  Cancel button. It doesn't cover the admin nav links.
