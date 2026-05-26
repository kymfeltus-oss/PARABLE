# What to do next – PARABLE Study AI

Your **Parable Study AI** folder has the pages and API routes we added, but it needs the rest of the Next.js app to run. Do this:

---

## 1. Make "Parable Study AI" a full copy of the project

In **PowerShell** (run from anywhere):

```powershell
# Copy everything from PARABLE into Parable Study AI (so it has the full app)
Copy-Item -Path "C:\Users\kymfe\Downloads\PARABLE\*" -Destination "C:\Users\kymfe\Downloads\Parable Study AI" -Recurse -Force
```

That overwrites/merges so **Parable Study AI** has the complete project (including the Study AI pages and APIs we added).

---

## 2. Add your env file

Copy your `.env.local` (with your real keys) into Parable Study AI:

```powershell
Copy-Item -Path "C:\Users\kymfe\Downloads\PARABLE\.env.local" -Destination "C:\Users\kymfe\Downloads\Parable Study AI\.env.local" -Force
```

**Then edit `C:\Users\kymfe\Downloads\Parable Study AI\.env.local`** and add this line so the app shows the Study AI nav (Sanctuary, Table, Lab, Profile) and title instead of the other PARABLE app:

```
NEXT_PUBLIC_APP_VARIANT=parable-study-ai
```

If you prefer to start clean, copy `.env.example` to `.env.local` in Parable Study AI, paste your Supabase + OpenAI keys, and add the line above.

---

## 3. Run PARABLE Study AI

1. In Cursor: **File → Open Folder** → **`C:\Users\kymfe\Downloads\Parable Study AI`**
2. In the terminal:
   ```powershell
   npm install
   npm run dev
   ```
3. When it says **Ready** and **http://localhost:3003**, open **http://localhost:3003** in your browser.

---

## 4. Keep the two apps separate

- **PARABLE** (other app): open **`C:\Users\kymfe\Downloads\PARABLE`** → run `npm run dev` → use **http://localhost:3001**
- **PARABLE Study AI**: open **`C:\Users\kymfe\Downloads\Parable Study AI`** → run `npm run dev` → use **http://localhost:3003**

Use two separate Cursor windows (one folder per window) so you don’t mix them.

---

## 5. Later: clean up the PARABLE folder (optional)

Right now **PARABLE** still contains the Study AI code we added. If you want that folder to be only your other PARABLE app again, you’d need to remove the Study AI–only parts from PARABLE (sanctuary-reader, table, lab, api/scholar, etc.) and revert a few file changes. You can do that later; for now you can leave PARABLE as-is and use **Parable Study AI** for the Study AI app.
