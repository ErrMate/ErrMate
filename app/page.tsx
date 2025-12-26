import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-1">

        <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
                Paste any error.
                <br />
                <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  Understand it. Fix it.
                </span>
              </h1>
              <p className="text-2xl md:text-3xl text-gray-600 font-light max-w-3xl mx-auto">
                Get <span className="font-semibold text-gray-900">AI-powered explanations</span> of any
                error or stack trace in{" "}
                <span className="font-semibold text-gray-900">plain English</span>.
              </p>
              <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto pt-4">
                ErrMate is an AI-powered error analysis tool built for developers. Paste your error, add
                context, and get structured explanations with root causes, step-by-step fixes, and
                prevention tips tailored to your tech stack.
              </p>
              <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/error-analyzer"
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-lg font-semibold hover:from-red-700 hover:to-red-800 transition shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition"
                >
                  See How It Works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="how-it-works" className="py-20 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Understand errors in plain English.</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get clear, structured explanations of any error or stack trace. No more deciphering cryptic
                  messages—understand what went wrong and why in language you can actually understand.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Get step-by-step fixes.</h3>
                <p className="text-gray-600 leading-relaxed">
                  Receive actionable solutions tailored to your specific tech stack and context. Each
                  explanation includes likely root causes and detailed steps to resolve the issue.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Add context for better insights.</h3>
                <p className="text-gray-600 leading-relaxed">
                  Paste logs, GitHub issues, StackOverflow threads, or any additional context. ErrMate uses
                  this information to provide more accurate and relevant explanations.
            </p>
          </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Tech stack specific solutions.</h3>
                <p className="text-gray-600 leading-relaxed">
                  Select your tech context (JavaScript, React, Node.js, Browser, or Other) to get solutions
                  tailored to your specific environment and framework.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Everything you need to <span className="text-red-600">debug faster</span>.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Plain English explanations.</h3>
                <p className="text-gray-600">
                  Every explanation starts with a clear, jargon-free summary of what the error means. No
                  need to be an expert in every technology—understand errors in seconds.
                </p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Root cause analysis.</h3>
                <p className="text-gray-600">
                  Don&apos;t just fix symptoms—understand the underlying causes. ErrMate identifies likely root
                  causes so you can prevent similar issues in the future.
                </p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Prevention tips included.</h3>
                <p className="text-gray-600">
                  Learn how to avoid similar errors going forward. Each explanation includes prevention tips
                  to help you write more robust code and catch issues earlier.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Fast, accurate, and <span className="text-red-600">always available</span>.
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powered by advanced AI, ErrMate delivers instant explanations whenever you need them. No
                matter how complex your error, get the insights you need in seconds.
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">&lt;3 sec</div>
                <div className="text-gray-600">from paste to explanation</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">AI</div>
                <div className="text-gray-600">powered by GPT-4</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">Any</div>
                <div className="text-gray-600">error type supported</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">24/7</div>
                <div className="text-gray-600">always available</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-red-600 to-red-700 text-white">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Understand errors <span className="text-red-100">faster</span>.
              <br />
              Build with <span className="text-red-100">confidence</span>.
            </h2>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Stop wasting time deciphering cryptic error messages. ErrMate helps you understand and fix
              errors in seconds, so you can get back to building.
            </p>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30">
                  <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold text-lg">2 explanations</div>
                    <div className="text-red-100 text-sm">without signing in</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30">
                  <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold text-lg">3 per day</div>
                    <div className="text-red-100 text-sm">when signed in</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30">
                  <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold text-lg">Unlimited</div>
                    <div className="text-red-100 text-sm">with Pro</div>
                  </div>
                </div>
              </div>
              <div className="pt-2">
            <Link
              href="/error-analyzer"
                  className="inline-block px-8 py-4 bg-white text-red-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
            >
                  Get started free
            </Link>
          </div>
              <p className="text-red-100 text-sm pt-2">
                Anonymous: 2 explanations • Free: 3 per day • Pro: $9.99/month for unlimited
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
