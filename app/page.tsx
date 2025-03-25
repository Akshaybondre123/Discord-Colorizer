"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Github, Copy, Trash2, Bold, Underline } from "lucide-react"

export default function DiscordColoredTextGenerator() {
  const [text, setText] = useState("")
  const [selectedColor, setSelectedColor] = useState("red")
  const [isBold, setIsBold] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [formattedSegments, setFormattedSegments] = useState<
    Array<{
      text: string
      isFormatted: boolean
      color?: string
      bold?: boolean
      underline?: boolean
      rawCode?: string
    }>
  >([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const colors = [
    { name: "red", code: 31, bg: "bg-red-500", textClass: "text-red-500" },
    { name: "green", code: 32, bg: "bg-green-500", textClass: "text-green-500" },
    { name: "yellow", code: 33, bg: "bg-yellow-500", textClass: "text-yellow-500" },
    { name: "blue", code: 34, bg: "bg-blue-500", textClass: "text-blue-500" },
    { name: "magenta", code: 35, bg: "bg-pink-500", textClass: "text-pink-500" },
    { name: "cyan", code: 36, bg: "bg-cyan-500", textClass: "text-cyan-500" },
    { name: "white", code: 37, bg: "bg-gray-200", textClass: "text-gray-200" },
  ]

  const applyColor = () => {
    if (!textareaRef.current) return

    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd

    if (start === end) return

    const selectedText = text.substring(start, end)
    const colorObj = colors.find((c) => c.name === selectedColor)
    const colorCode = colorObj?.code || 31

    let formattingCodes = `${colorCode}`
    if (isBold) formattingCodes = `1;${formattingCodes}`
    if (isUnderline) formattingCodes = `4;${formattingCodes}`

    const rawCode = `\`\`\`ansi\n[${formattingCodes}m${selectedText}[0m\n\`\`\``

    // Create new segments
    const newSegments = [...formattedSegments]

    // Find if there are any segments that overlap with our selection
    const segmentIndex = 0
    const currentPosition = 0

    // Add text before selection if needed
    if (start > 0 && formattedSegments.length === 0) {
      newSegments.push({
        text: text.substring(0, start),
        isFormatted: false,
      })
    }

    // Add the formatted segment
    newSegments.push({
      text: selectedText,
      isFormatted: true,
      color: colorObj?.name,
      bold: isBold,
      underline: isUnderline,
      rawCode,
    })

    // Add text after selection if needed
    if (end < text.length) {
      newSegments.push({
        text: text.substring(end),
        isFormatted: false,
      })
    }

    setFormattedSegments(newSegments)

    // Update the visible text (without ANSI codes)
    const newVisibleText = newSegments.map((segment) => segment.text).join("")
    setText(newVisibleText)

    toast({
      title: "Formatting Applied",
      description: `Applied ${selectedColor}${isBold ? " bold" : ""}${isUnderline ? " underline" : ""} to the selected text.`,
    })
  }

  const copyToClipboard = () => {
    // Generate the raw Discord text with ANSI codes
    const discordText = formattedSegments
      .map((segment) => (segment.isFormatted ? segment.rawCode : segment.text))
      .join("")

    navigator.clipboard.writeText(discordText)
    toast({
      title: "Copied to clipboard",
      description: "You can now paste this in Discord!",
    })
  }

  const clearText = () => {
    setText("")
    setFormattedSegments([])
    toast({
      title: "Text cleared",
      description: "The editor has been reset.",
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto bg-[#36393f] text-white border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl">Discord Colored Text Generator</CardTitle>
          <CardDescription className="text-gray-300">
            Create colored Discord messages using ANSI color codes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {colors.map((color) => (
              <Button
                key={color.name}
                className={`${color.bg} text-white h-8 ${selectedColor === color.name ? "ring-2 ring-white" : ""}`}
                onClick={() => setSelectedColor(color.name)}
              >
                {color.name}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={isBold ? "default" : "outline"}
              className={`h-8 ${isBold ? "bg-[#5865f2]" : "border-gray-600"}`}
              onClick={() => setIsBold(!isBold)}
            >
              <Bold className="h-4 w-4 mr-2" />
              Bold
            </Button>
            <Button
              variant={isUnderline ? "default" : "outline"}
              className={`h-8 ${isUnderline ? "bg-[#5865f2]" : "border-gray-600"}`}
              onClick={() => setIsUnderline(!isUnderline)}
            >
              <Underline className="h-4 w-4 mr-2" />
              Underline
            </Button>
          </div>

          {/* Text editor */}
          <Textarea
            ref={textareaRef}
            placeholder="Type your message here..."
            className="min-h-[200px] bg-[#40444b] border-[#202225] text-white"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              // Reset formatting when text is manually edited
              if (formattedSegments.length > 0) {
                setFormattedSegments([
                  {
                    text: e.target.value,
                    isFormatted: false,
                  },
                ])
              }
            }}
          />

          {/* Formatted text display */}
          <div className="min-h-[100px] bg-[#2f3136] rounded-md p-4 whitespace-pre-wrap">
            <h3 className="text-sm font-medium mb-2">Formatted Preview:</h3>
            <div>
              {formattedSegments.length > 0 ? (
                formattedSegments.map((segment, index) => {
                  if (!segment.isFormatted) {
                    return <span key={index}>{segment.text}</span>
                  }

                  const colorClass = colors.find((c) => c.name === segment.color)?.textClass || ""
                  const style: React.CSSProperties = {
                    fontWeight: segment.bold ? "bold" : "normal",
                    textDecoration: segment.underline ? "underline" : "none",
                  }

                  return (
                    <span key={index} className={colorClass} style={style}>
                      {segment.text}
                    </span>
                  )
                })
              ) : (
                <span className="text-gray-400">Your formatted text will appear here</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={applyColor} className="bg-[#5865f2] hover:bg-[#4752c4]">
              Apply Formatting to Selection
            </Button>
            <Button variant="outline" onClick={clearText} className="border-gray-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-gray-700 pt-4">
          <div className="text-sm text-gray-300">
            <p>To use this, select text and assign colors/formatting, then copy and paste into Discord.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyToClipboard} className="border-gray-600">
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button variant="outline" className="border-gray-600" asChild>
              <a
                href="https://gist.github.com/rebane2001/07f2d8e80df053c70a1576d27eabe97c"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                Source
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  )
}

