import React from 'react';
import { motion } from 'framer-motion';
import ThreeBody from './ThreeBody';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
    loading = false,
    children,
    variant = 'primary',
    size = 'md',
    disabled,
    style,
    ...props
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    background: 'linear-gradient(135deg, #0A9396, #4ECDC4)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(10, 147, 150, 0.3)'
                };
            case 'secondary':
                return {
                    background: 'linear-gradient(135deg, #F4A261, #E76F51)',
                    color: '#081226',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(244, 162, 97, 0.3)'
                };
            case 'outline':
                return {
                    background: 'transparent',
                    color: '#0A9396',
                    border: '2px solid #0A9396',
                    boxShadow: 'none'
                };
            case 'ghost':
                return {
                    background: 'rgba(10, 147, 150, 0.1)',
                    color: '#0A9396',
                    border: '1px solid rgba(10, 147, 150, 0.2)',
                    boxShadow: 'none'
                };
            default:
                return {};
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    padding: '8px 16px',
                    fontSize: '14px',
                    borderRadius: '8px'
                };
            case 'md':
                return {
                    padding: '12px 24px',
                    fontSize: '16px',
                    borderRadius: '12px'
                };
            case 'lg':
                return {
                    padding: '16px 32px',
                    fontSize: '18px',
                    borderRadius: '16px'
                };
            default:
                return {};
        }
    };

    return (
        <motion.button
            whileHover={!loading ? { scale: 1.05, y: -2 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            disabled={disabled || loading}
            style={{
                ...getVariantStyles(),
                ...getSizeStyles(),
                cursor: loading || disabled ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                opacity: loading || disabled ? 0.7 : 1,
                ...(style as any)
            } as any}
            {...(props as any)}
        >
            {/* Animated background gradient */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                }}
                animate={loading ? { x: ['0%', '200%'] } : {}}
                transition={{ duration: 1.5, repeat: loading ? Infinity : 0 }}
            />

            {/* Loading spinner */}
            {loading && (
                <ThreeBody
                    size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18}
                    color={variant === 'outline' || variant === 'ghost' ? '#0A9396' : '#ffffff'}
                />
            )}

            {/* Button content */}
            <motion.span
                animate={{ opacity: loading ? 0.5 : 1 }}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.span>

            {/* Hover effect overlay */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.1)',
                    opacity: 0
                }}
                whileHover={!loading ? { opacity: 1 } : {}}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    );
};

export default LoadingButton;
