'use client'

import { useState } from 'react'
import { useVendingMachineProducts } from '@/entities/vending-machines/use-vending-machine-products'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ProductSelector } from '@/features/product-selector'
import { useFormik, FormikProvider, FieldArray } from 'formik'
import * as Yup from 'yup'
import { Edit3, PlusCircle, Trash2 } from 'lucide-react'
import { useProductsList } from '@/entities/products/use-products-list'

interface MachineRestockDialogProps {
  machineId: number
  slotsCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SlotFormData {
  slotNumber: number
  productId: string
  restockQty: number
  currentStock: number
  maxCapacity: number
}

const validationSchema = Yup.object().shape({
  slots: Yup.array()
    .of(
      Yup.object().shape({
        slotNumber: Yup.number().required(),
        productId: Yup.string(),
        restockQty: Yup.number().min(
          0,
          'Количество не может быть отрицательным'
        ),
        currentStock: Yup.number().required(),
        maxCapacity: Yup.number().required()
      })
    )
    .test('at-least-one-change', 'Нет изменений для применения', slots => {
      return (
        slots?.some(
          slot =>
            slot.productId !== undefined ||
            (slot.restockQty && slot.restockQty > 0)
        ) ?? false
      )
    })
})

export function MachineRestockDialog({
  machineId,
  slotsCount,
  open,
  onOpenChange
}: MachineRestockDialogProps) {
  const productsQuery = useProductsList()
  const machineProductsQuery = useVendingMachineProducts(machineId)
  const [editingSlot, setEditingSlot] = useState<number | null>(null)

  const allProducts = productsQuery.data?.products || []
  const slotProducts = machineProductsQuery?.data?.data ?? []

  // Prepare slots array from query result
  const slots = Array.from({ length: slotsCount }, (_, i) => {
    const slotData = slotProducts.find(s => s.slot_index === i + 1)

    return {
      slotNumber: i + 1,
      product: slotData?.products,
      currentStock: slotData?.current_stock ?? 0,
      maxCapacity: slotData?.max_capacity ?? 0
    }
  })

  // Prepare initial form values as array
  const initialSlots: SlotFormData[] = slots.map(slot => ({
    slotNumber: slot.slotNumber,
    productId: slot.product?.id?.toString() ?? '',
    restockQty: 0,
    currentStock: slot.currentStock,
    maxCapacity: slot.maxCapacity
  }))

  const formik = useFormik({
    initialValues: { slots: initialSlots },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      // Connect to backend PATCH request here
      console.log('Submitting:', values)
      onOpenChange(false)
    }
  })

  const handleProductChange = (index: number, productId: string) => {
    formik.setFieldValue(`slots.${index}.productId`, productId)
    formik.setFieldValue(`slots.${index}.restockQty`, 0)
    setEditingSlot(null)
  }

  const handleRemoveProduct = (index: number) => {
    formik.setFieldValue(`slots.${index}.productId`, '')
    formik.setFieldValue(`slots.${index}.restockQty`, 0)
    setEditingSlot(null)
  }

  const handleRestockQtyChange = (index: number, qty: number) => {
    const slotData = formik.values.slots[index]
    if (!slotData) return

    const maxPossible = slotData.maxCapacity - slotData.currentStock
    const finalQty = Math.max(0, Math.min(maxPossible, qty))
    formik.setFieldValue(`slots.${index}.restockQty`, finalQty)
  }

  const fillSlotToMax = (index: number) => {
    const slotData = formik.values.slots[index]
    if (!slotData) return

    const maxRestockQty = slotData.maxCapacity - slotData.currentStock
    formik.setFieldValue(`slots.${index}.restockQty`, maxRestockQty)
  }

  if (productsQuery.isLoading || machineProductsQuery.isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <span className="text-muted-foreground">Загрузка слотов...</span>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[1000px] !max-w-[95%] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Пополнение аппарата</DialogTitle>
        </DialogHeader>

        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <FieldArray name="slots">
              {() => (
                <div className="grid gap-4">
                  {formik.values.slots.map((slotForm, index) => {
                    const product =
                      allProducts.find(
                        p => p.id.toString() === slotForm.productId
                      ) ||
                      slots.find(s => s.slotNumber === slotForm.slotNumber)
                        ?.product

                    const maxPossible =
                      slotForm.maxCapacity - slotForm.currentStock
                    const isEditing = editingSlot === slotForm.slotNumber
                    const isEmpty = !product

                    return (
                      <Card key={slotForm.slotNumber} className="p-3">
                        <CardContent className="p-0">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="font-mono text-sm min-w-[3rem]"
                              >
                                {slotForm.slotNumber}
                              </Badge>

                              {!isEmpty && !isEditing && (
                                <>
                                  <span className="font-medium">
                                    {product?.name}
                                  </span>

                                  <div className="ml-auto">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      type="button"
                                      onClick={() =>
                                        setEditingSlot(slotForm.slotNumber)
                                      }
                                      className="text-xs"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      type="button"
                                      onClick={() => handleRemoveProduct(index)}
                                      className="text-xs text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </>
                              )}

                              {isEditing && (
                                <ProductSelector
                                  value={{
                                    id: product?.id || 0,
                                    name: product?.name || '',
                                    sku: product?.sku || ''
                                  }}
                                  onValueChange={value =>
                                    handleProductChange(
                                      index,
                                      value.id.toString()
                                    )
                                  }
                                  onCancelClick={() => setEditingSlot(null)}
                                  className="ml-auto"
                                />
                              )}

                              {isEmpty && !isEditing && (
                                <Button
                                  variant="outline"
                                  type="button"
                                  onClick={() =>
                                    setEditingSlot(slotForm.slotNumber)
                                  }
                                  className="flex items-center gap-1 ml-auto"
                                  title="Добавить товар в слот"
                                >
                                  <PlusCircle />
                                </Button>
                              )}
                            </div>

                            {!isEmpty && (
                              <div className="flex items-center gap-2">
                                <span>
                                  Запас: {slotForm.currentStock} /{' '}
                                  {slotForm.maxCapacity}
                                </span>

                                <span>Цена: ₸{product?.price}</span>
                              </div>
                            )}

                            {!isEmpty && !isEditing && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  type="button"
                                  onClick={() => fillSlotToMax(index)}
                                  className="text-xs"
                                >
                                  Заполнить
                                </Button>

                                <Input
                                  type="number"
                                  name={`slots.${index}.restockQty`}
                                  value={slotForm.restockQty}
                                  onChange={e =>
                                    handleRestockQtyChange(
                                      index,
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-16 text-center"
                                  min="0"
                                  max={maxPossible}
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </FieldArray>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Отмена
              </Button>

              <Button
                type="submit"
                disabled={formik.isSubmitting || !formik.isValid}
                className="flex-1"
              >
                {formik.isSubmitting ? 'Сохраняем...' : 'Применить изменения'}
              </Button>
            </div>
          </form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  )
}
