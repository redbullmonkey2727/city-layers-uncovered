import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  contentType: string;
  contentId: string;
  userId: string;
  size?: "sm" | "md";
}

const LikeButton = ({ contentType, contentId, userId, size = "sm" }: Props) => {
  const [liked, setLiked] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  useEffect(() => {
    supabase
      .from("likes")
      .select("id")
      .eq("user_id", userId)
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .maybeSingle()
      .then(({ data }) => setLiked(!!data));
  }, [userId, contentType, contentId]);

  const toggle = useCallback(async () => {
    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", userId)
        .eq("content_type", contentType)
        .eq("content_id", contentId);
      setLiked(false);
    } else {
      await supabase.from("likes").insert({
        user_id: userId,
        content_type: contentType,
        content_id: contentId,
      });
      setLiked(true);
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 600);
    }
  }, [liked, userId, contentType, contentId]);

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const btnSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        className={`${btnSize} rounded-full flex items-center justify-center bg-background/70 backdrop-blur-sm border border-border/40 hover:scale-110 active:scale-90 transition-all`}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <Heart
          className={`${iconSize} transition-colors ${
            liked ? "text-red-500 fill-red-500" : "text-muted-foreground"
          }`}
        />
      </button>

      {/* Heart burst particles */}
      <AnimatePresence>
        {showBurst && (
          <>
            {[...Array(6)].map((_, i) => {
              const angle = (i * 60) * (Math.PI / 180);
              const x = Math.cos(angle) * 20;
              const y = Math.sin(angle) * 20;
              return (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 pointer-events-none"
                  initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  animate={{ opacity: 0, x, y, scale: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400" />
                </motion.div>
              );
            })}
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                background: "radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)",
              }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LikeButton;
