import LegalLayout, { Section } from "./LegalLayout";

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund & Cancellation Policy" updated="July 15, 2026">
      <p>
        This policy explains how subscription cancellations and refunds work for UPDO AI. By
        subscribing to UPDO AI, you agree to the terms below.
      </p>

      <Section heading="1. Subscription Cancellation">
        <p>Cancel anytime from your account settings or by emailing support@updoai.in. Cancellation stops automatic renewal for the next billing cycle; you keep access to paid features until the current period ends. No partial refunds for unused time within an active cycle unless stated below or required by law.</p>
      </Section>

      <Section heading="2. Refund Eligibility">
        <p><strong>Duplicate/erroneous payment:</strong> full refund for verified duplicate charges in the same billing cycle.</p>
        <p><strong>Failed service delivery:</strong> if a successful payment didn't grant access due to a verified issue on our end, unresolved within a reasonable time, you may request a full or partial refund.</p>
        <p><strong>First 7 days:</strong> first-time subscribers may request a full refund within 7 days of initial payment, provided paid features haven't been substantially used. Assessed case-by-case.</p>
      </Section>

      <Section heading="3. Non-Refundable Cases">
        <p>Change of mind after the 7-day window, partial use after cancellation, dissatisfaction with inherently variable AI-generated content quality, issues from third-party platforms outside our control, and accounts suspended for Terms violations.</p>
      </Section>

      <Section heading="4. How to Request a Refund">
        <p>Email support@updoai.in with your registered account email, Razorpay payment/transaction ID, and reason for the request. We respond within 5–7 business days.</p>
      </Section>

      <Section heading="5. Refund Processing Time">
        <p>Approved refunds are processed via Razorpay back to your original payment method, typically reflecting within 5–10 business days after approval.</p>
      </Section>

      <Section heading="6. Changes to This Policy">
        <p>We may update this policy from time to time; changes are posted here with a new effective date.</p>
      </Section>

      <Section heading="7. Contact Us">
        <p>UPDO AI · Chennai, Tamil Nadu, India · support@updoai.in</p>
      </Section>
    </LegalLayout>
  );
}