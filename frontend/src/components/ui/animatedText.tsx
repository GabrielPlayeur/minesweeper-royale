import React, { useEffect, useState } from 'react'
import { motion } from "framer-motion";

interface AnimatedTextProps {
    text: string;
    animatedText: string;
    className: string;
}

const AnimatedText = ({ text, animatedText, className }: AnimatedTextProps) => {
    function cn(...classNames: (string | undefined)[]): string {
        return classNames.filter(Boolean).join(' ');
    }

    const [key, setKey] = useState(0);

    useEffect(() => {
        setKey((prev) => prev + 1); // Change la clé pour redéclencher l'animation
    }, [animatedText]);

    return (
        <div

            className={cn(className, "flex flex-col justify-center items-center gap-1")}>
            <p> {text}</p>
            <motion.div
                key={key}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1.5 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-2xl"
            >
                {animatedText}
            </motion.div>
        </div>

    );
};

export default AnimatedText;