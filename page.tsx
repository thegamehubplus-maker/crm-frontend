import Link from "next/link";

/**
 * Home page provides simple navigation links to the contacts list and the
 * login page. Middleware will redirect authenticated users to /contacts
 * automatically, but this page is still accessible and useful as a
 * landing page for new sessions.
 */
export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>CRM Frontend</h1>
      <p>
        <Link href="/contacts">Перейти к контактам</Link>
      </p>
      <p>
        <Link href="/login">Логин</Link>
      </p>
    </main>
  );
}