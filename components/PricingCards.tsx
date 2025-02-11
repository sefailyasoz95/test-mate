import React from "react";

const PricingCard = ({ title, price, features }: any) => {
  return (
    <div className="group animate-scaleUp hover:scale-105 transition-transform duration-300 bg-card p-6 rounded-xl shadow-lg border border-border">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="text-3xl font-bold">${price}</div>
        <ul className="space-y-2">
          {features.map((feature: string, index: number) => (
            <li key={index} className="flex items-center text-muted-foreground">
              <svg
                className="w-5 h-5 mr-2 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        <button className="w-full py-2 mt-6 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-all">
          Select Plan
        </button>
      </div>
    </div>
  );
};

export default PricingCard;
