const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAjkDiGa0GeX3V1lElJ9r50ZYLDTfoDhjI",
  authDomain: "kvk-dijital.firebaseapp.com",
  projectId: "kvk-dijital",
  storageBucket: "kvk-dijital.firebasestorage.app",
  messagingSenderId: "666811455076",
  appId: "1:666811455076:web:6a10a0cf3e49729d8cb171",
  measurementId: "G-2REE90FKML"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const postsRef = collection(db, "blog_posts");
  const snap = await getDocs(postsRef);
  console.log("Found " + snap.docs.length + " posts");
  const possibleSlugs = ["31", "/31", "/blog/31"];
  const q = query(postsRef, where("slug", "in", possibleSlugs));
  try {
    const snap = await getDocs(q);
    console.log("Docs found:", snap.empty ? 0 : snap.docs.length);
  } catch (e) {
    console.error("FIREBASE ERROR:", e);
  }
  process.exit(0);
}

main().catch(console.error);
