const safetyDisclaimers = {
  English:
    "This is AI-assisted guidance and not an official determination. Review the information and use verified official channels.",
  Hindi:
    "यह AI-सहायित मार्गदर्शन है, कोई आधिकारिक निर्णय नहीं। जानकारी की समीक्षा करें और सत्यापित आधिकारिक माध्यमों का उपयोग करें।",
  Kannada:
    "ಇದು AI ಸಹಾಯದಿಂದ ನೀಡಲಾದ ಮಾರ್ಗದರ್ಶನವಾಗಿದ್ದು ಅಧಿಕೃತ ನಿರ್ಧಾರವಲ್ಲ. ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ದೃಢೀಕೃತ ಅಧಿಕೃತ ಮಾರ್ಗಗಳನ್ನು ಬಳಸಿ."
};

export function getSafetyDisclaimer(language) {
  return safetyDisclaimers[language] || safetyDisclaimers.English;
}

export function buildOfficialHelp(incident) {
  const transaction = incident.transaction;
  const moneyTransferred = incident.situationType === "money_transferred";
  const hasPaymentDetails = Boolean(
    transaction.amount ||
      transaction.paymentMethod ||
      transaction.bankOrWallet ||
      transaction.transactionId ||
      transaction.upiId
  );

  return {
    showCybercrimeHelpline: true,
    showReportingPortal: true,
    showBankContactAdvice: moneyTransferred || hasPaymentDetails
  };
}
