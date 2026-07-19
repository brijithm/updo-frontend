import LegalLayout, { Section } from "./LegalLayout";

export default function TermsAndConditions() {
  return (
    <LegalLayout title="Terms & Conditions" updated="July 15, 2026">
      <p>
        Welcome to UPDO AI. These Terms and Conditions ("Terms") govern your access to and use
        of updoai.in and the UPDO AI platform (the "Service"). By creating an account or using
        the Service, you agree to be bound by these Terms.
      </p>

      <Section heading="1. Eligibility">
        <p>You must be at least 18 years old and capable of entering a binding agreement to use the Service.</p>
      </Section>

      <Section heading="2. Description of Service">
        <p>UPDO AI helps users plan, generate, and manage social media marketing campaigns, including AI-generated content and scheduled/automated posting to connected social accounts.</p>
      </Section>

      <Section heading="3. Account Registration">
        <p>You must provide accurate information and are responsible for your login credentials and all activity under your account. Notify support@updoai.in immediately of any unauthorized access.</p>
      </Section>

      <Section heading="4. Subscription Plans and Payments">
        <p>UPDO AI offers subscription plans, with pricing listed on our website and subject to change. Payments are processed securely through Razorpay; we never store your card or bank details. Subscriptions renew automatically each billing cycle unless cancelled beforehand. Cancelling stops future billing but does not itself refund the current period — see our Refund & Cancellation Policy.</p>
      </Section>

      <Section heading="5. Connected Social Media Accounts">
        <p>You may connect accounts (Meta, Twitter/X, LinkedIn) for scheduling and auto-posting. You are solely responsible for content posted through your accounts and for complying with each platform's own terms. We are not responsible for platform actions (suspension, removal) resulting from your posted content. You may disconnect linked accounts anytime.</p>
      </Section>

      <Section heading="6. AI-Generated Content">
        <p>AI-generated content is provided "as is" and may occasionally be inaccurate or unsuitable. You are responsible for reviewing and approving all AI-generated content before publishing, including for accuracy, brand fit, and legal compliance. We do not guarantee AI output is free of third-party rights issues.</p>
      </Section>

      <Section heading="7. Acceptable Use">
        <p>You agree not to violate applicable law, post defamatory/obscene/infringing content, attempt to disrupt or reverse-engineer the Service, or use it to spam or mislead audiences. Violating accounts may be suspended or terminated.</p>
      </Section>

      <Section heading="8. Intellectual Property">
        <p>The UPDO AI platform and branding are our property or licensed to us. Content you input remains yours; you grant us a limited license to process it to provide the Service. You own generated campaign content, subject to Section 6 and the AI providers' own terms.</p>
      </Section>

      <Section heading="9. Third-Party Services">
        <p>The Service relies on providers including Supabase, Razorpay, OpenAI, and social platform APIs. We are not responsible for their outages, errors, or policy changes.</p>
      </Section>

      <Section heading="10. Limitation of Liability">
        <p>To the maximum extent permitted by law, UPDO AI is not liable for indirect, incidental, or consequential damages, including loss of revenue or data arising from AI-generated content or third-party platform actions.</p>
      </Section>

      <Section heading="11. Termination">
        <p>We may suspend or terminate access for violating these Terms, non-payment, or at our discretion with reasonable notice. You may terminate your account anytime via settings or by contacting support.</p>
      </Section>

      <Section heading="12. Governing Law">
        <p>These Terms are governed by the laws of India, with disputes subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.</p>
      </Section>

      <Section heading="13. Changes to These Terms">
        <p>We may update these Terms periodically. Continued use after changes means you accept the revised Terms.</p>
      </Section>

      <Section heading="14. Contact Us">
        <p>UPDO AI · Chennai, Tamil Nadu, India · support@updoai.in</p>
      </Section>
    </LegalLayout>
  );
}