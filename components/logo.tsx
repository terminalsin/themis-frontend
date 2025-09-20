import React from 'react';
import Image from 'next/image';
export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
    return (
        <div className={`relative ${className}`}>
            <Image src="/logo.png" alt="Logo" width={500} height={500} />
        </div>
    );
};