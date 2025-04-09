import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Status item type definition
export type StatusOption = {
  value: string;
  label: string;
  color: string;
};

// Status filter component props
interface StatusFilterProps {
  options: StatusOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Status filter component with 2x2 grid expansion to the right, vertically aligned
export function SortBy({
  options,
  selectedValue,
  onChange,
  disabled = false,
}: StatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Find the currently selected option
  const selectedOption =
    options.find((opt) => opt.value === selectedValue) || options[0];

  const handleSelect = (value: string) => {
    onChange(value);
    setIsOpen(false);
  };

  // Filter out the selected option
  const filteredOptions = options.filter(option => option.value !== selectedValue);

  return (
    <div className="relative inline-block items-center">
      {/* Main Status Button */}
      <motion.button
        className={`py-0.5 px-2 rounded-full flex items-center justify-center ${
          selectedOption.color || "bg-gray-100"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{ fontSize: "0.7rem" }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
      >
        <span className="font-semibold w-16" style={{ fontSize: "0.7rem" }}>
          {selectedOption.label}
        </span>
      </motion.button>

      {/* Options Grid Container to the right, top-aligned */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            // Positioned absolutely relative to the container div
            // top-0 aligns the top edges
            // left-full places it immediately to the right of the container
            // ml-2 adds a small gap between button and options
            className="absolute -top-1 left-full sm:ml-2  z-10 p-1 grid lg:grid-cols-2 grid-cols-4 gap-1"
            initial={{ opacity: 0, scale: 0.8, x: -10 }} // Animate from left
            animate={{ opacity: 1, scale: 1, x: 0 }}    // Animate to final position
            exit={{ opacity: 0, scale: 0.8, x: -10 }}    // Animate back to left
            transition={{ duration: 0.2 }}
            style={{
              width: "max-content",
            }}
          >
            {filteredOptions.map((option, index) => (
              <motion.button
                key={option.value}
                className={`py-0.5 px-2 rounded-full flex items-center justify-center ${option.color}`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.2,
                }}
                onClick={() => handleSelect(option.value)}
                style={{ fontSize: "0.7rem" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="font-medium whitespace-nowrap" style={{ fontSize: "0.7rem" }}>
                  {option.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}