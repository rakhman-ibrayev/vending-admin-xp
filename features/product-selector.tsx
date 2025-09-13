import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { useProductsList } from '@/entities/products/use-products-list'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { useMemo } from 'react'

interface Product {
  id: number
  name: string
  sku: string
}

interface ProductSelectorProps {
  value: Product
  onValueChange: (value: Product) => void
  onCancelClick?: () => void
  className?: string
}

function ProductSelector({
  value,
  onValueChange,
  onCancelClick,
  className
}: ProductSelectorProps) {
  const productsQuery = useProductsList()

  const options = useMemo(
    () =>
      productsQuery.data?.products.map(product => ({
        value: JSON.stringify({
          id: product.id,
          name: product.name,
          sku: product.sku
        }),
        label: (
          <span>
            {product.name}{' '}
            <span className="text-muted-foreground">- ₸{product.price}</span>
          </span>
        )
      })) || [],
    []
  )

  return (
    <div className={cn('flex items-center w-full max-w-56', className)}>
      <Combobox
        options={options}
        value={JSON.stringify(value)}
        onChange={newValue => onValueChange(JSON.parse(newValue))}
        placeholder="Выберите товар"
        className="flex-1"
      />

      {onCancelClick && (
        <Button variant="ghost" size="sm" onClick={onCancelClick}>
          <X />
        </Button>
      )}
    </div>
  )
}

export { ProductSelector, type ProductSelectorProps }
