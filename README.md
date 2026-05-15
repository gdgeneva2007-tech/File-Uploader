# What the app does:

Think of it as a simplified Google Drive:

- You sign up and log in
- You see your personal dashboard with your folders
- You can create folders to organize files
- Inside a folder you can upload files
- You can view file details (name, size, upload date)
- You can download files
- You can delete files and folders
- Admins/owners can share folders via a time-limited link

# Visual Flow:

Not logged in:
/login or /signup only
cannot see anything else

Logged in - Dashboard (/):
┌─────────────────────────────────┐
│ My Drive │
│ │
│ [+ New Folder] │
│ │
│ 📁 Holiday Photos │
│ 📁 Work Documents │
│ 📁 Recipes │
└─────────────────────────────────┘

Inside a folder (/folders/1):
┌─────────────────────────────────┐
│ 📁 Holiday Photos │
│ [+ Upload File] [Share Folder] │
│ [Rename] [Delete Folder] │
│ │
│ 🖼 beach.jpg [Details] │
│ 📄 itinerary.pdf [Details] │
│ 🖼 sunset.png [Details] │
└─────────────────────────────────┘

File detail page (/files/1):
┌─────────────────────────────────┐
│ beach.jpg │
│ Size: 2.4 MB │
│ Uploaded: Jan 15 2024 │
│ Folder: Holiday Photos │
│ │
│ [Download] [Delete] │
└─────────────────────────────────┘

# Project Folder Structure:

file-uploader/
├── config/
│ ├── passport.js
│ └── cloudinary.js
├── controllers/
│ ├── authController.js
│ ├── dashboardController.js
│ ├── folderController.js
│ ├── fileController.js
│ └── shareController.js ← extra credit
├── db/
│ ├── prisma.js
│ └── queries.js
├── middleware/
│ ├── auth.js
│ └── upload.js
├── utils/
│ ├── cloudinaryUpload.js
│ └── multerErrorHandler.js
├── prisma/
│ └── schema.prisma
├── routes/
│ ├── index.js ← dashboard
│ ├── auth.js
│ ├── folders.js
│ ├── files.js
│ └── share.js ← extra credit
├── views/
│ ├── partials/
│ │ ├── header.ejs
│ │ └── footer.ejs
│ ├── index.ejs ← dashboard, shows folders
│ ├── signup.ejs
│ ├── login.ejs
│ ├── error.ejs
│ ├── folders/
│ │ ├── detail.ejs ← folder contents + upload button
│ │ └── form.ejs ← create and rename folder
│ ├── files/
│ │ ├── upload.ejs ← upload form
│ │ └── detail.ejs ← file info + download button
│ └── share/
│ └── view.ejs ← public shared folder view
├── public/
│ └── css/
│ └── output.css
├── app.js
├── input.css
├── tailwind.config.js
├── .env
├── .env.example
└── .gitignore

# All Routes:

AUTH ROUTES (/auth)
─────────────────────────────────────────────────────────────
GET /auth/signup → show signup form
POST /auth/signup → create account → redirect to login
GET /auth/login → show login form
POST /auth/login → passport checks → redirect to /
POST /auth/logout → destroy session → redirect to /auth/login

DASHBOARD ROUTE (/)
─────────────────────────────────────────────────────────────
GET / → show all user's folders (logged in only)

FOLDER ROUTES (/folders)
─────────────────────────────────────────────────────────────
GET /folders/new → show create folder form
POST /folders/new → create folder → redirect to /
GET /folders/:id → show folder contents (its files)
GET /folders/:id/edit → show rename folder form
POST /folders/:id/edit → rename folder → redirect to /folders/:id
POST /folders/:id/delete → delete folder + its files → redirect to /

FILE ROUTES (/files)
─────────────────────────────────────────────────────────────
GET /files/upload → show upload form
(with folder pre-selected if ?folderId=1)
POST /files/upload → multer → cloudinary → save to db → redirect
GET /files/:id → show file detail page (name, size, date, download)
POST /files/:id/delete → delete from cloudinary + db → redirect to folder

SHARE ROUTES (/share) - Extra Credit
─────────────────────────────────────────────────────────────
POST /folders/:id/share → generate UUID link with expiry → redirect to folder
GET /share/:shareId → PUBLIC (no auth needed)
check expiry → show folder contents

# Notes

1. if(!req.body.name?.trim())  
   The question mark checks if req.body.name is undefined or null first before attempting to call .trim() on it

2. Use for...of loop for async callbacks so they can be awaited in order.
   Don't use 'forEach'

3. GET has no request body
   To pass parameters to GET form:

<form action="/folders/new" method="GET">
   <input type="hidden" name="parentId" value="42" />
   <button type="submit">Create subfolder</button>
</form>

The browser adds parentId when it builds the GET URL,
because the hidden input has a name

GET /folders/new?parentId=42
