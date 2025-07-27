"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

interface VoiceOrderingProps {
  isRecording: boolean;
  voiceOrder: string;
  startVoiceRecording: () => void;
  processVoiceOrder: () => void;
  setVoiceOrder: (order: string) => void;
}

export function VoiceOrdering({
  isRecording,
  voiceOrder,
  startVoiceRecording,
  processVoiceOrder,
  setVoiceOrder,
}: VoiceOrderingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="h-5 w-5" />
          <span>Voice Ordering</span>
        </CardTitle>
        <CardDescription>
          Speak your order naturally in Hindi or English
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button
            onClick={startVoiceRecording}
            disabled={isRecording}
            className={`${
              isRecording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-orange-600 hover:bg-orange-700"
            } text-white`}
          >
            <Mic className="h-4 w-4 mr-2" />
            {isRecording ? "Recording..." : "Start Voice Order"}
          </Button>
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-600">
              <div className="animate-pulse h-2 w-2 bg-red-600 rounded-full"></div>
              <span className="text-sm">Listening...</span>
            </div>
          )}
        </div>
        {voiceOrder && (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Recognized order:</p>
              <p className="font-medium">{voiceOrder}</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={processVoiceOrder} size="sm">
                Process Order
              </Button>
              <Button
                onClick={() => setVoiceOrder("")}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
