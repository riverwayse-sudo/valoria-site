const AVATAR_EXTENSIONS = Object.freeze({
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
})

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024

export function getAvatarExtension(file) {
  const extension = file && AVATAR_EXTENSIONS[file.type]
  if (!extension) {
    throw new Error('Choose a JPEG, PNG or WebP image.')
  }
  if (!Number.isFinite(file.size) || file.size <= 0 || file.size > AVATAR_MAX_BYTES) {
    throw new Error('Profile images must be 5 MB or smaller.')
  }
  return extension
}
