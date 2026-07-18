import { resetOpenAIClientForTests, setOpenAIClientForTests } from "../../src/config/openaiClient.js";
import { resetAiServiceConfigForTests, setAiServiceConfigForTests } from "../../src/services/aiAnalysisService.js";

export const testAiConfig = {
  OPENAI_API_KEY: "test-key",
  OPENAI_MODEL: "test-multimodal-model",
  OPENAI_TIMEOUT_MS: 60000,
  OPENAI_MAX_OUTPUT_TOKENS: 4000,
  OPENAI_IMAGE_DETAIL: "high"
};

export function createAnalysis(overrides = {}) {
  return {
    risk: {
      level: "high",
      label: "High risk",
      confidence: "strong",
      summary: "Several suspicious patterns were identified.",
      indicators: [
        {
          title: "Urgent payment pressure",
          explanation: "The evidence suggests pressure to act quickly.",
          evidence: "Submitted message"
        }
      ]
    },
    suspectedScam: {
      category: "Impersonation scam",
      description: "The available evidence may be consistent with impersonation."
    },
    extractedDetails: {
      amount: null,
      currency: "INR",
      transactionId: null,
      transactionDate: null,
      transactionTime: null,
      paymentMethod: null,
      bankOrWallet: null,
      upiId: null,
      phoneNumbers: [],
      emails: [],
      urls: [],
      impersonatedEntity: null
    },
    immediateActions: [
      {
        priority: 2,
        title: "Save evidence",
        description: "Keep screenshots and transaction records safe.",
        urgent: false
      },
      {
        priority: 1,
        title: "Use official channels",
        description: "Contact the bank or official portal through verified channels.",
        urgent: true
      }
    ],
    evidence: {
      found: [],
      missing: [],
      recommended: []
    },
    timeline: [],
    reportSummary: "A suspicious incident was reviewed with available evidence.",
    limitations: ["The analysis is limited to the submitted evidence."],
    ...overrides
  };
}

export function parsedResponse(analysis = createAnalysis()) {
  return {
    id: "resp_should_not_be_returned",
    status: "completed",
    output_parsed: analysis,
    output: [
      {
        type: "message",
        content: [
          {
            type: "output_text",
            text: "{}",
            parsed: analysis
          }
        ]
      }
    ]
  };
}

export function createFakeOpenAIClient({ responses, error } = {}) {
  const calls = [];
  const queue = Array.isArray(responses) ? [...responses] : null;

  return {
    calls,
    responses: {
      parse: async (body, options) => {
        calls.push({ body, options });

        if (error) {
          throw error;
        }

        if (queue) {
          const next = queue.length > 1 ? queue.shift() : queue[0];
          return typeof next === "function" ? next(body, options) : next;
        }

        return parsedResponse();
      }
    }
  };
}

export function configureAiSuccess(options = {}) {
  const client = createFakeOpenAIClient(options);
  setAiServiceConfigForTests({ ...testAiConfig, ...(options.config || {}) });
  setOpenAIClientForTests(client);
  return client;
}

export function resetAiTestDoubles() {
  resetAiServiceConfigForTests();
  resetOpenAIClientForTests();
}
