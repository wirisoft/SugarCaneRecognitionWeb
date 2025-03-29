export interface UserEntity {
    id?: number;
    email: string;
    password?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    phoneNumber?: string;
    roles?: string[];
  }
  