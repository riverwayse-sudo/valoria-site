// Not executed — fixture proving the check tolerates safe constructs.
export async function save(res) {
  let result
  try {
    result = await fetch('x')
  } catch (err) {
    return { error: err.message, res }
  }
  const config = { limit: 1 }
  for (const row of result.rows) {
    const limit = row.limit
    if (limit > config.limit) return limit
  }
  const shared = 1
  function inner() {
    const shared = 2
    return shared
  }
  return inner() + shared
}
