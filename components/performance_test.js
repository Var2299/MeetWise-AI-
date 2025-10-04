// performance_test_single_call.js

import { GoogleGenAI } from '@google/genai';
import { performance } from 'perf_hooks';

// --- Configuration ---
// Note: Keeping TEST_ITERATIONS=1 for a cleaner, single-run measurement
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCpqRHVOHvB3IxmRT9OcvYw7ja27ggdzHc'; 
const TEST_ITERATIONS = 1; 
const MODEL = 'gemini-2.5-flash';

// Your 397-word text
const LONG_TEXT = `
Speaker 1 (Alex - Sales)

Good morning, team. So, I had a follow-up call with Acme, and things are looking really positive. They are highly interested in the Premium Analytics package and explicitly asked about a guaranteed Service Level Agreement (SLA) because their current vendor's downtime has been a major issue for them. They see our platform as the superior technical solution, but the procurement process is going to be a hurdle.

Identifying the Key Pain Points

Alex kicks off the conversation by providing an update on Acme’s position and their interest in the Premium Analytics package. This introduction sets the tone, highlighting two critical points: the customer's interest in the solution and the issue of downtime with their current vendor, which has caused considerable frustration. For Alex, this is an opportunity to underscore the superior technical capabilities of their platform, making it clear that Acme sees the solution as the answer to their ongoing challenges.

However, the second part of Alex’s update signals an important challenge ahead: procurement. Despite the positive sentiment towards the platform, Acme’s internal processes and requirements present a potential barrier. This sets the stage for a deeper dive into the obstacles and what must be done to overcome them. The key action here is understanding that the procurement process will take longer than anticipated, and this needs to be managed carefully to avoid delays.

Speaker 2 (Beth - Acme)

That’s excellent to hear, Alex. The technical team is sold, but I have to be completely frank: our internal security audit is absolutely mandatory before we can move to the final procurement stage. We had a breach last year, so compliance is under a microscope. Can you provide us with detailed documentation on your security measures?

Understanding Acme’s Security Concerns

Beth, representing Acme, introduces a critical requirement: internal security audit. Acme has experienced a breach in the past, and as a result, their compliance standards have become much stricter. This underscores the importance of security for Acme’s procurement decision. Their technical team is already on board with the product; however, the internal compliance hurdle now becomes the primary focus.

Beth’s frankness about the breach signals a level of urgency and transparency. Acme's need for documentation is not simply a formality; it's a safeguard against future vulnerabilities. This is a pivotal moment in the conversation, where Alex needs to show not only that they have the necessary security protocols in place but that they can meet Acme’s compliance requirements in a way that is seamless and efficient.

Alex’s next steps are critical: they need to offer both the necessary documentation and clarity about the process and costs involved. Acme is asking for more than just general security info; they need the specifics, ideally an official third-party audit to validate the solution’s security and prove compliance.

Speaker 1 (Alex - Sales)

Understood, Beth, that's completely reasonable, and we take security very seriously. We can definitely provide a full SOC 2 readiness assessment, which outlines our controls and processes. However, putting together that complete package and getting an official, external auditor sign-off will involve a specific cost and a clear timeline. I'll need to coordinate with our Product team, specifically David, to get those figures.

Providing the Right Documentation and Setting Expectations

Alex acknowledges the seriousness of Beth’s concern and responds with reassurance. They offer a SOC 2 readiness assessment, which is an essential standard for evaluating the effectiveness of security and compliance controls. By agreeing to provide this documentation, Alex is positioning their company as a transparent and reliable partner.

However, Alex is also clear about the logistical side of things—while the SOC 2 assessment can be provided, the complete package will take time and resources. Alex sets the expectation that third-party auditor sign-off will require both a specific cost and a clear timeline. This is where the sales process shifts from high-level discussions to detailed logistics. Alex mentions the need for coordination with David from the Product team, signaling that cross-team collaboration will be crucial to getting this piece of the puzzle completed.

This clarity on costs and timelines helps set boundaries around the scope of the request, which is important for both sides to ensure mutual understanding.

Speaker 3 (Charlie - Product)

I can assist with that, Alex. I have the baseline security overview and all the standard compliance docs ready. I'll focus on compiling the specific details related to SOC 2 that Acme's internal team will need. I'll need a day to gather everything.

Collaboration Between Sales and Product Teams

Charlie from the Product team jumps in to provide support. Charlie’s response is crucial because it signals that the Product team has already prepared the baseline security overview and standard compliance documents. This readiness means the sales team can rely on Charlie to help provide the necessary materials without having to reinvent the wheel.

Charlie’s focus on compiling the SOC 2-specific details is particularly important. This shows a clear division of responsibilities: while Alex handles the sales and client-facing aspects, Charlie dives deep into the technical compliance side, ensuring Acme gets exactly what they need. Importantly, Charlie commits to gathering everything in one day, which helps set a realistic internal timeline.

This collaboration reflects well-organized team dynamics, where each person is leveraging their expertise to contribute to a shared goal. By efficiently delegating tasks, Alex and Charlie create an actionable plan that drives the process forward.

Speaker 2 (Beth - Acme)

That sounds perfect. Our internal decision target, meaning the deadline for us to formally begin the legal contract phase, is two weeks from today. To make that target, we need a complete proposal, including final pricing and a realistic implementation timeline, in our hands by next Monday morning at the latest. That leaves us time for final review before our board meeting.

Setting the Timeline and Decision Target

Beth moves the conversation forward by providing a two-week decision target for the procurement process. She’s clear that in order for the legal contract phase to begin, they need the complete proposal, including final pricing and a realistic implementation timeline, in their hands by next Monday morning.

`;

