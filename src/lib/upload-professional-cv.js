const MAX_CV_BYTES = 10 * 1024 * 1024

const CV_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

/**
 * Upload a private CV and register it in the canonical professional document
 * ledger. A new object path is used for each upload so replacing a CV never
 * overwrites an already-submitted evidence object or its review history.
 */
export async function uploadProfessionalCv(supabase, professionalId, file) {
  if (!supabase || !professionalId || !file) throw new Error('Choose a CV file before uploading.')

  const extension = String(file.name || '').split('.').pop().toLowerCase()
  const mimeType = CV_TYPES[extension]
  if (!mimeType) throw new Error('Upload a PDF or Word document (.pdf, .doc or .docx).')
  if (!Number.isFinite(file.size) || file.size <= 0 || file.size > MAX_CV_BYTES) {
    throw new Error('Your CV must be larger than 0 bytes and no more than 10MB.')
  }

  const uniqueId = globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const storagePath = `profiles/${professionalId}/cv/${uniqueId}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('cvs')
    .upload(storagePath, file, { contentType: mimeType, upsert: false })
  if (uploadError) throw uploadError

  const { data: document, error: documentError } = await supabase
    .from('professional_documents')
    .insert({
      professional_id: professionalId,
      document_type: 'cv',
      storage_bucket: 'cvs',
      storage_path: storagePath,
      original_filename: file.name,
      mime_type: mimeType,
      size_bytes: file.size,
      visibility: 'private',
      verification_status: 'pending',
    })
    .select('id, verification_status, created_at')
    .single()

  if (documentError) {
    // Avoid orphaning a private object if its canonical evidence row cannot
    // be registered. Preserve the original database error for the UI.
    await supabase.storage.from('cvs').remove([storagePath]).catch(() => {})
    throw documentError
  }

  return { storagePath, document }
}
