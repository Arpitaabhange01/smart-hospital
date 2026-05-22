import { motion } from 'framer-motion';

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function AnimatedPage({ children, className = '' }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
