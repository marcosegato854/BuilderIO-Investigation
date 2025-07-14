export const isSupportedVersion = (
  backendVersion: string,
  expectedVersion: string
): boolean => {
  const cleanVersion = backendVersion?.split('-')[0]
  const [major, minor, patch, build] = cleanVersion.split('.')
  const [expectedMajor, expectedMinor, expectedPatch, expectedBuild] =
    expectedVersion.split('.')
  // in the case of a major higher
  if (Number(major) > Number(expectedMajor)) return true
  if (major === expectedMajor) {
    // in the case of same major + minor higher
    if (Number(minor) > Number(expectedMinor)) return true
    if (minor === expectedMinor) {
      // in the case of a same minor + patch higher
      if (Number(patch) > Number(expectedPatch)) return true
    }
  }
  // last case build check
  return (
    major === expectedMajor &&
    minor === expectedMinor &&
    patch === expectedPatch &&
    Number(build) >= Number(expectedBuild)
  )
}
