import { Badge } from './ui/badge'

interface ProductStatusBadgeProps {
  isLowStock: boolean
  isOutOfStock: boolean
}

const ProductStatusBadge = ({
  isLowStock,
  isOutOfStock
}: ProductStatusBadgeProps) => {
  if (isOutOfStock) {
    return <Badge variant="destructive">Нет в наличии</Badge>
  }

  if (isLowStock) {
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        Низкий запас
      </Badge>
    )
  }

  return (
    <Badge variant="default" className="bg-green-100 text-green-800">
      В наличии
    </Badge>
  )
}

export { ProductStatusBadge, type ProductStatusBadgeProps }
