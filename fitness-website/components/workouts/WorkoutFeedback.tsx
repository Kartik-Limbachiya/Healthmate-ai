// "use client"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { useEffect, useState } from "react"

// export default function WorkoutFeedback({ messages }: { messages: string[] }) {
//   const [visibleMessages, setVisibleMessages] = useState<string[]>([]);

//   useEffect(() => {
//     if (messages.length > 0) {
//       setVisibleMessages(messages);
//     }
//   }, [messages]);

//   return (
//     <div className="space-y-2">
//       {visibleMessages.map((message, index) => (
//         <Alert 
//           key={`${message}-${index}`}
//           variant={message.includes('Good') ? 'default' : 'destructive'}
//           className="animate-fade-in"
//         >
//           <AlertDescription className="flex items-center gap-2">
//             <span>{message}</span>
//           </AlertDescription>
//         </Alert>
//       ))}
//     </div>
//   )
// }





"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface WorkoutFeedbackProps {
  messages: string[];
}

// --- THIS IS THE FIX ---
// We add " = []" to give 'messages' a default value.
export default function WorkoutFeedback({ messages = [] }: WorkoutFeedbackProps) {
// -------------------------

  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Now, 'messages' will always be an array, even if it's empty.
    if (messages.length > 0) {
      setVisibleMessages(messages);
    }
  }, [messages]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleMessages]);

  return (
    <div
      ref={containerRef}
      className="mt-6 h-32 w-full overflow-y-auto rounded-lg bg-gray-100 p-4 font-mono text-sm dark:bg-gray-800"
    >
      <AnimatePresence>
        {visibleMessages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-2 last:mb-0"
          >
            <span className="text-gray-400 mr-2">&gt;</span>
            {message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}