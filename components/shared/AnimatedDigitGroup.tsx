import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    value: string;
    animationStyle: 'morph' | 'liquid';
}

export const AnimatedDigitGroup: React.FC<Props> = ({ value, animationStyle }) => {
    return (
        <div className="flex flex-row">
            {value.split('').map((digit, i) => (
                <div key={`d-${i}`}
                    className="relative h-[1em] w-[0.6em] flex justify-center overflow-hidden"
                    style={animationStyle === 'liquid' ? { filter: 'url(#gooey)' } : {}}
                >
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                            key={`${digit}`}
                            initial={animationStyle === 'morph'
                                ? { y: "80%", opacity: 0, scaleY: 0.2 }
                                : { filter: 'blur(8px)', opacity: 0, scale: 0.95 }
                            }
                            animate={animationStyle === 'morph'
                                ? { y: 0, opacity: 1, scaleY: 1 }
                                : { filter: 'blur(0px)', opacity: 1, scale: 1 }
                            }
                            exit={animationStyle === 'morph'
                                ? { y: "-80%", opacity: 0, scaleY: 0.2 }
                                : { filter: 'blur(8px)', opacity: 0, scale: 1.05 }
                            }
                            transition={{
                                duration: 0.4,
                                ease: animationStyle === 'morph' ? [0.34, 1.56, 0.64, 1] : "easeInOut"
                            }}
                        >
                            {digit}
                        </motion.div>
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};
