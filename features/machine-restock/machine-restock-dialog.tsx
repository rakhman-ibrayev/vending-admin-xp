'use client'

import { useCallback } from 'react'
import { useVendingMachineProducts } from '@/entities/vending-machines/use-vending-machine-products'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useProductsList } from '@/entities/products/use-products-list'
import { MachineCard } from './machine-card'

const validationSchema = Yup.object().shape({
  slots: Yup.array().of(
    Yup.object().shape({
      restockQty: Yup.number()
        .nullable()
        .min(1, 'Количество не может быть 0')
        .test('stock-available', function (value) {
          const { product } = this.parent
          if (!product || !value) return true

          const availableStock = product.stock
          if (value > availableStock) {
            return this.createError({
              message: `Недостаточно товара на складе`
            })
          }
          return true
        })
    })
  )
})

interface MachineRestockDialogProps {
  machineId: number
  slotsCount: number
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FormData) => void
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

export function MachineRestockDialog({
  machineId,
  slotsCount,
  onOpenChange,
  onSubmit
}: MachineRestockDialogProps) {
  const productsQuery = useProductsList()
  const machineProductsQuery = useVendingMachineProducts(machineId)

  const allProducts = productsQuery.data?.products || []
  const slotProducts = machineProductsQuery?.data?.data ?? []

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
    onSubmit
  })

  const handleProductChange = useCallback(
    (index: number, productId: string) => {
      const product = allProducts.find(p => p.id.toString() === productId)

      formik.setFieldValue(`slots.${index}.product`, product)
      formik.setFieldValue(`slots.${index}.restockQty`, 0)
      formik.setFieldValue(`slots.${index}.maxCapacity`, 10)
    },
    [allProducts]
  )

  const handleRemoveProduct = useCallback((index: number) => {
    formik.setFieldValue(`slots.${index}.product`, null)
    formik.setFieldValue(`slots.${index}.restockQty`, null)
  }, [])

  const handleRestockQtyChange = useCallback((index: number, qty: number) => {
    formik.setFieldValue(`slots.${index}.restockQty`, qty)
  }, [])

  const handleMaxCapacityChange = useCallback(
    (index: number, capacity: number) => {
      formik.setFieldValue(`slots.${index}.maxCapacity`, capacity)
    },
    []
  )

  const handleFillSlot = useCallback((index: number, maxCapacity: number) => {
    formik.setFieldValue(`slots.${index}.restockQty`, maxCapacity)
  }, [])

  // Get validation error for a specific slot using Formik's errors
  const getSlotValidationError = useCallback(
    (slotIndex: number): string | null => {
      const errorPath = formik.errors.slots?.[slotIndex]
      return (errorPath as any)?.restockQty || null
    },
    [formik.errors.slots]
  )

  // Check if form has any validation errors
  const hasValidationErrors = Boolean(formik.errors.slots)

  if (productsQuery.isLoading || machineProductsQuery.isLoading) {
    return (
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false}>
          <span className="text-muted-foreground">Загрузка слотов...</span>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open>
      <DialogContent
        className="!w-[97.5%] !max-w-[800px] max-h-[85vh] overflow-y-auto p-3 lg:p-5"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Пополнение аппарата</DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid gap-4">
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
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={formik.isSubmitting}
              className="flex-1"
            >
              Отмена
            </Button>

            <Button
              type="submit"
              disabled={
                formik.isSubmitting || !formik.dirty || hasValidationErrors
              }
              className="flex-1"
            >
              {formik.isSubmitting ? 'Сохраняем...' : 'Применить изменения'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
