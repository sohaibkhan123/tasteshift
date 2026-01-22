const GROQ_API_KEY = "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";

export const analyzeCommentSentiment = async (comment: string): Promise<'good' | 'bad' | 'neutral'> => {
    if (!comment) return 'neutral';

    try {
        const prompt = `
You are a sentiment analysis AI. Analyze the user's comment and classify it into exactly one of these three categories: 'good', 'bad', or 'neutral'.

- 'good': Positive, compliments, happy, delicious, yummy.
- 'bad': Negative, gross, angry, dislike, terrible.
- 'neutral': Questions, facts, indifferent, or mixed.

Comment: "${comment}"

Return ONLY the word.
`;

        const response = await fetch("https://api.groq.com/openai/v1/responses", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                input: prompt,
                temperature: 0.1,
                max_tokens: 10
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Groq API Error (${response.status}):`, errorText);
            return 'neutral';
        }

        const data = await response.json();

        // Extract text from output blocks
        let text = "";
        if (data.output && data.output.length) {
            for (const item of data.output) {
                if (item.content) {
                    for (const block of item.content) {
                        if (block.type === "output_text") text += block.text;
                    }
                }
            }
        }

        text = text.trim().toLowerCase();

        if (text.includes('good')) return 'good';
        if (text.includes('bad')) return 'bad';
        return 'neutral';

    } catch (error) {
        console.error("Groq Service Error:", error);
        return 'neutral';
    }
};
