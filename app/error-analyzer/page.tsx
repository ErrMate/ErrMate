"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Dropdown } from "@/components/Dropdown";
import { Modal } from "@/components/Modal";
import { ConfirmModal } from "@/components/ConfirmModal";
import ResourceTabs from "@/components/ResourceTabs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type TechContext = 
  | "JavaScript" 
  | "TypeScript" 
  | "React" 
  | "Next.js" 
  | "Node.js" 
  | "Python" 
  | "Java" 
  | "C#" 
  | "Go" 
  | "Rust" 
  | "PHP" 
  | "Ruby" 
  | "Browser" 
  | "Database" 
  | "Docker" 
  | "Other";

const TECH_CONTEXTS: { value: TechContext; label: string; description: string }[] = [
  { value: "JavaScript", label: "JavaScript", description: "Vanilla JS, ES6+" },
  { value: "TypeScript", label: "TypeScript", description: "Typed JavaScript" },
  { value: "React", label: "React", description: "React framework" },
  { value: "Next.js", label: "Next.js", description: "Next.js framework" },
  { value: "Node.js", label: "Node.js", description: "Server-side JavaScript" },
  { value: "Python", label: "Python", description: "Python language" },
  { value: "Java", label: "Java", description: "Java language" },
  { value: "C#", label: "C#", description: "C# language" },
  { value: "Go", label: "Go", description: "Go language" },
  { value: "Rust", label: "Rust", description: "Rust language" },
  { value: "PHP", label: "PHP", description: "PHP language" },
  { value: "Ruby", label: "Ruby", description: "Ruby language" },
  { value: "Browser", label: "Browser", description: "Browser APIs, DOM" },
  { value: "Database", label: "Database", description: "SQL, NoSQL, ORMs" },
  { value: "Docker", label: "Docker", description: "Containers, deployment" },
  { value: "Other", label: "Other", description: "Other technologies" },
];

