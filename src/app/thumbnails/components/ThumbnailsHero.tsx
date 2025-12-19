import { motion } from "framer-motion";

export default function ThumbnailsHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-8"
    >
      <h1 className="text-4xl sm:text-5xl mb-10 text-center font-bold leading-tight">
        <span className="bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
          Thumbnail Workspace
        </span>
      </h1>
      <p className="max-w-3xl text-center text-neutral-400 mx-auto">
        Store, browse, and reuse your generated thumbnails. Each generation is versioned per idea UUID and tied to your user account.
      </p>
    </motion.div>
  );
}
