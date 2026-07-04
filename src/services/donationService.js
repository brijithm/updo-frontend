// ---------------------------------------------------------------------------
// PLUGPOINT for the "Donate Now!" button on the Campaign Preview page.
//
// MOCK_MODE = true (default): skips Razorpay entirely and simulates a
// successful donation after a short delay, so you can test the rest of the
// UI/flow without a real backend or real Razorpay order.
//
// MOCK_MODE = false: runs the real flow — backend creates a Razorpay order,
// frontend opens the actual Razorpay checkout modal with that order_id.
//
// Flip MOCK_MODE to false once createDonationOrder is wired to your real
// backend endpoint (see TODO below) — don't open real Razorpay checkout
// with a fake order_id, it will always fail like you just saw.
// ---------------------------------------------------------------------------

const MOCK_MODE = true;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://updo-ai-backend-production.up.railway.app";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_XXXXXXXXXXXX";

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"));
    document.body.appendChild(script);
  });
}

/**
 * Asks the backend to create a real Razorpay order.
 *
 * TODO when wiring up for real:
 *   const res = await fetch(`${API_BASE_URL}/donations/create-order`, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ amount }),
 *   });
 *   if (!res.ok) throw new Error("Failed to create donation order");
 *   return res.json(); // { orderId, amount, currency }
 */
async function createDonationOrder(amount) {
  const response = await fetch(`${API_BASE_URL}/donations/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  if (!response.ok) throw new Error("Failed to create donation order");
  return response.json();
}

/**
 * Full donate flow: create order -> open Razorpay checkout modal.
 * Call this directly from the Donate Now button's onClick.
 *
 * @param {number} amount - amount in paise (e.g. 10000 = ₹100)
 * @param {object} [options]
 * @param {object} [options.userInfo] - { name, email, contact } prefill
 * @param {function} [options.onSuccess] - called when payment succeeds
 * @param {function} [options.onFailure] - called when payment fails/cancelled
 */
export async function openDonationCheckout(amount, options = {}) {
  const { userInfo = {}, onSuccess, onFailure } = options;

  // --- MOCK PATH: no backend, no real Razorpay order, just simulate -------
  if (MOCK_MODE) {
    console.log("[donationService] MOCK donation flow, amount:", amount);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSuccess?.({ mock: true, amount });
    return;
  }
  // ---------------------------------------------------------------------------

  // --- REAL PATH: actual backend order + real Razorpay checkout -----------
  await loadRazorpayScript();
  const order = await createDonationOrder(amount);

  const rzpOptions = {
    key: RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: "UPDO AI",
    description: "Support UPDO AI's development",
    order_id: order.orderId,
    prefill: {
      name: userInfo.name || "",
      email: userInfo.email || "",
      contact: userInfo.contact || "",
    },
    theme: { color: "#A958FA" },
    handler: function (response) {
      // TODO: POST payment_id/order_id/signature to your backend's verify
      // endpoint to confirm the signature server-side before trusting this.
      console.log("[donationService] Razorpay payment success:", response);
      onSuccess?.(response);
    },
    modal: {
      ondismiss: function () {
        onFailure?.({ reason: "dismissed" });
      },
    },
  };

  const rzp = new window.Razorpay(rzpOptions);
  rzp.on("payment.failed", function (response) {
    console.error("[donationService] Razorpay payment failed:", response.error);
    onFailure?.(response.error);
  });
  rzp.open();
  // ---------------------------------------------------------------------------
}