const inputWordCount = (LONG_TEXT.match(/\S+/g) || []).length;


// Initialize the Gemini client (Only done once)
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Executes a single, clean API call and measures total latency.
 * This mimics the simple execution of a /summaries endpoint.
 */
async function runSingleTest() {
    const prompt = `Summarize the following text in a concise paragraph. Text: ${LONG_TEXT}`;
    
    // Start timing right before the network call
    const startTime = performance.now();
    let summary = '';
    
    try {
        // Use the simple generateContent call for total end-to-end time
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: prompt,
        });

        const endTime = performance.now();
        const latency = endTime - startTime;
        summary = response.text;
        
        return { 
            latency: latency, 
            summary: summary
        };
    } catch (error) {
        console.error('Error during API call:', error.message);
        return { 
            latency: -1, 
            summary: '' 
        };
    }
}


/**
 * Simple utility function to count words in a string.
 */
function countWords(text) {
    return (text.match(/\S+/g) || []).length;
}


/**
 * Main function to run the single performance test.
 */
async function main() {
    console.log(`--- Gemini Summarization Performance Test (SINGLE RUN) ---`);
    console.log(`Model: ${MODEL}`);
    console.log(`Input Words: ${inputWordCount}\n`);

    const result = await runSingleTest();
    const latency = result.latency;
    
    if (latency > 0) {
        const summaryWordCount = countWords(result.summary);
        const wordDiff = inputWordCount - summaryWordCount;
        
        console.log('\n' + '='.repeat(60));
        console.log('         ⚡ SINGLE RUN Test Results ⚡');
        console.log('='.repeat(60));
        console.log(`✅ Total Latency (End-to-End):   ${latency.toFixed(2)} ms`);
        console.log(`\n--- Summarization Metrics ---`);
        console.log(`Input Word Count:               ${inputWordCount} words`);
        console.log(`Output Word Count:              ${summaryWordCount} words`);
        console.log(`Word Reduction:                 ${wordDiff} words`);
        console.log(`Percent Reduction:              ${(wordDiff / inputWordCount * 100).toFixed(1)}%`);
        console.log('='.repeat(60));
    } else {
        console.log('❌ Test FAILED. Check your API key or network connection.');
    }
}

main();