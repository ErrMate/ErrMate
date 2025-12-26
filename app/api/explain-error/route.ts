import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const FREE_LIMIT = 3;
const ANONYMOUS_LIMIT = 2; // Overall (not monthly)

async function checkUsageLimit(userId: string): Promise<{ allowed: boolean; count: number }> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  // Consider subscription active if status is "active" or "trialing"
  if (subscription && (subscription.status === "active" || subscription.status === "trialing")) {
    return { allowed: true, count: 0 };
  }

  // Check today's usage
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayUsage = await prisma.usageTracking.count({
    where: {
      userId,
      date: {
        gte: today,
      },
    },
  });

  return {
    allowed: todayUsage < FREE_LIMIT,
    count: todayUsage,
  };
}

async function recordUsage(userId: string) {
  await prisma.usageTracking.create({
    data: {
      userId,
      date: new Date(),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { errorText, contextText, techContext, isAnonymous } = await req.json();

    // Allow anonymous users - they'll be tracked client-side
    if (!session?.user?.id && !isAnonymous) {
      return NextResponse.json(
        { error: "Please sign in or use anonymous mode" },
        { status: 401 }
      );
    }

    if (!errorText || typeof errorText !== "string") {
      return NextResponse.json(
        { error: "Error text is required" },
        { status: 400 }
      );
    }

    // Check usage limit (only for logged-in users)
    if (session?.user?.id) {
      const usageCheck = await checkUsageLimit(session.user.id);

      if (!usageCheck.allowed) {
        return NextResponse.json(
          {
            error: `Daily limit reached. You've used ${usageCheck.count} of ${FREE_LIMIT} free explanations today. Upgrade to Pro for unlimited access.`,
            limitReached: true,
          },
          { status: 429 }
        );
      }
    }

    // Build the prompt with resources request
    const prompt = `You are a senior software engineer and debugging expert specialized in analyzing programming errors and stack traces.

IMPORTANT: First, determine if the input is actually a programming error, exception, stack trace, or debugging-related issue.

WHAT IS CONSIDERED AN ERROR:
- Error messages (e.g., "TypeError: Cannot read property 'x' of undefined")
- Stack traces
- Exception messages
- Runtime errors
- Compilation errors
- Debugging issues
- Code that's not working as expected with error output

WHAT IS NOT AN ERROR (out-of-context):
- General questions (e.g., "How is weather today?", "What is JavaScript?")
- Tutorial requests
- Code explanations without errors
- Feature requests
- Non-technical questions
- Questions about concepts without error context

OUT-OF-CONTEXT RESPONSE (if input is not an error):
If the input is NOT a programming error, stack trace, or debugging issue, respond EXACTLY in this JSON format (nothing else):

{"outOfContext": true, "message": "I'm designed to help analyze programming errors, stack traces, and debugging issues. Your query appears to be a general question rather than an error message.\\n\\nPlease provide:\\n- An error message or exception\\n- A stack trace\\n- A debugging issue you're encountering\\n\\nI'll be happy to help analyze those!"}

ERROR ANALYSIS (if input IS an error):
If the input IS a programming error, stack trace, or debugging issue, analyze it and respond in this structure (NO JSON wrapper):

1. Plain English explanation
2. Likely root causes
3. Step-by-step fixes
4. Prevention tips

At the end, provide a JSON array of 3-5 relevant blog posts, documentation, or Stack Overflow links that would help the user understand this error better. Format as: {"resources": [{"title": "...", "url": "...", "description": "..."}]}

Rules for error analysis:

* Base explanation on official documentation and runtime semantics
* Use additional context only to improve understanding
* Do NOT copy content verbatim
* Explain clearly in your own words
* Provide real, helpful resources

Tech context: ${techContext || "Other"}

Input to analyze:
${errorText}

Additional context:
${contextText || "None provided"}`;

    const openRouterResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "ErrMate",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.text();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get explanation from AI service" },
        { status: 500 }
      );
    }

    const data = await openRouterResponse.json();
    let explanation = data.choices?.[0]?.message?.content;

    if (!explanation) {
      return NextResponse.json(
        { error: "No explanation received from AI service" },
        { status: 500 }
      );
    }

    const outOfContextMatch = explanation.match(/\{"outOfContext":\s*true[^}]*"message":\s*"([^"]+)"[^}]*\}/);
    if (outOfContextMatch) {
      try {
        const outOfContextData = JSON.parse(outOfContextMatch[0]);
        return NextResponse.json({
          explanation: outOfContextData.message,
          resources: [],
          outOfContext: true,
        });
      } catch (e) {
        // If JSON parsing fails, try to extract message from regex
        const message = outOfContextMatch[1]?.replace(/\\n/g, '\n') || "I'm designed to help analyze programming errors, stack traces, and debugging issues. Please provide an error message, stack trace, or debugging issue you're encountering.";
        return NextResponse.json({
          explanation: message,
          resources: [],
          outOfContext: true,
        });
      }
    }

    let resources: any[] = [];
    const resourcesMatch = explanation.match(/\{"resources":\s*\[.*?\]\}/);
    if (resourcesMatch) {
      try {
        const resourcesData = JSON.parse(resourcesMatch[0]);
        resources = Array.isArray(resourcesData.resources) ? resourcesData.resources : [];
        explanation = explanation.replace(/\{"resources":\s*\[[\s\S]*?\]\}/, "").trim();
      } catch (e) {
        console.error("Failed to parse resources:", e);
      }
    }

    if (session?.user?.id) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
      });
      
      const isPro = subscription && (subscription.status === "active" || subscription.status === "trialing");
      if (!isPro) {
        await recordUsage(session.user.id);
      }

      await prisma.queryResponse.create({
        data: {
          userId: session.user.id,
          errorText,
          contextText: contextText || null,
          techContext,
          explanation,
          resources: resources.length > 0 ? JSON.stringify(resources) : null,
        },
      });
    }

    return NextResponse.json({ explanation, resources });
  } catch (error: any) {
    console.error("Error in explain-error route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

