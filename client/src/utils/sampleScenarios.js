export const sampleScenarios = [
  {
    title: "Fictional bank verification message",
    text: "Fictional demo data: Dear customer, your bank KYC will expire today. Click http://secure-bank-example.invalid and verify immediately to avoid account block.",
    description: "I received a message claiming to be from my bank and asking me to click a link for urgent verification.",
    situationType: "suspicious_received",
    paymentMethod: "Not sure"
  },
  {
    title: "Fictional government impersonation demand",
    text: "Fictional demo data: This is cyber police. A case is filed against your ID. Pay a refundable security fee now to stop arrest proceedings.",
    description: "Someone claiming to be a government officer demanded urgent payment over messages.",
    situationType: "money_transferred",
    paymentMethod: "UPI"
  },
  {
    title: "Fictional marketplace refund request",
    text: "Fictional demo data: Your marketplace refund is pending. Share your UPI ID and approve the collect request to receive the amount.",
    description: "A person claiming to support a marketplace refund asked me for UPI information.",
    situationType: "suspicious_received",
    paymentMethod: "UPI"
  }
];
