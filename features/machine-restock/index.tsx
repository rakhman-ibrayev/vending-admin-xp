'use client'

import { useCallback } from 'react'
import { useVendingMachineProducts } from '@/entities/vending-machines/use-vending-machine-products'
import { useRestockVendingMachine } from '@/entities/vending-machines/use-restock-vending-machine'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useProductsList } from '@/entities/products/use-products-list'
import { MachineCard } from './machine-card'
import { RestockActionBar } from './restock-action-bar'
import { cn } from '@/lib/classnames/cn'

const validationSchema = Yup.object().shape({
  slots: Yup.array().of(
    Yup.object().shape({
      restockQty: Yup.number()
        .nullable()
        .min(1, 'Количество не может быть 0')
        .test('stock-available', function (value) {
          const { product } = this.parent

          if (!product || !value) return true

          // Get all slots from the form
          const allSlots = this.from?.[1]?.value?.slots || []

          // Calculate total restock quantity for this product across all slots
          const totalRestockForProduct = allSlots.reduce(
            (total: number, slot: any) => {
              if (slot.product?.id === product.id && slot.restockQty) {
                return total + slot.restockQty
              }

              return total
            },
            0
          )

          const availableStock = product.stock
          if (totalRestockForProduct > availableStock) {
            return this.createError({
              message: `Недостаточно товара на складе (всего нужно: ${totalRestockForProduct}, доступно: ${availableStock})`
            })
          }
          return true
        })
    })
  )
})

interface MachineRestockProps {
  machineId: number
  slotsCount: number
  machineSerialNumber: string
}

interface FormData {
  slots: {
    slotNumber: number
    product: {
      id: number
      name: string | null
      price: number
      sku: string
      image: string | null
      category: string | null
      stock: number
    } | null
    currentStock: number
    maxCapacity: number
    restockQty: number | null
  }[]
}

const MachineRestock = ({
  machineId,
  slotsCount,
  machineSerialNumber
}: MachineRestockProps) => {
  const productsQuery = useProductsList()
  const machineProductsQuery = useVendingMachineProducts(machineId)
  const restockMutation = useRestockVendingMachine(machineSerialNumber)

  const allProducts = productsQuery.data?.products || []
  const slotProducts = machineProductsQuery?.data?.data ?? []

  const handleSubmit = async (values: FormData) => {
    const activeSlots = values.slots.filter(slot => slot.maxCapacity)

    const slots = activeSlots.map(slot => ({
      slotIndex: slot.slotNumber,
      productId: slot.product?.id ?? null,
      currentStock: slot.restockQty ?? 0,
      maxCapacity: slot.maxCapacity
    }))

    await restockMutation.mutateAsync({ machineId, slots })
    formik.resetForm({ values })
  }

  const formik = useFormik<FormData>({
    initialValues: {
      slots: Array.from({ length: slotsCount }, (_, i) => {
        const slotNumber = i + 1
        const slotData = slotProducts.find(
          slot => slot.slot_index === slotNumber
        )

        return {
          slotNumber,
          product: slotData?.products || null,
          currentStock: slotData?.current_stock ?? 0,
          maxCapacity: slotData?.max_capacity ?? 0,
          restockQty: slotData?.current_stock ?? null
        }
      })
    },
    validationSchema,
    validateOnChange: true,
    onSubmit: handleSubmit
  })

  const handleProductChange = useCallback(
    (index: number, productId: string) => {
      const product = allProducts.find(p => p.id.toString() === productId)

      formik.setFieldValue(`slots.${index}.product`, product)
      formik.setFieldValue(`slots.${index}.restockQty`, 0)
      formik.setFieldValue(`slots.${index}.maxCapacity`, 10)
    },
    [allProducts, formik]
  )

  const handleRemoveProduct = useCallback(
    (index: number) => {
      formik.setFieldValue(`slots.${index}.product`, null)
      formik.setFieldValue(`slots.${index}.restockQty`, null)
    },
    [formik]
  )

  const handleRestockQtyChange = useCallback(
    (index: number, qty: number) => {
      formik.setFieldValue(`slots.${index}.restockQty`, qty)
    },
    [formik]
  )

  const handleMaxCapacityChange = useCallback(
    (index: number, capacity: number) => {
      formik.setFieldValue(`slots.${index}.maxCapacity`, capacity)
    },
    [formik]
  )

  const handleFillSlot = useCallback(
    (index: number, maxCapacity: number) => {
      formik.setFieldValue(`slots.${index}.restockQty`, maxCapacity)
    },
    [formik]
  )

  const getSlotValidationError = useCallback(
    (slotIndex: number): string | null => {
      const errorPath = formik.errors.slots?.[slotIndex]
      return (errorPath as any)?.restockQty || null
    },
    [formik.errors.slots]
  )

  const handleCancel = useCallback(() => {
    formik.resetForm()
  }, [formik])

  const hasValidationErrors = Boolean(formik.errors.slots)
  const showActionBar = formik.dirty

  if (productsQuery.isLoading || machineProductsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-muted-foreground">Загрузка слотов...</span>
      </div>
    )
  }

  return (
    <form
      onSubmit={formik.handleSubmit}
      className={cn(showActionBar ? 'pb-18' : 'pb-12', 'md:p-0 grid gap-4')}
    >
      {formik.values.slots.map((slotForm, index) => {
        const product = slotForm.product
        const validationError = getSlotValidationError(index)

        return (
          <MachineCard
            key={slotForm.slotNumber}
            index={index}
            productId={product?.id || 0}
            productName={product?.name || ''}
            productSku={product?.sku || ''}
            productPrice={product?.price || 0}
            productStock={product?.stock || 0}
            isEmpty={!product}
            restockQty={slotForm.restockQty || 0}
            maxCapacity={slotForm.maxCapacity}
            validationError={validationError}
            onProductChange={handleProductChange}
            onRemoveProduct={handleRemoveProduct}
            onRestockQtyChange={handleRestockQtyChange}
            onMaxCapacityChange={handleMaxCapacityChange}
            fillSlotToMax={handleFillSlot}
          />
        )
      })}

      {showActionBar && (
        <RestockActionBar
          hasErrors={hasValidationErrors}
          isSubmitting={formik.isSubmitting}
          onSubmit={formik.handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </form>
  )
}

export { MachineRestock, type MachineRestockProps, type FormData }
