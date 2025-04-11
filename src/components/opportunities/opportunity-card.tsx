// src/components/OpportunityCard.tsx (Mimicking DisclosureCard Example)

"use client";

import { useState, useEffect } from "react";
import { Bookmark, Eye, ExternalLink, Building2 } from "lucide-react";
import Link from "next/link"; // Keep Link for "View Details" button
import Image from "next/image";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// Use framer-motion directly ONLY for the image part now
import { motion, Variants, Transition } from "framer-motion";
// Import the custom Disclosure components
import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from '@/components/ui/disclosure'; // Adjust path if needed
import { useBookmarkStore } from "@/store/bookmarkStore";
import { useBookmarkMutation } from "@/hooks/use-opportunities";
import { cn } from "@/lib/utils";

/**
 * Props (same as before)
 */
type OpportunityCardProps = {
  opportunity: { /* ... same props ... */
    id: string;
    title: string;
    shortDescription: string;
    imageUrl: string | null;
    deadline: Date;
    status: "OPENING_SOON" | "ACTIVE" | "CLOSING_SOON" | "CLOSED";
    visitCount: number;
    isPopular: boolean;
    isNew: boolean;
    organization: {
      id: string;
      name: string;
      logo?: string | null;
    };
    category: {
      id: string;
      name: string;
    };
    isBookmarked?: boolean;
  };
};

// --- Animations copied EXACTLY from DisclosureCard ---

const imageVariants: Variants = {
  // Use initial/animate convention which is slightly more standard than collapsed/expanded
  initial: { scale: 1, filter: "blur(0px)" },
  animate: { scale: 1.1, filter: "blur(3px)" },
};

// These variants will be passed to the Disclosure component
// and used by DisclosureContent
const detailsVariants: Variants = {
  collapsed: { opacity: 0, height: 0, y: 5 }, // Start slightly down, fade out, height 0
  expanded: { opacity: 1, height: 'auto', y: 0 }, // Fade in, height auto, slide up slightly
};

const cardTransition: Transition = {
  type: "spring",
  stiffness: 26.7,
  damping: 4.1,
  mass: 0.2,
};

// Transition specifically for the details content (can differ if needed)
const detailsTransition: Transition = {
    // Example: slightly faster fade-in than the main spring
    duration: 0.3, ease: "easeOut"
    // Or inherit from MotionConfig used in Disclosure:
    // (No specific transition needed here if default from Disclosure is fine)
};


/**
 * OpportunityCard - Mimicking DisclosureCard click behavior
 */
