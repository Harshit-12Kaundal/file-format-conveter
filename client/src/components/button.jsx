import React from "react";

export function Button({ children, className = "", ...props }) {
    return (
        <button
            className={`px-4 py-3 rounded-lg shadow-lg text-white font-semibold transition duration-300 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
