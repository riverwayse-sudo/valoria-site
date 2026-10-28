// Not executed — fixture for the block-scope static check. `result` is declared
// with const inside the try and read after the block closed, which is a
// ReferenceError on the success path.
export async function save() {
  try {
    const result = await fetch('x')
    if (!result.ok) return 'error'
  } catch (err) {
    return 'network'
  }
  return result.json()
}