export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  // State managed locally, controlled by clicks
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();
  const { isBookmarked, pendingBookmarks } = useBookmarkStore();
  const bookmarkMutation = useBookmarkMutation();

  // --- Interaction Handlers ---

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent triggering expansion if bookmark is inside trigger area
    e.stopPropagation(); // Prevent any parent click handlers
    // ... (rest of bookmark logic is the same)
    if (!session) {
        toast.error("Please log in to bookmark opportunities.");
        router.push(`/login?callbackUrl=${encodeURIComponent(`/opportunities/${opportunity.id}`)}`);
        return;
      }
      if (bookmarkMutation.isPending) return;
      const currentlyBookmarked = isBookmarked(opportunity.id);
      bookmarkMutation.mutate({ id: opportunity.id, bookmarked: !currentlyBookmarked });
  };

  // This function will be passed to Disclosure's onOpenChange
  const handleOpenChange = (open: boolean) => {
    setIsExpanded(open);
  };

  const currentBookmarkStatus = isBookmarked(opportunity.id);
  const isPendingBookmark = pendingBookmarks.has(opportunity.id);

  const cardWidth = "md:w-full w-[380px] "; // Example width
  const cardHeight = "h-[380px]";
  const imageHeight = "h-52"; // Adjust image height as needed
  return (
    // Main container div - no longer a Link itself
    <div
      className={cn(
        "relative overflow-hidden rounded-lg shadow-md dark:shadow-black/20 border border-gray-100 dark:border-zinc-800",
        cardWidth,
        cardHeight,
        // Add group class if needed for internal hover effects (like on View Details button)
        "group/card"
      )}
      style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
    >
      {/* --- Image Section (Clickable Toggle) --- */}
      {/* Clicks on this div will toggle the state */}
      <div
        className={cn("relative w-full cursor-pointer", imageHeight)}
        onClick={() => setIsExpanded(!isExpanded)} // Toggle state on image click
        role="button" // Semantics: acts like a button
        aria-expanded={isExpanded}
        // Consider adding aria-controls pointing to the details content ID if known/stable
        tabIndex={0} // Make focusable
        onKeyDown={(e) => { // Keyboard accessibility
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsExpanded(!isExpanded);
            }
        }}
      >
        <motion.div
            className="absolute inset-0" // Wrapper for motion to avoid animating the img tag directly if using next/image fill
            variants={imageVariants}
            initial="initial" // Corresponds to state: !isExpanded
            animate={isExpanded ? "animate" : "initial"} // Corresponds to state: isExpanded
            transition={cardTransition} // Apply the specific spring transition
        >
             {opportunity.imageUrl ? (
              <Image
                src={opportunity.imageUrl}
                alt={`Image for ${opportunity.title}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover pointer-events-none select-none" // Prevent image drag/selection issues
                priority={false}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center pointer-events-none select-none">
                <Building2 className="w-16 h-16 text-gray-400 dark:text-gray-600" />
              </div>
            )}
        </motion.div>

        {/* Bookmark Button (position fixed relative to image div) */}
         <button
          onClick={handleBookmarkClick} // Uses stopPropagation
          disabled={isPendingBookmark}
          className={cn(
            "absolute top-3 right-3 z-30 p-1.5 rounded-full text-white bg-black/40 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 disabled:opacity-60 transition-all duration-200",
            isPendingBookmark && "animate-pulse",
            currentBookmarkStatus && "bg-blue-600/90 hover:bg-blue-600"
          )}
          aria-label={currentBookmarkStatus ? "Remove bookmark" : "Add bookmark"}
        >
          <Bookmark className="h-5 w-5" fill={currentBookmarkStatus ? "currentColor" : "none"} strokeWidth={1.5} />
        </button>
      </div>

      {/* --- Content Section (Using Disclosure Component) --- */}
      {/* The Disclosure component now handles the bottom section */}
      <Disclosure
        // Link Disclosure state to local state
        open={isExpanded}
        onOpenChange={handleOpenChange}
        // Remove the variants and transition props - they're not expected by Disclosure
        className="absolute bottom-0 left-0 right-0 z-20 bg-white dark:bg-zinc-900 px-4 pt-3 pb-1 rounded-t-lg shadow-[-4px_-10px_30px_-15px_rgba(0,0,0,0.1)] dark:shadow-[-4px_-10px_30px_-15px_rgba(0,0,0,0.3)]"
      >
        {/* --- Trigger Area (Always Visible Content) --- */}
        <DisclosureTrigger className="w-full cursor-pointer">
          {/* Content inside the trigger */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
              {opportunity.title}
            </h3>
            <div className="flex items-center justify-between gap-2 text-sm">
               {/* Org Logo/Name */}
                <div className="flex items-center gap-2 min-w-0">
                    {opportunity.organization.logo ? (
                        <Image src={opportunity.organization.logo} alt={`${opportunity.organization.name} logo`} width={24} height={24} className="rounded-full object-contain flex-shrink-0"/>
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        </div>
                    )}
                    <span className="text-gray-700 dark:text-gray-300 truncate">
                        {opportunity.organization.name}
                    </span>
                </div>
                 {/* View Count */}
                <div className="flex items-center text-gray-500 dark:text-gray-400 flex-shrink-0">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{opportunity.visitCount}</span>
                </div>
            </div>
          </div>
        </DisclosureTrigger>

        {/* --- Revealed Details Section --- */}
        {/* Pass animation properties directly to DisclosureContent instead */}
        <DisclosureContent
          // If DisclosureContent accepts motion props, pass them here
          // Otherwise use className or style for animations
          className="space-y-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-zinc-700/50 mt-3"
        >
          {/* Styling for the content *inside* the animated area */}
          <div className="pt-3"> {/* Add padding top here */}
             {/* Actual details content */}
             <p className="line-clamp-3">
              {opportunity.shortDescription}
             </p>
             <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Category: </span>
              <span>{opportunity.category.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Deadline: </span>
              <span>{format(opportunity.deadline, "PPP")}</span>
            </div>

             {/* "View Details" Button - Now needs explicit navigation */}
            <div className="pt-2">
               {/* Use a Link component directly here */}
               <Link
                  href={`/opportunities/${opportunity.id}`}
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 rounded group-hover/card:text-blue-700 dark:group-hover/card:text-blue-300"
                   // Prevent click bubbling up to trigger/image handlers
                   onClick={(e) => e.stopPropagation()}
               >
                  <span>View Details</span>
                  <ExternalLink className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </DisclosureContent>
      </Disclosure>
    </div>
  );
}