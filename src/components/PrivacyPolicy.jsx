import LegalLayout, { Section } from "./LegalLayout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated="July 15, 2026">
      <p>
        UPDO AI ("we", "us", "our") operates updoai.in and the UPDO AI platform (the
        "Service"), which helps users plan, generate, and manage AI-powered social media
        campaigns. This Privacy Policy explains how we collect, use, store, and protect your
        information when you use our Service. By using UPDO AI, you agree to the collection
        and use of information as described here.
      </p>

      <Section heading="1. Information We Collect">
        <p><strong>Provided directly:</strong> account details (name, email, password), payment info (processed by Razorpay — we never store card/bank details), campaign content (prompts, brand assets, images, captions), and social media authorization tokens for connected platforms.</p>
        <p><strong>Collected automatically:</strong> usage data, device/browser type, IP address, and cookies (see Section 5).</p>
        <p><strong>From third parties:</strong> data from connected social platforms, limited to what's needed to schedule and publish content on your behalf.</p>
      </Section>

      <Section heading="2. How We Use Your Information">
        <p>To operate the Service, generate AI-powered campaign content (via providers like GPT-4o and DALL-E), process payments and subscriptions through Razorpay, post/schedule content to your connected accounts as instructed, send account communications, improve and secure the Service, and comply with legal obligations.</p>
      </Section>

      <Section heading="3. How We Share Your Information">
        <p>We do not sell your personal information. We share data only with service providers necessary to run UPDO AI — Supabase (database/auth), Railway (hosting), Razorpay (payments), AI providers — with social platforms per your explicit connection, and with legal authorities where required by law.</p>
      </Section>

      <Section heading="4. Data Storage and Security">
        <p>Your data is stored via Supabase with industry-standard security practices, including encryption in transit. No method of storage or transmission is 100% secure, and we cannot guarantee absolute security.</p>
      </Section>

      <Section heading="5. Cookies">
        <p>We use cookies to keep you logged in, remember preferences, and understand usage. You can disable cookies in your browser, though this may affect functionality.</p>
      </Section>

      <Section heading="6. Your Rights">
        <p>You may access, correct, or delete your data, withdraw consent for social account connections, request a data copy, or object to certain processing. Contact support@updoai.in to exercise these rights.</p>
      </Section>

      <Section heading="7. Data Retention">
        <p>We retain data while your account is active or as needed for legal, dispute-resolution, or enforcement purposes. You may request account and data deletion at any time.</p>
      </Section>

      <Section heading="8. Third-Party Links and Services">
        <p>Our Service integrates third-party platforms whose own privacy policies govern their use of your data. We encourage you to review them.</p>
      </Section>

      <Section heading="9. Children's Privacy">
        <p>UPDO AI is not intended for individuals under 18, and we do not knowingly collect data from minors.</p>
      </Section>

      <Section heading="10. Changes to This Policy">
        <p>We may update this policy periodically. Material changes will be notified by email or a website notice. Continued use after changes means you accept them.</p>
      </Section>

      <Section heading="11. Contact Us">
        <p>UPDO AI · Chennai, Tamil Nadu, India · support@updoai.in</p>
      </Section>
    </LegalLayout>
  );
}