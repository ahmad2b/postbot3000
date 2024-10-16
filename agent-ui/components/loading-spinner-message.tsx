import { Loader2Icon } from 'lucide-react'

export const LoadingSpinnerWithMessage = ({ message }: { message: string }) => (
  <div className="flex items-center gap-4 animate-pulse">
    <Loader2Icon className="size-5 animate-spin " />
    <div className="animate-pulse">{message}</div>
  </div>
)
