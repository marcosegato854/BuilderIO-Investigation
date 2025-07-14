import { rootPath } from 'config'

export const Routes = {
  LOGIN: rootPath,
  PROJECTS: `${rootPath}projects`,
  JOBS: `${rootPath}projects/:diskName/:projectName/jobs`,
  ACQUISITION: `${rootPath}acquisition/:diskName/:projectName/:jobName`,
  QRCODELOGIN: `${rootPath}qrcodelogin/:username/:password`,
  PLANNING: `${rootPath}planning/:diskName/:projectName/:jobName`,
}
