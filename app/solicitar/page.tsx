'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Car,
  FileText,
  Hash,
  Home,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Upload,
  User,
  Wrench,
  X,
  Calendar,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Camera,
  Key,
} from 'lucide-react'

type PhotoPreview = {
  file: File
  url: string
}

const MAX_PHOTOS = 4
const MAX_IMAGE_SIZE_MB = 1
const MAX_IMAGE_DIMENSION = 1920

export default function ServiceRequestPage() {
  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState<PhotoPreview[]>([])
  const [loadingCp, setLoadingCp] = useState(false)
  const [compressingPhotos, setCompressingPhotos] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    serviceType: '',
    serviceNeeded: '',
    wantsAdditionalKey: false, // apertura + llave
    keyType: '', // 'tradicional' | 'presencia'
    urgency: 'ahora',
    scheduleDate: '',
    description: '',
    legalConsent: false,

    // Datos automotrices
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    hasKey: '',
    vehicleStatus: '',

    // Datos domésticos
    doorLocked: '',
    hasAvailableKey: '',
    lockDamaged: '',

    // Datos comerciales
    commercialType: '',
  })

  const [address, setAddress] = useState({
    cp: '',
    estado: '',
    alcaldia: '',
    colonias: [] as string[],
    colonia: '',
    calleNumero: '',
    referencias: '',
  })

  const serviceOptions = {
    automotriz: [
      { value: 'apertura', label: 'Apertura de vehículo' },
      { value: 'llave', label: 'Realización / duplicado de llave' },
      { value: 'programacion', label: 'Programación de llave o control' },
      { value: 'otro', label: 'Otro' },
    ],
    domestico: [
      { value: 'apertura', label: 'Apertura de puerta' },
      { value: 'llave', label: 'Realización / duplicado de llave' },
      { value: 'cambio', label: 'Cambio / instalación de cerradura' },
      { value: 'reparacion', label: 'Reparación de cerradura' },
      { value: 'otro', label: 'Otro' },
    ],
    comercial: [
      { value: 'apertura', label: 'Apertura' },
      { value: 'llave', label: 'Realización / duplicado de llave' },
      { value: 'cambio', label: 'Cambio / instalación de cerradura' },
      { value: 'reparacion', label: 'Reparación' },
      { value: 'otro', label: 'Otro' },
    ],
  }

  const descriptionPlaceholder = {
    automotriz: 'Ej. Perdí todas las llaves de mi Jetta 2018 y necesito hacer una nueva...',
    domestico: 'Ej. La llave se rompió dentro de la cerradura y necesito abrir la puerta...',
    comercial: 'Ej. La cerradura de la entrada del local se atora y necesito repararla...',
  }

  const specificDescriptionPlaceholder: Record<string, string> = {
    'automotriz-apertura': 'Ej. Dejé las llaves dentro de mi Versa 2018 y el vehículo está cerrado...',
    'automotriz-apertura+llave': 'Ej. Dejé las llaves dentro y ya no tengo copia, necesito apertura y que me hagan una llave nueva en el mismo servicio...',
    'automotriz-llave': 'Ej. Perdí mi única llave de un Jetta 2018 y necesito realizar una nueva...',
    'automotriz-programacion': 'Ej. Ya tengo la llave, pero necesito programarla para mi Nissan...',
    'automotriz-perdida': 'Ej. Perdí todas las llaves de mi vehículo y necesito recuperar el acceso...',
    'automotriz-reparacion': 'Ej. El control dejó de funcionar y la carcasa está dañada...',
    'domestico-apertura': 'Ej. La puerta se cerró y necesito abrirla. La llave quedó dentro...',
    'domestico-apertura+llave': 'Ej. Me quedé afuera y además quiero que me hagan una llave nueva de una vez para no quedarme sin copia...',
    'domestico-llave': 'Ej. Necesito una copia de la llave de la puerta principal...',
    'domestico-cambio': 'Ej. Quiero cambiar la cerradura de la puerta principal por una nueva...',
    'domestico-reparacion': 'Ej. La llave entra pero la cerradura se atora y no gira correctamente...',
    'comercial-apertura': 'Ej. La puerta del local está cerrada y necesitamos abrirla...',
    'comercial-llave': 'Ej. Necesitamos duplicar varias llaves para el personal del negocio...',
  }

  const currentServiceOptions =
    formData.serviceType && formData.serviceType in serviceOptions
      ? serviceOptions[formData.serviceType as keyof typeof serviceOptions]
      : []

  const isApertura = formData.serviceNeeded === 'apertura'
  const descriptionKey = isApertura && formData.wantsAdditionalKey 
    ? `${formData.serviceType}-${formData.serviceNeeded}+llave`
    : `${formData.serviceType}-${formData.serviceNeeded}`
  
  const currentDescriptionPlaceholder =
    specificDescriptionPlaceholder[descriptionKey] ||
    (formData.serviceType
      ? descriptionPlaceholder[formData.serviceType as keyof typeof descriptionPlaceholder]
      : 'Ej. Perdí la llave de mi Jetta 2018...')

  // CP logic
  useEffect(() => {
    if (address.cp.length !== 5) return
    const fetchCP = async () => {
      setLoadingCp(true)
      try {
        const res = await fetch(`https://api.zippopotam.us/mx/${address.cp}`)
        if (!res.ok) throw new Error('CP no encontrado')
        const data = await res.json()
        const places = data.places || []
        setAddress(prev => ({
          ...prev,
          estado: places[0]?.state || '',
          alcaldia: prev.alcaldia,
          colonias: places.map((p: any) => p['place name']),
          colonia: places.length === 1 ? places[0]['place name'] : '',
        }))
      } catch {
        setAddress(prev => ({ ...prev, colonias: [], colonia: '' }))
      } finally {
        setLoadingCp(false)
      }
    }
    const timeoutId = setTimeout(() => fetchCP(), 300)
    return () => clearTimeout(timeoutId)
  }, [address.cp])

  // Limpieza de object URLs al salir
  useEffect(() => {
    return () => {
      photos.forEach(p => URL.revokeObjectURL(p.url))
    }
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (name === 'serviceType') {
      setFormData(prev => ({
        ...prev,
        serviceType: value,
        serviceNeeded: '',
        wantsAdditionalKey: false,
        keyType: '',
        vehicleBrand: '',
        vehicleModel: '',
        vehicleYear: '',
        hasKey: '',
        vehicleStatus: '',
        doorLocked: '',
        hasAvailableKey: '',
        lockDamaged: '',
        commercialType: '',
        description: '',
      }))
      return
    }

    if (name === 'serviceNeeded') {
      setFormData(prev => ({ 
        ...prev, 
        serviceNeeded: value,
        wantsAdditionalKey: false, // reset al cambiar servicio
        keyType: '',
        description: '' 
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
  }

  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) return file
    const objectUrl = URL.createObjectURL(file)
    try {
      const image = new Image()
      image.src = objectUrl
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error('No se pudo leer la imagen'))
      })
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height))
      const width = Math.max(1, Math.round(image.width * scale))
      const height = Math.max(1, Math.round(image.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return file
      ctx.drawImage(image, 0, 0, width, height)
      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/jpeg', 0.82)
      )
      if (!blob) return file
      const maxBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024
      if (blob.size <= maxBytes) {
        return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        })
      }
      const smallerBlob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/jpeg', 0.65)
      )
      if (!smallerBlob) return file
      return new File([smallerBlob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const availableSlots = MAX_PHOTOS - photos.length
    if (availableSlots <= 0) return
    const selectedFiles = files.filter(file => file.type.startsWith('image/')).slice(0, availableSlots)
    if (!selectedFiles.length) {
      e.target.value = ''
      return
    }
    setCompressingPhotos(true)
    try {
      const compressedFiles = await Promise.all(selectedFiles.map(compressImage))
      const newPhotos = compressedFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
      }))
      setPhotos(prev => [...prev, ...newPhotos])
    } catch (error) {
      console.error('Error al comprimir fotografías:', error)
      alert('No se pudieron procesar una o más fotografías.')
    } finally {
      setCompressingPhotos(false)
      e.target.value = ''
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const photo = prev[index]
      if (photo) URL.revokeObjectURL(photo.url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!formData.serviceType || !formData.serviceNeeded || !formData.description.trim()) {
        alert('Completa el tipo de cerrajería, el servicio y la descripción del problema.')
        return false
      }

      const needsAutomotiveKeyType =
        formData.serviceType === 'automotriz' &&
        (formData.serviceNeeded === 'llave' ||
          formData.serviceNeeded === 'programacion' ||
          (formData.serviceNeeded === 'apertura' && formData.wantsAdditionalKey))

      if (needsAutomotiveKeyType && !formData.keyType) {
        alert('Indica si la llave del vehículo es normal o de presencia.')
        return false
      }
      if (formData.serviceType === 'automotriz') {
        if (!formData.vehicleBrand || !formData.vehicleModel || !formData.vehicleYear) {
          alert('Completa marca, modelo y año del vehículo.')
          return false
        }
        // Si es apertura, NO pedimos vehicleStatus (redundante)
        if (formData.serviceNeeded === 'apertura') {
          if (!formData.hasKey) {
            alert('Indica dónde está la llave del vehículo.')
            return false
          }
        } else {
          // Para llave, perdida, etc sí pedimos ambos
          if (!formData.hasKey || !formData.vehicleStatus) {
            alert('Completa la información del vehículo.')
            return false
          }
        }
      }
      if (formData.serviceType === 'domestico' && formData.serviceNeeded === 'apertura') {
        // Solo pedimos lo no redundante
        if (!formData.doorLocked || !formData.lockDamaged) {
          alert('Completa la información de la puerta.')
          return false
        }
      }
      if (formData.serviceType === 'comercial' && !formData.commercialType) {
        alert('Indica qué tipo de establecimiento es.')
        return false
      }
    }
    if (step === 2) {
      if (!address.cp || !address.estado || !address.alcaldia || !address.colonia || !address.calleNumero || !address.referencias) {
        alert('Completa todos los datos de ubicación y referencias.')
        return false
      }
    }
    return true
  }

  const nextStep = () => {
    if (!validateCurrentStep()) return
    setStep(prev => Math.min(prev + 1, 3))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCurrentStep()) return
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      alert('Completa tu nombre, apellido y teléfono.')
      return
    }
    if (formData.urgency === 'programar' && !formData.scheduleDate) {
      alert('Selecciona la fecha y hora deseada.')
      return
    }
    if (!formData.legalConsent) {
      alert('Debes aceptar la confirmación legal para continuar.')
      return
    }

    // Payload inteligente para tu backend
    const finalPayload = {
      ...formData,
      ...address,
      serviceRequested: formData.wantsAdditionalKey 
        ? `${formData.serviceNeeded}+llave` // para tu lógica: apertura+llave
        : formData.serviceNeeded,
      // Si es apertura, asumimos cerrado para no confundir al cerrajero
      vehicleStatus: isApertura && formData.serviceType === 'automotriz' ? 'cerrado' : formData.vehicleStatus,
      photos: photos.map(photo => photo.file.name),
    }

    console.log('Solicitud completa:', finalPayload)
    alert('Solicitud lista para enviar. Revisa la consola.')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-6 left-6 z-10 hidden sm:block">
        {step === 1 ? (
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[#E53E3E] px-4 py-2 rounded-full hover:bg-[#E53E3E]/90 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        ) : (
          <button type="button" onClick={prevStep} className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gray-600 px-4 py-2 rounded-full hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Paso anterior
          </button>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center z-10 px-4 mt-10 sm:mt-0">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E53E3E] mb-4 shadow-lg shadow-[#E53E3E]/20">
          <KeyRound className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">Solicitar un Cerrajero</h2>
        <p className="mt-2 text-sm text-muted-foreground">Completa los detalles y te contactamos de inmediato.</p>
        <div className="flex justify-center items-center gap-2 mt-6">
          {[1, 2, 3].map(item => (
            <div key={item} className={`h-2 w-12 rounded-full transition-colors ${step >= item ? 'bg-[#E53E3E]' : 'bg-gray-300/40'}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Paso {step} de 3</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-card/60 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border sm:px-10 min-h-[430px]">
          <form className="space-y-6" onSubmit={step === 3 ? handleSubmit : e => { e.preventDefault(); nextStep() }}>

            {/* PASO 1 - AHORA INCLUYE FOTOS */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Wrench className="w-5 h-5 text-[#E53E3E]" /> ¿Qué necesitas?</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium mb-1">Tipo de cerrajería *</label>
                    <div className="relative">
                      <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <select name="serviceType" required value={formData.serviceType} onChange={handleChange} className="block w-full pl-10 pr-3 py-3 bg-background border border-border rounded-xl text-sm appearance-none focus:ring-2 focus:ring-[#E53E3E]/50 outline-none">
                        <option value="" disabled>Selecciona una opción...</option>
                        <option value="automotriz">Cerrajería Automotriz</option>
                        <option value="domestico">Cerrajería Doméstica</option>
                        <option value="comercial">Cerrajería Comercial</option>
                      </select>
                    </div>
                  </div>

                  {formData.serviceType && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-medium mb-1">Tipo de servicio *</label>
                      <select name="serviceNeeded" required value={formData.serviceNeeded} onChange={handleChange} className="block w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm appearance-none focus:ring-2 focus:ring-[#E53E3E]/50 outline-none">
                        <option value="" disabled>Selecciona qué necesitas...</option>
                        {currentServiceOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* CHECKBOX APERTURA + LLAVE - SOLO SI ES APERTURA */}
                  {isApertura && (
                    <div className="rounded-xl border border-[#E53E3E]/30 bg-[#E53E3E]/5 p-4 animate-in fade-in">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" name="wantsAdditionalKey" checked={formData.wantsAdditionalKey} onChange={handleChange} className="mt-1 w-4 h-4 rounded text-[#E53E3E] focus:ring-[#E53E3E]" />
                        <span className="text-sm">
                          <span className="font-bold flex items-center gap-2"><Key className="w-4 h-4" /> ¿También necesitas que te hagan una llave nueva en el mismo servicio?</span>
                          <span className="text-xs text-muted-foreground mt-1 block">Ideal si perdiste la llave o no tienes copia. El cerrajero lleva la máquina para hacerla en el momento.</span>
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Automotriz */}
                  {formData.serviceType === 'automotriz' && formData.serviceNeeded && (
                    <div className="pt-5 border-t border-border/60 animate-in fade-in slide-in-from-top-2 duration-200">
                      <h4 className="flex items-center gap-2 text-sm font-bold mb-4"><Car className="w-4 h-4 text-[#E53E3E]" /> Información del vehículo</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div><label className="block text-xs font-medium mb-1">Marca *</label><input name="vehicleBrand" required value={formData.vehicleBrand} onChange={handleChange} placeholder="Ej. Nissan" className="block w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#E53E3E]/50" /></div>
                        <div><label className="block text-xs font-medium mb-1">Modelo *</label><input name="vehicleModel" required value={formData.vehicleModel} onChange={handleChange} placeholder="Ej. Versa" className="block w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#E53E3E]/50" /></div>
                        <div><label className="block text-xs font-medium mb-1">Año *</label><input type="number" name="vehicleYear" required min="1950" max="2035" value={formData.vehicleYear} onChange={handleChange} placeholder="2018" className="block w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#E53E3E]/50" /></div>
                      </div>

                      {/* Tipo de llave: solo cuando realmente es relevante */}
                      {formData.serviceType === 'automotriz' &&
                        (formData.serviceNeeded === 'llave' ||
                          formData.serviceNeeded === 'programacion' ||
                          (isApertura && formData.wantsAdditionalKey)) && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                          <label className="block text-xs font-medium mb-2">¿Qué tipo de llave utiliza tu vehículo? *</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className={`cursor-pointer rounded-xl border p-3 transition-all ${formData.keyType === 'tradicional' ? 'border-[#E53E3E] bg-[#E53E3E]/10 ring-1 ring-[#E53E3E]/30' : 'border-border hover:border-[#E53E3E]/50'}`}>
                              <input
                                type="radio"
                                name="keyType"
                                value="tradicional"
                                checked={formData.keyType === 'tradicional'}
                                onChange={handleChange}
                                className="sr-only"
                              />
                              <span className="flex items-start gap-3">
                                <Key className="w-5 h-5 text-[#E53E3E] mt-0.5 flex-shrink-0" />
                                <span>
                                  <span className="block text-sm font-semibold">Llave normal</span>
                                  <span className="block text-[11px] text-muted-foreground mt-1">Se inserta en el switch y se gira para arrancar.</span>
                                </span>
                              </span>
                            </label>

                            <label className={`cursor-pointer rounded-xl border p-3 transition-all ${formData.keyType === 'presencia' ? 'border-[#E53E3E] bg-[#E53E3E]/10 ring-1 ring-[#E53E3E]/30' : 'border-border hover:border-[#E53E3E]/50'}`}>
                              <input
                                type="radio"
                                name="keyType"
                                value="presencia"
                                checked={formData.keyType === 'presencia'}
                                onChange={handleChange}
                                className="sr-only"
                              />
                              <span className="flex items-start gap-3">
                                <KeyRound className="w-5 h-5 text-[#E53E3E] mt-0.5 flex-shrink-0" />
                                <span>
                                  <span className="block text-sm font-semibold">Llave de presencia</span>
                                  <span className="block text-[11px] text-muted-foreground mt-1">El vehículo arranca presionando un botón (START/STOP).</span>
                                </span>
                              </span>
                            </label>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-xs font-medium mb-1">{isApertura ? '¿Dónde está la llave? *' : '¿Tienes alguna llave? *'}</label>
                          <select name="hasKey" required value={formData.hasKey} onChange={handleChange} className="block w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-[#E53E3E]/50">
                            <option value="">Selecciona...</option>
                            {isApertura ? (
                              <>
                                <option value="dentro">Dentro del vehículo</option>
                                <option value="no">La perdí / No tengo</option>
                                <option value="danada">Sí, pero está dañada</option>
                              </>
                            ) : (
                              <>
                                <option value="si">Sí</option>
                                <option value="no">No, perdí todas</option>
                                <option value="danada">Sí, pero está dañada</option>
                              </>
                            )}
                          </select>
                        </div>

                        {/* Ya NO preguntamos si está abierto si es apertura - redundante */}
                        {!isApertura && (
                          <div>
                            <label className="block text-xs font-medium mb-1">Estado del vehículo *</label>
                            <select name="vehicleStatus" required value={formData.vehicleStatus} onChange={handleChange} className="block w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-[#E53E3E]/50">
                              <option value="">Selecciona...</option>
                              <option value="abierto">Está abierto</option>
                              <option value="cerrado">Está cerrado</option>
                              <option value="no_aplica">No aplica</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {isApertura && formData.hasKey === 'no' && !formData.wantsAdditionalKey && (
                        <div className="mt-3 text-xs p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span>Si perdiste todas las llaves, marca la casilla de arriba para que el cerrajero lleve equipo para hacer llave nueva, si no solo podrá abrir.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Doméstico - solo apertura */}
                  {formData.serviceType === 'domestico' && formData.serviceNeeded === 'apertura' && (
                    <div className="pt-5 border-t border-border/60 animate-in fade-in slide-in-from-top-2 duration-200">
                      <h4 className="flex items-center gap-2 text-sm font-bold mb-4"><Home className="w-4 h-4 text-[#E53E3E]" /> Información de la puerta</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1">¿Está cerrada con llave? *</label>
                          <select name="doorLocked" required value={formData.doorLocked} onChange={handleChange} className="block w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-[#E53E3E]/50">
                            <option value="">Selecciona...</option>
                            <option value="si">Sí, con llave</option>
                            <option value="no">No, solo está cerrada</option>
                            <option value="no_se">No estoy seguro</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">¿La cerradura está dañada? *</label>
                          <select name="lockDamaged" required value={formData.lockDamaged} onChange={handleChange} className="block w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-[#E53E3E]/50">
                            <option value="">Selecciona...</option>
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                            <option value="no_se">No estoy seguro</option>
                          </select>
                        </div>
                      </div>
                      {/* Ya no preguntamos hasAvailableKey porque es redundante en apertura */}
                    </div>
                  )}

                  {/* Doméstico - otros servicios (llave, cambio, reparacion) */}
                  {formData.serviceType === 'domestico' && formData.serviceNeeded && formData.serviceNeeded !== 'apertura' && (
                    <div className="pt-5 border-t border-border/60 animate-in fade-in">
                      <h4 className="flex items-center gap-2 text-sm font-bold mb-4"><Home className="w-4 h-4 text-[#E53E3E]" /> Detalles</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1">¿Tienes llave disponible? *</label>
                          <select name="hasAvailableKey" required value={formData.hasAvailableKey} onChange={handleChange} className="block w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none">
                            <option value="">Selecciona...</option>
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">¿Cerradura dañada? *</label>
                          <select name="lockDamaged" required value={formData.lockDamaged} onChange={handleChange} className="block w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none">
                            <option value="">Selecciona...</option>
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comercial */}
                  {formData.serviceType === 'comercial' && formData.serviceNeeded && (
                    <div className="pt-5 border-t border-border/60 animate-in fade-in">
                      <h4 className="flex items-center gap-2 text-sm font-bold mb-4"><Building2 className="w-4 h-4 text-[#E53E3E]" /> Información del establecimiento</h4>
                      <label className="block text-xs font-medium mb-1">Tipo de establecimiento *</label>
                      <select name="commercialType" required value={formData.commercialType} onChange={handleChange} className="block w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none">
                        <option value="">Selecciona...</option>
                        <option value="local">Local / negocio</option>
                        <option value="oficina">Oficina</option>
                        <option value="bodega">Bodega</option>
                        <option value="otro">Otro</option>
                      </select>
                      {isApertura && (
                        <div className="mt-4">
                          <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-dashed p-3">
                            <input type="checkbox" name="wantsAdditionalKey" checked={formData.wantsAdditionalKey} onChange={handleChange} className="mt-1 w-4 h-4 rounded text-[#E53E3E]" />
                            <span className="text-xs"><b>¿También necesitas llaves nuevas?</b> Para personal, etc.</span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {formData.serviceNeeded && (
                    <div className="pt-5 border-t border-border/60">
                      <label className="block text-xs font-medium mb-1">Descripción del problema *</label>
                      <div className="relative">
                        <FileText className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                        <textarea name="description" required rows={3} value={formData.description} onChange={handleChange} placeholder={currentDescriptionPlaceholder} className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-[#E53E3E]/50" />
                      </div>
                    </div>
                  )}

                  {/* FOTOS AHORA EN PASO 1 */}
                  {formData.serviceNeeded && (
                    <div className="pt-5 border-t border-border/60">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="flex items-center gap-2 text-sm font-bold"><Camera className="w-4 h-4 text-[#E53E3E]" /> Fotos de la chapa / llave <span className="text-[10px] font-normal text-muted-foreground">(recomendado)</span></h4>
                        <span className="text-[11px] text-muted-foreground">{photos.length}/{MAX_PHOTOS}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">Sube aquí la foto de la chapa y de la llave si la tienes. Ayuda al cerrajero a cotizar y llevar la herramienta correcta.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {photos.map((photo, index) => (
                          <div key={photo.url} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-background">
                            <img src={photo.url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removePhoto(index)} className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {photos.length < MAX_PHOTOS && (
                          <label className={`aspect-square rounded-xl border border-dashed border-border bg-background/50 hover:bg-background cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors ${compressingPhotos ? 'pointer-events-none opacity-50' : ''}`}>
                            {compressingPhotos ? <Loader2 className="w-5 h-5 animate-spin text-[#E53E3E]" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                            <span className="text-xs font-medium text-center px-2">{compressingPhotos ? 'Procesando...' : 'Agregar foto'}</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} disabled={compressingPhotos} />
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PASO 2 - SOLO DIRECCION */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><MapPin className="w-5 h-5 text-[#E53E3E]" /> ¿Dónde necesitas al cerrajero?</h3>
                <p className="text-xs text-muted-foreground mb-5">La ubicación completa se utilizará para coordinar el servicio.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">CP *</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input name="cp" required value={address.cp} onChange={e => handleAddressChange({ target: { name: 'cp', value: e.target.value.replace(/\D/g, '') } } as any)} maxLength={5} placeholder="03810" className="block w-full pl-10 pr-7 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#E53E3E]/50" />
                      {loadingCp && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#E53E3E]" />}
                    </div>
                  </div>
                  <div><label className="block text-xs font-medium mb-1">Estado *</label><input name="estado" required value={address.estado} onChange={handleAddressChange} placeholder="CDMX / EdoMex" className="block w-full py-2.5 px-3 bg-background border border-border rounded-xl text-sm outline-none" /></div>
                  <div><label className="block text-xs font-medium mb-1">Alcaldía / Municipio *</label><input name="alcaldia" required value={address.alcaldia} onChange={handleAddressChange} placeholder="Ej. Iztapalapa" className="block w-full py-2.5 px-3 bg-background border border-border rounded-xl text-sm outline-none" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Colonia *</label>
                    {address.colonias.length > 0 ? (
                      <select name="colonia" required value={address.colonia} onChange={handleAddressChange} className="block w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm appearance-none outline-none">
                        <option value="">Elige colonia</option>{address.colonias.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (<input name="colonia" required value={address.colonia} onChange={handleAddressChange} placeholder="Nombre de tu colonia" className="block w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none" />)}
                  </div>
                  <div><label className="block text-xs font-medium mb-1">Calle y Número *</label><div className="relative"><Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input name="calleNumero" required value={address.calleNumero} onChange={handleAddressChange} placeholder="Av. Principal 45 Int 2" className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none" /></div></div>
                </div>
                <div className="mt-4"><label className="block text-xs font-medium mb-1">Referencias para llegar *</label><div className="relative"><Navigation className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" /><textarea name="referencias" required rows={2} value={address.referencias} onChange={handleAddressChange} placeholder="Ej. Portón negro, frente al OXXO..." className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm resize-none outline-none" /></div></div>
              </div>
            )}

            {/* PASO 3 */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><User className="w-5 h-5 text-[#E53E3E]" /> Tus datos y confirmación</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div><label className="block text-xs font-medium mb-1">Nombre *</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input name="firstName" required value={formData.firstName} onChange={handleChange} placeholder="Tu nombre" className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none" /></div></div>
                  <div><label className="block text-xs font-medium mb-1">Apellido *</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Tu apellido" className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none" /></div></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                  <div><label className="block text-xs font-medium mb-1">Correo (opcional)</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ejemplo@correo.com" className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none" /></div></div>
                  <div><label className="block text-xs font-medium mb-1">Teléfono *</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="55 1234 5678" className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none" /></div></div>
                </div>
                <div className="border-t border-border/60 pt-5 mt-5">
                  <label className="block text-xs font-medium mb-2">¿Cuándo necesitas el servicio? *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[{ value: 'ahora', label: 'Ahora', description: 'Lo antes posible' }, { value: 'hoy', label: 'Hoy', description: 'Durante el día' }, { value: 'programar', label: 'Programar', description: 'Otra fecha' }].map(option => (
                      <label key={option.value} className={`cursor-pointer rounded-xl border p-3 transition-all ${formData.urgency === option.value ? 'border-[#E53E3E] bg-[#E53E3E]/10' : 'border-border hover:border-[#E53E3E]/50'}`}>
                        <input type="radio" name="urgency" value={option.value} checked={formData.urgency === option.value} onChange={handleChange} className="sr-only" />
                        <span className="block text-sm font-semibold">{option.label}</span>
                        <span className="block text-[11px] text-muted-foreground mt-1">{option.description}</span>
                      </label>
                    ))}
                  </div>
                  {formData.urgency === 'programar' && (
                    <div className="mt-4 animate-in fade-in">
                      <label className="block text-xs font-medium mb-1"><Calendar className="w-3 h-3 inline mr-1" /> Fecha y hora deseada *</label>
                      <input type="datetime-local" name="scheduleDate" required value={formData.scheduleDate} onChange={handleChange} className="block w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm" />
                    </div>
                  )}
                </div>
                <div className="bg-[#E53E3E]/5 border border-[#E53E3E]/20 p-4 rounded-xl mt-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="legalConsent" required checked={formData.legalConsent} onChange={handleChange} className="mt-1 w-4 h-4 text-[#E53E3E] rounded border-gray-300 focus:ring-[#E53E3E]" />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground block mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-[#E53E3E]" /> Confirmación requerida</strong>
                      Declaro que soy el propietario legítimo o tengo autorización. <strong>Me comprometo a mostrar INE al técnico.</strong>
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="pt-2">
              {step < 3 ? (
                <button type="submit" className="w-full h-12 rounded-xl bg-[#E53E3E] hover:bg-[#E53E3E]/90 text-white font-bold text-sm shadow-lg active:scale-[0.99] transition-transform">Siguiente paso</button>
              ) : (
                <button type="submit" disabled={!formData.legalConsent} className="w-full h-12 rounded-xl bg-[#E53E3E] hover:bg-[#E53E3E]/90 text-white font-bold text-sm shadow-lg active:scale-[0.99] transition-transform disabled:opacity-50">Confirmar y Solicitar Servicio</button>
              )}
            </div>
          </form>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground pb-8">
          <ShieldCheck className="w-4 h-4 text-[#E53E3E]" />
          <span>Tus datos están protegidos</span>
        </div>
      </div>
    </div>
  )
}
