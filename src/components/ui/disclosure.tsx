// src/components/ui/disclosure.tsx
'use client';
import * as React from 'react';
import {
    AnimatePresence,
    motion,
    MotionConfig,
    Transition,
    Variant,
    Variants,
} from 'framer-motion'; // Ensure you have framer-motion installed: npm install framer-motion
import { createContext, useContext, useState, useId, useEffect } from 'react';
import { cn } from '@/lib/utils'; // Make sure you have this utility

export type DisclosureContextType = {
    open: boolean;
    toggle: () => void; // Keep toggle even if not used directly by trigger
    variants?: { expanded: Variant; collapsed: Variant };
};

const DisclosureContext = createContext<DisclosureContextType | undefined>(
    undefined
);

export type DisclosureProviderProps = {
    children: React.ReactNode;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    variants?: { expanded: Variant; collapsed: Variant };
};

// Renamed to avoid conflict with Disclosure component itself
function DisclosureStateProvider({
    children,
    open: openProp,
    onOpenChange,
    variants,
}: DisclosureProviderProps) {
    const [internalOpenValue, setInternalOpenValue] = useState<boolean>(openProp);

    // Sync internal state with prop changes
    useEffect(() => {
        setInternalOpenValue(openProp);
    }, [openProp]);

    const toggle = () => {
        const newOpen = !internalOpenValue;
        setInternalOpenValue(newOpen);
        if (onOpenChange) {
            onOpenChange(newOpen);
        }
    };

    return (
        <DisclosureContext.Provider
            value={{
                open: internalOpenValue,
                toggle,
                variants,
            }}
        >
            {children}
        </DisclosureContext.Provider>
    );
}

function useDisclosure() {
    const context = useContext(DisclosureContext);
    if (!context) {
        throw new Error('useDisclosure must be used within a DisclosureStateProvider');
    }
    return context;
}

export type DisclosureProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void; // Optional callback if external control needed
    children: React.ReactNode;
    className?: string;
    variants?: { expanded: Variant; collapsed: Variant };
    transition?: Transition;
};

export function Disclosure({
    open: openProp = false,
    onOpenChange, // Pass this down
    children,
    className,
    transition = { duration: 0.3, ease: 'easeInOut' }, // Sensible default
    variants,
}: DisclosureProps) {
    // Ensure children are exactly two elements: Trigger area and Content
    if (React.Children.count(children) !== 2) {
        console.warn("Disclosure component expects exactly two children.");
        // Optionally render nothing or just the children without context
        return <div className={className}>{children}</div>;
    }

    return (
        <MotionConfig transition={transition}>
            <div className={className}>
                {/* Use the renamed Provider */}
                <DisclosureStateProvider
                    open={openProp}
                    onOpenChange={onOpenChange}
                    variants={variants}
                >
                    {/* Render the two children directly */}
                    {React.Children.toArray(children)[0]} {/* Implicit Trigger Area */}
                    {React.Children.toArray(children)[1]} {/* DisclosureContent */}
                </DisclosureStateProvider>
            </div>
        </MotionConfig>
    );
}

// DisclosureTrigger is not strictly needed if hover controls state externally,
// but keep it if you might want clickable triggers elsewhere.
export function DisclosureTrigger({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const { toggle, open } = useDisclosure();

    // Apply onClick to the first valid React element child
    const child = React.Children.only(children);
    if (!React.isValidElement(child)) {
        return <>{children}</>; // Render non-elements as is
    }

    return React.cloneElement(child as React.ReactElement, {
        onClick: (e: React.MouseEvent) => {
             toggle();
             // Call original onClick if it exists
             if (typeof (child as React.ReactElement).props.onClick === 'function') {
                 (child as React.ReactElement).props.onClick(e);
             }
        },
        role: 'button',
        'aria-expanded': open,
        tabIndex: 0, // Make it focusable
        onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
            }
             // Call original onKeyDown if it exists
            if (typeof (child as React.ReactElement).props.onKeyDown === 'function') {
                (child as React.ReactElement).props.onKeyDown(e);
            }
        },
        className: cn(className, (child as React.ReactElement).props.className),
        // Spread other props from the original child
        // ... (child as React.ReactElement).props // Careful not to overwrite essential props above
    });
}


export function DisclosureContent({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const { open, variants } = useDisclosure();
    const contentId = useId(); // Use unique ID for accessibility if needed

    // Define base variants for height and opacity
    const BASE_VARIANTS: Variants = {
        expanded: {
            height: 'auto',
            opacity: 1,
            transition: { duration: 0.3, ease: 'easeInOut' } // Apply transition here too
        },
        collapsed: {
            height: 0,
            opacity: 0,
            transition: { duration: 0.2, ease: 'easeInOut' } // Faster collapse
        },
    };

    // Merge base variants with any custom variants passed via context/props
    const combinedVariants = {
        expanded: { ...BASE_VARIANTS.expanded, ...variants?.expanded },
        collapsed: { ...BASE_VARIANTS.collapsed, ...variants?.collapsed },
    };

    return (
        // Wrapper div handles overflow hidden
        <div className={cn('overflow-hidden', className)}>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key={contentId} // Use key for AnimatePresence
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={combinedVariants}
                        // aria-hidden={!open} // Accessibility
                    >
                        {/* Inner div for padding/margin if needed, prevents clipping */}
                        <div className="pt-3">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}