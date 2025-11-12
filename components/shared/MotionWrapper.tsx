'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionWrapperProps {
  children: ReactNode
  className?: string
  initial?: any
  animate?: any
  whileInView?: any
  viewport?: any
  transition?: any
  whileHover?: any
  whileTap?: any
  variants?: any
  [key: string]: any
}

export function MotionDiv({ children, ...props }: MotionWrapperProps) {
  return <motion.div {...props}>{children}</motion.div>
}

export { motion }