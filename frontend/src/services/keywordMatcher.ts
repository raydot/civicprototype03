export interface CandidateProfile {
  id: string
  name: string
  office: string
  party: string
  keywords: string[]
  positions: Record<string, string>
  imageUrl?: string
}

export interface MatchedCandidate extends CandidateProfile {
  matchScore: number
  reasoning: string[]
}

// Common stop words to filter out
const STOP_WORDS = ["the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "must", "shall", "this", "that", "these", "those", "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them"]

// extract keywords from user input
export const extractKeywords = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word: string) => word.length > 2)
    .filter((word: string) => !STOP_WORDS.includes(word))
}

// Calculate match score between user keywords and candidate keywords
export const calculateMatchScore = (userKeywords: string[], candidateKeywords: string[]): number => {
  if (userKeywords.length === 0) return 0

  const matches = userKeywords.filter(userWord => candidateKeywords.some(candidateWord => candidateWord.includes(userWord) || userWord.includes(candidateWord)))
  return matches.length / userKeywords.length
}

// Match candidates based on user priorities
export const matchCandidates = (priorities: string[], candidates: CandidateProfile[]): MatchedCandidate[] => {
  const userKeywords = priorities.flatMap(extractKeywords)

  const matchedCandidates = candidates.map(candidate => {
    const matchScore = calculateMatchScore(userKeywords, candidate.keywords)
    const matchedKeywords = userKeywords.filter(userWord => candidate.keywords.some(candidateWord => candidateWord.includes(userWord) || userWord.includes(candidateWord)))
    const reasoning = matchedKeywords.length > 0 ? ["Matches your priorities: ${matchedKeywords.slice(0, 3).join(", ")}"] : ["Limited alignment with stated priorities"]

    return {
      ...candidate,
      matchScore,
      reasoning
    }
  })

  // Sort candidates by match score
  return matchedCandidates.sort((a, b) => b.matchScore - a.matchScore)
}

// Convenience object for backward compatibility
export const keywordMatcher = {
  extractKeywords,
  calculateMatchScore,
  matchCandidates
}
