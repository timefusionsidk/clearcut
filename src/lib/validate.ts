import { ACCEPTED_TYPES, MAX_BYTES } from './defaults'
import type { AppError } from './types'

export function validateFile(file: File): AppError | null {
  if (!ACCEPTED_TYPES.includes(file.type.toLowerCase())) {
    return { code: 'bad_type', message: 'Please upload a JPG, PNG, or WEBP image.' }
  }
  if (file.size > MAX_BYTES) {
    return { code: 'too_large', message: 'This image is larger than 10 MB.' }
  }
  if (file.size < 128) {
    return { code: 'bad_request', message: 'That file looks empty. Try another image.' }
  }
  return null
}
