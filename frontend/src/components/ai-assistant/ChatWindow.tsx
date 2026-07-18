import { Shield } from "lucide-react";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import type { Conversation } from "../../types/chat";
import { ChatInput } from "./ChatInput";
import { GenerateFIRDraftButton } from "./GenerateFIRDraftButton";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ChatWindowProps {
  conversation: Conversation;
  isTyping: boolean;
  onSend: (message: string) => void;
  onGenerateFirDraft: () => void;
}

export function ChatWindow({
  conversation,
  isTyping,
  onSend,
  onGenerateFirDraft,
}: ChatWindowProps) {
  const scrollDep = `${conversation.id}-${conversation.messages.length}-${isTyping}`;
  const bottomRef = useAutoScroll(scrollDep);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 lg:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-accent/20 to-cyan-glow/10 text-cyan-accent">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">
            FIR Registration Assistant
          </h1>
          <p className="text-xs text-slate-500">
            {conversation.title} · AI-powered intake
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {conversation.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          {conversation.isComplete && (
            <GenerateFIRDraftButton
              onClick={onGenerateFirDraft}
              disabled={isTyping}
              title={
                isTyping
                  ? "Generating FIR draft..."
                  : "Generate a professional FIR draft from this conversation"
              }
            />
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <ChatInput onSend={onSend} disabled={isTyping} />
    </div>
  );
}
