import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { audioData } = await request.json()

    // In a real implementation, you would use Whisper API or Google Speech-to-Text
    // For demo purposes, we'll return a mock response
    const mockTranscription = "ORDER 10 KILOS TOMATOES 5 KILOS POTATOES 2 LITERS COOKING OIL"

    // Parse the transcription into structured order
    const items = parseVoiceOrder(mockTranscription)

    return NextResponse.json({
      transcription: mockTranscription,
      items: items,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process voice input" }, { status: 500 })
  }
}

function parseVoiceOrder(text: string) {
  const items = []
  const words = text.split(" ")

  for (let i = 0; i < words.length; i++) {
    if ((words[i] === "KILOS" || words[i] === "LITERS") && i > 0 && i < words.length - 1) {
      const quantity = words[i - 1]
      const unit = words[i] === "KILOS" ? "kg" : "L"
      const item = words[i + 1]
      items.push({ item: item.toLowerCase(), quantity, unit })
    }
  }

  return items
}
