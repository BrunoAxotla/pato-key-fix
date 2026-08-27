import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const BUCKET = 'service-photos'
const MAX_PHOTOS = 4
const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1 MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Lo sacamos del try para que esté disponible en toda la función
  const { id: serviceRequestId } = await params;
  const uploadedPaths: string[] = [];

  try {
    // 2. Aquí ya NO volvemos a declarar params
    const { data: serviceRequest, error: requestError } = await supabaseAdmin
      .from('service_requests')
      .select('id')
      .eq('id', serviceRequestId)
      .single();

    // ... el resto de tu código se queda exactamente igual ...

    if (requestError || !serviceRequest) {
      return NextResponse.json(
        { error: 'La solicitud no existe.' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const files = formData
      .getAll('photos')
      .filter((value): value is File => value instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ success: true, uploaded: 0 }, { status: 200 })
    }

    if (files.length > MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Puedes subir un máximo de ${MAX_PHOTOS} fotografías.` },
        { status: 400 }
      )
    }

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: 'Solo se permiten imágenes JPG, PNG o WEBP.' },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'Cada fotografía debe pesar como máximo 1 MB.' },
          { status: 400 }
        )
      }
    }

    for (const [index, file] of files.entries()) {
      const extension = file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
          ? 'webp'
          : 'jpg'

      const path = `${serviceRequestId}/${index + 1}-${crypto.randomUUID()}.${extension}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        throw new Error(`No se pudo subir la fotografía ${index + 1}: ${uploadError.message}`)
      }

      uploadedPaths.push(path)

      const { error: dbError } = await supabaseAdmin
        .from('service_photos')
        .insert({
          service_request_id: serviceRequestId,
          storage_path: path,
        })

      if (dbError) {
        throw new Error(`No se pudo registrar la fotografía ${index + 1}: ${dbError.message}`)
      }
    }

    return NextResponse.json(
      {
        success: true,
        uploaded: uploadedPaths.length,
        paths: uploadedPaths,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al subir fotografías:', error)

    if (uploadedPaths.length > 0) {
      const { error: storageCleanupError } = await supabaseAdmin.storage
        .from(BUCKET)
        .remove(uploadedPaths)

      if (storageCleanupError) {
        console.error('Error al limpiar archivos subidos:', storageCleanupError)
      }

      const { error: dbCleanupError } = await supabaseAdmin
        .from('service_photos')
        .delete()
        .eq('service_request_id', serviceRequestId)
        .in('storage_path', uploadedPaths)

      if (dbCleanupError) {
        console.error('Error al limpiar registros de fotografías:', dbCleanupError)
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : 'No se pudieron guardar las fotografías.',
      },
      { status: 500 }
    )
  }
}
