export const getLLMResponse = async (input) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "HTTP-Referer": import.meta.env.VITE_SITE_URL, // Optional
          "X-Title": import.meta.env.VITE_SITE_NAME, // Optional
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemma-2-9b-it:free",
          messages: [{ role: "user", content: `explain: ${input}. Format topically. Do not include an initial title. Subttopics should include contextual information`}],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching LLM response:", error);
    return "Sorry, something went wrong.";
  }
};
