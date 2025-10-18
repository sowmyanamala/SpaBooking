// API Configuration for verification endpoints
// This allows easy switching between Node.js and PHP endpoints

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://yourdomain.com" // Update with your actual domain
    : "http://localhost:8000"; // For local development with PHP server

// Choose your API type: 'php' or 'nodejs'
const API_TYPE = "nodejs"; // Change this to 'php' if you want to use PHP endpoints

export const API_ENDPOINTS = {
  packages:
    API_TYPE === "php"
      ? `${API_BASE_URL}/api/verification-packages.php`
      : "/api/verification/packages",

  checkout:
    API_TYPE === "php"
      ? `${API_BASE_URL}/api/verification-checkout.php`
      : "/api/verification/checkout",

  status:
    API_TYPE === "php"
      ? `${API_BASE_URL}/api/verification-status.php`
      : "/api/verification/status",

  webhook:
    API_TYPE === "php"
      ? `${API_BASE_URL}/api/verification-webhook.php`
      : "/api/verification/webhook",
};

// Helper function to build status URL with query params
export const buildStatusUrl = (therapistId, verificationId = null) => {
  const baseUrl = API_ENDPOINTS.status;
  const params = new URLSearchParams();

  if (therapistId) params.append("therapist_id", therapistId);
  if (verificationId) params.append("verification_id", verificationId);

  return `${baseUrl}?${params.toString()}`;
};
