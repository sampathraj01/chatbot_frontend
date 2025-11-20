const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

export async function sendMessage(text) {
  try {
    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    return await res.json();
  } catch (e) {
    return { reply: "Backend not available" };
  }
}
