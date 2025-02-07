import React from 'react'
import { cn } from '../../utils/utils';

interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
}

const StyledButton: React.FC<ButtonProps> = ({ onClick, children, className }) => {
    return (
        <button onClick={onClick} className={cn(className, " text-neutral-800 bg-neutral-500/50 font-bold border-2 rounded-lg p-1 px-3 hover:bg-slate-600 transform transition-all duration-200 hover:scale-105")}>
            {children}
        </button>
    )
}

export default StyledButton