// donationService.js
const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Opens Razorpay Checkout for a donation.
 * @param {number} amountInRupees - amount in INR, e.g. 100 for ₹100 (backend converts to paise)
 * @param {{ onSuccess?: () => void, onFailure?: () => void }} callbacks
 */
export async function openDonationCheckout(amountInRupees, { onSuccess, onFailure } = {}) {
  // 1. Create order
  const orderRes = await fetch(`${API_BASE}/donations/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountInRupees }),
  });
  if (!orderRes.ok) {
    onFailure?.();
    throw new Error("create-order failed");
  }
  const order = await orderRes.json();
  // { razorpay_order_id, razorpay_key_id, amount_paise, currency }

  // 2. Open Checkout
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.razorpay_key_id,
      amount: order.amount_paise,
      currency: order.currency || "INR",
      name: "UPDO AI",
      description: "Donation",
      order_id: order.razorpay_order_id,
      theme: { color: "#000000" },
      handler: async (response) => {
        try {
          await fetch(`${API_BASE}/donations/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
        } catch {
          // ignore client-side failure — backend is source of truth (webhook
          // or this verify call), poll /status anyway
        }
        pollStatus(response.razorpay_order_id, onSuccess, onFailure, resolve, reject);
      },
      modal: {
        ondismiss: () => {
          // user closed the modal without paying — not a failure, just a no-op
          resolve();
        },
      },
    });

    rzp.on("payment.failed", () => {
      onFailure?.();
      reject(new Error("payment failed"));
    });

    rzp.open();
  });
}

function pollStatus(razorpayOrderId, onSuccess, onFailure, resolve, reject) {
  let attempts = 0;
  const maxAttempts = 15; // ~30s at 2s interval

  const interval = setInterval(async () => {
    attempts++;
    try {
      const res = await fetch(`${API_BASE}/donations/status/${razorpayOrderId}`);
      const data = await res.json(); // { status: "created" | "verified" | "failed" }

      if (data.status === "verified") {
        clearInterval(interval);
        onSuccess?.();
        resolve();
      } else if (data.status === "failed" || attempts >= maxAttempts) {
        clearInterval(interval);
        onFailure?.();
        reject(new Error("could not confirm payment"));
      }
    } catch {
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        onFailure?.();
        reject(new Error("status check failed"));
      }
    }
  }, 2000);
}