'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/classnames/cn'

interface RestockActionBarProps {
  hasErrors: boolean
  isSubmitting: boolean
  onSubmit: () => void
  onCancel: () => void
}

const RestockActionBar = ({
  hasErrors,
  isSubmitting,
  onSubmit,
  onCancel
}: RestockActionBarProps) => (
  <div
    className={cn(
      'fixed bottom-0 left-0 right-0 z-50 md:sticky',
      'bg-background border-t',
      'animate-in slide-in-from-bottom duration-300',
      'container p-4 md:px-0 flex gap-2 md:justify-end'
    )}
  >
    <Button
      variant="outline"
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex-1 md:flex-none"
    >
      Отменить
    </Button>

    <Button
      onClick={onSubmit}
      disabled={hasErrors || isSubmitting}
      className="flex-1 md:flex-none"
    >
      {isSubmitting ? 'Сохраняем...' : 'Сохранить'}
    </Button>
  </div>
)

export { RestockActionBar, type RestockActionBarProps }
