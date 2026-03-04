import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface JobSuggestion {
  title: string;
  company: string;
  location: string;
  salary: string;
  applyLink: string;
  logo: string;
}

export interface JobAnalysisResult {
  isReal: boolean;
  confidence: number;
  riskScore: number;
  verdict: string;
  scamIndicators: string[];
  companyInfo: {
    name: string;
    logo: string;
    industry: string;
    website: string;
    isWebsiteVerified: boolean;
    establishedSince: string;
    headquarters: string;
    employeeCount: string;
    marketReputationScore: number;
    estimatedSalaryRange: string;
    overallRating: number;
    userReviewsSummary: string;
    previousScamReports: string[];
    socialMediaLinks: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
    };
    details: string;
  };
  analysis: {
    salaryRealism: string;
    languagePatterns: string;
    digitalFootprint: string;
    timelineAuthenticity: string;
  };
  explanation: string;
  suggestions: JobSuggestion[];
}

export async function analyzeJob(input: { type: 'image' | 'link' | 'text', data: string }): Promise<JobAnalysisResult> {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure it in the Secrets panel.");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isReal: { type: Type.BOOLEAN },
          confidence: { type: Type.NUMBER },
          riskScore: { type: Type.NUMBER },
          verdict: { type: Type.STRING },
          scamIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
          companyInfo: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              logo: { type: Type.STRING },
              industry: { type: Type.STRING },
              website: { type: Type.STRING },
              isWebsiteVerified: { type: Type.BOOLEAN },
              establishedSince: { type: Type.STRING },
              headquarters: { type: Type.STRING },
              employeeCount: { type: Type.STRING },
              marketReputationScore: { type: Type.NUMBER },
              estimatedSalaryRange: { type: Type.STRING },
              overallRating: { type: Type.NUMBER },
              userReviewsSummary: { type: Type.STRING },
              previousScamReports: { type: Type.ARRAY, items: { type: Type.STRING } },
              socialMediaLinks: {
                type: Type.OBJECT,
                properties: {
                  linkedin: { type: Type.STRING },
                  twitter: { type: Type.STRING },
                  facebook: { type: Type.STRING }
                }
              },
              details: { type: Type.STRING }
            },
            required: ["name", "logo", "industry", "website", "isWebsiteVerified", "establishedSince", "headquarters", "employeeCount", "marketReputationScore", "estimatedSalaryRange", "overallRating", "userReviewsSummary", "previousScamReports", "socialMediaLinks", "details"]
          },
          analysis: {
            type: Type.OBJECT,
            properties: {
              salaryRealism: { type: Type.STRING },
              languagePatterns: { type: Type.STRING },
              digitalFootprint: { type: Type.STRING },
              timelineAuthenticity: { type: Type.STRING }
            },
            required: ["salaryRealism", "languagePatterns", "digitalFootprint", "timelineAuthenticity"]
          },
          explanation: { type: Type.STRING },
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                location: { type: Type.STRING },
                salary: { type: Type.STRING },
                applyLink: { type: Type.STRING },
                logo: { type: Type.STRING }
              },
              required: ["title", "company", "location", "salary", "applyLink", "logo"]
            }
          }
        },
        required: ["isReal", "confidence", "riskScore", "verdict", "scamIndicators", "companyInfo", "analysis", "explanation", "suggestions"]
      }
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a world-class cybersecurity and recruitment intelligence analyst. 
            Analyze this job posting for authenticity with extreme precision. 
            
            If it's an image, perform high-accuracy OCR first. 
            If it's a link, analyze the domain reputation, URL structure, and metadata.
            
            Provide a highly professional, realistic, and detailed report. 
            The tone should be clinical, objective, and authoritative.
            
            Focus on:
            1. Common scam patterns in Pakistan and globally (e.g., upfront security deposits, unrealistic salaries for the region, suspicious generic domains, Telegram/WhatsApp-only contact methods).
            2. Company digital footprint (Glassdoor ratings, LinkedIn presence, official registry status).
            3. Language patterns (poor grammar, excessive urgency, generic job descriptions).
            
            If the job is suspicious or fake:
            - Provide 3-5 REAL, verified job opportunities from top-tier legitimate companies (e.g., Systems Ltd, NetSol, Google, Microsoft, etc.) that match the user's intent.
            - Ensure suggestions include real company logos (use clearbit), accurate locations, and direct links to official career portals.
            
            If the job is real:
            - Suggest 3-5 similar high-quality verified opportunities.
            
            Input Type: ${input.type}
            Input Data: ${input.type === 'image' ? 'Image provided as base64' : input.data}`
          },
          ...(input.type === 'image' ? [{
            inlineData: {
              mimeType: "image/jpeg",
              data: input.data.split(',')[1] || input.data
            }
          }] : [])
        ]
      }
    ]
  });

  const result = await response;
  return JSON.parse(result.text || "{}");
}
