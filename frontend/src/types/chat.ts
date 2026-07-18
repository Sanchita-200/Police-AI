export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  messages: ChatMessage[];
  isComplete: boolean;
}

export interface FIRCollectedInfo {
  name: boolean;
  mobileNumber: boolean;
  incidentDate: boolean;
  incidentTime: boolean;
  location: boolean;
  crimeType: boolean;
  description: boolean;
}

export type FIRField = keyof FIRCollectedInfo;

export interface FIRDraftPayload {
  crime_type: string;
  incident_summary: string;
  date_time: string;
  location: string;
  complainant_details: string;
  suspect_details: string;
  evidence: string;
  final_fir_draft: string;
}
