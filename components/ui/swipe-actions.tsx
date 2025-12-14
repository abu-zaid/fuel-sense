'use client';

import { useRef, useState } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';

interface SwipeActionsProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

export function SwipeActions({ children, onEdit, onDelete, disabled = false }: SwipeActionsProps) {
  const [isOpen, setIsOpen] = useState<'left' | 'right' | null>(null);
  const constraintsRef = useRef(null);
  const controls = useAnimation();
  const swipeThreshold = 100;

  const handleDragEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Swipe left to delete
    if (offset < -swipeThreshold || velocity < -500) {
      setIsOpen('right');
      await controls.start({ x: -160 });
    }
    // Swipe right to edit
    else if (offset > swipeThreshold || velocity > 500) {
      setIsOpen('left');
      await controls.start({ x: 160 });
    }
    // Return to center
    else {
      setIsOpen(null);
      await controls.start({ x: 0 });
    }
  };

  const handleActionClick = async (action: 'edit' | 'delete') => {
    // Animate back to center
    await controls.start({ x: 0 });
    setIsOpen(null);

    // Execute action
    if (action === 'edit' && onEdit) {
      onEdit();
    } else if (action === 'delete' && onDelete) {
      onDelete();
    }
  };

  const closeSwipe = async () => {
    await controls.start({ x: 0 });
    setIsOpen(null);
  };

  return (
    <div className="relative overflow-hidden" ref={constraintsRef}>
      {/* Left action (Edit) */}
      {onEdit && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-40 bg-blue-500 dark:bg-blue-600 flex items-center justify-start pl-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen === 'left' ? 1 : 0 }}
        >
          <button
            onClick={() => handleActionClick('edit')}
            className="flex items-center gap-2 text-white font-medium"
          >
            <Edit2 className="w-5 h-5" />
            <span>Edit</span>
          </button>
        </motion.div>
      )}

      {/* Right action (Delete) */}
      {onDelete && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-40 bg-red-500 dark:bg-red-600 flex items-center justify-end pr-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen === 'right' ? 1 : 0 }}
        >
          <button
            onClick={() => handleActionClick('delete')}
            className="flex items-center gap-2 text-white font-medium"
          >
            <span>Delete</span>
            <Trash2 className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: onDelete ? -200 : 0, right: onEdit ? 200 : 0 }}
        dragElastic={0.2}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ touchAction: 'pan-y' }}
        className="relative bg-white dark:bg-slate-800 cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>

      {/* Overlay to close on tap outside */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSwipe}
          className="fixed inset-0 z-40"
          style={{ background: 'transparent' }}
        />
      )}
    </div>
  );
}
