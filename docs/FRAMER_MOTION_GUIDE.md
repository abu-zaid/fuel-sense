# Framer Motion Animation Guide

## Installation
Framer Motion is already installed in your project:
```bash
npm install framer-motion
```

## Quick Start

### 1. Import motion
```tsx
import { motion } from 'framer-motion';
```

### 2. Wrap your element
Replace `div` with `motion.div`:
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Your content
</motion.div>
```

## Common Animation Patterns

### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Fades in
</motion.div>
```

### Slide Up
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  Slides up
</motion.div>
```

### Scale In
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3 }}
>
  Scales in
</motion.div>
```

### Hover Effects
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

### Floating (Infinite)
```tsx
<motion.div
  animate={{ y: [0, -10, 0] }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
>
  Floats up and down
</motion.div>
```

### Staggered List Items
```tsx
<motion.div
  initial="initial"
  animate="animate"
  variants={{
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  }}
>
  {items.map((item) => (
    <motion.div
      key={item}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

## Using Pre-defined Animations
Check `lib/animations.ts` for reusable animation variants:

```tsx
import { animations } from '@/lib/animations';

<motion.div
  variants={animations.slideUpIn}
  initial="initial"
  animate="animate"
>
  Slides up smoothly
</motion.div>
```

## Transition Options
```tsx
transition={{
  duration: 0.3,          // Animation duration in seconds
  delay: 0.1,            // Delay before animation starts
  ease: 'easeInOut',     // Easing function
  type: 'spring',        // 'spring', 'tween', or 'inertia'
  stiffness: 100,        // Spring stiffness (spring only)
  damping: 10,           // Spring damping (spring only)
  repeat: Infinity,      // Number of repeats
  repeatType: 'loop',    // 'loop', 'reverse', or 'mirror'
}}
```

## Animation Types

### Tween (default)
Linear animations over a fixed duration
```tsx
transition={{ type: 'tween', duration: 0.3 }}
```

### Spring
Physics-based animations
```tsx
transition={{ 
  type: 'spring', 
  stiffness: 200,
  damping: 20 
}}
```

### Inertia
Momentum-based animations for drag
```tsx
transition={{ type: 'inertia', velocity: 100 }}
```

## Easing Functions
```
'linear', 'easeIn', 'easeOut', 'easeInOut'
'circIn', 'circOut', 'circInOut'
'backIn', 'backOut', 'backInOut'
'anticipate'
Or custom: [0.17, 0.67, 0.83, 0.67]
```

## AnimatePresence for Exit Animations
```tsx
import { AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

## Layout Animation
```tsx
<motion.div
  layout
  onClick={() => setSelected(!selected)}
>
  Content smoothly rearranges
</motion.div>
```

## Examples in Your App

### 1. Stat Cards with Stagger
Replace the animate-scale-in classes in `stat-cards.tsx`:
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial="initial"
  animate="animate"
  variants={{
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }}
>
  {statItems.map((item) => (
    <motion.div
      key={item.label}
      variants={{
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
      }}
    >
      <Card>{item.value}</Card>
    </motion.div>
  ))}
</motion.div>
```

### 2. Tab Navigation with Smooth Transitions
Replace transition-all duration-300 classes:
```tsx
<motion.button
  onClick={() => setActiveTab(tab)}
  animate={{
    backgroundColor: activeTab === tab ? '#dbeafe' : 'transparent',
  }}
  transition={{ duration: 0.3 }}
>
  {tab}
</motion.button>
```

### 3. FAB Button with Scale Bounce
Replace animate-scale-bounce in `fuel-entry-modal.tsx`:
```tsx
<motion.button
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  transition={{
    type: 'spring',
    stiffness: 200,
    damping: 20,
  }}
  className="rounded-full"
>
  <Plus className="w-8 h-8" />
</motion.button>
```

## Performance Tips
1. Use `initial: false` to skip initial animation on mount
2. Prefer `opacity` and `transform` for animations (hardware accelerated)
3. Use `layoutId` for shared layout animations
4. Consider `will-change` CSS for complex animations
5. Test on mobile devices for smooth 60fps performance

## Resources
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Animation Examples](https://www.framer.com/motion/animation/)
- [Variants Documentation](https://www.framer.com/motion/variants/)
