import { motion } from "motion/react";
import { Calendar, Activity, StickyNote, Bell } from "lucide-react";
import type { IntegrationSource } from "../domain/types";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  children?: React.ReactNode;
  timestamp?: string;
  sources?: IntegrationSource[];
}

const SOURCE_CONFIG: Record<IntegrationSource, { icon: typeof Calendar; label: string; color: string }> = {
  calendar: { icon: Calendar, label: "Calendario", color: "#ff9500" },
  health: { icon: Activity, label: "Salute", color: "#34c759" },
  notes: { icon: StickyNote, label: "Note", color: "#5ac8fa" },
  reminders: { icon: Bell, label: "Promemoria", color: "#af52de" },
};

export function ChatMessage({ role, content, children, timestamp, sources }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] flex items-center justify-center flex-shrink-0 mt-1 mr-2 shadow-sm shadow-[#1a1a2e]/15">
          <span className="text-white text-[10px] font-bold">S</span>
        </div>
      )}

      <div className="max-w-[80%] flex flex-col gap-1">
        <div
          className={`px-4 py-3 ${
            isUser
              ? "bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] text-white rounded-2xl rounded-br-md shadow-md shadow-[#1a1a2e]/15"
              : "bg-[#f3f3f5] text-[#1a1a2e] rounded-2xl rounded-tl-md"
          }`}
        >
          <div className="whitespace-pre-wrap leading-relaxed text-[15px]" dangerouslySetInnerHTML={{ __html: content }} />
          {children}
        </div>

        <div className={`flex items-center gap-2 ${isUser ? "justify-end" : "justify-start"} px-1`}>
          {sources && sources.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {sources.map((src) => {
                const cfg = SOURCE_CONFIG[src];
                const Icon = cfg.icon;
                return (
                  <span
                    key={src}
                    className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${cfg.color}12`, color: cfg.color }}
                  >
                    <Icon size={9} />
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          )}
          {timestamp && <span className="text-[10px] text-[#c7c7cc]">{timestamp}</span>}
        </div>
      </div>
    </motion.div>
  );
}
