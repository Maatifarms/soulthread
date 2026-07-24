import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultSteps = [
    "Establishing secure connection...",
    "Verifying credentials...",
    "Preparing your sanctuary..."
];

const AuthStepIndicator = ({ steps = defaultSteps }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 1200);
        return () => clearInterval(interval);
    }, [steps]);

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span className="spinner-small" />
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    {steps[currentStep]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
};

export default AuthStepIndicator;
