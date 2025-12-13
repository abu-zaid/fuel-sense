// Example: How to use Framer Motion in components
// Replace the CSS animation classes with Framer Motion

import { motion } from 'framer-motion';
import { animations } from '@/lib/animations';

// Example 1: Simple fadeIn animation
export function FadeInExample() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      Content fades in
    </motion.div>
  );
}

// Example 2: Slide up animation
export function SlideUpExample() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      Content slides up
    </motion.div>
  );
}

// Example 3: Staggered list items
export function StaggeredListExample() {
  const items = [1, 2, 3, 4];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={animations.staggerContainer}
    >
      {items.map((item) => (
        <motion.div
          key={item}
          variants={animations.staggerItem}
          className="p-4 mb-2 bg-blue-50 rounded"
        >
          Item {item}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Example 4: Hover animation
export function HoverScaleExample() {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Hover to scale
    </motion.button>
  );
}

// Example 5: Float animation (infinite)
export function FloatExample() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="w-12 h-12 bg-blue-100 rounded-full"
    />
  );
}
