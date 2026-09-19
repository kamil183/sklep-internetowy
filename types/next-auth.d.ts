import { AdminRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: AdminRole;
    };
  }
  interface User {
    id: string;
    role: AdminRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: AdminRole;
  }
}
