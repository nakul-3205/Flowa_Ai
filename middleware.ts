    // middleware.ts
    import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
    import { NextResponse } from "next/server";


    const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/forgot-password",
    'not-found(.*)'

    ]);


    const requests = new Map<string, { count: number; lastRequest: number }>();
    const WINDOW = 60 * 1000; // 1 min
    const MAX_REQ = 30;       // 30 requests per IP per minute


    export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    // ---- Clerk Auth Guard ----
    if (!userId && !isPublicRoute(req)) {
        const url = new URL("/sign-up", req.url);
        return NextResponse.redirect(url);
    }
    if (userId && isPublicRoute(req)) {
        const url = new URL("/chat", req.url);
        return NextResponse.redirect(url);
    }
    
    // ---- Rate Limiter ----
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const entry = requests.get(ip) || { count: 0, lastRequest: now };

    // Reset if outside window
    if (now - entry.lastRequest > WINDOW) {
        entry.count = 0;
        entry.lastRequest = now;
    }

    entry.count++;
    requests.set(ip, entry);

    if (entry.count > MAX_REQ) {
        return new NextResponse("Too many requests, try again later.", { status: 429 });
    }

    // allow request
    return NextResponse.next();
    });


    export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
    };
