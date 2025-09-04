import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { useProductsList } from '@/entities/products/use-products-list'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface Product {
  id: number
  name: string
  sku: string
}

interface ProductSelectorProps {
  value: Product
  onValueChange: (value: Product) => void
  onCancelClick: () => void
  className?: string
}

function ProductSelector({
  value,
  onValueChange,
  onCancelClick,
  className
}: ProductSelectorProps) {
  const productsQuery = useProductsList()

  const options =
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
    })) || []

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Combobox
        options={options}
        value={JSON.stringify(value)}
        onChange={newValue => onValueChange(JSON.parse(newValue))}
        placeholder="Выберите товар"
        className="w-48"
      />

      <Button variant="ghost" size="sm" onClick={onCancelClick}>
        <X />
      </Button>
    </div>
  )
}

export { ProductSelector, type ProductSelectorProps }
