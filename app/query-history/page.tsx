"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ResourceTabs from "@/components/ResourceTabs";
import { useRouter } from "next/navigation";

interface QueryResponse {
  id: string;
  errorText: string;
  contextText: string | null;
  techContext: string;
  explanation: string;
  resources: string | null;
  createdAt: string;
}

export default function QueryHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [queries, setQueries] = useState<QueryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<QueryResponse | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.replace("/error-analyzer");
      return;
    }

    fetchQueries();
  }, [session, status, router]);

  const fetchQueries = async () => {
    try {
      const response = await fetch("/api/queries");
      if (response.ok) {
        const data = await response.json();
        setQueries(data);
      }
    } catch (err) {
      console.error("Failed to fetch queries:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatExplanation = (text: string) => {
    const processMarkdown = (content: string) => {
      const lines = content.split('\n');
      const elements: JSX.Element[] = [];
      let currentParagraph: string[] = [];
      let inCodeBlock = false;
      let codeBlockContent: string[] = [];
      const seenHeadings = new Set<string>();

      const flushParagraph = () => {
        if (currentParagraph.length > 0) {
          const paraText = currentParagraph.join('\n').trim();
          if (paraText) {
            const normalizedPara = paraText.replace(/^#+\s*/, '').trim().toLowerCase();
            if (!seenHeadings.has(normalizedPara)) {
              elements.push(renderParagraph(paraText, elements.length));
            }
          }
          currentParagraph = [];
        }
      };

      const renderParagraph = (text: string, key: number) => {
        const bulletLines = text.split('\n').filter(line => line.trim().match(/^[-*•]\s/));
        if (bulletLines.length > 0) {
          const items = bulletLines.map(line => {
            const cleaned = line.trim().replace(/^[-*•]\s+/, '').replace(/\*\*/g, '');
            if (cleaned.includes('**')) {
              const parts = cleaned.split(/(\*\*[^*]+\*\*)/g);
              return parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={pIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                }
                return <span key={pIdx}>{part}</span>;
              });
            }
            return cleaned;
          });
          return (
            <ul key={key} className="list-disc list-inside space-y-2 ml-2 marker:text-red-500 mb-4">
              {items.map((item, iIdx) => (
                <li key={iIdx} className="text-gray-700 pl-2">
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        if (text.match(/`[^`]+`/)) {
          const parts = text.split(/(`[^`]+`)/g);
          return (
            <p key={key} className="mb-4 leading-7 text-gray-700">
              {parts.map((part, pIdx) => {
                if (part.startsWith('`') && part.endsWith('`')) {
                  return (
                    <code key={pIdx} className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded font-mono text-sm">
                      {part.slice(1, -1)}
                    </code>
                  );
                }
                if (part.includes('**')) {
                  const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
                  return (
                    <span key={pIdx}>
                      {boldParts.map((boldPart, bIdx) => {
                        if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                          return <strong key={bIdx} className="font-semibold text-gray-900">{boldPart.slice(2, -2)}</strong>;
                        }
                        return <span key={bIdx}>{boldPart}</span>;
                      })}
                    </span>
                  );
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </p>
          );
        }
        if (text.includes('**')) {
          const parts = text.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={key} className="mb-4 leading-7 text-gray-700">
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={pIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </p>
          );
        }
        return (
          <p key={key} className="mb-4 leading-7 text-gray-700">
            {text}
          </p>
        );
      };

      lines.forEach((line) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
          if (inCodeBlock) {
            flushParagraph();
            elements.push(
              <pre key={`code-${elements.length}`} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4 border border-gray-800">
                <code>{codeBlockContent.join('\n')}</code>
              </pre>
            );
            codeBlockContent = [];
            inCodeBlock = false;
          } else {
            flushParagraph();
            inCodeBlock = true;
          }
          return;
        }

        if (inCodeBlock) {
          codeBlockContent.push(line);
          return;
        }

        if (trimmed.startsWith('### ')) {
          flushParagraph();
          const headingText = trimmed.slice(4).replace(/\*\*/g, '').trim();
          const normalizedLower = headingText.toLowerCase();
          if (!seenHeadings.has(normalizedLower)) {
            seenHeadings.add(normalizedLower);
            elements.push(
              <h3 key={`h3-${elements.length}`} className="text-xl font-bold text-gray-900 mb-3 mt-6 first:mt-0">
                {headingText}
              </h3>
            );
          }
          return;
        }

        if (trimmed.startsWith('## ')) {
          flushParagraph();
          const headingText = trimmed.slice(3).replace(/\*\*/g, '').trim();
          const normalizedLower = headingText.toLowerCase();
          if (!seenHeadings.has(normalizedLower)) {
            seenHeadings.add(normalizedLower);
            elements.push(
              <h2 key={`h2-${elements.length}`} className="text-2xl font-bold text-gray-900 mb-4 mt-8 first:mt-0 border-b border-gray-200 pb-2">
                {headingText}
              </h2>
            );
          }
          return;
        }

        if (trimmed.startsWith('# ')) {
          flushParagraph();
          const headingText = trimmed.slice(2).replace(/\*\*/g, '').trim();
          const normalizedLower = headingText.toLowerCase();
          if (!seenHeadings.has(normalizedLower)) {
            seenHeadings.add(normalizedLower);
            elements.push(
              <h1 key={`h1-${elements.length}`} className="text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0">
                {headingText}
              </h1>
            );
          }
          return;
        }

        const boldHeadingMatch = trimmed.match(/^\*\*([^*]+)\*\*\s*$/);
        if (boldHeadingMatch) {
          flushParagraph();
          const headingText = boldHeadingMatch[1].trim();
          const normalizedLower = headingText.toLowerCase();
          if (!seenHeadings.has(normalizedLower)) {
            seenHeadings.add(normalizedLower);
            elements.push(
              <h3 key={`h3-bold-${elements.length}`} className="text-xl font-bold text-gray-900 mb-3 mt-6 first:mt-0">
                {headingText}
              </h3>
            );
          }
          return;
        }

        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
        if (numberedMatch) {
          flushParagraph();
          const [, number, content] = numberedMatch;
          const titleMatch = content.match(/^(\*\*)?([^*:\n]+)(\*\*)?(?::)?\n?(.+)?/);
          const title = titleMatch ? titleMatch[2].trim() : content.split('\n')[0].trim().replace(/\*\*/g, '');
          let body = '';
          if (titleMatch && titleMatch[4]) {
            body = titleMatch[4].trim();
          } else {
            const linesAfterTitle = content.split('\n').slice(1);
            if (linesAfterTitle.length > 0) {
              body = linesAfterTitle.join('\n').trim();
            }
          }
          
          if (title) {
            const normalizedTitle = title.toLowerCase();
            seenHeadings.add(normalizedTitle);
          }

          const bodyElements: JSX.Element[] = [];
          if (body) {
            const paragraphs = body.split(/\n\n+/).filter(p => {
              const trimmed = p.trim();
              if (!trimmed) return false;
              const normalized = trimmed.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim().toLowerCase();
              return !seenHeadings.has(normalized);
            });
            
            paragraphs.forEach((para, pIdx) => {
              const trimmedPara = para.trim();
              if (trimmedPara.match(/`[^`]+`/)) {
                const parts = trimmedPara.split(/(`[^`]+`)/g);
                bodyElements.push(
                  <p key={pIdx} className="text-gray-700 leading-7">
                    {parts.map((part, partIdx) => {
                      if (part.startsWith('`') && part.endsWith('`')) {
                        return (
                          <code key={partIdx} className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded font-mono text-sm">
                            {part.slice(1, -1)}
                          </code>
                        );
                      }
                      return <span key={partIdx}>{part}</span>;
                    })}
                  </p>
                );
              } else {
                bodyElements.push(
                  <p key={pIdx} className="text-gray-700 leading-7">
                    {trimmedPara.replace(/\*\*/g, '').split('\n').map((line, lIdx) => (
                      <span key={lIdx}>
                        {line}
                        {lIdx < trimmedPara.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                );
              }
            });
          }

          elements.push(
            <div key={`section-${elements.length}`} className="mb-4 last:mb-0 last:pb-0 border-b last:border-b-0 border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center font-bold text-base shadow-md mt-0.5">
                  {number}
                </div>
                <div className="flex-1 min-w-0 py-2">
                  {title && (
                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                      {title}
                    </h3>
                  )}
                  <div className="text-gray-700 leading-7 space-y-4">
                    {bodyElements}
                  </div>
                </div>
              </div>
            </div>
          );
          return;
        }

        if (trimmed) {
          const normalizedLine = trimmed.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim().toLowerCase();
          if (normalizedLine && seenHeadings.has(normalizedLine) && currentParagraph.length === 0) {
            return;
          }
          currentParagraph.push(line);
        } else {
          flushParagraph();
        }
      });

      flushParagraph();
      return elements;
    };

    return processMarkdown(text);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <Header />
      <main className="flex-1 px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Query History
            </h1>
            <p className="text-gray-600 text-lg">Previously searched errors and diagnostics</p>
          </div>

          {queries.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No queries yet</h3>
              <p className="text-gray-600 mb-6">
                Start analyzing errors to see them here
              </p>
              <a
                href="/error-analyzer"
                className="inline-block px-6 py-3 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-600 hover:via-red-700 hover:to-red-800 transition-all"
              >
                Analyze Error
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-[calc(100vh-8rem)] flex flex-col">
                    <h2 className="text-xl font-bold mb-6 pb-3 border-b border-gray-200 text-gray-900 flex-shrink-0">
                      Your Queries ({queries.length})
                    </h2>
                    <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                      {queries.map((query) => (
                        <button
                          key={query.id}
                          onClick={() => setSelectedQuery(query)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            selectedQuery?.id === query.id
                              ? "border-red-500 bg-red-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-gray-50 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                              {query.techContext}
                            </span>
                            <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                              {formatDate(query.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 font-mono break-words overflow-hidden line-clamp-2">
                            {truncateText(query.errorText, 80)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                {selectedQuery ? (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
                    <div className="flex-shrink-0 p-6 sm:p-8 pb-4 border-b border-gray-200 bg-white">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <span className="inline-block text-sm font-semibold text-red-600 bg-red-100 px-3 py-1.5 rounded-full">
                            {selectedQuery.techContext}
                          </span>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDate(selectedQuery.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-3">Error / Stack Trace</h3>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap break-words">
                              {selectedQuery.errorText}
                            </pre>
                          </div>
                        </div>

                        {selectedQuery.contextText && (
                          <div>
                            <h3 className="text-base font-bold text-gray-900 mb-3">Additional Context</h3>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                              <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap break-words">
                                {selectedQuery.contextText}
                              </pre>
                            </div>
                          </div>
                        )}

                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-3">Explanation</h3>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <div className="text-sm text-gray-800 leading-relaxed break-words">
                              {formatExplanation(selectedQuery.explanation)}
                            </div>
                          </div>
                        </div>

                        {selectedQuery.resources && (
                          <div>
                            <h3 className="text-base font-bold text-gray-900 mb-4">Resources</h3>
                            <ResourceTabs resources={JSON.parse(selectedQuery.resources)} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg">Select a query to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

