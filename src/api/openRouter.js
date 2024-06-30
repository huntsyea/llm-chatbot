export const getLLMResponse = async (input, model) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [{role: "system", content: "Output raw markdown. Deeply explain topics in a contextual way broken out by sub-topics with headings. All subtopics must contain contex about the {user message}. Never include a Conclusion."}, { role: "user", content: `explain in detail: ${input}. Never speak to the user or provide context on your response. Do not include initial title.`}],
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