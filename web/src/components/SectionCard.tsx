import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type SectionCardProps = React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    subtitle?: string;
    headerRight?: React.ReactNode;
    bodyStyle?: React.CSSProperties;
};

const SectionCard: React.FC<SectionCardProps> = ({
    title,
    subtitle,
    headerRight,
    bodyStyle,
    style,
    children,
    ...props
}) => {
    const { theme } = useTheme();
    const isDarkStyle = theme === 'dark' || (typeof (style?.background as string) === 'string' && 
        ((style?.background as string)?.includes('0A9396') || (style?.background as string)?.includes('0B1F3A')));
    
    const defaultBackground = isDarkStyle
        ? 'linear-gradient(135deg, rgba(10, 147, 150, 0.08), rgba(11, 31, 58, 0.92))'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))';
    const defaultBorder = isDarkStyle
        ? '1px solid rgba(255, 255, 255, 0.1)'
        : '1px solid rgba(255, 255, 255, 0.5)';
    const defaultBoxShadow = isDarkStyle
        ? '0 18px 35px rgba(10, 147, 150, 0.18)'
        : '0 18px 35px rgba(15, 23, 42, 0.08)';
    const backgroundStyle = style?.background ?? defaultBackground;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            whileHover={{ 
                y: -8, 
                scale: 1.02,
                boxShadow: isDarkStyle 
                    ? '0 25px 50px rgba(10, 147, 150, 0.3)'
                    : '0 25px 50px rgba(15, 23, 42, 0.15)'
            }}
            {...(props as any)}
            style={{
                background: backgroundStyle,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: style?.border ?? defaultBorder,
                padding: 28,
                borderRadius: 20,
                boxShadow: style?.boxShadow ?? defaultBoxShadow,
                position: 'relative',
                overflow: 'hidden',
                ...style
            }}
            className={props.className}
        >
            {/* Animated gradient orb */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear'
                }}
                style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '200%',
                    height: '200%',
                    background: isDarkStyle
                        ? 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(10,147,150,0.05) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }}
            />
            
            {/* Sparkle effects */}
            <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    color: isDarkStyle ? 'rgba(255,255,255,0.6)' : 'rgba(10,147,150,0.6)'
                }}
            >
                <Sparkles size={16} />
            </motion.div>
            
            {(title || subtitle || headerRight) && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    gap: 16, 
                    marginBottom: title || subtitle ? 20 : 0,
                    position: 'relative',
                    zIndex: 1
                }}>
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {title && (
                            <h3 style={{ 
                                margin: 0, 
                                fontSize: '18px',
                                fontWeight: 700,
                                background: isDarkStyle 
                                    ? 'linear-gradient(135deg, #ffffff, #e0f2fe)'
                                    : 'linear-gradient(135deg, #0A9396, #0B1F3A)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}>
                                {title}
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <ArrowRight size={14} style={{ opacity: 0.6 }} />
                                </motion.div>
                            </h3>
                        )}
                        {subtitle && (
                            <motion.div 
                                style={{ 
                                    marginTop: 8, 
                                    color: isDarkStyle ? 'rgba(255, 255, 255, 0.75)' : '#475569',
                                    fontSize: '14px',
                                    lineHeight: 1.5
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {subtitle}
                            </motion.div>
                        )}
                    </motion.div>
                    {headerRight && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            style={{ display: 'flex', alignItems: 'center' }}
                        >
                            {headerRight}
                        </motion.div>
                    )}
                </div>
            )}
            <motion.div 
                style={{
                    ...bodyStyle,
                    position: 'relative',
                    zIndex: 1
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                {children}
            </motion.div>
            
            {/* Hover gradient overlay */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isDarkStyle
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%)'
                        : 'linear-gradient(135deg, rgba(10,147,150,0.1) 0%, transparent 100%)',
                    opacity: 0,
                    pointerEvents: 'none',
                    borderRadius: 20
                }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            />
        </motion.div>
    );
};

export default SectionCard;
