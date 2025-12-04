/**
 * A type representing either a successful parse result or null if parsing failed.
 */
export type ParseResult<T> = { success: true; data: T } | { success: false; error: string }

/**
 * Parses a string to a JSON object, handling common LLM output edge cases,
 * without relying on any third-party libraries.
 *
 * This function attempts to extract and parse a valid JSON object from a string
 * that may contain surrounding text, markdown code blocks, or syntax errors.
 *
 * @param llmOutput The raw string output from the large language model.
 * @returns A `ParseResult` object indicating success or failure.
 */
export function parseLlmResponse<T>(llmOutput: string): ParseResult<T> {
  if (!llmOutput || llmOutput.trim() === "") {
    return { success: false, error: "Input string is empty or null." }
  }

  // Edge Case 1 & 2: Clean up surrounding text and markdown code blocks.
  let cleanedString = llmOutput.trim()

  // Try to find and extract content from a markdown JSON code block
  const markdownMatch = cleanedString.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (markdownMatch && markdownMatch[1]) {
    cleanedString = markdownMatch[1]
  }

  // Edge Case 3: Handle malformed JSON with common fixes
  try {
    const fixedJsonString = fixMalformedJson(cleanedString)
    const result = JSON.parse(fixedJsonString) as T
    return { success: true, data: result }
  } catch (error) {
    // If fixing fails, try the next approach.
  }

  // Edge Case 4: Handle partial JSON for streaming.
  try {
    const lastValidJson = findLastValidJson(cleanedString)
    if (lastValidJson) {
      const result = JSON.parse(lastValidJson) as T
      return { success: true, data: result }
    }
  } catch (error) {
    // Fall through to the final attempt.
  }

  // Final fallback: Try to extract a JSON object from the string using a simple regex
  const simpleMatch = cleanedString.match(/\{[\s\S]*\}/)
  if (simpleMatch && simpleMatch[0]) {
    try {
      const result = JSON.parse(simpleMatch[0]) as T
      return { success: true, data: result }
    } catch (error) {
      // The extracted string is still not valid JSON.
    }
  }

  // If all attempts fail, return a failure result with an error message.
  return { success: false, error: "Failed to parse valid JSON from the LLM output." }
}

/**
 * Helper function to find and parse the last complete JSON object in a string.
 */
function findLastValidJson(input: string): string | null {
  let lastIndex = input.lastIndexOf("}")
  while (lastIndex !== -1) {
    const potentialJson = input.substring(0, lastIndex + 1)
    try {
      JSON.parse(potentialJson)
      return potentialJson
    } catch (e) {
      lastIndex = input.lastIndexOf("}", lastIndex - 1)
    }
  }
  return null
}

/**
 * Attempts to fix common JSON syntax errors from LLMs.
 */
function fixMalformedJson(jsonString: string): string {
  // Replace single quotes with double quotes
  let fixed = jsonString.replace(/'/g, '"')

  // Add quotes to unquoted keys (e.g., `{ key: "value" }` -> `{ "key": "value" }`)
  fixed = fixed.replace(/(\s*?{\s*?|\s*?,\s*?)([\w\d_]+?):/g, '$1"$2":')

  // Remove trailing commas in objects and arrays
  fixed = fixed.replace(/,(\s*[}\]])/g, "$1")

  return fixed
}
