module.exports = {
  displayName: 'field',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/field',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
}
