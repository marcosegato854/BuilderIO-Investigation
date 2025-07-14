/**
 * TYPES
 */
export type Id = string

export type User = {
  id: Id
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Token = string
export type AutorizationBearer = string

export type LoginResponse = {
  authorization: AutorizationBearer
}

// export type SignUpPayload = {
//   email: string
//   password: string
// }

export type LoginPayload = {
  username: string
  password: string
  rememberMe?: boolean
}

export type UserType = 'standard' | 'service'

export type UserInfo = {
  usertype: UserType
  username?: string
}

export type UserInfoResponse = UserInfo & {}

// export type ActivateAccountPayload = {
//   userId: Id
//   activationToken: string
// }

// export type ForgottenPasswordPayload = {
//   email: string
// }

// export type ResetPasswordPayload = {
//   email: string
//   password: string
//   passwordResetToken: string
// }
