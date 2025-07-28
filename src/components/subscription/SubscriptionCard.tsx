import {
  Calendar,
  CreditCard,
  MoreVertical,
  Pencil,
  Trash2,
  Ban,
  Tag,
  RotateCcw,
  Hand
} from "lucide-react"

import { Subscription, useSubscriptionStore } from "@/store/subscriptionStore"
import {
  formatDate,
  daysUntil,
  getStatusColor,
  getBillingCycleLabel,
  getCategoryLabel,
  getPaymentMethodLabel
} from "@/lib/subscription-utils"
import { formatWithUserCurrency } from "@/utils/currency"

import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SubscriptionCardProps {
  subscription: Subscription
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: 'active' | 'cancelled') => void
  onManualRenew?: (id: number) => void
  onViewDetails?: (subscription: Subscription) => void
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onStatusChange,
  onManualRenew,
  onViewDetails
}: SubscriptionCardProps) {
  const {
    id,
    name,
    plan,
    amount,
    currency,
    nextBillingDate,
    billingCycle,
    paymentMethod,
    status,
    category,
    renewalType,
    website
  } = subscription
  
  // Get options from the store
  const { categories, paymentMethods } = useSubscriptionStore()

  // Get the category and payment method labels using unified utility functions
  const categoryLabel = getCategoryLabel(subscription, categories)
  const paymentMethodLabel = getPaymentMethodLabel(subscription, paymentMethods)

  const daysLeft = daysUntil(nextBillingDate)
  const isExpiringSoon = daysLeft <= 7
  
  // Helper function to determine badge color based on urgency
  const getBadgeVariant = () => {
    if (status === 'cancelled') return "secondary"
    if (daysLeft <= 3) return "destructive"
    if (daysLeft <= 7) return "warning"
    return "secondary"
  }

  // Helper function to determine billing cycle badge variant
  const getBillingCycleBadgeVariant = () => {
    switch (billingCycle) {
      case 'yearly':
        return "success" // Green color for yearly
      case 'monthly':
        return "warning" // Orange/yellow for monthly
      case 'quarterly':
        return "info" // Blue for quarterly
      default:
        return "outline"
    }
  }

  return (
    <Card
      className="w-full cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onViewDetails?.(subscription)}
    >
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">{name}</h3>
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{plan}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation()
              onEdit(id)
            }}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {status === 'active' ? (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onStatusChange(id, 'cancelled')
              }}>
                <Ban className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onStatusChange(id, 'active')
              }}>
                <Calendar className="mr-2 h-4 w-4" />
                Reactivate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDelete(id)
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <div className="font-medium">{formatWithUserCurrency(amount, currency)}</div>
          <Badge variant={getBillingCycleBadgeVariant()}>
            {getBillingCycleLabel(billingCycle)}
          </Badge>
        </div>
        
        <div className="space-y-1 text-sm flex-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span className="font-medium">{categoryLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <div className="flex items-center gap-2">
              <span>Next payment:</span>
              <span className={isExpiringSoon ? "text-destructive font-medium" : ""}>
                {formatDate(nextBillingDate)}
              </span>
              {isExpiringSoon && status === 'active' && (
                <Badge variant={getBadgeVariant()}>
                  {daysLeft === 0 ? "Today" : `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>{paymentMethodLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            {renewalType === 'auto' ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Hand className="h-4 w-4" />
            )}
            <span>{renewalType === 'auto' ? 'Automatic Renewal' : 'Manual Renewal'}</span>
          </div>
        </div>
      </CardContent>


    </Card>
  )
}