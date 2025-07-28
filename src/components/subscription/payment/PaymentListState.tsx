import { Loader2, AlertCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaymentListStateProps {
  isLoading: boolean
  error: string | null
  isEmpty: boolean
  searchTerm: string
  onRetry: () => void
}

export function PaymentListState({
  isLoading,
  error,
  isEmpty,
  searchTerm,
  onRetry
}: PaymentListStateProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm">Loading payments...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-destructive mb-2">{error}</p>
        <Button variant="outline" onClick={onRetry} size="sm">
          Retry
        </Button>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">
          {searchTerm ? 'No payments found matching your search' : 'No payment records found'}
        </p>
      </div>
    )
  }

  return null
}