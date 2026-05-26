import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-28',
  moduleId: 'js',
  order: 28,
  group: 'Browser APIs & Security',
  title: 'Web Security: XSS & CSRF',
  description: 'Critical defense strategies against Cross-Site Scripting and Cross-Site Request Forgery.',
  sections: [
    {
      type: 'text',
      content: 'In the modern web, security is not a feature—it\'s a fundamental architectural requirement. The two most prevalent attack vectors are **Cross-Site Scripting (XSS)** and **Cross-Site Request Forgery (CSRF)**. Mastering the defenses against these is essential for any senior engineer responsible for user data and system integrity.'
    },
    {
      type: 'callout',
      content: 'The Golden Rule of Web Security: Never trust user input. Always encode on output and validate on input, regardless of where the data came from.',
      metadata: { type: 'architecture', title: 'Zero Trust Principle' }
    },
    {
      type: 'heading',
      content: 'Cross-Site Scripting (XSS)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'XSS occurs when an attacker injects malicious scripts into a trusted website. These scripts can steal session cookies, capture user input, or deface the page. Defenses include **Output Encoding**, **Content Security Policy (CSP)**, and using modern frameworks that auto-escape data.'
    },
    {
      type: 'code',
      content: `// DANGEROUS: Direct injection of user data
element.innerHTML = \`<div>Hello, \${userInput}</div>\`;

// SAFE: TextContent auto-escapes
element.textContent = userInput;

// SAFE: Using a sanitizer library for rich text
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(dirtyHTML);`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Cross-Site Request Forgery (CSRF)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'CSRF tricks a user\'s browser into sending an unauthorized request to your server (e.g., changing a password while the user is logged in). Since the browser automatically attaches cookies, the server might think the request is legitimate.'
    },
    {
      type: 'callout',
      content: 'Modern browsers have significantly mitigated CSRF with the \\`SameSite=Lax\\` cookie attribute, but explicit **Anti-CSRF Tokens** are still required for robust defense-in-depth.',
      metadata: { type: 'runtime', title: 'Defense in Depth' }
    },
    {
      type: 'code',
      content: `// Server-side: Check for custom headers and CSRF tokens
app.post('/api/update-profile', (req, res) => {
  const token = req.headers['x-csrf-token'];
  if (!isValid(token, req.session.id)) {
    return res.status(403).send('Forbidden');
  }
  // Proceed with update
});

// Client-side: Set SameSite attribute on cookies
document.cookie = "session=123; SameSite=Strict; Secure; HttpOnly";`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Content Security Policy (CSP)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A **CSP** is an HTTP header that tells the browser which sources of content (scripts, styles, images) are trusted. It is the most powerful tool for preventing XSS by disabling inline scripts and restricting plugin execution.'
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Mastery Check' }
    },
    {
      type: 'faq',
      content: 'Q: How does the HttpOnly cookie flag prevent XSS?\\nA: An \\`HttpOnly\\` cookie cannot be accessed via JavaScript (\\`document.cookie\\`). This means that even if an attacker successfully executes an XSS attack, they cannot steal the session cookie to hijack the user\'s account.'
    },
    {
      type: 'faq',
      content: 'Q: Why is SameSite=Lax the default in modern browsers?\\nA: It provides a balanced security posture: it prevents cookies from being sent in cross-site POST requests (preventing CSRF) but allows them in top-level GET navigations, preserving a smooth user experience.'
    },
    {
      type: 'faq',
      content: 'Q: What is the difference between Stored and Reflected XSS?\\nA: **Stored XSS** is saved permanently on the server (e.g., in a database via a comment). **Reflected XSS** is "bounced" off the server immediately (e.g., via a malicious link with a query parameter), affecting only the user who clicks the link.'
    }
  ]
};
