"use client";

import { useState } from "react";

interface Resource {
  title: string;
  url: string;
  description?: string;
}

interface Props {
  resources: Resource[];
}

export default function ResourceTabs({ resources }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!resources || resources.length === 0) return null;

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-300 pb-2 overflow-x-auto">
        {resources.map((res, idx) => (
          <button
            key={idx}
            className={`px-4 py-2.5 rounded-t-lg font-medium text-sm transition-all whitespace-nowrap ${
              idx === activeIndex
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveIndex(idx)}
          >
            {res?.title}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-4">
        <h4 className="text-lg font-bold text-gray-900 mb-3">
          {resources[activeIndex]?.title}
        </h4>
        {resources[activeIndex]?.description && (
          <p className="text-gray-700 mb-4 leading-relaxed break-words">
            {resources[activeIndex].description}
          </p>
        )}
        <a
          href={resources[activeIndex].url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
        >
          <span>Visit Resource</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        <p className="text-xs text-gray-500 mt-3 break-all">
          {resources[activeIndex]?.url}
        </p>
      </div>
    </div>
  );
}

