import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

export function useReport() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const reportArtwork = async (artworkId: string, reason: string, description?: string) => {
    try {
      setLoading(true)
      
      await apiClient.reportArtwork(artworkId, reason, description)
      
      toast({
        title: "Report submitted",
        description: "Thank you for reporting this artwork. We'll review it shortly.",
      })
      
      return true
    } catch (error: any) {
      let errorMessage = "Failed to submit report"
      
      // Handle specific error messages
      if (error.message === "You have already reported this artwork") {
        errorMessage = "You have already reported this artwork"
      } else if (error.message === "Authentication required") {
        errorMessage = "Please log in to report artwork"
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Report failed",
        description: errorMessage,
        variant: "destructive",
      })
      
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    reportArtwork,
  }
}
