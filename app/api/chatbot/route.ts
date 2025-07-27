import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    // In a real implementation, you would use OpenAI's ChatGPT API
    // For demo purposes, we'll return mock responses
    let response = "I'm here to help you with your raw material needs. "

    if (message.toLowerCase().includes("supplier")) {
      response += "I can help you find the best suppliers in your area. What specific items are you looking for?"
    } else if (message.toLowerCase().includes("price")) {
      response += "I can provide current market prices and trends. Which item would you like to know about?"
    } else if (message.toLowerCase().includes("order")) {
      response += "I can help you place orders or track existing ones. What would you like to do?"
    } else {
      response += "You can ask me about suppliers, prices, orders, or any other questions about raw materials."
    }

    return NextResponse.json({ response })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}