export default function AppPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorText, setErrorText] = useState("");
  const [contextText, setContextText] = useState("");
  const [techContext, setTechContext] = useState<TechContext>("JavaScript");
  const [explanation, setExplanation] = useState("");
  const [resources, setResources] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"explanation" | "resources">("explanation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [usageCount, setUsageCount] = useState<number | null>(null);
  const [usageLimit, setUsageLimit] = useState<number>(3);
  const [isPro, setIsPro] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelAt, setCancelAt] = useState<number | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const fetchUsage = useCallback(async () => {
    try {
      if (session?.user?.id) {
        // Logged in user - fetch from API
        const response = await fetch("/api/usage");
        if (response.ok) {
          const data = await response.json();
          setUsageCount(data.count);
          setUsageLimit(data.limit || 3);
          setIsPro(data.isPro);
          setIsCanceling(data.isCanceling || false);
          setCancelAt(data.cancelAt || null);
          setIsAnonymous(false);
        }
      } else {
        const stored = localStorage.getItem("errmate_anonymous_usage");
        if (stored) {
          const data = JSON.parse(stored);
          setUsageCount(data.count || 0);
        } else {
          setUsageCount(0);
        }
        setUsageLimit(2);
        setIsPro(false);
        setIsAnonymous(true);
      }
    } catch (err) {
      console.error("Failed to fetch usage:", err);
    }
  }, [session]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setError("");
      const pollSubscription = async (attempts = 0) => {
        try {
          const response = await fetch("/api/usage");
          if (response.ok) {
          const data = await response.json();
          setUsageCount(data.count);
          setIsPro(data.isPro);
          setIsCanceling(data.isCanceling || false);
          setCancelAt(data.cancelAt || null);
          
          if (data.isPro) {
              setModal({
                isOpen: true,
                title: "Subscription Activated!",
                message: "Your subscription has been successfully activated. You now have unlimited access to error explanations.",
                type: "success",
              });
              router.replace("/error-analyzer");
              return;
            }
          }
        } catch (err) {
          console.error("Failed to fetch usage:", err);
        }
        
        if (attempts >= 10) {
          setModal({
            isOpen: true,
            title: "Subscription Processing",
            message: "Your subscription is being processed. Please refresh the page in a moment if your Pro status doesn't appear.",
            type: "info",
          });
          router.replace("/error-analyzer");
          return;
        }
        
        setTimeout(() => pollSubscription(attempts + 1), 500);
      };
      
      setTimeout(() => pollSubscription(), 1000);
    }
    if (searchParams.get("canceled") === "true") {
      setModal({
        isOpen: true,
        title: "Checkout Canceled",
        message: "Your checkout was canceled. No charges were made.",
        type: "info",
      });
      router.replace("/error-analyzer");
    }
  }, [searchParams, router]);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    setError("");
    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout");
      }
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: "Checkout Failed",
        message: err.message || "Failed to start checkout. Please try again later.",
        type: "error",
      });
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    setConfirmModal({
      isOpen: true,
      title: "Cancel Subscription?",
      message: "Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period.",
    });
  };

  const confirmCancelSubscription = async () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    setCancelLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      if (data.cancelAt) {
        setCancelAt(data.cancelAt);
      }
      
      setModal({
        isOpen: true,
        title: "Subscription Canceled",
        message: data.cancelAt 
          ? `Your subscription has been successfully canceled. You'll continue to have access to Pro features until ${new Date(data.cancelAt * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`
          : "Your subscription has been successfully canceled. You'll continue to have access to Pro features until the end of your current billing period.",
        type: "success",
      });
      fetchUsage();
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: "Cancellation Failed",
        message: err.message || "Failed to cancel subscription. Please try again later.",
        type: "error",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!errorText.trim()) {
      setError("Please enter an error or stack trace.");
      return;
    }

    if (!session?.user?.id) {
      const stored = localStorage.getItem("errmate_anonymous_usage");
      const usageData = stored ? JSON.parse(stored) : { count: 0 };
      
      if (usageData.count >= 2) {
        setError("Limit reached. You've used 2 free explanations. Sign in to get 3 per day or upgrade to Pro for unlimited access.");
        return;
      }
    }

    setLoading(true);
    setError("");
    setExplanation("");
    setResources([]);
    setActiveTab("explanation");

    try {
      const response = await fetch("/api/explain-error", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          errorText: errorText.trim(),
          contextText: contextText.trim() || undefined,
          techContext,
          isAnonymous: !session?.user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.limitReached) {
          setError(data.error);
          return;
        }
        throw new Error(data.error || "Failed to explain error");
      }

      if (data.outOfContext) {
        setExplanation(data.explanation);
        setResources([]);
        setActiveTab("explanation");
      } else {
        setExplanation(data.explanation);
        setResources(data.resources || []);
      }
      
      if (!session?.user?.id) {
        const stored = localStorage.getItem("errmate_anonymous_usage");
        const usageData = stored ? JSON.parse(stored) : { count: 0 };
        usageData.count = (usageData.count || 0) + 1;
        localStorage.setItem("errmate_anonymous_usage", JSON.stringify(usageData));
      }
      
      fetchUsage();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (explanation) {
      await navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatExplanation = (text: string) => {
    const processMarkdown = (content: string) => {
      const lines = content.split('\n');
      const elements: JSX.Element[] = [];
      let currentParagraph: string[] = [];
      let inCodeBlock = false;
      let codeBlockContent: string[] = [];
      let codeBlockLang = '';
      const seenHeadings = new Set<string>(); // Track all seen headings to prevent duplicates

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
                // Handle bold **text**
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
        // Handle bold **text** in regular text
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

      lines.forEach((line, idx) => {
        const trimmed = line.trim();

        // Check for code blocks
        if (trimmed.startsWith('```')) {
          if (inCodeBlock) {
            // End code block
            flushParagraph();
            elements.push(
              <pre key={`code-${elements.length}`} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4 border border-gray-800">
                <code>{codeBlockContent.join('\n')}</code>
              </pre>
            );
            codeBlockContent = [];
            inCodeBlock = false;
            codeBlockLang = '';
          } else {
            // Start code block
            flushParagraph();
            codeBlockLang = trimmed.slice(3).trim();
            inCodeBlock = true;
          }
          return;
        }

        if (inCodeBlock) {
          codeBlockContent.push(line);
          return;
        }

        // Check for headings (markdown style)
        if (trimmed.startsWith('### ')) {
          flushParagraph();
          const headingText = trimmed.slice(4).replace(/\*\*/g, '').trim();
          const normalizedLower = headingText.toLowerCase();
          // Only add if we haven't seen this heading before
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

        // Check for bold-only headings (e.g., **Plain English explanation**)
        const boldHeadingMatch = trimmed.match(/^\*\*([^*]+)\*\*\s*$/);
        if (boldHeadingMatch) {
          flushParagraph();
          const headingText = boldHeadingMatch[1].trim();
          const normalizedLower = headingText.toLowerCase();
          // Only add if we haven't seen this heading before
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

        // Check for numbered sections (1., 2., etc.)
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
            // If no body in titleMatch, check if there's content after the title on new lines
            const linesAfterTitle = content.split('\n').slice(1);
            if (linesAfterTitle.length > 0) {
              body = linesAfterTitle.join('\n').trim();
            }
          }
          
          // Track the title to prevent duplicates (normalize by removing bold markers)
          if (title) {
            const normalizedTitle = title.toLowerCase();
            seenHeadings.add(normalizedTitle);
          }

          // Process body content
          const bodyElements: JSX.Element[] = [];
          if (body) {
            // Split body into paragraphs and filter out duplicate headings
            const paragraphs = body.split(/\n\n+/).filter(p => {
              const trimmed = p.trim();
              if (!trimmed) return false;
              // Check if this paragraph is just a duplicate of the title
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
            <div key={`section-${elements.length}`} className="mb-4 last:mb-0 pb-0 border-b last:border-b-0 border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center font-bold text-base shadow-md mt-0.5">
                  {number}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  {title && (
                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight mt-[6px]">
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
      <main className="flex-1 px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Error Analyzer
            </h1>
            <p className="text-gray-600 text-lg">Paste your error and get a detailed, structured explanation</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div>
                  {isPro ? (
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-full text-sm font-semibold shadow-sm">
                        Pro
                      </span>
                      {isCanceling ? (
                        <span className="text-orange-600 text-sm font-medium">Subscription will cancel at end of billing period</span>
                      ) : (
                        <span className="text-gray-600 text-sm font-medium">Unlimited explanations</span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">
                        {isAnonymous ? (
                          <>
                            Free explanations: <span className="text-gray-900 font-bold text-base">{usageCount ?? "..."} / {usageLimit}</span>
                            <span className="ml-2 text-xs text-gray-500">(Sign in to track queries)</span>
                          </>
                        ) : (
                          <>
                            Free explanations today: <span className="text-gray-900 font-bold text-base">{usageCount ?? "..."} / {usageLimit}</span>
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
                {session?.user?.id && (
                  <Link
                    href="/query-history"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Query History
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-3">
                {isPro ? (
                  isCanceling ? (
                    <div className="px-6 py-2.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-sm font-medium">
                      {cancelAt ? (
                        <span>
                          Subscription ends on {new Date(cancelAt * 1000).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      ) : (
                        <span>Subscription will end at the end of billing period</span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                    >
                      {cancelLoading ? "Canceling..." : "Cancel Subscription"}
                    </button>
                  )
                ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={upgradeLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-600 hover:via-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-sm"
                >
                  {upgradeLoading ? "Loading..." : "Upgrade to Pro ($9.99/mo)"}
                </button>
              )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-fit lg:sticky lg:top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Input Error
              </h2>
              <div className="space-y-6">
            <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-900">
                Error / Stack Trace <span className="text-red-600">*</span>
              </label>
              <textarea
                value={errorText}
                onChange={(e) => setErrorText(e.target.value)}
                placeholder="Paste your error message or stack trace here..."
                    className="w-full h-48 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-gray-900 placeholder-gray-400 font-mono text-sm transition-all"
              />
            </div>

            <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-900">
                    Additional Context <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                placeholder="Paste logs, GitHub issues, StackOverflow text, or any additional context..."
                    className="w-full h-32 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 resize-none text-gray-900 placeholder-gray-400 font-mono text-sm transition-all"
              />
            </div>

            <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-900">
                    Tech Context
                  </label>
                  <Dropdown
                    options={TECH_CONTEXTS.map((tech) => ({
                      value: tech.value,
                      label: tech.label,
                      description: tech.description,
                    }))}
                value={techContext}
                    onChange={(value) => setTechContext(value as TechContext)}
                    placeholder="Select your technology context"
                    description={TECH_CONTEXTS.find(t => t.value === techContext)?.description || "Select your technology context"}
                  />
            </div>

            <button
              onClick={handleExplain}
              disabled={loading || !errorText.trim()}
                  className="w-full px-6 py-4 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-600 hover:via-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-sm flex items-center justify-center gap-3 text-base"
            >
              {loading ? (
                <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      <span>Analyzing Error...</span>
                </>
              ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Analyze Error</span>
                    </>
              )}
            </button>

            {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                  </div>
                )}
              </div>
          </div>

            {/* Right side - Explanation */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm min-h-[600px]">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Response</h2>
                  <p className="text-sm text-gray-500 mt-1">Detailed analysis and resources</p>
                </div>
                {explanation && (
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border border-gray-200"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {explanation && (
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("explanation")}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      activeTab === "explanation"
                        ? "text-red-600 border-b-2 border-red-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Explanation
                  </button>
                  {resources.length > 0 && (
                    <button
                      onClick={() => setActiveTab("resources")}
                      className={`px-4 py-2 font-medium text-sm transition-colors ${
                        activeTab === "resources"
                          ? "text-red-600 border-b-2 border-red-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Resources ({resources.length})
                    </button>
                  )}
                </div>
              )}

              <div className="prose max-w-none">
                {explanation ? (
                  activeTab === "explanation" ? (
                    <div className="text-gray-800 leading-relaxed">
                      {formatExplanation(explanation)}
                    </div>
                  ) : (
                    <div className="w-full">
                      <ResourceTabs resources={resources} />
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-400">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg">Your explanation will appear here</p>
                      <p className="text-sm mt-2">Enter an error and click &quot;Analyze Error&quot; to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
  
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmCancelSubscription}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Yes"
        cancelText="No"
        type="warning"
        confirmLoading={cancelLoading}
      />
    </div>
  );
}
