import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    username?: string;
    isAdmin?: boolean;
    isSuspended?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      username: string;
      isAdmin: boolean;
      isSuspended: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    isAdmin?: boolean;
    isSuspended?: boolean;
  }
}
