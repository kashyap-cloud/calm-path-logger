import React from "react";

interface ResponsiveContainerProps {
  children: React.ReactNode;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl">
        {children}
      </div>
    </div>
  );
};

export default ResponsiveContainer;
