'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ErrorMessage,
  useFormik,
  FormikProvider,
  type FormikConfig
} from 'formik'
import * as Yup from 'yup'

export interface FormData {
  serial_number: string
  name: string
  location: string
  description?: string
  baud_rate: number
  device_path: string
  parity: number
  data_bits: number
  stop_bits: number
  target_temperature: number
  latitude?: number
  longitude?: number
  num_slots: number
  technician_password: string
}

const initialValues: FormData = {
  serial_number: '',
  name: '',
  location: '',
  baud_rate: 9600,
  device_path: '/dev/ttyS1',
  parity: 0,
  data_bits: 8,
  stop_bits: 1,
  target_temperature: 15,
  num_slots: 120,
  technician_password: ''
}

const validationSchema = Yup.object().shape({
  serial_number: Yup.string().required('Обязательное поле'),
  name: Yup.string().required('Обязательное поле'),
  location: Yup.string().required('Обязательное поле'),
  description: Yup.string(),
  baud_rate: Yup.number().required('Обязательное поле'),
  device_path: Yup.string().required('Обязательное поле'),
  parity: Yup.number().required('Обязательное поле'),
  data_bits: Yup.number().required('Обязательное поле'),
  stop_bits: Yup.number().required('Обязательное поле'),
  target_temperature: Yup.number().required('Обязательное поле'),
  latitude: Yup.number(),
  longitude: Yup.number(),
  num_slots: Yup.number().min(1, 'Минимум 1').required('Обязательное поле'),
  technician_password: Yup.string().required('Обязательное поле')
})

interface AddMachineDialogProps {
  open: boolean
  onClose: () => void
  defaultValues?: Partial<FormData>
  onSubmit: FormikConfig<FormData>['onSubmit']
  isEditing?: boolean
}

export function AddMachineDialog({
  open,
  onClose,
  defaultValues,
  onSubmit,
  isEditing = false
}: AddMachineDialogProps) {
  const formik = useFormik<FormData>({
    initialValues: { ...initialValues, ...defaultValues },
    validationSchema,
    onSubmit
  })

  useEffect(() => {
    if (open && !defaultValues?.latitude && !defaultValues?.longitude) {
      navigator.geolocation.getCurrentPosition(
        position => {
          formik.setFieldValue('latitude', position.coords.latitude)
          formik.setFieldValue('longitude', position.coords.longitude)
        },
        error => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-work-sans)]">
            {isEditing ? 'Редактировать аппарат' : 'Добавить новый аппарат'}
          </DialogTitle>
        </DialogHeader>

        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="serial_number">Серийный номер *</Label>
                <Input
                  id="serial_number"
                  name="serial_number"
                  value={formik.values.serial_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="SN123456"
                />
                <ErrorMessage
                  name="serial_number"
                  component="div"
                  className="text-destructive text-xs"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Название аппарата *</Label>
              <Input
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Например: Мега Центр #1"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-destructive text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Местоположение *</Label>
              <Input
                id="location"
                name="location"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Например: ТЦ Мега, 1 этаж, вход А"
              />
              <ErrorMessage
                name="location"
                component="div"
                className="text-destructive text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="latitude">Широта</Label>
              <Input
                id="latitude"
                name="latitude"
                value={formik.values.latitude}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <ErrorMessage
                name="latitude"
                component="div"
                className="text-destructive text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Долгота</Label>
              <Input
                id="longitude"
                name="longitude"
                value={formik.values.longitude}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <ErrorMessage
                name="longitude"
                component="div"
                className="text-destructive text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="num_slots">Количество слотов *</Label>
              <Input
                id="num_slots"
                name="num_slots"
                type="number"
                value={formik.values.num_slots}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="20"
              />
              <ErrorMessage
                name="num_slots"
                component="div"
                className="text-destructive text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technician_password">Пароль техника *</Label>
              <Input
                id="technician_password"
                name="technician_password"
                value={formik.values.technician_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Пароль для сервисного доступа"
              />
              <ErrorMessage
                name="technician_password"
                component="div"
                className="text-destructive text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Дополнительная информация</Label>
              <Textarea
                id="description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Особенности установки, контактная информация и т.д."
                rows={3}
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-destructive text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_temperature">
                Целевая температура (°C) *
              </Label>
              <Input
                id="target_temperature"
                name="target_temperature"
                type="number"
                value={formik.values.target_temperature}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <ErrorMessage
                name="target_temperature"
                component="div"
                className="text-destructive text-xs"
              />
            </div>

            {/* Advanced fields */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="baud_rate">Baud Rate *</Label>
                <Input
                  id="baud_rate"
                  name="baud_rate"
                  type="number"
                  value={formik.values.baud_rate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled
                />
                <ErrorMessage
                  name="baud_rate"
                  component="div"
                  className="text-destructive text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parity">Parity *</Label>
                <Input
                  id="parity"
                  name="parity"
                  type="number"
                  value={formik.values.parity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled
                />
                <ErrorMessage
                  name="parity"
                  component="div"
                  className="text-destructive text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_bits">Data Bits *</Label>
                <Input
                  id="data_bits"
                  name="data_bits"
                  type="number"
                  value={formik.values.data_bits}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled
                />
                <ErrorMessage
                  name="data_bits"
                  component="div"
                  className="text-destructive text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stop_bits">Stop Bits *</Label>
                <Input
                  id="stop_bits"
                  name="stop_bits"
                  type="number"
                  value={formik.values.stop_bits}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled
                />
                <ErrorMessage
                  name="stop_bits"
                  component="div"
                  className="text-destructive text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="device_path">Device Path *</Label>
              <Input
                id="device_path"
                name="device_path"
                value={formik.values.device_path}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled
              />
              <ErrorMessage
                name="device_path"
                component="div"
                className="text-destructive text-xs"
              />
            </div>

            <DialogFooter className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>

              <Button type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting
                  ? 'Сохраняем...'
                  : isEditing
                    ? 'Сохранить'
                    : 'Добавить'}
              </Button>
            </DialogFooter>
          </form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  )
}
